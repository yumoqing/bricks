var bricks = window.bricks || {};

bricks.Message = class extends bricks.PopupWindow {
	/* 
	{
		title:
		message:
	}
	*/
	constructor(opts){
		opts.auto_open = true;
		super(opts);
		this.create_message_widget();
		this.set_css('message');
	}
	create_message_widget(){
		var w = new bricks.Filler();
		this.add_widget(w);
		var w1 = new bricks.VScrollPanel({});
		w.add_widget(w1);
		var t = new bricks.Text({otext:this.opts.message,
					wrap:true,
					halign:'middle',
					i18n:true});
		w1.add_widget(t);
	}
}

bricks.Error = class extends bricks.Message {
	constructor(opts){
		super(opts);
		this.set_css('error');
	}
}

bricks.show_error = function(opts){
	opts.cheight = opts.cheight || 9;
	opts.cwidth = opts.cwidth || 16;
	var w = new bricks.Error(opts);
	w.open();
}

bricks.show_message = function(opts){
	opts.cheight = opts.cheight || 9;
	opts.cwidth = opts.cwidth || 16;
	var w = new bricks.Message(opts);
	w.open();
}

bricks.Factory.register('Message', bricks.Message);
bricks.Factory.register('Error', bricks.Error);
