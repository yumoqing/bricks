class UiType extends Layout {
	constructor(opts){
		super(opts);
		this.name = this.opts.name;
		this.required = opts.required || false;
		this.ctype = 'text';
		this.value = '';
	}

	getValue(){
		var o = {}
		o[this.name] = this.resultValue();
		return o;
	}
	focus(){
		this.dom_element.focus();
	}
	reset(){
		var v = this.opts.value||this.opts.defaultvalue|| '';
		this.setValue(v);
	}

	setValue(v){
		this.vlaue = v;
	}
	disabled(f){
		this.dom_element.disabled = f;
	}
	readonly(f){
		this.dom_element.readonly = f;
	}
	required(f){
		this.dom_element.required = f;
		this.required = f;
	}
}

class UiStr extends UiType {
	static uitype='str';
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
		super(opts);
		this.create('input');
		this.sizable();
		this.set_fontsize();
	}
	create(tagname){
		var el = UiType.prototype._create.bind(this)(tagname);
		this.pattern = '.*';
		el.type = 'text';
		el.id = el.name = this.opts.name;
		if (this.opts.readonly)
			el.readonly = true;
		else
			el.readonly = false;
		if (this.opts.required)
			el.required = true;
		if (this.opts.css){
		
			el.classList.add(this.opts.css);
			this.actived_css = this.opts.css + '-actived';
		} else {
			el.classList.add('input');
			this.actived_css = 'input_actived';
		}
		el.value = parseInt(this.value);
		el.style.textAlign = this.opts.align || 'left';
		if (this.opts.hasOwnProperty('length'))
			el.maxlength = this.opts.length;
		if (this.opts.hasOwnProperty('minlength'))
			el.minlength = this.opts.minlength;
		if (this.opts.hasOwnProperty('value'))
			this.value = this.opts.value;
		el.value = '' + this.value;
		if (this.opts.defaultVlaue)
			el.defaultValue = this.opts.defaultValue;
		if (this.opts.tip)
			el.placeholder = bricks_app.i18n._(this.opts.tip);
		el.addEventListener('focus', this.onfocus.bind(this));
		el.addEventListener('blur', this.onblur.bind(this));
		el.addEventListener('input', this.set_value_from_input.bind(this))
		this.dom_element = el;
	}
	onblur(event){
		this.dom_element.classList.remove(this.actived_css);
	}
	onfocus(event){
		this.dom_element.classList.add(this.actived_css);
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
		var e = event.target;
		if (e.value == ''){
			this.value = '';
			return
		} 
		if (e.type == 'file'){
			this.value = e.value;
			return;
		}
		var v = this.check_pattern(e.value);
		if (v == null){
			e.value = this.value;
			return
		}
		this.value = v;
		var o = this.getValue();
		this.dispatch('changed', o);
	}
	resultValue(){
		return this.value;
	}
	setValue(v){
		this.value = v;
		this.dom_element.value = '' + this.value;
	}
}

class UiPassword extends UiStr {
	static uitype='password';
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
		super(opts);
		this.dom_element.type = 'password';
	}
}
class UiInt extends UiStr {
	static uitype='int';
	/* 
	{
		length:
	}
	*/
	constructor(options){
		super(options);
		this.dom_element.style.textAlign = 'right';
		this.dom_element.type = 'number';
		this.pattern = '\\d*';
	}
	resultValue(){
		return parseInt(this.value);
	}
	setValue(v){
		this.value = '' + v;
	}

}
class UiFloat  extends UiInt {
	static uitype='float';
	/* 
	{
		dec_len:
	}
	*/
	constructor(options){
		super(options);
		this.pattern = '\\d*\\.?\\d+';
		var dec_len = this.opts.dec_len || 2;
		var step = 1;
		for (var i=0; i<dec_len; i++)
			step = step / 10;
		this.dom_element.step = step;
	}
	resultValue(){
		return parseFloat(this.value);
	}
	setValue(v){
		this.value = '' + v;
	}
}
class UiTel extends UiStr {
	static uitype='tel';
	/*
	{

		pattern:
	}
	*/
	constructor(opts){
		super(opts);
		this.dom_element.type = 'tel';
		if (this.opts.pattern)
			this.dom_element.pattern = this.opts.pattern;
		this.pattern = '[+]?\\d+';
	}
}

class UiEmail extends UiStr {
	static uitype='email';
	/*
	{
	}
	*/
	constructor(opts){
		super(opts);
		this.dom_element.type = 'email';
		if (this.opts.pattern)
			this.dom_element.pattern = this.opts.pattern;
		if (this.opts.pattern)
			this.dom_element.pattern = this.opts.pattern;
	}
}

class UiFile extends UiStr {
	static uitype='file';
	/*
	{
		accept:
		capture:"user" or "environment"
		multiple:
	}
	*/
	constructor(opts){
		super(opts);
		this.dom_element.type = 'file';
		if (this.opts.accept)
			this.dom_element.accept = this.opts.accept;
		if (this.opts.capture)
			this.dom_element.capture = this.opts.capture;
		if (this.opts.multiple) 
			this.dom_element.multiple = true;
	}
	setValue(v){
		this.value = v;
	}
}

class UiCheck extends UiType {
	static uitype = 'check';
	constructor(opts){
		super(opts);
		UiCheck.prototype.update(Layout.prototype);
		this.add_widget = Layout.prototype.add_widget.bind(this);
		this.create('div');
		this.dom_element.style.width = 'auto';
		this.dom_element.style.height = 'auto';
		var state = 'unchecked';
		if (opts.value){
			state = 'checked';
		}
		this.ms_icon = new MultipleStateIcon({
			state:state,
			urls:{
				checked:bricks_resource('imgs/checkbox-checked.png'),
				unchecked:bricks_resource('imgs/checkbox-unchecked.png')
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

class UiCheckBox extends UiType {
	static uitype='checkbox';
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
		this.valueField = opts.valueField || 'value';
		this.textField = opts.textField || 'text';
		this.value = this.opts.value || this.opts.defaultValue||[];
		if (! Array.isArray(this.value)){
			this.value = [ this.value ];
		}
		this.create('fieldset');
		this.set_fontsize();
		this.el_legend = this._create('legend');
		var label = this.opts.label||this.opts.name;
		this.el_legend.innerText = bricks_app.i18n._(label);
		if (this.opts.dataurl){
			schedule_once(this.load_data_onfly.bind(this), 0.01);
		} else {
			this.data = opts.data;
			this.build_checkboxs();
		}
	}
	build_checkboxs(){
		var data = this.data;
		this.input_boxs = [];
		for (var i=0; i<data.length;i++){
			var hbox = new HBox({height:"auto",width:"100%"});
			var opts = {}
			var value = data[i][this.valueField];
			if (this.value == value){
				opts.value = true;
			}
			var check = new UiCheck(opts);
			var otext = data[i][this.textField];
			var txt = new Text({
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
		var data = await jcall(this.opts.dataurl, {
					"method":this.opts.method||'GET',
					"params":this.opts.params});
		this.data = data;
		this.build_checkboxs();
	}
	set_value_from_input(event){
		event.stopPropagation();
		var e = event.target;
		if (e.state=='checked'){
			this.value.push(e.value);
		} else {
			this.value.remove(e.value)
		}
		var o = {};
		o[this.name] = this.value;
		this.dispatch('changed', o);
	}
	resultValue(){
		return this.value;
	}
	setValue(v){
		if (Array.isArray(v)){
			this.value = v;
		} else {
			this.value = [v];
		}
		for (var i=0; i<this.input_boxs.length; i++){
			if (this.value.includes(this.data[i][this.valueField])){
				this.input_boxs[i].setValue(true);
			} else {
				this.input_boxs[i].setValue(false);
			}
		}
	}
}

class UiDate extends UiStr {
	static uitype='date';
	/* 
	{
		max_date:
		min_date:

	*/
	constructor(options){
		super(options);
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
}

class UiText extends UiType {
	static uitype='text';
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
		super(opts);
		this.create('textarea');
		this.build();
		this.sizable();
		this.set_fontsize();
	}
	build(){
		var e = this.dom_element;
		e.id = e.name = this.opts.name;
		e.rows = this.opts.rows || 5;
		e.cols = this.opts.cols || 40;
		// this.setValue(this.opts.value || this.opts.defaultvalue || '');
		this.reset();
		this.bind('input', this.set_value_from_input.bind(this))
	}
	set_value_from_input(event){
		this.value = this.dom_element.innerText;
	}
	resultValue(){
		return this.value;
	}
	setValue(v){
		this.value = v;
		this.dom_element.innerText = '';
		this.dom_element.innerText = v;
		debug('UiText: v=', v);
	}
	reset(){
		var v = this.opts.value || this.opts.defaultvalue||'';
		this.setValue(v);
	}
}

class UiCode extends UiType {
	/*
	{
		name:
		value:
		valueField:
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
	static uitype='code';
	constructor(opts){
		super(opts);
		this.create('select');
		this.data = this.opts.data;
		this.build();
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
	async get_data(event){
		var params = this.opts.params;
		if(event){
			params.update(event.params);
		}
		var d = await jcall(this.opts.dataurl,
			{
				method:this.opts.method || 'GET',
				params : params
			});
		this.data = d;
		this.build_options(d);
	}
	build_options(data){
		var e = this.dom_element;
		e.replaceChildren();
		var v = this.opts.value || this.opts.defaultvalue;
		this.value = v;
		this.option_widgets = {};
		for (var i=0; i<data.length; i++){
			var o = document.createElement('option');
			o.value = data[i][this.opts.valueField||'value'];
			o.innerText = bricks_app.i18n._(data[i][this.opts.textField||'text']);
			this.option_widgets[o.value] = o;
			if (o.value == v){
				o.selected = true;
			}
			e.appendChild(o);
			this.sizable_elements.push(o);
		}
		this.bind('input', this.set_value_from_input.bind(this))
		this.sizable();
		this.set_fontsize();
	}
	set_value_from_input(event){
		for (var i=0; i<this.option_widgets.length; i++){
			if (this.option_widgets[i].checked){
				this.value = this.option_widgets[i].value;
			}
		}
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

class _Input {
	constructor(){
		this.uitypes = [];
	}

	register(name, Klass){
		if (! Klass){
			console.log('Klass not defined', name);
			return;
		}
		if (! Klass.uitype){
			console.log('uitype of Klass not defined', name);
			return;
		
		}
		Factory.register(name, Klass);
		this.uitypes[Klass.uitype] = Klass;
	}
	factory(options){
		var klass = this.uitypes.get(options.uitype);
		if (klass){
			console.log('create input for:', options.uitype, '......', klass);
			return new klass(options);
			console.log('create input for:', options.uitype, 'XXXXXX');
		}
		console.log('create input for:', options.uitype, 'failed');
		return null;
	}
}

class UiAudio extends UiStr {
	static uitype = 'audio';
	constructor(opts){
		super(opts);
		this.autoplay = opts.autoplay;
		this.readonly = opts.readonly;
		this.icon = new Icon({
			url: bricks_resource('imgs/right_arrow.png')});
		this.add_widget(this.icon);
		this.icon.bind('click', this.play_audio.bind(this));
		this.player = new Audio({
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
	play_audio(){
		if(this.value!=this.player.src){
			this.player.stop();
			this.player.set_source(this.value);
			this.player.play();
			return
		}
		this.player.toggle_play();
		this.btn.dispatch('click');
	}
}
class UiVideo extends UiStr {
	static uitype = 'video';
	constructor(opts){
		super(opts);
		this.autoplay = opts.autoplay;
		this.readonly = opts.readonly;
		this.icon = new Icon({
			url: bricks_resource('imgs/right_arrow.png')});
		this.add_widget(this.icon);
		this.icon.bind('click', this.play_audio.bind(this));
		this.player = new VideoPlayer({
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
	play_audio(){
		if(this.value!=this.player.src){
			this.player.stop();
			this.player.set_source(this.value);
			this.player.play();
			return
		}
		this.player.toggle_play();
		this.btn.dispatch('click');
	}
}
var Input = new _Input();
Input.register('UiStr', UiStr);
Input.register('UiTel', UiTel);
Input.register('UiDate', UiDate);
Input.register('UiInt', UiInt);
Input.register('UiFloat', UiFloat);
Input.register('UiCheck', UiCheck);
Input.register('UiCheckBox', UiCheckBox);
Input.register('UiEmail', UiEmail);
Input.register('UiFile', UiFile);
Input.register('UiCode', UiCode);
Input.register('UiText', UiText);
Input.register('UiPassword', UiPassword);
Input.register('UiAudio', UiAudio);
Input.register('UiVideo', UiVideo);
