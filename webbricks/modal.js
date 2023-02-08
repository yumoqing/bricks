class Modal {
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
		}
		*/
		this.ops = options;
		this.create();
	}
	create(){
		var e = document.createElement('div');
		e.style.display = none; /* Hidden by default */
		e.style.position = fixed; /* Stay in place */
		e.style.z-index = this.opts.org_index || 0 + 1; /* Sit on top */
		e.style.paddingTop = 100px; /* Location of the box */
		e.style.left = this.opts.x || 0;
		e.style.top = this.opts.y || 0;
		e.style.width = this.opts.width || 100%; /* Full width */
		e.style.height = this.opts.height || 100%; /* Full height */
		e.style.overflow = auto; /* Enable scroll if needed */
		e.style.backgroundColor = this.opts.bgcolor || rgb(0,0,0); /* Fallback color */
		e.style.this.dom_element = e;
		var c = document.createElement('div');
		c.style.color = "#aaaaaa";
		c.style.float = "right";
		c.style.fontSize = "28px";
		c.style.fontWeight = "bold";
		c.innerHTML = "&times;";
		c.onclick = {
			this.dismiss()
		}
		var title = document.createElement('div');
		if (this.opts.titleCSS)
			title.classList.add(this.opts.titleCSS);
		if (this.opts.title){
			title.appendChild(Title3({
					"otext":this.opts.title,
					"i18n":true,
					"halign":"left"
				}))
		}
		title.appendChild(c);
		e.appendChild(e);
		var ct = document.createElement('div')
		ct.style.width = 100%;
		ct.style.height = 100%;
		ct.style.backgroundColor = '#8f8f8f';
		if (this.opts.contentCSS)
			ct.classList.add(this.opts.contentCSS);

		this.content = ct;
		if (this.opts.auto_close){
			window.onclick = function(event){
				if (event.target == this.dom_element){
					this.dismiss();
				}
			}
		}
		Body.appendChild(this.dom_element);
	}
	add_widget(w, index){
		if (index and this.content.children.length > index){
			this.content.insertBefore(w, this,content.children[index]);
		} else {
			this.content.appendChild(w);
		}
		if (this.opts.auto_open){
			this.open();
		}
	}
	open(){
		this.dom_element.style.display = "";
	}
	dismiss(){
		this.dom_element.style.display = "none";
	}
}

