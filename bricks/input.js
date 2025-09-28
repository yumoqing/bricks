var bricks = window.bricks || {};
bricks.UiType =class extends bricks.Layout {
	constructor(opts){
		super(opts);
		this.name = this.opts.name;
		this.required = opts.required || false;
		this.ctype = 'text';
		this.value = opts.value || opts.defaultvalue||'';
	}

	getValue(){
		var o = {}
		o[this.name] = this.resultValue();
		var d = this.getUserData();
		if (d){
			o = bricks.extend(o, d);
		}
		return o;
	}
	set_formdata(formdata){
		formdata.append(this.name, this.resultValue());
	}
	resultValue(){
		return this.value;
	}
	focus(){
		this.dom_element.focus();
	}
	reset(){
		var v = this.opts.value||this.opts.defaultvalue|| '';
		this.setValue(v);
	}

	setValue(v){
		if (! v)
			v = '';
		this.vlaue = v;
		this.dom_element.value = v;
	}
	set_disabled(f){
		this.dom_element.disabled = f;
	}
	set_readonly(f){
		this.dom_element.readOnly = f;
	}
	set_required(f){
		this.dom_element.required = f;
		this.required = f;
	}
}

bricks.UiAudioRecorder = class extends bricks.AudioRecorder {
	constructor(opts){
		super(opts);
		this.uitype = 'audiorecorder';
		this.name = this.opts.name;
		this.required = opts.required || false;
		this.value = opts.value || opts.defaultvalue||'';
		this.bind('record_ended', this.getValue.bind(this));
	}

	getValue(){
		var o = {}
		this.value = this.recordData.data;
		o[this.name] = this.value;
		return o;
	}
	set_formdata(formdata){
		formdata.append(this.name, this.value, 'record.wav');
	}
	resultValue(){
		return this.value;
	}
	focus(){
		this.dom_element.focus();
	}
	reset(){
	}
	setValue(v){
		return;
	}
	set_disabled(f){
		this.dom_element.disabled = f;
	}
	set_readonly(f){
		this.dom_element.readOnly = f;
	}
	set_required(f){
		this.dom_element.required = f;
		this.required = f;
	}
}
bricks.UiAudioText = class extends bricks.UiType {
    /*
    {
        "upload_url"
    }
    */
    constructor(opts){
        super(opts);
		this.uitype = 'audiotext';
        this.recorder = new bricks.AudioRecorder({
            icon_rate:2,
            upload_url:opts.upload_url
        });
		this.recorder.bind('record_started', this.clear_text.bind(this));
        this.add_widget(this.recorder);
		var opts1 = bricks.extend({}, opts);
		opts1.width = "97%";
        this.text_w = new bricks.UiText(opts1);
        this.add_widget(this.text_w);
        this.recorder.bind('uploaded', this.set_result_text.bind(this));
    }
	clear_text(){
		this.text_w.setValue('');
	}
	resultValue(){
		this.value = this.text_w.resultValue();
		return this.value;
	}
	setValue(v){
		this.value = v;
		this.text_w.setValue(v);
	}
    set_result_text(event){
        var txt = event.params.text;
        this.text_w.setValue(txt);
    }
}

bricks.UiHide = class extends bricks.UiType {
	constructor(opts){
		super(opts);
		this.uitype = 'hide';
		this.set_style('display', 'none');
	}
}

bricks.UiStr =class extends bricks.UiType {
	/*
	{
		name:
		value:
		defaultValue:
		align:"left", "center", "right"
		length:
		minlength:
		tip:
		width:
		readonly:
		required:
	}
	*/
	constructor(opts){
		super(opts);
		this.uitype='str';
		this.rate = this.opts.rate || 1;
		this.dynsize = this.opts.dynsize || true;
		this.cfontsize = this.opts.cfontsize || 1;
		if (opts.readonly) {
			this.set_readonly("Y");
		} else {
			this.set_readonly(false);
		}
		if (opts.width){
			this.dom_element.style.width = opts.width;
		}
		this.charsize_sizing();
	}
	create(){
		var el = this._create('input');
		this.dom_element = el;
		this.pattern = '.*';
		el.autocomplete = 'off';
		el.type = 'text';
		el.id = this.name = el.name = this.opts.name;
		if (this.opts.required)
			el.required = true;
		if (this.opts.css){
			el.classList.add(this.opts.css);
			this.actived_css = this.opts.css + '-actived';
		} else {
			el.classList.add('input');
			this.actived_css = 'input_actived';
		}
		el.style.textAlign = this.opts.align || 'left';
		if (this.opts.hasOwnProperty('length'))
			el.maxlength = this.opts.length;
		if (this.opts.hasOwnProperty('minlength'))
			el.minlength = this.opts.minlength;
		if (this.opts.hasOwnProperty('value'))
			this.setValue(this.opts.value);
		if (this.opts.defaultVlaue)
			el.defaultValue = this.opts.defaultValue;
		this.reset()
		if (this.opts.placeholder)
			el.placeholder = bricks.app.i18n._(this.opts.placeholder);
		el.addEventListener('focus', this.onfocus.bind(this));
		el.addEventListener('onkeydown', this.onkeydown.bind(this));
		el.addEventListener('blur', this.onblur.bind(this));
		el.addEventListener('input', this.set_value_from_input.bind(this))
	}
	onblur(event){
		this.dom_element.classList.remove(this.actived_css);
		this.value = this.dom_element.value;
		this.set_value_from_input(event);
	}
	onfocus(event){
		this.dom_element.classList.add(this.actived_css);
	}
	onkeydown(event){
		if(event.key == 'Enter'){
			var v = this.getValue();
			this.dispatch('blur', v)
		}
	}
	check_pattern(value){
		var r = new RegExp(this.pattern);
		var v = value.match(r);
		if (! v || v[0] == ''){
			return null;
		}
		return v[0];
	}
	set_value_from_input(event){
		var oldv = this.value;
		var changed = false;
		var e = event.target;
		var v = e.value;
		if (e.value!='' && e.type != 'file'){
			v = this.check_pattern(e.value);
		}
		if (v == null){
			e.value = this.value;
			return
		}
		this.value = v;
		var o = this.getValue();
		this.dispatch('changed', o);
	}
	resultValue(){
		this.value = this.dom_element.value;
		return this.value;
	}
	setValue(v){
		if (! v)
			v = '';
		this.value = v;
		this.dom_element.value = '' + this.value;
	}
}

bricks.UiSearch = class extends bricks.HBox {
	/*
	search_url:
	valueField
	textField
	select_event
	popup_options
	value,
	text
	*/
	constructor(opts){
		super(opts);
		this.uitype = 'search';
		var inputdesc = {
			name:this.name,
			value:this.text,
			readonly:true
		}
		this.str_in = new bricks.UiStr(inputdesc);
		this.search_icon = new bricks.Svg({
			url:bricks_resource('imgs/search.svg'),
			rate:1.5
		});
		this.str_in.set_css('filler');
		this.search_icon.set_css('clickable');
		this.search_icon.bind('click', this.open_search_window.bind(this));
		this.add_widget(this.str_in);
		this.add_widget(this.search_icon);
	}
	async open_search_window(event){
		var desc = {
			"widgettype":"urlwidget",
			"options":{
				"url":this.search_url
			}
		}
		var w = await bricks.widgetBuild(desc, this);
		var tabular = null;
		for (var i=0;i<w.children.length;i++){
			if (w.children[i] instanceof bricks.Tabular){
				tabular = w.children[i];
			}
		}
		if (!tabular){
			console.log('tubular not found is w');
			return;
		}
		var win = bricks.default_popupwindow(this.popup_options||{});
		win.add_widget(w);
		win.open();
		tabular.bind(this.search_event, this.set_data.bind(this));
		tabular.bind(this.search_event, win.dismiss.bind(win));
	}
	set_data(event){
		var d = event.params;
		this.value = d[this.valueField];
		this.str_in.setValue(d[this.textField])
	}
	getValue(){
		var o = {}
		o[this.name] = this.resultValue();
		var d = this.getUserData();
		if (d){
			o = bricks.extend(o, d);
		}
		return o;
	}
	set_formdata(formdata){
		formdata.append(this.name, this.resultValue());
	}
	resultValue(){
		return this.value;
	}
	focus(){
		this.str_in.dom_element.focus();
	}
	reset(){
		var v = this.opts.value||this.opts.defaultvalue|| '';
		this.setValue(v);
		this.str_in.setValue(this.opts.text||'');
	}
	setValue(v, t){
		if (! v)
			v = '';
		this.vlaue = v;
		this.str_in.setValue(t);
	}
	set_disabled(f){
		this.dom_element.disabled = f;
	}
	set_readonly(f){
		this.dom_element.readOnly = f;
	}
	set_required(f){
		this.dom_element.required = f;
		this.required = f;
	}
	
}
bricks.UiPassword =class extends bricks.UiStr {
	/*
	{
		name:
		value:
		defaultValue:
		align:"left", "center", "right"
		length:
		minlength:
		tip:
		readonly:
		required:
	}
	*/
	constructor(opts){
		opts.dynsize = opts.dynsize || true;
		super(opts);
		this.uitype='password';
		this.dom_element.type = 'password';
	}
}
bricks.UiInt =class extends bricks.UiStr {
	/* 
	{
		length:
	}
	*/
	constructor(options){
		super(options);
		this.uitype='int';
		this.dom_element.style.textAlign = 'right';
		this.dom_element.type = 'number';
		this.pattern = '\\d*';
	}
	resultValue(){
		return parseInt(this.value);
	}
	setValue(v){
		if (! v)
			v = '';
		this.value = '' + v;
		this.dom_element.value = '' + v;
	}

}
bricks.UiFloat  =class extends bricks.UiInt {
	/* 
	{
		dec_len:
	}
	*/
	constructor(options){
		super(options);
		this.uitype='float';
		this.pattern = '\\d*\\.?\\d+';
		var dec_len = this.opts.dec_len || 2;
		var step = 1;
		for (var i=0; i<dec_len; i++)
			step = step / 10;
		this.dom_element.step = step;
	}
	resultValue(){
		super.resultValue();
		return parseFloat(this.value);
	}
	setValue(v){
		if (! v)
			v = '';
		this.value = '' + v;
		this.dom_element.value = '' + v;
	}
}
bricks.UiTel =class extends bricks.UiStr {
	/*
	{

		pattern:
	}
	*/
	constructor(opts){
		super(opts);
		this.uitype='tel';
		this.dom_element.type = 'tel';
		if (this.opts.pattern)
			this.dom_element.pattern = this.opts.pattern;
		this.pattern = '[+]?\\d+';
	}
}

bricks.UiEmail =class extends bricks.UiStr {
	/*
	{
	}
	*/
	constructor(opts){
		super(opts);
		this.uitype='email';
		this.dom_element.type = 'email';
		if (this.opts.pattern)
			this.dom_element.pattern = this.opts.pattern;
		if (this.opts.pattern)
			this.dom_element.pattern = this.opts.pattern;
	}
}

bricks.UiFile = class extends bricks.VBox {
	/*
        accept:
        multiple:
	*/
	constructor(opts){
		opts.width = opts.width || '100%';
		super(opts);
		this.set_css('droparea');
		this.bind('dragover', (event) => {
			event.preventDefault();
		});
		["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
      		this.bind(eventName, (e) => e.preventDefault(), false);
		});
		this.bind('dragenter', () => {
			this.set_css('hover');
		});
		this.bind('dragleave', () => {
			this.set_css('hover', true);
		});
		this.bind('drop', this.dropHandle.bind(this));
		this.input = document.createElement('input');
		this.input.type = 'file';
		if (opts.accept) this.input.accept = opts.accept;
		if (opts.multiple) this.input.multiple = true;
		this.input.addEventListener('change', this.handleFileSelect.bind(this));
		// this.bind('click', this.handleClick.bind(this));
		this.add_widget(new bricks.Text({text:'drop in or click to choose file'}));
		this.dom_element.appendChild(this.input);
	}
	set_input_file(files){
		const dt = new DataTransfer();
		if (this.opts.multiple){
			this.value = [];
			files.forEach(f => {
				dt.items.add(f);
				this.value.push(f);
			});
			this.input.files = dt.files;
		} else {
			var f = files[0]
			this.value = f;
			dt.items.add(f);
			this.input.files = dt.files;
		}
	}
	handleFileSelect(event){
		if (this.opts.multiple){
			files = [];
			event.target.files.forEach(f => {
				files.push(f);
			});
			this.value = files;
			return
		}
		const file = event.target.files[0];
		this.value = file;
		this.dispatch('changed', this.value)
	}
	dropHandle(event){
		event.preventDefault();
		this.set_css('hover', true);
		var files = [];
		for (const f of event.dataTransfer.files) {
			if (this.opts.accept && ! f.type.startsWith(this.opts.accept)){
				continue;
			}
			files.push(f);
		};
		if (this.opts.multiple){
			this.value = files;
			this.set_input_file(files);
		} else {
			this.value = files[0];
			this.set_input_file([this.value]);
		}
		this.dispatch('changed', this.value);
	}
	set_formdata(fd){
		fd.append(this.name, this.resultValue());
	}
	resultValue(){
		if (this.value){
			return this.value;
		}
		if (this.input.files.length)
			return this.input.files[0];
		return null;
	}
	getValue(){
		var ret = {};
		ret[this.name] = this.resultValue();
		return ret;
	}
}

bricks.UiImage =class extends bricks.UiFile {
	constructor(opts){
		opts.name = opts.name || 'image';
		opts.width = opts.width || '100%';
		opts.accept = 'image/';
		super(opts);
		this.uitype='image';
		this.camera_w = new bricks.Svg({
				url:bricks_resource('imgs/camera.svg'),
				tip:'use cemera to take a picture',
				rate:2});
		this.set_css('droparea');
		this.add_widget(this.camera_w);
		this.camera_w.bind('click', this.take_photo.bind(this));
		this.preview = new bricks.VBox({width: '100%'});
		this.bind('changed', this.show_image.bind(this));
	}
	take_photo(event){
		event.stopPropagation();
		var camera = new bricks.Camera({
			"archor":"cc",
			"auto_open":true,
			"height":"90%",
			"width":"90%"
		});
		camera.bring_to_top();
		camera.bind('shot', this.accept_photo.bind(this, camera));
	}
	accept_photo(camera, event){
		camera.dismiss();
		if (this.imgw){
			this.remove_widget(this.imgw);
		}
		this.imgw = new bricks.Image({
			url:event.params,
			width:'100%'
		});
		this.value = event.params
		this.dispatch('changed', this.value);
		// this.add_widget(this.imgw);
	}
	show_image(event){
		var params = event.params;
		if (params instanceof File){
			params = [ params ];
		}
		this.preview.clear_widgets();
		params.forEach( f => {
			this._show_image(f);
		});
	}

	_show_image(file) {
		const reader = new FileReader();
		reader.onload = (e) => {
			imgw = new bricks.Image({
				url:file,
				width:'100%'
			});
			this.preview.add_widget(imgw);
		};
		reader.readAsDataURL(file);
	}
}

bricks.UiCheck =class extends bricks.UiType {
	constructor(opts){
		super(opts);
		this.uitype = 'check';
		bricks.extend(bricks.UiCheck.prototype, bricks.Layout.prototype);
		this.add_widget = bricks.Layout.prototype.add_widget.bind(this);
		this.dom_element.style.width = 'auto';
		this.dom_element.style.height = 'auto';
		var state = 'unchecked';
		if (opts.value){
			state = 'checked';
		}
		this.ms_icon = new bricks.MultipleStateIcon({
			state:state,
			urls:{
				checked:bricks_resource('imgs/checkbox-checked.svg'),
				unchecked:bricks_resource('imgs/checkbox-unchecked.svg')
			}
		});
		
		this.add_widget(this.ms_icon)

		this.ms_icon.bind('state_changed', this.set_value_from_input.bind(this));

	}
	set_value_from_input(e){
		var v;
		if (this.ms_icon.state=='checked')
			v = true;
		else
			v = false;
		this.value = v;
		var o = {};
		o[this.name] = this.value;
		var d = this.getUserData();
		if (d){
			o = bricks.extend(o, d);
		}
		this.dispatch('changed', o);
	}
	setValue(v){
		this.value = v;
		if (v)
			this.ms_icon.set_state('checked');
		else 
			this.ms_icon.set_state('unchecked');
	}
	resultValue(){
		return this.value;
	}
}

bricks.UiCheckBox =class extends bricks.UiType {
	/*
	{
		name:
		label:
		value:
		textField:'gg',
		valueField:'hh',
		otherField:'b',
		data:[
			{
				'gg':
				'hh':
				'b':
			}
		]
		or:
		dataurl:
		params:{},
		method:
	}
	*/
	constructor(opts){
		super(opts);
		this.uitype='checkbox';
		this.valueField = opts.valueField || 'value';
		this.textField = opts.textField || 'text';
		this.value = this.opts.value || this.opts.defaultValue||[];
		if (! Array.isArray(this.value)){
			this.value = [ this.value ];
		}
		this.el_legend = this._create('legend');
		var label = this.opts.label||this.opts.name;
		this.el_legend.innerText = bricks.app.i18n._(label);
		if (this.opts.dataurl){
			schedule_once(this.load_data_onfly.bind(this), 0.01);
		} else {
			this.data = opts.data;
			this.build_checkboxs();
		}
		this.sizable_elements = [];
		this.sizable_elements.push(this.el_legend);
		this.charsize_sizing();
	}
	create(){
		this.dom_element = this._create('fieldset');
	}
	build_checkboxs(){
		var data = this.data;
		this.input_boxs = [];
		if (this.multicheck){
			if (typeof this.value != typeof []){
				this.value = [this.value];
			}
		}
			
		for (var i=0; i<data.length;i++){
			var hbox = new bricks.HBox({height:"auto",width:"100%"});
			var opts = {}
			var value = data[i][this.valueField];
			opts.value = false;
			if (this.multicheck){
				if (this.value.indexOf(value) >= 0){
					opts.value = true;
				}
			}
			else {
				if (this.value == value){
					opts.value = true
				}
			}
			opts.name = value;
			var check = new bricks.UiCheck(opts);
			var otext = data[i][this.textField];
			var txt = new bricks.Text({
				otext:otext,
				align:'left',
				i18n:true});
			txt.ht_left();
			check.bind('changed', this.set_value_from_input.bind(this));
			hbox.add_widget(check);
			hbox.add_widget(txt);
			this.add_widget(hbox);
			this.input_boxs.push(check);
		}
	}
	async load_data_onfly(){
		var jc = new bricks.HttpJson();
		var data = await jc.httpcall(this.opts.dataurl, {
					"method":this.opts.method||'GET',
					"params":this.opts.params});
		this.data = data;
		this.build_checkboxs();
	}
	set_value_from_input(event){
		event.stopPropagation();
		var e = event.target.bricks_widget;
		if (this.multicheck){
			if (e.value){
				this.value.push(e.name);
			} else {
				this.value.remove(e.name)
			}
		} else {
			for (var i=0;i<this.input_boxs.length;i++){
				var e1 = this.input_boxs[i];
				if (e1 != e){
					e1.setValue(false);
				}
			}
			this.value = e.name;
			console.log('this is singlecheck ....', this.value);
		}
		var o = {};
		o[this.name] = this.value;
		this.dispatch('changed', o);
	}
	resultValue(){
		return this.value;
	}
	setValue(v){
		var thisvalue = this.value;
		if (Array.isArray(v)){
			thisvalue = v;
		} else {
			thisvalue = [v];
		}
		for (var i=0; i<this.input_boxs.length; i++){
			if (thisvalue.includes(this.data[i][this.valueField])){
				this.input_boxs[i].setValue(true);
			} else {
				this.input_boxs[i].setValue(false);
			}
		}
	}
}

bricks.UiDate =class extends bricks.UiStr {
	/* 
	{
		max_date:
		min_date:

	*/
	constructor(options){
		super(options);
		this.uitype='date';
		this.opts_setup();
	}
	opts_setup(){
		var e = this.dom_element;
		e.type = 'date';
		if (this.opts.max_date){
			e.max = this.opts.max_date;
		}
		if (this.opts.min_date){
			e.min = this.opts.min_date;
		}
	}
	resultValue(){
		if (this.value == ''){
			return null;
		}
		return this.value;
	}
}

bricks.UiText =class extends bricks.UiType {
	/*
	{
		name:
		value:
		defaultValue:
		tip:
		rows:
		cols:
		readonly:
		required:
	}
	*/
	constructor(opts){
		opts.dynsize = opts.dynsize || true;
		opts.cfontsize = opts.cfontsize || 1;
		super(opts);
		this.uitype='text';
		this.build();
		this.charsize_sizing();
		this.bind('keydown', this.key_handle.bind(this))
	}
	create(){
		this.dom_element = this._create('textarea');
	}
	build(){
		var e = this.dom_element;
		e.id = e.name = this.opts.name;
		e.rows = this.opts.rows || 5;
		e.cols = this.opts.cols || 40;
		this.reset();
		this.bind('input', this.set_value_from_input.bind(this))
	}
	set_value_from_input(event){
		this.value = this.dom_element.value;
	}
	resultValue(){
		var e = this.dom_element;
		this.value = e.value;
		return this.value;
	}
	setValue(v){
		if (! v) v = '';
		this.value = v;
		this.dom_element.value = v;
		debug('UiText: v=', v);
	}
	reset(){
		var v = this.opts.value || this.opts.defaultvalue||'';
		this.setValue(v);
	}
	key_handle(e){
		switch(e.key){
			case 'Tab':
				e.preventDefault(); // 阻止默认Tab行为
				var erase = false
				if (e.shiftKey) erase = true;
				this.handle_tab_indent(erase);
				break;
			case 'Enter':
				e.preventDefault(); // 阻止默认行为
				this.handle_enter();
				break;
			case 'ArrowUp':
			case 'ArrowDown':
			default:
				break;
		}
	}
	set_editor_focus(editor, pos){
		editor.selectionStart = editor.selectionEnd = pos;
		editor.focus();
	}
	handle_enter(){
		var editor = this.dom_element;
		const cursorPos = editor.selectionStart;
		const value = editor.value;
		const before = value.substring(0, cursorPos);
		const after = value.substring(cursorPos);
		editor.value = before + '\n' + after;
		editor.selectionStart = editor.selectionEnd = cursorPos + 1;
		editor.focus();
		schedule_once(this.set_editor_focus.bind(this, editor, cursorPos+1), 0.5);
	}	
	handle_tab_indent(erase){
		/* erase == true : delete tabspace
		   else
		   		add tabspace
		*/
		var editor = this.dom_element;
		var indent_cnt;
		const cursorPos = editor.selectionStart;
		const value = editor.value;

		// 获取光标所在行的开始位置
		const beforeCursor = value.substring(0, cursorPos);
		const lastLineStart = beforeCursor.lastIndexOf("\n") + 1; // 上一行的结束位置
		const currentLineStart = lastLineStart; // 当前行的开始位置
		const cur_col = cursorPos - currentLineStart;
		var pos;
		if (!erase){
			indent_cnt = 4 - cur_col % 4;
			if (indent_cnt == 0) indent_cnt = 4;
			// 根据光标前的空格数动态插入合适数量的空格
			const before = value.substring(0, cursorPos);
			const after = value.substring(cursorPos);
			const indentation = ' '.repeat(indent_cnt); // 生成合适数量的空格
			editor.value = before + indentation + after;
			// 更新光标位置（将光标移到插入的缩进后面）
			pos = cursorPos + indent_cnt;
			editor.selectionStart = editor.selectionEnd = cursorPos + indent_cnt;
		} else {
			indent_cnt = cur_col % 4;
			if (indent_cnt == 0) indent_cnt = 4;
			const before = value.substring(0, cursorPos - indent_cnt);
			const after = value.substring(cursorPos);
			editor.value = before + after;
			pos = cursorPos - indent_cnt;
			editor.selectionStart = editor.selectionEnd = cursorPos - indent_cnt;
		}
		editor.focus();
		schedule_once(this.set_editor_focus.bind(this, editor, pos), 0.5);
	}
}

bricks.UiCode =class extends bricks.UiType {
	/*
	{
		name:
		value:
		valueField:
		nullable:
		textField:
		defaultValue:
		readonly:
		required:
		data:
		dataurl:
		params:
		method:
	}
	*/
	constructor(opts){
		opts.cfontsize = opts.cfontsize||1;
		opts.dynsize = opts.dynsize || true;
		super(opts);
		this.uitype='code';
		this.data = this.opts.data;
		this.build();
	}
	create(){
		this.dom_element = this._create('select');
	}
	build(){
		this.dom_element.id = this.opts.name;
		this.dom_element.name = this.opts.name;
		if (this.opts.dataurl){
			schedule_once(this.get_data.bind(this), 0.01);
			return;
		}
		this.build_options(this.opts.data);
	}
	async loadData(params){
		var _params = bricks.extend({}, this.opts.params);
		bricks.extend(_params, params);
		await this.load_data(_params);
	}
	async get_data(event){
		var params = this.opts.params;
		if(event){
			bricks.extend(params, event.params);
		}
		await this.load_data(params);
	}
	async load_data(params){
		var jc = new bricks.HttpJson();
		var d = await jc.httpcall(this.opts.dataurl,
			{
				method:this.opts.method || 'GET',
				params : params
			});
		this.data = d;
		this.build_options(d);
	}
	build_options(data){
		var e = this.dom_element;
		while(e.firstChild){
			e.removeChild(e.firstChild);
		}
		var v = this.opts.value || this.opts.defaultvalue || null;
		if (!v && ! this.opts.nullable && data.length > 0){
			v = data[0][this.opts.valueField]
		}
		if (this.opts.nullable){
			var tmp = {};
			tmp[this.opts.valueField] = null;
			tmp[this.opts.textField] = '';
			data.unshift(tmp);
		}
		this.value = v;
		e.value = v;
		this.option_widgets = {};
		for (var i=0; i<data.length; i++){
			var o = document.createElement('option');
			o.value = data[i][this.opts.valueField||'value'];
			o.innerText = bricks.app.i18n._(data[i][this.opts.textField||'text']);
			this.option_widgets[o.value] = o;
			if (o.value == v){
				o.selected = true;
			}
			e.appendChild(o);
			this.sizable_elements.push(o);
		}
		this.bind('input', this.set_value_from_input.bind(this))
		this.charsize_sizing();
	}
	set_value_from_input(event){
		this.value = this.dom_element.value;
		this.dispatch('changed', this.getValue());
	}
	resultValue(){
		return this.value;
	}
	setValue(v){
		this.value = v;
		for (var i=0; i<this.option_widgets.length; i++){
			if (this.value == this.option_widgets[i].value){
				this.option_widgets[i].checked = true
			} else {
				this.option_widgets[i].checked = true
			}
		}
	}
	reset(){
		var v = this.opts.value||this.opts.defaultvalue||'';
		this.setValue(v);
	}
}

bricks._Input = class {
	constructor(){
		this.uitypes = [];
	}

	register(name, uitype,Klass){
		if (! Klass){
			bricks.debug('Klass not defined', name);
			return;
		}
		bricks.Factory.register(name, Klass);
		this.uitypes[uitype] = Klass;
	}
	factory(options){
		var klass = this.uitypes[options.uitype];
		if (klass){
			return new klass(options);
		}
		bricks.debug('create input for:', options.uitype, 'failed', this.uitypes);
		return null;
	}
}

bricks.UiAudio =class extends bricks.UiFile {
	constructor(opts){
		super(opts);
		this.uitype = 'audio';
		this.autoplay = opts.autoplay;
		this.readonly = opts.readonly;
		this.icon = new bricks.Svg({
			url: bricks_resource('imgs/right_arrow.svg')});
		this.add_widget(this.icon);
		this.icon.bind('click', this.play_audio.bind(this));
		this.player = new bricks.AudioPlayer({
			url:this.value
			});
		if (this.autoplay){
			schedule_once(this.autoplay_audio.bind(this), 1);
		}

	}
	autoplay_audio(){
		this.icon.dispatch('click');
	}
	play_audio(){
		this.player.toggle_play();
	}
}
bricks.UiVideo =class extends bricks.UiStr {
	constructor(opts){
		super(opts);
		this.uitype = 'video';
		this.autoplay = opts.autoplay;
		this.readonly = opts.readonly;
		this.icon = new bricks.Svg({
			url: bricks_resource('imgs/right_arrow.svg')});
		this.add_widget(this.icon);
		this.icon.bind('click', this.play_vide.bind(this));
		this.player = new bricks.Video({
			url:this.value
			});
		if (this.autoplay){
			schedule_once(this.autoplay_video.bind(this), 1);
		}

	}
	autoplay_vide(){
		this.icon.dispatch('click');
	}
	play_vide(){
		this.player.toggle_play();
	}
}
var Input = new bricks._Input();
Input.register('UiAudioRecorder', 'audiorecorder', bricks.UiAudioRecorder);
Input.register('UiStr', 'str', bricks.UiStr);
Input.register('UiHide', 'hide', bricks.UiHide);
Input.register('UiTel', 'tel', bricks.UiTel);
Input.register('UiDate', 'date', bricks.UiDate);
Input.register('UiInt', 'int', bricks.UiInt);
Input.register('UiFloat', 'float', bricks.UiFloat);
Input.register('UiCheck', 'check', bricks.UiCheck);
Input.register('UiCheckBox', 'checkbox', bricks.UiCheckBox);
Input.register('UiEmail', 'email', bricks.UiEmail);
Input.register('UiFile', 'file', bricks.UiFile);
Input.register('UiImage', 'image', bricks.UiImage);
Input.register('UiCode', 'code', bricks.UiCode);
Input.register('UiText', 'text', bricks.UiText);
Input.register('UiPassword', 'password', bricks.UiPassword);
Input.register('UiAudio', 'audio', bricks.UiAudio);
Input.register('UiVideo', 'video', bricks.UiVideo);
Input.register('UiAudioText', 'audiotext', bricks.UiAudioText);
Input.register('UiSearch', 'search', bricks.UiSearch);
