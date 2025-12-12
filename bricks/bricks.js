var bricks = window.bricks || {};
bricks.app = null;
/*
all type of bind action's desc has the following attributes:
	actiontype:'bricks',
	wid:
	event:
	target:
datawidget:
datascript:
datamethod:
datakwargs:
rtdata:
conform:
and each type of binds specified attributes list following

urlwidget action:
mode:,
options:{
	method:
	params:{},
	url:
}

bricks action:
mode:,
options:{
	"widgettype":"gg",
	...
}

method action:
method:
params: for methods kwargs


script action:
script:
params:

registerfunction action:
rfname:
params:

event action:
dispatch_event:
params:
*/

bricks.uuid = function(){
	try{
		var d = crypto.randomUUID();
		var lst = d.split('-');
		return lst.join('');
	} catch(e) {
		const vv = '1234567890qwertyuiopasdfghjklzxcvbnm';
		var ret = '';
		for (var i=0;i<30;i++){
			var j = parseInt(Math.random() * vv.length);
			ret = ret + vv[j];
		}
		console.log('uuid() return', ret);
		return ret;
	}
}

bricks.deviceid = function(appname){
	var deviceid = appname + 'deviceid';
	var id = localStorage.getItem(deviceid);
	if (!id){
		id = bricks.uuid();
		localStorage.setItem(deviceid, id);
	}
	return id;
}

bricks.str2data = function(s, d){
	/* fmt like 
		'my name is ${name}, ${age:type}'
		type can be:
			int, str, json
	*/
	funcs = {
		'json':JSON.stringify
	}
	var regex = /\${(\w+)(?::(int|str|json))?}/;
	var match = s.match(regex)
	if (match){
		var key = match[1];
		var typ = match[2];
		var ss = '${' + key;
		if (typ != ''){
			ss += ':' + typ;
		}
		ss += '}';
		if (s == ss){
			if (!d.hasOwnProperty(key)){
				return null;
			}
			if (typ == ''){
				return d[key];
			}
			var f = funcs[typ];
			if (f){
				return f(d[key]);
			}
			return d[key];
		}
		return s.replace(regex, (k, key, typ) => {
			if (d.hasOwnProperty(key)){
				var f = funcs[typ];
				if (f){
					return f(d[key]);
				}
				return d[key];
			}
			return '';
		});
	}
	return s;
}
bricks.apply_data = function(desc, data){
	if (bricks.is_empty(data)){
		return desc;
	}
	var tmpl = JSON.stringify(desc);
	var s = bricks.obj_fmtstr(data, tmpl);
	return JSON.parse(s);
}

bricks.widgetBuild = async function(desc, widget, data){
	if (! widget){
		widget = bricks.Body;
	}
	var klassname = desc.widgettype;
	var base_url = widget.baseURI;
	while (klassname == 'urlwidget'){
		if (data){
			desc = bricks.apply_data(desc, data);
		}
		let url = bricks.absurl(desc.options.url, widget);
		base_url = url;
		let method = desc.options.method || 'GET';
		let opts = desc.options.params || {};
		var jc = new bricks.HttpJson();
		var desc1 = await jc.httpcall(url, { "method":method, "params":opts});
		if (!desc1) return;
		desc = desc1;
		klassname = desc.widgettype;
	}
	if (data){
		desc = bricks.apply_data(desc, data);
	}
	if (!desc.widgettype){
		console.log('widgettype is null', desc);
		return null;
	}
	let klass = bricks.Factory.get(desc.widgettype);
	if (! klass){
		console.log('widgetBuild():', 
					desc.widgettype, 
					'not registered', 
					bricks.Factory.widgets_kw);
		return null;
	}
	var options = desc.options || {};
	options.baseURI = base_url;
	let w = new klass(options);
	if (! w){
		console.log('w is null');
	}
	if (desc.id){
		w.set_id(desc.id);
	}
	if (w.is_container() && desc.subwidgets){
		for (let i=0; i<desc.subwidgets.length; i++){
			let sdesc = desc.subwidgets[i];
			let sw = await (bricks.widgetBuild(sdesc, w, data));
			if ( sw ){
				w.add_widget(sw);
			} else {
				bricks.debug('widgetBuild() error: sdesc=', sdesc);
			}
		}
	}
	if (desc.hasOwnProperty('binds')){
		for (var i=0;i<desc.binds.length; i++){
			await bricks.buildBind(w, desc.binds[i]);
		}
	}
	return w;
}

bricks.buildBind = async function(w, desc){
	var widget = bricks.getWidgetById(desc.wid, w);
	if (!widget){
		console.log('desc wid not find', desc);
		return;
	}
	var event = desc.event;
	desc.event_widget = widget;
	await bricks.buildEventBind(w, widget, event, desc);
}

bricks.buildEventBind = async function(from_widget, widget, event, desc){
	var handler = bricks.universal_handler.bind(null,from_widget, widget, desc);
	widget.bind(event, handler);
}

bricks.universal_handler = async function(from_widget, widget, desc, event){
	var f = await bricks.buildEventHandler(from_widget, desc, event);
	if (f){
		if (desc.conform){
			var c_desc = {
				"widgettype":"Conform",
				"options":desc.conform
			}
			var conform_widget = await bricks.widgetBuild(c_desc, widget);
			conform_widget.bind('conformed', f);
			// handler = conform_widget.open.bind(conform_widget);
		} else {
			return await f(event);
		}
	}
	bricks.debug('universal_handler() error', 'from_widget=', 
						from_widget,
						'widget=', widget, 
						'desc=', desc,
						event);
}
bricks.default_popup = function(opts){
	var popts = bricks.get_popup_default_options();
	bricks.extend(popts, opts);
	return new bricks.Popup(popts);
}
bricks.default_popupwindow = function(opts){
	var popts = bricks.get_popupwindow_default_options();
	bricks.extend(popts, opts);
	return new bricks.PopupWindow(popts);
}
bricks.buildEventHandler = async function(w, desc, event){
	var target;
	if (desc.target == 'Popup'){
		target = bricks.default_popup(desc.popup_options || {});
	} else if (desc.target == 'PopupWindow') {
		target = bricks.default_popupwindow(desc.popup_options || {});
	} else if ( desc.target instanceof bricks.JsWidget ) {
		target = desc.target;
	} else {
		target = bricks.getWidgetById(desc.target, w);
	}
	if (! target){
		bricks.debug('target miss desc=', desc, 'w=', w);
		return null
	}
	var rtdata = {};
	desc.event_params = event.params || {} ;
	desc.event = event;
	if (desc.rtdata) rtdata = desc.rtdata;
	else if (desc.datawidget){
		var data_desc = {
			widget:desc.datawidget,
			method:desc.datamethod || 'getValue',
			params:desc.dataparams,
			script:desc.datascript
		}
		rtdata = await bricks.getRealtimeData(w, data_desc);
	}
	var widget = bricks.getWidgetById(desc.wid, w);
	rtdata.referer_widget = widget.id;
	switch (desc.actiontype){
		case 'newwindow':
			return bricks.buildNewWindowHandler(w, target, rtdata, desc);
			break;
		case 'iframe':
			break;
		case 'urlwidget':
			return bricks.buildUrlwidgetHandler(w, target, rtdata, desc);
			break;
		case 'bricks':
			return bricks.buildBricksHandler(w, target, rtdata, desc);
			break;
		case 'registerfunction':
			return bricks.buildRegisterFunctionHandler(w, target, rtdata, desc);
			break;
		case 'method':
			return bricks.buildMethodHandler(w, target, rtdata, desc);
			break;
		case 'script':
			var f = bricks.buildScriptHandler(w, target, rtdata, desc);
			return f;
			break;
		case 'event':
			return bricks.buildDispatchEventHandler(w, target, rtdata, desc);
			break;
		default:
			bricks.debug('invalid actiontype', target, desc);
			break;
	}
}
bricks.getRealtimeData = async function(w, desc){
	var target = bricks.getWidgetById(desc.widget, w);
	var f;
	bricks.debug('getRealtimeData() calling ...');
	if (! target){
		bricks.debug('target miss', desc);
		return null
	}
	if (desc.method){
		f = bricks.buildMethodHandler(null, target, null, desc)
		return f();
	}
	if (desc.script){
		f = bricks.buildScriptHandler(null, target, null, desc)
		return await f();
	}
	debug('getRealtimeData():desc=', desc, 'f=', f);
	return null;
}

var _buildWidget = async function(from_widget, target, mode, options, desc){
	bricks.debug('target=', target, 'mode=', mode, 'options=', options);
	var w = await (bricks.widgetBuild(options, from_widget));
	if (!w){
		bricks.debug('options=', options, 'widgetBuild() failed');
		return;
	}
	if (w instanceof bricks.Popup) {
		return
	}
	if (w.parent) {
		if (target instanceof bricks.Popup || target instanceof bricks.PopupWindow){
			target.destroy();
		}
		return;
	}
	if (target instanceof bricks.Popup || target instanceof bricks.PopupWindow) {
		if (! target.parent){
			bricks.app.add_widget(target);
		}
		if (desc.popup_options){
			if (desc.popup_options.eventpos){
				target.bind('opened', bricks.relocate_by_eventpos.bind(null, desc.event, target));
			}
		}
	}
	if (mode == 'replace'){
		target.clear_widgets();
		target.add_widget(w);
	} else if (mode == 'insert'){
		target.add_widget(w, 0);
	} else {
		target.add_widget(w);
	}
	if (target instanceof bricks.Popup || target instanceof bricks.PopupWindow) {
		target.open();
	}
}

bricks.buildNewWindowHandler = function(w, target, rtdata, desc){
	var options = objcopy(desc.options||{});
	var url = options.url;
	var params = options.params;
	if (desc.event_params instanceof FormData){
		console.log('can not send Formdata');
		return;
	}
	rtdata = bricks.extend(rtdata, desc.event_params);
	options = bricks.apply_data(options, rtdata);
	if (desc.params_mapping){
		rtdata = bricks.map(rtdata, desc.params_mapping.mapping, desc.params_mapping.need_others);
	}
	options.params = bricks.extend(params, rtdata);
	var url = options.url;
	url = addParamsToUrl(url, options.params, w);
	var opts = {
		widgettype: "NewWindow",
		options:{
			name: options.name || '_blank',
			url: url
		}
	}
	return _buildWidget.bind(null, w, target, desc.mode || 'replace', opts, desc);
}
bricks.buildUrlwidgetHandler = function(w, target, rtdata, desc){
	var options = objcopy(desc.options||{});
	var params = options.params || {};
	if (desc.event_params instanceof FormData){
		var params = desc.event_params;
		for ( const [key, value] of Object.entries(rtdata)){
			params.append(key, value);
		}
		options = bricks.apply_data(options, rtdata);
		for ( const [key, value] of Object.entries(options.params||{})){
			params.append(key, value);
		}
		options.params = params;
		options.method = "POST";
	} else {
		rtdata = bricks.extend(rtdata, desc.event_params);
		options = bricks.apply_data(options, rtdata);
		if (desc.params_mapping){
			rtdata = bricks.map(rtdata, desc.params_mapping.mapping, desc.params_mapping.need_others);
		}
		options.params = bricks.extend(params, rtdata);
	}
	var opts = {
		"widgettype":"urlwidget",
		"options":options
	}
	return _buildWidget.bind(null, w, target, desc.mode || 'replace', opts, desc);
}
bricks.buildBricksHandler = function(w, target, rtdata, desc){
	var options = objcopy(desc.options||{});
	rtdata = bricks.extend(rtdata, inputdata2dic(desc.event_params));
	if (desc.params_mapping){
		rtdata = bricks.map(rtdata, desc.params_mapping.mapping, desc.params_mapping.need_others);
	}
	options = bricks.apply_data(options, rtdata);
	return _buildWidget.bind(w, target, target, desc.mode || 'replace', options, desc);
}
bricks.buildRegisterFunctionHandler = function(w, target, rtdata, desc){
	var f = bricks.RF.get(desc.rfname);
	if( ! f){
		bricks.debug('rfname:', desc.rfname, 'not registed', desc);
		return null;
	}
	if (desc.params_mapping){
		rtdata = bricks.map(rtdata, desc.params_mapping.mapping, desc.params_mapping.need_others);
	}
	var params = {};
	if (desc.params){
		bricks.extend(params, desc.params);
	}
	if (rtdata){
		bricks.extend(params, rtdata);
	}
	bricks.extend(params, inputdata2dic(desc.event_params));
	params = bricks.apply_data(params, rtdata);
	return f.bind(target, params);
}
bricks.buildMethodHandler = function(w, target, rtdata, desc){
	var f = target[desc.method];
	if (! f){
		bricks.debug('desc:', desc, 'not exists in', target, 'w=', w);
		return null;
	}
	var params = {};
	bricks.extend(params, desc.params)
	bricks.extend(params, rtdata);
	bricks.extend(params, inputdata2dic(desc.event_params));
	if (desc.params_mapping){
		rtdata = bricks.map(rtdata, desc.params_mapping.mapping, desc.params_mapping.need_others);
	}
	params = bricks.apply_data(params, rtdata);
	return f.bind(target, params);
}
bricks.buildScriptHandler = function(w, target, rtdata, desc){
	var params = {};
	bricks.extend(params, desc.params)
	bricks.extend(params, rtdata);
	bricks.extend(params, inputdata2dic(desc.event_params));
	if (desc.params_mapping){
		rtdata = bricks.map(rtdata, desc.params_mapping.mapping, desc.params_mapping.need_others);
	}
	params = bricks.apply_data(params, rtdata);
	var AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
	var f = new AsyncFunction('params', 'event', desc.script);
	return f.bind(target, params);
}
bricks.buildDispatchEventHandler = function(w, target, rtdata, desc){
	var f = function(event_name, params, event){
		// console.log('target=', target, 'event_name=', event_name, 'params=', params, 'Arguments=', arguments);
		this.dispatch(event_name, params);
	}
	var params = {};
	bricks.extend(params, desc.params)
	bricks.extend(params, rtdata);
	bricks.extend(params, inputdata2dic(desc.event_params));
	params = bricks.apply_data(params, rtdata);
	return f.bind(target, desc.dispatch_event, params);
}

bricks.getWidgetById = function(id, from_widget){
	if (!from_widget){
		from_widget = bricks.Body;
	}
	if (! id){
		return from_widget;
	}
	if (typeof(id) != 'string') return id;
	var ids = id.split('.');
	var el = from_widget.dom_element;
	var new_el = null;
	var j = 0;
	for (var i=0; i< ids.length; i++){
		if (i == 0){
			if (ids[i] == 'self'){
				el = from_widget.dom_element;
				continue;
			}
			if (ids[i]=='root'){
				el = bricks.app.root.dom_element;
				continue;
			}
			if (ids[i]=='app' || ids[i] == 'body'){
				return bricks.app;
			}
			if (ids[i] == 'window'){
				el = bricks.Body.dom_element;
				continue;
			}
		}
				
		try {
			if (ids[i][0] == '-'){
				var wid = substr(1, ids[i].length - 1)
				new_el = el.closest('#' + wid);
			} else {
				new_el = el.querySelector('#' + ids[i]);
			}
		}
		catch(err){
			bricks.debug('getWidgetById():i=', ids[i], id, 'not found', err);
			return null;
		}
		if ( new_el == null ){
			bricks.debug('getWidgetById():', id, from_widget, 'el=', el, 'id=', ids[i]);
			return null;
		}
		el = new_el;
	}
	if (typeof(el.bricks_widget) !== 'undefined'){
		return el.bricks_widget;
	}
	bricks.debug('********', id, 'el=', el, 'found, but not a bricks class with dom element');
	return el;
}

bricks.App = class extends bricks.Layout {
	constructor(opts){
		/*
		opts = {
			appname:
			debug:false, true, 'server'
			login_url:
			"charsize:
			"language":
			"i18n":{
				"url":'rrr',
				"default_lang":'en'
			},
			"widget":{
				"widgettype":"Text",
				"options":{
				}
			}
		}
		*/
		super(opts);
		bricks.app = this;
		this.docks = [];
		bricks.bug = opts.debug || false;
		bricks.Body = this;
		this.deviceid = bricks.deviceid(opts.appname || 'appname');
		this.login_url = opts.login_url || '/rbac/userpassword_login.ui';
		this.charsize = this.opts.charsize || 20;
		this.keyevent_blocked = false;
		this.char_size = this.observable('charsize', this.charsize);
		if (this.opts.language){
			this.lang = this.opts.language;
		}
		else {
			this.lang = navigator.language;
		}
		this.lang_x = this.observable('lang', this.lang);
		this.zindex = 10000;
		this.textList = [];
		this.i18n = new bricks.I18n(objget(opts, 'i18n', {}));
		this.session_id = null;
		this.tooltip = new bricks.Tooltip({otext:'',i18n:true, wrap:true});
		this.tooltip.hide();
		this.add_widget(this.tooltip);
		this._Width = this.dom_element.offsetWidth;
		this._Height = this.dom_element.offsetHeight;
		this.video_stream = null;
		this.audio_stream = null;
		this.video_devices = null
		this.vpos = null;
		document.addEventListener('keydown', this.key_down_action.bind(this));
		this.screen_orient = window.screen.orientation.type;
		window.screen.orientation.addEventListener('change', () => {
			this.screen_orient = window.screen.orientation.type;
			this.bind('orient_changed', this.screen_orient);
		});
		this.mwins = [];
		this.wins_panel = null;
	}

	show_windows_panel(event){
		console.log('event=', event);
		event.preventDefault();
		event.stopPropagation()
		var opts = bricks.get_popup_default_options();
		opts.auto_open = false;
		this.wins_panel = new bricks.WindowsPanel(opts);
		this.wins_panel.open();
	}
	get_color(){
		return getComputedStyle(this.dom_element).color;
		return parseRGB(colorStr);
	}
	get_bgcolor(){
		return getComputedStyle(this.dom_element).backgroundColor;
		return parseRGB(colorStr);
	}

	get_blinkcolor(){
		var color, bgcolor, blinkcolor;
		color = parseRGB(this.get_color());
		bgcolor = parseRGB(this.get_bgcolor());
		console.log('color=', color, 'bgcolor=', bgcolor);
		function short1of3(x, y){
			if (x < y) {
				return x + (y - x) / 3;
			} else {
				return x - (x - y) / 3;
			}
		}
		var r = short1of3(color.r, bgcolor.r);
		var g = short1of3(color.g, bgcolor.g);
		var b = short1of3(color.b, bgcolor.b);
		var bc = bricks.obj_fmtstr({r:r, g:g, b:b}, "rgb(${r}, ${g}, ${b})");
		console.log('color=', color, 'bgcolor=', bgcolor, 'bc=', bc);
		return bc;
	}
	async getCameras() {
		try {
			const devices = await navigator.mediaDevices.enumerateDevices();
			this.video_devices = devices.filter(device => device.kind === 'videoinput');
		} catch (error) {
			console.error('获取摄像头数量出错:', error);
		}
	}
	async start_media(opts){
		/* opts:
			type:device or 'widget'
			widgetid:
			widget:
			audio:true,
			video:true
			vpos:
		*/
	}
	async stop_media(media_stream){
	}
    async start_camera(vpos) {
		if (typeof(vpos) == 'undefined') vpos = 0;
		if (this.video_devices === null){
			await this.getCameras();
		}
		if (vpos == this.vpos) return;
		this.vpos = vpos;
		if (this.video_stream){
			this.video_stream.getTracks().forEach(track => {
				track.stop();
			});
		}
        if (navigator.mediaDevices.getUserMedia) {
			var x = { deviceId: this.video_devices[vpos].deviceId };
            this.video_stream = await navigator.mediaDevices.getUserMedia({ video: x });
        } else {
            console.log("Webcam access is not supported in this browser.");
        }
    }
    async start_mic() {
		if (this.audio_stream) return;
        if (navigator.mediaDevices.getUserMedia) {
            this.audio_stream = navigator.mediaDevices.getUserMedia({ audio: true });
        } else {
            console.log("mic access is not supported in this browser.");
			this.stream = null;
        }
    }
	new_zindex(){
		const v = this.zindex;
		this.zindex = v + 1;
		return v;
	}
	screenHeight(){
		return this.dom_element.clientHeight;
	}
	screenWidth(){
		return this.dom_element.clientWidth;
	}
	create(){
		this.dom_element = document.getElementsByTagName('body')[0];
		this.set_baseURI(this.dom_element.baseURI);
	}
	save_session(session){
		this.session_id = session;
	}
	get_session(){
		return this.session_id;
	}
	async setup_i18n(){
		let params = {'lang':this.lang};
		var jc = new bricks.HttpJson();
		d = await jc.httpcall(desc.url, {
					"method":desc.method||'GET', params:params});
		this.i18n.setup_dict(d);
	}
	async build(){
		var opts = bricks.extend({}, this.opts.widget);
		var w = await bricks.widgetBuild(opts, bricks.Body);
		if (!w){
			bricks.debug('w=', w, 'Body=', bricks.Body, 'Factory=', bricks.Factory)
		}
		return w;
	}
	async run(){
		await (this.change_language(this));
		var w = await this.build();
		this.root = w;
		if (!w){
			bricks.debug('w=', w, 'Body=', bricks.Body, 'Factory=', bricks.Factory)
			return null;
		}
		bricks.Body.add_widget(w);
		bricks.Body.down_level();
	}
	textsize_bigger(){
		this.charsize = this.charsize * 1.05;
		this.char_size.set(this.charsize);
	}
	textsize_smaller(){
		this.charsize = this.charsize * 0.95;
		this.char_size.set(this.charsize);
	}
	text_resize(){
		for (var i=0;i<this.textList.length;i++){
			if(this.textList[i].deref()){
				var w = this.textList[i].deref();
				var ts = this.get_textsize(w.ctype);
				w.change_fontsize(ts);
			}
		}
	}
	async change_language(lang){
		this.lang = lang;
		await (this.i18n.change_lang(lang));
		this.lang_x.set(this.lang);
	}
	async key_down_action(event){
		if (this.keyevent_blocked){
			return;
		}
		var d = {
			key:event.key,
			repeat:event.repeat,
			altkey:event.altKey,
			ctrlkey:event.ctrlKey,
			shiftkey:event.shiftKey,
			metakey:event.metaKey,
			code:event.code
		}
		this.dispatch('keydown', d);
	}
}
