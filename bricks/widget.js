
class JsWidget {
	dom_element = null;
	constructor(options){
		this.opts = options;
		this._container = false;
		this.parent = null;
	}
	h_center(){
		this.dom_element.style.marginLeft = 'auto';
		this.dom_element.style.marginRight = 'auto';
	}
	h_left(){
		this.dom_element.style.marginLeft = '0px';
		this.dom_element.style.marginRight = 'auto';
	}
	h_right(){
		this.dom_element.style.marginLeft = 'auto';
		this.dom_element.style.marginRight = '0px';
	}
	ht_center(){
		this.dom_element.style.textAlign = 'center';
	}
	ht_left(){
		this.dom_element.style.textAlign = 'left';
	}
	ht_right(){
		this.dom_element.style.textAlign = 'right';
	}
	set_width(width){
		this.dom_element.style.width = width;
	}
	set_height(height){
		this.dom_element.style.height = height;
	}
	set_css(css){
		this.dom_element.classList.add(css);
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


class TextBase extends JsWidget {
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
		this.specified_fontsize = false;
		this.create("div");
		this.set_attrs();
		bricks_app.text_ref(this);
	}
	change_fontsize(ts){
		if (! this.specified_fontsize){
			this.dom_element.style.fontSize = ts;
		}
	}
	set_fontsize(){
		var fontsize;
		if (this.opts.fontsize){
			this.specified_fontsize = true;
			fontsize = this.opts.fontsize;
		} else {
			fontsize = bricks_app.get_textsize(this.ctype);
		}
		this.dom_element.style.fontSize = fontsize;
		if (this.ctype != 'text'){
			this.dom_element.style.fontWeight = 'bold';
		} else {
			this.dom_element.style.fontWeight = 'normal';
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

class Text extends TextBase {
	constructor(opts){
		super(opts);
		this.ctype = 'text';
		this.set_fontsize();
	}
}

class Title1 extends TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title1';
		this.set_fontsize();
	}
}

class Title2 extends TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title2';
		this.set_fontsize();
	}
}

class Title3 extends TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title3';
		this.set_fontsize();
	}
}

class Title4 extends TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title4';
		this.set_fontsize();
	}
}

class Title5 extends TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title5';
		this.set_fontsize();
	}
}

class Title6 extends TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title6';
		this.set_fontsize();
	}
}

Factory.register('Text', Text);
Factory.register('Title1', Title1);
Factory.register('Title2', Title2);
Factory.register('Title3', Title3);
Factory.register('Title4', Title4);
Factory.register('Title5', Title5);
Factory.register('Title6', Title6);

