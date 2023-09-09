class BPopup extends VBox {
	/* 
	{
		holder:
		title:
		auto_open:
		auto_dismiss:
		archor:cc
		timeout:
	}
	*/
	constructor(opts){
		super(opts);
		this.holder = opts.holder;
		this.task = null;
		this.title = opts.title|| 'Title';
		this.archor = opts.archor || 'cc';
		this.timeout = opts.timeout;
		this.set_css('message');
		this.build();
		archorize(this.dom_element, this.archor);
	}

	build(){
		var tb = new HBox({height:'40px'});
		tb.set_css('title');
		VBox.prototype.add_widget.bind(this)(tb);
		var tit = new Text({otext:this.title, i18n:true});
		this.content = new VBox({});
		VBox.prototype.add_widget.bind(this)(this.content);
		tb.add_widget(tit);
		this.holder = Body;
		if (this.opts.holder){
			if (type(this.opts.holder) == 'string'){
				this.holder = getWidgetById(this.opts.holder, Body);
			} else {
				this.holder = this.opts.holder;
			}
		}
	}
	open(){
		this.holder.add_widget(this);
		if (this.timeout && this.timeout > 0){
			this.task = schedule_once(this.dismiss.bind(this), this.timeout);
		}
	}
	add_widget(w, idx){
		this.content.add_widget(w, idx);
		if (this.opts.auto_open){
			this.open();
		}
	}
	dismiss(){
		if (this.task){
			this.task.cancel();
			this.task = null
		}
		this.holder.remove_widget(this);
	}
}

class BMessage extends BPopup {
	/* 
	{
		title:
		message:
		params:
		auto_open:
		auto_dismiss:
		archor:cc
		timeout:
	}
	*/
	constructor(opts){
		super(opts);
		var t = new Text({otext:this.opts.message,
					i18n:true});
		this.add_widget(t);
	}
}

class BError extends BMessage {
	constructor(opts){
		super(opts);
		this.set_css('error');
	}
}

class PopupForm extends BPopup {
	/* 
	{
		form:{
		}
	}
	*/
	constructor(options){
		super(options);
		this.form = new Form(this.opts.form);
		this.add_widget(this.form);
		this.form.bind('submit', this.close_popup.bind(this));
		this.form.bind('discard', this.close_popup.bind(this));
	}
	close_popup(e){
		this.dismiss();
	}
}
Factory.register('BMessage', BMessage);
Factory.register('BError', BError);
Factory.register('PopupForm', PopupForm);
