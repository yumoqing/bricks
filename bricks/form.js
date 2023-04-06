
class FormBody extends VBox {
	/*
	{
		title:
		description:
		fields: [
			{
				"name":,
				"label":,
				"removable":
				"icon":
				"content":
			},
			...
		]
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
		this.build_fields();
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

	build_fields(){
		var fields = this.opts.fields;
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
class Form extends VBox {
	/*
	{
		title:
		description:
		cols:
		dataurl:
		toolbar:
		submit_url:
		fields
	}
	*/
	constructor(opts){
		super(opts);
		this.body = new FormBody(opts);
		this.add_widget(this.body);
		this.build_toolbar(this);
	}
	build_toolbar(widget){
		var box = new HBox({height:'auto', width:'100%'});
		widget.add_widget(box);
		var tb_desc = this.opts.toolbar || {
			width:"auto",
			tools:[
				{
					icon:bricks_resource('imgs/submit.png'),
					name:'submit',
					label:'Submit'
				},
				{
					icon:bricks_resource('imgs/cancel.png'),
					name:'cancel',
					label:'Cancel'
				}
			]
		};
		var tbw = new Toolbar(tb_desc);
		tbw.bind('command', this.command_handle.bind(this));
		box.add_widget(new HFiller());
		box.add_widget(tbw);
		box.add_widget(new HFiller());
	}
	command_handle(event){
		var params = event.params;
		console.log('Form(): click_handle() params=', params);
		if (!params){
			error('click_handle() get a null params');
			return
		}
		if (params.name == 'submit'){
			this.validation();
		} else if (params.name == 'cancel'){
			this.cancel();
		} else if (params.name == 'reset'){
			this.reset_data();
		} else {
			if (params.action){
				f = buildEventHandler(this, params);
				f(event);
			}
		}
	}
	cancel(){
		this.dispatch('cancel');
	}

}

class TabForm extends Form {
	/*
	options
	{
		css:
		tab_long: 100%
		tab_pos:"top"
		items:[
			{
				name:
				label:"tab1",
				icon:
				removable:
				refresh:false,
				content:{
					"widgettype":...
				}
			}
		]
	}
	{
		...
		fields:[
			{
			}
		]
	*/
	constructor(opts){
		super(opts);
	}
	build_fields(fields){
	}
}

Factory.register('Form', Form);
// Factory.register('TabForm', TabForm);
