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
		this.set_id(this.opts.nmae);
		this.opts_setup();
		console.trace();
	}
	set_container_hcss(){
		var e = this.dom_element;
		e.style.display = 'flex';
		e.style.justifyContent = 'center'; /* horizontal alignment */
		e.style.alignItem = 'center'
	}
	set_container_vcss(){
		var e = this.dom_element;
		e.style.display = 'flex';
		e.style.flexDirection = 'column';
		e.style.textAlign = 'center';
		e.style.justifyContent = 'center'; /* horizontal alignment */
		e.style.alignItem = 'center'
	}
	opts_setup(){
		if (this.opts.orientation && this.opts.orientation == 'horizontal'){
			this.set_container_hcss();
			this.orient = 'h';
		} else {
			this.set_container_vcss();
			this.orient = 'v';
		}
		if (this.opts.css){
			this.set_css(this.opts.css);
		}
		var item_size = this.opts.item_size || '30px';
		if (this.opts.icon){
			var icon = new Image({
				url:this.opts.icon,
				height:item_size,
				width:item_size
			})
			icon.set_width(item_size);
			icon.set_height(item_size);
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
