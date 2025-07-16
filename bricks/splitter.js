
var bricks = window.bricks || {};
bricks.Splitter = class extends bricks.JsWidget {
	constructor(ops){
		super({});
	}
	create(){
		this.dom_element = this._create('hr')
	}
}
bricks.Factory.register('Splitter', bricks.Splitter);
