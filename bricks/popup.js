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
			w.bind(ename, this.destroy.bind(this));
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
	}
	setup_resizable(){
		console.log('============= setup_resizable() called ================')
		this.resizable_w = new bricks.Svg({rate:1.5, url:bricks_resource('imgs/right-bottom-triangle.svg')});
		super.add_widget(this.resizable_w);
		this.resizable_w.set_css('resizebox');
		this.resizable_w.bind('mousedown', this.resize_start_pos.bind(this));
		this.resizable_w.bind('mousemove', this.resizing.bind(this));
		this.resizable_w.bind('mouseup', this.stop_resizing.bind(this));
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
		this.resize_status = true;
		console.log('= resize_stat_pos()', this.origin_event_x, this.origin_event_y)
	}
	resizing(e){
		var ele;
		ele = this.resizable_w.dom_element;
		if (ele != e.target || ! ele.contains(e.target)){	
			console.log("resizing():", ele, e.target);
			this.stop_resizing();
			return;
		}
		if (!this.resize_status){
			console.log("resizing():this.resize_status=false");
			this.stop_resizing();
			return;
		}
		e.preventDefault();
		if (this.is_resizing) {
			console.log("resizing(): resizing not finished");
			return;
		}
		if (this.origin_event_x === null || this.origin_event_y === null){
			console.log("resizing():this.origin_event_x or y is null");
			this.remember_event_pos(e);
			return;
		}
		this.is_resizing = true;
		var d = this.calculate_moving_pos(e);
		var cx, cy;
		cx = this.get_width() + d.x;
		cy = this.get_height() + d.y;
		this.set_style('width', cx + 'px');
		this.set_style('height',  cy + 'px');
		this.remember_event_pos(e);
		this.is_resizing = false;
		console.log('= resizing()', this.origin_event_x, this.origin_event_y, e.clientX,e.clientY, e.target)
	}

	stop_resizing(e){
		this.resize_status = false;
		this.is_resizing = false;
		this.forget_event_pos();
		console.log('= stop_resizing() called ');
	}
	
	positify_tl(){
		var rect, w, h, t, l;
		if (this.opts.eventpos && this.opts.origin_event){
			bricks.relocate_by_eventpos(this.opts.origin_event, this);
			return;
		}
		if (this.top && this.left){
			this.set_style('top', this.top);
			this.set_style('left', this.left);
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
		return {
			top:t,
			left:l
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
			this.auto_task.cancel();
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
					tip:'Destroy this window'
				},
				{
					name:'minimize',
					icon:bricks_resource('imgs/app_minimize.svg'),
					dynsize:true,
					tip:'minimize this window'
				},
				{
					name:'fullscreen',
					icon:bricks_resource('imgs/app_fullscreen.svg'),
					dynsize:true,
					tip:'fullscreen this window'
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
