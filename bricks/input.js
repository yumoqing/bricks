class InputWidget extends JsWidget {
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
}

class StrInput extends InputWidget {
	/*
	{
		name:
		value:
		defaultValue:
		align:"left", "center", "right"
		maxlength:
		minlength:
		tip:
		readonly:
		required:
	}
	*/
	disabled(f){
		this.input_el.disabled = f;
	}
	readonly(f){
		this.input_el.readonly = f;
	}
	required(f){
		this.input_el.required = f;
	}
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
		if (this.opts.hasOwnProperty('maxlength'))
			el.maxlength = this.opts.maxlength;
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
		this.value = e.value;
		this.dispatch('changed', {this.name:this.value});
	}
	setValue(v){
		this.value = v;
		this.dom_element.value = '' + this.value;
	}
}

Factory.register('StrInput', StrInput);
