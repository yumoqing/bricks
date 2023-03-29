
class Form extends VBox {
	/*
	{
		title:
		description:
		cols:
		dataurl:
		submit_url:
		fields
	}
	*/
	constructor(opts){
		super(opts);
		this.name_inputs = {};
		if (this.opts.title){
			var t = new Title2({
					otext:this.opts.title,
					height:'auto',
					i18n:true});
			this.add_widget(t);
		}
		if (this.opts.description){
			var d = new Text({
					otext:this.opts.description,
					height:'auto',
					i18n:true});
			this.add_widget(d);
		}
		this.form_body = new Layout({width:'100%',
							overflow:'auto' 
							});
		this.add_widget(this.form_body);
		this.form_body.set_css('multicolumns');
		this.build_fields(this.opts.fields);
		this.build_buttons(this);
	}
	build_buttons(widget){
		var reset = new Button({
				orientation:'horizontal',
				icon:bricks_resource('imgs/reset.png'),
				name:'reset',
				text:'Reset'
			});
		reset.bind('click', this.reset_data.bind(this));
		var submit = new Button({
				orientation:'horizontal',
				icon:bricks_resource('imgs/submit.png'),
				name:'submit',
				text:'Submit'
			});
		submit.bind('click', this.validation.bind(this));
		var hbox = new HBox({width:'100%', height:'none'});
		hbox.add_widget(reset);
		hbox.add_widget(submit);
		widget.add_widget(hbox);
	}
	reset_data(){
		for (var name in this.name_inputs){
			if (! this.name_inputs.hasOwnProperty(name)){
				continue;
			}
			var w = this.name_inputs[name];
			w.reset();
		}
	}

	async validation(){
		var data = {};
		for (var name in this.name_inputs){
			if (! this.name_inputs.hasOwnProperty(name)){
				continue;
			}

			var w = this.name_inputs[name];
			var d = w.getValue();
			if (w.required && ( d[name] == '' || d[name] === null)){
				console.log('data=', data, 'd=', d);
				w.focus();
				return;
			}
			data.update(d);
		}
		if (this.submit_url){
			var rzt = await jcall(this.submit_url,
						{
							params:data
						});
		}
		this.dispatch('submit', data);
	}

	build_fields(fields){
		for (var i=0; i<fields.length; i++){
			var box = new VBox({height:'auto',overflow:'none'});
			box.set_css('inputbox');
			this.form_body.add_widget(box);
			var txt = new Text({
					otext:fields[i].label||fields[i].name, 
					height:'auto',
					i18n:true});
			box.add_widget(txt);
			var w = Input.factory(fields[i]);
			if (w){
				box.add_widget(w);
				this.name_inputs[fields[i].name] = w;
				console.log(fields[i].uitype, 'create Input ok');
			} else {
				console.log(fields[i], 'createInput failed');
			}
		}
	}
}

Factory.register('Form', Form);
