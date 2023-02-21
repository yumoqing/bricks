class UiType extends JsWidget {
	constructor(opts){
		super(opts);
		this.name = opts.name;
		this.value = '';
	}
	getValue(){
		return {this.name:this.value};
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
	}
}

class UtStr  extends UiType {
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
	}
	create(tagname){
		var el = InputWidget.prototype._create.bind(this)(tagname);
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
		if (this.opts.tip){
			el.placeholder = bricks_app.i18n._(this.opts.tip);
		el.addEventListener('focus', this.onfocus.bind(this));
		el.addEventListener('blur', this.onblur.bind(this));
		el.addEventListener('change', this.set_value_from_input.bind(this))
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
		this.value = e.value;
		this.dispatch('changed', {this.name:this.value});
	}
	setValue(v){
		this.value = v;
		this.dom_element.value = '' + this.value;
	}
}

class UtInt  extends UiStr {
	/* 
	{
		length:
	}
	*/
	constructor(options){
		super();
		el.style.textAlign = 'right';
		this.dom_element.type = 'number';
	}
	getValue(){
		return {this.name:parseInt(this.value)};
	}
	setValue(v){
		this.value = '' + v;
	}

}
class UtFloat  extends UiInt {
	/* 
	{
		dec_len:
	}
	*/
	constructor(options){
		super();
		var dec_len = this.opts.dec_len || 2;
		var step = 1;
		for (var i=0; i<dec_len; i++)
			step = step / 10;
		this.dom_element.step = step;
	}
	getValue(){
		return {this.name:parseInt(this.value)};
	}
	setValue(v){
		this.value = '' + v;
	}
}
class UtTel extends UtStr {
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
	}
}

class UtEmail extends UtStr {
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

class UtFile extends UtStr {
	/*
	{
		accept:
		capture:"user" or "environment"
	}
	*/
	constructor(opts){
		super(opts);
		this.dom_element.type = 'file';
		if 
		if (this.opts.accept)
			this.dom_element.accept = this.opts.accept;
		if (this.opts.capture)
			this.dom_element.capture = this.opts.capture;
	}
}

class UtCheckBox extends UtSr {
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
		this.el_legend = this._create('legend');
		var label = this.opts.label||this.opts.name;
		this.el_legend.innerTEXT = bricks_app.i18n._(label);
		if (this.opts.dataurl){
			schedule_once(this.load_data_onfly.bind(this), 0.01);
		} else {
			build_checkboxs(this.opts.data);
		}
	}
	build_checkboxs(data){
		this.input_boxs = [];
		this.value = this.opts.value || this.opts.defaultValue||[];
		if (! Array.isArray(this.value){
			this.value = [ this.value ];
		}
		for (var i=0; i<data.length;i++){
			var div = this._create('div');
			this.dom_element.appendChild(div);
			var b = this._create('input');
			b.type = 'checkbox';
			b.id = this.opts.name + i;
			b.name = his.opts.name;
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
	async load_data_onfly(
		var d = {
			url:this.opts.dataurl,
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
		this.dispatch('changed', {this.name:this.value});
	}
	getValue(v){
		return {
			this.name:this.value;
		}
	}
	setValue(v){
		if Array.isArray(v){
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

class UiDate extends UtStr {
	/* 
	{
		max_date:
		min_date:

	*/
	constructor(options){
		super(options);
		this.opts_setup();
	}
	this.opts_setup(){
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

Factory.register('UtStr', UtStr);
Factory.register('UtTel', UtTel);
Factory.register('UtDate', UiDate);
Factory.register('UtInt', UtInt);
Factory.register('UtFloat', UtFloat);
Factory.register('UtCheckBox', UtCheckBox);
Factory.register('UtDate', UtDate);
Factory.register('UtEmail', UtEmail);
