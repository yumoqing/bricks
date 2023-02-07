class Layout extends JsWidget {
	constructor(options){
		super(options);
		this.create('div');
		console.log('this=', this);
	}
	add_widget(w, index){
		this.dom_element.appendChild(w.dom_element);
	}
	remove_widget(w){
		this.dom_element.removeChild(w.dom_element);
	}
	clear_widgets(w){
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
		super(options);
		this.orientation = options.orientation | 'vertical';
		this.size_hint_y = options.size_hint_y | null;
		this.size_hint_x = options.size_hint_x | null;
		this.size_hint = [this.size_hint_x, this.size_hint_y];
	}
}

class VBox extends BoxLayout {
	constructor(options){
		super(options);
		this.orientation = 'vertical';
	}
}

class HBox extends BoxLayout {
	constructor(options){
		super(options);
		this.orientation = 'horizontal';
		this.dom_element.style.float = 'left';
	}
}
Factory.register('HBox', HBox);
Factory.register('VBox', VBox);

