var bricks = window.bricks || {};

bricks.DataRow = class extends bricks.HBox {
	/*
	{
		toolbar:[
		]
		fields:[]
		css
		browserfields{
			exclouded:[],
			cwidth:{
				field:10,
				field2:11
			}
		}
		editexclouded:[],
		header_css
	}
	*/
	constructor(opts){
		super(opts);
		this.record_w = null;
	}
	render_header(){
		this.render(true);
	}
	render_data(){
		this.render(false);
	}
	render(header){
		// this.build_toolbar(header);
		if (this.checkField){
			var w;
			if (header){
				w = new bricks.BlankIcon({});
			} else {
				var v = 0
				if (this.user_data){
					v = this.user_data[this.checkField];
				}
				w = new bricks.UiCheck({name:this.checkField,value:v});
				w.bind('changed', this.get_check_state.bind(this));
			}
			this.add_widget(w);
		}
		this.build_fields(header);
	}
	renew(record){
		this.user_data = record;
		this.record_w.clear_widgets();
		this._build_fields(false, this.record_w);
	}
	get_check_state(e){
		var d = e.target.bricks_widget.getValue()
		this.user_data[this.checkField] = d[this.checkField];
		this.dispatch('check_changed', this);
	}
	build_toolbar(header){
		var tools = [];
		if (header){
			if (this.toolbar){
				this.toolbar.tools.forEach(t => {
					tools.push({name:'blankicon'});
				});
			}
		} else {
			if (this.toolbar){
				this.toolbar.tools.forEach(t => {
					tools.push(t);
				});
			}
		}
		var toolbar = bricks.extend({cwidth:2.5}, this.toolbar || {});
		toolbar.tools = tools;
		var w = new bricks.IconBar(toolbar);
		this.add_widget(w);
		this.toolbar_w = w;
		this.event_names = []
		for(var i=0;i<tools.length;i++){
			if (tools[i].name != 'blankicon'){
				this.event_names.push(tools[i].name);
				w.bind(tools[i].name, this.my_dispatch(tools[i].name));
			}
		}
	}
		
	my_dispatch(e){
		this.dispatch(e);
	}
	build_fields(header, cw){
		this.record_w = new bricks.HBox({height:'auto'});
		this.record_w.set_css('childrensize');
		this.add_widget(this.record_w);
		this._build_fields(header, this.record_w);
	}
	_build_fields(header, cw){
		var exclouded = [];
		var cwidths = {};
		if (this.browserfields && this.browserfields.exclouded){
			exclouded = this.browserfields.exclouded;
		}
		if (this.browserfields && this.browserfields.cwidths){
			cwidths = this.browserfields.cwidths;
		}
		if (this.checkField){
			exclouded.push(this.checkField);
		}
		for (var i=0;i<this.fields.length;i++){
			var f = this.fields[i]
			if (exclouded.includes(f.name)){
				continue;
			}
			var opts = bricks.extend({
				margin:'1px'
			}, f);
			if (header || ! this.user_data){
				opts.value = f.label || f.name;
			} else {
				opts.user_data = this.user_data;
				var val = this.user_data[f.name];
				opts.value = opts.tip = (val === null || val === undefined) ? '' : val;
			}
			opts.cwidth = cwidths[f.name] ||f.cwidth || 10;
			var f = bricks.get_ViewBuilder(f.uitype);
			if (!f) f = bricks.get_ViewBuilder('str');
			var w = f(opts);
			w.set_css('tabular-cell');
			cw.add_widget(w)
		}
	}
}

bricks.Factory.register('DataRow', bricks.DataRow);
