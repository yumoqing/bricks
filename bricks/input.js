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
		this.value = v;
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
		this.pattern = '-?\\d*\\.?\\d*';
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
		this.add_widget(new bricks.Text({text:'drop in or click to choose file'}));
		this.dom_element.appendChild(this.input);
	}
    reset(){
        var v = this.opts.value || this.opts.defaultvalue||'';
		this.value = '';
        this.input.value = '';
    }
	handleFileSelect(event){
		var files = [];
		Array.from(event.target.files).forEach(f => {
			if (! this.accept || f.type.startsWith(this.accept)){
				files.push(f);
			}
		});
		if (files.length == 0) return; 
		if (this.opts.multiple){
			this.value = files;
		} else {
			this.value = files[0];
		}
		console.log('"changed" fired', this.value);
		this.dispatch('changed', this.getValue());
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
	dropHandle(event){
		event.preventDefault();
		var files = [];
		for (const f of event.dataTransfer.files) {
			if (! this.opts.accept || f.type.startsWith(this.opts.accept)){
				files.push(f);
			}
		};
		if (files.length == 0) return;
		if (this.opts.multiple){
			this.value = files;
			this.set_input_file(files);
		} else {
			this.value = files[0];
			this.set_input_file([this.value]);
		}
		this.dispatch('changed', this.getValue());
		console.log('"changed" fired', this.getValue());
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

bricks.UiAudio =class extends bricks.UiFile {
	constructor(opts){
		opts.name = opts.name || 'audio_file';
		opts.width = opts.width || '100%';
		opts.accept = 'audio/';
		super(opts);
		this.uitype='audio';
		this.camera_w = new bricks.Svg({
				url:bricks_resource('imgs/mic.svg'),
				tip:'use mic to record audio',
				rate:2});
		this.add_widget(this.camera_w);
		this.camera_w.bind('click', this.open_recorder.bind(this));
		this.preview = new bricks.VBox({width: '100%'});
		this.add_widget(this.preview);
		this.bind('changed', this.show_audio.bind(this));
	}
	open_recorder(event){
		event.stopPropagation();
		var recorder = new bricks.SysAudioRecorder({
			"archor":"cc",
			"auto_open":true,
			"cheight":3,
			"cwidth":20
		});
		recorder.bring_to_top();
		recorder.bind('record_end', this.accept_audio.bind(this, recorder));
	}
	accept_audio(recorder, event){
		recorder.dismiss();
		this.value = event.params.file
		this.set_input_file([this.value]);
		console.log('record finished, value=', this.value);
		this.dispatch('changed', this.getValue());
	}
	show_audio(event){
		var params = this.value;
		if (params instanceof File){
			params = [ params ];
		}
		if (typeof params == 'string'){
			params = [ params ];
		}
		this.preview.clear_widgets();
		params.forEach( f => {
			this._show_audio(f);
		});
	}

	_show_audio(file) {
		if (typeof file == 'string'){
			var vw = new bricks.AudioPlayer({
				url:file,
				audoplay: true,
				width:'100%'
			});
			this.preview.add_widget(vw);
			return;
		}
		const reader = new FileReader();
		reader.onload = (e) => {
			var imgw = new bricks.AudioPlayer({
				url:e.target.result,
				autoplay: true,
				width:'100%'
			});
			console.log('show audio', e.target.result);
			this.preview.add_widget(imgw);
		};
		reader.readAsDataURL(file);
	}
}
bricks.UiVideo =class extends bricks.UiFile {
	constructor(opts){
		opts.name = opts.name || 'video_file';
		opts.width = opts.width || '100%';
		opts.accept = 'video/';
		super(opts);
		this.uitype='video';
		this.camera_w = new bricks.Svg({
				url:bricks_resource('imgs/video-recorder.svg'),
				tip:'use cemera to record video',
				rate:2});
		this.set_css('droparea');
		this.add_widget(this.camera_w);
		this.camera_w.bind('click', this.open_recorder.bind(this));
		this.preview = new bricks.VBox({width: '100%'});
		this.add_widget(this.preview);
		this.bind('changed', this.show_video.bind(this));
	}
	open_recorder(event){
		event.stopPropagation();
		var recorder = new bricks.SysVideoRecorder({
			"archor":"cc",
			"auto_open":true,
			"height":"90%",
			"width":"90%"
		});
		recorder.bring_to_top();
		recorder.bind('record_end', this.accept_video.bind(this, recorder));
	}
	accept_video(recorder, event){
		recorder.dismiss();
		this.value = event.params.file
		this.set_input_file([this.value]);
		console.log('record finished, value=', this.value);
		this.dispatch('changed', this.getValue());
	}
	show_video(event){
		var params = this.value;
		console.log('params=', params);
		if (params instanceof File){
			params = [ params ];
		}
		if (typeof params == 'string'){
			params = [ params ];
		}
		this.preview.clear_widgets();
		params.forEach( f => {
			this._show_video(f);
		});
	}

	_show_video(file) {
		if (typeof file == 'string'){
			var vw = new bricks.VideoPlayer({
				url:file,
				audoplay: true,
				width:'100%'
			});
			this.preview.add_widget(vw);
			return;
		}
		var url = URL.createObjectURL(file);
		var imgw = new bricks.VideoPlayer({
			url:url,
			autoplay: true,
			width:'100%'
		});
		console.log('show video', url);
		this.preview.add_widget(imgw);
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
		this.add_widget(this.preview);
		this.bind('changed', this.show_image.bind(this));
	}
	take_photo(event){
		event.stopPropagation();
		var camera = new bricks.SysCamera({
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
		this.value = event.params.file;
		this.set_input_file([this.value]);
		var data = {};
		data[this.name] = this.value;
		this.dispatch('changed', data);
	}
	show_image(event){
		var params = event.params[this.name];
		if (params instanceof File){
			params = [ params ];
		}
		if (typeof params == 'string'){
			params = [ params ];
		}
		this.preview.clear_widgets();
		params.forEach( f => {
			this._show_image(f);
		});
	}

	_show_image(file) {
		if (typeof file == 'string'){
			var imgw = new bricks.Image({
				url:file,
				width:'100%'
			});
			this.preview.add_widget(imgw);
		}
		const reader = new FileReader();
		reader.onload = (e) => {
			var imgw = new bricks.Image({
				url:e.target.result,
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
		readonly:
		required:
	}
	*/
	constructor(opts){
		opts.dynsize = opts.dynsize || true;
		opts.cfontsize = opts.cfontsize || 1;
		if (opts.css){
			opts.css += ' inputbox auto-textarea';
		} else {
			opts.css = 'inputbox auto-textarea';
		}
		super(opts);
		this.uitype='text';
		this.build();
		this.charsize_sizing();
		this.bind('input', this.handleInput.bind(this));
		this.bind('keydown', this.key_handle.bind(this));
	}
	handleInput() {
		// 1. 记录原始滚动位置（防止光标跳动）
		var el = this.dom_element;
		const scrollTop = el.scrollTop;

		// 2. 核心：先设为固定高度而非 auto，
		// 避免某些浏览器（如 Safari）在 auto 切换时丢失滚动焦点
		el.style.height = '0px';

		// 3. 获取实时计算样式
		const style = window.getComputedStyle(el);
		const maxHeight = parseInt(style.maxHeight) || Infinity;
		const minHeight = parseInt(style.minHeight) || 40;

		// 4. 计算目标高度
		// scrollHeight 在所有现代浏览器中都包含 padding
		const targetHeight = el.scrollHeight;

		if (targetHeight >= maxHeight) {
			// 达到或超过最大高度
			el.style.height = maxHeight + 'px';
			el.style.overflowY = 'auto';
		} else {
			// 低于最大高度
			el.style.height = Math.max(targetHeight, minHeight) + 'px';
			el.style.overflowY = 'hidden';
		}

		// 5. 恢复滚动（解决 Chrome/Safari 偶尔的置顶 Bug）
		el.scrollTop = scrollTop;
	}
	create(){
		this.dom_element = this._create('textarea');
	}
	build(){
		var e = this.dom_element;
		e.id = e.name = this.opts.name;
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
		this.handleInput();
		// Defer re-calc in case element wasn't rendered yet (e.g. during Form build)
		if (!this._resizeScheduled) {
			this._resizeScheduled = true;
			requestAnimationFrame(() => {
				this._resizeScheduled = false;
				this.handleInput();
			});
		}
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
		var vf = this.opts.valueField || 'value';
		var tf = this.opts.textField || 'text';
		var v = this.opts.value || this.opts.defaultvalue || null;
		if (!v && ! this.opts.nullable && data.length > 0){
			v = data[0][vf]
		}
		if (this.opts.nullable){
			var tmp = {};
			tmp[vf] = null;
			tmp[tf] = '';
			data.unshift(tmp);
		}
		this.value = v;
		e.value = v;
		this.option_widgets = {};
		for (var i=0; i<data.length; i++){
			var o = document.createElement('option');
			o.value = data[i][vf];
			var txt = bricks.app.i18n._(data[i][tf]);
			if (!txt) txt = data[i][vf];
			o.innerText = txt;
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

var Input = new bricks._Input();
Input.register('UiAudio', 'audiorecorder', bricks.UiAudio);
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
Input.register('UiAudio', 'audiotext', bricks.UiAudio);
Input.register('UiSearch', 'search', bricks.UiSearch);
