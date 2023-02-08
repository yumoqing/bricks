
class JsWidget {
	dom_element = null;
	constructor(options){
		this.opts = options;
	}
	create(tagname){
		this.dom_element = document.createElement(tagname);
	}
	set_id(id){
		this.dom_element.id = id;
	}
	show(){
		this.dom_element.style.display = '';
	}
	hide(){
		this.dom_element.style.display = 'none'
	}
	bind(eventname, handler){
		this.dom_element.addEventListener(eventname, handler);
	}
}


class Text extends JsWidget {
	constructor(options){
		super(options);
		this.opts = options;
		this.create("span");
		this.set_attrs();
	}
	set_attrs(){
		if (this.opts.hasOwnProperty('text')){
			this.text = this.opts.text;
		}
		if (this.opts.hasOwnProperty('otext')){
			this.otext = this.opts.otext;
			console.log('otext=', this.opts.otext, this.otext);
		}
		if (this.opts.hasOwnProperty('i18n')){
			this.i18n = this.opts.i18n;
		}
		this._i18n = new I18n();
		if (this.i18n && this.otext) {
			this.text = this._i18n._(this.otext);
			console.log('otext=', this.otext, 'text=', this.text);
		}
		this.dom_element.innerHTML = this.text;
		console.log('text=', this.text, 'ops=', this.opts);
	}
}

class Title1 extends Text {
	constructor(options){
		super(options);
		this.opts = options;
		this.create('H1');
		this.set_attrs();
	}
}

class Title2 extends Text {
	constructor(options){
		super(options);
		this.opts = options;
		this.create('H2');
		this.set_attrs();
	}
}

class Title3 extends Text {
	constructor(options){
		super(options);
		this.opts = options;
		this.create('H3');
		this.set_attrs();
	}
}

class Title4 extends Text {
	constructor(options){
		super(options);
		this.opts = options;
		this.create('H4');
		this.set_attrs();
	}
}

class Title5 extends Text {
	constructor(options){
		super(options);
		this.opts = options;
		this.create('H5');
		this.set_attrs();
	}
}

class Title6 extends Text {
	constructor(options){
		super(options);
		this.opts = options;
		this.create('H6');
		this.set_attrs();
	}
}

Factory.register('Text', Text);
Factory.register('Title1', Title1);
Factory.register('Title2', Title2);
Factory.register('Title3', Title3);
Factory.register('Title4', Title4);
Factory.register('Title5', Title5);
Factory.register('Title6', Title6);

