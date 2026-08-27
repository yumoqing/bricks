var bricks = window.bricks || {};
/*
 * scene3d.js — bricks3d 核心 widget：Scene3D
 *
 * 三层职责：
 *   1. 渲染：用 three.js 把后端下发的场景描述符（实体/变换/颜色/相机）渲染出来
 *   2. 输入上报：点击实体 → dispatch('entity_tapped', {entity_id, entity_name}) → 走 binds 回传后端
 *   3. 本地逻辑（独立世界）：描述符若带 properties/events，则用 bricks.ScriptEngine.SceneRuntime
 *      在浏览器里本地跑脚本引擎，每帧 step() 推进，把 transform/visible 状态回填 three.js
 *
 * 架构（独立世界 / 共享世界）：
 *   - 独立世界：数据全下前端，本地跑引擎（本文件第 3 层职责）
 *   - 共享世界：后端权威世界副本，前端只渲染 + 上报输入，后端推送状态更新（本文件第 1/2 层职责）
 *
 * options（全部 get_ 前缀，避开 opts_set_style 的 option→实例拷贝冲突）：
 *   scene          : 内联场景描述符对象
 *   scene_url      : 后端数据端点（优先于 scene），返回场景描述符
 *   get_bgcolor    : 背景色（默认 0x141420）
 *   get_grid       : 是否显示地面网格（默认 true）
 *   get_run_local  : 是否本地跑脚本引擎（独立世界=true；共享世界/纯渲染=false，默认 false）
 *   get_three_url  : three.js 的 URL（默认 /bricks/3parties/three.min.js，按需注入用）
 *
 * 场景描述符格式（渲染子集 + 逻辑子集统一）：
 * {
 *   "camera": {"position": [x,y,z], "fov": 50},
 *   "entities": [
 *     {"id": "door", "name": "门", "type": "box",
 *      "transform": {"pos": [x,y,z], "rot": [deg,deg,deg], "scale": [x,y,z]},
 *      "appearance": {"color": "#3b82f6"},
 *      "properties": {"hasVisitor": {"type":"boolean","value":true}},   // 逻辑子集（可选）
 *      "events": [ ... ]                                                 // 逻辑子集（可选）
 *     }
 *   ],
 *   "events": [ ... ]   // 场景级事件（可选）
 * }
 *
 * dispatch 的事件：
 *   entity_tapped  {entity_id, entity_name}
 *   scene_ready    {entity_count}
 *   scene_error    {message}
 *
 * three.js 依赖：/bricks/3parties/three.min.js（r149 UMD 全局版），构造时按需注入。
 * 活动对象（scene/camera/renderer/mesh）只存实例私有字段，绝不进 opts/描述符
 * （防 JSON.stringify 循环引用 —— bricks 已知坑）。
 */

// 全局 three.js 加载 Promise（多实例共享，避免重复注入 script）
bricks._s3_three_promise = bricks._s3_three_promise || null;

bricks.Scene3D = class extends bricks.VBox {
	constructor(opts) {
		opts.width = opts.width || '100%';
		opts.height = opts.height || '100%';
		super(opts);
		this.dom_element.style.display = 'flex';
		this.dom_element.style.flexDirection = 'column';
		this.dom_element.style.overflow = 'hidden';
		this.dom_element.style.touchAction = 'none';   // 移动端手势：禁用浏览器默认缩放/滚动
		// three.js 活动对象 —— 私有字段，不进 opts
		this._s3_scene = null;
		this._s3_camera = null;
		this._s3_renderer = null;
		this._s3_meshes = {};      // entity_id → THREE.Mesh
		this._s3_raf = 0;
		this._s3_raycaster = null;
		this._s3_pointer = null;
		this._s3_ready = false;
		// 引擎（独立世界本地逻辑）
		this._s3_runtime = null;   // SceneRuntime 实例
		this._s3_last_t = 0;       // 上一帧时间戳（step 用）
		this._s3_paused = false;
		// 相机控制状态
		this._s3_ctrl = { rotX: 0, rotY: 0, dist: 12, targetX: 0, targetY: 1, targetZ: 0, lastPX: 0, lastPY: 0, pinchDist: 0, mode: 'rotate' };
		this._s3_cam_pos = [8, 6, 10];   // 当前相机位置（环绕球坐标计算）
		schedule_once(this.s3_build.bind(this), 0.1);
	}

	// ── three.js 按需注入 ──
	s3_load_three() {
		if (typeof THREE !== 'undefined') return Promise.resolve(THREE);
		if (bricks._s3_three_promise) return bricks._s3_three_promise;
		var url = this.opts.get_three_url || '/bricks/3parties/three.min.js';
		bricks._s3_three_promise = new Promise(function (resolve, reject) {
			var s = document.createElement('script');
			s.src = url;
			s.onload = function () { if (typeof THREE !== 'undefined') resolve(THREE); else reject(new Error('THREE 未定义')); };
			s.onerror = function () { bricks._s3_three_promise = null; reject(new Error('three.js 加载失败: ' + url)); };
			document.head.appendChild(s);
		});
		return bricks._s3_three_promise;
	}

	async s3_build() {
		try { await this.s3_load_three(); }
		catch (e) { this.s3_show_error(e.message); this.dispatch('scene_error', { message: String(e) }); return; }

		var desc = null;
		if (this.opts.scene_url) {
			try {
				var jc = new bricks.HttpJson();
				desc = await jc.get(this.opts.scene_url);
			} catch (e) {
				this.s3_show_error('场景数据加载失败: ' + this.opts.scene_url);
				this.dispatch('scene_error', { message: String(e) });
				return;
			}
		} else {
			desc = this.opts.scene || null;
		}
		if (!desc) {
			this.s3_show_error('未提供场景（需要 scene 或 scene_url）');
			return;
		}
		try {
			this.s3_init_gl(desc);
			this.s3_build_entities(desc.entities || []);
			this.s3_bind_input(desc);
			this.s3_start_runtime(desc);
			this.s3_loop();
			this._s3_ready = true;
			this.dispatch('scene_ready', { entity_count: (desc.entities || []).length });
		} catch (e) {
			console.error('Scene3D build error', e);
			this.s3_show_error('场景构建失败: ' + e.message);
			this.dispatch('scene_error', { message: String(e) });
		}
	}

	s3_init_gl(desc) {
		var el = this.dom_element;
		var w = el.clientWidth || 640;
		var h = el.clientHeight || 400;
		var bg = this.opts.get_bgcolor || 0x141420;

		var scene = new THREE.Scene();
		scene.background = new THREE.Color(bg);

		var cam = desc.camera || {};
		var camera = new THREE.PerspectiveCamera(cam.fov || 50, w / h, 0.1, 1000);
		this._s3_camera = camera;   // 先赋值，s3_apply_camera 依赖它
		var p = cam.position || [8, 6, 10];
		this._s3_cam_pos = p.slice();
		// 初始化环绕球参数（由初始相机位置反推）
		var dx = p[0], dy = p[1] - 1, dz = p[2];   // 目标点默认 [0,1,0]
		var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
		this._s3_ctrl.dist = dist || 12;
		this._s3_ctrl.rotY = Math.atan2(dx, dz);            // 方位角（绕 Y）
		this._s3_ctrl.rotX = Math.asin(Math.max(-1, Math.min(1, dy / (dist || 1))));  // 俯仰角
		this.s3_apply_camera();

		var renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(w, h);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		el.appendChild(renderer.domElement);
		renderer.domElement.style.display = 'block';

		// 光照
		var amb = new THREE.AmbientLight(0xffffff, 0.55);
		var dir = new THREE.DirectionalLight(0xffffff, 0.9);
		dir.position.set(5, 10, 7);
		scene.add(amb);
		scene.add(dir);

		// 地面网格（编辑态辅助）
		if (this.opts.get_grid !== false) {
			var grid = new THREE.GridHelper(20, 20, 0x444466, 0x2a2a40);
			scene.add(grid);
		}

		this._s3_scene = scene;
		this._s3_camera = camera;
		this._s3_renderer = renderer;
		this._s3_raycaster = new THREE.Raycaster();
		this._s3_pointer = new THREE.Vector2();

		this.bind('resize', this.s3_on_resize.bind(this));
	}

	// ── 环绕相机：单指旋转 / 双指缩放 / 双指平移 ──
	s3_apply_camera() {
		var c = this._s3_ctrl;
		var cy = Math.cos(c.rotX), sy = Math.sin(c.rotX);
		var cx = Math.cos(c.rotY), sx = Math.sin(c.rotY);
		var x = c.targetX + c.dist * cy * sx;
		var y = c.targetY + c.dist * sy;
		var z = c.targetZ + c.dist * cy * cx;
		this._s3_camera.position.set(x, y, z);
		this._s3_camera.lookAt(c.targetX, c.targetY, c.targetZ);
		this._s3_cam_pos = [x, y, z];
	}

	s3_bind_input(desc) {
		var self = this;
		var cv = this._s3_renderer.domElement;
		this._s3_pointers = {};      // pointerId → {x, y}
		var downX = 0, downY = 0;    // 单指按下位置（点击判定用）
		var downCount = 0;

		cv.addEventListener('pointerdown', function (ev) {
			cv.setPointerCapture && cv.setPointerCapture(ev.pointerId);
			self._s3_pointers[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
			var n = Object.keys(self._s3_pointers).length;
			if (n === 1) {
				downX = ev.clientX; downY = ev.clientY; downCount = 1;
				self._s3_ctrl.pinchDist = 0;
				self._s3_ctrl.pinchMid = null;
			} else if (n === 2) {
				// 进入双指：记录初始距离与中点
				var ids = Object.keys(self._s3_pointers);
				var p1 = self._s3_pointers[ids[0]], p2 = self._s3_pointers[ids[1]];
				self._s3_ctrl.pinchDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
				self._s3_ctrl.pinchMid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
			}
		});

		cv.addEventListener('pointermove', function (ev) {
			if (!(ev.pointerId in self._s3_pointers)) return;
			self._s3_pointers[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
			var ids = Object.keys(self._s3_pointers);
			if (ids.length === 2) {
				var p1 = self._s3_pointers[ids[0]], p2 = self._s3_pointers[ids[1]];
				var d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
				if (self._s3_ctrl.pinchDist > 0) {
					var ratio = self._s3_ctrl.pinchDist / d;
					self._s3_ctrl.dist = Math.max(1.5, Math.min(80, self._s3_ctrl.dist * ratio));
				}
				self._s3_ctrl.pinchDist = d;
				var mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
				if (self._s3_ctrl.pinchMid) {
					self._s3_pan(mx - self._s3_ctrl.pinchMid.x, my - self._s3_ctrl.pinchMid.y);
				}
				self._s3_ctrl.pinchMid = { x: mx, y: my };
			} else if (ids.length === 1) {
				var dx = ev.clientX - self._s3_ctrl.lastPX;
				var dy = ev.clientY - self._s3_ctrl.lastPY;
				self._s3_ctrl.rotY -= dx * 0.005;
				self._s3_ctrl.rotX += dy * 0.005;
				self._s3_ctrl.rotX = Math.max(-1.4, Math.min(1.4, self._s3_ctrl.rotX));
				self.s3_apply_camera();
			}
			self._s3_ctrl.lastPX = ev.clientX;
			self._s3_ctrl.lastPY = ev.clientY;
		});

		cv.addEventListener('pointerup', function (ev) {
			delete self._s3_pointers[ev.pointerId];
			self._s3_ctrl.lastPX = ev.clientX;
			self._s3_ctrl.lastPY = ev.clientY;
			self._s3_ctrl.pinchDist = 0;
			self._s3_ctrl.pinchMid = null;
			downCount = 0;
		});
		cv.addEventListener('pointercancel', function (ev) {
			delete self._s3_pointers[ev.pointerId];
			self._s3_ctrl.pinchDist = 0;
			self._s3_ctrl.pinchMid = null;
		});

		// 点击拾取（与拖拽区分：位移小于阈值才算点击）
		cv.addEventListener('click', function (ev) {
			if (Math.abs(ev.clientX - downX) > 6 || Math.abs(ev.clientY - downY) > 6) return;  // 拖拽不算点击
			if (!self._s3_ready) return;
			var rect = cv.getBoundingClientRect();
			self._s3_pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
			self._s3_pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
			self._s3_raycaster.setFromCamera(self._s3_pointer, self._s3_camera);
			var hits = self._s3_raycaster.intersectObjects(Object.values(self._s3_meshes), false);
			if (hits.length > 0) {
				var ud = hits[0].object.userData;
				if (self._s3_runtime) self._s3_runtime.tap(ud.entity_id);   // 独立世界：注入引擎
				self.dispatch('entity_tapped', { entity_id: ud.entity_id, entity_name: ud.entity_name });
			}
		});
	}

	s3_pan(dxpx, dypx) {
		var c = this._s3_ctrl;
		var scale = c.dist * 0.0012;   // 平移速度随距离
		var sy = Math.sin(c.rotX), cy = Math.cos(c.rotX);
		var sx = Math.sin(c.rotY), cx = Math.cos(c.rotY);
		// 相机右向量（水平，绕 Y）
		var rx = cx, rz = -sx;
		// 相机上向量（简化）
		var upx = -sy * sx, upy = cy, upz = -sy * cx;
		c.targetX += (-rx * dxpx - upx * dypx) * scale;
		c.targetY += (-upy * dypx) * scale;
		c.targetZ += (-rz * dxpx - upz * dypx) * scale;
		this.s3_apply_camera();
	}

	s3_build_entities(list) {
		for (var i = 0; i < list.length; i++) {
			var e = list[i];
			var mesh = this.s3_make_mesh(e);
			if (!mesh) continue;
			mesh.userData.entity_id = e.id;
			mesh.userData.entity_name = e.name || e.id;
			this._s3_scene.add(mesh);
			this._s3_meshes[e.id] = mesh;
		}
	}

	s3_make_mesh(e) {
		var t = e.transform || {};
		var pos = t.pos || [0, 0, 0];
		var rot = t.rot || [0, 0, 0];
		var scl = t.scale || [1, 1, 1];
		var color = (e.appearance && e.appearance.color) || '#8899aa';

		var geo = null;
		switch (e.type) {
			case 'box':
				geo = new THREE.BoxGeometry(1, 1, 1);
				break;
			case 'sphere':
				geo = new THREE.SphereGeometry(0.5, 24, 16);
				break;
			case 'cylinder':
				geo = new THREE.CylinderGeometry(0.5, 0.5, 1, 24);
				break;
			case 'model':   // glTF 占位：初版用盒子代替，GLTFLoader 为后续
				geo = new THREE.BoxGeometry(1, 1, 1);
				break;
			default:
				console.warn('Scene3D: 未知实体类型', e.type, e.id);
				return null;
		}
		var mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color) });
		var mesh = new THREE.Mesh(geo, mat);
		mesh.position.set(pos[0], pos[1], pos[2]);
		mesh.rotation.set(
			THREE.MathUtils.degToRad(rot[0]),
			THREE.MathUtils.degToRad(rot[1]),
			THREE.MathUtils.degToRad(rot[2])
		);
		mesh.scale.set(scl[0], scl[1], scl[2]);
		return mesh;
	}

	// ── 本地逻辑引擎（独立世界）──
	s3_start_runtime(desc) {
		if (!this.opts.get_run_local) return;
		if (!bricks.ScriptEngine || !bricks.ScriptEngine.SceneRuntime) {
			this.s3_show_error('脚本引擎未加载（bricks.ScriptEngine 缺失）');
			return;
		}
		var hasLogic = (desc.events && desc.events.length) ||
			(desc.entities || []).some(function (e) { return (e.events && e.events.length) || (e.properties && Object.keys(e.properties).length); });
		if (!hasLogic) return;   // 纯渲染，不启动引擎
		try {
			this._s3_runtime = new bricks.ScriptEngine.SceneRuntime(desc, { frameDT: 0.05, budget: 100000 });
			this._s3_last_t = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
		} catch (e) {
			console.error('Scene3D 引擎启动失败', e);
			this.dispatch('scene_error', { message: '引擎启动失败: ' + e.message });
		}
	}

	s3_sync_from_runtime() {
		if (!this._s3_runtime) return;
		var ents = this._s3_runtime.entities;
		for (var id in this._s3_meshes) {
			var mesh = this._s3_meshes[id];
			var re = ents[id];
			if (!re) continue;
			var tr = re.transform;
			mesh.position.set(tr.pos[0], tr.pos[1], tr.pos[2]);
			mesh.rotation.set(
				THREE.MathUtils.degToRad(tr.rot[0]),
				THREE.MathUtils.degToRad(tr.rot[1]),
				THREE.MathUtils.degToRad(tr.rot[2])
			);
			mesh.scale.set(tr.scale[0], tr.scale[1], tr.scale[2]);
			mesh.visible = re.visible;
		}
	}

	s3_loop() {
		var self = this;
		function tick() {
			self._s3_raf = requestAnimationFrame(tick);
			if (self._s3_runtime && !self._s3_paused) {
				var now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
				var dt = (now - self._s3_last_t) / 1000;
				self._s3_last_t = now;
				if (dt > 0 && dt < 0.5) self._s3_runtime.step(dt);
				self.s3_sync_from_runtime();
			}
			if (self._s3_renderer && self._s3_scene && self._s3_camera) {
				self._s3_renderer.render(self._s3_scene, self._s3_camera);
			}
		}
		tick();
	}

	s3_on_resize() {
		var el = this.dom_element;
		var w = el.clientWidth, h = el.clientHeight;
		if (!this._s3_renderer || w < 10 || h < 10) return;
		this._s3_camera.aspect = w / h;
		this._s3_camera.updateProjectionMatrix();
		this._s3_renderer.setSize(w, h);
	}

	// 公共 API：设置实体颜色（后端状态更新或前端联动均可调用）
	set_entity_color(entity_id, color) {
		var m = this._s3_meshes[entity_id];
		if (m && m.material) m.material.color.set(color);
	}

	// 公共 API：设置实体显隐
	set_entity_visible(entity_id, visible) {
		var m = this._s3_meshes[entity_id];
		if (m) m.visible = !!visible;
	}

	// 公共 API：设置实体变换（共享世界后端推送状态用）
	set_entity_transform(entity_id, transform) {
		var m = this._s3_meshes[entity_id];
		if (!m || !transform) return;
		var pos = transform.pos, rot = transform.rot, scl = transform.scale;
		if (pos) m.position.set(pos[0], pos[1], pos[2]);
		if (rot) m.rotation.set(THREE.MathUtils.degToRad(rot[0]), THREE.MathUtils.degToRad(rot[1]), THREE.MathUtils.degToRad(rot[2]));
		if (scl) m.scale.set(scl[0], scl[1], scl[2]);
	}

	// 公共 API：暂停/继续本地引擎
	set_paused(paused) { this._s3_paused = !!paused; }

	// 公共 API：重置本地引擎（重新加载描述符逻辑）
	reset_runtime(desc) {
		if (this._s3_runtime && desc) {
			this._s3_runtime = new bricks.ScriptEngine.SceneRuntime(desc, { frameDT: 0.05, budget: 100000 });
			this._s3_last_t = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
		}
	}

	s3_show_error(msg) {
		var t = new bricks.Text({ text: '⚠ ' + msg, color: '#f87171', padding: '12px' });
		this.add_widget(t);
	}

	// 释放 WebGL 资源（clear_widgets 只移 DOM，不释放 GL 上下文）
	s3_dispose() {
		if (this._s3_raf) cancelAnimationFrame(this._s3_raf);
		this._s3_raf = 0;
		var ids = Object.keys(this._s3_meshes);
		for (var i = 0; i < ids.length; i++) {
			var m = this._s3_meshes[ids[i]];
			if (m.geometry) m.geometry.dispose();
			if (m.material) m.material.dispose();
		}
		this._s3_meshes = {};
		this._s3_runtime = null;
		if (this._s3_renderer) {
			this._s3_renderer.dispose();
			if (this._s3_renderer.domElement && this._s3_renderer.domElement.parentNode) {
				this._s3_renderer.domElement.parentNode.removeChild(this._s3_renderer.domElement);
			}
			this._s3_renderer = null;
		}
		this._s3_scene = null;
		this._s3_camera = null;
		this._s3_ready = false;
	}
};
bricks.Factory.register('Scene3D', bricks.Scene3D);
