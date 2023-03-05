class Image extends JsWidget {
	/* 
	{
		source:
		height:
		width:
	}
	*/
	constructor(opts){
		super(opts);
		this.opts = opts;
		this.create('img');
		this.options_parse();
	}
	options_parse(){
		if (this.opts.hasOwnProperty('source')){
			this.set_source(this.opts.source);
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
	set_source(url){
		this.source = url;
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
}

class BlankIcon extends JsWidget {
	constructor(opts){
		super(opts);
		this.create('div');
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
}

Factory.register('Image', Image);
Factory.register('Icon', Icon);
Factory.register('BlankIcon', BlankIcon);
