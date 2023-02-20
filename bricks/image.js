class Image extends JsWidget {
	constructor(opts){
		super();
		this.opts = opts;
		this.create('img');
		this.options_parse();
	}
	options_parse(){
		if (this.opts.hasOwnProperty('source')){
			this.source = this.opts.source;
			this.dom_element.src = this.source;
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
}

Factory.register('Image', Image);
