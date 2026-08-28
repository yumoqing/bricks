// AgentInput — 集成模型选择的输入控件
// options: { model_dataurl, model_cwidth, placeholder, url(提交图标), ...VBox 原有属性 }
// event: inputed → { prompt, add_files, model_id }

bricks.AgentInput = class extends bricks.VBox {
    constructor(opts) {
        opts.height = 'auto';
        opts.width = '100%';
        // 默认内边距，避免子控件（输入框/模型选择器/按钮）贴边；可用 opts.padding 覆盖
        if (opts.padding === undefined) opts.padding = '8px 12px';
        super(opts);

        // file upload
        this.inputfilew = new bricks.UiFile({name: 'add_file'});
        this.filesbar = new bricks.DynamicColumn({col_cwidth: 10});
        this.add_files = [];
        this.file_names = [];
        this.inputfilew.bind('changed', this.file_added.bind(this));

        // text input
        this.textw = new bricks.UiText({
            name: 'prompt',
            placeholder: opts.placeholder || ''
        });

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
            cwidth: 1.5, cheight: 1.5,
            url: opts.url || bricks_resource('imgs/submit.svg')
        });
        inputw.bind('click', this.input_finished.bind(this));

        // button row: [+add] [model_selector] [filler] [submit]
        var hbox = new bricks.HBox({cheight: 1.5, gap: '4px', alignItems: 'center'});
        hbox.add_widget(addfilew);
        hbox.add_widget(this.model_selector);
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

    getValue() {
        return {
            prompt: (this.textw.getValue() || {}).prompt || '',
            model_id: this.model_selector.getValue() || ''
        };
    }
};

bricks.Factory.register('AgentInput', bricks.AgentInput);
