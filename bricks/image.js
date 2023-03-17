class Image extends JsWidget {
	/* 
	{
		url:
		height:
		width:
	}
	*/
	constructor(opts){
		super(opts);
		this.opts = opts;
		this.options_parse();
	}
	create(){
		this.dom_element = document.createElement('img');
	}
	options_parse(){
		if (this.opts.hasOwnProperty('url')){
			this.set_url(this.opts.url);
		}
		if (this.opts.hasOwnProperty('width')){
			this.width = this.opts.width;
			this.dom_element.style.width = this.width;
		}
		if (this.opts.hasOwnProperty('height')){
			this.height = this.opts.height;
			this.dom_element.style.height = this.height;
		}
	}
	set_url(url){
		this.url = url;
		this.dom_element.src = url;
	}
}

class Icon extends Image {
	constructor(opts){
		super(opts);
		this.opts.width = bricks_app.charsize;
		this.opts.height = bricks_app.charsize;
		this.ctype = 'text';
		this.sizable();
		this.set_fontsize();
	}
	change_fontsize(ts){
		var siz = bricks_app.charsize;
		this.set_width(siz);
		this.set_height(siz);
	}
	set_fontsize(){
		var siz = bricks_app.charsize;
		this.set_width(siz);
		this.set_height(siz);
	}
	set_width(siz){
		this.dom_element.width = siz;
	}
	set_height(siz){
		this.dom_element.height = siz;
	}
}

class BlankIcon extends JsWidget {
	constructor(opts){
		opts.width = bricks_app.charsize;
		opts.height = bricks_app.charsize;
		super(opts);
		this.ctype = 'text';
		this.sizable();
		this.set_fontsize();
	}
	change_fontsize(ts){
		var siz = bricks_app.charsize + 'px';
		this.set_width(siz);
		this.set_height(siz);
	}
	set_fontsize(){
		var siz = bricks_app.charsize + 'px';
		this.set_width(siz);
		this.set_height(siz);
	}
	set_width(siz){
		this.dom_element.width = siz;
		this.dom_element.style.width = siz;
	}
	set_height(siz){
		this.dom_element.height = siz;
		this.dom_element.style.height = siz;
	}
}

Factory.register('Image', Image);
Factory.register('Icon', Icon);
Factory.register('BlankIcon', BlankIcon);
