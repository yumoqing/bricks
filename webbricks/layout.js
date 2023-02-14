class Layout extends JsWidget {
	constructor(options){
		super(options);
		this._container = true;
		this.children = [];
		this.create('div');
		console.log('this=', this);
	}
	opts_handle(){
		var e = this.dom_element;
		if (this.opts.width)
			e.style.width = this.opts.width;
		
		if (this.opts.height) 
			e.style.height = this.opts.height;

		if (this.opts.css){
			this.dom_element.classList.add(this.opts.css);
		}
	}
	add_widget(w, index){
		w.parent = this;
		this.children.push(w);
		this.dom_element.appendChild(w.dom_element);
	}
	remove_widget(w){
		w.parent = null;
		this.children = this.children.filter(function(item){
			return item !== w;
		});

		this.dom_element.removeChild(w.dom_element);
	}
	clear_widgets(w){
		for (var i=0;i<this.children.length;i++){
			this.children[i].parent = null;
		}
		this.children = [];
		this.dom_element.replaceChildren();
	}
}

class _Body extends Layout {
	constructor(options){
		super(options);
		this.dom_element = document.getElementsByTagName('body')[0];
	}
}

Body = new _Body();

class BoxLayout extends Layout {
	constructor(options){
		/* options:
		{
			"orientation":"vertical" or "horizontal",
			"size_hint_x",
			"size_hint_y",
			"height":
			"width",
			"css",
			"x",
			"y",
		}
		*/
		super(options);
		this.create('div');
		this.opts_handle();
		this.container_jss = {
			'display':'flex',
		}
		this.child_jss = {
		}
		this.orientation = get(options, 'orientation', 'vertical');
		if (this.orientation in ['vertical', 'horizontal']){
			this.orientation = 'vertical';
		}
	}
}

class VBox extends BoxLayout {
	constructor(options){
		super(options);
		this.orientation = 'vertical';
		this.container_jss.flexFlow = 'column';
		this.dom_element.style.update(this.container_jss);
	}
	add_widget(w, index){
		var e = w.dom_element;
		BoxLayout.prototype.add_widget.call(this, w, index);
		if (w.opts.height)
			e.style.flex = obj_fmtstr({'height':w.opts.height}, '0 1 ${height}');
		else
			e.style.flex = '1 1 auto';
	}
}

class HBox extends BoxLayout {
	constructor(options){
		super(options);
		this.orientation = 'horizontal';
		this.container_jss.flexFlow = 'row';
		this.dom_element.style.update(this.container_jss);
	}
	add_widget(w, index){
		var e = w.dom_element;
		BoxLayout.prototype.add_widget.call(this, w, index);
		if (w.opts.width)
			e.style.flex = obj_fmtstr({'width':w.opts.width}, '0 1 ${width}');
		else
			e.style.flex = '1 1 auto';
	}
}
Factory.register('HBox', HBox);
Factory.register('VBox', VBox);

