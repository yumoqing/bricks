class Button extends Layout {
	/*
		orientation:
		height:100%,
		width:100%,
		item_size:
		icon:
		text:
		css:
	*/


	constructor(opts){
		super(opts);
		this.create('button');
		this.opts_setup();
		console.trace();
	}
	opts_setup(){
		var w;
		if (this.opts.orientation && this.opts.orientation == 'horizontal'){
			w = new HBox({});
			this.orient = 'h';
		} else {
			w = new VBox({});
			this.orient = 'v';
		}
		w.set_width('100%');
		w.set_height('100%');
		if (this.opts.css){
			this.set_css(this.opts.css);
		}
		var item_size = this.opts.item_size || '30px';
		if (this.opts.icon){
			var icon = new Image({url:this.opts.icon})
			icon.set_width(item_size);
			icon.set_height(item_size);
			if (this.orient == 'v')
				icon.h_center();
			w.add_widget(icon);
		}
		if (this.opts.text){
			var txt = new Text({
						text:this.opts.text, 
						fontsize:item_size,	
						i18n:true})
			txt.set_height(item_size);
			w.add_widget(txt);
		}
		this.add_widget(w);
	}
}

Factory.register('Button', Button);
