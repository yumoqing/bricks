var bricks = window.bricks || {};

bricks.get_popup_default_options = function(){
	ret = {
		timeout:0,
		archor:'cc',
		auto_open:true,
		auto_dismiss:true,
		auto_destroy:true,
		movable:true,
		resizable:false,
		modal:true
	}
	if (bricks.is_mobile()) {
		ret.width = '100%';
		ret.height = '100%';
	} else {
		ret.width = '70%';
		ret.height = '70%';
	}
	return ret
}
bricks.Popup = class extends bricks.VBox {
	/*
	{
		timeout:0
		archor:one of ['tl', 'tc', 'tr', 'cl', 'cc', 'cr', 'bl','bc', 'br']
		widget:null for bricks.Body, string value for widget's id or a widget object;
		auto_open:boolean
		auto_dismiss:boolean
		auto_destroy:boolean
		movable:boolean
		dismiss_event:
		resizable:boolean
		modal:boolean
		content:{}
	*/
	constructor(opts){
		super(opts);
		this.no_opened = true;
		this.auto_task = null;
		this.issub = false;
		this.opened = false;
		this.set_css('popup');
		this.bring_to_top();
		this.is_resizing = false;
		this.origin_event_x = null;
		this.origin_event_y = null;
		this.resize_status = false;
		this.is_moving = false
		this.content_box = new bricks.VBox({height:'100%',width:'100%'});
		super.add_widget(this.content_box);
		this.content_w = this.content_box;
		this.moving_w = this;
		if (this.auto_dismiss){
			bricks.Body.bind('click', this.click_outside.bind(this));
		}
		this.target_w = bricks.Body;
		this.moving_status = false;
		if (this.movable){
			this.setup_movable();
			// console.log('movable ...');
		}
		if (this.resizable){
			this.setup_resizable();
		}
		this.set_style('display', 'none');
		bricks.Body.add_widget(this);
		this.bind('click', this.bring_to_top.bind(this));
		// 可视高度变化（转屏/软键盘弹出收起/桌面窗口缩进手机视口）时重钳弹窗高度。
		// visualViewport 优先（软键盘会触发它的 resize，window.resize 不一定触发）。
		// 无条件注册：构造时可能是桌面视口，之后缩窄进手机模式也要生效；
		// _mobile_clamp 内部自带 is_mobile() 判断，桌面模式是空操作。
		{
			var vv = window.visualViewport;
			var on_vv_resize = () => {
				if (!this.opened || !this.dom_element || !this.dom_element.isConnected) return;
				if (this._clamp_task) clearTimeout(this._clamp_task);
				this._clamp_task = setTimeout(() => { this._clamp_task = null; this._mobile_clamp(); }, 100);
			};
			if (vv && vv.addEventListener) vv.addEventListener('resize', on_vv_resize);
			window.addEventListener('resize', on_vv_resize);
			this._vv_resize_bound = on_vv_resize;
		}
		if (this.auto_open){
			this.open();
		}
		if (this.content){
			this.bind('opened', this.load_content.bind(this))
		}
	}
	async load_content(){
		var w = await bricks.widgetBuild(this.content, this);
		if (w){
			this.set_dismiss_events(w);
			this.content_w.clear_widgets();
			this.content_w.add_widget(w);
		}
	}
	set_dismiss_events(w){
		if (!this.dismiss_events) return;
		this.dismiss_events.forEach(ename => {
			w.bind(ename, this.dismiss.bind(this));
		});
	}
	bring_to_top(){
		if (this == bricks.app.toppopup){
			return;
		}
		if (bricks.app.toppopup)
			bricks.app.toppopup.set_css('toppopup', true);
		this.zindex = bricks.app.new_zindex();
		this.set_style('zIndex', this.zindex);
		console.log('this.zindex=', this.zindex, 'app.zindex=', bricks.app.zindex);
		this.set_css('toppopup');
		bricks.app.toppopup = this;
	}
	popup_from_widget(from_w){
		var myrect = this.showRectage();
		var rect = from_w.showRectage();
		var x,y;
		var ox, oy;
		ox = (rect.right - rect.left) / 2 + rect.left;
		oy = (rect.bottom - rect.top) / 2 + rect.top;
		if (ox < bricks.app.screenWidth() / 2) {
			x = rect.right + 3;
			if (x + (myrect.right - myrect.left) > bricks.app.screenWidth()){
				x = bricks.app.screenWidth() -  (myrect.right - myrect.left);
			}
		} else {
			x = rect.left - (myrect.right - myrect.left) - 3
			if (x < 0) x = 0;
		}
		if (oy < bricks.app.screenHeight() / 2){
			y = rect.bottom + 3;
			if (y + (myrect.bottom - myrect.top) > bricks.app.screenHeight()){
				y = bricks.app.screenHeight() -  (myrect.bottom - myrect.top);
			}
		} else {
			y = rect.bottom - (myrect.bottom - myrect.top) - 3
			if (y < 0) y = 0;
		}
		this.set_style('top', y + 'px');
		this.set_style('left', x + 'px');
		this._mobile_clamp();
	}
	setup_resizable(){
		console.log('============= setup_resizable() called ================')
		this.resizable_w = new bricks.Svg({rate:1.5, url:bricks_resource('imgs/right-bottom-triangle.svg')});
		super.add_widget(this.resizable_w);
		this.resizable_w.set_css('resizebox');
		this.resizable_w.bind('mousedown', this.resize_start_pos.bind(this));
		console.log('============= setup_resizable() finished  ================')
	}
	remember_event_pos(event){
		this.origin_event_x = event.clientX;
		this.origin_event_y = event.clientY;
	}
	forget_event_pos(){
		this.origin_event_x = null;
		this.origin_event_y = null;
	}
	calculate_moving_pos(event){
		return {
			x: event.clientX - this.origin_event_x,
			y: event.clientY - this.origin_event_y
		}
	}
	resize_start_pos(e){
		if (! this.resizable_w.dom_element.contains(e.target))
		{
			console.log('not event target', e.target);
			return;
		}
		e.preventDefault();
		this.remember_event_pos(e);
		this.current_width = this.current_width || this.get_width();
		this.current_height = this.current_height || this.get_height();
		this.resize_status = true;
		document.addEventListener('mousemove', 
				this.resizing_bound = this.resizing.bind(this));
		document.addEventListener('mouseup', 
				this.stop_resizing_bound = this.stop_resizing.bind(this));
		console.log('= resize_stat_pos()', this.origin_event_x, this.origin_event_y)
	}
	resizing(e){
		var ele;
		ele = this.resizable_w.dom_element;
		if (!this.resize_status){
			console.log("resizing():this.resize_status=false");
			this.stop_resizing();
			return;
		}
		if (this.is_resizing) {
			console.log("resizing(): resizing not finished");
			return;
		}
		if (this.origin_event_x === null || this.origin_event_y === null){
			console.log("resizing():this.origin_event_x or y is null");
			this.remember_event_pos(e);
			return;
		}
		e.preventDefault();
		this.is_resizing = true;
		var d = this.calculate_moving_pos(e);
		var cx, cy;
		this.current_width += d.x;
		this.current_height += d.y;
		this.set_style('width', this.current_width + 'px');
		this.set_style('height',  this.current_height + 'px');
		this.is_resizing = false;
		console.log('= resizing()', 
						this.origin_event_x, 
						this.origin_event_y, 
						e.clientX,
						e.clientY
		);
		this.remember_event_pos(e);
	}

	stop_resizing(e){
		this.resize_status = false;
		this.is_resizing = false;
		this.forget_event_pos();
		if (this.resizing_bound) 
			document.removeEventListener('mousemove', this.resizing_bound);
		if (this.stop_resizing_bound) 
			document.removeEventListener('mouseup', this.stop_resizing_bound);

		console.log('= stop_resizing() called ');
	}
	
	positify_tl(){
		var rect, w, h, t, l;
		if (this.opts.eventpos && this.opts.origin_event){
			bricks.relocate_by_eventpos(this.opts.origin_event, this);
			this._mobile_clamp();
			return;
		}
		if (this.top && this.left){
			this.set_style('top', this.top);
			this.set_style('left', this.left);
			this._mobile_clamp();
			return;
		}
		rect = bricks.app.showRectage();
		if (this.cwidth && this.cwidth > 0){
			w = this.cwidth * bricks.app.charsize;
		} else if (this.width){
			if (this.width.endsWith('px')){
				w = parseFloat(this.width);
			} else {
				w = parseFloat(this.width) * rect.width / 100;
			}
		} else {
			w = rect.width * 0.8;
		}
		if (this.cheight && this.cheight > 0){
			h = this.cheight * bricks.app.charsize;
		} else if (this.height){
			if (this.height.endsWith('px')){
				h = parseFloat(this.height);
			} else {
				h = parseFloat(this.height) * rect.height / 100;
			}
		} else {
			h = rect.height * 0.8;
		}
		var archor = this.archor || 'cc';
		switch(archor[0]){
			case 't':
				t = 0;
				break;
			case 'c':
				t = (rect.height - h) / 2;
				break;
			case 'b':
				t = rect.height - h;
				break;
			default:
				t = (rect.height - h) / 2;
				break;
		}	
		switch(archor[1]){
			case 'l':
				l = 0;
				break;
			case 'c':
				l = (rect.width - w) / 2;
				break;
			case 'r':
				l = rect.width - w;
				break;
			default:
				l = (rect.width - w) / 2;
				break;
		}	
		this.set_style('top', t + 'px');
		this.set_style('left', l + 'px');
		this._mobile_clamp();
		return {
			top:t,
			left:l
		}
	}
	/* 手机端弹窗高度钳制（2026-09-08 用户报障：弹窗高度超出屏幕，要求=屏幕高）。
	 * 根因：① positify_tl 用 body rect 高度算内联 px 高——手机上文档滚动后 body
	 *        可高于可视屏，百分比换算随之超屏；② CSS 的 100vh 在手机浏览器是
	 *        large viewport（含被地址栏/工具栏遮挡部分），大于 window.innerHeight。
	 * 修法：手机视口下统一以 window.innerHeight（真实可视高）钳制：
	 *   - PopupWindow（全屏语义）：高度恒等于可视高 - TabBar 实测高（CSS 里写死
	 *     56px，这里用 offsetHeight 实测，更准），setProperty important 覆盖
	 *     CSS !important，不依赖 dvh 的浏览器支持（微信 X5 等老内核无 dvh）；
	 *   - 普通 Popup（下拉/小提示等锚定控件）：只在超出可视屏时钳高并回拉 top。
	 * resize/键盘弹出（visualViewport resize）时对打开中的弹窗重钳。 */
	_mobile_clamp(){
		if (!bricks.is_mobile || !bricks.is_mobile()) return;
		var el = this.dom_element;
		if (!el || !el.isConnected) return;
		var vh = window.innerHeight;
		var vw = window.innerWidth;
		var is_win = (this instanceof bricks.PopupWindow);
		var reserve = 0;
		if (is_win){
			var tabbar = document.querySelector('.tabbar');
			if (tabbar && tabbar.style.display !== 'none') reserve = tabbar.offsetHeight || 0;
		}
		var maxh = Math.max(vh - reserve, 100);
		if (is_win || el.offsetHeight > maxh || this._mobile_clamped){
			el.style.setProperty('height', maxh + 'px', 'important');
			el.style.setProperty('max-height', maxh + 'px', 'important');
			this._mobile_clamped = true;
		}
		if (el.offsetWidth > vw){
			el.style.setProperty('width', vw + 'px', 'important');
			el.style.setProperty('max-width', vw + 'px', 'important');
		}
		if (!is_win){
			// 普通 Popup 定位钳制：确保整个弹窗落在可视屏内。
			// 高度被钳到≈铺满可视屏时，强制 top=0（否则居中的负 top 会把
			// 顶端切出屏外上方）；否则把 top 钳进 [0, vh-h] 区间。
			var h = el.offsetHeight;
			var raw_t = parseFloat(el.style.top);
			if (isNaN(raw_t)) raw_t = 0;
			var t;
			if (h >= vh){
				t = 0;
			} else {
				t = Math.min(Math.max(raw_t, 0), vh - h);
			}
			if (t !== raw_t){
				el.style.setProperty('top', t + 'px', 'important');
			}
		}
	}
			
	setup_movable(){
		this.moving_w.bind('mousedown', this.rec_start_pos.bind(this));
		this.moving_w.bind('touchstart', this.rec_start_pos.bind(this));
	}
	rec_start_pos(e){
		if (e.target != this.moving_w.dom_element) 
		{
			// console.log('moving star failed', e.target, this.moving_w.dom_element, 'difference  ...');
			return;
		}
		this.moving_status = true;
		var rect = this.showRectage();
		this.offsetX = e.clientX - rect.left;
		this.offsetY = e.clientY - rect.top;
		// console.log(rect, '========', this.offsetX, this.offsetY, e.clientX, e.clientY);
		
		bricks.Body.bind('mouseup', this.stop_moving.bind(this));
		bricks.Body.bind('touchend', this.stop_moving.bind(this));
		this.moving_w.bind('mousemove', this.moving.bind(this));
		this.moving_w.bind('touchmove', this.moving.bind(this));
		e.preventDefault();
		// console.log('moving started ...');
	}
	moving(e){
		if (e.target != this.moving_w.dom_element){
			// console.log('moving failed', e.target, this.moving_w.dom_element, 'difference  ...');
			this.stop_moving();
		}
		if (!this.moving_status){
			// console.log('moving failed', 'not started  ...');
			return;
		}
		var cx, cy;
		cx = e.clientX - this.offsetX;
		cy = e.clientY - this.offsetY;
		// console.log(cx, cy, e.clientX, e.clientY, this.offsetX, this.offsetY, '==========');
		this.set_style('left', cx + 'px');
		this.set_style('top',  cy + 'px');
		e.preventDefault();
	}
	stop_moving(e){
		// console.log('stop moving ....');
		this.moving_status = false;
		this.moving_w.unbind('mousemove', this.moving.bind(this));
		this.moving_w.unbind('touchmove', this.moving.bind(this));
		bricks.Body.unbind('mouseup', this.stop_moving.bind(this));
		bricks.Body.unbind('touchend', this.stop_moving.bind(this));
		// 手机端拖拽结束重钳：防止拖出可视屏底部（高度超屏回拉）
		this._mobile_clamp();
	}
	click_outside(event){
		if (event.target != this.dom_element){
			this.dismiss();
		}
	}
	open(){
		if (!this.parent){
			bricks.app.add_widget(this);
		}
		var rect, w, h;
		if (this.opened) {
			return;
		}
		this.opened = true;
		if (this.no_opened){
			if (this.widget instanceof bricks.JsWidget){
				this.target_w = this.widget;
				this.issub = true;
			} else {
				var w = bricks.getWidgetById(this.widget, bricks.Body);
				if (w){
					this.issub = true
					this.target_w = w;
				} 
			}
		}
		this.no_opened = false;
		this.set_style('display', 'block');
		this.dispatch('opened');
		if (this.timeout > 0){
			this.auto_task = schedule_once(this.dismiss.bind(this), this.timeout)
		}
		if (this.opts.modal && this.opts.widget){
			this.target_w.disabled(true);
		}
		this.bring_to_top();
		this.positify_tl();
	}
	dismiss(){
		if (! this.opened) return;
		if (this.opts.modal){
			this.target_w.disabled(false);
		}
		this.opened = false;
		if (this.auto_task){
			setTimeout(this.auto_task);
			this.auto_task = null;
		}
		this.set_style('display','none');
		this.dispatch('dismissed');
		if (this.auto_destroy){
			this.destroy();
			this.dispatch('destroy');
		}
	}
	destroy(){
		if (this.opened){
			this.dismiss();
		}
		// 清掉手机视口 resize 监听，防止弹窗销毁后监听器泄漏
		if (this._vv_resize_bound){
			var vv = window.visualViewport;
			if (vv && vv.removeEventListener) vv.removeEventListener('resize', this._vv_resize_bound);
			window.removeEventListener('resize', this._vv_resize_bound);
			this._vv_resize_bound = null;
		}
		if (this._clamp_task){
			clearTimeout(this._clamp_task);
			this._clamp_task = null;
		}
		if (this.parent){
			this.parent.remove_widget(this);
			this.parent = null;
		}
	}
	add_widget(w, i){
		this.set_dismiss_events(w);
		this.content_w.add_widget(w, i);
		if (this.auto_open){
			this.open();
		}
	}
	remove_widget(w){
		return this.content_w.remove_widget(w);
	}
	clear_widgets(){
		return this.content_w.clear_widgets();
	}
}

bricks.get_popupwindow_default_options = function(){
	ret = {
		timeout:0,
		archor:'cc',
		auto_open:true,
		auto_dismiss:true,
		auto_destroy:true,
		movable:true,
		resizable:true,
		modal:true
	}
	if (bricks.is_mobile()) {
		ret.width = '100%';
		ret.height = '100%';
	} else {
		ret.width = '70%';
		ret.height = '70%';
	}
	return ret
}
bricks.WindowsPanel = class extends bricks.Popup {
	open(){
		this.auto_open = false;
		var dc = new bricks.DynamicColumn({});
		bricks.app.mwins.forEach(x => {
			var w = new bricks.VBox({
				"css": "mini-window card"
			});
			dc.add_widget(w);
			w.bind('click', this.reopen_window.bind(this, x));
			var tw = new bricks.Title6({
				width:'100%',
				wrap:true,
				text:x.title
			});
			var iw = new bricks.Svg({url:x.icon, rate:1.5});
			w.add_widget(iw);
			w.add_widget(tw);
		});
		this.add_widget(dc);
		super.open();
	}

	reopen_window(w){
		var nws = [];
		w.open();
		bricks.app.mwins.forEach(x => {
			if (x != w) nws.push(x);
		});
		bricks.app.mwins = nws;
		this.dismiss();
	}
}
bricks.PopupWindow = class extends bricks.Popup {
	/*
	{
		title:
		icon:
	}
	*/
	constructor(opts){
		opts.movable = true;
		opts.resizable = true;
		var ao = opts.auto_open;
		opts.auto_open = false
		opts.auto_dismiss = false;
		opts.auto_destroy = false;
		super(opts);
		this.set_css('popupwindow');   // 移动端全屏化 CSS 依赖此类（区别于下拉/提示等普通 Popup）
		this.auto_open = ao;
		this.title_bar = new bricks.HBox({css:'titlebar', cheight:2, width:'100%'});
		this.moving_w = this.title_bar;
		this.add_widget(this.title_bar);
		this.build_title_bar();
		var filler = new bricks.Filler({});
		this.add_widget(filler)

		this.content_w = new bricks.Layout({height:'100%', width:'100%'});
		this.content_w.set_css('flexbox');
		filler.add_widget(this.content_w);
		if (this.auto_open){
			schedule_once(this.open.bind(this), 0.2);
		}
		console.log('resizalbe=', this.resizable);
	}
	build_title_bar(){
		this.url = this.opts.icon || bricks_resource('imgs/app.svg');
		this.title = this.opts.title || "[Untitle window]";
		var icon = new bricks.Svg({
			rate:this.opts.rate,
			url:this.url
		});
		this.title_bar.add_widget(icon);
		this.tb_w = new bricks.IconBar( {
			cheight:1,
			margin:'5px',
			rate:0.8,
			tools:[
				{
					name:'delete',
					icon:bricks_resource('imgs/app_delete.svg'),
					dynsize:true,
					tip:bricks.app.i18n._('Destroy this window')
				},
				{
					name:'minimize',
					icon:bricks_resource('imgs/app_minimize.svg'),
					dynsize:true,
					tip:bricks.app.i18n._('minimize this window')
				},
				{
					name:'fullscreen',
					icon:bricks_resource('imgs/app_fullscreen.svg'),
					dynsize:true,
					tip:bricks.app.i18n._('fullscreen this window')
				}
			]
		});
		this.title_bar.add_widget(this.tb_w);
		this.tb_w.bind('delete', this.destroy.bind(this));
		this.tb_w.bind('minimize', this.win_minimize.bind(this));
		this.tb_w.bind('fullscreen', this.content_w.enter_fullscreen.bind(this.content_w));
		if (this.title){
			this.title_w = new bricks.Text({
				otext:this.title,
				i18n:true
			});
			this.title_bar.add_widget(this.title_w);
		}
	}
	win_minimize(){
		this.dismiss();
		if (! this.auto_destroy){
			bricks.app.mwins.push(this);
		}
	}
	set_title(txt){
		if (this.title_w){
			this.title_w.set_text(txt);
		}
	}
}

bricks.Factory.register('Popup', bricks.Popup);
bricks.Factory.register('PopupWindow', bricks.PopupWindow);
