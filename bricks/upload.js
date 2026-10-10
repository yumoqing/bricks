var bricks = window.bricks || {};
/*
 bricks.upload.js —— 通用「上传状态」弹窗 + 带百分比的真实上传通道
 ==========================================================================
 背景：bricks 体系里所有文件上传都是「某个模块自己 fetch/XHR 发 FormData，
 或把文件 base64 塞进表单/JSON」。此前没有任何统一的进度与失败提示：
 文件一大界面就像卡住，服务端 413/500 的原文也随请求一起被吞掉，
 用户只能看到「没反应」或「保存失败」。

 本文件在框架层统一接管（模块零改动即生效）：
   1) 带文件的上传请求改用 XHR 发送 → 拿到 xhr.upload.onprogress 的真实
      百分比；响应仍以 fetch 语义返回（status/ok/headers/json/text/body），
      含流式 body 的增量转发，SSE / chunked 不退化。
   2) 右下角浮层「上传状态」：每个上传一条，显示文件名、大小、百分比、
      速度、剩余时间；批量多文件逐个显示各自进度；失败时显示 HTTP 状态码
      与服务端返回的错误原文；成功后自动消失。

 覆盖的上传形态（都不需要改模块代码）：
   - FormData + File/Blob（拖拽 UiFile → Form submit / 脚本 fetch / 会话附件）
   - 裸 Blob/File 作为 body（xhr.send(file)）
   - base64 文件载荷（FileReader.readAsDataURL → URLSearchParams/JSON body）
   - 模块自己直接用的 XMLHttpRequest.send(...)

 总开关：window.BRICKS_UPLOAD_STATUS = false 时完全回退到原始 fetch/XHR。
*/
(function () {
	'use strict';
	if (!bricks || bricks.UploadStatus) return;

	var B64_MIN_BYTES = 32 * 1024; // base64 载荷小于此值不弹窗（避免把小表单误当上传）
	var RENDER_INTERVAL = 120;     // 进度重绘节流（ms）
	var AUTOHIDE_DELAY = 2600;     // 成功后自动消失（ms）

	// ── 小工具 ──────────────────────────────────────────────
	function human_bytes(n) {
		n = Number(n) || 0;
		if (n < 1024) return n + ' B';
		if (n < 1024 * 1024) return (n / 1024).toFixed(n < 10240 ? 1 : 0) + ' KB';
		if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(n < 10 * 1024 * 1024 ? 2 : 1) + ' MB';
		return (n / 1024 / 1024 / 1024).toFixed(2) + ' GB';
	}
	function human_secs(s) {
		s = Math.round(Number(s));
		if (!isFinite(s) || s < 0) return '';
		if (s < 60) return s + 's';
		var m = Math.floor(s / 60);
		if (m < 60) return m + 'm' + (s % 60) + 's';
		return Math.floor(m / 60) + 'h' + (m % 60) + 'm';
	}
	function safe_text(s) {
		return String(s === undefined || s === null ? '' : s).replace(/[^\x20-\x7E]/g, '').trim();
	}
	function clip(txt, n) {
		txt = String(txt || '').replace(/\s+/g, ' ').trim();
		if (txt.length > n) txt = txt.slice(0, n) + '…';
		return txt;
	}
	function err_text(status, status_text, body, url) {
		var head = 'HTTP ' + status + (status_text ? ' ' + safe_text(status_text) : '');
		var detail = '';
		var js = null;
		if (body) { try { js = JSON.parse(body); } catch (e) { js = null; } }
		if (js && typeof js === 'object') {
			var cand = js.error || js.err || js.message || js.msg || js.detail || js.reason;
			if (typeof cand === 'string' && cand.trim()) detail = cand.trim();
			else if (cand && typeof cand === 'object') detail = JSON.stringify(cand);
		}
		if (!detail) detail = clip(String(body || '').replace(/<[^>]*>/g, ' '), 240);
		var out = detail ? (head + '：' + detail) : head;
		if (url) out += '\n' + url;
		return out;
	}
	function abort_error() {
		try { return new DOMException('The user aborted a request.', 'AbortError'); }
		catch (e) { var er = new Error('aborted'); er.name = 'AbortError'; return er; }
	}
	function body_text(body) {
		try {
			if (typeof body === 'string') return body;
			if (body && typeof body.toString === 'function') return String(body);
		} catch (e) { }
		return '';
	}

	// ── 识别「这次请求是不是文件上传」 ───────────────────────
	// 返回 {files:[{name,size}], total, kind} 或 null（null = 不接管，原样放行）
	bricks.upload_probe = function (body) {
		if (!body) return null;
		try {
			var files = [], total = 0, i;
			if (typeof FormData !== 'undefined' && body instanceof FormData) {
				body.forEach(function (v, k) {
					if (typeof File !== 'undefined' && v instanceof File) {
						files.push({ name: v.name || k || 'file', size: Number(v.size) || 0 });
					} else if (typeof Blob !== 'undefined' && v instanceof Blob) {
						files.push({ name: (v.name || k || 'blob'), size: Number(v.size) || 0 });
					}
				});
				if (!files.length) return null;
				for (i = 0; i < files.length; i++) total += files[i].size;
				return { files: files, total: total, kind: 'formdata' };
			}
			if (typeof Blob !== 'undefined' && body instanceof Blob) {
				var bn = (body.name || 'blob');
				return { files: [{ name: bn, size: Number(body.size) || 0 }],
					total: Number(body.size) || 0, kind: 'blob' };
			}
			var s = null;
			if (typeof body === 'string') s = body;
			else if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) s = body.toString();
			if (s === null) return null;
			// base64 文件载荷（readAsDataURL 模式）：data:...;base64,xxxx
			// 注意 URLSearchParams 会把 ; 和 , 编码成 %3B/%2C，两种形态都要认
			var has_data = (s.indexOf('data:') >= 0) || (s.indexOf('data%3A') >= 0);
			var has_b64 = (s.indexOf(';base64,') >= 0) || (s.indexOf(';base64%2C') >= 0)
				|| (s.indexOf('%3Bbase64,') >= 0) || (s.indexOf('%3Bbase64%2C') >= 0)
				|| (s.indexOf('base64%2C') >= 0);
			if (!has_data || !has_b64) return null;
			if (s.length < B64_MIN_BYTES) return null;
			var names = [];
			function collect(arr) {
				if (!arr) return;
				for (var i2 = 0; i2 < arr.length && names.length < 12; i2++) {
					var nm2 = arr[i2];
					if (nm2) names.push(nm2);
				}
			}
			// 形式一：明文 JSON body —— "name": "xx"
			collect((s.match(/"name"\s*:\s*"([^"]{1,160})"/g) || []).map(function (x) {
				return x.replace(/^"name"\s*:\s*"/, '').replace(/"$/, '');
			}));
			// 形式二：urlencoded（URLSearchParams）—— %22name%22%3A%22xx%22
			collect((s.match(/%22name%22%3A%22([^%]{1,160})%22/g) || []).map(function (x) {
				return x.replace(/^%22name%22%3A%22/, '').replace(/%22$/, '');
			}));
			// 形式三：file_name=xx / filename=xx
			collect((s.match(/file_?name=([^&]{1,160})/g) || []).map(function (x) {
				var v = x.replace(/^file_?name=/, '');
				try { return decodeURIComponent(v.replace(/\+/g, ' ')); } catch (e) { return v; }
			}));
			var fs = [];
			if (names.length) {
				for (i = 0; i < names.length; i++) fs.push({ name: names[i], size: 0 });
			} else {
				fs.push({ name: '', size: 0 });
			}
			return { files: fs, total: s.length, kind: 'base64', encoded: true };
		} catch (e) { }
		return null;
	};

	// ── 上传任务（浮层里的一条） ─────────────────────────────
	bricks.UploadJob = class {
		constructor(center, meta, url, method) {
			this.center = center;
			this.id = ++center._seq;
			this.url = url || '';
			this.method = (method || 'POST').toUpperCase();
			this.kind = (meta && meta.kind) || 'formdata';
			this.encoded = !!(meta && meta.encoded);
			this.files = ((meta && meta.files) || []).map(function (f) {
				return { name: f.name || '', size: Number(f.size) || 0 };
			});
			if (!this.files.length) this.files = [{ name: '', size: 0 }];
			this.total = Number(meta && meta.total) || 0;
			if (!this.total) {
				for (var i = 0; i < this.files.length; i++) this.total += this.files[i].size;
			}
			this.loaded = 0;
			this.pct = 0;
			this.speed = 0;
			this.status = 'uploading';
			this.error = '';
			this.started = Date.now();
			this.last_t = this.started;
			this.last_loaded = 0;
			this.el = null;
			this.slices = [];
			if (this.files.length > 1) {
				var acc = 0;
				for (var j = 0; j < this.files.length; j++) {
					this.slices.push({ name: this.files[j].name || ('file ' + (j + 1)),
						size: this.files[j].size, start: acc, el: null });
					acc += this.files[j].size;
				}
			}
		}
		_t(k, o) {
			try {
				if (bricks.app && bricks.app.i18n && typeof bricks.app.i18n._ === 'function') {
					var s = bricks.app.i18n._(k, o);
					if (s) return s;
				}
			} catch (e) { }
			return k;
		}
		label() {
			if (this.files.length > 1) return this._t('${n} files', { n: this.files.length });
			var nm = this.files[0] && this.files[0].name;
			if (nm) return nm;
			return this.kind === 'base64' ? this._t('File data') : this._t('File');
		}
		size_label() {
			if (this.total > 0) return human_bytes(this.total);
			return '';
		}
		on_progress(loaded, total) {
			if (this.status !== 'uploading') return;
			loaded = Number(loaded) || 0;
			if (Number(total) > 0) this.total = Number(total);
			this.loaded = Math.max(this.loaded, loaded);
			var now = Date.now();
			if (now - this.last_t >= 300) {
				var dt = (now - this.last_t) / 1000;
				var dl = this.loaded - this.last_loaded;
				if (dt > 0 && dl > 0) this.speed = dl / dt;
				this.last_t = now;
				this.last_loaded = this.loaded;
			}
			this.pct = this.total > 0
				? Math.max(0, Math.min(100, Math.floor(this.loaded * 100 / this.total))) : 0;
			this.paint_throttled();
		}
		done() {
			if (this.status !== 'uploading') return;
			this.status = 'done';
			this.pct = 100;
			if (this.total > 0) this.loaded = this.total;
			this.paint();
			this.center.schedule_hide(this);
		}
		fail(msg) {
			if (this.status === 'error') return;
			this.status = 'error';
			this.error = msg || this._t('Upload failed');
			this.paint();
			this.center.render();
		}
		canceled() {
			if (this.status !== 'uploading') return;
			this.status = 'canceled';
			this.error = this._t('Upload canceled');
			this.paint();
			this.center.render();
		}
		// 网络层被掐断、改用原生 fetch 重发时的提示（meta 行显示）
		retry_hint() {
			this.retry_note = this._t('Network retry');
			this.paint();
		}
		remove() {
			this.center.remove_job(this);
		}
		paint_throttled() {
			var self = this;
			if (this._pt) return;
			this._pt = setTimeout(function () { self._pt = null; self.paint(); }, RENDER_INTERVAL);
		}
		build_el() {
			var doc = document;
			var self = this;
			var el = doc.createElement('div');
			el.className = 'bricks-up-item ' + this.status;
			var head = doc.createElement('div');
			head.className = 'bricks-up-line';
			var nm = doc.createElement('span');
			nm.className = 'bricks-up-name';
			var pct = doc.createElement('span');
			pct.className = 'bricks-up-pct';
			head.appendChild(nm); head.appendChild(pct);
			var bar = doc.createElement('div');
			bar.className = 'bricks-up-bar';
			var fill = doc.createElement('div');
			fill.className = 'bricks-up-fill';
			bar.appendChild(fill);
			var meta = doc.createElement('div');
			meta.className = 'bricks-up-meta';
			var err = doc.createElement('div');
			err.className = 'bricks-up-err';
			var close = doc.createElement('span');
			close.className = 'bricks-up-x';
			close.textContent = '×';
			close.title = this._t('Destroy this window');
			close.onclick = function () { self.remove(); };
			el.appendChild(close);
			el.appendChild(head); el.appendChild(bar); el.appendChild(meta); el.appendChild(err);
			this.el = el;
			this._name_el = nm; this._pct_el = pct;
			this._fill_el = fill; this._meta_el = meta; this._err_el = err;
			this._slices_box = null;
			if (this.slices.length) {
				var box = doc.createElement('div');
				box.className = 'bricks-up-slices';
				for (var i = 0; i < this.slices.length; i++) {
					var sl = this.slices[i];
					var row = doc.createElement('div');
					row.className = 'bricks-up-slice';
					var sname = doc.createElement('span');
					sname.className = 'bricks-up-sname';
					sname.textContent = sl.name;
					sname.title = sl.name;
					var spct = doc.createElement('span');
					spct.className = 'bricks-up-spct';
					row.appendChild(sname); row.appendChild(spct);
					box.appendChild(row);
					sl.el = spct;
				}
				el.appendChild(box);
				this._slices_box = box;
			}
			return el;
		}
		paint() {
			if (!this.el) return;
			var t = this._t;
			this.el.className = 'bricks-up-item ' + this.status;
			var pct_txt = (this.status === 'uploading' && this.total <= 0) ? t('Uploading') : (this.pct + '%');
			this._pct_el.textContent = pct_txt;
			this._name_el.textContent = this.label();
			this._name_el.title = this.label() + (this.size_label() ? '  ' + this.size_label() : '');
			this._fill_el.style.width = (this.status === 'done' ? 100 : this.pct) + '%';
			var m = [];
			if (this.status === 'uploading') {
				if (this.total > 0) {
					m.push(human_bytes(this.loaded) + ' / ' + human_bytes(this.total));
					if (this.speed > 0) {
						m.push(human_bytes(this.speed) + '/s');
						var left = (this.total - this.loaded) / this.speed;
						if (isFinite(left) && left > 0) m.push(t('Left') + ' ' + human_secs(left));
					}
				} else {
					m.push(t('uploading'));
				}
			} else if (this.status === 'done') {
				m.push(t('Upload complete') + (this.size_label() ? ' · ' + this.size_label() : ''));
			} else if (this.status === 'canceled') {
				m.push(t('Upload canceled'));
			} else {
				m.push(t('Upload failed'));
			}
			if (this.retry_note) m.push(this.retry_note);
			this._meta_el.textContent = m.join(' · ');
			if (this.status === 'error' || this.status === 'canceled') {
				this._err_el.style.display = 'block';
				this._err_el.textContent = this.error || '';
			} else {
				this._err_el.style.display = 'none';
				this._err_el.textContent = '';
			}
			if (this._slices_box) {
				var loaded = this.loaded;
				for (var i = 0; i < this.slices.length; i++) {
					var sl = this.slices[i];
					if (!sl.el) continue;
					var p;
					if (this.status === 'done') p = 100;
					else if (this.total > 0 && sl.size > 0) {
						p = Math.max(0, Math.min(100, Math.floor((loaded - sl.start) * 100 / sl.size)));
					} else p = this.pct;
					sl.el.textContent = p + '%';
				}
			}
		}
	};

	// ── 上传状态浮层 ────────────────────────────────────────
	bricks.UploadStatus = class {
		constructor(opts) {
			opts = opts || {};
			this.opts = opts;
			this.jobs = [];
			this._seq = 0;
			this.panel = null;
			this.body_el = null;
			this.collapsed = false;
			this.max_jobs = opts.max_jobs || 20;
			this.autohide_delay = opts.autohide_delay === undefined ? AUTOHIDE_DELAY : opts.autohide_delay;
		}
		_t(k, o) {
			try {
				if (bricks.app && bricks.app.i18n && typeof bricks.app.i18n._ === 'function') {
					var s = bricks.app.i18n._(k, o);
					if (s) return s;
				}
			} catch (e) { }
			return k;
		}
		ensure_panel() {
			if (this.panel && document.body && document.body.contains(this.panel)) return this.panel;
			if (!document.body) return null;
			var doc = document;
			var p = doc.createElement('div');
			p.className = 'bricks-up-panel';
			var head = doc.createElement('div');
			head.className = 'bricks-up-head';
			var title = doc.createElement('span');
			title.className = 'bricks-up-title';
			title.textContent = this._t('Upload status');
			var tools = doc.createElement('span');
			tools.className = 'bricks-up-tools';
			var clear = doc.createElement('span');
			clear.className = 'bricks-up-tool';
			clear.textContent = this._t('Clear finished');
			clear.onclick = this.clear_finished.bind(this);
			var minb = doc.createElement('span');
			minb.className = 'bricks-up-tool';
			minb.textContent = '–';
			minb.title = this._t('minimize this window');
			minb.onclick = this.toggle.bind(this);
			var xb = doc.createElement('span');
			xb.className = 'bricks-up-tool';
			xb.textContent = '×';
			xb.title = this._t('Destroy this window');
			xb.onclick = this.hide.bind(this);
			tools.appendChild(clear); tools.appendChild(minb); tools.appendChild(xb);
			head.appendChild(title); head.appendChild(tools);
			var body = doc.createElement('div');
			body.className = 'bricks-up-body';
			p.appendChild(head); p.appendChild(body);
			document.body.appendChild(p);
			this.panel = p;
			this.body_el = body;
			this.title_el = title;
			this.paint_panel_state();
			return p;
		}
		paint_panel_state() {
			if (!this.panel) return;
			var active = 0;
			for (var i = 0; i < this.jobs.length; i++) {
				if (this.jobs[i].status === 'uploading') active++;
			}
			this.panel.classList.toggle('collapsed', !!this.collapsed);
			var n = this.jobs.length;
			this.title_el.textContent = n > 1
				? (this._t('Upload status') + ' (' + n + ')') : this._t('Upload status');
			if (active > 0) this.panel.classList.add('busy');
			else this.panel.classList.remove('busy');
		}
		toggle() {
			this.collapsed = !this.collapsed;
			this.paint_panel_state();
		}
		hide() {
			if (this.panel && this.panel.parentNode) {
				this.panel.parentNode.removeChild(this.panel);
			}
			this.panel = null;
			this.body_el = null;
		}
		show() {
			this.ensure_panel();
			this.render();
		}
		new_job(meta, url, method) {
			if (window.BRICKS_UPLOAD_STATUS === false) return null;
			var job = new bricks.UploadJob(this, meta, url, method);
			this.jobs.push(job);
			// 保护：浮层里最多留 max_jobs 条，先清掉最老的已结束任务
			while (this.jobs.length > this.max_jobs) {
				var idx = -1;
				for (var i = 0; i < this.jobs.length; i++) {
					if (this.jobs[i] !== job && this.jobs[i].status !== 'uploading') { idx = i; break; }
				}
				if (idx < 0) break;
				this.remove_job(this.jobs[idx]);
			}
			this.render();
			return job;
		}
		remove_job(job) {
			var i = this.jobs.indexOf(job);
			if (i >= 0) this.jobs.splice(i, 1);
			if (job.el && job.el.parentNode) job.el.parentNode.removeChild(job.el);
			job.el = null;
			if (!this.jobs.length) this.hide();
			else this.paint_panel_state();
		}
		schedule_hide(job) {
			if (!this.autohide_delay) return;
			var self = this;
			setTimeout(function () {
				if (job.status === 'done') self.remove_job(job);
			}, this.autohide_delay);
		}
		clear_finished() {
			var keep = [];
			for (var i = 0; i < this.jobs.length; i++) {
				var j = this.jobs[i];
				if (j.status === 'uploading') keep.push(j);
				else if (j.el && j.el.parentNode) j.el.parentNode.removeChild(j.el);
			}
			this.jobs = keep;
			if (!this.jobs.length) this.hide();
			else this.render();
		}
		render() {
			if (!this.jobs.length) { this.hide(); return; }
			if (!this.ensure_panel()) return;
			for (var i = 0; i < this.jobs.length; i++) {
				var j = this.jobs[i];
				if (!j.el) {
					var el = j.build_el();
					this.body_el.appendChild(el);
					j.paint();
				} else if (j.el.parentNode !== this.body_el) {
					this.body_el.appendChild(j.el);
				}
			}
			this.paint_panel_state();
		}
	};

	bricks.upload_status = new bricks.UploadStatus({});
	bricks.upload_status_get = function () { return bricks.upload_status; };

	// ── 接管 fetch：带文件的上传走 XHR（可拿进度），响应保持 fetch 语义 ──
	bricks.upload_fetch = function (url, init, meta) {
		init = init || {};
		return new Promise(function (resolve, reject) {
			var method = String(init.method || 'GET').toUpperCase();
			var job = bricks.upload_status ? bricks.upload_status.new_job(meta, url, method) : null;
			var xhr = new XMLHttpRequest();
			var settled = false, pushed = 0, sctrl = null, closed = false;
			var retried = false;
			var encoder = (typeof TextEncoder !== 'undefined') ? new TextEncoder() : null;

			function make_stream() {
				if (typeof ReadableStream === 'undefined' || !encoder) return null;
				try {
					return new ReadableStream({ start: function (c) { sctrl = c; } });
				} catch (e) { return null; }
			}
			function stream_error(err) {
				if (sctrl && !closed) {
					try { sctrl.error(err); } catch (e) { }
					closed = true;
				}
			}
			function push_delta(final) {
				if (!sctrl || closed) return;
				var t = '';
				try { t = xhr.responseText || ''; } catch (e) { t = ''; }
				try {
					if (t.length > pushed) {
						sctrl.enqueue(encoder.encode(t.slice(pushed)));
						pushed = t.length;
					}
					if (final) { closed = true; sctrl.close(); }
				} catch (e) { closed = true; }
			}
			function response_headers() {
				var h;
				try { h = new Headers(); } catch (e) { return null; }
				try {
					var raw = xhr.getAllResponseHeaders() || '';
					var lines = raw.split(/\r?\n/);
					for (var i = 0; i < lines.length; i++) {
						var ix = lines[i].indexOf(':');
						if (ix > 0) h.append(lines[i].slice(0, ix).trim(), lines[i].slice(ix + 1).trim());
					}
				} catch (e) { }
				return h;
			}
			function null_body_status(st) {
				return st === 101 || st === 204 || st === 205 || st === 304;
			}
			function resolve_response() {
				if (settled) return;
				var st = Number(xhr.status) || 0;
				if (st <= 0) return; // 交给 error 事件
				var body = (!stream || null_body_status(st)) ? null : stream;
				var resp = null;
				try {
					resp = new Response(body,
						{ status: st, statusText: safe_text(xhr.statusText), headers: response_headers() });
				} catch (e) {
					try { resp = new Response(body, { status: st }); } catch (e2) { resp = null; }
				}
				if (!resp) { return; }
				settled = true;
				resolve(resp);
			}
			function finish() {
				var st = Number(xhr.status) || 0;
				if (st >= 200 && st < 400) { if (job) job.done(); }
				else if (st > 0) {
					var body = '';
					try { body = xhr.responseText || ''; } catch (e) { body = ''; }
					if (job) job.fail(err_text(st, xhr.statusText, body, url));
				} else if (job) {
					job.fail(job._t('Network error'));
				}
			}
			// 网络层失败兜底：XHR 连响应头都没收到就被掐断（Chrome 报 net::ERR_FAILED，
			// 服务端访问日志里毫无痕迹——实测企业网络/安全软件会掐 XHR 发起的上传，
			// 而同一 body 走原生 fetch 能过）。此时用原始 fetch 重发一次：代价是该路
			// 没有百分比（浮层显示上传中→完成），但保证文件能传上去。
			// 只在「一个字节都没收到响应头」时兜底，避免服务端已处理却重复提交。
			function retry_with_fetch() {
				if (retried || aborted || settled) return false;
				var raws = bricks.upload_probe(init.body);
				if (!raws) return false;
				retried = true;
				if (job && job.status === 'uploading') job.retry_hint();
				try { console.warn('[bricks.upload] XHR 被网络层掐断，改用原生 fetch 重发:', url); } catch (e) { }
				var orig = bricks._orig_fetch || window.fetch;
				Promise.resolve()
					.then(function () {
						return orig.call(window, url, {
							method: method,
							headers: init.headers || undefined,
							body: init.body,
							credentials: init.credentials,
							signal: init.signal
						});
					})
					.then(function (resp) {
						if (resp && resp.status >= 200 && resp.status < 400) {
							if (job) job.done();
							settled = true;
							resolve(resp);
						} else {
							var st = (resp && resp.status) || 0;
							return resp.text().then(function (t) {
								if (job) job.fail(st > 0 ? err_text(st, resp.statusText, t, url)
									: job._t('Network error') + '\n' + url);
								settled = true;
								resolve(resp);
							});
						}
					})
					.catch(function (err) {
						if (job) job.fail(job._t('Network error') + '\n' + url);
						if (settled) stream_error(err);
						else { settled = true; reject(err); }
					});
				return true;
			}
			function fail_network() {
				if (retry_with_fetch()) return;
				var e = new TypeError('Failed to fetch');
				if (job) job.fail(job._t('Network error') + '\n' + url);
				if (settled) stream_error(e);
				else { settled = true; reject(e); }
			}

			try { xhr.open(method, url, true); } catch (e) {
				if (job) job.fail(String(e && e.message || e));
				reject(new TypeError('Failed to fetch'));
				return;
			}
			// 标记本 XHR 已被本函数接管：否则 XMLHttpRequest.send 的全局钩子
			// 会给同一个请求再建一条任务（表现为「拖一次文件出现两条状态」）。
			try { xhr.__bricks_upload_job = job; } catch (e) { }
			var stream = make_stream();
			// 请求头（FormData/URLSearchParams 的 Content-Type 交给浏览器，别覆盖 boundary/编码）
			var plain = {};
			var hdr_in = init.headers;
			if (hdr_in) {
				try {
					if (typeof Headers !== 'undefined' && hdr_in instanceof Headers) {
						hdr_in.forEach(function (v, k) { plain[k] = v; });
					} else if (Object.prototype.toString.call(hdr_in) === '[object Array]') {
						hdr_in.forEach(function (p) { if (p && p.length === 2) plain[p[0]] = p[1]; });
					} else {
						for (var k in hdr_in) {
							if (Object.prototype.hasOwnProperty.call(hdr_in, k)) plain[k] = hdr_in[k];
						}
					}
				} catch (e) { }
			}
			var is_form = false;
			try {
				if (typeof FormData !== 'undefined' && init.body instanceof FormData) is_form = true;
				if (typeof URLSearchParams !== 'undefined' && init.body instanceof URLSearchParams) is_form = true;
			} catch (e) { }
			for (var hk in plain) {
				if (is_form && hk.toLowerCase() === 'content-type') continue;
				try { xhr.setRequestHeader(hk, plain[hk]); } catch (e) { }
			}
			var cred = (init.credentials === undefined) ? 'same-origin' : init.credentials;
			if (cred && cred !== 'omit') { try { xhr.withCredentials = true; } catch (e) { } }

			var aborted = false;
			function on_abort() {
				if (aborted) return;
				aborted = true;
				try { xhr.abort(); } catch (e) { }
				if (job) job.canceled();
				if (settled) stream_error(abort_error());
				else { settled = true; reject(abort_error()); }
			}
			var sig = init.signal;
			if (sig) {
				if (sig.aborted) { on_abort(); return; }
				try { sig.addEventListener('abort', on_abort); } catch (e) { }
			}

			xhr.upload.addEventListener('progress', function (e) {
				if (job) job.on_progress(e.loaded, e.total);
			});
			xhr.upload.addEventListener('load', function () {
				if (job && job.total > 0) job.on_progress(job.total, job.total);
			});
			xhr.addEventListener('readystatechange', function () {
				if (xhr.readyState === 2) { resolve_response(); }
				else if (xhr.readyState === 3) { push_delta(false); }
				else if (xhr.readyState === 4) {
					if (aborted) { push_delta(true); return; }
					if (!settled) resolve_response();
					if (settled) push_delta(true);
					finish();
				}
			});
			xhr.addEventListener('error', fail_network);
			xhr.addEventListener('abort', on_abort);
			xhr.addEventListener('timeout', function () {
				if (job) job.fail(job._t('Upload timeout') + '\n' + url);
				if (settled) stream_error(new TypeError('network timeout'));
				else { settled = true; reject(new TypeError('network timeout')); }
			});

			try { xhr.send(init.body); } catch (e) {
				if (job) job.fail(String(e && e.message || e));
				if (settled) stream_error(e); else { settled = true; reject(e); }
			}
		});
	};

	// 全局 patch：fetch（仅带文件的上传改道，其余请求一行不动）
	if (window.fetch && !bricks._upload_fetch_patched) {
		bricks._upload_fetch_patched = true;
		bricks._orig_fetch = window.fetch;
		window.fetch = function (input, init) {
			try {
				if (window.BRICKS_UPLOAD_STATUS === false) return bricks._orig_fetch.apply(this, arguments);
				if (typeof input !== 'string') return bricks._orig_fetch.apply(this, arguments);
				if (!init || init.body === undefined || init.body === null) {
					return bricks._orig_fetch.apply(this, arguments);
				}
				if (!init.method || String(init.method).toUpperCase() === 'GET') {
					return bricks._orig_fetch.apply(this, arguments);
				}
				var meta = bricks.upload_probe(init.body);
				if (!meta) return bricks._orig_fetch.apply(this, arguments);
				return bricks.upload_fetch(input, init, meta);
			} catch (e) {
				return bricks._orig_fetch.apply(this, arguments);
			}
		};
	}

	// 全局 patch：模块自己 new XMLHttpRequest().send(...) 的上传也进浮层
	// （只加监听，不改变任何原有行为）
	if (window.XMLHttpRequest && !bricks._upload_xhr_patched) {
		bricks._upload_xhr_patched = true;
		var orig_open = XMLHttpRequest.prototype.open;
		var orig_send = XMLHttpRequest.prototype.send;
		XMLHttpRequest.prototype.open = function (m, u) {
			try {
				this.__bricks_upload_url = u;
				this.__bricks_upload_method = m;
			} catch (e) { }
			return orig_open.apply(this, arguments);
		};
		XMLHttpRequest.prototype.send = function (body) {
			try {
				if (window.BRICKS_UPLOAD_STATUS !== false && bricks.upload_status) {
					var meta = bricks.upload_probe(body);
					if (meta && !this.__bricks_upload_job) {
						var xhr = this;
						var job = bricks.upload_status.new_job(meta,
							this.__bricks_upload_url || '', this.__bricks_upload_method || 'POST');
						if (job) {
							this.__bricks_upload_job = job;
							try {
								xhr.upload.addEventListener('progress', function (e) {
									job.on_progress(e.loaded, e.total);
								});
								xhr.upload.addEventListener('load', function () {
									if (job.total > 0) job.on_progress(job.total, job.total);
								});
							} catch (e) { }
							xhr.addEventListener('load', function () {
								var st = Number(xhr.status) || 0;
								if (st >= 200 && st < 400) job.done();
								else if (st > 0) {
									var b = '';
									try { b = xhr.responseText || ''; } catch (e) { b = ''; }
									job.fail(err_text(st, xhr.statusText, b, xhr.__bricks_upload_url || ''));
								} else job.fail(job._t('Network error'));
							});
							xhr.addEventListener('error', function () {
								job.fail(job._t('Network error'));
							});
							xhr.addEventListener('abort', function () { job.canceled(); });
						}
					}
				}
			} catch (e) { }
			return orig_send.apply(this, arguments);
		};
	}
})();
