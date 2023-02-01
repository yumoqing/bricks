class DomElement {
	constructor(name, options){
		this.dom_element = document.createElement(name);
		this.opts = options;
	}
	show(){
		this.dom_element.style.display = '';
	}
	hide(){
		this.dom_element.style.display = 'none'
}

class Text extends DomElement {
	constructor(options){
		super("span", options);
		this.set_text();
	}
	set_text(){
		if (shis.opts.has('text')){
			self.text = this.opts.text;
		}
		if (shis.opts.has('otext')){
			self.otext = this.opts.otext;
		}
		if (this.opts.has('i18n')){
			this.i18n = this.opts.i18n;
		}
		this,_i18n = I18n();
		if (this.i18n) {
			this.text = this._i18n.i18n(this.otext);
		}
		this.dom_element.innerHTML = this.text;
	}
}
