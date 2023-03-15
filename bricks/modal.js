class Modal extends Layout {
	constructor(options){
		/*
		{
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
		this.create();
		this.set_width('100%');
		this.set_height('100%');
		this.ancestor_add_widget = Layout.prototype.add_widget.bind(this);
		this.panel = new VBox({});
		this.ancestor_add_widget(this.panel);
		this.panel.set_width(this.opts.width);
		this.panel.dom_element.style.backgroundColor = this.opts.bgcolor|| '#e8e8e8';
		this.panel.set_height(this.opts.height);
		this.panel.set_css('modal');
		archorize(this.panel.dom_element, this.opts.get('archor', 'cc'));
		this.create_title();
		this.content = new VBox({width:'100%'});
		this.panel.add_widget(this.content);
	}
	create_title(){
		this.title_box = new HBox({width:'100%', height:'auto'});
		this.title_box.set_css('title');
		this.panel.add_widget(this.title_box);
		this.title = new HBox({height:'100%'});
		var icon = new Icon({url:bricks_resource('imgs/delete.png')});
		icon.bind('click', this.dismiss.bind(this));
		this.title_box.add_widget(this.title);
		this.title_box.add_widget(icon);
	}
	create(){
		var e = document.createElement('div');
		e.style.display = "none"; /* Hidden by default */
		e.style.position = "fixed"; /* Stay in place */
		e.style.zIndex = this.opts.get('org_index', 0) + 1; /* Sit on top */
		e.style.paddingTop = "100px"; /* Location of the box */
		e.style.left = 0;
		e.style.top = 0;
		e.style.width = "100%"; /* Full width */
		e.style.height = "100%"; /* Full height */
		e.style.backgroundColor = 'rgba(0,0,0,0.4)'; /* Fallback color */
		this.dom_element = e;
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
			console.log('modal():click_handler()');
		}
	}
	open(){
		if (this.opts.auto_close){
			var f = this.click_handler.bind(this);
			this.bind('click', f);
		}
		this.dom_element.style.display = "";
	}
	dismiss(){
		this.dom_element.style.display = "none";
		if (this.opts.auto_close){
			this.unbind('click', this.click_handler.bind(this));
		}
	}
}

class ModalForm extends Modal {
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
		dataurl:
		submit_url:
		fields:
	}
	*/
	constructor(opts){
		super(opts);
		this.build_form();
	}
	build_form(){
		var opts = {
			title:this.opts.title,
			description:this.opts.description,
			dataurl:this.opts.dataurl,
			submit_url:this.opts.submit_url,
			fields:this.opts.fields
		}
		this.form = new Form(opts);
		this.form.bind('submit', this.dismiss.bind(this));
	}
}
Factory.register('Modal', Modal);
Factory.register('ModalForm', ModalForm);
	
