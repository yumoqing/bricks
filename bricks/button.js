class Button extends Layout {
	/*
		orientation:
		height:100%,
		width:100%,
		item_rate:
		tooltip:
		color:
		nonepack:
		name:
		icon:
		label:
		css:
		action:{
			target:
			datawidget:
			datamethod:
			datascript:
			dataparams:
			rtdata:
			actiontype:
			...
		}
	*/


	constructor(opts){
		super(opts);
		var style = {
			display:"flex",
			justifyContent:"center",
			textAlign:"center",
			alignItem:"center",
			width:"auto",
			height:"auto",
		};
		if (opts.nonepack){
			style.padding = '0px';
			style.border = '0';
		} else {
			style.padding = '0.5rem';
		}
		if (this.opts.orientation == 'horizontal'){
			style.flexDirection = 'rows';
			this.orient = 'h';
		} else {
			style.flexDirection = 'column';
			this.orient = 'v';
		}
		this.item_rate = opts.item_rate || 1;
		this.set_id(this.opts.name);
		this.opts_setup();
		extend(this.dom_element.style, style);
	}
	create(){
		this.dom_element = document.createElement('button');
	}
	opts_setup(){
		var item_size = this.opts.item_size || bricks_app.charsize;
		if (this.opts.icon){
			var icon = new Icon({
				rate:this.item_rate,
				url:this.opts.icon
			})
			this.add_widget(icon);
			icon.bind('click', this.target_clicked.bind(this));
		}
		if (this.opts.label){
			var opts = {
						rate:this.item_rate,
						color:this.opts.color,
						bgcolor:this.opts.bgcolor,
						otext:this.opts.label, 
						i18n:true};
			var txt = new Text(opts);
			this.add_widget(txt);
			txt.bind('click', this.target_clicked.bind(this));
		}
	}
	target_clicked(event){
		console.log('target_clicked() .... called ');
		event.stopPropagation();
		this.dispatch('click', this.opts);
		if (this.opts.action){
			if (this.opts.debug){
				console.log('debug:opts=', this.opts);
			}
		}
	}
}

Factory.register('Button', Button);
