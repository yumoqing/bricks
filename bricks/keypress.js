var bricks = window.bricks || {};

bricks.KeyPress = class extends bricks.VBox {
	constructor(opts){
		super(opts);
		bricks.app.bind('keydown', this.key_handler.bind(this));
	}
	key_handler(event){
		var key = event.key;
		if (!key) return;
		this.clear_widgets();
		var w = new bricks.Text({text:'key press is:' + key});
		this.add_widget(w)
	}
}

bricks.Factory.register('KeyPress', bricks.KeyPress);

