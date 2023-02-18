
class JsWidget {
	dom_element = null;
	constructor(options){
		this.opts = options;
		this._container = false;
		this.parent = null;
	}
	is_container(){
		return this._container;
	}
	create(tagname){
		this.dom_element = document.createElement(tagname);
		this.dom_element.bricks_widget = this;
	}
	_create(tagname){
		return document.createElement(tagname);
	}
	set_id(id){
		this.dom_element.id = id;
	}
	set_baseURL(url){
		this.baseURL = url;
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
	unbind(eventname, handler){
		this.dom_element.removeEventListener(eventname, handler);
	}
	dispatch(eventname, params){
		var e = new Event(eventname);
		e.params = params;
		this.dom_element.dispatchEvent(e);
	}
}


class Text extends JsWidget {
	/* {
		otext:
		i18n:
		fontsize:
		halign:
		valign:
		css
	}
	*/
	constructor(options){
		super(options);
		this.opts = options;
		this.create("div");
		this.set_attrs();
		bricks_app.text_ref(this);
		this.ctype = 'text';
	}
	set_fontsize(){
		var fontsize;
		if (this.opts.fontsize){
			fontsize = this.opts.fontsize;
		} else {
			fontsize = bricks_app.get_textsize(this.ctype);
		}
		this.dom_element.style.fontSize = fontsize;
		if (this.ctype != 'text'){
			this.dom_element.style.fontWeight = 'bold';
		}
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
		this.set_fontsize();
	}
	set_i18n_text(){
		if ( !this.otext){
			return;
		}
		if (! this.i18n){
			return;
		}
		this.text = this._i18n._(this.otext);
		this.dom_element.innerHTML = this.text;
	}
		
}

class Title1 extends Text {
	constructor(options){
		super(options);
		this.ctype = 'Title1';
		this.opts = options;
		this.set_attrs();
	}
}

class Title2 extends Text {
	constructor(options){
		super(options);
		this.ctype = 'Title2';
		this.opts = options;
		this.set_attrs();
	}
}

class Title3 extends Text {
	constructor(options){
		super(options);
		this.ctype = 'Title3';
		this.opts = options;
		this.set_attrs();
	}
}

class Title4 extends Text {
	constructor(options){
		super(options);
		this.ctype = 'Title4';
		this.opts = options;
		this.set_attrs();
	}
}

class Title5 extends Text {
	constructor(options){
		super(options);
		this.ctype = 'Title5';
		this.opts = options;
		this.set_attrs();
	}
}

class Title6 extends Text {
	constructor(options){
		super(options);
		this.ctype = 'Title6';
		this.opts = options;
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

