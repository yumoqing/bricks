var bricks = window.bricks || {};

bricks.min_zindex = 5000;
bricks.last_zindex = 5000;
bricks.BaseModal = class extends bricks.Layout {
	constructor(options){
		/*
		{
			target: string or Layout
			auto_open:
			auto_close:
			org_index:
			width:
			height:
			bgcolor:
			title:
			timeout:
			archor: cc ( tl, tc, tr
						cl, cc, cr
						bl, bc, br )
		}
		*/
		super(options);
		this.set_width('100%');
		this.set_height('100%');
		this.ancestor_add_widget = bricks.Layout.prototype.add_widget.bind(this);
		this.panel = new bricks.VBox({});
		this.timeout = options.timeout || 0;
		this.timeout_task = null;
		this.ancestor_add_widget(this.panel);
		this.panel.set_width(this.opts.width);
		this.panel.set_height(this.opts.height);
		this.panel.dom_element.style.backgroundColor = this.opts.bgcolor|| '#e8e8e8';
		this.panel.set_css('modal');
		archorize(this.panel.dom_element, objget(this.opts, 'archor', 'cc'));
		this.target_w = null;
		if (this.target){
			if (typeof this.target === typeof ''){
				this.target_w = bricks.getWidgetById(this.target, bricks.Body);
			} else {
				this.target_w = this.target;
			}
		}
		if (! this.target_w){
			this.target_w = bricks.Body;
		}
		if (this.target_w!=bricks.Body){
			this.target_w.set_style('position', 'relative');
		}
		this.target_w.add_widget(this);
	}
	get_zindex(){
		var idx = bricks.last_zindex;
		bricks.last_zindex += 1;
		return idx;
	}
	create(){
		var e = document.createElement('div');
		e.style.display = "none"; /* Hidden by default */
		e.style.position = "fixed"; /* Stay in place */
		e.style.zIndex = this.get_zindex();
		e.style.paddingTop = "100px"; /* Location of the box */
		e.style.left = 0;
		e.style.top = 0;
		e.style.width = "100%"; /* Full width */
		e.style.height = "100%"; /* Full height */
		e.style.backgroundColor = 'rgba(0,0,0,0.4)'; /* Fallback color */
		this.dom_element = e;
	}
	add_widget(w, index){
		this.panel.add_widget(w, index);
		if (this.opts.auto_open){
			this.open();
		}
	}
	open(){
		this.dom_element.style.display = "";
		if (this.timeout > 0){
			this.timeout_task = schedule_once(this.dismiss.bind(this), this.timeout);
		}
		this.dispatch('opened');
	}
	dismiss(){
		if (this.parent){
			this.set_css('display', 'none');
			if (this.timeout_task){
				this.timeout_task.cancel();
				this.timeout_task = null;
			}
			try {
				this.parent.remove_widget(this);
			} catch(e){
				console.log(e, 'remove modal error');
			}
			this.dispatch('dismissed');
		}
	}
}
bricks.Modal = class extends bricks.BaseModal {
	constructor(options){
		/*
		{
			target: string or Layout
			auto_open:
			auto_close:
			org_index:
			width:
			height:
			bgcolor:
			title:
			archor: cc ( tl, tc, tr
						cl, cc, cr
						bl, bc, br )
		}
		*/
		super(options);
		this.create_title();
		this.content = new bricks.Filler({width:'100%'});
		this.panel.add_widget(this.content);
	}
	create_title(){
		this.title_box = new bricks.HBox({width:'100%', height:'auto'});
		this.title_box.set_css('title');
		this.panel.add_widget(this.title_box);
		this.title_w = new bricks.Filler({height:'100%'});
		var icon = new bricks.Svg({url:bricks_resource('imgs/delete.svg')});
		icon.bind('click', this.dismiss.bind(this));
		this.title_box.add_widget(this.title_w);
		this.title_box.add_widget(icon);
		if (this.title){
			var w = new bricks.Text({
				otext:this.title,
				i18n:true,
				dynsize:true
			});
			this.title_w.add_widget(w);
		}
	}
	
	add_widget(w, index){
		this.content.add_widget(w, index);
		if (this.opts.auto_open){
			this.open();
		}
	}
	click_handler(event){
		if (event.target == this.dom_element){
			this.dismiss();
		} else {
			bricks.debug('modal():click_handler()');
		}
	}
	/*
	open(){
		if (this.opts.auto_close){
			var f = this.click_handler.bind(this);
			this.bind('click', f);
		}
		bricks.BaseModal.prototype.open.bind(this)();
	}
	dismiss(){
		if (this.opts.auto_close){
			this.unbind('click', this.click_handler.bind(this));
		}
		bricks.BaseModal.prototype.dismiss.bind(this)();
	}
	*/
}

bricks.ModalForm = class extends bricks.PopupWindow {
	/*
	{
		auto_open:
		auto_close:
		org_index:
		width:
		height:
		bgcolor:
		archor: cc ( tl, tc, tr
					cl, cc, cr
					bl, bc, br )
		title:
		description:
		fields:
		user_data:
		binds:
	}
	*/
	constructor(opts){
		super(opts);
		schedule_once(this.build_form.bind(this), 0.2);
	}
	_getValue(){
		return this.form._getValue();
	}
	getValue(){
		return this.form.getValue();
	}
	async build_form(){
		var opts = {
			widgettype: "Form",
			options:{
				height:'100%',
				title:this.opts.title,
				description:this.opts.description,
				fields:this.opts.fields,
				binds:this.opts.binds || []
			}
		}
		if (this.submit_url){
			opts.submit_url = this.submit_url;
		}
		this.form = await bricks.widgetBuild(opts, this);
		this.add_widget(this.form);
		this.form.bind('submit', this.form_submit.bind(this));
		this.form.bind('submited', this.form_submited.bind(this));
		this.form.bind('cancel', this.dismiss.bind(this))
		this.open();
	}
	form_submit(){
		var d = this.form.getValue();
		this.dispatch('submit', d)
		this.dismiss();
	}
	form_submited(event){
		this.dispatch('submited', event.params);
	}
}
bricks.Factory.register('Modal', bricks.Modal);
bricks.Factory.register('ModalForm', bricks.ModalForm);
	
