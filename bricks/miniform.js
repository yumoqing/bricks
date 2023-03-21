class MiniForm extends HBox {
	/*
	{
		defaultname:
		label_width:
		input_width:
		"fields":[
			{
				name:
				label:
				icon:
				uitype:
				uiparams:
			}
			...
		]
	}
	*/
	constructor(opts){
		opts.width = 'auto';
		opts.height = 'auto';
		super(opts);
		this.build();
	}
	build(){
		var name = this.opts.defaultname;
		if (!name){
			name = this.opts.fields[0].name;
		}
		this.build_options();
		this.build_widgets(name);
	}
	build_widgets(name){
		this.clear_widgets();
		this.add_widget(this.choose);
		var f = this.opts.fields.find(i => i.name == name);
		if (f.icon){
			this.add_widget(new Icon({url:f.icon}));
		}
		this.add_widget(new Text({otext:f.label||f.name,
								width:this.opts.label_width || 'auto',
								i18n:true}));
		var gtflg = new Icon({url:bricks_resource('imgs/down_dir.png')});
		gtflg.bind('click', this.show_options.bind(this));
		this.add_widget(gtflg);
		var desc = f.copy();
		desc.width = 'auto';
		var i = Input.factory(desc);
		i.bind('input', this.input_handle.bind(this));
		this.add_widget(i);
		this.input = i;
	}
	build_options(){
		var w = new VBox({css:'popup', width:'auto', height:'auto'});
		var fields = this.opts.fields;
		for (var i=0;i<fields.length; i++){
			var b = new Button(fields[i]);
			b.bind('click', this.change_input.bind(this));
			w.add_widget(b);
		}
		w.hide();
		this.choose = w;
		this.add_widget(w);
	}
	show_options(e){
		console.log('show_options() called ...');
		this.choose.show();
	}
	change_input(e){
		var name = e.params.name;
		this.build_widgets(name);
		this.choose.hide();
	}
	input_handle(e){
		var v = this.input.getValue();
		console.log('input_handle() ..', v);
		this.dispatch('input', v);
	}
}

Factory.register('MiniForm', MiniForm);
