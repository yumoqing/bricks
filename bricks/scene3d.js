var bricks = window.bricks || {};
/*
 * scene3d.js — bricks3d 核心 widget：Scene3D
 *
 * 后端声明式驱动：后端用 JSON 描述符声明场景（实体/变换/颜色/相机），
 * Scene3D 用 three.js 本地渲染；点击实体 → dispatch('entity_tapped', {entity_id, entity_name})
 * → 走标准 binds 链（urlwidget/script）回调后端。
 *
 * options（全部 get_ 前缀，避开 opts_set_style 的 option→实例拷贝冲突）：
 *   scene          : 内联场景描述符对象
 *   scene_url      : 后端数据端点（优先于 scene），返回场景描述符
 *   get_bgcolor    : 背景色（默认 0x141420）
 *   get_grid       : 是否显示地面网格（默认 true）
 *
 * 场景描述符格式（与《脚本引擎设计规范》实体子集对齐）：
 * {
 *   "camera": {"position": [x,y,z], "fov": 50},
 *   "entities": [
 *     {"id": "door", "name": "门", "type": "box",
 *      "transform": {"pos": [x,y,z], "rot": [deg,deg,deg], "scale": [x,y,z]},
 *      "appearance": {"color": "#3b82f6"}},
 *     {"id": "ball", "type": "sphere", ...}
 *   ]
 * }
 *
 * dispatch 的事件：
 *   entity_tapped  {entity_id, entity_name}
 *   scene_ready    {entity_count}
 *   scene_error    {message}
 *
 * three.js 依赖：dist/3parties/three.min.js（r149 UMD 全局版）。
 * 活动对象（scene/camera/renderer/mesh）只存实例私有字段，绝不进 opts/描述符
 * （防 JSON.stringify 循环引用 —— bricks 已知坑）。
 */

bricks.Scene3D = class extends bricks.VBox {
	constructor(opts) {
		opts.width = opts.width || '100%';
		opts.height = opts.height || '100%';
		super(opts);
		this.dom_element.style.display = 'flex';
		this.dom_element.style.flexDirection = 'column';
		this.dom_element.style.overflow = 'hidden';
		// three.js 活动对象 —— 私有字段，不进 opts
		this._s3_scene = null;
		this._s3_camera = null;
		this._s3_renderer = null;
		this._s3_meshes = {};      // entity_id → THREE.Mesh
		this._s3_raf = 0;
		this._s3_raycaster = null;
		this._s3_pointer = null;
		this._s3_ready = false;
		schedule_once(this.s3_build.bind(this), 0.1);
	}

	async s3_build() {
		if (typeof THREE === 'undefined') {
			this.s3_show_error('three.js 未加载（需引入 /bricks/3parties/three.min.js）');
			this.dispatch('scene_error', {message: 'THREE undefined'});
			return;
		}
		var desc = null;
		if (this.opts.scene_url) {
			try {
				var jc = new bricks.HttpJson();
				desc = await jc.get(this.opts.scene_url);
			} catch (e) {
				this.s3_show_error('场景数据加载失败: ' + this.opts.scene_url);
				this.dispatch('scene_error', {message: String(e)});
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
			this.s3_bind_events();
			this.s3_loop();
			this._s3_ready = true;
			this.dispatch('scene_ready', {entity_count: (desc.entities || []).length});
		} catch (e) {
			console.error('Scene3D build error', e);
			this.s3_show_error('场景构建失败: ' + e.message);
			this.dispatch('scene_error', {message: String(e)});
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
		var p = cam.position || [8, 6, 10];
		camera.position.set(p[0], p[1], p[2]);
		camera.lookAt(0, 1, 0);

		var renderer = new THREE.WebGLRenderer({antialias: true});
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

		// 容器尺寸变化 → 跟随（bricks.resize_observer 会向本元素派发 resize 事件）
		this.bind('resize', this.s3_on_resize.bind(this));
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
			case 'model':   // glTF 占位：初版用盒子代替，GLTFLoader 为下一步
				geo = new THREE.BoxGeometry(1, 1, 1);
				break;
			default:
				console.warn('Scene3D: 未知实体类型', e.type, e.id);
				return null;
		}
		var mat = new THREE.MeshStandardMaterial({color: new THREE.Color(color)});
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

	s3_bind_events() {
		var self = this;
		var cv = this._s3_renderer.domElement;
		cv.style.cursor = 'pointer';
		cv.addEventListener('click', function(ev) {
			if (!self._s3_ready) return;
			var rect = cv.getBoundingClientRect();
			self._s3_pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
			self._s3_pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
			self._s3_raycaster.setFromCamera(self._s3_pointer, self._s3_camera);
			var hits = self._s3_raycaster.intersectObjects(Object.values(self._s3_meshes), false);
			if (hits.length > 0) {
				var ud = hits[0].object.userData;
				self.dispatch('entity_tapped', {entity_id: ud.entity_id, entity_name: ud.entity_name});
			}
		});
	}

	s3_loop() {
		var self = this;
		function tick() {
			self._s3_raf = requestAnimationFrame(tick);
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

	// 公共 API：设置实体颜色（后端描述符更新或前端联动均可调用）
	set_entity_color(entity_id, color) {
		var m = this._s3_meshes[entity_id];
		if (m && m.material) m.material.color.set(color);
	}

	// 公共 API：设置实体显隐
	set_entity_visible(entity_id, visible) {
		var m = this._s3_meshes[entity_id];
		if (m) m.visible = !!visible;
	}

	s3_show_error(msg) {
		var t = new bricks.Text({text: '⚠ ' + msg, color: '#f87171', padding: '12px'});
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
