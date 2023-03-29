class MiniForm extends HBox {
	/*
	{
		defaultname:
		label_width:
		input_width:
		params:
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
		if (this.input){
			this.input.unbind('input', this.input_handle.bind(this));
		}
		this.clear_widgets();
		this.add_widget(this.choose);
		var f = this.opts.fields.find( i => i.name==name);
		var desc = f.copy();
		desc.width = 'auto';
		var i = Input.factory(desc);
		i.bind('input', this.input_handle.bind(this));
		this.add_widget(i);
		this.input = i;
	}
	build_options(){
		var desc = {
			width:"90px",
			name:"name",
			uitype:"code",
			valueField:'name',
			textField:'label',
			data:this.opts.fields
		};
		var w = Input.factory(desc);
		w.bind('changed', this.change_input.bind(this));
		this.choose = w;
		this.add_widget(w);
	}
	show_options(e){
		console.log('show_options() called ...');
		this.choose.show();
	}
	change_input(e){
		var name = this.choose.value;
		this.build_widgets(name);
	}
	input_handle(e){
		var d = this.getValue();
		console.log('input_handle() ..', d);
		this.dispatch('input', d);
	}
	getValue(){
		var d = this.opts.params || {};
		var v = this.input.getValue();
		d.update(v);
		return d;
	}
}

Factory.register('MiniForm', MiniForm);
