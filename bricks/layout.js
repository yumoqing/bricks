class Layout extends JsWidget {
	constructor(options){
		super(options);
		this._container = true;
		this.children = [];
		this.create('div');
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
		this.dom_element.style.overflow = this.opts.overflow || 'auto';
	}
	add_widget(w, index){
		if (! index || index>=this.children.length){
			w.parent = this;
			this.children.push(w);
			this.dom_element.appendChild(w.dom_element);
			return
		}
		var pos_w = this.children[index];
		this.dom_element.insertBefore(w.dom_element, pos_w.dom_element);
		this.children.insert(index+1, w);
	}
	remove_widgets_at_begin(cnt){
		return this._remove_widgets(cnt, false);
	}
	remove_widgets_at_end(cnt){
		return this._remove_widgets(cnt, true);
	}
	_remove_widgets(cnt, from_end){
		var children = this.children.copy();
		for (var i=0; i<children.length; i++){
			if (i >= cnt) break;
			var k = i;
			if (from_end) k = children.length - 1 - i;
			var w = children[k]
			this.children.remove(w);
			this.remove_widget(w);
		}
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
		this.set_baseURI(this.dom_element.baseURI);
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
		this.orientation = options.get('orientation', 'vertical');
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
			e.style.flex = '1';
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
			e.style.flex = '1';
	}
}
Factory.register('HBox', HBox);
Factory.register('VBox', VBox);

