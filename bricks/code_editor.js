var bricks = window.bricks || {};
/*
 * code_editor.js — CodeEditor widget
 *
 * 代码/脚本编辑控件：用 CodeMirror 5（UMD 全局版）包装，支持行号、语法高亮。
 * 供游戏工作台等"编程界面"使用，替代裸 textarea。
 *
 * options：
 *   value        : 初始内容
 *   mode         : CodeMirror mode（默认 python；支持 python/javascript/json）
 *   theme        : 内置暗色主题（默认 true=暗）
 *   readonly     : 只读（默认 false）
 *   cm_url       : codemirror.js URL（默认 /bricks/3parties/codemirror.js）
 *   cm_css_url   : codemirror.css URL（默认 /bricks/3parties/codemirror.css）
 *   cm_mode_url  : mode js URL 前缀（默认 /bricks/3parties/codemirror-{mode}.js）
 *
 * dispatch 事件：
 *   change    {value}
 *
 * API：
 *   get_value() / set_value(text) / focus()
 *
 * 依赖懒加载：多实例共享全局 Promise（同 Scene3D 的 three.js 模式），
 * CodeMirror 实例对象只存 _cm_ 私有字段，绝不进 opts（防循环引用）。
 */

bricks._ce_load_promise = bricks._ce_load_promise || null;
bricks._ce_css_loaded = bricks._ce_css_loaded || false;

bricks.CodeEditor = class extends bricks.VBox {
	constructor(opts) {
		opts.width = opts.width || '100%';
		opts.height = opts.height || '100%';
		super(opts);
		this.dom_element.style.display = 'flex';
		this.dom_element.style.flexDirection = 'column';
		this._cm_ = null;
		this._ce_ready = false;
		schedule_once(this.build_editor.bind(this), 0.1);
	}

	get_cm_url() { return this.opts.cm_url || '/bricks/3parties/codemirror.js'; }
	get_cm_css_url() { return this.opts.cm_css_url || '/bricks/3parties/codemirror.css'; }
	get_mode() { return this.opts.mode || 'python'; }

	ensure_deps() {
		var self = this;
		if (window.CodeMirror) return Promise.resolve();
		if (!bricks._ce_css_loaded) {
			var l = document.createElement('link');
			l.rel = 'stylesheet';
			l.href = this.get_cm_css_url();
			document.head.appendChild(l);
			bricks._ce_css_loaded = true;
		}
		if (!bricks._ce_load_promise) {
			bricks._ce_load_promise = new Promise(function (resolve) {
				var s = document.createElement('script');
				s.src = self.get_cm_url();
				s.onload = function () { resolve(); };
				s.onerror = function () { console.error('CodeEditor: codemirror.js load failed'); resolve(); };
				document.head.appendChild(s);
			});
		}
		return bricks._ce_load_promise;
	}

	ensure_mode(mode) {
		// mode 已注册则跳过；未注册则尝试加载 /bricks/3parties/codemirror-<mode>.js
		if (!window.CodeMirror || CodeMirror.modes[mode]) return Promise.resolve();
		var url = this.opts.cm_mode_url
			? this.opts.cm_mode_url.replace('{mode}', mode)
			: '/bricks/3parties/codemirror-' + mode + '.js';
		return new Promise(function (resolve) {
			var s = document.createElement('script');
			s.src = url;
			s.onload = resolve;
			s.onerror = function () { console.warn('CodeEditor: mode js missing: ' + url); resolve(); };
			document.head.appendChild(s);
		});
	}

	async build_editor() {
		var self = this;
		await this.ensure_deps();
		if (!window.CodeMirror) return;
		await this.ensure_mode(this.get_mode());
		var holder = document.createElement('div');
		holder.style.flex = '1';
		holder.style.overflow = 'hidden';
		this.dom_element.appendChild(holder);
		this._cm_ = CodeMirror(holder, {
			value: this.opts.value || '',
			mode: CodeMirror.modes[this.get_mode()] ? this.get_mode() : null,
			lineNumbers: true,
			readOnly: this.opts.readonly === true,
			theme: this.opts.theme === false ? 'default' : 'yuanjing-dark',
			viewportMargin: Infinity,
			tabSize: 4,
			indentUnit: 4
		});
		this._cm_.on('change', function () {
			self.dispatch('change', {value: self._cm_.getValue()});
		});
		this._cm_.setSize('100%', '100%');
		this._ce_ready = true;
		this.dispatch('ready', {});
		this.bind('resize', function () { if (self._cm_) self._cm_.refresh(); });
	}

	get_value() { return this._cm_ ? this._cm_.getValue() : (this.opts.value || ''); }

	set_value(text) {
		if (this._cm_) { this._cm_.setValue(text || ''); }
		else { this.opts.value = text; }
	}

	focus() { if (this._cm_) this._cm_.focus(); }
};

bricks.Factory.register('CodeEditor', bricks.CodeEditor);

// 注入暗色主题（一次性，避免外部 theme 文件依赖）
(function () {
	if (document.getElementById('ce-yuanjing-dark-css')) return;
	var css = document.createElement('style');
	css.id = 'ce-yuanjing-dark-css';
	css.textContent =
		'.cm-s-yuanjing-dark.CodeMirror{background:#1a1d26;color:#d1d5db;height:100%}' +
		'.cm-s-yuanjing-dark .CodeMirror-gutters{background:#14161d;border-right:1px solid #2a2e3a}' +
		'.cm-s-yuanjing-dark .CodeMirror-linenumber{color:#4b5563}' +
		'.cm-s-yuanjing-dark .CodeMirror-cursor{border-left:1px solid #93c5fd}' +
		'.cm-s-yuanjing-dark .CodeMirror-selected{background:#2b3a55}' +
		'.cm-s-yuanjing-dark .cm-keyword{color:#c084fc}' +
		'.cm-s-yuanjing-dark .cm-string{color:#86efac}' +
		'.cm-s-yuanjing-dark .cm-number{color:#fbbf24}' +
		'.cm-s-yuanjing-dark .cm-comment{color:#6b7280;font-style:italic}' +
		'.cm-s-yuanjing-dark .cm-def{color:#60a5fa}' +
		'.cm-s-yuanjing-dark .cm-builtin{color:#38bdf8}' +
		'.cm-s-yuanjing-dark .cm-operator{color:#f472b6}';
	document.head.appendChild(css);
})();
