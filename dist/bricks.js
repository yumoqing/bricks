class UiTypesDef {
	constructor(opts){
		this.opts = opts;
		this.uitypes = {
		}
	}
	set(uitype, viewKlass, inputKlass){
		if (! this.uitypes[uitype]){
			this.uitypes[uitype] = {};
		}
		this.uitypes[uitype].viewKlass = viewKlass;
		this.uitypes[uitype].inputKlass = inputKlass;
	}
	get(uitype){
		return [this.uitypes[uitype].viewKlass, this.uitypes[uitype].inputClass];
	}
	getInputKlass(uitype){
		return this.uitypes[uitype].inputKlass;
	}
	getViewKlass(uitype){
		return this.uitypes[uitype].viewKlass;
	}
	setViewKlass(uitype, klass){
		if (! this.uitypes[uitype]){
			this.uitypes[uitype] = {};
		}
		this.uitypes[uitype].viewKlass = klass;
	}
	setInputKlass(uitype, klass){
		if (! this.uitypes[uitype]){
			this.uitypes[uitype] = {};
		}
		this.uitypes[uitype].inputKlass = klass;
	}
}

var uitypesdef = new UiTypesDef();
class _TypeIcons {
	constructor(){
		this.kv = {}
	}
	get(n, defaultvalue){
		return this.kv.get(n, defaultvalue);
	}
	register(n, icon){
		this.kv[n] = icon;
	}
}

TypeIcons = new _TypeIcons();

/**
 * Current Script Path
 *
 * Get the dir path to the currently executing script file
 * which is always the last one in the scripts array with
 * an [src] attr
 */
var currentScriptPath = function () {
	var currentScript;
	if (document.currentScript){
		currentScript = document.currentScript.src;
	} else {
		console.log('has not currentScriot');
		var scripts = document.querySelectorAll( 'script[src]' );
		if (scripts.length < 1){
			return null;
		}
		currentScript = scripts[ scripts.length - 1 ].src;
	}
    var currentScriptChunks = currentScript.split( '/' );
    var currentScriptFile = currentScriptChunks[ currentScriptChunks.length - 1 ];
    return currentScript.replace( currentScriptFile, '' );
}

var bricks_path = currentScriptPath();

var bricks_resource = function(name){
	return bricks_path + name;
}

/**
 * Finds all elements in the entire page matching `selector`, even if they are in shadowRoots.
 * Just like `querySelectorAll`, but automatically expand on all child `shadowRoot` elements.
 * @see https://stackoverflow.com/a/71692555/2228771
 */
function querySelectorAllShadows(selector, el = document.body) {
  // recurse on childShadows
  const childShadows = Array.from(el.querySelectorAll('*')).
    map(el => el.shadowRoot).filter(Boolean);

  console.log('[querySelectorAllShadows]', selector, el, `(${childShadows.length} shadowRoots)`);

  const childResults = childShadows.map(child => querySelectorAllShadows(selector, child));
  
  // fuse all results into singular, flat array
  const result = Array.from(el.querySelectorAll(selector));
  return result.concat(childResults).flat();
}

var schedule_once = function(f, t){
	/* f: function
		t:time in second unit
	*/
	t = t * 1000
	window.setTimeout(f, t);
}

var schedule_interval = function(f, t){
	var mf = function(func, t){
		func();
		schedule_once(f, t);
	}
	schedule_once(mf.bind(f,t), t);
}

var debug = function(){
	console.log(...arguments);
}

var import_cache = new Map()

var import_css = async function(url){
	if (import_cache.get(url)===1) return;
	var result = await tget(url);
	debug('import_css():tget() return', result); 
	var s = document.createElement('style');
	s.setAttribute('type', 'text/javascript');
	s.innerHTML = result;
	document.getElementsByTagName("head")[0].appendChild(s);
	import_cache.set(url, 1);
}

var import_js = async function(url){
	if (import_cache.get(url)===1) return;
	// var result = await tget(url);
	// debug('import_js():tget() return', url, result); 
	var s = document.createElement('script');
	s.setAttribute('type', 'text/javascript');
	s.src=url;
	// s.innerHTML = result;
	document.body.appendChild(s);
	import_cache.set(url, 1);

}

var extend = function(d, s){
	for (var p in s){
		if (! s.hasOwnProperty(p)){
			continue;
		}
		if (d[p] && (typeof(d[p]) == 'object') 
				&& (d[p].toString() == '[object Object]') && s[p]){
			extend(d[p], s[p]);
		} else {
			d[p] = s[p];
		}
	}
	return d;
}

var objget = function(obj, key, defval){
	if (obj.hasOwnProperty(key)){
		return obj[key];
	}
	return defval;
}

var obj_fmtstr = function(obj, fmt){
	/* fmt like 
		'my name is ${name}, ${age=}'
		'${name:}, ${age=}'
	*/
	var s = fmt;
	s =  s.replace(/\${(\w+)([:=]*)}/g, (k, key, op) => {
		if (obj.hasOwnProperty(key)){
			if (op == ''){
				return obj[key];
			} else {
				return key + op + obj[key];
			}
		}
		return ''
	})
	return s;
}

Object.prototype.copy = function(){
	var o = {}
	for ( k in this){
		if (this.hasOwnProperty(k)){
			o[k] = this[k];
		}
	}
	return o;
}
Object.prototype.get = function(name, defvalue){
	return objget(this, name, defvalue);
}

Object.prototype.fmtstr = function(fmt){
	return obj_fmtstr(this, fmt);
}

Object.prototype.update = function(obj){
	if (obj){
		extend(this, obj);
	}
}

Object.prototype.updates = function(){
	for (var i=0; i<arguments.length; i++){
		extend(this, arguments[i]);
	}
}

var archorize = function(ele,archor){
	/* archor maybe one of the:
	"tl", "tc", "tr",
	"cl", "cc", "cr",
	"bl", "bc", "br"
	*/
	if (! archor)
		archor = 'cc';
	var v = archor[0];
	var h = archor[1];
	var y = "0%";
	switch(v){
		case 't':
			y = "0%";
			break;
		case 'b':
			y = '100%';
			break;
		case 'c':
			y = '50%';
			break;
		default:
			y = '50%';
			break;
	}
	var x = "0%";
	switch(h){
		case 'l':
			x = "0%";
			break;
		case 'r':
			x = '100%';
			break;
		case 'c':
			x = '50%';
			break;
		default:
			x = '50%';
			break;
	}
	ele.style.top = y;
	ele.style.left = x;
	var o = {
		'x':x,
		'y':y
	}
	var tsf = o.fmtstr('translateY(-${y}) translateX(-${x})');
	console.log('archorize(): tsf=', tsf);
	ele.style.transform = tsf;
	ele.style.position = "absolute";
}

Array.prototype.insert = function ( index, ...items ) {
    this.splice( index, 0, ...items );
};

Array.prototype.remove = function(item){
	var idx = this.indexOf(item);
	if (idx >= 0){
		this.splice(idx, 1);
	}
	return this;
}

var absurl = function(url, widget){
	if (url.startsWith('http://') || url.startsWith('https://')){
		return url;
	}
	var base_uri = widget.baseURI;
	if (url.startsWith('/')){
		base_uri = Body.baseURI;
		url = url.substring(1);
	}
	paths = base_uri.split('/');
	delete paths[paths.length - 1];
	var ret_url = paths.join('/') + url;
	return ret_url;
}

var debug = function(...args){
	console.log(...args);
}

var convert2int = function(s){
	if (typeof(s) == 'number') return s;
	var s1 = s.match(/\d+/);
	return parseInt(s1[0]);
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

var set_max_height = function(w1, w2){
	var v1 = w1.dom_element.offsetHeight;
	var v2 = w2.dom_element.offsetHeight;
	var v = v1 - v2;
	if (v < 0){
		w1.set_height(w2.dom_element.offsetHeight);
	} else if (v > 0) {
		w2.set_height(w1.dom_element.offsetHeight);
	}
}
class I18n {
	constructor(url, default_lang){
		/*
		{
		 	url:
			method:
			default_lang
		}
		*/
		this.url = opts.url;
		this.default_lang = opts.default_lang||'en';
		this.method = opts.method || 'GET';
		this.lang_msgs = {};
		this.msgs = {};
	}
	_(txt, obj){
		if (this.msgs.hasOwnProperty(txt)){
			itxt = this.msgs[txt];
		}
		if (obj instanceof Object){
				return obj.fmtstr(itxt);
		}
		return txt;
	}
	is_loaded(lang){
		if (this.lang_msgs.get(lang)) return true;
		return false;
	}
	setup_dict(dic, lang){
		this.cur_lang = lang;
		this.lang_msgs.update({lang:dic});
		this.msgs = dic;
	}
	async change_lang(lang){
		if (this.lang_msgs.get(lang)){
			this.msgs = this.lang_msgs.get(lang);
			return;
		}
		
		if (! this.url) return;

		let params = {'lang':lang};
		d = await jcall(desc.url, {
					"method":this.method || 'GET', 
					params:params
		});
		this.setup_dict(d, lang);
	}
}

class Factory_ {
	constructor(){
		this.widgets_kv = new Object();
		this.widgets_kv['_t_'] = 1;
	}
	register(name, widget){
		this.widgets_kv[name] = widget;
	}
	get(name){
		if (this.widgets_kv.hasOwnProperty(name)){
			return this.widgets_kv[name];
		}
		return null;
	}
}
const Factory = new Factory_();


class JsWidget {
	dom_element = null;
	constructor(options){
		if (!options){
			options = {}
		}
		this.baseURI = options.baseURI;
		this.opts = options;
		this.create();
		this.dom_element.bricks_widget = this;
		this.opts_set_style();
		if (this.opts.tooltip){
			this.dom_element.tooltip = this.opts.tooltip;
		}
		this._container = false;
		this.parent = null;
		this.sizable_elements = [];
		if (options.css){
			this.set_css(options.css);
		}
		if (options.csses){
			this.set_csses(options.csses);
		}
	}
	create(){
		this.dom_element = document.createElement('div');
	}
	opts_set_style(){
		var keys = [
			"width",
			"x",
			"y",
			"height",
			"margin",
			"padding",
			"align",
			"textAlign",
			"overflowY",
			"overflowX",
			"overflow",
			"color"
		]
		var mapping_keys = {
			"z-index":"zIndex",
			"overflow-x":"overflowX",
			"opveflow-y":"overflowY",
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
		this.dom_element.style.update(style);
		if (this.opts.css){
			this.set_css(this.opts.css);
		}
		
	}
	sizable(){
		bricks_app.text_ref(this);
	}
	change_fontsize(ts){
		ts = convert2int(ts);
		if (! this.specified_fontsize){
			var rate = this.rate || 1;
			ts = ts * rate;
			ts = ts + 'px';
			this.dom_element.style.fontSize = ts;
			for(var i=0;i<this.sizable_elements.length;i++){
				this.sizable_elements[i].style.fontSize = ts;
			}
		}
	}
	set_fontsize(){
		var fontsize;
		if (this.opts.fontsize){
			this.specified_fontsize = true;
			fontsize = this.opts.fontsize;
		} else {
			fontsize = bricks_app.get_textsize(this.ctype);
		}
		fontsize = convert2int(fontsize);
		var rate = this.rate || 1;
		fontsize = rate * fontsize;
		fontsize = fontsize + 'px';
		this.dom_element.style.fontSize = fontsize;
		for(var i=0;i<this.sizable_elements.length;i++){
			this.sizable_elements[i].style.fontSize = fontsize;
		}
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
	set_css(css, remove_flg){
		if (!remove_flg){
			this.dom_element.classList.add(css);
		} else {
			this.dom_element.classList.remove(css);
		}
	}
	set_cssObject(cssobj){
		this.dom_element.style.update(cssobj);
	}
	is_container(){
		return this._container;
	}
	_create(tagname){
		return document.createElement(tagname);
	}
	set_id(id){
		this.dom_element.id = id;
	}
	set_baseURI(url){
		this.baseURI = url;
	}
	absurl(url){
		console.log('this.baseURI=', this.baseURI);
		if (this.baseURI){
			return absurl(url, this);
		}
		return url
	}
	show(){
		this.dom_element.style.display = '';
	}
	hide(){
		this.dom_element.style.display = 'none'
	}
	bind(eventname, handler){
		this.dom_element.addEventListener(eventname, handler);
	}
	unbind(eventname, handler){
		this.dom_element.removeEventListener(eventname, handler);
	}
	dispatch(eventname, params){
		var e = new Event(eventname);
		e.params = params;
		this.dom_element.dispatchEvent(e);
	}
}


class TextBase extends JsWidget {
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
		this.sizable();
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
		this._i18n = new I18n();
		if (this.i18n && this.otext) {
			this.text = this._i18n._(this.otext);
		}
		this.dom_element.innerHTML = this.text;
	}
	set_i18n_text(){
		if ( !this.otext){
			return;
		}
		if (! this.i18n){
			return;
		}
		this.text = this._i18n._(this.otext);
		this.dom_element.innerHTML = this.text;
	}
		
}

class Text extends TextBase {
	constructor(opts){
		super(opts);
		this.ctype = 'text';
		this.set_fontsize();
	}
}

class Title1 extends TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title1';
		this.set_fontsize();
		this.dom_element.style.fontWeight = 'bold';
	}
}

class Title2 extends TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title2';
		this.set_fontsize();
		this.dom_element.style.fontWeight = 'bold';
	}
}

class Title3 extends TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title3';
		this.set_fontsize();
		this.dom_element.style.fontWeight = 'bold';
	}
}

class Title4 extends TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title4';
		this.set_fontsize();
		this.dom_element.style.fontWeight = 'bold';
	}
}

class Title5 extends TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title5';
		this.set_fontsize();
		this.dom_element.style.fontWeight = 'bold';
	}
}

class Title6 extends TextBase {
	constructor(options){
		super(options);
		this.ctype = 'title6';
		this.set_fontsize();
		this.dom_element.style.fontWeight = 'bold';
	}
}

Factory.register('Text', Text);
Factory.register('Title1', Title1);
Factory.register('Title2', Title2);
Factory.register('Title3', Title3);
Factory.register('Title4', Title4);
Factory.register('Title5', Title5);
Factory.register('Title6', Title6);

var tooltip = null;

createTooltip = function(){
	tooltip = document.createElement('div');
	tooltip.className = 'tooltip';
	tooltip.style.left = '50%';
	tooltip.style.trabsform = 'translateX(-50%)';
	var mouseoutHandler = (event) => {
		event.target.removeChild(tooltip);
	}
	window.addEventListener('mouseover', event => {
		if (!event.target.tooltop) return true;
		tooltip.textContent = event.target.tooltip;
		event.target.addEventListener(
				'mouseout',
				mouseoutHandler,
				{once:true}
		);
	});
}
	
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
	if (!widget){
		cnsole.log('desc wid not find', desc);
		return;
	}
	var event = desc.event;
	buildEventBind(w, widget, event, desc);
}

var buildEventBind = function(from_widget, widget, event, desc){
	var handler = universal_handler.bind(null,from_widget, widget, desc);
	if (desc.conform){
		var conform_widget = widgetBuild(desc.conform, widget);
		conform_widget.bind('on_conform', handler);
		handler = conform_widget.open.bind(conform_widget);
	}
	widget.bind(event, handler);
	
}

var universal_handler = function(from_widget, widget, desc, event){
	debug('universal_handler() info', 'from_widget=', 
						from_widget,
						'widget=', widget, 
						'desc=', desc,
						event);
	var f = buildEventHandler(from_widget, desc);
	if (f){
		return f(event);
	}
	debug('universal_handler() error', 'from_widget=', 
						from_widget,
						'widget=', widget, 
						'desc=', desc,
						event);
}
var buildEventHandler = function(w, desc){
	var target = getWidgetById(desc.target, w);
	if (! target){
		console.log('target miss desc=', desc, 'w=', w);
		return null
	}
	var rtdata = null;
	if (desc.rtdata) rtdata = desc.rtdata;
	else if (desc.datawidget){
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
	var f;
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
	if (! f){
		console.log('method:', desc.method, 'not exists in', target, 'w=', w);
		return null;
	}
	var params = {};
	params.updates(desc.params, rtdata);
	return f.bind(target, params);
}
var buildScriptHandler = function(w, target, rtdata, desc){
	var params = {};
	params.updates(desc.params, rtdata);
	var f = new Function('target', 'params', 'event', desc.script);
	console.log('params=', params, 'buildScriptHandler() ..........');
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
	if (typeof(id) != 'string') return id;
	var ids = id.split('/');
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
				new_el = el.closest('#' + wid);
			} else {
				new_el = el.querySelector('#' + ids[i]);
			}
		}
		catch(err){
			console.log('getWidgetById():i=', ids[i], id, 'not found', err);
			return null;
		}
		if ( new_el == null ){
			console.log('getWidgetById():', id, from_widget, 'el=', el, 'id=', ids[i]);
			return null;
		}
		el = new_el;
	}
	if (typeof(el.bricks_widget) !== 'undefined'){
		console.log('getWidgetById():', id, from_widget, el, 'widget');
		return el.bricks_widget;
	}
	return el;
}

class BricksApp {
	constructor(opts){
		/*
		opts = {
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
		this.opts = opts;
		bricks_app = this;
		this.login_url = opts.login_url;
		this.charsize = this.opts.charsize || 20;
		if (this.opts.language){
			this.lang = this.opts.language;
		}
		else {
			this.lang = navigator.language;
		}
		this.textList = [];
		this.i18n = new I18n(opts.get('i18n', {}));
		this.session_id = null;
		createTooltip();
	}
	save_session(session){
		this.session_id = session;
	}
	get_session(){
		return this.session_id;
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
class Image extends JsWidget {
	/* 
	{
		url:
		height:
		width:
	}
	*/
	constructor(opts){
		super(opts);
		this.opts = opts;
		this.options_parse();
	}
	create(){
		this.dom_element = document.createElement('img');
	}
	options_parse(){
		if (this.opts.hasOwnProperty('url')){
			this.set_url(this.opts.url);
		}
		if (this.opts.hasOwnProperty('width')){
			this.width = this.opts.width;
			this.dom_element.style.width = this.width;
		}
		if (this.opts.hasOwnProperty('height')){
			this.height = this.opts.height;
			this.dom_element.style.height = this.height;
		}
	}
	set_url(url){
		this.url = url;
		this.dom_element.src = url;
	}
}

class Icon extends Image {
	constructor(opts){
		super(opts);
		this.opts.width = bricks_app.charsize;
		this.opts.height = bricks_app.charsize;
		this.ctype = 'text';
		this.sizable();
		this.set_fontsize();
	}
	change_fontsize(ts){
		var siz = bricks_app.charsize;
		this.set_width(siz);
		this.set_height(siz);
	}
	set_fontsize(){
		var siz = bricks_app.charsize;
		this.set_width(siz);
		this.set_height(siz);
	}
	set_width(siz){
		this.dom_element.width = siz;
	}
	set_height(siz){
		this.dom_element.height = siz;
	}
}

class BlankIcon extends JsWidget {
	constructor(opts){
		opts.width = bricks_app.charsize;
		opts.height = bricks_app.charsize;
		super(opts);
		this.ctype = 'text';
		this.sizable();
		this.set_fontsize();
	}
	change_fontsize(ts){
		var siz = bricks_app.charsize + 'px';
		this.set_width(siz);
		this.set_height(siz);
	}
	set_fontsize(){
		var siz = bricks_app.charsize + 'px';
		this.set_width(siz);
		this.set_height(siz);
	}
	set_width(siz){
		this.dom_element.width = siz;
		this.dom_element.style.width = siz;
	}
	set_height(siz){
		this.dom_element.height = siz;
		this.dom_element.style.height = siz;
	}
}

Factory.register('Image', Image);
Factory.register('Icon', Icon);
Factory.register('BlankIcon', BlankIcon);
function url_params(data) {
  return Object.keys(data).map(key => `${key}=${encodeURIComponent(data[key])}`).join('&');
}
class HttpText {
	constructor(headers){
		/*
		var _headers = {
			"Accept":"text/html",
		}
		_headers = {
			"Accept": "application/json",
		};
		*/
		if (!headers)
			headers = {};
		this.headers = headers || {
			"Accept":"text/html",
		};
		this.headers.update(headers);
		this.params = {
			"_webbricks_":1
		}
	}
	url_parse(url){
		var a = url.split('?');
		if (a.length == 1) return url;
		url = a[0];
		var a = a[1].split('&');
		for (var i=0;i<a.length;i++){
			var b;
			b = a[i].split('=');
			this.params[b[0]] = b[1];
		}
		return url;
	}

	async get_result_data(resp){
		return await resp.text();
	}
	add_own_params(params){
		if (! params) 
			params = {};
		if (params instanceof FormData){
			for ( const [key, value] of Object.entries(this.params)){
				params.append(key, value);
			}
		}
		else {
			params = Object.assign(this.params, params);
		}
		var session =  bricks_app.get_session();
		if (session){
			params.update({session:session});
		}
		return params;
	}
	add_own_headers(headers){
		if (! headers){
			headers = {};
		}
		return Object.assign(this.headers, headers);
	}

	async httpcall(url, {method='GET', headers=null, params=null}={}){
		url = this.url_parse(url);
		var data = this.add_own_params(params);
		var header = this.add_own_headers(headers);
		var _params = {
			"method":method,
		}
		// _params.headers = headers;
		if (method == 'GET' || method == 'HEAD') {
			let pstr = url_params(data);
			url = url + '?' + pstr;
		} else {
			if (data instanceof FormData){
				_params.body = data;
			} else {
				_params.body = JSON.stringify(data);
			}
		}
		const fetchResult = await fetch(url, _params);
		var result=null;
		result = await this.get_result_data(fetchResult);
		if (fetchResult.ok){
			var ck =  fetchResult.headers.get('Set-Cookie');
			if (ck){
				var session = ck.split(';')[0];
				bricks_app.save_session(session);
			}
			return result;
		}
		if (fetchResult.status == 401 && bricks_app.login_url){
			return await this.withLoginInfo(url, _params);
		}
		console.log('method=', method, 'url=', url, 'params=', params);
		console.log('jsoncall error:');
		const resp_error = {
			"type":"Error",
			"message":result.message || 'Something went wrong',
			"data":result.data || '',
			"code":result.code || ''
		};
		const error = new Error();
		error.info = resp_error;
		return error;
	}
	async withLoginInfo(url, params){
		var get_login_info = function(e){
			console.log('login info:', e.target.getValue());
			return e.target.getValue();
		}
		var w = await widgetBuild({
			"id":"login_form",
			"widgettype":"urlwidget",
			"options":{
				"url":bricks_app.login_url
			}
		});
		var login_info = await new Promise((resolve, reject, w) => {
			w.bind('submit', (event) => {
				resolve(event.target.getValue());
				event.target.dismiss();
			});
			w.bind('discard', (event) => {
				resolve(null);
				event.target.dismiss()
			});
		});
		if (login_info){
			this.set_authorization_header(params, lgin_info);
			const fetchResult = await fetch(url, params);
			var result=null;
			result = await this.get_result_data(fetchResult);
			if (fetchResult.ok){
				return result;
			}
			if (fetchResult.status == 401){
				return await this.withLoginInfo(url, params);
			}
		}
		const resp_error = {
			"type":"Error",
			"message":result.message || 'Something went wrong',
			"data":result.data || '',
			"code":result.code || ''
		};
		const error = new Error();
		error.info = resp_error;
		return error;
	}	
	set_authorization_header(params, lgin_info){
		var auth = 'password' + '::' + login_info.user + '::' + login_info.password;
		var rsa = bricks_app.rsa;
		var code = rsa.encrypt(auth);
		self.header.authorization = btoa(code)
	}
	async get(url, {headers=null, params=null}={}){
		return await this.httpcall(url, {
					method:'GET',
					headers:headers,
					params:params
				});
	}
	async post(url, {headers=null, params=null}={}){
		return await this.httpcall(url, {
					method:'POST',
					headers:headers,
					params:params
				});
	}
}

class HttpJson extends HttpText {
	constructor(headers){
		if (!headers)
			headers = {};
		super(headers);
		this.headers = {
			"Accept": "application/json",
		}
		this.headers.update(headers);
	}
	async get_result_data(resp) {
		return await resp.json()
	}
}

var hc = new HttpText();
var tget = hc.get.bind(hc);
var tpost = hc.post.bind(hc);
jc = new HttpJson();
var jcall = jc.httpcall.bind(jc);
var jget = jc.get.bind(jc);
var jpost = jc.post.bind(jc);

class Oper {
	constructor(v){
		this.value = v;
	}
	__plus__(a, b){
		console.log(a, b);
		return new Oper(a.value + b.value);
	}
	__add__(a, b){
		console.log(a, b);
		return new Oper(a.value + b.value);
	}
}
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
		this.set_css('vcontainer');
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
		this.set_css('hcontainer');
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

/*
*/
class Menu extends VBox {
	/*
	{
		"items":
	}
	*/
	constructor(options){
		super(options);
		this.dom_element.style.display = "";
		this.dom_element.style.position = "absolute";
		this.dom_element.style.backgroundColor = options.bgcolor || "white";
		this.dom_element.style.zIndex = "1000";
		this.create_children(this.dom_element, this.opts.items);
		this.bind('click', this.menu_clicked);
	}
	create_submenu_container(){
		let cp = document.createElement('div');
		cp.style.marginLeft = "15px";
		cp.style.display = 'none';
		return cp;
	}
	async menu_clicked(event){
		let mit = event.target;
		if (mit.children.length > 0){
			for (var i=0;i<mit.children.length; i++){
				if (mit.children[i].style.display == 'none'){
					mit.children[i].style.display = "";
				} else {
					mit.children[i].style.display = 'none';
				}
			}
			return
		}
		console.log('item clicked');
	}
	create_children(p, items){
		console.log('create_children():items=', items, 'p=', p);
		for (let i=0;i<items.length;i++){
			let item = items[i];
			let menu_item = this.create_menuitem(item);
			p.appendChild(menu_item);
			if (item.hasOwnProperty('items')){
				let cp = this.create_submenu_container();
				menu_item.appendChild(cp);
				this.create_children(cp, item.items);
			}
		}
	}
	create_menuitem(item){
		let i18n = bricks_app.i18n;
		console.log('i18n=', i18n);
		let e = document.createElement('div');
		e.textContent = i18n._(item.label || item.name);
		// e.description = item
		console.log('create_menuitem():item=', item, 'obj=', e);
		return e;
	}
}

Factory.register('Menu', Menu);
class Modal extends Layout {
	constructor(options){
		/*
		{
			auto_open:
			auto_close:
			org_index:
			width:
			height:
			bgcolor:
			title:
			archor: cc ( tl, tc, tr
						cl, cc, cr
						bl, bc, br )
		}
		*/
		super(options);
		this.set_width('100%');
		this.set_height('100%');
		this.ancestor_add_widget = Layout.prototype.add_widget.bind(this);
		this.panel = new VBox({});
		this.ancestor_add_widget(this.panel);
		this.panel.set_width(this.opts.width);
		this.panel.dom_element.style.backgroundColor = this.opts.bgcolor|| '#e8e8e8';
		this.panel.set_height(this.opts.height);
		this.panel.set_css('modal');
		archorize(this.panel.dom_element, this.opts.get('archor', 'cc'));
		this.create_title();
		this.content = new VBox({width:'100%'});
		this.panel.add_widget(this.content);
	}
	create_title(){
		this.title_box = new HBox({width:'100%', height:'auto'});
		this.title_box.set_css('title');
		this.panel.add_widget(this.title_box);
		this.title = new HBox({height:'100%'});
		var icon = new Icon({url:bricks_resource('imgs/delete.png')});
		icon.bind('click', this.dismiss.bind(this));
		this.title_box.add_widget(this.title);
		this.title_box.add_widget(icon);
	}
	create(){
		var e = document.createElement('div');
		e.style.display = "none"; /* Hidden by default */
		e.style.position = "fixed"; /* Stay in place */
		e.style.zIndex = this.opts.get('org_index', 0) + 1; /* Sit on top */
		e.style.paddingTop = "100px"; /* Location of the box */
		e.style.left = 0;
		e.style.top = 0;
		e.style.width = "100%"; /* Full width */
		e.style.height = "100%"; /* Full height */
		e.style.backgroundColor = 'rgba(0,0,0,0.4)'; /* Fallback color */
		this.dom_element = e;
	}
	
	add_widget(w, index){
		this.content.add_widget(w, index);
		if (this.opts.auto_open){
			this.open();
		}
	}
	click_handler(event){
		if (event.target == this.dom_element){
			this.dismiss();
		} else {
			console.log('modal():click_handler()');
		}
	}
	open(){
		if (this.opts.auto_close){
			var f = this.click_handler.bind(this);
			this.bind('click', f);
		}
		this.dom_element.style.display = "";
	}
	dismiss(){
		this.dom_element.style.display = "none";
		if (this.opts.auto_close){
			this.unbind('click', this.click_handler.bind(this));
		}
	}
}

class ModalForm extends Modal {
	/*
	{
		auto_open:
		auto_close:
		org_index:
		width:
		height:
		bgcolor:
		archor: cc ( tl, tc, tr
					cl, cc, cr
					bl, bc, br )
		title:
		description:
		dataurl:
		submit_url:
		fields:
	}
	*/
	constructor(opts){
		super(opts);
		this.build_form();
	}
	build_form(){
		var opts = {
			title:this.opts.title,
			description:this.opts.description,
			dataurl:this.opts.dataurl,
			submit_url:this.opts.submit_url,
			fields:this.opts.fields
		}
		this.form = new Form(opts);
		this.form.bind('submit', this.dismiss.bind(this));
	}
}
Factory.register('Modal', Modal);
Factory.register('ModalForm', ModalForm);
	
/* 
reply on "https://github.com/markedjs/marked"
add following lines before 'bricks.js'
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
*/

class MdText extends JsWidget {
	/* options
	{
		"md_url":
		"method":"GET"
		"params":{}
	}
	*/

	constructor(options){
		super(options);
		var f = this.build.bind(this);
		this.load_event = new Event('loaded');
		this.dom_element.style.overFlow='auto';
		window.addEventListener('scroll', this.show_scroll.bind(this));
		schedule_once(f, 0.01);
	}
	show_scroll(event){
		console.log('scrollY=', window.scrollY);
	}
	build = async function(){
		this._build(this.opts.md_url);
	}
	_build = async function(md_url){
		var md_content = await tget(md_url);
		this.dom_element.innerHTML = marked.parse(md_content);
		
		/* change links in markdown to a bricks action */
		var links = this.dom_element.getElementsByTagName('a');
		for (var i=0; i<links.length; i ++){
			var url = links[i].href;
			links[i].href = '#';
			links[i].onclick=this._build.bind(this, url);
		}
		this.dispatch('loaded', {'url':md_url});
	}
}
class MarkdownViewer extends VBox {
	/* options 
	{
		navigator:true
		recommentable:false
		md_url:
		method:"GET",
		params:{}
	}
	*/
	constructor(options){
		super(options);
		this.back_stack = [];
		this.md_url = this.absurl(this.opts.md_url);
		if (this.opts.navigator){
			this.createBackButton();
		}
		this.mdtext = new MdText({
			md_url:this.md_url
		});
		this.add_widget(this.mdtext);
		this.mdtext.bind('loaded', this.add_back_stack.bind(this));
		this.dom_element.style.overflow='auto';
		this.dom_element.style.height='100%';
		this.bind('scroll', this.show_scroll.bind(this));
	}
	show_scroll(event){
		console.log('scrollY=', window.scrollY);
	}
	createBackButton = async function(){
		var desc = {
			"widgettype":"HBox",
			"options":{},
			"subwidgets":[
				{
					"widgettype":"Text",
					"options":{
						"text":"<<<<<<<"
					}
				}
			]
		}
		var w = await widgetBuild(desc);
		console.log('createBackButton():error, desc=', desc, 'w=', w);
		var t = w.children[0];
		console.log('createBackButton():text=',t);
		t.bind('click',this.go_back.bind(this));
		this.add_widget(w);
		console.log('createBackButton():desc=',desc, 'w=', w);
	}
	add_back_stack(event){
		console.log('go_back_stack():event=', event);
		var url = event.params.url;
		this.back_stack.push(url);
	}
	go_back = async function(event){
		if (this.back_stack.length < 2){
			return;
		}
		// ignore the current text url
		this.back_stack.pop();
		// get the back url
		var url = this.back_stack.pop();
		await this.mdtext._build(url);
	}

	build = async function(){
		this._build(this.opts.md_url);
	}
	_build = async function(md_url){
		var md_content = await tget(md_url);
		this.md_el.innerHTML = marked.parse(md_content);
		// this.md_el.baseURI = md_url;
		
		/* change links in markdown to a bricks action */
		var links = this.md_el.getElementsByTagName('a');
		for (var i=0; i<links.length; i ++){
			var url = links[i].href;
			links[i].href = '#';
			links[i].onclick=this._build.bind(this, url);
		}
	}
}

Factory.register('MarkdownViewer', MarkdownViewer);
/*
we use videojs for video play
https://videojs.com
*/
class Video extends JsWidget {
	/*
	{
		vtype:
		url:
		autoplay:
	}
	*/
	constructor(options){
		super(options);
		this.dom_element.type="application/vnd.apple.mpegurl";
		this.dom_element.add_css('video-js');
		this.dom_element.add_css('vjs-big-play-centered');
		this.dom_element.add_css('vjs-fluid');
		if (this.opts.url){
			this.dom_element.src = this.opts.url;
		}
	}
	create(){
		this.dom_element = document.createElement('video');
		this.player = videojs(this.dom_element, {
			controls: true, // 是否显示控制条
			// poster: 'xxx', // 视频封面图地址
			preload: 'auto',
			autoplay: this.opts.autoplay || false,
			fluid: true, // 自适应宽高
			language: 'zh-CN', // 设置语言
			muted: false, // 是否静音
			inactivityTimeout: false,
			controlBar: { // 设置控制条组件
				/* 设置控制条里面组件的相关属性及显示与否
				'currentTimeDisplay':true,
				'timeDivider':true,
				'durationDisplay':true,
				'remainingTimeDisplay':false,
				volumePanel: {
				  inline: false,
				}
				*/
				/* 使用children的形式可以控制每一个控件的位置，
				以及显示与否 */
				children: [
					{name: 'playToggle'}, // 播放按钮
					{name: 'currentTimeDisplay'}, // 当前已播放时间
					{name: 'progressControl'}, // 播放进度条
					{name: 'durationDisplay'}, // 总时间
					{ // 倍数播放
					name: 'playbackRateMenuButton',
					'playbackRates': [0.5, 1, 1.5, 2, 2.5]
					},
					{
						name: 'volumePanel', // 音量控制
						inline: false, // 不使用水平方式
					},
					{name: 'FullscreenToggle'} // 全屏
				]
			},
			sources:[ // 视频源
				{
				  src: this.opts.src,
				  type: this.opts.vtype || 'video/mp4'
				  // poster: '//vjs.zencdn.net/v/oceans.png'
				}
			]
		}, function (){
			console.log('视频可以播放了',this);
		});
	}
}

class VideoPlayer extends VBox {
	/* 
	we use [indigo-player](https://github.com/matvp91/indigo-player) as a base.
	inside body, need to add following line before bricks.js
	<script src="https://cdn.jsdelivr.net/npm/indigo-player@1/lib/indigo-pla    yer.js"></script>
	options 
	{
		url:
	}
	*/
	constructor(options){
		super(options);
		var autoplay = '';
		if (this.opts.autoplay){
			autoplay = 'autoplay';
		}
		var url = this.opts.url;
		this.dom_element.innerHTML = `<video width="90%" controls ${autoplay} src="${url}" type="application/vnd.apple.mpegurl" class="media-document mac video" ></video>`;
		this.video = this.dom_element.querySelector('video');
	}
	toggle_play(){
		if (this.video.paused){
			this.video.play();
		} else {
			this.video.pause();
		}
	}
		
}
Factory.register('VideoPlayer', VideoPlayer);
Factory.register('Video', Video);

class AudioPlayer extends JsWidget {
	/*
	{
		url:
		autoplay:
	}
	*/

	constructor(options){
		super(options);
		this.url = opt.url;
		this.audio = this._create('audio');
		// this.audio.autoplay = this.opts.autoplay;
		this.audio.controls = true;
		if (this.opts.autoplay){
			this.audio.addEventListener('canplay', this.play_audio.bind(this));
		}
		this.audio.style.width = "100%"
		var s = this._create('source');
		s.src = this.opts.url;
		this.audio.appendChild(s);
		this.dom_element.appendChild(this.audio);
	}
	toggle_play(){
		if (this.audio.paused){
			this.audio.play();
		} else {
			this.audio.pause();
		}
	}
}

Factory.register('AudioPlayer', AudioPlayer);
class Toolbar extends Layout {
	/* toolbar options
	{
		orientation:
		target:
		interval::
		tools:
	}
	tool options
	{
		icon:
		name:
		label:
		css:
	}

	event:
		ready: after all the tools built, fire this event
		command: after user click one of the tool will fire the event with params of the tools[i] object.
		remove: after user delete a removable tool from the toolbar, will fire the event with its tool description object as params. the params can reach with event.params.


	*/
	constructor(options){
		super(options);
		this.toolList = [];
		if (this.opts.orientation == 'vertical'){
			this.bar = new VBox(options);
			this.dom_element.classList.add('vtoolbar')
		} else {
			this.bar = new HBox(options);
			this.dom_element.classList.add('htoolbar')
		}
		this.add_widget(this.bar);
		this.clicked_btn = null;
		this.preffix_css = this.opts.css || 'toolbar';
		schedule_once(this.createTools.bind(this), 0.01);
	}
	add_interval_box(){
		if (this.opts.orientation == 'vertical'){
			this.bar.add_widget(new JsWidget({
						height:this.opts.interval || '10px'
			}));
		} else {
			this.bar.add_widget(new JsWidget({
						width:this.opts.interval || '10px'
			}));
		}
	}
	createTools = async function(){
		var l = this.opts.tools.length;
		for (var i=0;i<l; i++){
			await this.createTool(this.opts.tools[i]);
			if (i < l -1 ){
				this.add_interval_box();
			}
		}
		this.dispatch('ready');
	}
	createTool = async function(desc){
		var options = {
			"widgettype":"Button",
			"options":{
				width:"auto",
				orientation:"horizontal",
				icon:desc.icon,
				label:desc.label,
				name:desc.name,
				css:desc.css
			}
		};
		var w = await widgetBuild(options);
		if (! w){
			console.log('Toolbar(): build widget failed', options);
			return
		}
		w.bind('click', this.do_handle.bind(this, w));
		w.tool_opts = desc;
		this.add_removable(w);
		this.toolList.push(w);
		this.bar.add_widget(w);
		return w;
	}
	remove_item(w, event){
		this.bar.remove_widget(w);
		this.toolList.remove(w);
		w.unbind('click',this.do_handle.bind(this, w));
		this.dispatch('remove', w.tool_opts);
		event.preventDefault();
		event.stopPropagation();
	}
	do_handle(tool, event){
		// var tool = event.target;
		console.log('Toolbar() onclock,target=', event.target, tool);
		var e = new Event('command');
		var d = {};
		d.update(tool.tool_opts);
		if (this.opts.target){
			d.target = this.opts.target;
		}
		this.dispatch('command', d);

		if (this.clicked_btn){
			this.clicked_btn.set_css(this.preffix_css + '-button-active', true);
		}
		tool.set_css(this.preffix_css + '-button-active');
		this.clicked_btn = tool;
	}
	add_removable(item){
		if (! item.tool_opts.removable) return;
		var img_src = bricks_resource('imgs/delete.png');
		var image = new Icon({url:img_src});
		if (image){
			item.add_widget(image);
			image.bind('click',this.remove_item.bind(this, item));
			console.log('Toolbar(): add_removable() for ', img_src);
		} else {
			console.log('Toolbar(): Image create error', img_src);
		}
	}
	click(name){
		for (var i=0;i<this.toolList.length;i++){
			if (name==this.toolList[i].tool_opts.name){
				this.toolList[i].dom_element.click();
			}
		}
	}
}

Factory.register('Toolbar', Toolbar);
class TabPanel extends Layout {
	/*
	options
	{
		css:
		tab_long: 100%
		tab_pos:"top"
		items:[
			{
				name:
				label:"tab1",
				icon:
				removable:
				refresh:false,
				content:{
					"widgettype":...
				}
			}
		]
	}
	css:
		tab
		tab-button
		tab-button-active
		tab-button-hover
		tab-content
	*/
	constructor(options){
		super(options);
		this.content_buffer = {};
		this.cur_tab_name = '';
		this.content_container = new VFiller({});
		if (this.opts.tab_pos == 'top' ||  this.opts.tab_pos == 'bottom'){
			this.set_css('vbox');
			var height = this.opts.tab_wide || 'auto';
			this.tab_container = new VBox({height:height});
			this.tab_container.dom_element.style.width = this.opts.tab_long || '100%';
		} else {
			this.set_css('hbox');
			var width= this.opts.tab_wide || 'auto';
			this.tab_container = new VBox({width:width});
			this.tab_container.dom_element.style.height = this.opts.tab_long || '100%';
		}
		if (this.opts.tab_pos == 'top' || this.opts.tab_pos == 'left'){
			this.add_widget(this.tab_container);
			this.add_widget(this.content_container);
		} else {
			this.add_widget(this.content_container);
			this.add_widget(this.tab_container);
		}
		this.createToolbar();
		this.set_css('tabpanel');
		this.content_container.set_css('tabpanel-content');
	}
	show_first_tab(){
		this.show_content_by_tab_name(this.opts.items[0].name);
	}
	show_content_by_tab_name(name){
		this.toolbar.click(name);
	}
	createToolbar(){
		var desc = {
			tools:this.opts.items
		};
		var orient;
		if (this.opts.tab_pos == 'top' || this.opts.tab_pos == 'bottom'){
			orient = 'horizontal';
		} else {
			orient = 'vertical';
		}
		desc.orientation = orient;
		this.toolbar = new Toolbar(desc);
		this.toolbar.bind('command', this.show_tabcontent.bind(this));
		this.toolbar.bind('remove', this.tab_removed.bind(this));
		this.toolbar.bind('ready', this.show_first_tab.bind(this));
		this.tab_container.add_widget(this.toolbar);
	}
	show_tabcontent = async function(event){
		var tdesc = event.params;
		var items = this.opts.items;
		if (tdesc.name == this.cur_tab_name){
			console.log('TabPanel(): click duplication click on same tab', tdesc)
			return;
		}
		for (var i=0;i<items.length;i++){
			if (tdesc.name == items[i].name){
				var w = this.content_buffer.get(tdesc.name);
				if (w && ! items[i].refresh){
					this.content_container.clear_widgets();
					this.content_container.add_widget(w);
					this.cur_tab_name = name;
					return;
				}
				w = await widgetBuild(items[i].content);
				if (! w){
					console.log('TabPanel():create content error', items[i].content);
					return;
				}
				this.content_buffer[tdesc.name] = w;
				this.content_container.clear_widgets();
				this.content_container.add_widget(w);
				this.cur_tab_name = tdesc.name;
				return;
			}
		}
		console.log('TabPanel(): click event handled but noting to do', tdesc)
	}
	add_tab(desc){
		var item = this.toolbar.createTool(desc);
		if (desc.removable){
			this.add_removeable(item);
		}
	}
	tab_removed(event){
		var desc = event.params;
		if (this.content_buffer.hasOwnProperty(desc.name))
			delete this.content_buffer[desc.name];
		
		if (desc.name == this.cur_tab_name){
			this.show_first_tab();
		}
	}
}

Factory.register('TabPanel', TabPanel);
class UiType extends Layout {
	constructor(opts){
		super(opts);
		this.name = this.opts.name;
		this.required = opts.required || false;
		this.ctype = 'text';
		this.value = '';
	}

	getValue(){
		var o = {}
		o[this.name] = this.resultValue();
		return o;
	}
	focus(){
		this.dom_element.focus();
	}
	reset(){
		var v = this.opts.value||this.opts.defaultvalue|| '';
		this.setValue(v);
	}

	setValue(v){
		if (! v)
			v = '';
		this.vlaue = v;
		this.dom_element.value = v;
	}
	set_disabled(f){
		this.dom_element.disabled = f;
	}
	set_readonly(f){
		this.dom_element.readOnly = f;
	}
	set_required(f){
		this.dom_element.required = f;
		this.required = f;
	}
}

class UiStr extends UiType {
	static uitype='str';
	/*
	{
		name:
		value:
		defaultValue:
		align:"left", "center", "right"
		length:
		minlength:
		tip:
		width:
		readonly:
		required:
	}
	*/
	constructor(opts){
		super(opts);
		this.sizable();
		this.set_fontsize();
		if (opts.readonly) {
			this.set_readonly("Y");
		} else {
			this.set_readonly(false);
		}
		if (opts.width){
			this.dom_element.style.width = opts.width;
		}
		
	}
	create(){
		var el = this._create('input');
		this.dom_element = el;
		this.pattern = '.*';
		el.type = 'text';
		el.id = el.name = this.opts.name;
		if (this.opts.required)
			el.required = true;
		if (this.opts.css){
			el.classList.add(this.opts.css);
			this.actived_css = this.opts.css + '-actived';
		} else {
			el.classList.add('input');
			this.actived_css = 'input_actived';
		}
		el.style.textAlign = this.opts.align || 'left';
		if (this.opts.hasOwnProperty('length'))
			el.maxlength = this.opts.length;
		if (this.opts.hasOwnProperty('minlength'))
			el.minlength = this.opts.minlength;
		if (this.opts.hasOwnProperty('value'))
			this.value = this.opts.value;
		if (this.opts.defaultVlaue)
			el.defaultValue = this.opts.defaultValue;
		this.reset()
		if (this.opts.tip)
			el.placeholder = bricks_app.i18n._(this.opts.tip);
		el.addEventListener('focus', this.onfocus.bind(this));
		el.addEventListener('blur', this.onblur.bind(this));
		el.addEventListener('input', this.set_value_from_input.bind(this))
	}
	onblur(event){
		this.dom_element.classList.remove(this.actived_css);
	}
	onfocus(event){
		this.dom_element.classList.add(this.actived_css);
	}
	check_pattern(value){
		var r = new RegExp(this.pattern);
		var v = value.match(r);
		if (! v || v[0] == ''){
			return null;
		}
		return v[0];
	}
	set_value_from_input(event){
		var e = event.target;
		if (e.value == ''){
			this.value = '';
			return
		} 
		if (e.type == 'file'){
			this.value = e.value;
			return;
		}
		var v = this.check_pattern(e.value);
		if (v == null){
			e.value = this.value;
			return
		}
		this.value = v;
		var o = this.getValue();
		this.dispatch('changed', o);
	}
	resultValue(){
		return this.value;
	}
	setValue(v){
		if (! v)
			v = '';
		this.value = v;
		this.dom_element.value = '' + this.value;
	}
}

class UiPassword extends UiStr {
	static uitype='password';
	/*
	{
		name:
		value:
		defaultValue:
		align:"left", "center", "right"
		length:
		minlength:
		tip:
		readonly:
		required:
	}
	*/
	constructor(opts){
		super(opts);
		this.dom_element.type = 'password';
	}
}
class UiInt extends UiStr {
	static uitype='int';
	/* 
	{
		length:
	}
	*/
	constructor(options){
		super(options);
		this.dom_element.style.textAlign = 'right';
		this.dom_element.type = 'number';
		this.pattern = '\\d*';
	}
	resultValue(){
		return parseInt(this.value);
	}
	setValue(v){
		if (! v)
			v = '';
		this.value = '' + v;
		this.dom_element.value = '' + v;
	}

}
class UiFloat  extends UiInt {
	static uitype='float';
	/* 
	{
		dec_len:
	}
	*/
	constructor(options){
		super(options);
		this.pattern = '\\d*\\.?\\d+';
		var dec_len = this.opts.dec_len || 2;
		var step = 1;
		for (var i=0; i<dec_len; i++)
			step = step / 10;
		this.dom_element.step = step;
	}
	resultValue(){
		return parseFloat(this.value);
	}
	setValue(v){
		if (! v)
			v = '';
		this.value = '' + v;
		this.dom_element.value = '' + v;
	}
}
class UiTel extends UiStr {
	static uitype='tel';
	/*
	{

		pattern:
	}
	*/
	constructor(opts){
		super(opts);
		this.dom_element.type = 'tel';
		if (this.opts.pattern)
			this.dom_element.pattern = this.opts.pattern;
		this.pattern = '[+]?\\d+';
	}
}

class UiEmail extends UiStr {
	static uitype='email';
	/*
	{
	}
	*/
	constructor(opts){
		super(opts);
		this.dom_element.type = 'email';
		if (this.opts.pattern)
			this.dom_element.pattern = this.opts.pattern;
		if (this.opts.pattern)
			this.dom_element.pattern = this.opts.pattern;
	}
}

class UiFile extends UiStr {
	static uitype='file';
	/*
	{
		accept:
		capture:"user" or "environment"
		multiple:
	}
	*/
	constructor(opts){
		super(opts);
		this.dom_element.type = 'file';
		if (this.opts.accept)
			this.dom_element.accept = this.opts.accept;
		if (this.opts.capture)
			this.dom_element.capture = this.opts.capture;
		if (this.opts.multiple) 
			this.dom_element.multiple = true;
	}
	setValue(v){
		return;
		this.value = v;
	}

}

class UiCheck extends UiType {
	static uitype = 'check';
	constructor(opts){
		super(opts);
		UiCheck.prototype.update(Layout.prototype);
		this.add_widget = Layout.prototype.add_widget.bind(this);
		this.dom_element.style.width = 'auto';
		this.dom_element.style.height = 'auto';
		var state = 'unchecked';
		if (opts.value){
			state = 'checked';
		}
		this.ms_icon = new MultipleStateIcon({
			state:state,
			urls:{
				checked:bricks_resource('imgs/checkbox-checked.png'),
				unchecked:bricks_resource('imgs/checkbox-unchecked.png')
			}
		});
		
		this.add_widget(this.ms_icon)
		this.ms_icon.bind('state_changed', this.set_value_from_input.bind(this));

	}
	set_value_from_input(e){
		var v;
		if (this.ms_icon.state=='checked')
			v = true;
		else
			v = false;
		this.value = v;
		var o = {};
		o[this.name] = this.value;
		this.dispatch('changed', o);
	}
	setValue(v){
		this.value = v;
		if (v)
			this.ms_icon.set_state('checked');
		else 
			this.ms_icon.set_state('unchecked');
	}
	resultValue(){
		return this.value;
	}
}

class UiCheckBox extends UiType {
	static uitype='checkbox';
	/*
	{
		name:
		label:
		value:
		textField:'gg',
		valueField:'hh',
		otherField:'b',
		data:[
			{
				'gg':
				'hh':
				'b':
			}
		]
		or:
		dataurl:
		params:{},
		method:
	}
	*/
	constructor(opts){
		super(opts);
		this.valueField = opts.valueField || 'value';
		this.textField = opts.textField || 'text';
		this.value = this.opts.value || this.opts.defaultValue||[];
		if (! Array.isArray(this.value)){
			this.value = [ this.value ];
		}
		this.set_fontsize();
		this.el_legend = this._create('legend');
		var label = this.opts.label||this.opts.name;
		this.el_legend.innerText = bricks_app.i18n._(label);
		if (this.opts.dataurl){
			schedule_once(this.load_data_onfly.bind(this), 0.01);
		} else {
			this.data = opts.data;
			this.build_checkboxs();
		}
	}
	create(){
		this.dom_element = this._create('fieldset');
	}
	build_checkboxs(){
		var data = this.data;
		this.input_boxs = [];
		for (var i=0; i<data.length;i++){
			var hbox = new HBox({height:"auto",width:"100%"});
			var opts = {}
			var value = data[i][this.valueField];
			if (this.value == value){
				opts.value = true;
			}
			var check = new UiCheck(opts);
			var otext = data[i][this.textField];
			var txt = new Text({
				otext:otext,
				align:'left',
				i18n:true});
			txt.ht_left();
			check.bind('changed', this.set_value_from_input.bind(this));
			hbox.add_widget(check);
			hbox.add_widget(txt);
			this.add_widget(hbox);
			this.input_boxs.push(check);
		}
	}
	async load_data_onfly(){
		var data = await jcall(this.opts.dataurl, {
					"method":this.opts.method||'GET',
					"params":this.opts.params});
		this.data = data;
		this.build_checkboxs();
	}
	set_value_from_input(event){
		event.stopPropagation();
		var e = event.target;
		if (e.state=='checked'){
			this.value.push(e.value);
		} else {
			this.value.remove(e.value)
		}
		var o = {};
		o[this.name] = this.value;
		this.dispatch('changed', o);
	}
	resultValue(){
		return this.value;
	}
	setValue(v){
		if (Array.isArray(v)){
			this.value = v;
		} else {
			this.value = [v];
		}
		for (var i=0; i<this.input_boxs.length; i++){
			if (this.value.includes(this.data[i][this.valueField])){
				this.input_boxs[i].setValue(true);
			} else {
				this.input_boxs[i].setValue(false);
			}
		}
	}
}

class UiDate extends UiStr {
	static uitype='date';
	/* 
	{
		max_date:
		min_date:

	*/
	constructor(options){
		super(options);
		this.opts_setup();
	}
	opts_setup(){
		var e = this.dom_element;
		e.type = 'date';
		if (this.opts.max_date){
			e.max = this.opts.max_date;
		}
		if (this.opts.min_date){
			e.min = this.opts.min_date;
		}
	}
}

class UiText extends UiType {
	static uitype='text';
	/*
	{
		name:
		value:
		defaultValue:
		tip:
		rows:
		cols:
		readonly:
		required:
	}
	*/
	constructor(opts){
		super(opts);
		this.build();
		this.sizable();
		this.set_fontsize();
	}
	create(){
		this.dom_element = this._create('textarea');
	}
	build(){
		var e = this.dom_element;
		e.id = e.name = this.opts.name;
		e.rows = this.opts.rows || 5;
		e.cols = this.opts.cols || 40;
		// this.setValue(this.opts.value || this.opts.defaultvalue || '');
		this.reset();
		this.bind('input', this.set_value_from_input.bind(this))
	}
	set_value_from_input(event){
		this.value = this.dom_element.innerText;
	}
	resultValue(){
		return this.value;
	}
	setValue(v){
		if (! v) v = '';
		this.value = v;
		this.dom_element.innerText = '';
		this.dom_element.innerText = v;
		debug('UiText: v=', v);
	}
	reset(){
		var v = this.opts.value || this.opts.defaultvalue||'';
		this.setValue(v);
	}
}

class UiCode extends UiType {
	/*
	{
		name:
		value:
		valueField:
		textField:
		defaultValue:
		readonly:
		required:
		data:
		dataurl:
		params:
		method:
	}
	*/
	static uitype='code';
	constructor(opts){
		super(opts);
		this.data = this.opts.data;
		this.build();
	}
	create(){
		this.dom_element = this._create('select');
	}
	build(){
		this.dom_element.id = this.opts.name;
		this.dom_element.name = this.opts.name;
		if (this.opts.dataurl){
			schedule_once(this.get_data.bind(this), 0.01);
			return;
		}
		this.build_options(this.opts.data);
	}
	async get_data(event){
		var params = this.opts.params;
		if(event){
			params.update(event.params);
		}
		var d = await jcall(this.opts.dataurl,
			{
				method:this.opts.method || 'GET',
				params : params
			});
		this.data = d;
		this.build_options(d);
	}
	build_options(data){
		var e = this.dom_element;
		e.replaceChildren();
		var v = this.opts.value || this.opts.defaultvalue;
		this.value = v;
		this.option_widgets = {};
		for (var i=0; i<data.length; i++){
			var o = document.createElement('option');
			o.value = data[i][this.opts.valueField||'value'];
			o.innerText = bricks_app.i18n._(data[i][this.opts.textField||'text']);
			this.option_widgets[o.value] = o;
			if (o.value == v){
				o.selected = true;
			}
			e.appendChild(o);
			this.sizable_elements.push(o);
		}
		this.bind('input', this.set_value_from_input.bind(this))
		this.sizable();
		this.set_fontsize();
	}
	set_value_from_input(event){
		this.value = this.dom_element.value;
		this.dispatch('changed', this.getValue());
	}
	resultValue(){
		return this.value;
	}
	setValue(v){
		this.value = v;
		for (var i=0; i<this.option_widgets.length; i++){
			if (this.value == this.option_widgets[i].value){
				this.option_widgets[i].checked = true
			} else {
				this.option_widgets[i].checked = true
			}
		}
	}
	reset(){
		var v = this.opts.value||this.opts.defaultvalue||'';
		this.setValue(v);
	}
}

class _Input {
	constructor(){
		this.uitypes = [];
	}

	register(name, Klass){
		if (! Klass){
			console.log('Klass not defined', name);
			return;
		}
		if (! Klass.uitype){
			console.log('uitype of Klass not defined', name);
			return;
		
		}
		Factory.register(name, Klass);
		this.uitypes[Klass.uitype] = Klass;
	}
	factory(options){
		var klass = this.uitypes.get(options.uitype);
		if (klass){
			return new klass(options);
		}
		console.log('create input for:', options.uitype, 'failed');
		return null;
	}
}

class UiAudio extends UiStr {
	static uitype = 'audio';
	constructor(opts){
		super(opts);
		this.autoplay = opts.autoplay;
		this.readonly = opts.readonly;
		this.icon = new Icon({
			url: bricks_resource('imgs/right_arrow.png')});
		this.add_widget(this.icon);
		this.icon.bind('click', this.play_audio.bind(this));
		this.player = new Audio({
			url:this.value
			});
		if (this.autoplay){
			schedule_once(this.autoplay_audio.bind(this), 1);
		}

	}
	autoplay_audio(){
		this.icon.dispatch('click');
	}
	play_audio(){
		this.player.toggle_play();
	}
	play_audio(){
		if(this.value!=this.player.src){
			this.player.stop();
			this.player.set_source(this.value);
			this.player.play();
			return
		}
		this.player.toggle_play();
		this.btn.dispatch('click');
	}
}
class UiVideo extends UiStr {
	static uitype = 'video';
	constructor(opts){
		super(opts);
		this.autoplay = opts.autoplay;
		this.readonly = opts.readonly;
		this.icon = new Icon({
			url: bricks_resource('imgs/right_arrow.png')});
		this.add_widget(this.icon);
		this.icon.bind('click', this.play_audio.bind(this));
		this.player = new VideoPlayer({
			url:this.value
			});
		if (this.autoplay){
			schedule_once(this.autoplay_audio.bind(this), 1);
		}

	}
	autoplay_audio(){
		this.icon.dispatch('click');
	}
	play_audio(){
		this.player.toggle_play();
	}
	play_audio(){
		if(this.value!=this.player.src){
			this.player.stop();
			this.player.set_source(this.value);
			this.player.play();
			return
		}
		this.player.toggle_play();
		this.btn.dispatch('click');
	}
}
var Input = new _Input();
Input.register('UiStr', UiStr);
Input.register('UiTel', UiTel);
Input.register('UiDate', UiDate);
Input.register('UiInt', UiInt);
Input.register('UiFloat', UiFloat);
Input.register('UiCheck', UiCheck);
Input.register('UiCheckBox', UiCheckBox);
Input.register('UiEmail', UiEmail);
Input.register('UiFile', UiFile);
Input.register('UiCode', UiCode);
Input.register('UiText', UiText);
Input.register('UiPassword', UiPassword);
Input.register('UiAudio', UiAudio);
Input.register('UiVideo', UiVideo);
class RegisterFunction {
	constructor(){
		this.rfs = {};
	}
	register(n, f){
		this.rfs.update({n:f});
	}
	get(n){
		return this.rfs.get(n);
	}
}
class Button extends Layout {
	/*
		orientation:
		height:100%,
		width:100%,
		item_rate:
		tooltip:
		color:
		nonepack:
		name:
		icon:
		label:
		css:
		action:{
			target:
			datawidget:
			datamethod:
			datascript:
			dataparams:
			rtdata:
			actiontype:
			...
		}
	*/


	constructor(opts){
		super(opts);
		var style = {
			display:"flex",
			justifyContent:"center",
			textAlign:"center",
			alignItem:"center",
			width:"auto",
			height:"auto",
		};
		if (opts.nonepack){
			style.padding = '0px';
			style.border = '0';
		} else {
			style.padding = '0.5rem';
		}
		if (this.opts.orientation == 'horizontal'){
			style.flexDirection = 'rows';
			this.orient = 'h';
		} else {
			style.flexDirection = 'column';
			this.orient = 'v';
		}
		this.item_rate = opts.item_rate || 1;
		this.set_id(this.opts.name);
		this.opts_setup();
		this.dom_element.style.update(style);
	}
	create(){
		this.dom_element = document.createElement('button');
	}
	opts_setup(){
		var item_size = this.opts.item_size || bricks_app.charsize;
		if (this.opts.icon){
			var icon = new Icon({
				rate:this.item_rate,
				url:this.opts.icon
			})
			this.add_widget(icon);
			icon.bind('click', this.target_clicked.bind(this));
		}
		if (this.opts.label){
			var opts = {
						rate:this.item_rate,
						color:this.opts.color,
						bgcolor:this.opts.bgcolor,
						otext:this.opts.label, 
						i18n:true};
			var txt = new Text(opts);
			this.add_widget(txt);
			txt.bind('click', this.target_clicked.bind(this));
		}
	}
	target_clicked(event){
		console.log('target_clicked() .... called ');
		event.stopPropagation();
		this.dispatch('click', this.opts);
		if (this.opts.action){
			if (this.opts.debug){
				console.log('debug:opts=', this.opts);
			}
		}
	}
}

Factory.register('Button', Button);
class Accordion extends VBox {
	/* 
	{
		item_size:
		items:[
			{
				icon:
				text:
				content:{
					widgettype:
					...
				}
			}
		]
	}
	*/
	constructor(opts){
		super(opts);
		var item_size = this.opts.item_size || '25px';
		this.set_height('100%');
		var items = this.opts.items;
		this.items = [];
		this.subcontents = {};
		var item_css = this.opts.css || 'accordion' + '-button';
		var content_css = this.opts.css || 'accordion' + '-content';
		for (var i=0; i< items.length; i++){
			var opts = {
				name:items[i].name,
				icon:items[i].icon,
				text:items[i].text,
				height:'auto',
				orientation:'horizontal'
			}
			var b = new Button(opts);
			b.bind('click', this.change_content.bind(this));
			this.items.push(b);
			this.add_widget(b);
		}
		this.content = new VBox({});
	}
	async change_content(evnet){
		var b = event.target.bricks_widget;
		var name = b.opts.name;
		console.log('accordion: button=', b, 'name=', name);
		var pos = -1;
		for (var i=0; i< this.opts.items.length; i++){
			if (name == this.opts.items[i].name){
				pos = i;
				break
			}
		}
		if (pos==-1){
			debug('Accordion():name=',name, 'not found in items',this.opts.items);
		}
		var c = this.subcontents.get(name);
		if (! c){
			c = await widgetBuild(this.opts.items[pos].content);
			this.subcontents[name] = c;
		}
		this.content.clear_widgets();
		this.content.add_widget(c);
		try {
			this.remove_widget(this.content);
		}
		catch(e){
			;
		}
		this.add_widget(this.content, pos+1);
	}
}

Factory.register('Accordion', Accordion);
class TreeNode extends VBox {
	constructor(tree, parent, data){
		var opts = {
			width:'100%',
			height:'auto',
			overflow:'hidden'
		}
		super(opts);
		this.tree = tree;
		this.parent = parent;
		this.children_loaded = false;
		this.data = data;
		this.is_leaf = this.data.is_leaf;
		this.params = {id:this.data[this.tree.opts.idField]};
		if (this.tree.multitype_tree){
			this.params['type'] = this.data[this.tree.opts.typeField];
		}
		var n = new HBox({
				height:'auto',
				overflow:'hidden',
				width:'100%'
		})
		n.dom_element.style.margin = bricks_app.charsize * 0.2;
		this.add_widget(n);
		n.bind('click', this.tree.node_click_handle.bind(this.tree, this));
		this.node_widget = n;
		this.create_node_content(n);
		if (! this.data.is_leaf) {
			this.container = new VBox({height:'auto', overflow:'hidden'});
			this.add_widget(this.container);
			this.container.dom_element.style.marginLeft = bricks_app.charsize + 'px';
			if (this.data.children){
				this.tree.create_node_children(this, this.data.children);
			}
			this.container.hide();
		}
	}
	selected(flg){
		if (flg){
			this.str_w.set_css('selected');
		} else {
			this.str_w.set_css('selected',true);
		}
	}
	async toggleExpandCollapse(event){
		if (event.params == 'open') {
			await this.expand();
		} else {
			this.collapse()
		}
	}
	async expand(){
		if (this.is_leaf){
			return;
		}
		if (this.tree.opts.dataurl && !this.is_leaf && !this.children_loaded){
			await this.tree.get_children_data(this)
			this.children_loaded = true;
		}
		this.container.show();
	}
	collapse(){
		if (this.is_leaf){
			return;
		}
		this.container.hide();
	}
	create_node_content(widget){
		var img_size = bricks_app.charsize;
		if (this.is_leaf){
			widget.add_widget(new BlankIcon({}));
		} else {
			var srcs = this.tree.opts.node_state_imgs || {};
			var sources = {};
			sources['open'] = srcs.get('open', bricks_resource('imgs/down_arrow.png'));
			sources['close'] = srcs.get('close', bricks_resource('imgs/right_arrow.png'));
			this.trigle = new MultipleStateIcon({
				state:'close',
				urls:sources,
				height:img_size,
				width:img_size
			});
			this.trigle.bind('state_changed', this.toggleExpandCollapse.bind(this));
			widget.add_widget(this.trigle);
		}
		var dtype = this.data[this.tree.opts.typeField];
		var icon = TypeIcons.get(dtype);
		if (!icon && this.tree.opts.default_type){
			icon = TypeIcons.get(his.tree.opts.default_type);
		}
		if (!icon){
			icon = bricks_resource('imgs/folder.png');
		}
		var img = new Icon({
			url:icon
		});
		widget.add_widget(img);
		var txt = this.data[this.tree.opts.textField];
		widget.add_widget(
		this.str_w = new Text({text:txt}));
		this.input = new UiStr({name:'text', value:txt});
		this.input.bind('blur', this.edit_handle.bind(this));
		widget.add_widget(this.str_w);
	}
	edit(){
		this.node_widget.remove_widget(this.str_w);
		this.input.setValue(this.str_w.text);
		this.node_widget.add_widget(this.input);
	}
	async edit_handle(){
		if (this.input.value==this.str_w.text)
			return;
		var v = this.input.value;
		r = await this.syncdata('edit');
		this.data[this.tree.opts.textField] = v;
		this.str_w = new Text({text:v});
		this.node_widget.remove_widget(this.input);
		this.node_widget.add_widget(this.str_w);
	}
	async syncdata(mode){
	}
}

class Tree extends VBox {
	/*
	{
		row_height:
		multitype_tree:false,
		idField:
		textField:
		type_icons:
		typeField:
		default_type:
		data:
		dataurl:
		node_state_imgs:{
			open:url,
			close:url
		},
		admin:{
			{
				addurl:
				deleteurl:
				updateurl:
				othertools:[
				]
			}
		}
	}
	*/
	constructor(options){
		super(options);
		this.set_height('100%');
		this.row_height = this.opts.row_height || '35px';
		this.multitype_tree = this.opts.multitype_tree||false;
		this.selected_node = null;
		this.create_toolbar();
		this.container = new VScrollPanel({});
		this.add_widget(this.container);
		this.data_id = null;
		if (this.opts.dataurl){
			schedule_once(0.01, this.get_children_data.bind(this, this));
		}
		this.create_node_children(this, this.opts.data);
	}
	create_toolbar(){
	}
	async get_children_data(node){
		var d = await jcall(this.opts.dataurl,{
				method : this.opts.method || 'GET',
				params : node.params
			})
		if (d.length == 0){
			node.is_leaf = true;
		} else {
			this.create_tree_nodes(node, d);
		}
	}
	create_node_children(node, data){
		for (var i=0; i<data.length; i++){
			var n = new TreeNode(this, node, data[i]);
			node.container.add_widget(n);
		}
	}
	node_click_handle(node, event){
		if (this.selected_node){
			this.selected_node.selected(false);
		}
		this.selected_node = node;
		node.selected(true);
		this.dispatch('node_click', node);
	}
}

class EditableTree extends Tree {
	/*
	{
		...
		admin:{
			url:
			add:{
				icon:
			}
			delete_node:{
				icon:
			}
			move_up:
			move_down:
			move_top:
			move_bottom:
		}
	}
	*/
	constructor(opts){
		super(opts);
	}
	create_toolbar(){
		if (!this.opts.admin){
			return
		}
		var desc = {
			height:'auto',
			tools:[
				{
					name:'add',
					icon:bricks_resource('imgs/add.png')
				},
				{
					name:'edit',
					icon:bricks_resource('imgs/edit.png')
				},
				{
					name:'move_top',
					icon:bricks_resource('imgs/move_top.png')
				},
				{
					name:'move_up',
					icon:bricks_resource('imgs/move_up.png')
				},
				{
					name:'move_down',
					icon:bricks_resource('imgs/move_down.png')
				},
				{
					name:'move_button',
					icon:bricks_resource('imgs/move_bottom.png')
				},
				{
					name:'delete',
					icon:bricks_resource('imgs/delete_node.png')
				}
			]
		}
		this.toolbar = new Toolbar(desc);
		this.toolbar.bind('command', this.command_handle.bind(this));
		this.add_widget(this.toolbar, 0);
	}
	command_handle(e){
		console.log('command event fire ...', e);
		var name = e.params.name;
		switch (name) {
			case 'add':
				this.add_node();
				break;
			case 'delete':
				this.delete_node();
				break;
			case 'edit':
				this.edit_node();
				break;
			case 'move_top':
				this.move_top();
				break;
			case 'move_up':
				this.move_up();
				break;
			case 'move_down':
				this.move_down();
				break;
			case 'move_bottom':
				this.move_bottom();
				break;
		}
	}
	add_node(){
		var node = this;
		if (this.selected_node) node = this.selected_node;
		var data = { };
		data[this.opts.idField] = 'undefined';
		data[this.opts.textField] = 'new node';
		var n = new TreeNode(this, node, data);
		node.container.add_widget(n);
		n.edit();
		console.log('add_node() finished ...');
	}
	edit_node(){
		if (! this.selected_node){
			return;
		}
		this.selected_node.edit();
	}
	delete_node(){
		if (! this.selected_node){
			return;
		}
		this.selected_node.delete();
	}
	move_top(){
		if (! this.selected_node){
			return;
		}
		this.selected_node.move_top();
	}
	move_up(){
		if (! this.selected_node){
			return;
		}
		this.selected_node.move_up();
	}
	move_down(){
		if (! this.selected_node){
			return;
		}
		this.selected_node.move_down();
	}
	move_botton(){
		if (! this.selected_node){
			return;
		}
		this.selected_node.move_botton();
	}
}
class  PolymorphyTree extends Tree {
	/*
	{
		root:[t1],
		nodetypes:{
			t1:{
				idField:
				typeField:
				textField:
				icon:
				contextmenu:
				subtypes:[]
			}
		}
		data:
		dataurl:
	}
	*/
	constructor(opts){
		super(opts);
	}
}
Factory.register('Tree', Tree);
Factory.register('EditableTree', EditableTree);
class MultipleStateImage extends Layout {
	/* 
	{
		state:
		urls:{
			state1:url1,
			state2:url2,
			...
		}
		width:
		height:
	}
	*/
	constructor(opts){
		super(opts);
		this.state = this.opts.state
		var desc = {
			urls : this.opts.urls[this.state],
			width:this.opts.width,
			height:this.opts.height
		}
		this.img = new Image(desc);
		this.add_widget(this.img);
		this.img.bind('click', this.change_state.bind(this));
	}
	set_state(state){
		this.state = state;
		this.img.set_url(this.opts.urls[state]);
	}

	change_state(event){
		event.stopPropagation();
		var states = Object.keys(this.opts.urls);
		for (var i=0;i<states.length;i++){
			if (states[i] == this.state){
				var k = i + 1;
				if (k >= states.length) k = 0;
				this.state = states[k];
				this.img.set_url(this.opts.urls[this.state]);
				this.dispatch('state_changed', this.state);
				break;
			}
		}
	}
}

class MultipleStateIcon extends Icon {
	constructor(opts){
		opts.url = opts.urls[opts.state];
		super(opts);
		this.state = opts.state;
		this.urls = opts.urls;
		this.bind('click', this.change_state.bind(this));
	}
	change_state(event){
		event.stopPropagation();
		var states = Object.keys(this.urls);
		for (var i=0;i<states.length;i++){
			if (states[i] == this.state){
				var k = i + 1;
				if (k >= states.length) k = 0;
				this.set_state(states[k]);
				this.dispatch('state_changed', this.state);
				break;
			}
		}
	}
	set_state(state){
		this.state = state;
		this.set_url(this.urls[state]);
	}

}
Factory.register('MultipleStateImage', MultipleStateImage);


class FormBody extends VBox {
	/*
	{
		title:
		description:
		fields: [
			{
				"name":,
				"label":,
				"removable":
				"icon":
				"content":
			},
			...
		]
	}
	*/
	constructor(opts){
		opts.width = '100%';
		opts.scrollY = 'scroll';
		super(opts);
		this.name_inputs = {};
		if (this.opts.title){
			var t = new Title2({
					otext:this.opts.title,
					height:'auto',
					i18n:true});
			this.add_widget(t);
		}
		if (this.opts.description){
			var d = new Text({
					otext:this.opts.description,
					height:'auto',
					i18n:true});
			this.add_widget(d);
		}
		this.form_body = new Layout({width:'100%',
							overflow:'auto' 
							});
		this.add_widget(this.form_body);
		this.form_body.set_css('multicolumns');
		this.build_fields();
	}
	reset_data(){
		for (var name in this.name_inputs){
			if (! this.name_inputs.hasOwnProperty(name)){
				continue;
			}
			var w = this.name_inputs[name];
			w.reset();
		}
	}
	getValue(){
		var data = {};
		for (var name in this.name_inputs){
			if (! this.name_inputs.hasOwnProperty(name)){
				continue;
			}

			var w = this.name_inputs[name];
			var d = w.getValue();
			if (w.required && ( d[name] == '' || d[name] === null)){
				console.log('data=', data, 'd=', d);
				w.focus();
				return;
			}
			data.update(d);
		}
		return data;
	}
	async validation(){
		var data = this.getValue();
		if (this.submit_url){
			var rzt = await jcall(this.submit_url,
						{
							params:data
						});
		}
		this.dispatch('submit', data);
	}

	build_fields(){
		var fields = this.opts.fields;
		for (var i=0; i<fields.length; i++){
			var box = new VBox({height:'auto',overflow:'none'});
			box.set_css('inputbox');
			this.form_body.add_widget(box);
			var txt = new Text({
					otext:fields[i].label||fields[i].name, 
					height:'auto',
					i18n:true});
			box.add_widget(txt);
			var w = Input.factory(fields[i]);
			if (w){
				box.add_widget(w);
				this.name_inputs[fields[i].name] = w;
				console.log(fields[i].uitype, 'create Input ok');
			} else {
				console.log(fields[i], 'createInput failed');
			}
		}
	}
}
class Form extends VBox {
	/*
	{
		title:
		description:
		notoolbar:False,
		cols:
		dataurl:
		toolbar:
		submit_url:
		fields
	}
	*/
	constructor(opts){
		super(opts);
		this.body = new FormBody(opts);
		this.add_widget(this.body);
		if (! opts.notoolbar)
			this.build_toolbar(this);
	}
	build_toolbar(widget){
		var box = new HBox({height:'auto', width:'100%'});
		widget.add_widget(box);
		var tb_desc = this.opts.toolbar || {
			width:"auto",
			tools:[
				{
					icon:bricks_resource('imgs/submit.png'),
					name:'submit',
					label:'Submit'
				},
				{
					icon:bricks_resource('imgs/cancel.png'),
					name:'cancel',
					label:'Cancel'
				}
			]
		};
		var tbw = new Toolbar(tb_desc);
		tbw.bind('command', this.command_handle.bind(this));
		box.add_widget(new HFiller());
		box.add_widget(tbw);
		box.add_widget(new HFiller());
	}
	command_handle(event){
		var params = event.params;
		console.log('Form(): click_handle() params=', params);
		if (!params){
			error('click_handle() get a null params');
			return
		}
		if (params.name == 'submit'){
			this.body.validation();
		} else if (params.name == 'cancel'){
			this.cancel();
		} else if (params.name == 'reset'){
			this.body.reset_data();
		} else {
			if (params.action){
				f = buildEventHandler(this, params);
				if (f) f(event);
			}
		}
	}
	getValue(){
		return this.body.getValue();
	}
	cancel(){
		this.dispatch('cancel');
	}

}

class TabForm extends Form {
	/*
	options
	{
		css:
		tab_long: 100%
		tab_pos:"top"
		items:[
			{
				name:
				label:"tab1",
				icon:
				removable:
				refresh:false,
				content:{
					"widgettype":...
				}
			}
		]
	}
	{
		...
		fields:[
			{
			}
		]
	*/
	constructor(opts){
		super(opts);
	}
	build_fields(fields){
	}
}

Factory.register('Form', Form);
// Factory.register('TabForm', TabForm);
class Popup extends VBox {
	/* 
	{
		holder:
		title:
		auto_open:
		auto_dismiss:
		archor:cc
		timeout:
	}
	*/
	constructor(opts){
		super(opts);
		this.holder = opts.holder;
		this.task = null;
		this.title = opts.title|| 'Title';
		this.archor = opts.archor || 'cc';
		this.timeout = opts.timeout;
		this.set_css('message');
		this.build();
		archorize(this.dom_element, this.archor);
	}

	build(){
		var tb = new HBox({height:'40px'});
		tb.set_css('title');
		this.add_widget(tb);
		var tit = new Text({otext:this.title, i18n:true});
		this.content = new VBox({});
		VBox.prototype.add_widget.bind(this)(this.content);
		tb.add_widget(tit);
		this.holder = Body;
		if (this.opts.holder){
			if (type(this.opts.holder) == 'string'){
				this.holder = getWidgetById(this.opts.holder, Body);
			} else {
				this.holder = this.opts.holder;
			}
		}
	}
	open(){
		this.holder.add_widget(this);
		if (this.timeout && this.timeout > 0){
			this.task = schedule_once(this.dismiss.bind(this), this.timeout);
		}
	}
	add_widget(w, idx){
		this.content.add_widget(w, idx);
		if (this.opts.auto_open){
			this.open();
		}
	}
	dismiss(){
		if (this.task){
			this.task.cancel();
			this.task = null
		}
		this.holder.remove_widget(this);
	}
}

class Message extends VBox {
	/* 
	{
		title:
		message:
		params:
		auto_open:
		auto_dismiss:
		archor:cc
		timeout:
	}
	*/
	constructor(opts){
		super(opts);
		var t = new Text({otext:this.opts.text,
					i18n:true});
		this.add_widget(t);
	}
}

class Error extends Message {
	constructor(opts){
		super(opts);
		this.set_css('error');
	}
}

class PopupForm extends Popup {
	/* 
	{
		form:{
		}
	}
	*/
	constructor(options){
		super(options);
		this.form = new Form(this.opts.form);
		this.add_widget(this.form);
		this.form.bind('submit', this.close_popup.bind(this));
		this.form.bind('discard', this.close_popup.bind(this));
	}
	close_popup(e){
		this.dismiss();
	}
}
Factory.register('Message', Message);
Factory.register('Error', Error);
Factory.register('PopupForm', PopupForm);
class BufferedDataLoader {
	/*
	{
		url:
		method:
		params:
		buffer_pages:
		pagerows:
	}
	usage:
	var p = Paging({...});
	p.loadData(); // return page(1) data
	p.getPage(5); // return page(5) data
	p.nextPage()
	p.previousPage() 
	*/
	constructor(w, opts){
		this.widget = w;
		this.url = opts.url;
		this.loading = false
		this.method = opts.method || 'GET';
		this.params = opts.params || {};
		this.buffer_pages = opts.buffer_pages || 5;
		this.pagerows = opts.pagerows || 60;
		this.initial();
	}
	initial(){
		this.cur_page = -1;
		this.buffer = {};
		this.buffered_pages = 0;
		this.total_record = -1;
		this.cur_params = {};
	}
	async loadData(params){
		this.initial();
		this.widget.clear_data();
		this.buffer = {};
		if (!params) params = {};
		var p = this.params.copy();
		p.update(params);
		p.rows = this.pagerows;
		this.cur_params = p;
		this.cur_page = 1;
		return this.loadPage();
	}

	async loadPage(page){
		if (this.loading) return;
		this.loading = true;
		if (this.buffered_pages >= this.buffer_pages){
			this.widget.del_old_rows(this.pagerows, this.direction);
			this.buffered_pages -= 1;
		}
		var params = this.cur_params.copy();
		params.page = this.cur_page;
		params.rows = this.pagerows;
		var d = await jcall(this.url, {
					method:this.method,
					params:params});
		this.total_records = d.total;
		d.page = this.cur_page;
		d.total_page = this.total_records / this.pagerows;
		if (d.total_page * this.pagerows < this.total_record){
			d.total_page += 1;
		}
		this.total_page = d.total_page;
		this.widget.add_rows(d.rows);
		this.buffered_pages += 1;
		this.loading = false;
		return d;
	}
	
	async nextPage(){
		if (this.loading) return;
		if (this.cur_page >= this.total_page){
			return;
		}
		this.direction = 'down';
		this.cur_page += 1;
		return await this.loadPage();
	}
	async previousPage(){
		if (this.loading) return;
		if (this.cur_page <= 1){
			return
		}
		this.direction = 'up';
		this.cur_page -= 1;
		return await this.loadPage();
	}
}

var low_handle = function(widget, dim, last_pos, cur_pos, maxlen, winsize){
	var dir = cur_pos - last_pos;
	var max_rate = cur_pos / (maxlen - winsize);
	var min_rate = cur_pos / maxlen;
	if (!widget.threshold && dir > 0 && max_rate >= widget.max_threshold){
		console.log('max_threshold reached ...');
		widget.thresgold = true;
		widget.dispatch('max_threshold');
		return
	}
	if (!widget.threshold && dir < 0 && min_rate <= widget.min_threshold){
		console.log('min_threshold reached ...');
		widget.thresgold = true;
		widget.dispatch('min_threshold');
		return
	}
	console.log('scroll_handle() called ...', max_rate, cur_pos, maxlen, winsize);
}

class HScrollPanel extends HFiller {
	/*
	{
		min_threshold:
		max_threshold:
	}
	*/
	constructor(opts){
		super(opts);
		this.min_threshold = opts.min_threshold || 0.02;
		this.max_threshold = opts.max_threshold || 0.95;
		this.bind('scroll', this.scroll_handle.bind(this))
		this.last_scrollLeft = this.dom_element.scrollLeft;
		this.threshold = false;
	}
	scroll_handle(event){
		if (event.target != this.dom_element){
			// console.log('HScroll():scroll on other', event.target);
			return;
		}
		var e = this.dom_element;
		if ( e.scrollWidth - e.clientWidth < 1) {
			// console.log('HScroll():same size');
			return;
		}
		low_handle(this, 'x', this.last_scrollLeft, 
						e.scrollLeft,
						e.scrollWidth,
						e.clientWidth);

		this.last_scrollLeft = e.scrollLeft;
	}
}

class VScrollPanel extends VFiller {
	/*
	{
		min_threshold:
		max_threshold:
	}
	*/
	constructor(opts){
		super(opts);
		this.min_threshold = opts.min_threshold || 0.02;
		this.max_threshold = opts.max_threshold || 0.95;
		this.bind('scroll', this.scroll_handle.bind(this))
		this.last_scrollTop = this.dom_element.scrollTop;
	}
	scroll_handle(event){
		if (event.target != this.dom_element){
			// console.log('scroll on other', event.target);
			return;
		}
		var e = this.dom_element;
		if ( e.scrollHeight - e.clientHeight < 2) {
			// console.log('same size');
			return;
		}
		low_handle(this, 'y', this.last_scrollTop, 
						e.scrollTop,
						e.scrollHeight,
						e.clientHeight);
		this.last_scrollTop = e.scrollTop;
	}
}

Factory.register('VScrollPanel', VScrollPanel);
Factory.register('HScrollPanel', HScrollPanel);

class Row {
	constructor(dg, rec) {
		this.dg = dg;
		this.data = rec.copy();
		this.freeze_cols = [];
		this.normal_cols = [];
		this.name_widgets = {};
		this.click_handler = this.dg.click_handler.bind(this.dg, this);
		this.freeze_row = this.create_col_widgets(this.dg.freeze_fields, this.freeze_cols);
		if (this.freeze_row){
			// this.freeze_row.set_css('datagrid-row');
			this.freeze_row.set_style('width', this.freeze_width + 'px');
		}
		this.normal_row = this.create_col_widgets(this.dg.normal_fields, this.normal_cols);
		if (this.normal_row){
			// this.normal_row.set_css('datagrid-row');
			this.normal_row.set_style('width', this.normal_width + 'px');
		}
	}
	create_col_widgets(fields, cols) {
		for (var i = 0; i < fields.length; i++) {
			var f = fields[i];
			var opts = f.uioptions || {};
			var w;
			opts.update({
				name: f.name,
				label: f.label,
				uitype: f.uitype,
				width: f.width,
				required: true,
				row_data: this.data.copy(),
				readonly: true
			});
			if (opts.uitype == 'button') {
				opts.icon = f.icon;
				opts.action = f.action;
				opts.action.params = this.data.copy();
				opts.action.params.row = this;
				w = new Button(opts);
				w.bind('click', this.button_click.bind(w))
				//# buildEventBind(this.dg, w, 'click', opts.action);
			} else {
				opts.value = this.data[f.name],
					w = Input.factory(opts);
				w.bind('click', this.click_handler);
			}
			w.desc_dic = opts;
			w.rowObj = this;
			w.dom_element.style['min-width'] = w.width + 'px';
			w.set_style('flex', '0 0 ' + convert2int(f.width) + 'px');
			cols.push(w);
			this.name_widgets[f.name] = w;
		}
		if (cols.length > 0) {
			var row = new HBox({ height: 'auto' })
			for (var i = 0; i < cols.length; i++) {
				row.add_widget(cols[i]);
			}
			return row;
		}
		return null;
	}
	button_click(event){
		console.log('button_click():,', this.desc_dic, this.rowObj);
		this.getValue=function(){
			console.log('this.desc_dic.row_data=', this.desc_dic.row_data);
			return this.desc_dic.row_data;
		}
		var desc = this.desc_dic.action;
		desc.datawidget = this;
		desc.datamethod = 'getValue';
		var f = universal_handler(this, this.rowObj, desc);
		console.log('f=', f);
	}
	selected() {
		if (this.freeze_row) {
			this.freeze_cols.forEach(w => { w.set_css('selected', false) })
		}
		if (this.normal_row) {
			this.normal_cols.forEach(w => { w.set_css('selected', false) })
		}
	}
	unselected() {
		if (this.freeze_row) {
			this.freeze_cols.forEach(w => { w.set_css('selected', true) })
		}
		if (this.normal_row) {
			this.normal_cols.forEach(w => { w.set_css('selected', true) })
		}
	}
	toogle_select(e, f) {
		if (f) e.classList.add('selected');
		else e.classList.remove('selected');
	}
}

class DataGrid extends VBox {
	/*
	{
		data:
		dataurl:
		method:
		params:
		title:
		description:
		show_info:
		miniform:
		toolbar:
		tailer:
		row_height:
		header_css:
		body_css:
		fields:[
			{
				name:
				label:
				datatype:
				uitype:
				uioptions:
				freeze:
				width:
			}
		]
	}
	*/
	constructor(opts) {
		super(opts);
		this.loading = false;
		this.select_row = null;
		this.set_css('datagrid');
		this.dataurl = opts.dataurl;
		this.method = opts.method;
		this.params = opts.params;
		this.title = opts.title;
		this.check = opts.check || false;
		this.lineno = opts.lineno || false;
		this.description = opts.description;
		this.show_info = opts.show_info;
		this.admin = opts.admin;
		this.row_height = opts.row_height;
		this.fields = opts.fields;
		this.header_css = opts.header_css || 'grid_header';
		this.body_css = opts.body_css || 'grid_body';
		if (this.title) {
			this.title_bar = new HBox({ height: 'auto' });
			this.add_widget(this.title_bar);
			var tw = new Title1({ otext: this.title, i18n: true });
			this.title_bar.add_widget(tw);
		}
		if (this.description) {
			this.descbar = new HBox({ height: 'auto' });
			this.add_widget(this.descbar);
			var dw = new Text({ otext: this.description, i18n: true });
			this.descbar.add_widget(dw);
		}
		
		if (this.opts.miniform || this.opts.toolbar){
			this.admin_bar = new HBox({height:'auto'});
		}
		if (this.opts.miniform){
			this.miniform = new MiniForm(this.opts.miniform);
			this.miniform.bind('input', this.miniform_input.bind(this));
			this.admin_bar.add_widget(this.miniform);
		}
		if (this.opts.toolbar) {
			this.admin_bar.add_widget(new HFiller({}));
			self.toolbar = new Toolbar(this.opts.toolbar);
			self.toolbar.bind('command', this.command_handle.bind(this));
			this.admin_bar.add_widget(this.toolbar);
		}
		this.create_parts();
		if (this.show_info) {
			this.infow = new HBox({ height: '40px' });
			this.add_widget(this.infow);
		}
		if (this.dataurl) {
			this.loader = new BufferedDataLoader(this, {
				pagerows: 80,
				buffer_pages: 5,
				url: absurl(this.dataurl, this),
				methiod: this.method,
				params: this.params
			})
			schedule_once(this.loader.loadData.bind(this.loader), 0.01);
			if (this.freeze_body) {
				this.freeze_body.bind('min_threshold', this.loader.previousPage.bind(this.loader));
				this.freeze_body.bind('max_threshold', this.loader.nextPage.bind(this.loader));
			}
			this.normal_body.bind('min_threshold', this.loader.previousPage.bind(this.loader));
			this.normal_body.bind('max_threshold', this.loader.nextPage.bind(this.loader));
		} else {
			if (this.data) {
				this.add_rows(this.data);
			}
		}
	}
	clear_data(){
		if (this.normal_body)
			this.normal_body.clear_widgets();
		if (this.freeze_body)
			this.freeze_body.clear_widgets()
		this.selected_row = null;
	}
	miniform_input(event){
		var params = this.miniform.getValue();
		this.loadData(params);
	}
	loadData(params){
		this.loader.loadData(params)
	}
	command_handle(event){
	}
	del_old_rows(cnt, direction) {
		if (this.freeze_body) {
			if (direction == 'down') {
				this.freeze_body.remove_widgets_at_begin(cnt);
			} else {
				this.freeze_body.remove_widgets_at_end(cnt);
			}
		}
		if (direction == 'down') {
			this.normal_body.remove_widgets_at_begin(cnt);
		} else {
			this.normal_body.remove_widgets_at_end(cnt);
		}
	}
	add_rows(records, direction) {
		var index = null;
		if (direction == 'down') {
			index = 0
		}
		for (var i = 0; i < records.length; i++) {
			this.add_row(records[i], index);
		}
	}
	add_row(data, index) {
		var row = new Row(this, data);
		if (this.freeze_body)
			this.freeze_body.add_widget(row.freeze_row, index);
		if (this.normal_body)
			this.normal_body.add_widget(row.normal_row, index);
	}
	check_desc() {
		return {
			freeze:true,
			uitype: 'check',
			name: '_check',
			width: '20px'
		}
	}
	lineno_desc() {
		return {
			freeze:true,
			uitype: 'int',
			name: '_lineno',
			label: '#',
			width: '100px'
		}
	}
	create_parts() {
		this.freeze_width = 0;
		this.normal_width = 0;
		var hbox = new HBox({});
		hbox.set_css('datagrid-grid');
		this.add_widget(hbox);
		this.freeze_fields = [];
		this.normal_fields = [];
		if (this.check) {
			this.fields.push(this.check_desc());
		}
		if (this.lineno) {
			this.fields.push(this.lineno_desc());
		}
		for (var i = 0; i < this.fields.length; i++) {
			var f = this.fields[i];
			if (!f.width || f.width <= 0 ) f.width = 100;
			if (f.freeze) {
				this.freeze_fields.push(f);
				this.freeze_width += convert2int(f.width);
			} else {
				this.normal_fields.push(f);
				this.normal_width += convert2int(f.width);

			}
		}
		this.freeze_part = null;
		this.normal_part = null;
		console.log('width=', this.freeze_width, '-', this.normal_width, '...');
		if (this.freeze_fields.length > 0) {
			this.freeze_part = new VBox({});
			this.freeze_part.set_css('datagrid-left');
			this.freeze_part.set_style('width', this.freeze_width + 'px');
			this.freeze_header = new HBox({ height: this.row_height + 'px', width: this.freeze_width + 'px'});
			this.freeze_body = new VScrollPanel({ height: "100%", 
									width: this.freeze_width + 'px' })
			this.freeze_body.set_css('datagrid-body');
			this.freeze_body.bind('scroll', this.coscroll.bind(this));
		}
		if (this.normal_fields.length > 0) {
			this.normal_part = new VBox({ 
				width: this.normal_width + 'px',
				height:'100%',
				csses:"hscroll"
			});
			this.normal_part.set_css('datagrid-right');
			this.normal_header = new HBox({ height: this.row_height + 'px', width: this.normal_width + 'px'});
			// this.normal_header.set_css('datagrid-row');
			this.normal_body = new VScrollPanel({ 
				height:"100%",
				width: this.normal_width + 'px' 
			});
			this.normal_body.set_css('datagrid-body')
		}
		this.create_header();
		if (this.freeze_fields.length > 0) {
			this.freeze_part.add_widget(this.freeze_header);
			this.freeze_part.add_widget(this.freeze_body);
			hbox.add_widget(this.freeze_part);
		}
		if (this.normal_fields.length > 0) {
			this.normal_part.add_widget(this.normal_header);
			this.normal_part.add_widget(this.normal_body);
			this.normal_body.bind('scroll', this.coscroll.bind(this));
			this.normal_body.bind('min_threshold', this.load_previous_data.bind(this));
			this.normal_body.bind('max_threshold', this.load_next_data.bind(this));
			hbox.add_widget(this.normal_part);
		}
	}
	load_previous_data() {
		console.log('event min_threshold fired ........');
		this.loader.previousPage();
	}
	load_next_data() {
		console.log('event max_threshold fired ........');
		this.loader.nextPage();
	}
	coscroll(event) {
		var w = event.target.bricks_widget;
		if (w == this.freeze_body) {
			this.normal_body.dom_element.scrollTop = w.dom_element.scrollTop;
		} else if (w == this.normal_body && this.freeze_body) {
			this.freeze_body.dom_element.scrollTop = w.dom_element.scrollTop;
		}
	}

	create_header() {
		for (var i = 0; i < this.freeze_fields.length; i++) {
			var f = this.freeze_fields[i];
			var t = new Text({
				otext: f.label || f.name,
				i18n: true,
			});
			if (f.width) {
				t.set_style('flex','0 0 ' + convert2int(f.width) + 'px');
			} else {
				t.set_style('flex','0 0 100px');
			}
			this.freeze_header.add_widget(t);
			t.dom_element.column_no = 'f' + i;
		}
		for (var i = 0; i < this.normal_fields.length; i++) {
			var f = this.normal_fields[i];
			var t = new Text({
				otext: f.label || f.name,
				i18n: true,
			});
			if (f.width) {
				t.set_style('flex','0 0 ' + convert2int(f.width) + 'px');
			} else {
				t.set_style('flex','0 0 100px');
			}
			this.normal_header.add_widget(t);
			t.dom_element.column_no = 'n' + i;
		}
	}
	click_handler(row, event) {
		if (this.selected_row) {
			this.selected_row.unselected();
		}
		this.selected_row = row;
		this.selected_row.selected();
		this.dispatch('row_click', row);
		console.log('DataGrid():click_handler, row=', row, 'event=', event);
	}
}

Factory.register('DataGrid', DataGrid);
class MiniForm extends HBox {
	/*
	{
		defaultname:
		label_width:
		input_width:
		params:
		"fields":[
			{
				name:
				label:
				icon:
				uitype:
				uiparams:
			}
			...
		]
	}
	*/
	constructor(opts){
		opts.width = 'auto';
		opts.height = 'auto';
		super(opts);
		this.build();
	}
	build(){
		var name = this.opts.defaultname;
		if (!name){
			name = this.opts.fields[0].name;
		}
		this.build_options();
		this.build_widgets(name);
	}
	build_widgets(name){
		if (this.input){
			this.input.unbind('input', this.input_handle.bind(this));
		}
		this.clear_widgets();
		this.add_widget(this.choose);
		var f = this.opts.fields.find( i => i.name==name);
		var desc = f.copy();
		desc.width = 'auto';
		var i = Input.factory(desc);
		i.bind('input', this.input_handle.bind(this));
		this.add_widget(i);
		this.input = i;
	}
	build_options(){
		var desc = {
			width:"90px",
			name:"name",
			uitype:"code",
			valueField:'name',
			textField:'label',
			data:this.opts.fields
		};
		var w = Input.factory(desc);
		w.bind('changed', this.change_input.bind(this));
		this.choose = w;
		this.add_widget(w);
	}
	show_options(e){
		console.log('show_options() called ...');
		this.choose.show();
	}
	change_input(e){
		var name = this.choose.value;
		this.build_widgets(name);
	}
	input_handle(e){
		var d = this.getValue();
		console.log('input_handle() ..', d);
		this.dispatch('input', d);
	}
	getValue(){
		var d = this.opts.params || {};
		var v = this.input.getValue();
		d.update(v);
		return d;
	}
}

Factory.register('MiniForm', MiniForm);

/*
need xterm.js
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm@4.19.0/css/xterm.css" />
<script src="https://cdn.jsdelivr.net/npm/xterm@4.19.0/lib/xterm.js"></script>
*/
class XTerminal extends JsWidget {
	/*
	{
		ws_url:
		host:
		ssh_port:
		user:
	}
	*/
	constructor(opts){
		super(opts);
		schedule_once(this.open.bind(this), 0.1);
	}
	async open(){
		try {
			this.term = new Terminal({
				cursorBlink: "block"
			});
		}
		catch(e){
			console.log(e);
			return;
		}
		
		this.ws = new WebSocket(this.opts.ws_url, "echo-protocol");
		var curr_line = "";
		var entries = [];
		this.term.open(this.dom_element);
		this.term.write("web shell $ ");

		this.term.prompt = () => {
			if (curr_line) {
				let data = { method: "command", command: curr_line };
				this.ws.send(JSON.stringify(data));
			}
		};
		this.term.prompt();

		// Receive data from socket
		this.ws.onmessage = msg => {
		this.term.write("\r\n" + JSON.parse(msg.data).data);
		curr_line = "";
		};

		this.term.on("key", function(key, ev) {
		//Enter
		if (ev.keyCode === 13) {
		  if (curr_line) {
			entries.push(curr_line);
			this.term.write("\r\n");
			this.term.prompt();
		  }
		} else if (ev.keyCode === 8) {
		  // Backspace
		  if (curr_line) {
			curr_line = curr_line.slice(0, curr_line.length - 1);
			this.term.write("\b \b");
		  }
		} else {
		  curr_line += key;
		  this.term.write(key);
		}
		});

		// paste value
		this.term.on("paste", function(data) {
		curr_line += data;
		this.term.write(data);
		});
	}
}

Factory.register('XTerminal', XTerminal);

