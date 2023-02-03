class Image extends DomElement {
	constructor(opts){
		this.opts = opts;
		this.create('img');
		this.options_parse();
	}
	options_parse(){
		if (opts.hasOwnProperty('source')){
			this.source = this.opts.source;
			this.dom_element.src = this.source;
		}
		if (opts.hasOwnProperty('width')){
			this.width = this.opts.width;
			this.dom_element.width = this.width;
		}
		if (opt.hasOwnProperty('height')){
			this.height = this.opts.height;
			this.dom_element.height = this.height;
		}
	}
}
