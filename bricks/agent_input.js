// AgentInput — 集成模型选择的输入控件
// options: { model_dataurl, model_cwidth, placeholder, url(提交图标), ...VBox 原有属性 }
// event: inputed → { prompt, add_files, model_id }

bricks.AgentInput = class extends bricks.VBox {
    constructor(opts) {
        opts.height = 'auto';
        opts.width = '100%';
        // 默认内边距，避免子控件（输入框/模型选择器/按钮）贴边；可用 opts.padding 覆盖
        if (opts.padding === undefined) opts.padding = '8px 12px';
        // 宿主级 secret 默认（2026-09-18 统一化）：bricks.app.secret_defaults 由宿主
        // shell 启动时设一次（{secret_dataurl, secret_format, secret_title, secret_tip}），
        // 全站所有 AgentIO 自动获得钥匙图标——不再要求每个产线 .ui 逐个复制粘贴
        // （实测漏配：bidding/opportunity/platform 三入口无钥匙）。显式 opts 优先。
        var _sd = (bricks.app && bricks.app.secret_defaults)
            || (bricks.app && bricks.app.opts && bricks.app.opts.secret_defaults)
            || window.__SECRET_DEFAULTS || {};
        for (var _k in _sd) {
            if (opts[_k] === undefined) opts[_k] = _sd[_k];
        }
        super(opts);

        // file upload
        this.inputfilew = new bricks.UiFile({name: 'add_file'});
        this.filesbar = new bricks.DynamicColumn({col_cwidth: 10});
        this.add_files = [];
        this.file_names = [];
        this.inputfilew.bind('changed', this.file_added.bind(this));

        // text input — 回车直接发送；Ctrl+回车换行（enter_sends 为 UiText 的 opt-in 选项）
        this.textw = new bricks.UiText({
            name: 'prompt',
            placeholder: opts.placeholder || '',
            enter_sends: true
        });
        this.textw.bind('enter_send', this.input_finished.bind(this));

        // model selector — 直接用 UiCode，不用 Form
        // session_id 自动注入：模型下拉按会话解析当前项目（多 tab 各自项目），
        // 服务端据此返回「项目已设模型」作为选中项；组件层统一注入，各产线 UI 无需逐个配置。
        var _mp = bricks.extend({}, opts.model_params || {});
        if (!_mp.session_id && typeof window._sid === 'function') {
            _mp.session_id = window._sid();
        }
        this.model_selector = new bricks.UiCode({
            name: 'model_id',
            valueField: 'model_id',
            textField: 'model_id_text',
            dataurl: opts.model_dataurl || '',
            params: _mp,
            cwidth: opts.model_cwidth || 12,
            cfontsize: 0.85
        });

        // add file button
        var addfilew = new bricks.Svg({
            cwidth: 1.5, cheight: 1.5,
            url: bricks_resource('imgs/add.svg')
        });
        addfilew.bind('click', this.add_file.bind(this));

        // submit button
        var inputw = new bricks.Svg({
            cwidth: 3, cheight: 1.5,
            url: opts.url || bricks_resource('imgs/send.svg')
        });
        inputw.bind('click', this.input_finished.bind(this));

        // secret picker button (2026-09-17) — 仅在宿主提供 secret_dataurl 时渲染，
        // 未配置的宿主/应用完全看不到这个图标（bricks 通用性：不硬编码宿主路径）
        var secretw = null;
        if (opts.secret_dataurl) {
            secretw = new bricks.Svg({
                cwidth: 1.5, cheight: 1.5,
                url: opts.secret_url || bricks_resource('imgs/secret_key.svg'),
                // tip 由 widget.js 统一做 i18n._() 包装，这里传原始 key（勿预翻译，会二次包装）
                tip: opts.secret_tip || 'Insert secret'
            });
            secretw.bind('click', this.open_secret_picker.bind(this));
        }

        // button row: [+add] [model_selector] [🔑secret?] [filler] [submit]
        var hbox = new bricks.HBox({cheight: 2.2, gap: '4px', alignItems: 'center'});
        hbox.add_widget(addfilew);
        hbox.add_widget(this.model_selector);
        if (secretw) hbox.add_widget(secretw);
        hbox.add_widget(new bricks.VBox({css: 'filler'}));
        hbox.add_widget(inputw);

        // assemble
        this.add_widget(this.inputfilew);
        this.add_widget(this.filesbar);
        this.add_widget(this.textw);
        this.add_widget(hbox);

        this.filesbar.hide();
        this.inputfilew.hide();
    }

    input_finished() {
        var txt = this.textw.getValue();
        if (!txt.prompt || txt.prompt.length < 1) return;
        var p = this.params || {};
        var mv = this.model_selector.getValue();
        // UiCode 的 getValue 可能返回对象也可能返回字符串，统一提取
        var mid = '';
        if (typeof mv === 'object' && mv !== null) {
            mid = mv.model_id || mv.value || '';
        } else {
            mid = mv || '';
        }
        var d = Object.assign({}, p, {
            add_files: this.add_files,
            file_names: this.file_names,
            prompt: txt.prompt,
            model_id: mid
        });
        this.dispatch('inputed', d);
        this.textw.setValue('');
        this.add_files = [];
        this.file_names = [];
        this.filesbar.clear_widgets();
        this.filesbar.hide();
    }

    file_added(e) {
        this.inputfilew.hide();
        var file = this.inputfilew.getValue().add_file;
        this.inputfilew.reset();
        this.add_files.push(file);
        this.file_names.push(file.name);
        this.filesbar.clear_widgets();
        var w = new bricks.DeletableLabel({label: file.name});
        this.filesbar.add_widget(w);
        this.filesbar.show();
        w.bind('deleted', this.deleted_file.bind(this, file));
    }

    deleted_file(file) {
        this.add_files = this.add_files.filter(i => i !== file);
        this.file_names = this.file_names.filter(n => n !== file.name);
        if (this.add_files.length === 0) this.filesbar.hide();
    }

    add_file() {
        this.inputfilew.show();
    }

    // ══════════════════════════════════════════════════════════════
    // 敏感信息插入（2026-09-17）
    //
    // 通用性约束：bricks 是多应用共用框架，**不得硬编码任何宿主的路径或占位符格式**
    // （对齐 model_dataurl 的既有设计）。宿主通过 opts 注入：
    //   secret_dataurl   — 列表数据源（后端只返回元数据，绝不返回值本身）
    //   secret_params    — 附加查询参数（如 session_id/pipeline_id）
    //   secret_format    — 占位符格式，{name} 为替换位（如 '@@sec:{name}@@'）
    //   secret_title     — 弹窗标题
    // 未传 secret_dataurl 时钥匙图标根本不渲染 → 其他应用零影响。
    // ══════════════════════════════════════════════════════════════
    async open_secret_picker() {
        if (!this.opts.secret_dataurl) return;
        if (this._secret_win) {           // 防重复弹窗
            try { this._secret_win.open(); } catch (e) {}
            return;
        }
        var self = this;
        var win = new bricks.PopupWindow({
            title: this.opts.secret_title || bricks.app.i18n._('Secrets'),
            auto_open: true,
            width: '460px',
            height: '420px',
            archor: 'cc'
        });
        this._secret_win = win;

        var body = new bricks.VBox({width: '100%', height: '100%', gap: '4px'});
        win.content_w.add_widget(body);

        var tip = new bricks.Text({
            text: bricks.app.i18n._(
                'Click an item to insert a placeholder at the cursor. The real value is never shown.'),
            css: 'secret-picker-tip',
            wrap: true, width: '100%'
        });
        body.add_widget(tip);

        var listw = new bricks.VScrollPanel({width: '100%', height: '100%'});
        body.add_widget(listw);
        var rows = new bricks.VBox({width: '100%', gap: '2px'});
        listw.add_widget(rows);

        var loading = new bricks.Text({text: '…', width: '100%'});
        rows.add_widget(loading);

        try {
            var jc = new bricks.HttpJson();
            var params = bricks.extend({}, this.opts.secret_params || {});
            var data = await jc.httpcall(this.opts.secret_dataurl,
                                         {method: 'GET', params: params});
            rows.clear_widgets();
            var items = (data && (data.secrets || data.rows || data.data)) || [];
            if (!items.length) {
                rows.add_widget(new bricks.Text({
                    text: bricks.app.i18n._('No secrets saved yet.'),
                    width: '100%', wrap: true
                }));
            }
            items.forEach(function (it) {
                var name = it.name || '';
                if (!name) return;
                var row = new bricks.HBox({width: '100%', gap: '6px', alignItems: 'center'});
                row.set_css('secret-picker-row');
                // 主行：名称（加粗）+ 类型徽标
                var label = new bricks.Text({
                    text: (it.label && it.label !== name) ? (name + '  ·  ' + it.label) : name,
                    cfontsize: 0.9, width: 'auto'
                });
                row.add_widget(label);
                row.add_widget(new bricks.VBox({css: 'filler'}));
                if (it.secret_type) {
                    row.add_widget(new bricks.Text({text: it.secret_type, cfontsize: 0.75, css: 'secret-type-tag'}));
                }
                rows.add_widget(row);
                // 元数据行：前缀/长度/用过几次——够人类辨认是哪个凭据，但拼不出可用值
                var meta = [];
                if (it.prefix_hint) meta.push('prefix ' + it.prefix_hint);
                if (it.length_hint) meta.push('len ' + it.length_hint);
                if (it.use_count) meta.push('used ' + it.use_count + 'x');
                if (it.remark) meta.push(it.remark);
                if (meta.length) {
                    rows.add_widget(new bricks.Text({
                        text: meta.join('  ·  '), cfontsize: 0.72, css: 'secret-picker-meta', width: '100%'
                    }));
                }
                row.bind('click', function () {
                    self.insert_secret_placeholder(name);
                });
            });
        } catch (e) {
            rows.clear_widgets();
            rows.add_widget(new bricks.Text({
                text: bricks.app.i18n._('Failed to load secrets: ') + String(e).slice(0, 120),
                css: 'resp-error', width: '100%', wrap: true
            }));
        }
        // 弹窗关闭/最小化后清引用（Popup 的事件是 'dismissed'，无 'closed'；
        // X 按钮走 destroy() → dismiss() 同样触发）——下次打开重新拉最新列表
        win.bind('dismissed', function () { self._secret_win = null; });
    }

    insert_secret_placeholder(name) {
        var fmt = this.opts.secret_format || '@@sec:{name}@@';
        var text = String(fmt).split('{name}').join(name);
        if (this.textw && this.textw.insertAtCursor) {
            this.textw.insertAtCursor(text);
        } else {
            // UiText 不支持时的降级：追加到末尾（不静默失败）
            var cur = (this.textw && this.textw.dom_element) ? (this.textw.dom_element.value || '') : '';
            this.textw.setValue(cur + text);
        }
        if (this._secret_win) {
            // PopupWindow 无 close()——正确 API 是 dismiss()（隐藏并 dispatch 'dismissed'）
            try { this._secret_win.dismiss(); } catch (e) {}
            this._secret_win = null;
        }
    }

    // 重设模型下拉数据源（2026-09-07 移动端切产线用）：销毁重建 UiCode，
    // 保持其在按钮行中的位置与样式不变。
    set_model_dataurl(url, params) {
        if (!url) return;
        var _mp = bricks.extend({}, params || this.model_selector.opts.params || {});
        var old = this.model_selector;
        this.model_selector = new bricks.UiCode({
            name: 'model_id',
            valueField: 'model_id',
            textField: 'model_id_text',
            dataurl: url,
            params: _mp,
            cwidth: old.opts.cwidth || 12,
            cfontsize: 0.85
        });
        // 原位替换：按钮行布局中 old 的位置换成新控件
        var row = old.parent;
        if (row && row.dom_element && old.dom_element) {
            row.dom_element.replaceChild(this.model_selector.dom_element, old.dom_element);
            var idx = row.children.indexOf(old);
            if (idx >= 0) row.children[idx] = this.model_selector;
            this.model_selector.parent = row;
            old.parent = null;
        }
    }

    getValue() {
        return {
            prompt: (this.textw.getValue() || {}).prompt || '',
            model_id: this.model_selector.getValue() || ''
        };
    }
};

bricks.Factory.register('AgentInput', bricks.AgentInput);
