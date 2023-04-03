class Layout extends JsWidget {
	constructor(options){
		super(options);
		this._container = true;
		this.children = [];
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
		var len = this.children.length;
		for (var i=0; i<len; i++){
			if (i >= cnt) break;
			var k = i;
			if (from_end) k = len - 1 - i;
			var w = children[k]
			this.children.remove(w);
			this.remove_widget(w);
		}
	}
	remove_widget(w){
		delete w.parent;
		this.children = this.children.filter(function(item){
			return item != w;
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
	}
	create(){
		this.dom_element = document.getElementsByTagName('body')[0];
		this.set_baseURI(this.dom_element.baseURI);
	}
}

Body = new _Body();

class VBox extends Layout {
	constructor(options){
		super(options);
		this.set_css('vbox');
	}
}

class VFiller extends Layout {
	constructor(options){
		super(options);
		this.set_css('vfiller');
	}
}

class HBox extends Layout {
	constructor(options){
		super(options);
		this.set_css('hbox');
	}
}

class HFiller extends Layout {
	constructor(options){
		super(options);
		this.set_css('hfiller');
	}
}

Factory.register('HBox', HBox);
Factory.register('VBox', VBox);
Factory.register('HFiller', HFiller);
Factory.register('VFiller', VFiller);

