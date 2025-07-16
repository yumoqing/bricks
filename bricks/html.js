var bricks = window.bricks || {};

bricks.Html = class extends bricks.JsWidget {
	/*
	{
		html:
	} 
	*/
	constructor(opts){
		super(opts);
		this.dom_element.innerHTML = opts.html;
	}
}

bricks.Factory.register('Html', bricks.Html);
