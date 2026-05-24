var bricks = window.bricks || {};

bricks.key_selectable_stack = [];

bricks.Layout = class  extends bricks.JsWidget {
	constructor(options){
		if (! options){
			options = {};
		}
		super(options);
		this._container = true;
		this.keyselectable = options.keyselectable || false;
		this.children = [];
		if (this.use_key_select){
			this.enable_key_select();
		}
	}
	build_title(){
		if (this.title){
			this.title_w = new bricks.Title3({otext:this.title, i18n:true, dynsize:true});
			this.add_widget(this.title_w);
		}
	}
	build_description(){
		if (this.description){
			this.description_w = new bricks.Text({otext:this.description,
						i18n:true, dynsize:true
			});
			this.add_widget(this.description_w);
		}
	}
	set_key_select_items(){
		this.key_select_items = this.children;
	}
	enable_key_select(){
		this.keyselectable = true;
		this.set_key_select_items();
		bricks.app.bind('keydown', this.key_handler.bind(this));
		bricks.key_selectable_stack.push(this)
		this.select_default_item();
	}
	is_currkeyselectable(){
		if (!this.keyselectable) return false;
		var p = bricks.key_selectable_stack.length -1;
		return bricks.key_selectable_stack[p] == this;
	}
	disable_key_select(){
		this.keyselectable = false;
		bricks.app.unbind('keydown', this.key_handler.bind(this));
		if (this.is_currkeyselectable()){
			this.select_item.selected(false);
			this.select_item = null;
			bricks.key_selectable_stack.pop();
		}
		return;
	}
	select_item(w){
		if (!w) return;
		// if (!this.keyselectable) return;
		if (this.selected_item){
			this.selected_item.selected(false);
		}
		this.selected_item = w;
		this.selected_item.selected(true);
	}
	select_default_item(){
		if (!this.keyselectable) return;
		var w = this.children[0];
		this.select_item(w);
	}
	select_next_item(){
		if (!this.keyselectable) return;
		this.set_key_select_items();
		for (var i=0;i<this.key_select_items.length;i++){
			if (this.selected_item == this.key_select_items[i]){
				var k = i + 1;
				if (k >= this.key_select_items.length){
					k = 0;
				}
				this.select_item(this.key_select_items[k])
				break
			}
		}
	}
	select_previous_item(){
		if (!this.keyselectable) return;
		this.set_key_select_items();
		for (var i=0;i<this.key_select_items.length;i++){
			if (this.selected_item == this.key_select_items[i]){
				var k = i - 1;
				if (k < 0){
					k = this.key_select_items.length - 1;
				}
				this.select_item(this.key_select_items[k])
				break
			}
		}
	}
	up_level(){
		if ( bricks.key_selectable_stack.length < 2){
			return;
		}
		if (this.selected_item){
			this.selected_item.selected(false);
		}
		this.disable_key_select();
	}
	down_level(){
		this.set_key_select_items();
		var w = this.selected_item;
		if (! w) return;
		if (! w.keyselectable){
			w = w.find_first_keyselectable_child();
			if (! w) return;
		}
		bricks.key_selectable_stack.push(this);
		this.disable_key_select();
		w.enable_key_select();
	}
	find_first_keyselectable_child(){
		for (var i=0;i<this.children;i++){
			if (this.children[i].keyselectable){
				return this.children[i];
			}
			var sw = this.children[i].find_first_keyselectable_child();
			if (sw) return sw;
		}
		return null
	}
	enter_handler(){
		if (! this.selected_item) {
			return;
		}
		this.selected_item.dispatch('click');
	}
	key_handler(event){
		if (!this.is_currkeyselectable()){
			return;
		}
		var key = event.key;
		switch(key) {
			case 'ArrowDown':
				this.select_next_item();
				break;
			case 'ArrowUp':
				this.select_previous_item();
				break;
			case 'ArrowLeft':
				this.up_level();
				break;
			case 'ArrowRight':
				this.down_level();
				break;
			case 'Enter':
				this.enter_handler();
				break
			default:
				break;
		}
	}
	add_widget(w, index){
		if (index !== null && index >=0 && index < this.children.length){
			var pos_w = this.children[index];
			this.dom_element.insertBefore(w.dom_element, pos_w.dom_element);
			this.children.insert(index, w);
		} else {
			// append child at end
			w.parent = this;
			if (this.baseURI && !w.baseURI){
				w.set_baseURI(this.baseURI);
			}
			this.children.push(w);
			this.dom_element.appendChild(w.dom_element);
		}
		w.dispatch('on_parent', this);
	}
	remove_widgets_at_begin(cnt){
		return this._remove_widgets(cnt, false);
	}
	remove_widgets_at_end(cnt){
		return this._remove_widgets(cnt, true);
	}
	_remove_widgets(cnt, from_end){
		var children = objcopy(this.children);
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
		w.parent = null;
		this.children = this.children.filter(function(item){
			return item != w;
		});
		this.dom_element.removeChild(w.dom_element);
		w.dispatch('on_parent', null);
	}
	clear_widgets(w){
		var e = this.dom_element;
		while(e.firstChild){
			e.removeChild(e.firstChild);
		}
		for (var i=0;i<this.children.length;i++){
			var w = this.children[i];
			w.parent = null;
			w.dispatch('on_parent', null);
		}
		this.children = [];
	}
	build_title_widget(){
		if (this.title){
			this.title_widget = new bricks.Title3({otext:this.title, i18n:true});
			this.add_widget(this.title_widget);
		}
	}
	build_description_widget(){
		if (this.description){
			this.description_widget = new bricks.Text({otext:this.description, i18n:true});
			this.add_widget(this.description_widget);
		}
	}
	build_toolbar_widget(ext_tools){
		if (this.toolbar){
			this.toolbar_widget = new bricks.FloatTextIconBar(this.toolbar);
			this.add_widget(this.toolbar_widget);
		}
	}
}

bricks.VBox = class extends bricks.Layout {
	constructor(options){
		super(options);
		this.set_css('vcontainer');
	}
}

bricks.Filler = class extends bricks.Layout {
	constructor(options){
		super(options);
		this.set_css('filler');
		/*
		this.set_style('flexGrow', 1);
		this.set_style('overflow', 'auto');
		*/
	}
}

bricks.HBox = class extends bricks.Layout {
	constructor(options){
		super(options);
		this.set_css('hcontainer');
	}
}

bricks.FHBox = class extends bricks.HBox {
	constructor(options){
		super(options);
		this.set_style('flexWrap', 'nowrap');
	}
}
bricks.FVBox = class extends bricks.VBox {
	constructor(options){
		super(options);
		this.set_style('flexWrap', 'nowrap');
	}
}

bricks.ResponsiveBox = class extends bricks.Layout {
	constructor(opts){
		super(opts);
		
		this.bind('element_resize', this.reset_type.bind(this));
	}
	reset_type(event){
		var w = this.dom_element.clientWidth;
		var h = this.dom_element.clientHeight;
		var cr = event.params;
		console.log('size changed', w, h, cr);
		if (w > h) {
			this.set_css('vcontainer', true);
			this.set_css('hcontainer');
			this.set_style('width', 'auto');
			this.set_style('height', '100%');
			
		} else {
			this.set_css('vcontainer');
			this.set_css('hcontainer', true);
			this.set_style('height', 'auto');
			this.set_style('width', '100%');
		}
	}
}
bricks.RefreshWidget = class extends bricks.VBox {
	/* 
	{
		period_seconds:
		params:
		method
		url:
	}
	*/
	constructor(opts){
		super(opts);
		this.refresh_task = null;
		schedule_once(this.show_widget.bind(this), 0.01);
	}
	async show_widget(){
		var desc = {
			widgettype: "urlwidget",
			options: {
				params: this.opts.params,
				method: this.opts.method,
				url: this.opts.url
			}
		};
		var w = await bricks.widgetBuild(desc, this);
		if (w){
			this.clear_widgets();
			this.add_widget(w)
		}
		schedule_once(this.show_widget.bind(this), this.opts.period_seconds);
	}
}
bricks.Factory.register('HBox', bricks.HBox);
bricks.Factory.register('FHBox', bricks.FHBox);
bricks.Factory.register('VBox', bricks.VBox);
bricks.Factory.register('FVBox', bricks.FVBox);
bricks.Factory.register('Filler', bricks.Filler);
bricks.Factory.register('HFiller', bricks.Filler);
bricks.Factory.register('VFiller', bricks.Filler);
bricks.Factory.register('ResponsiveBox', bricks.ResponsiveBox);
bricks.Factory.register('ResponsableBox', bricks.ResponsiveBox);
bricks.Factory.register('RefreshWidget', bricks.RefreshWidget);
