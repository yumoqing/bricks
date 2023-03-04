class Modal extends JsWidget {
	constructor(options){
		/*
		{
			auto_open:
			auto_close:
			org_index:
			x:
			y:
			width:
			height:
			bgcolor:
			title:
			titleCSS:
			contentCSS:
			archor: cc ( tl, tc, tr
						cl, cc, cr
						bl, bc, br )
		}
		*/
		super(options);
		this.create();
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
		// e.style.overflow = "auto"; /* Enable scroll if needed */
		e.style.backgroundColor = this.opts.get('bgcolor', 'rgba(0,0,0,0.4)'); /* Fallback color */
		this.dom_element = e;
		var body = document.createElement('div');
		body.style.position = "absolute";
		body.style.backgroundColor='rgb(1,0,0)';
		body.style.width = this.opts.get('width', "70%");
		body.style.height = this.opts.get('height', "70%");
		e.appendChild(body);
		var c = document.createElement('div');
		c.style.color = "#aaaaaa";
		c.style.float = "right";
		c.style.fontSize = "28px";
		c.style.fontWeight = "bold";
		c.my_modal = this;
		c.innerHTML = "&times;";
		c.onclick = function(event){
			var modal = event.target.my_modal;
			modal.dismiss();
		}
		var title = document.createElement('div');
		title.style.height = "40px";
		title.style.width = '100%';
		if (this.opts.titleCSS)
			title.classList.add(this.opts.titleCSS);
		if (this.opts.title){
			title.appendChild(Title3({
					"otext":this.opts.title,
					"i18n":true
				}))
		}
		title.appendChild(c);
		body.appendChild(title);
		var ct = document.createElement('div')
		ct.style.overflow = "auto";
		ct.style.width = '100%';
		ct.style.height = '100%';
		ct.style.backgroundColor = 'rgb(0, 255, 0)';
		if (this.opts.contentCSS)
			ct.classList.add(this.opts.contentCSS);
		body.appendChild(ct);
		archorize(body, this.opts.get('archor', 'cc'));

		this.content = ct;
		this.dom_element.bricks_widget = this;
		this.content.bricks_widget = this;

	}
	
	add_widget(w, index){
		console.log('add_widget():w=', w);
		if (index && this.content.children.length > index){
			this.content.insertBefore(w.dom_element, this,content.children[index]);
		} else {
			this.content.appendChild(w.dom_element);
		}
		if (this.opts.auto_open){
			this.open();
		}
	}
	click_handler(event){
		console.log('click_handler() called ...');
		if (event.target == this.dom_element){
			this.dismiss();
		} else {
			console.log('modal():click_handler()');
		}
	}
	open(){
		console.log('modal():open called ............');
		if (this.opts.auto_close){
			console.log('modal():auto_close ........');
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

Factory.register('Modal', Modal);
