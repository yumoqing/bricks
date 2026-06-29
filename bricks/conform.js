var bricks = window.bricks || {};
bricks.Conform = class extends bricks.PopupWindow {
	constructor(opts){
		opts.timeout = 0;
		opts.auto_open = true;
		super(opts);
		this.create_conform();
	}
	create_conform(){
		var w = new bricks.VBox({width:'100%', height: '100%'});
		this.create_message(w);
		this.create_toolbar(w);
		this.add_widget(w);
	}
	create_message(widget){
		var w = new bricks.Filler();
		widget.add_widget(w);
		var w1 = new bricks.VScrollPanel({});
		w.add_widget(w1);
		var t = new bricks.Text({otext:this.opts.message,
					wrap:true,
					halign:'middle',
					i18n:true});
		w1.add_widget(t);
	}
	create_toolbar(widget){
		var desc = {
			tools:[
				bricks.extend({
					"name":"conform",
					"icon":bricks_resource('imgs/conform.svg'),
					"label":bricks.app.i18n._('Conform')
				}, this.opts.conform||{}),
				bricks.extend({
					"name":"discard",
					"icon":bricks_resource('imgs/cancel.svg'),
					"label":bricks.app.i18n._("Discard")
				}, this.opts.discard||{})
			]
		}
		var w = new bricks.IconTextBar(desc);
		w.bind('conform', this.conform_hndl.bind(this));
		w.bind('discard', this.discard_hndl.bind(this));
		if (!w) return;
		widget.add_widget(w);
	}
	conform_hndl(event){
		this.dismiss();
		this.dispatch('conformed');
	}
	discard_hndl(event){
		this.dismiss();
		this.dispatch('cancelled');
	}
}

bricks.Factory.register('Conform', bricks.Conform);

