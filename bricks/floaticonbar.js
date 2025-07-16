var bricks = window.bricks || {};

bricks.IconBar = class extends bricks.HBox {
	/*
	{
		margin:
		rate:
		tools:[
			{
				name:
				icon:
				rate:
				dynsize:
				tip
			}
		]
	}
	*/	
	constructor(opts){
		if (! opts.cheight){
			opts.cheight = 2;
		}
		if (! opts.rate){
			opts.rate = 1;
		}
		super(opts);
		this.set_css('childrensize');
		this.height_int = 0;
		var tools = this.opts.tools;
		for (var i=0;i<tools.length;i++){
			var opts_i = bricks.extend({}, tools[i]);
			if (!opts_i.rate){
				opts_i.rate = this.rate;
			}
			opts_i.cheight = opts.cheight;
			opts_i.cwidth = opts.cheight;
			opts_i.dynsize = true;
			var w = this.build_item(opts_i);
			w.set_style('margin-left', this.opts.margin || '10px');
			w.set_style('margin-right', this.opts.margin || '10px');
			if (tools[i].name){
				w.set_id(tools[i].name);
			}
			w.set_style('cursor', 'pointer');
			this.add_widget(w);
		}
		this.set_style('alignItems', 'center');
		// this.set_style('justifyContent', 'center');
	}
	build_item(opts){
		var rate = opts.rate || this.opts.rate || 1;
		var h = bricks.app.charsize * rate * opts.cheight;
		if (this.height_int < h){
			this.height_int = h;
		}
		if (opts.name == 'blankicon'){
			return new bricks.BlankIcon({
				rate:rate,
				cheight:opts.cheight,
				cwidth:opts.cwidth,
				dynsize:opts.dynsize||true
			});
		}
		opts.url = opts.icon;
		var w = new bricks.Svg(opts);
		w.bind('click', this.regen_event.bind(this, opts));
		return w;
	}
	regen_event(desc, event){
		this.dispatch(desc.name, desc);
		this.dispatch('command', desc);
		event.preventDefault();
		event.stopPropagation();
	}
}

bricks.IconTextBar = class extends bricks.IconBar {
	build_item(opts){
		var rate = opts.rate || this.opts.rate || 1;
		var o = {
			width:'auto',
			height:'auto',
			cheight:1.3 * rate
		};
		if (opts.tip){
			o.tip = opts.tip;
		}
		var box = new bricks.HBox(o);
		if (opts.icon){
			var desc = {
				url:opts.icon,
				rate:opts.rate || rate,
				dynsize:opts.dynsize||true
			};
			var w = new bricks.Svg(desc);
			box.add_widget(w);
		}
		if (opts.label){
			var desc = {
				otext:opts.label,
				i18n:true,
				wrap:true,
				haligh:'left',
				rate:opts.rate || rate,
				dynsize:opts.dynsize||true
			};
			var w = new bricks.Text(desc);
			box.add_widget(w);
		}
		var h = bricks.app.charsize * rate;
		if (this.height_int < h){
			this.height_int = h;
		}
		box.bind('click', this.regen_event.bind(this,opts));
		return box;
	}
}
bricks.FloatIconBar = class extends bricks.HBox {
	constructor(opts){
		super(opts);
		this.float_w = new bricks.Svg({url:bricks_resource('imgs/float-out.png')});
		this.float_w.bind('mousemove', this.show_icons.bind(this));
		this.add_widget(this.float_w);
		this.icons_box = this.build_bar(opts);
		this.add_widget(this.icons_box);
		this.hide_icons()
		this.set_style('height', this.icons_box.height_int + 'px')
		bricks.Body.bind('click', this.hide_icons.bind(this));
	}
	build_bar(opts){
		return new bricks.IconBar(opts);
	}
	show_icons(){
		this.icons_box.set_style('display', 'flex');
	}
	hide_icons(){
		this.icons_box.set_style('display', 'none');
	}
}

bricks.FloatIconTextBar = class extends bricks.FloatIconBar {
	build_bar(opts){
		return new bricks.IconTextBar(opts);
	}
}

bricks.Factory.register('IconBar', bricks.IconBar);
bricks.Factory.register('IconTextBar', bricks.IconTextBar);
bricks.Factory.register('FloatIconBar', bricks.FloatIconBar);
bricks.Factory.register('FloatIconTextBar', bricks.FloatIconTextBar);
