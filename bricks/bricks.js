let bricks_app = null;
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
conform:
and each type of binds specified attributes list following

url action:
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
class Bricks {
*/
var widgetBuild = async function(desc, widget){
	if (! widget){
		widget = Body;
	}
	const klassname = desc.widgettype;
	var base_url = null;
	if (klassname == 'urlwidget'){
		let url = absurl(desc.options.url, widget);
		base_url = url;
		let method = desc.options.method || 'GET';
		let opts = desc.options.params || {};
		desc = await jcall(url, { "method":method, "params":opts});
	} else {
		base_url = widget.baseURI;
	}
	let klass = Factory.get(desc.widgettype);
	if (! klass){
		console.log('widgetBuild():',desc.widgettype, 'not registered', Factory.widgets_kw);
		return null;
	}
	desc.options.baseURI = base_url;
	let w = new klass(desc.options);
	if (desc.hasOwnProperty('id')){
		w.set_id(desc.id);
	}
	if (desc.hasOwnProperty('subwidgets')){
		for (let i=0; i<desc.subwidgets.length; i++){
			let sdesc = desc.subwidgets[i];
			let sw = await widgetBuild(sdesc, w);
			if ( sw ){
				w.add_widget(sw);
			} else {
				console.log('widgetBuild() error: sdesc=', sdesc);
			}
		}
	}
	if (desc.hasOwnProperty('binds')){
		for (var i=0;i<desc.binds.length; i++){
			buildBind(w, desc.binds[i]);
		}
	}
	return w;
}

var buildBind = function(w, desc){
	var widget = getWidgetById(desc.wid, w);
	var handler = universal_handler.bind(w, w, desc);
	if (desc.conform){
		var conform_widget = widgetBuild(desc.conform, w);
		conform_widget.bind('on_conform', handler);
		handler = conform_widget.open.bind(conform_widget);
	}
	widget.bind(desc.event, handler);
}
var universal_handler = function(widget, desc, event){
	var f = buildEventHandler(widget, desc);
	if (f){
		return f(event);
	}
	debug('universal_handler() error, desc=', desc);
}
var buildEventHandler = function(w, desc){
	var target = getWidgetById(desc.target, w);
	if (! target){
		console.log('target miss', desc);
		return null
	}
	var rtdata = null;
	if (desc.datawidget){
		var data_desc = {
			widget:desc.datawidget,
			method:desc.datamethod,
			params:desc.dataparams,
			script:desc.datascript
		}
		rtdata = getRealtimeData(w, data_desc);
	}
	switch (desc.actiontype){
		case 'urlwidget':
			return buildUrlwidgetHandler(w, target, rtdata, desc);
			break;
		case 'bricks':
			return buildBricksHandler(w, target, rtdata, desc);
			break;
		case 'registerfunction':
			return buildRegisterFunction(w, target, rtdata, desc);
			break;
		case 'method':
			return buildMethodHandler(w, target, rtdata, desc);
			break;
		case 'script':
			var f = buildScriptHandler(w, target, rtdata, desc);
			return f;
			break;
		case 'event':
			return buildDispatchEventHandler(w, target, rtdata, desc);
			break;
		default:
			console.log('invalid actiontype', target, desc);
			break;
	}
}
var getRealtimeData = function(w, desc){
	var target = getWidgetById(desc.widget, w);
	if (! target){
		console.log('target miss', desc);
		return null
	}
	if (desc.method){
		f = buildMethodHandler(null, target, null, desc)
		return f();
	}
	if (desc.script){
		f = buildScriptHandler(null, target, null, desc)
		return f();
	}
	debug('getRealtimeData():desc=', desc, 'f=', f);
	return null;
}

var buildUrlwidgetHandler = function(w, target, rtdata, desc){
	var f = async function(target, mode, options){
		console.log('target=', target, 'mode=', mode, 'options=', options);
		var w = await widgetBuild(options, w);
		if (!w){
			console.log('options=', options, 'widgetBuild() failed');
			return;
		}
		if (mode == 'replace'){
			target.clear_widgets();
		}
		target.add_widget(w);
	}
	var options = desc.options.copy();
	options.params.update(rtdata);
	var opts = {
		"widgettype":"urlwidget",
		"options":options
	}
	return f.bind(target, target, desc.mode || 'replace', opts);
}
var buildBricksHandler = function(w, target, rtdata, desc){
	var f = async function(target, mode, options){
		console.log('target=', target, 'mode=', mode, 'options=', options);
		var w = await widgetBuild(options, w);
		if (!w){
			console.log('options=', options, 'widgetBuild() failed');
			return;
		}
		if (mode == 'replace'){
			target.clear_widgets();
		}
		target.add_widget(w);
	}
	var options = desc.options.copy();
	options.options.update(rtdata);
	return f.bind(target, target, desc.mode || 'replace', options);
}
var buildRegisterFunctionHandler = function(w, target, rtdata, desc){
	var f = registerfunctions.get(desc.rfname);
	if( ! f){
		console.log('rfname:', desc.rfname, 'not registed', desc);
		return null;
	}
	var params = {};
	if (desc.params){
		params.update(desc.params);
	}
	if (rtdata){
		params.update(rtdata);
	}
	return f.bind(target, params);
}
var buildMethodHandler = function(w, target, rtdata, desc){
	var f = target[desc.method];
	var params = {};
	params.updates(desc.params, rtdata);
	return f.bind(target, params);
}
var buildScriptHandler = function(w, target, rtdata, desc){
	var params = {};
	params.updates(desc.params, rtdata);
	var f = new Function('target', 'params', 'event', desc.script);
	return f.bind(target, target, params);
}
var buildDispatchEventHandler = function(w, target, rtdata, desc){
	var params = {};
	params.updates(desc.params, rtdata);
	var f = function(target, event_name, params){
		target.dispatch(event_name, params);
	}
	return f.bind(target, params);
}

var getWidgetById = function(id, from_widget){
	if (! id){
		return from_widget;
	}
	var ids = id.split('/');
	var el = from_widget.dom_element;
	var j = 0;
	for (var i=0; i< ids.length; i++){
		if (j == 0){
			j = 1;
			if (ids[i] == 'self'){
				el = from_widget.dom_element;
				continue;
			}
			if (ids[i]=='root'){
				el = bricks_app.root.dom_element;
				continue;
			}
			if (ids[i]=='app'){
				return bricks_app;
			}
			if (ids[i] == 'window'){
				el = Body.dom_element;
				continue;
			}
		}
				
		try {
			if (ids[i][0] == '-'){
				var wid = substr(1, ids[i].length - 1)
				el = el.closest('#' + wid);
			} else {
				el = el.querySelector('#' + ids[i]);
			}
		}
		catch(err){
			console.log('getWidgetById():i=', ids[i], id, 'not found', err);
			return null;
		}
		if ( el == null ){
			console.log('getWidgetById():', id, el);
			return null;
		}
	}
	if (typeof(el.bricks_widget) !== 'undefined'){
		console.log('getWidgetById():', id, el, 'widget');
		return el.bricks_widget;
	}
	return el;
}

class BricksApp {
	constructor(opts){
		/*
		opts = {
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
		this.opts = opts;
		bricks_app = this;
		this.charsize = this.opts.charsize || 20;
		if (this.opts.language){
			this.lang = this.opts.language;
		}
		else {
			this.lang = navigator.language;
		}
		this.textList = [];
		this.i18n = new I18n(opts.get('i18n', {}));
	}
	get_textsize(ctype){
		var tsize = this.charsize;
		var stimes = {
			"text":1.0,
			"title1":1.96,
			"title2":1.80,
			"title3":1.64,
			"title4":1.48,
			"title5":1.32,
			"title6":1.16
		}
		tsize = parseInt(stimes[ctype] * tsize);
		return tsize + 'px';
	}
	text_ref(textWidget){
		this.textList.push(new WeakRef(textWidget));
	}
	text_remove_dead(){
		var tList = this.textList;
		for (var i=0;i<tList.length;i++){
			if (! tList[i].deref()){
				this.textList.remove(tList[i]);
			}
		}
	}
	async setup_i18n(){
		let params = {'lang':this.lang};
		d = await jcall(desc.url, {
					"method":desc.method||'GET', params:params});
		this.i18n.setup_dict(d);
	}
	async build(){
		var opts = structuredClone(this.opts.widget);
		var w = await widgetBuild(opts, Body);
		return w
	}
	async run(){
		await this.change_language(this);
		var w = await this.build();
		this.root = w;
		Body.add_widget(w);
	}
	textsize_bigger(){
		this.charsize = this.charsize * 1.05;
		this.text_resize();
	}
	textsize_smaller(){
		this.charsize = this.charsize * 0.95;
		this.text_resize();
	}
	text_resize = function(){
		for (var i=0;i<this.textList.length;i++){
			if(this.textList[i].deref()){
				var w = this.textList[i].deref();
				var ts = this.get_textsize(w.ctype);
				w.change_fontsize(ts);
			}
		}
	}
	change_language = async function(lang){
		this.lang = lang;
		await this.i18n.change_lang(lang);
		for (var i=0;i<this.textList.length;i++){
			if(this.textList[i].deref()){
				var w = this.textList[i].deref();
				if (w.opts.i18n) {
					w.set_i18n_text();
				}
			}
		}
	}
}
