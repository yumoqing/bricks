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
	unselect_item(w){
		// 与 select_item 对称：仅当 w 是当前选中项时取消选中
		if (this.selected_item === w){
			w.selected(false);
			this.selected_item = null;
		}
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
// 统一「实时面板」登记表（2026-10-07）：
// RefreshWidget 与 Tree 等带 live_panel 的实时控件都登记到这里；
// 用户新输入时由 bricks.live_widgets.stop_all(root) 一次性停掉（历史状态定格）。
// stop_all(root) 语义与旧 RefreshWidget.stop_live_panels(root) 一致：
// 传 root 只停 DOM 在某 root 内的（同页多会话 tab 不互相误停），不传则停全部。
bricks.live_widgets = {
	registry: [],
	register(w){
		if (!w || this.registry.indexOf(w) >= 0){ return; }
		this.registry.push(w);
	},
	unregister(w){
		var i = this.registry.indexOf(w);
		if (i >= 0){ this.registry.splice(i, 1); }
	},
	stop_all(root){
		this.registry.slice().forEach(function(w){
			if (root && (!w || !w.dom_element || !root.contains(w.dom_element))){ return; }
			try { if (w && w.stop) w.stop(); } catch(e){}
		});
	}
};
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
		this.stopped = false;
		// live_panel=true：登记为「实时面板」，用户新输入时可由 stop_live_panels() 停掉（历史状态定格）
		if (opts && opts.live_panel){
			bricks.live_widgets.register(this);
		}
		schedule_once(this.show_widget.bind(this), 0.01);
	}
	// 显式停止本控件的轮询（并把自己从实时面板登记表移除）
	stop(){
		this.stopped = true;
		bricks.live_widgets.unregister(this);
	}
	// 停掉已登记的实时面板（只影响 live_panel，不影响页面其它 RefreshWidget）
	// 可选 root 作用域：传 root 时只停 DOM 在该 root 内的面板（按会话作用域）
	// —— 同页多会话 tab 时，B 会话发消息不会误停 A 会话正在看的实时面板；
	// 不传 root 时停全部（行为与之前完全一致）。dom_element 缺失的面板跳过（不误判）。
	// 转调统一登记表 bricks.live_widgets.stop_all（Tree 等实时控件也登记在同一张表）。
	static stop_live_panels(root){
		return bricks.live_widgets.stop_all(root);
	}
	async show_widget(){
		if (this.stopped){ return; }
		// 直接拉取端点响应（与 Tree.get_children_data 对称）：端点可返回包装体
		// {"widget": <widget desc>, "stop_refresh": bool}——判据是【顶层有 widget 键】
		// （不要与「widget 本身就是 {widgettype:...}」混淆）。有 widget 键 → 渲染其中的
		// widget；stop_refresh 为真 → 渲染完再 this.stop()（停在自己的最终状态上，不闪回）。
		// 返回普通 widget desc（无 widget 键）→ 与改前逐行等价：旧路径 widgetBuild(urlwidget)
		// 内部就是同款 absurl+httpcall，并把返回 widget 的 options.baseURI 设为解析后的 url，
		// 故这里显式以 {baseURI: url} 作父上下文还原该 base（widgetBuild 只读父的 baseURI）。
		var url = bricks.absurl(this.opts.url, this);
		var jc = new bricks.HttpJson();
		var resp = await jc.httpcall(url, {
			"method": this.opts.method || 'GET',
			"params": this.opts.params || {}
		});
		if (this.stopped){ return; }
		var wdesc = resp;
		var stop_refresh = false;
		if (resp && typeof resp === 'object' && !Array.isArray(resp)
				&& Object.prototype.hasOwnProperty.call(resp, 'widget')){
			wdesc = resp.widget;
			stop_refresh = !!resp.stop_refresh;
		}
		var w = null;
		if (wdesc){
			w = await bricks.widgetBuild(wdesc, {baseURI: url});
		}
		if (this.stopped){ return; }
		if (w){
			this.clear_widgets();
			this.add_widget(w)
		}
		if (stop_refresh){
			// 项目不再进行中：停在刚渲染的最终状态上，不再轮询（也不闪回）。
			this.stop();
			return;
		}
		if (this.is_in_dom() && !this.stopped){
			schedule_once(this.show_widget.bind(this), this.opts.period_seconds);
		} else {
			console.log('Stop load data from server');
		}
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
