
class Form extends VBox {
	/*
	{
		title:
		description:
		cols:
		dataurl:
		submit_url:
		fileds
	}
	*/
	constructor(opts){
		super(opts);
		this.name_inputs = {};
		if (this.opts.title){
			var t = new Title2({
					otext:this.opts.title,
					i18n:true});
			this.add_widget(t);
		}
		if (this.opts.description){
			var d = new Text({
					otext:this.opts.description,
					i18n:true});
			this.add_widget(d);
		}
		this.form_body = new Layout({width:'100%'});
		this.add_widget(this.form_body);
		this.form_body.set_css('multicolumns');
		this.build_fields(this.opts.fields);
	}
	build_buttons(){
		
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
		var rzt = await jcall(this.submit_url,
					{
						params:data
					});

	}
	build_fields(fields){
		for (var i=0; i<fields.length; i++){
			var box = new VBox({});
			box.set_css('inputbox');
			this.form_body.add_widget(box);
			var txt = new Text({
					otext:fields[i].label||fields[i].name, 
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
