var bricks = window.bricks || {};
bricks.Iframe = class extends bricks.Layout {
	constructor(opts){
		opts.height = opts.height || '100%';
		super(opts);
		this.dom_element.src = opts.url;
	}
	create(){
		this.dom_element = document.createElement('iframe');
	}
}

bricks.NewWindow = class extends bricks.JsWidget {
	constructor(opts){
		super(opts);
		window.open(opts.url);
	}
}

bricks.Factory.register('NewWindow', bricks.NewWindow);
bricks.Factory.register('Iframe', bricks.Iframe);
