
class JsWidget {
	dom_element = null;
	constructor(options){
		if (!options){
			options = {}
		}
		this.baseURI = options.baseURI;
		this.opts = options;
		this.create();
		this.dom_element.bricks_widget = this;
		this.opts_set_style();
		if (this.opts.tooltip){
			this.dom_element.tooltip = this.opts.tooltip;
		}
		this._container = false;
		this.parent = null;
		this.sizable_elements = [];
		if (options.css){
			this.set_css(options.css);
		}
		if (options.csses){
			this.set_csses(options.csses);
		}
	}
	create(){
		this.dom_element = document.createElement('div');
	}
	opts_set_style(){
		var keys = [
			"width",
			"x",
			"y",
			"height",
			"margin",
			"padding",
			"align",
			"textAlign",
			"overflowY",
			"overflowX",
			"overflow",
			"color"
		]
		var mapping_keys = {
			"z-index":"zIndex",
			"overflow-x":"overflowX",
			"opveflow-y":"overflowY",
			"bgcolor":"backgroundColor"
		};
		var mkeys = Object.keys(mapping_keys);
		var style = {};
		var okeys = Object.keys(this.opts);
		for (var k=0; k<okeys.length; k++){
			if (keys.find( i => i ==okeys[k])){
				style[okeys[k]] = this.opts[okeys[k]];
			}
			if (mkeys.find( i => i ==okeys[k])){
				var mk = mapping_keys[okeys[k]];
				style[mk] = this.opts[okeys[k]];
			}
			this[okeys[k]] = this.opts[okeys[k]];
		}
		this.dom_element.style.update(style);
		if (this.opts.css){
			this.set_css(this.opts.css);
		}
		
	}
	sizable(){
		bricks_app.text_ref(this);
	}
	change_fontsize(ts){
		ts = convert2int(ts);
		if (! this.specified_fontsize){
			var rate = this.rate || 1;
			ts = ts * rate;
			ts = ts + 'px';
			this.dom_element.style.fontSize = ts;
			for(var i=0;i<this.sizable_elements.length;i++){
				this.sizable_elements[i].style.fontSize = ts;
			}
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
		fontsize = convert2int(fontsize);
		var rate = this.rate || 1;
		fontsize = rate * fontsize;
		fontsize = fontsize + 'px';
		this.dom_element.style.fontSize = fontsize;
		for(var i=0;i<this.sizable_elements.length;i++){
			this.sizable_elements[i].style.fontSize = fontsize;
		}
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
		if (typeof(width) == 'number'){
			width = width + 'px';
		}
		this.dom_element.style.width = width;
	}
	set_height(height){
		if (typeof(height) == 'number'){
			height = height + 'px';
		}
		this.dom_element.style.height = height;
	}
	set_style(k, v){
		this.dom_element.style[k] = v;
	}
	set_csses(csses, remove_flg){
		var arr = csses.split(' ');
		arr.forEach(c =>{
			this.set_css(c, remove_flg);
		})
	}
	set_css(css, remove_flg){
		if (!remove_flg){
			this.dom_element.classList.add(css);
		} else {
			this.dom_element.classList.remove(css);
		}
	}
	set_cssObject(cssobj){
		this.dom_element.style.update(cssobj);
	}
	is_container(){
		return this._container;
	}
	_create(tagname){
		return document.createElement(tagname);
	}
	set_id(id){
		this.dom_element.id = id;
	}
	set_baseURI(url){
		this.baseURI = url;
	}
	absurl(url){
		console.log('this.baseURI=', this.baseURI);
		if (this.baseURI){
			return absurl(url, this);
		}
		return url
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
		rate:
		halign:
		valign:
		color:
		bgtcolor:
		css
	}
	*/
	constructor(options){
		super(options);
		this.opts = options;
		this.rate = this.opts.rate || 1;
		this.specified_fontsize = false;
		this.set_attrs();
		this.dom_element.style.fontWeight = 'normal';
		this.sizable();
	}
	set_attrs(){
		if (this.opts.hasOwnProperty('text')){
			this.text = this.opts.text;
		}
		if (this.opts.hasOwnProperty('otext')){
			this.otext = this.opts.otext;
		}
		if (this.opts.hasOwnProperty('i18n')){
			this.i18n = this.opts.i18n;
		}
		this._i18n = new I18n();
		if (this.i18n && this.otext) {
			this.text = this._i18n._(this.otext);
		}
		this.dom_element.innerHTML = this.text;
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
		this.dom_element.style.fontWeight = 'bold';
	}
}

class Title2 extends TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title2';
		this.set_fontsize();
		this.dom_element.style.fontWeight = 'bold';
	}
}

class Title3 extends TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title3';
		this.set_fontsize();
		this.dom_element.style.fontWeight = 'bold';
	}
}

class Title4 extends TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title4';
		this.set_fontsize();
		this.dom_element.style.fontWeight = 'bold';
	}
}

class Title5 extends TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title5';
		this.set_fontsize();
		this.dom_element.style.fontWeight = 'bold';
	}
}

class Title6 extends TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title6';
		this.set_fontsize();
		this.dom_element.style.fontWeight = 'bold';
	}
}

Factory.register('Text', Text);
Factory.register('Title1', Title1);
Factory.register('Title2', Title2);
Factory.register('Title3', Title3);
Factory.register('Title4', Title4);
Factory.register('Title5', Title5);
Factory.register('Title6', Title6);

