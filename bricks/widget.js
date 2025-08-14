var bricks = window.bricks || {};
/* 
We use ResizeObserver to implements dom object resize event
*/
bricks.resize_observer = new ResizeObserver(entries => {
	for (let entry of entries){
		const cr = entry.contentRect;
		const ele = entry.target;
		const w = ele.bricks_widget;
		// console.log('size=', cr, 'element=', ele, w);
		if (w){
			w.dispatch('element_resize', cr);
		}
	}
});

bricks.JsWidget = class {
	/*
	popup:{
		popup_event:
		popup_desc:
		popupwindow:false or true
	}
	bgimage:url
	*/
	constructor(options){
		if (!options){
			options = {}
		}
		this.dom_element = null;
		this.baseURI = options.baseURI;
		this.opts = options;
		this.create();
		this.opts_set_style();
		this._container = false;
		this.parent = null;
		this.sizable_elements = [];
		this.set_id(bricks.uuid());
		if (options.css){
			this.set_css(options.css);
		}
		if (options.csses){
			this.set_csses(options.csses);
		}
		this.dom_element.bricks_widget = this;
		if (this.opts.tip){
			var w = bricks.app.tooltip;
			this.bind('mousemove', w.show.bind(w, this.opts.tip));
			this.bind('mouseout', w.hide.bind(w));
			this.bind('click', w.hide.bind(w));
		}
		if (this.popup){
			this.bind(this.popup.popup_event, this.popup_action.bind(this));
		}
		if (this.bgimage){
			this.set_bg_image(this.bgimage);
		}
		bricks.resize_observer.observe(this.dom_element);
	}
	set_bg_image(url){
		var d = this.dom_element;
		d.style.backgroundImage = "url('" +url + "')";
		d.style.backgroundSize = "cover";       // 背景图4填满容器
		d.style.backgroundPosition = "center";  // 居中显示
		d.style.backgroundRepeat = "no-repeat"; // 不重复
	}
	destroy_popup(){
		this.popup_widget.destroy();
		this.popup_widget = null;
	}
	async popup_action(){
		if (this.popup_widget){
			this.popup_widget.destroy();
			this.popup_widget = null;
		} else {
			if (this.popup.popupwindow){
				this.popup_widget = new bricks.PopupWindow(this.popup.optiosn);
			} else {
				this.popup_widget = new bricks.Popup(this.popup.options);
			}
			this.popup_widget.bind('dismissed', this.destroy_popup.bind(this));
			var w = await bricks.widgetBuild(this.popup.popup_desc, this, this.user_data);
			if (w){
				this.popup_widget.add_widget(w);
				this.popup_widget.open();
				this.popup_widget.popup_from_widget(this);
			}
		}
	}
	showRectage(){
		return this.dom_element.getBoundingClientRect();
	}
	is_in_dom(){
		return document.contains(this.dom_element);
	}
	getUserData(){
		return this.user_data || null;
	}
	setUserData(v){
		this.user_data = v;
	}
	create(){
		this.dom_element = this._create('div')
	}
	_create(tagname){
		return document.createElement(tagname);
	}
	observable(name, value){
		return new bricks.Observable(this, name, value);
	}
	disabled(flag){
		if(flag){
			this.dom_element.disabled = true;
			this.set_style('pointerEvents', 'none');
		} else {
			this.dom_element.disabled = false;
			this.set_style('pointerEvents', 'auto');
		}
	}
	opts_set_style(){
		var keys = [
			"width",
			"dynsize",
			"x",
			"y",
			"height",
			"cursor",
			"margin",
			"marginLeft",
			"marginRight",
			"marginTop",
			"marginBottom",
			"padding",
			"align",
			"textAlign",
			"overflowY",
			"overflowX",
			"overflow",
			"flexShrink",
			"minWidth",
			"maxWidth",
			"minHeight",
			"maxHeight",
			"marginLeft",
			"marginRight",
			"marginTop",
			"marginBottom",
			"zIndex",
			"overflowX",
			"overflowY",
			"color"
		];
		var mapping_keys = {
			"bgcolor":"backgroundColor"
		};
		var mkeys = Object.keys(mapping_keys);
		var style = {};
		var okeys = Object.keys(this.opts);
		for (var k=0; k<okeys.length; k++){
			if (keys.find( i => i ==okeys[k])){
				style[okeys[k]] = this.opts[okeys[k]];
			}
			if (mkeys.find( i => i ==okeys[k])){
				var mk = mapping_keys[okeys[k]];
				style[mk] = this.opts[okeys[k]];
			}
			this[okeys[k]] = this.opts[okeys[k]];
		}
		if (this.opts.cwidth){
			this.width = bricks.app.charsize * this.opts.cwidth;
			style.width = this.width + 'px';
		}
		if (this.opts.cheight){
			this.height = bricks.app.charsize * this.opts.cheight;
			style.height = this.height + 'px';
		}
		if (this.opts.dynsize){
			bricks.app.bind('charsize', this.charsize_sizing.bind(this))
		}
		bricks.extend(this.dom_element.style, style);
		if (this.opts.css){
			this.set_css(this.opts.css);
		}
	}
	charsize_sizing(){
		var cs = bricks.app.charsize;
		var r = this.rate || 1;
		if (this.cwidth){
			this.set_style('width', this.cwidth * cs * r + 'px');
		}
		if (this.cheight){
			this.set_style('height', this.cheight * cs * r + 'px');
		}
		if (this.cfontsize){
			this.dom_element.style.fontSize = this.cfontsize * cs * r + 'px';
			if (this.sizable_elements){
				for (var i=0;i<this.sizable_elements.length;i++){
					var e = this.sizable_elements[i];
					e.style.fontSize = this.cfontsize * cs * r + 'px';
				}
			}
		}
	}
	enter_fullscreen(){
		var e = this.dom_element;
		// 获取要全屏显示的元素
		// 检查浏览器是否支持Fullscreen API
		if (e.requestFullscreen) {
			e.requestFullscreen();
		} else if (e.mozRequestFullScreen) { // Firefox
			e.mozRequestFullScreen();
		} else if (e.webkitRequestFullscreen) { // Chrome, Safari and Opera
			e.webkitRequestFullscreen();
		} else if (e.msRequestFullscreen) { // IE/Edge
			e.msRequestFullscreen();
		}
	}
	exit_fullscreen(){
		document.exitFullscreen();
	}
	h_center(){
		this.dom_element.style.marginLeft = 'auto';
		this.dom_element.style.marginRight = 'auto';
	}
	h_left(){
		this.dom_element.style.marginLeft = '0px';
		this.dom_element.style.marginRight = 'auto';
	}
	h_right(){
		this.dom_element.style.marginLeft = 'auto';
		this.dom_element.style.marginRight = '0px';
	}
	ht_center(){
		this.dom_element.style.textAlign = 'center';
	}
	ht_left(){
		this.dom_element.style.textAlign = 'left';
	}
	ht_right(){
		this.dom_element.style.textAlign = 'right';
	}
	set_width(width){
		if (typeof(width) == 'number'){
			width = width + 'px';
		}
		this.dom_element.style.width = width;
	}
	set_height(height){
		if (typeof(height) == 'number'){
			height = height + 'px';
		}
		this.dom_element.style.height = height;
	}
	set_style(k, v){
		this.dom_element.style[k] = v;
	}
	set_csses(csses, remove_flg){
		var arr = csses.split(' ');
		arr.forEach(c =>{
			this.set_css(c, remove_flg);
		})
	}
	unset_css(css){
		this.dom_element.classList.remove(css);
	}
	set_css(css, remove_flg){
		if (!remove_flg){
			this.dom_element.classList.add(css);
		} else {
			this.dom_element.classList.remove(css);
		}
	}
	set_cssObject(cssobj){
		bricks.extend(this.dom_element.style, cssobj);
	}
	is_container(){
		return this._container;
	}
	set_id(id){
		this.id = id;
		this.dom_element.id = id;
	}
	set_baseURI(uri){
		this.baseURI = uri;
		if (!this._container){
			return;
		}
		this.children.forEach(c =>{
			if (!c.baseURI){
				c.set_baseURI(uri);
			}
		});
	}
	show(){
		this.dom_element.style.display = '';
	}
	hide(){
		this.dom_element.style.display = 'none'
	}
	is_hide(){
		return this.dom_element.style.display == 'none';
	}
	toggle_hide(){
		if (this.dom_element.style.display == 'none'){
			this.show();
		} else {
			this.hide();
		}
	}
	get_width(){
		return this.dom_element.clientWidth;
	}
	get_height(){
		return this.dom_element.clientHeight;
	}
	bind(eventname, handler){
		this.dom_element.addEventListener(eventname, handler);
	}
	unbind(eventname, handler){
		this.dom_element.removeEventListener(eventname, handler);
	}
	dispatch(eventname, params){
		if (! params){
			params = {};
		}
		params.referer = this.id;
		var e = new Event(eventname);
		e.params = params;
		this.dom_element.dispatchEvent(e);
	}
	set_attribute(attr, value){
		this.dom_element.setAttribute(attr, value);
	}
	get_attribute(attr) {
		this.dom_element.getAttribute(attr);
	}
	selected(flag){
		if(flag){
			this.set_css('selected');
		} else {
			this.set_css('selected', true);
		}
	}
}


bricks.TextBase = class extends bricks.JsWidget {
	/* {
		otext:
		i18n:
		rate:
		halign:
		valign:
		color:
		bgtcolor:
		css
	}
	*/
	constructor(options){
		super(options);
		this.opts = options;
		this.rate = this.opts.rate || 1;
		this.specified_fontsize = false;
		this.set_attrs();
		this.dom_element.style.fontWeight = 'normal';
		if (self.i18n){
			bricks.app.bind('lang', this.set_i18n_text.bind(this));
		}
	}
	set_attrs(){
		if (this.opts.hasOwnProperty('text')){
			this.text = this.opts.text;
		}
		if (this.opts.hasOwnProperty('otext')){
			this.otext = this.opts.otext;
		}
		if (this.opts.hasOwnProperty('i18n')){
			this.i18n = this.opts.i18n;
		}
		this._i18n = new bricks.I18n();
		this.set_style('flexShrink', '0'); 
		if (this.i18n && this.otext) {
			this.text = this._i18n._(this.otext);
		}
		this.dom_element.innerHTML = this.text;
	}
	set_otext(otxt){
		var text;
		this.otext = otxt;
		if (this.i18n) {
			text = this._i18n._(this.otext);
		} else {
			text = this.otext;
		}
		this.set_text(text);
	}
	set_i18n_text(){
		if ( !this.otext){
			return;
		}
		if (! this.i18n){
			return;
		}
		this.set_text(this.otext);
	}
	set_text(text){
		this.text = text;
		this.dom_element.innerHTML = this.text;
	}
		
}

bricks.Text = class extends bricks.TextBase {
	constructor(opts){
		super(opts);
		this.cfontsize = 1;
		this.charsize_sizing();
	}
}

bricks.KeyinText = class extends bricks.Text {
	constructor(opts){
		super(opts);
		if (! this.name) {
			this.name = 'data';
		}
		bricks.app.bind('keydown', this.key_down_action.bind(this))
	}
	key_down_action(event){
		if (! event.key) return;
		switch (event.key) {
			case 'Delete':
				this.set_text('');
				this.dispatch_changed();
				break;
			case 'Backspace':
				var s = this.text.substring(0, this.text.length - 1);
				this.set_text(s);
				this.dispatch_changed();
				break;
			default:
				if (event.key.length == 1){
					var txt = this.text + event.key;
					this.set_text(txt);
					this.dispatch_changed();
				}
				break;
		}
	}
	dispatch_changed(){
		var d = {};
		d[this.name] = this.text;
		this.dispatch('changed', d);
	}
}

bricks.Title1 = class extends bricks.TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title1';
		this.dom_element.style.fontWeight = 'bold';
		this.cfontsize = 1.96;
		this.charsize_sizing();
	}
}

bricks.Title2 = class extends bricks.TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title2';
		this.dom_element.style.fontWeight = 'bold';
		this.cfontsize = 1.80;
		this.charsize_sizing();
	}
}

bricks.Title3 = class extends bricks.TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title3';
		this.dom_element.style.fontWeight = 'bold';
		this.cfontsize = 1.64;
		this.charsize_sizing();
	}
}

bricks.Title4 = class extends bricks.TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title4';
		this.dom_element.style.fontWeight = 'bold';
		this.cfontsize = 1.48;
		this.charsize_sizing();
	}
}

bricks.Title5 = class extends bricks.TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title5';
		this.dom_element.style.fontWeight = 'bold';
		this.cfontsize = 1.32;
		this.charsize_sizing();
	}
}

bricks.Title6 = class extends bricks.TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title6';
		this.dom_element.style.fontWeight = 'bold';
		this.cfontsize = 1.16;
		this.charsize_sizing();
	}
}

bricks.Tooltip = class extends bricks.Text {
	constructor(opts){
		opts.rate = 0.8;
		opts.tip = null;
		super(opts);
		this.set_css('modal');
		this.set_style('minWidth', '90px');
		this.auto_task = null;
	}
	show(otext, event){
		this.set_otext(otext);
		this.set_style('zIndex', 999999999);
		this.set_style('display', 'block');
		bricks.relocate_by_eventpos(event, this);
		if (this.auto_task){
			this.auto_task.cancel();
			this.auto_task = null;
		}
		this.auto_task = schedule_once(this.hide.bind(this), 6);
	}
	hide(){
		try {
		if (this.auto_task){
			this.auto_task.cancel();
			this.auto_task = null;
		}
		} catch(e){
			console.log('Exception:', e);
		}
		this.set_style('display', 'none');
	}
}

bricks.Factory.register('Tooltip', bricks.Tooltip);
bricks.Factory.register('Text', bricks.Text);
bricks.Factory.register('KeyinText', bricks.KeyinText);
bricks.Factory.register('Title1', bricks.Title1);
bricks.Factory.register('Title2', bricks.Title2);
bricks.Factory.register('Title3', bricks.Title3);
bricks.Factory.register('Title4', bricks.Title4);
bricks.Factory.register('Title5', bricks.Title5);
bricks.Factory.register('Title6', bricks.Title6);

