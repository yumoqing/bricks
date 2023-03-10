class Button extends Layout {
	/*
		orientation:
		height:100%,
		width:100%,
		item_size:
		name:
		icon:
		text:
		css:
	*/


	constructor(opts){
		super(opts);
		this.create('button');
		var style = {
			display:"flex",
			justifyContent:"center",
			textAlign:"center",
			alignItem:"center",
			width:"auto",
			height:"auto",
			padding:"0.5rem"
		};
		if (this.opts.orientation == 'horizontal'){
			style.flexDirection = 'rows';
			this.orient = 'h';
		} else {
			style.flexDirection = 'column';
			this.orient = 'v';
		}
		this.set_id(this.opts.nmae);
		this.opts_setup();
		this.dom_element.style.update(style);
	}
	opts_setup(){
		if (this.opts.css){
			this.set_css(this.opts.css);
		}
		var item_size = this.opts.item_size || bricks_app.charsize;
		if (this.opts.icon){
			var icon = new Icon({
				url:this.opts.icon
			})
			this.add_widget(icon);
			icon.bind('click', this.target_clicked.bind(this));
		}
		if (this.opts.text){
			var txt = new Text({
						height:item_size,
						width:0,
						otext:this.opts.text, 
						fontsize:item_size,	
						i18n:true})
			this.add_widget(txt);
			txt.bind('click', this.target_clicked.bind(this));
		}
	}
	target_clicked(event){
		console.log('target_clicked() .... called ');
		event.stopPropagation();
		this.dispatch('click', this.opts);
	}
}

Factory.register('Button', Button);
