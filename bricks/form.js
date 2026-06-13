var bricks = window.bricks || {};

bricks.need_formdata_fields = ['file', 'video', 'audio'];

bricks.show_resp_message_or_error = async function(resp){
	var desc = await resp.json();
	await bricks.widgetBuild(desc, bricks.Body);
}

bricks.FieldGroup = class {
	constructor(opts){
		this.opts = opts
	}
	build_fields(form, parent, fields){
		var dc = new bricks.DynamicColumn({mobile_cols:2});
		for (var i=0;i<fields.length;i++){
			if (fields[i].uitype == 'group'){
				if (dc.children.length>0){
					parent.add_widget(dc);
					dc = new bricks.DynamicColumn({mobile_cols:2});
				}
				this.build_fields(form, dc, fields[i].fields);
				parent.add_widget(dc);
				dc = new bricks.DynamicColumn({mobile_cols:2});
				dc.set_id(fields[i].name+'_box');
				if (fields[i].nonuse){
					dc.disabled(true);
					dc.hide();
				}
			} else {
				var box;
				if (! form.opts.input_layout || form.opts.input_layout == 'VBox'){
					box = new bricks.VBox({height:'auto',overflow:'none'});
				} else {
					box = new bricks.HBox({height:'auto',overflow:'none'});
				}
				box.set_css('inputbox');
				if (fields[i].uitype !== 'hide'){
					dc.add_widget(box);
				}
				if(bricks.need_formdata_fields.includes(fields[i].uitype)){
					form.need_formdata = true;
				}
				var txt = new bricks.Text({
						otext:fields[i].label||fields[i].name, 
						dynsize:true,
						height:'auto',
						i18n:true});
				box.add_widget(txt);
				box.set_id(fields[i].name + '_box')
				if (fields[i].nonuse){
					box.disabled(true);
					box.hide();
				}
				var w = Input.factory(fields[i]);
				if (w){
					box.add_widget(w);
					form.name_inputs[fields[i].name] = w;
					w.set_id(fields[i].name);
				} else {
					bricks.debug(fields[i], 'createInput failed');
				}
			}
		}
		if (dc.children.length > 0){
			parent.add_widget(dc);
		}
	}
}
bricks.FormBody = class extends bricks.VScrollPanel {
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
		exclusionfields:[
			[a,b,c], # a,b,c互斥，a enabled，b,c必须disabled
			[x,y]		# x,y互斥
		]
	}
	*/
	constructor(form, opts){
		opts.width = '100%';
		opts.height = '100%';
		super(opts);
		this.form = form;
		this.name_inputs = {};
		this.fg = new bricks.FieldGroup({});
		this.fg.build_fields(form, this, form.nontextfields);
		this.build_text_fields();
	}
	build_text_fields(){
		this.form.textfields.forEach((f) => {
			var labelw = new bricks.Text({
				cheight: 2,
				otext: f.label || f.name,
				i18n: true
			});
			var txtw = new bricks.UiText({
				name:f.name,
				css: "filler",
				value:f.value
			});
			var cell = new bricks.VBox({
				css: "inputbox",
				width: "100%",
				height: "45%"
			});
			cell.add_widget(labelw);
			cell.add_widget(txtw);
			this.add_widget(cell);
			this.form.name_inputs[f.name] = txtw;
			cell.set_id(f.name);
		});
	}
	create(){
		this.dom_element = this._create('form');
	}
}

/*
submit_changed: false
fields
submit_url
*/
bricks.FormBase = class extends bricks.Layout {
	constructor(opts){
		super(opts);
		this.name_inputs = {};
	}
	build_toolbar(widget){
		var box = new bricks.HBox({height:'auto', width:'100%'});
		widget.add_widget(box);
		var tools = [
			{
				icon:bricks_resource('imgs/submit.svg'),
				name:'submit',
				css:'submit_btn',
				label:'Submit'
			},
			{
				icon:bricks_resource('imgs/reset.svg'),
				name:'reset',
				css:'reset_btn',
				label:'Reset'
			},
			{
				icon:bricks_resource('imgs/cancel.svg'),
				name:'cancel',
				css:'clear_btn',
				label:'Cancel'
			}
		]
		var tb_desc={};
		var names = [ 'submit', 'reset', 'cancel' ];
		if (this.toolbar){
			tb_desc = bricks.extend(tb_desc, this.toolbar);
			tb_desc.tools = tools;
			tools.forEach(t => {
				if (! names.includes(t.name)) {
					tb_desc.tools.push(t);
				}
			});
			this.toolbar.tools.forEach(t => {
				if (! names.includes(t.name)) {
					tb_desc.tools.push(t);
				}
			});
		} else {
			tb_desc = {
				width:"auto",
				tools:tools
			};
		}
		var tbw = new bricks.IconTextBar(tb_desc);
		tbw.bind('command', this.command_handle.bind(this));
		box.add_widget(new bricks.Filler());
		box.add_widget(tbw);
		box.add_widget(new bricks.Filler());
	}
	command_handle(event){
		var params = event.params;
		bricks.debug('Form(): click_handle() params=', params);
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
				var f = bricks.buildEventHandler(this, params);
				if (f) f(event);
			} else {
				this.dispatch(params.name);
			}
		}
	}
	cancel(){
		this.dispatch('cancel');
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
	_getValue(){
		var data = {};
		for (var name in this.name_inputs){
			if (! this.name_inputs.hasOwnProperty(name)){
				continue;
			}

			var w = this.name_inputs[name];
			var d = w.getValue();
			if (w.required && ( d[name] == '' || d[name] === null)){
				bricks.debug('data=', data, 'd=', d);
				new bricks.Error({title:'Requirement', message:'required field must input"' + w.label + '"'})
				w.focus();
				return;
			}
			bricks.extend(data, d);
		}
		return data;
	}
	getValue(){
		if (this.data) {
			var ret = this.data;
			this.data = null;
			return ret;
		}
		return this.get_formdata();
	}
	toggle_disable(field_name, flg){
		var w = bricks.getWidgetById(field_name + '_box', this);
		if (! w) return;
		w.disabled(flg);
		if (flg) w.hide();
		else w.show();
		if (flg) return;
		this.exclusionfields.forEach(arr =>{
			if (arr.include(field_name)){
				arr.forEach(x => {
					if (x!=field_name){
						var w1 = bricks.getWidgetById(x + '_box', this);
						if (w1) {
							w1.disabled(true);
							w1.hide();
						}
					}
				});
			}
		});
	}
	enable_field(field_name){
		this.toggle_disable(field_name, false);
	}
	disable_field(field_name){
		this.toggle_disable(field_name, true);
	}
	get_formdata(){
		var data = new FormData();
		var changed = false;
		for (var name in this.name_inputs){
			if (! this.name_inputs.hasOwnProperty(name)){
				continue;
			}
			var w = this.name_inputs[name];
			if (w.parent.is_disabled()) continue;
			var d = w.getValue();
			if (w.required && ( d[name] == '' || d[name] === null)){
				new bricks.Error({title:'Requirement', message:'required field must input"' + w.label + '"'})
				w.focus();
				return;
			}
			if (d[name] === null){
				continue;
			}
			if (this.submit_changed){
				if (name != 'id' && this.origin_data[name] == d[name]){
					continue;
				}
			}
			w.set_formdata(data);
			changed = true;
		}
		this.data = data;
		if (changed){
			return data;
		}
		return null
	}
	async validation(){
		var running = new bricks.Running({target:this});
		try {
			var data;
			data = this.get_formdata();
			if (! data) {
				running.dismiss();
				return;
			}
			// data = bricks.delete_null_values(data);
			this.dispatch('submit', data);
			if (this.submit_url){
				var rc = new bricks.HttpResponse();
				var resp = await rc.httpcall(this.submit_url,
							{
								method:this.method || 'POST',
								params:data
							});
				this.dispatch('submited', resp);
			}
		} catch (e){
			console.log('form submit error', e);
		}
		running.dismiss();
	}
	save_origin_data(){
		this.origin_data = {};
		for (var name in this.name_inputs){
			var w = this.name_inputs[name];
			var d = w.getValue();
			this.origin_data[name] = d[name];
		}
	}
}

bricks.InlineForm = class extends bricks.HBox {
	/*
	Horizontal inline form — all fields in one row.
	Options:
		fields: [{name, label, uitype, placeholder, ...}]
		submit_label: "搜索" (button text, default "Submit")
		submit_icon: url to icon (optional)
		submit_css: "primary" (css class for button)
		submit_bgcolor: "#xxx" (background color)
		gap: "0.5" (gap between items in charsize)
		show_label: true/false (show label before input, default true)
	Events:
		submit: dispatched with form data on button click
	*/
	constructor(opts){
		opts.width = opts.width || '100%';
		opts.height = 'auto';
		opts.overflow = 'none';
		opts.alignItems = 'center';
		opts.gap = opts.gap || '0.5';
		super(opts);
		this.name_inputs = {};
		this.build_fields();
		this.build_submit();
	}
	getValue(){
		var data = {};
		for (var name in this.name_inputs){
			if (!this.name_inputs.hasOwnProperty(name)) continue;
			var w = this.name_inputs[name];
			var d = w.getValue();
			bricks.extend(data, d);
		}
		return data;
	}
	setValue(name, value){
		var w = this.name_inputs[name];
		if (w) w.setValue(value);
	}
	reset(){
		for (var name in this.name_inputs){
			if (!this.name_inputs.hasOwnProperty(name)) continue;
			this.name_inputs[name].reset();
		}
	}
	validation(){
		var data = this.getValue();
		this.dispatch('submit', data);
	}
	build_fields(){
		var fields = this.opts.fields || [];
		var show_label = this.opts.show_label !== false;
		for (var i=0; i<fields.length; i++){
			var f = fields[i];
			if (f.nonuse) continue;
			var cell = new bricks.HBox({
				height:'auto',
				alignItems:'center',
				gap:'0.3'
			});
			cell.set_css('inline-form-field');
			if (show_label && f.label){
				var lbl = new bricks.Text({
					otext: f.label,
					height:'auto',
					dynsize:true,
					i18n:true
				});
				cell.add_widget(lbl);
			}
			var inputdesc = objcopy(f);
			if (!inputdesc.width) inputdesc.width = 'auto';
			if (f.placeholder && !inputdesc.placeholder){
				inputdesc.placeholder = f.placeholder;
			} else if (!inputdesc.placeholder && f.label){
				inputdesc.placeholder = f.label;
			}
			var w = Input.factory(inputdesc);
			if (w){
				cell.add_widget(w);
				this.name_inputs[f.name] = w;
				w.set_id(f.name);
			}
			cell.set_id(f.name + '_box');
			this.add_widget(cell);
		}
	}
	build_submit(){
		this.add_widget(new bricks.Filler());
		var btnopts = {
			label: this.opts.submit_label || 'Submit',
			css: this.opts.submit_css || 'primary'
		};
		if (this.opts.submit_icon) btnopts.icon = this.opts.submit_icon;
		if (this.opts.submit_bgcolor) btnopts.bgcolor = this.opts.submit_bgcolor;
		var btn = new bricks.Button(btnopts);
		btn.bind('click', this.validation.bind(this));
		this.add_widget(btn);
	}
}

bricks.Form = class extends bricks.FormBase {
	/*
	{
		title:
		description:
		notoolbar:False,
		input_layout:"VBox" or "HBox", default is "VBox",
		cols:
		dataurl:
		toolbar:
		submit_url:
		method:
		exclussionfields:[
			[a,b,c],
			[x,y]
		]
		fields
	}
	field {
		name:
		label:
		uitype:
		nonuse:	# 不使用
		...
	}
	*/
	constructor(opts){
		opts.height = "100%";
		opts.width = "100%";
		opts.overflow = "auto";
		super(opts);
		this.need_formdata = false;
		if (this.opts.title){
			var t = new bricks.Title3({
					otext:this.opts.title,
					height:'auto',
					i18n:true});
			this.add_widget(t, 0);
		}
		if (this.opts.description){
			var d = new bricks.Text({
					otext:this.opts.description,
					height:'auto',
					i18n:true});
			this.add_widget(d);
		}
		this.set_css('vcontainer');
		var filler = new bricks.Filler({});
		this.add_widget(filler);
		this.nontextfields = [];
		this.textfields = [];
		this.fields.forEach((f) => {
			if (f.uitype == 'text'){
				this.textfields.push(f);
			} else {
				this.nontextfields.push(f);
			}
		});
		this.body = new bricks.FormBody(this, opts);
		filler.add_widget(this.body);
		if (! opts.notoolbar)
			this.build_toolbar(this);
		this.save_origin_data();
	}
}

bricks.Factory.register('InlineForm', bricks.InlineForm);
bricks.Factory.register('Form', bricks.Form);
