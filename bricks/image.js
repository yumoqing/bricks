class Image extends JsWidget {
	constructor(opts){
		super();
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
		thjis.dom_element.src = url;
	}
}

Factory.register('Image', Image);
