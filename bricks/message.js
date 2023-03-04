class Message extends VBox {
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
		this.task = null;
		this.title = opts.title|| 'Title';
		this.archor = opts.archor || 'cc';
		this.message = opts.message;
		this.timeout = opts.timeout;
		this.set_css('message');
		this.build();
		archorize(this.dom_element, this.archor);
		if (opts.auto_open){
			this.open()
		}
	}
	build(){
		var tb = new HBox({height:'40px'});
		tb.set_css('title');
		this.add_widget(tb);
		var tit = new Text({otext:this.title, i18n:true});
		var bb = new VBox({});
		this.add_widget(bb);
		tb.add_widget(tit);
		var msg = new Text({otext:this.message, i18n:true});
		bb.add_widget(msg);
	}
	open(){
		Body.add_widget(this);
		if (this.timeout && this.timeout > 0){
			this.task = schedule_once(this.dismiss.bind(this), this.timeout);
		}
	}
	dismiss(){
		if (this.task){
			this.task.cancel();
			this.task = null
		}
		Body.remove_widget(this);
	}
}

class Error extends Message {
	constructor(opts){
		super(opts);
		this.set_css('error');
	}
}
Factory.register('Message', Message);
Factory.register('Error', Error);

