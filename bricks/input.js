class UiType extends JsWidget {
	constructor(opts){
		super(opts);
		this.name = this.opts.name;
		this.required = opts.required || false;
		this.ctype = 'text';
		this.value = '';
		this.set_fontsize = Text.prototype.set_fontsize.bind(this);
		this.change_fontsize = Text.prototype.change_fontsize.bind(this);
	}

	getValue(){
		var o = {}
		o[this.name] = this.resultValue();
		return o;
	}
	focus(){
		this.dom_element.focus();
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
	set_value_from_input(event){
		var e = event.target;
		var r = new RegExp(this.pattern);
		if (e.value == ''){
			this.value = '';
		} else {
			if (e.type != 'file'){
				var v = e.value.match(r);
				if (! v || v[0] == ''){
					e.value = this.value;
					return;
				}
				e.value = v[0];
				this.value = v[0];
			} else {
				this.value = e.value;
			}
		}
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
		this.create('fieldset');
		this.set_fontsize();
		this.el_legend = this._create('legend');
		var label = this.opts.label||this.opts.name;
		this.el_legend.innerText = bricks_app.i18n._(label);
		if (this.opts.dataurl){
			schedule_once(this.load_data_onfly.bind(this), 0.01);
		} else {
			this.build_checkboxs(this.opts.data);
		}
	}
	build_checkboxs(data){
		this.input_boxs = [];
		this.value = this.opts.value || this.opts.defaultValue||[];
		if (! Array.isArray(this.value)){
			this.value = [ this.value ];
		}
		for (var i=0; i<data.length;i++){
			var div = this._create('div');
			this.dom_element.appendChild(div);
			var b = this._create('input');
			b.type = 'checkbox';
			b.id = this.opts.name + i;
			b.name = this.opts.name;
			b.value = data[i][this.opts.valueField||'value'];
			if (this.value.indexOf(b.value) >= 0){
				b.checked = true;
			}
			b.addEventListener('change', this.set_value_from_input.bind(this));
			div.appendChild(b);
			var lbl = this._create('label');
			lbl.innerHTML = bricks_app.i18n._(data[i][this.opts.textField||'text']);
			lbl.for = b.id;
			div.appendChild(lbl);
			this.input_boxs.push(b);
			div.appendChild(lbl);
		}
	}
	async load_data_onfly(){
		var data = await jcall(this.opts.dataurl, {
					"method":this.opts.method||'GET',
					"params":this.opts.params});
		this.build_checkboxs(data);
	}
	set_value_from_input(event){
		var e = event.target;
		if (e.checked){
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
			if (this.value.indexOf(this.input_boxs[i].value) >= 0){
				this.input_boxs[i].checked = true;
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
		this.set_fontsize();
		this.build();
	}
	build(){
		var e = this.dom_element;
		e.id = e.name = this.opts.name;
		e.rows = this.opts.rows || 5;
		e.cols = this.opts.cols || 40;
		e.innerText = this.opts.value || this.opts.defaultvalue || '';
		this.value = e.innerText;
		this.bind('input', this.set_value_from_input.bind(this))
	}
	set_value_from_input(event){
		this.value = this.dom_element.innerText;
	}
	resultValue(){
		return this.value;
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
		this.set_fontsize();
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
		}
		this.bind('input', this.set_value_from_input.bind(this))
	}
	set_value_from_input(event){
		var v = this.dom_element.innerText;
		for (var i=0; i<this.option_widgets.length; i++){
			if (this.option_widgets[i].checked){
				this.value = this.option_widgets[i].value;
			}
		}
	}
	resultValue(){
		return this.value;
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

var Input = new _Input();
Input.register('UiStr', UiStr);
Input.register('UiTel', UiTel);
Input.register('UiDate', UiDate);
Input.register('UiInt', UiInt);
Input.register('UiFloat', UiFloat);
Input.register('UiCheckBox', UiCheckBox);
Input.register('UiEmail', UiEmail);
Input.register('UiFile', UiFile);
Input.register('UiCode', UiCode);
Input.register('UiText', UiText);
Input.register('UiPassword', UiPassword);
