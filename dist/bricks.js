var bricks = window.bricks || {};
bricks.PageDataLoader = class {
	/*
	options:
	{
		"url":
		"cache_pages":
		"pagerows":
		"method":
		"params":
	}
	usage:
	var p = new PageDataLoader({...});
	p.loadData(); // return page(1) data
	p.nextPage()
	p.previousPage() 

	*/
	constructor(options){
		this.data_url = options.url;
		this.base_params = options.params || {};
		this.rows = options.pagerows || 80;
		this.cache_pages = options.cache_pages || 5;
		this.method = options.method || 'GET';
		this.pages = [];
	}
	async loadData(params){
		params = params || {};
		this.pages = [];
		var _params = bricks.extend({}, this.base_params);
		this.params = bricks.extend(_params, params);
		return await this.loadPage(1);
	}
	is_max_page(p){
		return p == Math.max(...this.pages);
	}
	async loadNextPage(){
		var page = Math.max(...this.pages) + 1;
		if (page <= this.lastPage){
			var d = await this.loadPage(page);
			var p = this.pages.length - 1;
			d.pos_rate = p / this.pages.length;
			return d;
		}
	}
	async loadPreviousPage(){
		var page = Math.min(...this.pages) - 1;
		if (page > 0){
			var d = await this.loadPage(page);
			d.pos_rate = 1 / this.pages.length;
			return d;
		}
	}
	async loadPage(page) {
		if (this.pages.indexOf(page) == -1) {
			var jc = new bricks.HttpJson();
			var params = bricks.extend({}, this.params);
			params = bricks.extend(params,{
				page:page, 
				pagerows:this.rows,
				rows:this.rows
			});
			var d = await jc.httpcall(this.data_url,{method:this.method, params:params});
			if (!d){
				bricks.debug(this.data_url,{params:params}, 'error');
				this.loading = false;
				return;
			}
			this.lastPage = Math.ceil(d.total / this.rows);
			d.last_page = this.lastPage;
			this.pages.push(page);
			d.add_page = page;
			// 检查缓存是否已满
			if (this.pages.length > this.cache_pages) {
				// 删除当前页最远的一页
				var max, min;
				max = Math.max(...this.pages);
				min = Math.min(...this.pages);
				const farthestPage = page == max? min : max;
				var idx = this.pages.indexOf(farthestPage);
				this.pages.splice(idx, 1);
				d.delete_page = farthestPage;
			}
			return d;
		} else {
			bricks.debug(page, 'already n buffer, do not thing');
		}
		return;
	}
}
var bricks = window.bricks || {};
class Factory_ {
	constructor(){
		this.widgets_kv = new Object();
		this.widgets_kv['_t_'] = 1;
	}
	register(name, widget){
		this.widgets_kv[name] = widget;
	}
	isWidgetType(w, typename){
		var typ = this.get(typename);
		if (! typ) return false;
		if (w instanceof typ) return true;
		return false;
	}
	get(name){
		if (this.widgets_kv.hasOwnProperty(name)){
			return this.widgets_kv[name];
		}
		return null;
	}
}
bricks.Factory = new Factory_();

var bricks = window.bricks || {};
bricks.UiTypesDef = class {
	constructor(opts){
		this.opts = opts;
		this.uitypes = {
		}
	}
	set(uitype, viewBuilder, inputBuilder){
		if (! this.uitypes[uitype]){
			this.uitypes[uitype] = {};
		}
		this.uitypes[uitype].viewBuilder = viewBuilder;
		this.uitypes[uitype].inputBuilder = inputBuilder;
	}
	get(uitype){
		if (! this.uitypes[uitype]){
			return (null, null);
		}
		return [this.uitypes[uitype].viewBuilder, 
					this.uitypes[uitype].inputBuilder];
	}
	getInputBuilder(uitype){
		if (! this.uitypes[uitype]){
			return Null;
		}
		return this.uitypes[uitype].inputBuilder;
	}
	getViewBuilder(uitype){
		return this.uitypes[uitype].viewBuilder;
	}
	setViewBuilder(uitype, Builder){
		if (! this.uitypes[uitype]){
			this.uitypes[uitype] = {};
		}
		this.uitypes[uitype].viewBuilder = Builder;
	}
	setInputBuilder(uitype, Builder){
		if (! this.uitypes[uitype]){
			this.uitypes[uitype] = {};
		}
		this.uitypes[uitype].inputBuilder = Builder;
	}
}

bricks.uitypesdef = new bricks.UiTypesDef();

bricks.viewFactory = function(desc, rec){
	var uitype = desc.uitype;
	var builder = bricks.uitypesdef.getViewBuilder(uitype) || 
					bricks.uitypesdef.getViewBuilder('str');
	if (! builder) return Null;
	var w = builder(desc, rec);
	return w;
}

bricks.inputFactory = function(desc, rec){
	var uitype = desc.uitype;
	var builder = bricks.uitypesdef.getInputBuilder(uitype) || 
				bricks.uitypesdef.getInputBuilder('str');
	if (! builder) return Null;
	return builder(desc, rec);
}

var buildText = function(text, halign){
	if (['left', 'right'].indexOf(halign)< 0){
		halign = 'left';
	}
	var w = new Text({
					text:text || '', 
					overflow:'hidden',
					wrap:true, 
					halign:'left'
				});
	return w;
}
var strViewBuilder = function(desc, rec){
	var v = rec[desc.name];
	return buildText(v, 'left');
}
bricks.uitypesdef.setViewBuilder('str', strViewBuilder);

var strInputBuilder = function(desc, rec) {
	var v = rec[desc.name];
	desc[value] = v;
	return new UiStr(desc);
}
bricks.uitypesdef.setInputBuilder('str', strInputBuilder);

var passwordViewBuilder = function(desc, rec){
	return new buildText('******');
}
bricks.uitypesdef.setViewBuilder('password', passwordViewBuilder);

var intViewBuilder = function(desc, rec){
	var v = rec[desc.name] + '';
	return buildText(v, 'right');
}
bricks.uitypesdef.setViewBuilder('int', intViewBuilder);

var floatViewBuilder = function(desc, rec){
	var v = rec[desc.name];
	v = v.toFixed(desc.dec_len||2)
	v = v + '';
	return buildText(v, 'right');
}
bricks.uitypesdef.setViewBuilder('float', floatViewBuilder);

var codeViewBuilder = function(desc, rec){
	var opts = objcopy(desc)
	if (opts.uiparams) bricks.extend(opts, opts.uiparams);
	var name = desc.textFeild || 'text';
	var v = rec[name];
	if (! v) {
		name = desc.valueField || 'value';
		v = rec[name];
	}
	return buildText(v, 'left')
}
bricks.uitypesdef.setViewBuilder('code', codeViewBuilder);

var passwordInputBuilder = function(desc, rec){
	return new UiPassword(desc);
}
bricks.uitypesdef.setInputBuilder('password', passwordInputBuilder);
var bricks = window.bricks || {};
bricks.bug = false;
bricks.sleep = function(seconds){
	var ms = seconds * 1000;
	return new Promise(resolve => setTimeout(resolve, ms));
}

bricks.timeDiff = function(startTime) {
  const now = Date.now();
  const diff = now - (startTime instanceof Date ? startTime.getTime() : startTime); // 毫秒差值

  const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0");
  const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0");
  const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, "0");
  const milliseconds = String(diff % 1000).padStart(3, "0");

  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

bricks.escapeSpecialChars = function(s){
  return s
    .replace(/\\/g, '\\\\')  // escape backslashes
    .replace(/"/g, '\\"')   // escape double quotes
    // .replace(/'/g, '\\\'')   // escape single quotes
    .replace(/\n/g, '\\n')   // escape newlines
    .replace(/\r/g, '\\r')   // escape carriage returns
    .replace(/\t/g, '\\t')   // escape tabs
    .replace(/\f/g, '\\f')   // escape form feeds
    .replace(/\v/g, '\\v')   // escape vertical tabs
    .replace(/\0/g, '\\0');  // escape null bytes
}

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

/* MutationObserver for add to DOM or remove from DOM
event: 
	domon: add to dom
	domoff: remove from dom
*/
bricks.dom_on_off_observer=new MutationObserver((mutations)=>{
	function handleRemoved(node) {
		if (node.nodeType !== 1) return; // 只处理元素节点
		if (node.bricks_widget) {
			// console.log('**** widget removed', node.bricks_widget);
			node.bricks_widget.dispatch('domoff');
		}
		// 遍历后代
		for (let child of node.querySelectorAll('*')) {
			if (child.bricks_widget) {
				// console.log('**** widget removed (descendant)', child.bricks_widget);
				child.bricks_widget.dispatch('domoff');
			}
		}
	}
	for (let m of mutations) {
		for (let n of m.removedNodes) {
			handleRemoved(n);
		}
		for (let n of m.addedNodes) {
		  	if (n.bricks_widget){
				var w = n.bricks_widget;
				w.dispatch('domon');
			}
		}
	}
});
bricks.dom_on_off_observer.observe(document.body, 
								{ childList: true, subtree: true });
function addParamsToUrl(url, params, widget) {
  const urlObj = new URL(url, window.baseURI); // 处理相对和绝对路径
  Object.keys(params).forEach(key => {
    urlObj.searchParams.set(key, params[key]);
  });
  return urlObj.toString();
}
function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

function parseRGB(colorStr) {
  const match = colorStr.match(/^rgb\s*\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/);
  if (!match) return null;
  const [, r, g, b] = match.map(Number);
  return { r, g, b };
}

function parseRGBA(colorStr) {
  const match = colorStr.match(/^rgba?\s*\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\s*\)$/);
  if (!match) return null;
  const [, r, g, b, a] = match;
  return { r: +r, g: +g, b: +b, a: a !== undefined ? +a : 1 };
}

async function streamResponseJson(response, onJson) {
	const reader = response.body.getReader();
	const decoder = new TextDecoder("utf-8");
	let buffer = "";
	while (true) {
		const { value, done } = await reader.read();
		if (done) break;
		buffer += decoder.decode(value, { stream: true });
		// 按换行切分 NDJSON
		let lines = buffer.split("\n");
		buffer = lines.pop(); // 可能是不完整的一行，留到下一轮
		for (const line of lines) {
			if (line.trim()) {
				try {
					const json = JSON.parse(line);
					onJson(json); // 👈 回调处理每个 JSON 对象
				} catch (err) {
					console.warn("Failed to parse JSON line:", line);
				}
			}
		}
	}
	// 处理最后残留的一行
	if (buffer.trim()) {
		try {
			const json = JSON.parse(buffer);
			onJson(json);
		} catch (err) {
			console.warn("Failed to parse trailing JSON line:", buffer);
		}
	}
}

function base64_to_url(base64, mimeType = "audio/wav") {
	const binary = atob(base64); // 解码 Base64 成 binary 字符串
	const len = binary.length;
	const bytes = new Uint8Array(len);

	for (let i = 0; i < len; i++) {
		bytes[i] = binary.charCodeAt(i);
	}

	const blob = new Blob([bytes], { type: mimeType });
	const url = URL.createObjectURL(blob);
	return url;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result); // This will be a base64 string prefixed with "data:*/*;base64,"
    };

    reader.onerror = reject;

    reader.readAsDataURL(blob);
  });
}

bricks.formdata_copy = function(fd){
	var cfd = new FormData();

	// 遍历 originalFormData 中的所有条目并添加到 clonedFormData 中
	for (var pair of fd.entries()) {
		cfd.append(pair[0], pair[1]);
	}
	return cfd;
}

bricks.map = function(data_source, mapping, need_others){
	ret = {};
	Object.entries(data_source).forEach(([key, value]) => {
		if (mapping.hasOwnProperty(key)){
			ret[mapping[key]] = data_source[key];
		} else if (need_others){
			ret[key] = data_source[key];
		}
	});
	return ret;
}

bricks.relocate_by_eventpos = function(event, widget){
	var ex,ey;
	var x,y;
	var xsize = bricks.Body.dom_element.clientWidth;
	var ysize = bricks.Body.dom_element.clientHeight;
	ex = event.clientX;
	ey = event.clientY;
	var mxs = widget.dom_element.offsetWidth;
	var mys = widget.dom_element.offsetHeight;
	if (ex < (xsize / 2)) {
		x = ex + bricks.app.charsize;
	} else {
		x = ex - mxs - bricks.app.charsize;
	}
	if (ey < (ysize / 2)) {
		y = ey + bricks.app.charsize;
	} else {
		y = ey - mys - bricks.app.charsize;
	}
	widget.set_style('left', x + 'px');
	widget.set_style('top', y + 'px');
}

var formdata2object = function(formdata){
	let result = {};
    formdata.forEach((value, key) => {
        result[key] = value;
    });
    return result;
}

var inputdata2dic = function(data){
	try {
		var d = {}
		for (let k of data.keys()){
			var x = data.get(k);
			if (k == 'prompt'){
				x = bricks.escapeSpecialChars(x);
			}	
			d[k] = x;
		}
		return d;
	} catch (e){
		return data;
	}
}
bricks.delete_null_values = function(obj) {
	for (let key in obj) {
		if (obj[key] === null) {
			delete obj[key];
		}
	}
	return obj;
}

bricks.is_empty = function(obj){
	if (obj === null) return true;
	return JSON.stringify(obj) === '{}';
}
bricks.serverdebug = async function(message){
	var jc = new bricks.HttpJson();
	await jc.post(url='/debug', {params:{
		message:message
	}});
	return;
}
bricks.debug = function(...args){
	if (! bricks.bug){
		return;
	}
	if (bricks.bug == 'server'){
		var message = args.join(" ");
		f = bricks.serverdebug.bind(null, message);
		schedule_once(f, 0.1);
		return;
	}
	var callInfo;
	try {
		throw new Error();
	} catch (e) {
		try {
			callInfo = e.stack.split('\n')[2].trim();
		} catch (e1) {
			callInfo = e.toString();
		}
	}
	console.log(callInfo, ...args);
}

bricks.is_mobile = function(){
		var userAgent = navigator.userAgent;
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
		return true;
	}
	if (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) {
		return true;
	}
	if (window.innerWidth <= 768 && window.innerHeight <= 1024) {
		return true;
	}
	return false;
}

class _TypeIcons {
	constructor(){
		this.kv = {}
	}
	get(n, defaultvalue){
		return objget(this.kv, n, defaultvalue);
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
		bricks.debug('has not currentScriot');
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

bricks.path = currentScriptPath();

var bricks_resource = function(name){
	return bricks.path + name;
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

	bricks.debug('[querySelectorAllShadows]', selector, el, `(${childShadows.length} shadowRoots)`);

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
	return window.setTimeout(f, t);
}

var schedule_interval = function(f, t){
	t = t * 1000
	return window.setInterval(f, t);
}

var debug = function(){
	bricks.debug(...arguments);
}

var import_cache = new Map()

var import_css = async function(url){
	if (objget(import_cache, url)===1) return;
	var result = await (bricks.tget(url));
	debug('import_css():tget() return', result); 
	var s = document.createElement('style');
	s.setAttribute('type', 'text/javascript');
	s.innerHTML = result;
	document.getElementsByTagName("head")[0].appendChild(s);
	import_cache.set(url, 1);
}

var import_js = async function(url){
	if (objget(import_cache, url)===1) return;
	// var result = await (bricks.tget(url));
	// debug('import_js():tget() return', url, result); 
	var s = document.createElement('script');
	s.setAttribute('type', 'text/javascript');
	s.src=url;
	// s.innerHTML = result;
	document.body.appendChild(s);
	import_cache.set(url, 1);

}

bricks.extend = function(d, s){
	for (var p in s){
		if (! s.hasOwnProperty(p)){
			continue;
		}
		if (d[p] && (typeof(d[p]) == 'object') 
				&& (d[p].toString() == '[object Object]') && s[p]){
			bricks.extend(d[p], s[p]);
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

bricks.obj_fmtstr = function(obj, fmt){
	/* fmt like 
		'my name is ${name}, ${age=}'
		'${name:}, ${age=}'
	*/
	var s = fmt;
	s =	s.replace(/\${(\w+)([:=]*)}/g, (k, key, op) => {
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

var archor_at = function(archor){
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
	return {
		x:x,
		y:y,
		top:y,
		left:x
	}
}

var archorize = function(ele,archor){
	var lt = archor_at(archor);
	ele.style.top = lt.top;
	ele.style.left = lt.left;
	var o = {
		'x':lt.x,
		'y':lt.y
	}
	var tsf = bricks.obj_fmtstr(o, 'translateY(-${y}) translateX(-${x})');
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

function removeArrayItems(array, itemsToRemove) {
  return array.filter(item => !itemsToRemove.includes(item));
}

bricks.absurl = function(url, widget){
	if (url.startsWith('http://') || url.startsWith('https://')){
		return url;
	}
	var base_uri = widget.baseURI;
	if (!base_uri){
		base_uri = bricks.Body.baseURI;
	}
	if (url.startsWith('/')){
		base_uri = bricks.Body.baseURI;
		url = url.substring(1);
	}
	paths = base_uri.split('/');
	delete paths[paths.length - 1];
	var ret_url = paths.join('/') + url;
	return ret_url;
}

var debug = function(...args){
	bricks.debug(...args);
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
		document.cookie = name + "=" + (value || "")	+ expires + "; path=/";
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
var objcopy = function(obj){
	var s = JSON.stringify(obj);
	return JSON.parse(s);
}

bricks.set_stream_source = async function(target, url, params){
	var widget;
	if (typeof target == typeof ''){
		widget = bricks.getWidgetById(target);
	} else if (target instanceof bricks.JsWidget){
		widget = target;
	} else {
		widget = await bricks.widgetBuild(target);
	}
	if (! widget){
		bricks.debug('playResponseAudio():', target, 'can not found or build a widget');
		return;
	}
	const mediaSource = new MediaSource();
	mediaSource.addEventListener('sourceopen', handleSourceOpen);
	widget.set_url(URL.createObjectURL(mediaSource));
	function handleSourceOpen(){
		const sourceBuffer = mediaSource.addSourceBuffer('audio/wav; codecs=1');
		var ht = new bricks.HttpText();
		ht.bricks_fetch(url, {params:params})
			.then(response => response.body)
			.then(body => {
				const reader = body.getReader();
				const read = () => {
					reader.read().then(({ done, value }) => {
						if (done) {
							mediaSource.endOfStream();
							return;
						}
						sourceBuffer.appendBuffer(value);
						read();
					}).catch(error => {
						console.error('Error reading audio stream:', error);
					});
				};
				read();
			});
	}
}

bricks.playResponseAudio = async function(response, target){
	var widget = null;
	if (response.status != 200){
		bricks.debug('playResponseAudio(): response.status != 200', response.status); 
		return;
	}
	if (typeof target == typeof ''){
		widget = bricks.getWidgetById(target);
	} else {
		widget = bricks.widgetBuild(target);
	}
	if (! widget){
		bricks.debug('playResponseAudio():', target, 'can not found or build a widget');
		return;
	}
		const blob = await response.blob();
		const url = URL.createObjectURL(blob);
	widget.set_url(url);
	widget.play();
}

bricks.widgetBuildWithData = async function(desc_tmpl, from_widget, data){
	if (!desc_tmpl){
		bricks.debug('bricks.widgetBuildWithData():data=', data, 'desc_tmpl=', desc_tmpl);
	}
	var s = bricks.obj_fmtstr(data, desc_tmpl);
	var desc = JSON.parse(s);
	var w = await bricks.widgetBuild(desc, from_widget);
	if (! w){
		bricks.debug(desc, 'widgetBuild() failed...........');
		return;
	}
	w.row_data = data;
	return w;
}

bricks.Observable = class {
	constructor(owner, name, v){
		this.owner = owner;
		this.name = name;
		this.value = v;
	}
	set(v){
		var ov = this.value;
		this.value = v;
		if (this.value != ov){
			this.owner.dispatch(this.name, v);
		}
	}
	get(){
		return this.v;
	}
}

bricks.Queue = class {
	constructor() {
		this.items = [];
		this._done = false;
	}

	// 添加元素到队列尾部
	enqueue(element) {
		this.items.push(element);
	}
	done(){
		this._done = true;
	}
	is_done(){
		return this._done;
	}

	// 移除队列的第一个元素并返回
	dequeue() {
		if (this.isEmpty()) {
			return null;
		}
		return this.items.shift();
	}

	// 查看队列的第一个元素
	peek() {
		if (this.isEmpty()) {
			return null;
		}
		return this.items[0];
	}

	// 检查队列是否为空
	isEmpty() {
		return this.items.length === 0;
	}

	// 获取队列的大小
	size() {
		return this.items.length;
	}

	// 清空队列
	clear() {
		this.items = [];
	}

	// 打印队列元素
	print() {
		console.log(this.items.toString());
	}
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = function() {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
/* 
opts = {
	css:
	id
}
*/
bricks.dom_create = function(tag, opts){
	var e = document.createElement(tag);
	if (opts.css){
		var arr = css.split(' ');
		arr.forEach(c =>{
			e.classList.add(c);
		});
	}
	if (opts.id){
		e.id = opts.id;
	}
	return e;
}
bricks.element_from_html = function(html){
	var e = document.createElement('div');
	e.outerHTML = html;
	return e;
}
/*
// 使用队列
const queue = new Queue();
queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);
queue.print(); // 输出: 1,2,3
console.log(queue.dequeue()); // 输出: 1
queue.print(); // 输出: 2,3
*/
var bricks = window.bricks || {};
bricks.uiViewers = {};
bricks.add_ViewBuilder = function(uitype, handler){
	bricks.uiViewers[uitype] = handler;
}
bricks.get_ViewBuilder = function(uitype){
	return bricks.uiViewers[uitype];
}
bricks.add_ViewBuilder('str', function(opts){
	var options = bricks.extend({}, opts);
	options.otext = opts.value;
	options.i18n = true;
	return new bricks.Text(options);
});

bricks.add_ViewBuilder('icon', function(opts){
	var options = bricks.extend({}, opts);
	options.url = opts.value;
	return new bricks.Icon(options);
});
bricks.add_ViewBuilder('code', function(opts){
	var textField = opts.textField || 'text';
	var valueField = opts.name;
	var txt;
	if (opts.user_data) {
		txt = opts.user_data[textField] || opts.user_data[valueField]||'';
	} else {
		txt = opts.value || '';
	}
	var options = bricks.extend({}, opts);
	options.otext = txt;
	options.i18n = true;
	return new bricks.Text(options);
});
bricks.add_ViewBuilder('password', function(opts){
	var options = bricks.extend({}, opts);
	options.otext = '******';
	options.i18n = true;
	return new bricks.Text(options);
});
bricks.add_ViewBuilder('hide', function(opts){
	return new bricks.JsWidget({});
});
bricks.add_ViewBuilder('audio', function(opts){
	var options = bricks.extend({}, opts);
	var url = options.value;
	return new bricks.AudioPlayer({url:url,autoplay:false});
});
var bricks = window.bricks || {};

bricks.I18n = class {
	/*
	opts={
		i18n
		lang
	}
	*/
	constructor(opts){
		/*
		{
		 	url:
			method:
			lang:
			i18n_path:
		}
		*/
		this.url = opts.url || '/i18n_getmsgs'
		this.i18n_path = opts.i18n_path;
		this.lang = opts.lang;
		this.method = opts.method || 'GET';
		this.lang_msgs = {};
		this.msgs = {};
		this.uni18n = {};
	}

	_(txt, obj){
		var outt, mt;
		this.change_lang(this.lang);
		var msgs = this.lang_msgs[this.lang].msgs || {};
		mt = msgs[txt] || txt;
		if (obj instanceof Object){
			outt = obj_fmtstr(obj, mt);
		} else {
			outt = mt;
		}
		if (mt == txt) {
			this.set_uni18n(txt);
		}
		return outt;
	}
	set_uni18n(txt){
		var d = this.lang_msgs[this.lang].unmsgs;
		if (! d[txt]){
			d[txt] = 1;
		}
	}
	is_loaded(lang){
		if (objget(this.lang_msgs, lang)) return true;
		return false;
	}
	get_uni18n(){
		return this.lang_msgs[this.lang].unmsgs;
	}
	setup_dict(dic, lang){
		this.lang = lang;
		this.lang_msgs[lang] = {
			msgs:dic,
			unmsgs:{}
		}
	}
	async get_lang_dic(lang){
		let params = {
			lang:lang,
			i18n: this.i18n_path
		};
		try {
			var jc = new bricks.HttpJson();
			var d = await jc.httpcall(this.url, {
						"method":this.method || 'GET',
						params:params
			});
			this.setup_dict(d, lang);
		} catch(e) {
			console.log('get_lang_dic() error', lang, e);
			this.lang_msgs[lang] = {
				msgs:{},
				unmsgs:{}
			}
		}
	
	}
	async change_lang(lang){
		this.lang = lang;
		if (this.lang_msgs[lang]){
			return;
		}
		await this.get_lang_dic(lang);
	}
}

var bricks = window.bricks || {};

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
	is_disabled(){
		return this.dom_element.disabled == true;
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
			"paddingLeft",
			"paddingRight",
			"paddingTop",
			"paddingBottom",
			"align",
			"textAlign",
			"overflowY",
			"overflowX",
			"overflow",
			"flexShrink",
			"flexGrow",
			"flex",
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
			"color",
			"borderRadius",
			"borderTopLeftRadius",
			"borderTopRightRadius",
			"borderBottomLeftRadius",
			"borderBottomRightRadius",
			"border",
			"borderTop",
			"borderBottom",
			"borderLeft",
			"borderRight",
			"borderColor",
			"borderWidth",
			"borderStyle",
			"opacity",
			"boxShadow",
			"textShadow",
			"textDecoration",
			"textTransform",
			"whiteSpace",
			"wordBreak",
			"wordWrap",
			"overflowWrap",
			"gap",
			"alignItems",
			"alignSelf",
			"justifyContent",
			"flexDirection",
			"flexWrap",
			"flexBasis",
			"order",
			"transition",
			"transform",
			"pointerEvents",
			"userSelect",
			"listStyle",
			"objectFit",
			"objectPosition",
			"outline",
			"boxSizing"
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
		this.set_css(csses, remove_flg);
	}
	unset_css(css){
		this.dom_element.classList.remove(css);
	}
	set_css(css, remove_flg){
		var arr = css.split(' ');
		arr.forEach(c => {
			if (!remove_flg){
				this.dom_element.classList.add(c);
			} else {
				this.dom_element.classList.remove(c);
			}
		});
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
		if (typeof params === "string" || params instanceof String) {
			console.log('event name=', eventname, 'params is string =', params, this);
		}
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
		css
	}
	*/
	constructor(options){
		options.halign = options.halign || 'center';
		options.valign = options.valign || 'center';
		super(options);
		this.opts = options;
		this.rate = this.opts.rate || 1;
		this.specified_fontsize = false;
		this.set_attrs();
		this.dom_element.style.fontWeight = 'normal';
		this.set_style('display', 'flex');
		switch (options.halign) {
			case 'left':
				this.set_style('justifyContent', 'flex-start');
				break;
			case 'right':
				this.set_style('justifyContent', 'flex-end');
				break;
			default:
				this.set_style('justifyContent', 'center');
				break;
				
		}
		switch (options.valign){
			case 'top':
				this.set_style('alignItems', 'flex-start');
				break;
			case 'bottom':
				this.set_style('alignItems', 'flex-end');
				break;
			default:
				this.set_style('alignItems', 'center');
				break;
		}
		if (options.wrap){
			this.set_style('flexWrap', 'wrap');
		}
		if (this.i18n){
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
		this.set_style('flexShrink', '0'); 
		if (this.i18n && this.otext) {
			this.text = bricks.app.i18n._(this.otext);
		}
		this.dom_element.innerHTML = this.text;
	}
	set_otext(otxt){
		var text;
		this.otext = otxt;
		if (this.i18n) {
			text = bricks.app.i18n._(this.otext);
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
		this.set_otext(this.otext);
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
			clearTimeout(this.auto_task);
			this.auto_task = null;
		}
		this.auto_task = schedule_once(this.hide.bind(this), 6);
	}
	hide(){
		try {
			if (this.auto_task){
				clearTimeout(this.auto_task);
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
		if (this.is_in_dom()){
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
var bricks = window.bricks || {};
bricks.get_current_language=function(){
	var lang = navigator.language.substring(0, 2);
	if (bricks.app){
		if (bricks.app.lang) return bricks.app.lang;
		bricks.app.lang = lang;
		return lang;
	}
	return;
}
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
	popts.origin_event = event;
	return new bricks.Popup(popts);
}
bricks.default_popupwindow = function(opts,event){
	var popts = bricks.get_popupwindow_default_options();
	bricks.extend(popts, opts);
	popts.origin_event = event;
	return new bricks.PopupWindow(popts);
}
bricks.buildEventHandler = async function(w, desc, event){
	var target;
	if (desc.target == 'Popup'){
		target = bricks.default_popup(desc.popup_options || {}, event);
	} else if (desc.target == 'PopupWindow') {
		target = bricks.default_popupwindow(desc.popup_options || {}, event);
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
		case 'urldata':
			return bricks.buildUrldataHandler(w, target, rtdata, desc);
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
		return;
	}
	if (w instanceof bricks.NewWindow) {
		return;
	}
	if (mode == 'replace'){
		target.clear_widgets();
		target.add_widget(w);
		// Router hook: track urlwidget navigations to registered targets
		if (bricks.Router && bricks.Router._enabled
			&& options && options.widgettype === 'urlwidget'
			&& options.options && options.options.url){
			bricks.Router._onReplace(target, options.options.url);
		}
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
var _add_event_data = function(params, event_data, rtdata, params_mapping){
	var p;
	if (event_data instanceof FormData){
		p = event_data;
		for ( const [key, value] of Object.entries(params||{})){
			p.append(key, value);
		}
		for ( const [key, value] of Object.entries(rtdata)){
			p.append(key, value);
		}
		return p;
	} else {
		p = bricks.extend(params, rtdata)
		p = bricks.extend(p, event_data);
		p = bricks.extend(p, rtdata);
	}
	if (params_mapping){
		p = bricks.map(p, params_mapping.mapping, params_mapping.need_others);
	}
	return p;
}

_buildDataHandler = async function(from_widget, target, options, desc){
	var jc = new bricks.HttpJson();
	var method = options.method || 'GET';
	if (options.params instanceof FormData) {
		method = 'POST';
	}
	var data = await jc.httpcall(options.url, { 
		method: method, 
		params: options.params
	});

	var newdesc = desc.status_of[data.status];
	var w = await bricks.widgetBuild(newdesc, from_widget, data.data)
	if (!w){
		console.log('build error,newdesc=', newdesc, 'data=', data.data);
		return;
	}
	if (w instanceof bricks.Popup) {
		return;
	}
	if (w instanceof bricks.NewWindow) {
		return;
	}
	if (desc.mode == 'replace'){
		target.clear_widgets();
		target.add_widget(w);
	} else if (desc.mode == 'insert'){
		target.add_widget(w, 0);
	} else {
		target.add_widget(w);
	}
	if (target instanceof bricks.Popup || target instanceof bricks.PopupWindow) {
		target.open();
	}
}

bricks.buildUrldataHandler = function(w, target, rtdata, desc){
	var options = objcopy(desc.options||{});
	var params = _add_event_data(options.params || {},
		desc.event_params,
		rtdata,desc.params_mapping);
	options.params = params;
	if (params instanceof FormData){
		options.method = 'POST'
	}
	var opts = {
		"widgettype":"urlwidget",
		"options":options
	}
	return _buildDataHandler.bind(null, w, target, options, desc);
}
bricks.buildUrlwidgetHandler = function(w, target, rtdata, desc){
	var options = objcopy(desc.options||{});
	var params = _add_event_data(options.params || {},
		desc.event_params,
		rtdata,desc.params_mapping);
	options.params = params;
	if (params instanceof FormData){
        options.method = 'POST'
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

bricks.getWidgetById = function(idset, from_widget){
	var get_by_id=function(id, fromw, downward){
		if (id == 'self'){
			return fromw;
		}
		if (id == 'root'){
			return bricks.app.root;
		}
		if (id == 'app' || id == 'body' || id == 'window'){
			return bricks.app;
		}
		var el = fromw.dom_element;
		var nel;
		if(downward ){
			nel = el.querySelector('#' + id);
		} else {
			nel = el.closest('#' + id);
		}
		if (!nel) {
			console.log('get_by_id() return null',id, fromw, downward);
			return null;
		}
		if (typeof(nel.bricks_widget) !== 'undefined'){
			return nel.bricks_widget;
		}
		console.log('get_by_id() found dom_ele, but not bricks widget, return null',id, fromw, downward);
		return null;
	};
	var get_by_typename=function(typename, fromw, downward){
		if (! fromw) {
			console.log('get_by_typename() return null,', typename, fromw, downward)
			return null;
		}
		if (downward) {
			fromw.children.forEach(c=>{
				if (bricks.Factory.isWidgetType(c, typename)) return c;
				var sc = get_by_typename(typename, c, downward);
				if (sc) return sc;
			});
			console.log('get_by_typename() return null,', typename, fromw, downward)
			return null;
		}
		var p = fromw.parent;
		if (! p) {
			console.log('get_by_typename() return null,', typename, fromw, downward)
			return null;
		}
		if (bricks.Factory.isWidgetType(p, typename)) return p;
		return get_by_typename(p, typename, downward);
	};
	if (!idset) {
		return from_widget;
	}
	const parts = idset.split('.', 2);
	var downward = true;
	var typename = '';
	var id = parts[0];
	var w;
	if (id.startsWith('-')){
			downward = false;
			id = id.substring(1);
	}
	if (id.startsWith('@')){
			typename = id.substring(1);
	}
	if (typename != ''){
			w = get_by_typename(typename, from_widget, downward);
	} else {
			w = get_by_id(id, from_widget, downward);
	}
	if (!w) return null;
	if (!parts[1]){
		console.log('idset=',idset, 'id=', id, w); 
	}
	return bricks.getWidgetById(parts[1], w);
}

bricks.getWidgetByIdOld = function(id, from_widget){
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
		this.login_url = opts.login_url || '/rbac/user/login.ui';
		this.charsize = this.opts.charsize || 20;
		this.keyevent_blocked = false;
		this.char_size = this.observable('charsize', this.charsize);
		if (this.opts.language){
			this.lang = this.opts.language;
		}
		else {
			this.lang = navigator.language.substring(0,2);
		}
		this.lang_x = this.observable('lang', this.lang);
		this.zindex = 10000;
		this.textList = [];
		var i18n_opts = opts.i18n || {
				url:'/i18n_getmsgs',
				i18n_path: 'i18n',
				lang:this.lang
		};
		this.i18n = new bricks.I18n(i18n_opts);
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
	async build(){
		await this.i18n.change_lang(this.lang)
		var opts = bricks.extend({}, this.opts.widget);
		var w = await bricks.widgetBuild(opts, bricks.Body);
		if (!w){
			bricks.debug('w=', w, 'Body=', bricks.Body, 'Factory=', bricks.Factory)
		}
		return w;
	}
	async run(){
		await (this.change_language(this.lang));
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
		this.dispatch('lang');
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
/**
 * bricks.Router — SPA routing for bricks single-page applications
 *
 * Provides URL state management so that:
 * - Browser refresh lands on the current page
 * - Direct URL access (deep linking) works
 * - Browser back/forward buttons navigate between pages
 *
 * Usage — call after bricks app is created:
 *
 *   bricks.Router.init({
 *     targets: [
 *       { id: 'main_content', param: 'page' },
 *       { id: 'sidebar',      param: 'side' }   // optional extra targets
 *     ]
 *   });
 *
 * URL format:  /?page=/module/index.ui
 * Multiple:    /?page=/module/index.ui&side=/module/sidebar.ui
 *
 * What IS tracked:
 *   - urlwidget loads with mode:'replace' into registered target IDs
 *
 * What is NOT tracked (by design):
 *   - Popup / PopupWindow / NewWindow (modal overlays, transient)
 *   - urlwidgets into non-registered targets (header, login state, etc.)
 *     These re-render on refresh via server-side session state.
 *   - insert/append mode urlwidgets
 */
bricks.Router = (function(){

	var _enabled = false;
	var _targets = {};        // { targetId: { param: string, current: string|null } }
	var _isPopState = false;  // suppress pushState during popstate restore
	var _restoring = false;   // suppress _onReplace during _loadInto

	// ── URL helpers ──

	function _getURLParam(key){
		return new URLSearchParams(window.location.search).get(key);
	}

	function _pushState(){
		var url = new URL(window.location);
		for (var id in _targets){
			var cfg = _targets[id];
			if (cfg.current){
				url.searchParams.set(cfg.param, cfg.current);
			} else {
				url.searchParams.delete(cfg.param);
			}
		}
		history.pushState(_getState(), '', url.toString());
	}

	function _replaceState(){
		var url = new URL(window.location);
		for (var id in _targets){
			var cfg = _targets[id];
			if (cfg.current){
				url.searchParams.set(cfg.param, cfg.current);
			} else {
				url.searchParams.delete(cfg.param);
			}
		}
		history.replaceState(_getState(), '', url.toString());
	}

	function _getState(){
		var s = {};
		for (var id in _targets){ s[id] = _targets[id].current; }
		return s;
	}

	// ── Load content into a target ──

	async function _loadInto(targetId, url){
		if (!bricks.app){ return; }
		var target = bricks.getWidgetById(targetId, bricks.app);
		if (!target){
			console.log('[Router] target not found:', targetId);
			return;
		}
		var desc = { widgettype: 'urlwidget', options: { url: url } };
		try {
			_restoring = true;
			var w = await bricks.widgetBuild(desc, bricks.app);
			if (w && !(w instanceof bricks.Popup) && !(w instanceof bricks.NewWindow)){
				target.clear_widgets();
				target.add_widget(w);
			}
		} catch(e){
			console.error('[Router] load failed:', url, e);
		} finally {
			_restoring = false;
		}
	}

	// ── popstate handler (back/forward) ──

	async function _onPopState(event){
		if (!event.state){ return; }
		_isPopState = true;
		for (var id in _targets){
			var url = event.state[id];
			if (url !== undefined && url !== _targets[id].current){
				_targets[id].current = url || null;
				if (url){
					await _loadInto(id, url);
				}
			}
		}
		_isPopState = false;
	}

	// ── Restore from URL on page load ──

	async function _restore(){
		var anyRoute = false;
		for (var id in _targets){
			var cfg = _targets[id];
			var url = _getURLParam(cfg.param);
			if (url){
				cfg.current = url;
				anyRoute = true;
			}
		}
		if (!anyRoute){
			// No route in URL — set initial state
			_replaceState();
			return;
		}
		// Wait for app to fully initialize
		var attempts = 0;
		while (!bricks.app && attempts < 50){
			await new Promise(function(r){ setTimeout(r, 100); });
			attempts++;
		}
		if (!bricks.app){
			console.error('[Router] bricks.app not ready');
			return;
		}
		// Extra delay for shell layout to finish
		await new Promise(function(r){ setTimeout(r, 300); });

		console.log('[Router] restoring routes:', _getState());
		for (var id in _targets){
			var cfg = _targets[id];
			if (cfg.current){
				await _loadInto(id, cfg.current);
			}
		}
		// Set initial history entry
		_replaceState();
	}

	// ── Public API ──

	return {
		_enabled: false,

		/**
		 * Called by _buildWidget after a urlwidget replaces content in a target.
		 * Internal — do not call directly.
		 */
		_onReplace: function(target, url){
			if (!_enabled || _restoring || _isPopState){ return; }
			var cfg = _targets[target.id];
			if (!cfg){ return; }
			if (cfg.current === url){ return; }
			cfg.current = url;
			_pushState();
		},

		/**
		 * Initialize the router.
		 * @param {Object} config
		 * @param {Array}  config.targets - [{id: 'widget_id', param: 'url_param_name'}]
		 */
		init: function(config){
			if (!config || !config.targets || !config.targets.length){
				console.error('[Router] init requires config.targets array');
				return;
			}
			config.targets.forEach(function(t){
				_targets[t.id] = {
					param: t.param || t.id,
					current: null
				};
			});
			_enabled = true;
			this._enabled = true;

			window.addEventListener('popstate', _onPopState);
			_restore();

			console.log('[Router] init OK, targets:', Object.keys(_targets));
		},

		/**
		 * Programmatically navigate a target to a URL.
		 * @param {string} targetId - registered target widget ID
		 * @param {string} url      - .ui URL to load
		 */
		navigate: function(targetId, url){
			var cfg = _targets[targetId];
			if (!cfg){
				console.error('[Router] unknown target:', targetId);
				return;
			}
			_loadInto(targetId, url).then(function(){
				cfg.current = url;
				_pushState();
			});
		},

		/** Get current route for a target */
		current: function(targetId){
			var cfg = _targets[targetId];
			return cfg ? cfg.current : null;
		},

		/** Get all current routes */
		state: function(){
			return _getState();
		}
	};

})();
var bricks = window.bricks || {};
bricks.Image = class extends bricks.JsWidget {
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
		if (this.opts.url){
			this.set_url(this.opts.url);
		}
		this.set_style('alignSelf', 'flex-start');
	}
	create(){
		this.dom_element = document.createElement('img');
	}
	removeBase64Header(base64String) {
		return base64String.replace(/^data:[^;]*;base64,/, '');
	}
	base64(){
		const image = this.dom_element;
		// 创建一个画布来绘制图像
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		// 设置画布大小与图像相同
		canvas.width = image.width;
		canvas.height = image.height;

		// 将图像绘制到画布上
		ctx.drawImage(image, 0, 0);

		// 获取画布数据并转换为 base64
		var dataURL = canvas.toDataURL('image/png'); // 可以根据需要修改图像格式
		// dataURL = this.removeBase64Header(dataURL);
		return dataURL;
	}
	set_url(url){
		this.url = url;
		if (this.opts.default_url) {
			this.dom_element.onerror = this.set_default_url.bind(this)
		}
		this.dom_element.src = url;
	}
	set_default_url(){
		console.log('default_url', this.opts.default_url);
		this.dom_element.onerror = null;
		this.dom_element.src = this.opts.default_url;
	}
}

bricks.Icon = class extends bricks.Image {
	constructor(opts){
		super(opts);
	}
	options_parse(){
		this.rate = this.rate || 1;
		var siz = bricks.app.charsize * this.rate + 'px';
		this.set_url(this.url)
		this.cwidth = this.opts.cwidth || 1;
		this.cheight = this.opts.cheight || 1;
		this.dynsize = this.opts.dynsize || true;
		this.charsize_sizing();
	}
}

bricks.StatedIcon = class extends bricks.Icon {
	/*
		states:[{state:aaa,url:} ,,]
		state:aaa,
	*/
	constructor(opts){
		super(opts);
	}
	options_parse(){
		if (! this.states){
			return;
		}
		if (! this.state){
			this.state = this.states[0].state;
		}
		this.set_state(this.state);
	}
	set_state(state){
		this.state = state;
		this.states.forEach(s => {
			if(s.state == this.state){
				this.url = s.url
				super.options_parse();
			}
		});
	}
}

bricks.BlankIcon = class extends bricks.JsWidget {
	constructor(opts){
		super(opts);
		this.rate = opts.rate || 1;
		this.cwidth = this.opts.cwidth || 1;
		this.cheight = this.opts.cheight || 1;
		this.dynsize = this.opts.dynsize || true;
		this.charsize_sizing();
	}
}

bricks.Factory.register('Image', bricks.Image);
bricks.Factory.register('StatedIcon', bricks.StatedIcon);
bricks.Factory.register('Icon', bricks.Icon);
bricks.Factory.register('BlankIcon', bricks.BlankIcon);
var bricks = window.bricks || {};

bricks.Html = class extends bricks.JsWidget {
	/*
	{
		html:
	} 
	*/
	constructor(opts){
		super(opts);
		this.dom_element.innerHTML = opts.html;
	}
}

bricks.Factory.register('Html', bricks.Html);

var bricks = window.bricks || {};
bricks.Splitter = class extends bricks.JsWidget {
	constructor(ops){
		super({});
	}
	create(){
		this.dom_element = this._create('hr')
	}
}
bricks.Factory.register('Splitter', bricks.Splitter);
var bricks = window.bricks || {};
function url_params(data) {
  return Object.keys(data).map(key => `${key}=${encodeURIComponent(data[key])}`).join('&');
}
/*
async function doit() {
	const response = await fetch("http://localhost:3000")
	const reader = response.body.getReader();
	const decoder = new TextDecoder('utf-8');
	let result = await reader.read();
	var buffer = '';
	while (!result.done) {
		const text = decoder.decode(result.value);
		buffer += text;
		const newline = /\r?\n/gm;
		var rez = newline.exec(buffer);
		while (rez){
			yield buffer.substring(0, rez.index);
			buffer = buffer.substring(newline.lastIndex);
			rez = newline.exec(buffer);
		}
		result = await reader.read()
	}
	if (buffer != ''){
		yield bufffer;
	}
}
// chunked response handle
*/
bricks.HttpText = class {
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
			"client_uuid": bricks.app.deviceid
		};
		bricks.extend(this.headers, headers);
		var width=0, height=0;
		var is_mobile = '0'
		if (bricks.is_mobile()){
			is_mobile = '1';
		}
		if (bricks.app) {
			width = bricks.app.screenWidth();
			height = bricks.app.screenHeight();
		}
		this.params = {
			"_webbricks_":1,
			"_width":width,
			"_height":height,
			"_is_mobile":is_mobile
		}
		if (bricks.app){
			this.params['_lang'] = bricks.app.lang;
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
		var session =  bricks.app.get_session();
		if (params instanceof FormData){
			for ( const [key, value] of Object.entries(this.params)){
				params.append(key, value);
			}
			if(session){
				params.append('session', session);
			}
			return params;
		}
		if (! params) 
			params = {};
		var p = bricks.extend({}, this.params);
		var lang = bricks.get_current_language()
		p = bricks.extend(p, params);
		if (session){
			bricks.extend(p,{session:session});
		}
		return p;
	}
	add_own_headers(headers){
		if (! headers){
			headers = {};
		}
		return Object.assign(this.headers, headers);
	}
	async bricks_fetch(url, {method='GET', headers=null, params=null}={}){
		url = this.url_parse(url);
		var data = this.add_own_params(params);
		var header = this.add_own_headers(headers);
		var _params = {
			method:method
		}
		if (data instanceof FormData){
			method = 'POST';
			_params.body = data;
		} else {
			if (method == 'GET' || method == 'HEAD') {
				let pstr = url_params(data);
				url = url + '?' + pstr;
			} else {
				_params.body = JSON.stringify(data);
			}
		}
		return await fetch(url, _params);
	}
	async httpcall(url, opts){
		const fetchResult = await this.bricks_fetch(url, {
				method: opts.method, 
				headers: opts.headers, 
				params: opts.params});
		if (fetchResult.status == 401 && bricks.app.login_url){
			console.log('401 unauthorized, opening login')
			return await this.withLoginInfo(url, opts);
		}
		if (fetchResult.status == 403){
			var w = new bricks.Error({
				"title":"access error",
				"auto_open":true,
				"message":"you are forbidden to access it",
				"archor":"cc",
				"cheight":10,
				"cwidth":16,
				"timeout":5
			});
			return null;
		}
		if (! fetchResult.ok){
			var w = new bricks.Error({
				"title":"access error",
				"auto_open":true,
				"message":"server return error with error code" + fetchResult.status,
				"archor":"cc",
				"cheight":10,
				"cwidth":16,
				"timeout":5
			});
			return null;
		}
		var result = await this.get_result_data(fetchResult);
		var ck =  objget(fetchResult.headers, 'Set-Cookie');
		if (ck){
			var session = ck.split(';')[0];
			bricks.app.save_session(session);
		}
		return result;
	}
	async withLoginInfo(url, opts){
		var login_window = await bricks.widgetBuild({
			"widgettype":"urlwidget",
			"options":{
				"url":bricks.app.login_url
			}
		});
		
		if (!login_window){
			console.log('withLoginInfo: failed to build login widget');
			return null;
		}
		
		// Wait for login window to be destroyed (successful login)
		await new Promise(resolve => {
			login_window.bind('destroy', resolve);
		});
		
		console.log('withLoginInfo: login window destroyed, retrying request');
		
		// Retry the original request
		const retryResult = await this.bricks_fetch(url, {
			method: opts.method,
			headers: opts.headers,
			params: opts.params
		});
		
		// If still 401, don't loop - user may have closed without logging in
		if (retryResult.status == 401){
			console.log('withLoginInfo: retry still 401, giving up');
			return null;
		}
		
		if (!retryResult.ok){
			console.log('withLoginInfo: retry failed with status', retryResult.status);
			return null;
		}
		
		console.log('withLoginInfo: retry successful');
		// Dispatch user_logined event so shell can reload menu
		if (bricks.app && bricks.app.dispatch) {
			bricks.app.dispatch('user_logined');
		}
		return await this.get_result_data(retryResult);
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

bricks.HttpArrayBuffer = class extends bricks.HttpText {
	async get_result_data(resp){
		return await resp.arrayBuffer();
	}
}

bricks.HttpBin = class extends bricks.HttpText {
	async get_result_data(resp){
		return await resp.blob();
	}
}

bricks.HttpResponse = class extends bricks.HttpText {
	async get_result_data(resp){
		return resp;
	}
}

bricks.HttpResponseStream = class extends bricks.HttpResponse {
	async handle_chunk(resp, handler){
		const reader = resp.body.getReader();
		const decoder = new TextDecoder('utf-8');
		let result = await reader.read();
		var buff_ = '';
		while (!result.done) {
			const text = decoder.decode(result.value);
			buff_ += text;
			const lines = buff_.split('\n');
			for (var i=0;i<lines.length - 1; i++){
				//  console.log('line=', lines[i]);
				handler(lines[i]);
			}
			buff_ = lines[lines.length - 1];
			result = await reader.read()
		}
		if (buff_ != ''){
			handler(buff_);
		}
	}
}

bricks.HttpRaw = class extends bricks.HttpText {
	async get_result_data(resp){
		return await resp.blob();
	}
}

bricks.HttpJson = class extends bricks.HttpText {
	constructor(headers){
		if (!headers)
			headers = {};
		super(headers);
		this.headers = {
			"Accept": "application/json",
		}
		bricks.extend(this.headers, headers);
	}
	async get_result_data(resp) {
		return await resp.json()
	}
}

bricks.hc = new bricks.HttpText();
bricks.tget = bricks.hc.get.bind(bricks.hc);
bricks.tpost = bricks.hc.post.bind(bricks.hc);
bricks.jc = new bricks.HttpJson();
bricks.jcall = bricks.jc.httpcall.bind(bricks.jc);
bricks.jget = bricks.jc.get.bind(bricks.jc);
bricks.jpost = bricks.jc.post.bind(bricks.jc);

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
var bricks = window.bricks || {};

var low_handle = function(widget, dim, last_pos, cur_pos, maxlen, winsize){
	var max_rate = cur_pos / (maxlen - winsize);
	if (Math.abs(cur_pos + winsize - maxlen) < 5){
		bricks.debug('fire max_threshold ......');
		widget.dispatch('max_threshold');
		return
	}
	if (cur_pos < 1) {
		bricks.debug('fire min_threshold ......');
		widget.dispatch('min_threshold');
		return
	}
}

bricks.HScrollPanel = class extends bricks.HBox {
	/*
	{
		min_threshold:
		max_threshold:
	}
	*/
	constructor(opts){
		opts.width = '100%';
		opts.height = '100%';
		opts.css = opts.css + ' scrollpanel';
		opts.overflow = 'auto';
		super(opts);
		this.min_threshold = opts.min_threshold || 0.01;
		this.max_threshold = opts.max_threshold || 0.99;
		this.bind('scroll', this.scroll_handle.bind(this))
		this.last_scrollLeft = this.dom_element.scrollLeft;
		this.threshold = false;
	}
	scroll_handle(event){
		if (event.target != this.dom_element){
			// bricks.debug('HScroll():scroll on other', event.target);
			return;
		}
		var e = this.dom_element;
		if ( e.scrollWidth - e.clientWidth < 1) {
			// bricks.debug('HScroll():same size');
			return;
		}
		low_handle(this, 'x', this.last_scrollLeft, 
						e.scrollLeft,
						e.scrollWidth,
						e.clientWidth);
		this.scroll_info = {
			left:e.scrollLeft,
			scroll_width:e.scrollWidth,
			client_width:e.clientWidth
		}
		this.last_scrollLeft = e.scrollLeft;
	}
}

bricks.VScrollPanel = class extends bricks.VBox {
	/*
	{
		min_threshold:
		max_threshold:
	}
	*/
	constructor(opts){
		opts.width = '100%';
		opts.height = '100%';
		opts.css = opts.css + ' scrollpanel';
		opts.overflow = 'auto';
		super(opts);
		this.min_threshold = opts.min_threshold || 0.02;
		this.max_threshold = opts.max_threshold || 0.95;
		this.bind('scroll', this.scroll_handle.bind(this))
		this.last_scrollY = this.dom_element.scrollY;
	}
	scroll_handle(event){
		if (event.target != this.dom_element){
			// bricks.debug('scroll on other', event.target);
			return;
		}
		var e = this.dom_element;
		if ( e.scrollHeight - e.clientHeight < 2) {
			// bricks.debug('same size');
			return;
		}
		low_handle(this, 'y', this.last_scrollTop, 
						e.scrollTop,
						e.scrollHeight,
						e.clientHeight);
		this.last_scrollTop = e.scrollTop;
		this.scroll_info = {
			top:e.scrollTop,
			scroll_height:e.scrollHeight,
			client_height:e.clientHeight
		}
	}
}

bricks.Factory.register('VScrollPanel', bricks.VScrollPanel);
bricks.Factory.register('HScrollPanel', bricks.HScrollPanel);

var bricks = window.bricks || {};
/*
*/
bricks.url_menuitems = {
}

bricks.Menu = class extends bricks.VScrollPanel {
	/*
	{
		"items":
	}
	*/
	constructor(options){
		opts.height = '100%';
		super(options);
		this.dom_element.style.display = "";
		this.dom_element.style.backgroundColor = options.bgcolor || "transparent";
		this.build_title();
		this.build_description();
		this.user_data = this.opts;
		this.is_collapsed = false;
		this.bind('item_click', this.menu_clicked.bind(this));
		this.container = new bricks.VBox({});
		this.add_widget(this.container);
		schedule_once(this.create_children.bind(this, this, 0), 0.1);
	}
	collapse(){
		this.is_collapsed = true;
		this.dom_element.classList.add('menu-collapsed');
	}
	expand(){
		this.is_collapsed = false;
		this.dom_element.classList.remove('menu-collapsed');
	}
	toggle_collapse(){
		if (this.is_collapsed) this.expand();
		else this.collapse();
	}
	create_submenu_container(){
		let cp = new bricks.VBox({});
		cp.set_style('marginLeft', "15px");
		cp.set_style('display', 'none');
		return cp;
	}
	async menu_clicked(event){
		let e = event.target;
		let opts = event.params;
		var t;
		var popts;
		var target = opts.target || this.target;
		var popup_options = opts.popup_options || this.popup_options;
		if (target == 'PopupWindow'){
			popts = bricks.get_popupwindow_default_options();
			bricks.extend(popts, popup_options || {});
			popts.icon = opts.icon;
			popts.title = opts.label || opts.name
			t = new bricks.PopupWindow(popts);
		} else if (this.target == 'Popup'){
			popts = bricks.get_popup_default_options();
			bricks.extend(popts, popup_options || {});
			t = new bricks.Popup(popts);
		} else {
			t = bricks.getWidgetById(target, this);
		}
		if (t){
			if (opts.url){
				var desc = {
					"widgettype":"urlwidget",
					"options":{
						"url":opts.url
					}
				}
				var w = await bricks.widgetBuild(desc, this);
				if (w && ! bricks.Factory.isWidgetType(w, 'Popup')){
					t.clear_widgets();
					t.add_widget(w);
				} else {
					console.log('menu_clicked():widgetBuild() failed', desc);
				}
			} else if (opts.script){
				var AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
				var f = new AsyncFunction('menu', 'event', opts.script);
				if (!f){
					console.log('menu item define error', opts);
				}
				f.bind(t, this)(event);
			} else if (opts.method){
				var f = target[opts.method];
				if (!f){
					console.log('menu item define error', opts);
				}
				f.bind(t, this)(evnet);
			} else if (opts.rfname){
				var f = bricks.RF.get(opts.rfname);
				if (!f){
					console.log('menu item define error', opts);
				}
				f.bind(t, this)(event);
			} else {
				console.log('********** menu item configured error *******');
			}
		} else {
			console.log('menu_clicked():', this.target, 'not found')
		}
		this.dispatch('command', opts);
	}
	async create_children(w, cnt){
		var items = w.user_data.items;
		if (!items){
			console.log('items is None', user_data, w);
			return;
		}
		var container = w.container;
		if (!container){
			console.log(w, items, 'container is null');
			return;
		}
		for (let i=0;i<items.length;i++){
			let item = items[i];
			let subw = this.create_menuitem(item);
			if (item.submenu){
				item.items = await this.get_submenu_items(item.submenu);
			}
			if (item.items){
				var itw = new bricks.VBox({});
				let w1 = this.create_submenu_container();
				itw.container = w1;
				itw.user_data = item;
				itw.add_widget(subw);
				itw.add_widget(w1);
				if (cnt < 4){
					this.create_children(itw, cnt+1);
				}
				subw.bind('click', this.items_toggle_hide.bind(this, w1));
				container.add_widget(itw);
			} else {
				subw.bind('click', this.regen_menuitem_event.bind(this, item))
				subw.user_data = item;
				container.add_widget(subw);
			}
		}
	}
	async get_submenu_items(url){
		var items = bricks.url_menuitems[url];
		if (items) return items;
		var jc = new bricks.HttpJson();
		var d = await jc.get(url);
		items =  d.options.items;
		bricks.url_menuitems[url] = items;
		return items;
	}
	get_container(w, mpath){
		var x = mpath.split('/');
		var name = x.shift()
		var container = w.container;
		var fc;
		if (! container) 
		{
			console.log(w, mpath, 'get_container() container is null');
			return null;
		}
		containers.children.forEach(c=>{
			if (c.user_data){
				if (c.user_data.name == name) fc = c;
			} else {
				throw 'menu data error';
			}
		});
		if (! fc) {
			console.log(name, 'not found in subitems')
			return null;
		}
		if (x.length == 0){
			console.log('notmal return');
			return fc;
		}
		mpath = x.join('/')
		return this.get_container(fc, mpath);
	}

	hide_item(menu_path, event){
		var w = this.get_container(this, mpath);
		if (w) w.hide();
		event.stopPropagation();
	}
	show_item(menu_path, event){
		var w = this.get_container(this, mpath);
		if (w) w.show();
		event.stopPropagation();
	}
	items_toggle_hide(w, event){
		w.toggle_hide();
		event.stopPropagation();
	}
	create_menuitem(item){
		var w = new bricks.HBox({cheight:this.item_cheight||2});
		var iw, tw;
		if (item.icon){
			iw = new bricks.Icon({cwidth: 1.3, cheight:1.3, url:item.icon});
		} else {
			iw = new bricks.BlankIcon({cwidth: 1.3, cheight:1.3});
		}
		w.add_widget(iw);
		tw = new bricks.Text({
			css: "filler",
			otext:item.label,
			i18n:true,
			wrap:true,
			halign:'left'
		});
		w.add_widget(tw);
		iw.menuitem = w;
		tw.menuitem = w;
		w.set_css(this.menuitem_css || 'menuitem');
		if (item.label) w.dom_element.title = item.label;
		return w;
	}
	regen_menuitem_event(item, event){
		console.log('regen_menuitem_event()', item);
		this.dispatch('item_click', item);
		event.stopPropagation();
	}
}

bricks.Factory.register('Menu', bricks.Menu);
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
		if (ele != e.target && ! ele.contains(e.target)){	
			console.log("resizing():on other dom element");
			this.stop_resizing();
			return;
		}
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
var bricks = window.bricks || {};

bricks.MediaRecorder = class extends bricks.Popup {
	constructor(opts){
		super(opts);
		opts.fps = opts.fps || 30;
		this.fps_period = 1 / this.fps;
		this.task = null;
		this.stream = null;
		this.normal_stop = false;
		this.mimetype = 'audio/wav';
		this.preview = new bricks.VBox({width: '100%', css: 'filler'});
		this.controls = new bricks.HBox({width: '100%', cheight: 2.5});
		this.toggle_record = new bricks.Svg({
			url: bricks_resource('/imgs/start_recording.svg'),
			tip: 'start or stop record',
			rate: 2
		});
		this.timepass = new bricks.Text({text:'00:00:00', cheight: 1.2});
		var filler = new bricks.Filler({});
		var cancel = new bricks.Svg({
						url: bricks_resource('imgs/delete.svg'), 
						rate:2,
						tip: 'cancel recording'});
		cancel.bind('click', this.cancel_record.bind(this))
		this.add_widget(this.preview);
		this.add_widget(this.controls);
		this.controls.add_widget(this.toggle_record);
		this.controls.add_widget(this.timepass);
		this.controls.add_widget(filler);
		this.controls.add_widget(cancel);
		this.record_status = 'standby';
		this.toggle_record.bind('click', this.switch_record.bind(this));
		this.toggle_record.disabled(true);
		schedule_once(this.open_recorder.bind(this), 0.1);
	}
	async tick_task(){
		this.timepass.set_text(bricks.timeDiff(this.start_time));
	}
	async switch_record(){
		console.log('toggle_record called');
		if (this.record_status == 'standby'){
			this.start_record();
			this.toggle_record.set_url(bricks_resource('imgs/stop_recording.svg'));
			this.record_status = 'recording';
		} else {
			this.stop_record();
			this.toggle_record.set_url(bricks_resource('imgs/start_recording.svg'));
			this.record_status = 'standby';
		}
	}
	cancel_record(){
		this.close_recorder();
	}
	async open_recorder(){
		console.debug('open recorder for record');
	}
	async start_record(){
		this.normal_stop = false;
		this.mediaRecorder = new MediaRecorder(this.stream, 
								{mimeType: this.mimetype});
		this.recordedChunks = [];
		this.mediaRecorder.ondataavailable = (event) => {
			console.log('ondataavailabe() called', event.data.size);
			if (event.data.size > 0) {
				this.time_diff = bricks.timeDiff(this.start_time);
				this.recordedChunks.push(event.data);
				this.timepass.set_text(this.time_diff);
			}
		};
		this.mediaRecorder.onstop = async () => {
			console.log('onstop() called', this.normal_stop);
			if (!this.normal_stop) return;
			var blob = new Blob(this.recordedChunks, 
							{ type: this.mimetype }); 
			// 1. 在本地播放
			blob = await this.blob_convert(blob);
			const url = URL.createObjectURL(blob);
			// 2. 转成 File 对象
			var filename;
			if (this.mimetype == 'video/mp4'){
				filename = 'recorded_video.mp4';
			} else {
				filename = 'recorded_audio.wav'
			}
			const file = new File([blob], 
						filename, 
						{ type: this.mimetype });
			var data = {
				url: url,
				file: file
			}
			this.dispatch('record_end', data);
			console.log('"record_end" fired', file);
		};

		this.start_time = Date.now();
		this.task = schedule_interval(this.tick_task.bind(this), 0.5);
		this.mediaRecorder.start();
		this.dispatch('record_started')
		console.log("Recording started...");
	}
	async blob_convert(blob){
		return blob;
	}
	stop_record(){
		if (this.task){
			clearInterval(this.task);
			this.task = null;
		}
		this.normal_stop = true;
		this.time_diff = bricks.timeDiff(this.start_time);
		this.timepass.set_text(this.time_diff);
		this.mediaRecorder.stop();
		this.mediaRecorder = null;
		this.close_recorder();
		console.log("Recording stopped.");
	}

	close_recorder(){
		if (this.stream){
			if (this.mediaRecorder){
				this.mediaRecorder.stop();
				this.mediaRecorder = null;
			}
			this.stream.getTracks().forEach(track => track.stop());
			this.stream = null;
		}
		this.dismiss();
	}
}

bricks.WidgetRecorder = class extends bricks.MediaRecorder {
	async open_recorder(){
		var widget = bricks.getWidgetById(this.opts.widgetid,bricks.app);
		if (widget.dom_element.tagName == 'VIDEO'){
			this.mimetype = 'video/mp4';
		} else if (widget.dom_element.tagName == 'AUDIO'){
			this.mimetype = 'audio/wav';
		} else {
			throw 'Error, not a media element';
		}
		this.stream = source.captureStream();
		this.toggle_record.disabled(false);
	}
}
bricks.SysAudioRecorder = class extends bricks.MediaRecorder {
	async open_recorder(){
		var options = {}
		options.audio = true;
		this.mimetype = 'audio/webm';
		this.stream = await navigator.mediaDevices.getUserMedia(options);
		this.toggle_record.disabled(false);
		this.preview.disabled(true);
	}
	async blob_convert(webmBlob){
		// 2. 解码 WebM → PCM
		const arrayBuffer = await webmBlob.arrayBuffer();
		const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		const decodedData = await audioCtx.decodeAudioData(arrayBuffer);

		// 3. 转换为 WAV Blob
		const wavBlob = this.encodeWAV(decodedData);
		return wavBlob;
	}
	encodeWAV(audioBuffer) {
		const numChannels = audioBuffer.numberOfChannels;
		const sampleRate = audioBuffer.sampleRate;
		const format = 1; // PCM
		const bitDepth = 16;

		// interleave channels
		let result;
		if (numChannels === 2) {
			result = this.interleave(audioBuffer.getChannelData(0), audioBuffer.getChannelData(1));
		} else {
			result = audioBuffer.getChannelData(0);
		}

		// float → 16-bit PCM
		const buffer = new ArrayBuffer(44 + result.length * 2);
		const view = new DataView(buffer);

		/* RIFF header */
		this.writeString(view, 0, "RIFF");
		view.setUint32(4, 36 + result.length * 2, true);
		this.writeString(view, 8, "WAVE");
		this.writeString(view, 12, "fmt ");
		view.setUint32(16, 16, true);
		view.setUint16(20, format, true);
		view.setUint16(22, numChannels, true);
		view.setUint32(24, sampleRate, true);
		view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
		view.setUint16(32, numChannels * (bitDepth / 8), true);
		view.setUint16(34, bitDepth, true);

		this.writeString(view, 36, "data");
		view.setUint32(40, result.length * 2, true);

		// PCM samples
		let offset = 44;
		for (let i = 0; i < result.length; i++, offset += 2) {
			const s = Math.max(-1, Math.min(1, result[i]));
			view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
		}
		return new Blob([view], { type: "audio/wav" });
	}

	interleave(left, right) {
		const length = left.length + right.length;
		const result = new Float32Array(length);

		let inputIndex = 0;
		for (let i = 0; i < length;) {
			result[i++] = left[inputIndex];
			result[i++] = right[inputIndex];
			inputIndex++;
		}
		return result;
	}

	writeString(view, offset, string) {
		for (let i = 0; i < string.length; i++) {
			view.setUint8(offset + i, string.charCodeAt(i));
		}
	}
}
bricks.SysVideoRecorder = class extends bricks.MediaRecorder {
	async open_recorder(){
		var options = {
			audio: true,
			video: true
		}
		this.mimetype = 'video/mp4';
		this.stream = await navigator.mediaDevices.getUserMedia(options);
		const track = this.stream.getVideoTracks()[0];
		const settings = track.getSettings();
		this.imageCapture = new ImageCapture(track);
		this.camera_height = settings.height;
		this.camera_width = settings.width;
		this.imgw = new bricks.Image({width: '100%'});
		this.preview.add_widget(this.imgw);
		this.toggle_record.disabled(false);
		this.fps_task = schedule_interval(this.show_picture.bind(this), this.fps_period);
	}
	async show_picture(){
		try {
			var blob = await this.imageCapture.takePhoto();
			this.dataurl = URL.createObjectURL(blob);
			this.imgfile = new File([blob],
							'image.jpg',
							{ type: 'image/jpeg' });
			this.imgw.set_url(this.dataurl);
		} catch(e){
			;
		}
	}
	close_recorder(){
		super.close_recorder();
		if (this.fps_task){
			clearInterval(this.fps_task);
			this.fps_task = null;
		}
	}
}
bricks.SysCamera= class extends bricks.SysVideoRecorder {
	switch_record(){
		console.log('shot it ............');
		event.stopPropagation();
		this.dispatch('shot', {url: this.dataurl, file:this.imgfile});
		this.close_recorder();
	}
}
bricks.Factory.register('SysCamera', bricks.SysCamera);
bricks.Factory.register('WidgetRecorder', bricks.WidgetRecorder);
bricks.Factory.register('SysAudioRecorder', bricks.SysAudioRecorder);
bricks.Factory.register('SysVideoRecorder', bricks.SysVideoRecorder);
var bricks = window.bricks || {};

bricks.min_zindex = 5000;
bricks.last_zindex = 5000;
bricks.BaseModal = class extends bricks.Layout {
	constructor(options){
		/*
		{
			target: string or Layout
			auto_open:
			auto_close:
			org_index:
			width:
			height:
			bgcolor:
			title:
			timeout:
			archor: cc ( tl, tc, tr
						cl, cc, cr
						bl, bc, br )
		}
		*/
		super(options);
		this.set_width('100%');
		this.set_height('100%');
		this.ancestor_add_widget = bricks.Layout.prototype.add_widget.bind(this);
		this.panel = new bricks.VBox({});
		this.timeout = options.timeout || 0;
		this.timeout_task = null;
		this.ancestor_add_widget(this.panel);
		this.panel.set_width(this.opts.width);
		this.panel.set_height(this.opts.height);
		this.panel.dom_element.style.backgroundColor = this.opts.bgcolor|| '#e8e8e8';
		this.panel.set_css('modal');
		archorize(this.panel.dom_element, objget(this.opts, 'archor', 'cc'));
		this.target_w = null;
		if (this.target){
			if (typeof this.target === typeof ''){
				this.target_w = bricks.getWidgetById(this.target, bricks.Body);
			} else {
				this.target_w = this.target;
			}
		}
		if (! this.target_w){
			this.target_w = bricks.Body;
		}
		if (this.target_w!=bricks.Body){
			this.target_w.set_style('position', 'relative');
		}
		this.target_w.add_widget(this);
	}
	get_zindex(){
		var idx = bricks.last_zindex;
		bricks.last_zindex += 1;
		return idx;
	}
	create(){
		var e = document.createElement('div');
		e.style.display = "none"; /* Hidden by default */
		e.style.position = "fixed"; /* Stay in place */
		e.style.zIndex = this.get_zindex();
		e.style.paddingTop = "100px"; /* Location of the box */
		e.style.left = 0;
		e.style.top = 0;
		e.style.width = "100%"; /* Full width */
		e.style.height = "100%"; /* Full height */
		e.style.backgroundColor = 'rgba(0,0,0,0.4)'; /* Fallback color */
		this.dom_element = e;
	}
	add_widget(w, index){
		this.panel.add_widget(w, index);
		if (this.opts.auto_open){
			this.open();
		}
	}
	open(){
		this.dom_element.style.display = "";
		if (this.timeout > 0){
			this.timeout_task = schedule_once(this.dismiss.bind(this), this.timeout);
		}
		this.dispatch('opened');
	}
	dismiss(){
		if (this.parent){
			this.set_css('display', 'none');
			if (this.timeout_task){
				clearTimeout(this.timeout_task);
				this.timeout_task = null;
			}
			try {
				this.parent.remove_widget(this);
			} catch(e){
				console.log(e, 'remove modal error');
			}
			this.dispatch('dismissed');
		}
	}
}
bricks.Modal = class extends bricks.BaseModal {
	constructor(options){
		/*
		{
			target: string or Layout
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
		this.create_title();
		this.content = new bricks.Filler({width:'100%'});
		this.panel.add_widget(this.content);
	}
	create_title(){
		this.title_box = new bricks.HBox({width:'100%', height:'auto'});
		this.title_box.set_css('title');
		this.panel.add_widget(this.title_box);
		this.title_w = new bricks.Filler({height:'100%'});
		var icon = new bricks.Svg({url:bricks_resource('imgs/delete.svg')});
		icon.bind('click', this.dismiss.bind(this));
		this.title_box.add_widget(this.title_w);
		this.title_box.add_widget(icon);
		if (this.title){
			var w = new bricks.Text({
				otext:this.title,
				i18n:true,
				dynsize:true
			});
			this.title_w.add_widget(w);
		}
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
			bricks.debug('modal():click_handler()');
		}
	}
	/*
	open(){
		if (this.opts.auto_close){
			var f = this.click_handler.bind(this);
			this.bind('click', f);
		}
		bricks.BaseModal.prototype.open.bind(this)();
	}
	dismiss(){
		if (this.opts.auto_close){
			this.unbind('click', this.click_handler.bind(this));
		}
		bricks.BaseModal.prototype.dismiss.bind(this)();
	}
	*/
}

bricks.ModalForm = class extends bricks.PopupWindow {
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
		fields:
		user_data:
		binds:
	}
	*/
	constructor(opts){
		super(opts);
		schedule_once(this.build_form.bind(this), 0.2);
	}
	_getValue(){
		return this.form._getValue();
	}
	getValue(){
		return this.form.getValue();
	}
	async build_form(){
		var opts = {
			widgettype: "Form",
			options:{
				height:'100%',
				title:this.opts.title,
				description:this.opts.description,
				fields:this.opts.fields,
				binds:this.opts.binds || []
			}
		}
		if (this.submit_url){
			opts.submit_url = this.submit_url;
		}
		this.form = await bricks.widgetBuild(opts, this);
		this.add_widget(this.form);
		this.form.bind('submit', this.form_submit.bind(this));
		this.form.bind('submited', this.form_submited.bind(this));
		this.form.bind('cancel', this.dismiss.bind(this))
		this.open();
	}
	form_submit(){
		var d = this.form.getValue();
		this.dispatch('submit', d)
		this.dismiss();
	}
	form_submited(event){
		this.dispatch('submited', event.params);
	}
}
bricks.Factory.register('Modal', bricks.Modal);
bricks.Factory.register('ModalForm', bricks.ModalForm);
	
var bricks = window.bricks || {};

bricks.BaseRunning = class extends bricks.FHBox {
	/*
	{
		"icon"
	}
	*/
	constructor(opts){
		if (! opts.cwidth) opts.cwidth = 2;
		if (! opts.cheight) opts.cheight = 2;
		super(opts);
		this.icon_w = new bricks.Icon({
			rate: opts.rate|| 2,
			url:opts.icon || bricks_resource('imgs/running.gif')
		});
		this.time_w = new bricks.Text({
			text:'00:00:00',
			color:'#222',
			wrap:false,
			i18n:false
		});
		this.time_start = new Date().getTime();
		this.add_widget(this.icon_w);
		this.add_widget(this.time_w);
		this.showtime_task = schedule_interval(this.show_timepass.bind(this), 0.05);
	}
	
	show_timepass(){
		var t = new Date().getTime() - this.time_start;
		var txt = bricks.formatMs(t, 1);
		this.time_w.set_text(txt);
	}
	stop_timepass(){
		if (this.showtime_task){
			clearInterval(this.showtime_task);
			this.showtime_task = null;
		}
	}
}

bricks.Running = class extends bricks.BaseModal {
	/*
	{
		target:
		icon:
	}
	*/
	constructor(opts){
		opts.auto_open = true;
		opts.archor = 'cc';
		super(opts);
		this.w = new bricks.BaseRunning({icon:opts.icon});
		this.add_widget(this.w);
	}
	dismiss(){
		this.w.stop_timepass();
		bricks.BaseModal.prototype.dismiss.bind(this)();
	}
}

bricks.Factory.register('Running', bricks.Running);
var bricks = window.bricks || {};

/*
bricks.UserInputView
将所有输入转换成一个Markdown，音视频媒体数据独立显示
*/
bricks.UserInputView = class extends bricks.VBox {
	constructor(opts){
		super(opts);
		this.v_w = null;
		this.a_v = null;
		this.show_input(this.data);
	}
	show_input(data){
		var mdtext = '';
		this.input_fields.forEach(f =>{
			if (data[f.name]){
				if (f.name.startsWith('video')){
					var url = URL.createObjectURL(data[f.name]);
					this.v_w = new bricks.VideoPlayer({
						url:url,
						autoplay:true,
						width: '100%'
					});
				} else if (f.name.startsWith('audio')){
					var url = URL.createObjectURL(data[f.name]);
					console.log('audio:', f.name, data[f.name]);
					this.a_w = new bricks.AudioPlayer({
						url:url,
						autoplay:true,
						width: '100%'
					});
				} else if (f.name.startsWith('image')){
					var url = URL.createObjectURL(data[f.name]);
					mdtext += `
* ${f.label || f.name}
![${f.label || f.name}](${url})
`;
				} else {
					mdtext += `
* ${f.label || f.name}

${data[f.name]}

`;
				}
			}
		});
		this.clear_widgets();
		var w = new bricks.MdWidget({
			width: '100%',
			mdtext:mdtext
		});
		console.log('mdtext=', mdtext);
		this.add_widget(w);
		if (this.v_w){
			this.add_widget(this.v_w);
		}
		if (this.a_w){
			this.add_widget(this.a_w);
		}
	}
}
/*
根据大模型返回数据自动构造显示内容
大模型返回json格式数据，下面的属性可选
reasoning_content:推理文本
content：应答文本
error: 错误信息
audio：语音url或base64语音
video：视频url或base64视频
image：如果是个数组，则多个图片url
*/

bricks.LlmOut = class extends bricks.VBox {
	constructor(opts){
		super(opts);
		this.rc_w = null;
		this.c_w = null;
		this.v_w = null;
		this.i_w = null;
		this.a_w = null;
		this.glb_w = null;
		this.s_w = null;  // 状态
		this.images = [];
		this.reasoning_content = '';
		this.content = '';
		this.error = '';
	}
	
	update(data){
		if (data.status){
			this.s_w = new bricks.Text({
				width: '100%',
				height: 'auto',
				text: JSON.stringify(data)
			});
		}
		if (data.audio){
			var url = data.audio;
			if (! data.audio.startsWith('http')){
				if (! data.audio.startsWith('data:audio/')){
					url = 'data:audio/wav;base64,' + url;
				}
			}
			if (!this.a_w) {
				this.a_w = new bricks.AudioPlayer({
					width: '100%',
					autoplay: true,
					url: url,
					cheight:2
				});
			} else {
				this.a_w.add_url(url);
			}
		}
		if (data.glb){
			this.glb_w = new bricks.GlbViewer({
				url:data.glb,
				width: '100%'
			});
		}
		if (data.video){
			if (!this.v_w){
				this.v_w = new bricks.VideoPlayer({
					width: '100%',
					url: data.video,
					autoplay: true
				});
			} else {
				this.v_w.add_url(data.video);
			}
		}
		if (data.error){
			this.error += data.error;
		}
		if (data.reasoning_content){
			this.reasoning_content += data.reasoning_content;
		}
		if (data.content){
			this.content += data.content;
		}
		if (data.image){
			if (Array.isArray(data.image)){
				this.images.concat(data.image);
			} else {
				this.images.push(data.image);
			}
		}
		this.clear_widgets();
		if (this.error.length) {
			var txt = bricks.escapeSpecialChars(this.error);
			this.c_w = new bricks.Text({
				text: this.error,
				wrap: true,
				halign: 'left',
				css: 'resp-error',
				width: '100%'
			});
			this.add_widget(this.c_w);
		}
		if (this.reasoning_content.length) {
			var txt = bricks.escapeSpecialChars(this.reasoning_content);
			this.rc_w = new bricks.MdWidget({
				mdtext: this.reasoning_content,
				css: 'thinking-content',
				bgcolor: '#f0d0d0',
				width: '100%'
			});
			this.add_widget(this.rc_w);
		}
		if (this.content.length) {
			var txt = bricks.escapeSpecialChars(this.content);
			this.c_w = new bricks.MdWidget({
				mdtext: this.content,
				css: 'resp-content',
				width: '100%'
			});
			this.add_widget(this.c_w);
		}
		if (this.v_w) {
			this.add_widget(this.v_w);
		}
		if (this.glb_w){
			this.add_widget(this.glb_w);
		}
		if (this.a_w) {
			this.add_widget(this.a_w);
		}
		if (this.images.length){
			this.images.forEach( i => {
				var w = new bricks.Image({
					width: '100%',
					url: i
				});
				this.add_widget(w)
			});
		}
		if(this.s_w){
			this.add_widget(this.s_w);
		}
	}
}
bricks.Factory.register('LlmOut', bricks.LlmOut);
bricks = window.bricks || {};

bricks.GlbViewer = class extends bricks.VBox {
	constructor(opts){
		super(opts);
		this.dom_element.innerHTML=`<model-viewer
  src="${this.opts.url}"
  auto-rotate
  camera-controls
  style="width: 100%; height: 100vh;">
</model-viewer>`
	}
}
bricks.Factory.register('GlbViewer', bricks.GlbViewer);
var bricks = window.bricks || {};
/* 
reply on "https://github.com/markedjs/marked"
add following lines before 'bricks.js'
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
*/

bricks.MdWidget = class extends bricks.JsWidget {
	/* options
	{
		"mdtext":
		"md_url":
		"method":"GET"
		"params":{}
	}
	*/

	constructor(options){
		super(options);
		if (this.mdtext){
			this.md_content = this.mdtext;
			this._build1();
		} else {
			var f = this.build.bind(this);
			this.load_event = new Event('loaded');
			this.dom_element.style.overFlow='auto';
			window.addEventListener('scroll', this.show_scroll.bind(this));
			schedule_once(f, 0.01);
		}
	}
	set_content(content){
		this.md_content = content;
		this._build1();
	}
	show_scroll(event){
		bricks.debug('scrollY=', window.scrollY);
	}
	async build(){
		if (! this.opts.md_url){
			return;
		}
		this._build(this.opts.md_url);
	}
	async _build(md_url){
		var md_content = await (bricks.tget(md_url));
		this.md_content = md_content;
		this._build1();
		this.dispatch('loaded', {'url':md_url});
	}
	_build1(){
		this.dom_element.innerHTML = marked.parse(this.md_content);
		/* change links in markdown to a bricks action */
		var links = this.dom_element.getElementsByTagName('a');
		for (var i=0; i<links.length; i ++){
			var url = links[i].href;
			links[i].href = '#';
			links[i].onclick=this._build.bind(this, url);
		}
	}
	getname(){
		return this.name || 'mdtext';
	}
	getValue(){
		var name = this.getname();
		var d = {}
		d[name] = this.md_content
		return d;
	}
	setValue(v){
		this.md_content = v;
	}
}
bricks.MarkdownViewer = class extends bricks.VBox {
	/* options 
	{
		navigator:true
		recommentable:false
		md_url:
		mdtext:
		method:"GET",
		params:{}
	}
	*/
	constructor(options){
		super(options);
		this.back_stack = [];
		this.md_url = bricks.absurl(this.opts.md_url);
		if (this.opts.navigator){
			this.createBackButton();
		}
		this.mdtext = new bricks.MdWidget({
			mdtext:this.mdtext,
			method:this.method,
			params:this.params,
			md_url:this.md_url
		});
		this.add_widget(this.mdtext);
		this.mdtext.bind('loaded', this.add_back_stack.bind(this));
		this.dom_element.style.overflow='auto';
		this.dom_element.style.height='100%';
		this.bind('scroll', this.show_scroll.bind(this));
	}
	show_scroll(event){
		bricks.debug('scrollY=', window.scrollY);
	}
	async createBackButton(){
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
		var w = await bricks.widgetBuild(desc);
		bricks.debug('createBackButton():error, desc=', desc, 'w=', w);
		var t = w.children[0];
		bricks.debug('createBackButton():text=',t);
		t.bind('click',this.go_back.bind(this));
		this.add_widget(w);
		bricks.debug('createBackButton():desc=',desc, 'w=', w);
	}
	add_back_stack(event){
		bricks.debug('go_back_stack():event=', event);
		var url = event.params.url;
		this.back_stack.push(url);
	}
	async go_back(event){
		if (this.back_stack.length < 2){
			return;
		}
		// ignore the current text url
		this.back_stack.pop();
		// get the back url
		var url = this.back_stack.pop();
		await this.mdtext._build(url);
	}

	async build(){
		await this._build(this.opts.md_url);
	}
	async _build(md_url){
		var md_content = await (bricks.tget(md_url));
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

bricks.Factory.register('MarkdownViewer', bricks.MarkdownViewer);
bricks.Factory.register('MdWidget', bricks.MdWidget);
var bricks = window.bricks || {};

bricks.formatMs=function(ms,all){
	var ss=ms%1000;ms=(ms-ss)/1000;
	var s=ms%60;ms=(ms-s)/60;
	var m=ms%60;ms=(ms-m)/60;
	var h=ms;
	var t=(h?h+":":"")
		+(all||h+m?("0"+m).substr(-2)+":":"")
		+(all||h+m+s?("0"+s).substr(-2)+"″":"")
		+("00"+ss).substr(-3);
	return t;
};

bricks.AudioPlayer = class extends bricks.JsWidget {
	/*
	{
		url:
		autoplay:
	}
	*/

	constructor(options){
		super(options);
		this.url = options.url;
		this.audio = this._create('audio');
		this.audio.controls = true;
		if (this.opts.autoplay){
			this.audio.addEventListener('canplay', this.play.bind(this));
		}
		this.audio.addEventListener('ended', this.playended.bind(this));
		this.audio.style.width = "100%"
		this.dom_element.appendChild(this.audio);
		if ( this.url ){
			this.set_source(this.url);
		}
		this.playlist = [];
	}
	get_status() {
		var audio = this.audio;
		if (audio.error) {
			return "error";
		}
		if (audio.ended) {
			return "ended";
		}
		if (audio.paused) {
			return "paused";
		}
		if (audio.readyState < 3) {
			return "loading";  // 数据不足，可能在缓冲
		}
		return "playing";
	}

	add_url(url){
		var status = this.get_status();
		switch(status){
			case 'error':
			case 'ended':
				this.set_source(url);
				break;
			default:
				this.playlist.push(url);
				break;
		}
	}
	playended(e){
		if (this.playlist.length > 0) {
			var url = this.playlist.shift();
			this.set_source(url);
		} else {
			this.dispatch('ended');
		}
	}
	set_stream_urls(response){
		async function* dyn_urls(response) {
			const reader = response.body.getReader();
			var value;
			var done;
			while (true){
				done, value = await reader.read();
				if (value.done){
					console.log('done=', done, 'value=', value);
					break;
				}   
				let result = ''; 
				for (let i = 0; i < value.value.length; i++) {
					result += String.fromCharCode(value.value[i]);
				}   
				console.log('audio set url=', result);
				yield result;
			}   
		}
		this.url_generator = dyn_urls(response);
		this.srcList = [];
		this.notBegin = true;
		schedule_once(this.load_queue_url.bind(this), 0.1);
	}
	async load_queue_url(){
		while (true){
			var d = await this.url_generator.next();
			if (d.done){
				return;
			}
			this.srcList.push({played:false, url:d.value});
			if (this.srcList.length < 2	){
				await this.play_srclist();
				this.audio.addEventListener('ended', 
							this.play_srclist.bind(this));
			}
		}
	}
	async play_srclist(evnet){
		if (event && ! this.audio.ended){
			return;
		}
		for (var i=0;i<this.srcList.length;i++){
			if (!this.srcList[i].played){
				console.log('playit', i, this.srcList[i]);
				this.set_url(this.srcList[i].url);
				this.srcList[i].played = true;
				await this.play();
				return;
			}
		}
	}
	set_source(url){
		if (! this.source){
			this.source = this._create('source');
			this.source.src = url;
			this.audio.appendChild(this.source);
		}
		this.url = this.audio.src = url;
		console.log(this.audio.src,' new src seted');
	}
	set_source_from_response(resp){
	  // 将服务器返回的数据设置为音频源
	  this.audio.src = URL.createObjectURL(new Blob([response.body]));
	  // 播放音频
	  this.audio.play();
	}
	async play(){
		await this.audio.play();
	}
	async toggle_play(){
		if (this.audio.paused){
			await this.audio.play();
		} else {
			await this.audio.pause();
		}
	}
	set_url(url){
		this.set_source(url);
		this.audio.play();
	}
}


bricks.AudioRecorder = class extends bricks.HBox {
	/*
	{
		"upload_url":
		"icon_rate":
	}
	we need this module:
	https://gitee.com/xiangyuecn/Recorder
	events:
		record_started
		record_ended
	realtime record wave show need a another package
	we only use the wav file format
	*/
	constructor(opts){
		super(opts);
		this.set_css('clickable');
		this.start_icon = opts.start_icon || bricks_resource('imgs/start_recording.svg');
		this.stop_icon = opts.stop_icon || bricks_resource('imgs/stop_recording.svg');
		this.rec_btn = new bricks.Svg({
			url:this.start_icon, 
			rate:this.icon_rate 
		});
		// this.player = new bricks.AudioPlayer({url:"",width:'80px'});
		this.rec_time = new bricks.Text({
			text:" record time", 
			i18n:false,
			dynsize:true,
			wrap:false, 
			width:'120px'
		});
		this.upload_url = opts.upload_url;
		this.bind('click', this.rec_btn_pressed.bind(this))
		this.URL = window.URL||webkitURL;
		this.rec = null;
		this.wave = null;
		this.mic_opened = false;
		this.add_widget(this.rec_btn);
		this.add_widget(this.rec_time);
		this.recordData = null;
		this.bind('record_started', this.begin_recording.bind(this));
		if (this.upload_url){
			this.bind('record_ended', this.upload.bind(this));
		}
	}
	begin_recording(){
		this.recordData = null;
		this.rec.start();
	}
	rec_btn_pressed(){
		if(this.rec_btn.url == this.start_icon){
			console.log('start recording .......');
			this.rec_btn.set_url(this.stop_icon);
			this.start_recording();
		} else {
			console.log('stop recording ....');
			this.rec_btn.set_url(this.start_icon);
			this.stop_recording();
		}
	}
	on_process(buffers,powerLevel,
						bufferDuration,bufferSampleRate,
						newBufferIdx,asyncEnd){
		//录音实时回调，大约1秒调用12次本回调
		// document.querySelector(".recpowerx").style.width=powerLevel+"%";
		//可视化图形绘制
		// wave.input(buffers[buffers.length-1],powerLevel,bufferSampleRate);
		this.rec_time.set_text(' ' + bricks.formatMs(bufferDuration,1));
		
	}
	recOpen(){
		this.rec=null;
		this.wave=null;
		var newRec = Recorder({
			type:"wav",sampleRate:16000,bitRate:16
			,onProcess:this.on_process.bind(this)
		});

		newRec.open(function(){//打开麦克风授权获得相关资源
			this.mic_opened = true;
			this.rec=newRec;
			this.dispatch('record_started');
			//此处创建这些音频可视化图形绘制浏览器支持妥妥的
			//this.wave=Recorder.FrequencyHistogramView({elem:".recwave"});
		}.bind(this),function(msg,isUserNotAllow){//用户拒绝未授权或不支持
			bricks.debug('open recorder failed');
		});
	}
	recClose(){
		if(this.rec){
			this.rec.close();
			this.rec = null;
			this.mic_opened = false;
		}else{
			bricks.debug('close recorder error');
		};
	}
	start_recording(){
		if (this.mic_opened){
			this.rec.start();
			this.dispatch('record_started');
		}
		this.recOpen();
	}
	pause_recording(){
		if(this.rec&&Recorder.IsOpen()){
			this.rec.pause();
		}else{
			bricks.debug("gCAR::未打开录音");
		};
	}
	resume_recording(){
		if(this.rec&&Recorder.IsOpen()){
			this.rec.resume();
		}else{
			bricks.debug("Ob6S::未打开录音");
		};
	}
	stop_recording(){
		if(!(this.rec&&Recorder.IsOpen())){
			bricks.debug("5JuL::未打开录音");
			return;
		};
		this.rec.stop(function(blob,duration){
			var localURL = this.URL.createObjectURL(blob);
			var d = {
				data:blob,
				url:localURL,
				duration:duration
			}
			this.recordData = d;
			this.dispatch('record_ended', d);

		}.bind(this),function(msg){
			bricks.debug("kGZO::录音失败:");
		});
		this.recClose();
	}
	async upload(){
		var running = new bricks.Running({target:this});
		if(!this.recordData){
			bricks.debug("DUTn::请先录音，然后停止后再上传");
			return;
		};
		if(!this.upload_url){
			return;
		}
		var blob=this.recordData.data;
		bricks.debug('blob=', blob, this.recordData);
		var form=new FormData();
		form.append("audiofile",blob,"recorder.wav");
		var jpost = bricks.jpost
		var ret = await jpost(this.upload_url,{
			params:form
		});
		bricks.debug('ret=', ret);
		this.dispatch('uploaded', ret)
		running.dismiss();
	}
	download(){
		if(!this.recordData){
			bricks.debug('recorder not opened');
			return;
		};
		var fileName="recorder-"+Date.now()+".wav";
		var downA=document.createElement("A");
		downA.innerHTML="下载"+fileName;
		downA.href=this.recordData.url;
		downA.download=fileName;
		// document.querySelector("."+cls).appendChild(downA);
		if(bricks.is_mobile()){
			bricks.debug('mobile device');
		}
		downA.click();
		//不用了时需要revokeObjectURL，否则霸占内存
		(window.URL||webkitURL).revokeObjectURL(downA.href);
	}
}

bricks.TextedAudioPlayer = class extends bricks.VBox {
	constructor(opts){
		super(opts);
		this.audio = new bricks.AudioPlayer({
			height:'60px'
		});
		this.audio.bind('ended', this.playnext.bind(this));
		var filler, panel;
		filler  = new bricks.Filler({});
		this.add_widget(this.audio);
		this.add_widget(filler);
		panel = new bricks.VScrollPanel({
			height: '100%'
		});
		filler.add_widget(panel);
		this.textw = new bricks.Text({
			text: ' ',
			wrap: true
		});
		panel.add_widget(this.textw);
		this.streaming_buffer = [];
		this.wait_play = true;
	}
	async playnext(){
		var json = this.streaming_buffer.shift();
		console.log('======', json);
		if (json && ! json.done){
			var url = base64_to_url(json.audio);
			this.audio.set_url(url);
			this.wait_play = false;
			this.textw.set_text(json.text);
			await this.audio.play();
		} else {
			this.textw.set_text('');
			this.audio.set_url(null);
			this.wait_play = true;
		}
	}
	async set_stream_urls(response){
		this.wait_play = true;
		await streamResponseJson(response, this.load_stream_data.bind(this));
	}
	async load_stream_data(json){
		console.log('***', json);
		this.streaming_buffer.push(json);
		if (this.wait_play) {
			await this.playnext();
		}
	}
}
bricks.Factory.register('AudioPlayer', bricks.AudioPlayer);
bricks.Factory.register('AudioRecorder', bricks.AudioRecorder);
bricks.Factory.register('TextedAudioPlayer', bricks.TextedAudioPlayer);


var bricks = window.bricks || {};
bricks.Toolbar = class extends bricks.Layout {
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

	*/
	constructor(options){
		super(options);
		this.toolList = [];
		if (this.opts.orientation == 'vertical'){
			this.bar = new bricks.VScrollPanel(options);
			this.dom_element.classList.add('vtoolbar')
		} else {
			this.bar = new bricks.HScrollPanel(options);
			this.dom_element.classList.add('htoolbar')
		}
		this.bar.enable_key_select()
		this.add_widget(this.bar);
		this.clicked_btn = null;
		this.preffix_css = this.opts.css || 'toolbar';
		schedule_once(this.createTools.bind(this), 0.01);
	}
	add_interval_box(){
		if (this.opts.orientation == 'vertical'){
			this.bar.add_widget(new bricks.JsWidget({
						height:this.opts.interval || '10px'
			}));
		} else {
			this.bar.add_widget(new bricks.JsWidget({
						width:this.opts.interval || '10px'
			}));
		}
	}
	async createTools(){
		if (!this.opts.tools){
			console.log('error: tools not exists in options');
			return;
		}
		var l = this.opts.tools.length;
		for (var i=0;i<l; i++){
			await this.createTool(this.opts.tools[i]);
			if (i < l -1 ){
				this.add_interval_box();
			}
		}
	}
	async createTool(desc){
		var options = {
			"widgettype":"Button",
			"options":{
				width:"auto",
				orientation:"horizontal",
				flexShrink:0,
				icon:desc.icon,
				label:desc.label,
				name:desc.name,
				css:desc.css
			}
		};
		var w = await bricks.widgetBuild(options);
		if (! w){
			bricks.debug('Toolbar(): build widget failed', options);
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
		this.bar.unselect_item(w);
		this.toolList.remove(w);
		w.unbind('click',this.do_handle.bind(this, w));
		this.dispatch('remove', w.tool_opts);
		event.preventDefault();
		event.stopPropagation();
	}
	do_handle(tool, event){
		// var tool = event.target;
		bricks.debug('Toolbar() onclick,target=', event.target, tool);
		var d = {};
		bricks.extend(d, tool.tool_opts);
		if (this.opts.target){
			d.target = this.opts.target;
		}
		this.bar.select_item(tool);
		this.dispatch('command', d);
		this.dispatch(tool.tool_opts.name, d);
		bricks.debug('event ', tool.tool_opts.name, ' fired ...')
		if (this.clicked_btn){
			this.clicked_btn.set_css(this.preffix_css + '-button-active', true);
		}
		tool.set_css(this.preffix_css + '-button-active');
		this.clicked_btn = tool;
	}
	add_removable(item){
		if (! item.tool_opts.removable) return;
		var img_src = bricks_resource('imgs/delete.svg');
		var image = new bricks.Svg({url:img_src});
		if (image){
			item.add_widget(image);
			image.bind('click',this.remove_item.bind(this, item));
			bricks.debug('Toolbar(): add_removable() for ', img_src);
		} else {
			bricks.debug('Toolbar(): Image create error', img_src);
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

bricks.Factory.register('Toolbar', bricks.Toolbar);
var bricks = window.bricks || {};
bricks.TabPanel = class extends bricks.Layout {
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
	
	events:
		switch: fired when switch content
		event data: actived content widget

	content wedget event:
		active: fired when the content event is switch to show
	*/
	constructor(options){
		super(options);
		this.content_buffer = {};
		this.cur_tab_name = '';
		this.content_container = new bricks.Filler({});
		if (this.opts.tab_pos == 'top' ||  this.opts.tab_pos == 'bottom'){
			this.set_css('vbox');
			this.tab_container = new bricks.VBox({
					height:'auto',
					width:'auto'
			});
		} else {
			this.set_css('hbox');
			this.tab_container = new bricks.VBox({
					width:'auto',
					height:'auto'
			});
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
		this.show_first_tab();
	}
	show_first_tab(){
		this.toolbar.dispatch('command', this.opts.items[0]);
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
		this.toolbar = new bricks.Toolbar(desc);
		this.toolbar.bind('command', this.show_tabcontent.bind(this));
		this.toolbar.bind('remove', this.tab_removed.bind(this));
		this.toolbar.bind('ready', this.show_first_tab.bind(this));
		this.tab_container.add_widget(this.toolbar);
	}
	async show_tabcontent(event){
		var tdesc = event.params;
		var items = this.opts.items;
		if (tdesc.name == this.cur_tab_name){
			bricks.debug('TabPanel(): click duplication click on same tab', tdesc)
			return;
		}
		for (var i=0;i<items.length;i++){
			if (tdesc.name == items[i].name){
				var w = objget(this.content_buffer, tdesc.name);
				if (w && ! items[i].refresh){
					this.cur_tab_name = name;
					this.switch_content(w);
					return;
				}
				try {
					if (items[i].content instanceof bricks.JsWidget){
						w = items[i].content;
					} else {
						w = await bricks.widgetBuild(items[i].content, this, {});
					}
					if (! w){
						bricks.debug('TabPanel():create content error', items[i].content);
						return;
					}
					this.content_buffer[tdesc.name] = w;
					this.cur_tab_name = tdesc.name;
					this.switch_content(w);
					return;
				}
				catch (e) {
					console.log('except ', e)
				}
			}
		}
		bricks.debug('TabPanel(): click event handled but noting to do', tdesc)
	}
	switch_content(w){
		this.content_container.clear_widgets();
		this.content_container.add_widget(w);
		this.dispatch('switch', w);
		w.dispatch('active');
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

bricks.Factory.register('TabPanel', bricks.TabPanel);
var bricks = window.bricks || {};
bricks.UiType =class extends bricks.Layout {
	constructor(opts){
		super(opts);
		this.name = this.opts.name;
		this.required = opts.required || false;
		this.ctype = 'text';
		this.value = opts.value || opts.defaultvalue||'';
	}

	getValue(){
		var o = {}
		o[this.name] = this.resultValue();
		var d = this.getUserData();
		if (d){
			o = bricks.extend(o, d);
		}
		return o;
	}
	set_formdata(formdata){
		formdata.append(this.name, this.resultValue());
	}
	resultValue(){
		return this.value;
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

bricks.UiHide = class extends bricks.UiType {
	constructor(opts){
		super(opts);
		this.uitype = 'hide';
		this.set_style('display', 'none');
	}
}

bricks.UiStr =class extends bricks.UiType {
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
		this.uitype='str';
		this.rate = this.opts.rate || 1;
		this.dynsize = this.opts.dynsize || true;
		this.cfontsize = this.opts.cfontsize || 1;
		if (opts.readonly) {
			this.set_readonly("Y");
		} else {
			this.set_readonly(false);
		}
		if (opts.width){
			this.dom_element.style.width = opts.width;
		}
		this.charsize_sizing();
	}
	create(){
		var el = this._create('input');
		this.dom_element = el;
		this.pattern = '.*';
		el.autocomplete = 'off';
		el.type = 'text';
		el.id = this.name = el.name = this.opts.name;
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
			this.setValue(this.opts.value);
		if (this.opts.defaultVlaue)
			el.defaultValue = this.opts.defaultValue;
		this.reset()
		if (this.opts.placeholder)
			el.placeholder = bricks.app.i18n._(this.opts.placeholder);
		el.addEventListener('focus', this.onfocus.bind(this));
		el.addEventListener('onkeydown', this.onkeydown.bind(this));
		el.addEventListener('blur', this.onblur.bind(this));
		el.addEventListener('input', this.set_value_from_input.bind(this))
	}
	onblur(event){
		this.dom_element.classList.remove(this.actived_css);
		this.value = this.dom_element.value;
		this.set_value_from_input(event);
	}
	onfocus(event){
		this.dom_element.classList.add(this.actived_css);
	}
	onkeydown(event){
		if(event.key == 'Enter'){
			var v = this.getValue();
			this.dispatch('blur', v)
		}
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
		var oldv = this.value;
		var changed = false;
		var e = event.target;
		var v = e.value;
		if (e.value!='' && e.type != 'file'){
			v = this.check_pattern(e.value);
		}
		if (v == null){
			e.value = this.value;
			return
		}
		this.value = v;
		var o = this.getValue();
		this.dispatch('changed', o);
	}
	resultValue(){
		this.value = this.dom_element.value;
		return this.value;
	}
	setValue(v){
		if (! v)
			v = '';
		this.value = v;
		this.dom_element.value = '' + this.value;
	}
}

bricks.UiSearch = class extends bricks.HBox {
	/*
	search_url:
	valueField
	textField
	select_event
	popup_options
	value,
	text
	*/
	constructor(opts){
		super(opts);
		this.uitype = 'search';
		var inputdesc = {
			name:this.name,
			value:this.text,
			readonly:true
		}
		this.str_in = new bricks.UiStr(inputdesc);
		this.search_icon = new bricks.Svg({
			url:bricks_resource('imgs/search.svg'),
			rate:1.5
		});
		this.str_in.set_css('filler');
		this.search_icon.set_css('clickable');
		this.search_icon.bind('click', this.open_search_window.bind(this));
		this.add_widget(this.str_in);
		this.add_widget(this.search_icon);
	}
	async open_search_window(event){
		var desc = {
			"widgettype":"urlwidget",
			"options":{
				"url":this.search_url
			}
		}
		var w = await bricks.widgetBuild(desc, this);
		var tabular = null;
		for (var i=0;i<w.children.length;i++){
			if (w.children[i] instanceof bricks.Tabular){
				tabular = w.children[i];
			}
		}
		if (!tabular){
			console.log('tubular not found is w');
			return;
		}
		var win = bricks.default_popupwindow(this.popup_options||{});
		win.add_widget(w);
		win.open();
		tabular.bind(this.search_event, this.set_data.bind(this));
		tabular.bind(this.search_event, win.dismiss.bind(win));
	}
	set_data(event){
		var d = event.params;
		this.value = d[this.valueField];
		this.str_in.setValue(d[this.textField])
	}
	getValue(){
		var o = {}
		o[this.name] = this.resultValue();
		var d = this.getUserData();
		if (d){
			o = bricks.extend(o, d);
		}
		return o;
	}
	set_formdata(formdata){
		formdata.append(this.name, this.resultValue());
	}
	resultValue(){
		return this.value;
	}
	focus(){
		this.str_in.dom_element.focus();
	}
	reset(){
		var v = this.opts.value||this.opts.defaultvalue|| '';
		this.setValue(v);
		this.str_in.setValue(this.opts.text||'');
	}
	setValue(v, t){
		if (! v)
			v = '';
		this.vlaue = v;
		this.str_in.setValue(t);
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
bricks.UiPassword =class extends bricks.UiStr {
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
		opts.dynsize = opts.dynsize || true;
		super(opts);
		this.uitype='password';
		this.dom_element.type = 'password';
	}
}
bricks.UiInt =class extends bricks.UiStr {
	/* 
	{
		length:
	}
	*/
	constructor(options){
		super(options);
		this.uitype='int';
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
bricks.UiFloat  =class extends bricks.UiInt {
	/* 
	{
		dec_len:
	}
	*/
	constructor(options){
		super(options);
		this.uitype='float';
		this.pattern = '\\d*\\.?\\d+';
		var dec_len = this.opts.dec_len || 2;
		var step = 1;
		for (var i=0; i<dec_len; i++)
			step = step / 10;
		this.dom_element.step = step;
	}
	resultValue(){
		super.resultValue();
		return parseFloat(this.value);
	}
	setValue(v){
		if (! v)
			v = '';
		this.value = '' + v;
		this.dom_element.value = '' + v;
	}
}
bricks.UiTel =class extends bricks.UiStr {
	/*
	{

		pattern:
	}
	*/
	constructor(opts){
		super(opts);
		this.uitype='tel';
		this.dom_element.type = 'tel';
		if (this.opts.pattern)
			this.dom_element.pattern = this.opts.pattern;
		this.pattern = '[+]?\\d+';
	}
}

bricks.UiEmail =class extends bricks.UiStr {
	/*
	{
	}
	*/
	constructor(opts){
		super(opts);
		this.uitype='email';
		this.dom_element.type = 'email';
		if (this.opts.pattern)
			this.dom_element.pattern = this.opts.pattern;
		if (this.opts.pattern)
			this.dom_element.pattern = this.opts.pattern;
	}
}

bricks.UiFile = class extends bricks.VBox {
	/*
        accept:
        multiple:
	*/
	constructor(opts){
		opts.width = opts.width || '100%';
		super(opts);
		this.set_css('droparea');
		this.bind('dragover', (event) => {
			event.preventDefault();
		});
		["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
      		this.bind(eventName, (e) => e.preventDefault(), false);
		});
		this.bind('dragenter', () => {
			this.set_css('hover');
		});
		this.bind('dragleave', () => {
			this.set_css('hover', true);
		});
		this.bind('drop', this.dropHandle.bind(this));
		this.input = document.createElement('input');
		this.input.type = 'file';
		if (opts.accept) this.input.accept = opts.accept;
		if (opts.multiple) this.input.multiple = true;
		this.input.addEventListener('change', this.handleFileSelect.bind(this));
		this.add_widget(new bricks.Text({text:'drop in or click to choose file'}));
		this.dom_element.appendChild(this.input);
	}
    reset(){
        var v = this.opts.value || this.opts.defaultvalue||'';
		this.value = '';
        this.input.value = '';
    }
	handleFileSelect(event){
		var files = [];
		Array.from(event.target.files).forEach(f => {
			if (! this.accept || f.type.startsWith(this.accept)){
				files.push(f);
			}
		});
		if (files.length == 0) return; 
		if (this.opts.multiple){
			this.value = files;
		} else {
			this.value = files[0];
		}
		console.log('"changed" fired', this.value);
		this.dispatch('changed', this.getValue());
	}
	set_input_file(files){
		const dt = new DataTransfer();
		if (this.opts.multiple){
			this.value = [];
			files.forEach(f => {
				dt.items.add(f);
				this.value.push(f);
			});
			this.input.files = dt.files;
		} else {
			var f = files[0]
			this.value = f;
			dt.items.add(f);
			this.input.files = dt.files;
		}
	}
	dropHandle(event){
		event.preventDefault();
		var files = [];
		for (const f of event.dataTransfer.files) {
			if (! this.opts.accept || f.type.startsWith(this.opts.accept)){
				files.push(f);
			}
		};
		if (files.length == 0) return;
		if (this.opts.multiple){
			this.value = files;
			this.set_input_file(files);
		} else {
			this.value = files[0];
			this.set_input_file([this.value]);
		}
		this.dispatch('changed', this.getValue());
		console.log('"changed" fired', this.getValue());
	}
	set_formdata(fd){
		fd.append(this.name, this.resultValue());
	}
	resultValue(){
		if (this.value){
			return this.value;
		}
		if (this.input.files.length)
			return this.input.files[0];
		return null;
	}
	getValue(){
		var ret = {};
		ret[this.name] = this.resultValue();
		return ret;
	}
}

bricks.UiAudio =class extends bricks.UiFile {
	constructor(opts){
		opts.name = opts.name || 'audio_file';
		opts.width = opts.width || '100%';
		opts.accept = 'audio/';
		super(opts);
		this.uitype='audio';
		this.camera_w = new bricks.Svg({
				url:bricks_resource('imgs/mic.svg'),
				tip:'use mic to record audio',
				rate:2});
		this.add_widget(this.camera_w);
		this.camera_w.bind('click', this.open_recorder.bind(this));
		this.preview = new bricks.VBox({width: '100%'});
		this.add_widget(this.preview);
		this.bind('changed', this.show_audio.bind(this));
	}
	open_recorder(event){
		event.stopPropagation();
		var recorder = new bricks.SysAudioRecorder({
			"archor":"cc",
			"auto_open":true,
			"cheight":3,
			"cwidth":20
		});
		recorder.bring_to_top();
		recorder.bind('record_end', this.accept_audio.bind(this, recorder));
	}
	accept_audio(recorder, event){
		recorder.dismiss();
		this.value = event.params.file
		this.set_input_file([this.value]);
		console.log('record finished, value=', this.value);
		this.dispatch('changed', this.getValue());
	}
	show_audio(event){
		var params = this.value;
		if (params instanceof File){
			params = [ params ];
		}
		if (typeof params == 'string'){
			params = [ params ];
		}
		this.preview.clear_widgets();
		params.forEach( f => {
			this._show_audio(f);
		});
	}

	_show_audio(file) {
		if (typeof file == 'string'){
			var vw = new bricks.AudioPlayer({
				url:file,
				audoplay: true,
				width:'100%'
			});
			this.preview.add_widget(vw);
			return;
		}
		const reader = new FileReader();
		reader.onload = (e) => {
			var imgw = new bricks.AudioPlayer({
				url:e.target.result,
				autoplay: true,
				width:'100%'
			});
			console.log('show audio', e.target.result);
			this.preview.add_widget(imgw);
		};
		reader.readAsDataURL(file);
	}
}
bricks.UiVideo =class extends bricks.UiFile {
	constructor(opts){
		opts.name = opts.name || 'video_file';
		opts.width = opts.width || '100%';
		opts.accept = 'video/';
		super(opts);
		this.uitype='video';
		this.camera_w = new bricks.Svg({
				url:bricks_resource('imgs/video-recorder.svg'),
				tip:'use cemera to record video',
				rate:2});
		this.set_css('droparea');
		this.add_widget(this.camera_w);
		this.camera_w.bind('click', this.open_recorder.bind(this));
		this.preview = new bricks.VBox({width: '100%'});
		this.add_widget(this.preview);
		this.bind('changed', this.show_video.bind(this));
	}
	open_recorder(event){
		event.stopPropagation();
		var recorder = new bricks.SysVideoRecorder({
			"archor":"cc",
			"auto_open":true,
			"height":"90%",
			"width":"90%"
		});
		recorder.bring_to_top();
		recorder.bind('record_end', this.accept_video.bind(this, recorder));
	}
	accept_video(recorder, event){
		recorder.dismiss();
		this.value = event.params.file
		this.set_input_file([this.value]);
		console.log('record finished, value=', this.value);
		this.dispatch('changed', this.getValue());
	}
	show_video(event){
		var params = this.value;
		console.log('params=', params);
		if (params instanceof File){
			params = [ params ];
		}
		if (typeof params == 'string'){
			params = [ params ];
		}
		this.preview.clear_widgets();
		params.forEach( f => {
			this._show_video(f);
		});
	}

	_show_video(file) {
		if (typeof file == 'string'){
			var vw = new bricks.VideoPlayer({
				url:file,
				audoplay: true,
				width:'100%'
			});
			this.preview.add_widget(vw);
			return;
		}
		var url = URL.createObjectURL(file);
		var imgw = new bricks.VideoPlayer({
			url:url,
			autoplay: true,
			width:'100%'
		});
		console.log('show video', url);
		this.preview.add_widget(imgw);
	}
}
bricks.UiImage =class extends bricks.UiFile {
	constructor(opts){
		opts.name = opts.name || 'image';
		opts.width = opts.width || '100%';
		opts.accept = 'image/';
		super(opts);
		this.uitype='image';
		this.camera_w = new bricks.Svg({
				url:bricks_resource('imgs/camera.svg'),
				tip:'use cemera to take a picture',
				rate:2});
		this.set_css('droparea');
		this.add_widget(this.camera_w);
		this.camera_w.bind('click', this.take_photo.bind(this));
		this.preview = new bricks.VBox({width: '100%'});
		this.add_widget(this.preview);
		this.bind('changed', this.show_image.bind(this));
	}
	take_photo(event){
		event.stopPropagation();
		var camera = new bricks.SysCamera({
			"archor":"cc",
			"auto_open":true,
			"height":"90%",
			"width":"90%"
		});
		camera.bring_to_top();
		camera.bind('shot', this.accept_photo.bind(this, camera));
	}
	accept_photo(camera, event){
		camera.dismiss();
		this.value = event.params.file;
		this.set_input_file([this.value]);
		var data = {};
		data[this.name] = this.value;
		this.dispatch('changed', data);
	}
	show_image(event){
		var params = event.params[this.name];
		if (params instanceof File){
			params = [ params ];
		}
		if (typeof params == 'string'){
			params = [ params ];
		}
		this.preview.clear_widgets();
		params.forEach( f => {
			this._show_image(f);
		});
	}

	_show_image(file) {
		if (typeof file == 'string'){
			var imgw = new bricks.Image({
				url:file,
				width:'100%'
			});
			this.preview.add_widget(imgw);
		}
		const reader = new FileReader();
		reader.onload = (e) => {
			var imgw = new bricks.Image({
				url:e.target.result,
				width:'100%'
			});
			this.preview.add_widget(imgw);
		};
		reader.readAsDataURL(file);
	}
}

bricks.UiCheck =class extends bricks.UiType {
	constructor(opts){
		super(opts);
		this.uitype = 'check';
		bricks.extend(bricks.UiCheck.prototype, bricks.Layout.prototype);
		this.add_widget = bricks.Layout.prototype.add_widget.bind(this);
		this.dom_element.style.width = 'auto';
		this.dom_element.style.height = 'auto';
		var state = 'unchecked';
		if (opts.value){
			state = 'checked';
		}
		this.ms_icon = new bricks.MultipleStateIcon({
			state:state,
			urls:{
				checked:bricks_resource('imgs/checkbox-checked.svg'),
				unchecked:bricks_resource('imgs/checkbox-unchecked.svg')
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
		var d = this.getUserData();
		if (d){
			o = bricks.extend(o, d);
		}
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

bricks.UiCheckBox =class extends bricks.UiType {
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
		this.uitype='checkbox';
		this.valueField = opts.valueField || 'value';
		this.textField = opts.textField || 'text';
		this.value = this.opts.value || this.opts.defaultValue||[];
		if (! Array.isArray(this.value)){
			this.value = [ this.value ];
		}
		this.el_legend = this._create('legend');
		var label = this.opts.label||this.opts.name;
		this.el_legend.innerText = bricks.app.i18n._(label);
		if (this.opts.dataurl){
			schedule_once(this.load_data_onfly.bind(this), 0.01);
		} else {
			this.data = opts.data;
			this.build_checkboxs();
		}
		this.sizable_elements = [];
		this.sizable_elements.push(this.el_legend);
		this.charsize_sizing();
	}
	create(){
		this.dom_element = this._create('fieldset');
	}
	build_checkboxs(){
		var data = this.data;
		this.input_boxs = [];
		if (this.multicheck){
			if (typeof this.value != typeof []){
				this.value = [this.value];
			}
		}
			
		for (var i=0; i<data.length;i++){
			var hbox = new bricks.HBox({height:"auto",width:"100%"});
			var opts = {}
			var value = data[i][this.valueField];
			opts.value = false;
			if (this.multicheck){
				if (this.value.indexOf(value) >= 0){
					opts.value = true;
				}
			}
			else {
				if (this.value == value){
					opts.value = true
				}
			}
			opts.name = value;
			var check = new bricks.UiCheck(opts);
			var otext = data[i][this.textField];
			var txt = new bricks.Text({
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
		var jc = new bricks.HttpJson();
		var data = await jc.httpcall(this.opts.dataurl, {
					"method":this.opts.method||'GET',
					"params":this.opts.params});
		this.data = data;
		this.build_checkboxs();
	}
	set_value_from_input(event){
		event.stopPropagation();
		var e = event.target.bricks_widget;
		if (this.multicheck){
			if (e.value){
				this.value.push(e.name);
			} else {
				this.value.remove(e.name)
			}
		} else {
			for (var i=0;i<this.input_boxs.length;i++){
				var e1 = this.input_boxs[i];
				if (e1 != e){
					e1.setValue(false);
				}
			}
			this.value = e.name;
			console.log('this is singlecheck ....', this.value);
		}
		var o = {};
		o[this.name] = this.value;
		this.dispatch('changed', o);
	}
	resultValue(){
		return this.value;
	}
	setValue(v){
		var thisvalue = this.value;
		if (Array.isArray(v)){
			thisvalue = v;
		} else {
			thisvalue = [v];
		}
		for (var i=0; i<this.input_boxs.length; i++){
			if (thisvalue.includes(this.data[i][this.valueField])){
				this.input_boxs[i].setValue(true);
			} else {
				this.input_boxs[i].setValue(false);
			}
		}
	}
}

bricks.UiDate =class extends bricks.UiStr {
	/* 
	{
		max_date:
		min_date:

	*/
	constructor(options){
		super(options);
		this.uitype='date';
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
	resultValue(){
		if (this.value == ''){
			return null;
		}
		return this.value;
	}
}

bricks.UiText =class extends bricks.UiType {
	/*
	{
		name:
		value:
		defaultValue:
		tip:
		readonly:
		required:
	}
	*/
	constructor(opts){
		opts.dynsize = opts.dynsize || true;
		opts.cfontsize = opts.cfontsize || 1;
		if (opts.css){
			opts.css += ' inputbox auto-textarea';
		} else {
			opts.css = 'inputbox auto-textarea';
		}
		super(opts);
		this.uitype='text';
		this.build();
		this.charsize_sizing();
		this.bind('input', this.handleInput.bind(this));
		this.bind('keydown', this.key_handle.bind(this));
	}
	handleInput() {
		// 1. 记录原始滚动位置（防止光标跳动）
		var el = this.dom_element;
		const scrollTop = el.scrollTop;

		// 2. 核心：先设为固定高度而非 auto，
		// 避免某些浏览器（如 Safari）在 auto 切换时丢失滚动焦点
		el.style.height = '0px';

		// 3. 获取实时计算样式
		const style = window.getComputedStyle(el);
		const maxHeight = parseInt(style.maxHeight) || Infinity;
		const minHeight = parseInt(style.minHeight) || 40;

		// 4. 计算目标高度
		// scrollHeight 在所有现代浏览器中都包含 padding
		const targetHeight = el.scrollHeight;

		if (targetHeight >= maxHeight) {
			// 达到或超过最大高度
			el.style.height = maxHeight + 'px';
			el.style.overflowY = 'auto';
		} else {
			// 低于最大高度
			el.style.height = Math.max(targetHeight, minHeight) + 'px';
			el.style.overflowY = 'hidden';
		}

		// 5. 恢复滚动（解决 Chrome/Safari 偶尔的置顶 Bug）
		el.scrollTop = scrollTop;
	}
	create(){
		this.dom_element = this._create('textarea');
	}
	build(){
		var e = this.dom_element;
		e.id = e.name = this.opts.name;
		this.reset();
		this.bind('input', this.set_value_from_input.bind(this))
	}
	set_value_from_input(event){
		this.value = this.dom_element.value;
	}
	resultValue(){
		var e = this.dom_element;
		this.value = e.value;
		return this.value;
	}
	setValue(v){
		if (! v) v = '';
		this.value = v;
		this.dom_element.value = v;
		debug('UiText: v=', v);
		this.handleInput();
	}
	reset(){
		var v = this.opts.value || this.opts.defaultvalue||'';
		this.setValue(v);
	}
	key_handle(e){
		switch(e.key){
			case 'Tab':
				e.preventDefault(); // 阻止默认Tab行为
				var erase = false
				if (e.shiftKey) erase = true;
				this.handle_tab_indent(erase);
				break;
			case 'Enter':
				e.preventDefault(); // 阻止默认行为
				this.handle_enter();
				break;
			case 'ArrowUp':
			case 'ArrowDown':
			default:
				break;
		}
	}
	set_editor_focus(editor, pos){
		editor.selectionStart = editor.selectionEnd = pos;
		editor.focus();
	}
	handle_enter(){
		var editor = this.dom_element;
		const cursorPos = editor.selectionStart;
		const value = editor.value;
		const before = value.substring(0, cursorPos);
		const after = value.substring(cursorPos);
		editor.value = before + '\n' + after;
		editor.selectionStart = editor.selectionEnd = cursorPos + 1;
		editor.focus();
		schedule_once(this.set_editor_focus.bind(this, editor, cursorPos+1), 0.5);
	}	
	handle_tab_indent(erase){
		/* erase == true : delete tabspace
		   else
		   		add tabspace
		*/
		var editor = this.dom_element;
		var indent_cnt;
		const cursorPos = editor.selectionStart;
		const value = editor.value;

		// 获取光标所在行的开始位置
		const beforeCursor = value.substring(0, cursorPos);
		const lastLineStart = beforeCursor.lastIndexOf("\n") + 1; // 上一行的结束位置
		const currentLineStart = lastLineStart; // 当前行的开始位置
		const cur_col = cursorPos - currentLineStart;
		var pos;
		if (!erase){
			indent_cnt = 4 - cur_col % 4;
			if (indent_cnt == 0) indent_cnt = 4;
			// 根据光标前的空格数动态插入合适数量的空格
			const before = value.substring(0, cursorPos);
			const after = value.substring(cursorPos);
			const indentation = ' '.repeat(indent_cnt); // 生成合适数量的空格
			editor.value = before + indentation + after;
			// 更新光标位置（将光标移到插入的缩进后面）
			pos = cursorPos + indent_cnt;
			editor.selectionStart = editor.selectionEnd = cursorPos + indent_cnt;
		} else {
			indent_cnt = cur_col % 4;
			if (indent_cnt == 0) indent_cnt = 4;
			const before = value.substring(0, cursorPos - indent_cnt);
			const after = value.substring(cursorPos);
			editor.value = before + after;
			pos = cursorPos - indent_cnt;
			editor.selectionStart = editor.selectionEnd = cursorPos - indent_cnt;
		}
		editor.focus();
		schedule_once(this.set_editor_focus.bind(this, editor, pos), 0.5);
	}
}

bricks.UiCode =class extends bricks.UiType {
	/*
	{
		name:
		value:
		valueField:
		nullable:
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
	constructor(opts){
		opts.cfontsize = opts.cfontsize||1;
		opts.dynsize = opts.dynsize || true;
		super(opts);
		this.uitype='code';
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
	async loadData(params){
		var _params = bricks.extend({}, this.opts.params);
		bricks.extend(_params, params);
		await this.load_data(_params);
	}
	async get_data(event){
		var params = this.opts.params;
		if(event){
			bricks.extend(params, event.params);
		}
		await this.load_data(params);
	}
	async load_data(params){
		var jc = new bricks.HttpJson();
		var d = await jc.httpcall(this.opts.dataurl,
			{
				method:this.opts.method || 'GET',
				params : params
			});
		this.data = d;
		this.build_options(d);
	}
	build_options(data){
		var e = this.dom_element;
		while(e.firstChild){
			e.removeChild(e.firstChild);
		}
		var v = this.opts.value || this.opts.defaultvalue || null;
		if (!v && ! this.opts.nullable && data.length > 0){
			v = data[0][this.opts.valueField]
		}
		if (this.opts.nullable){
			var tmp = {};
			tmp[this.opts.valueField] = null;
			tmp[this.opts.textField] = '';
			data.unshift(tmp);
		}
		this.value = v;
		e.value = v;
		this.option_widgets = {};
		for (var i=0; i<data.length; i++){
			var o = document.createElement('option');
			o.value = data[i][this.opts.valueField||'value'];
			var txt = bricks.app.i18n._(data[i][this.opts.textField||'text']);
			if (!txt) txt = data[i][this.opts.valueField||'value'];
			o.innerText = txt;
			this.option_widgets[o.value] = o;
			if (o.value == v){
				o.selected = true;
			}
			e.appendChild(o);
			this.sizable_elements.push(o);
		}
		this.bind('input', this.set_value_from_input.bind(this))
		this.charsize_sizing();
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

bricks._Input = class {
	constructor(){
		this.uitypes = [];
	}

	register(name, uitype,Klass){
		if (! Klass){
			bricks.debug('Klass not defined', name);
			return;
		}
		bricks.Factory.register(name, Klass);
		this.uitypes[uitype] = Klass;
	}
	factory(options){
		var klass = this.uitypes[options.uitype];
		if (klass){
			return new klass(options);
		}
		bricks.debug('create input for:', options.uitype, 'failed', this.uitypes);
		return null;
	}
}

var Input = new bricks._Input();
Input.register('UiAudio', 'audiorecorder', bricks.UiAudio);
Input.register('UiStr', 'str', bricks.UiStr);
Input.register('UiHide', 'hide', bricks.UiHide);
Input.register('UiTel', 'tel', bricks.UiTel);
Input.register('UiDate', 'date', bricks.UiDate);
Input.register('UiInt', 'int', bricks.UiInt);
Input.register('UiFloat', 'float', bricks.UiFloat);
Input.register('UiCheck', 'check', bricks.UiCheck);
Input.register('UiCheckBox', 'checkbox', bricks.UiCheckBox);
Input.register('UiEmail', 'email', bricks.UiEmail);
Input.register('UiFile', 'file', bricks.UiFile);
Input.register('UiImage', 'image', bricks.UiImage);
Input.register('UiCode', 'code', bricks.UiCode);
Input.register('UiText', 'text', bricks.UiText);
Input.register('UiPassword', 'password', bricks.UiPassword);
Input.register('UiAudio', 'audio', bricks.UiAudio);
Input.register('UiVideo', 'video', bricks.UiVideo);
Input.register('UiAudio', 'audiotext', bricks.UiAudio);
Input.register('UiSearch', 'search', bricks.UiSearch);
var bricks = window.bricks || {};

class RegisterFunction {
	constructor(){
		this.rfs = {};
	}
	register(n, f){
		this.rfs[n] = f;
	}
	get(n){
		try {
			return this.rfs[n];
		} catch(e){
			return null;
		}
	}
}

bricks.RF = new RegisterFunction();
bricks.Button = class extends bricks.Layout {
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
		bricks.extend(this.dom_element.style, style);
	}
	create(){
		this.dom_element = document.createElement('button');
	}
	opts_setup(){
		var item_size = this.opts.item_size || bricks.app.charsize;
		if (this.opts.icon){
			var icon = new bricks.Icon({
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
			var txt = new bricks.Text(opts);
			this.add_widget(txt);
			txt.bind('click', this.target_clicked.bind(this));
			this.text_w = txt;
		}
	}
	target_clicked(event){
		bricks.debug('target_clicked() .... called ');
		event.stopPropagation();
		this.dispatch('click', this.opts);
		if (this.opts.action){
			if (this.opts.debug){
				bricks.debug('debug:opts=', this.opts);
			}
		}
	}
}

bricks.Factory.register('Button', bricks.Button);
var bricks = window.bricks || {};
bricks.Accordion = class extends bricks.VBox {
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
		this.keyselectable = true;
		var item_size = this.opts.item_size || '25px';
		this.set_height('100%');
		var items = this.opts.items;
		this.w_items = [];
		this.subcontents = {};
		var item_css = this.opts.item_css || 'accordion' + '-button';
		var content_css = this.opts.content_css || 'accordion' + '-content';
		for (var i=0; i< items.length; i++){
			var opts = {
				name:items[i].name,
				icon:items[i].icon,
				label:items[i].label,
				height:'auto',
				orientation:'horizontal'
			}
			var b = new bricks.Button(opts);
			b.bind('click', this.change_content.bind(this));
			this.w_items.push(b);
			this.add_widget(b);
		}
		this.key_select_items = this.w_items;
		this.content = new bricks.Filler({});
		this.sub_container = new bricks.VScrollPanel({height:'100%'});
		this.content.add_widget(this.sub_container);
		this.w_items[0].dispatch('click');
	}
	async change_content(event){
		var refresh = false;
		var b = event.target.bricks_widget;
		var name = b.opts.name;
		this.select_item(b);
		bricks.debug('accordion: button=', b, 'name=', name);
		var pos = -1;
		for (var i=0; i< this.opts.items.length; i++){
			if (name == this.opts.items[i].name){
				pos = i;
				if (this.opts.items[i].refresh) refresh = true;
				break
			}
		}
		if (pos==-1){
			debug('Accordion():name=',name, 'not found in items',this.opts.items);
		}
		var c = objget(this.subcontents,name);
		if (refresh || ! c ){
			if (!this.opts.items[pos].content){
				console.log('***', pos, 'item dont has content');
				return;
			}
			c = await bricks.widgetBuild(this.opts.items[pos].content);
			this.subcontents[name] = c;
		}
		this.sub_container.clear_widgets();
		this.sub_container.add_widget(c);
		try {
			this.remove_widget(this.content);
		}
		catch(e){
			;
		}
		this.add_widget(this.content, pos+1);
	}
}

bricks.Factory.register('Accordion', bricks.Accordion);
var bricks = window.bricks || {};

bricks.SearchBar = class extends bricks.HBox {
	/*
	options:
	{
		placeholder: input placeholder text,
		value: initial keyword,
		width: component width,
		search_label: search button label,
		clear_label: clear button label,
		input_width: input width, default 100%
	}
	events:
		search: {keyword: string}
	*/
	constructor(opts){
		opts = opts || {};
		if (!opts.width){
			opts.width = '100%';
		}
		if (!opts.height){
			opts.height = 'auto';
		}
		super(opts);
		this.keyword = opts.value || '';
		this.set_style('alignItems', 'center');
		this.set_style('gap', opts.gap || '0.5rem');
		this.build_input();
		this.build_search_button();
		this.build_clear_button();
	}
	build_input(){
		var input_opts = {
			name:this.opts.name || 'keyword',
			value:this.keyword,
			placeholder:this.opts.placeholder || '',
			width:this.opts.input_width || '100%',
			css:this.opts.input_css || 'input',
			flexShrink:1
		};
		this.input_w = new bricks.UiStr(input_opts);
		this.input_w.set_style('minWidth', this.opts.input_min_width || '0');
		this.input_w.set_style('height', this.opts.input_height || 'auto');
		this.input_w.set_style('padding', this.opts.input_padding || '0.5rem');
		this.input_w.set_style('boxSizing', 'border-box');
		this.input_w.bind('changed', this.input_changed.bind(this));
		this.input_w.bind('blur', this.input_changed.bind(this));
		this.input_w.dom_element.addEventListener('keydown', this.keydown_handle.bind(this));
		this.add_widget(this.input_w);
	}
	build_search_button(){
		this.search_button = new bricks.Button({
			label:this.opts.search_label || 'Search',
			orientation:'horizontal',
			width:'auto',
			height:'auto',
			flexShrink:0
		});
		this.search_button.bind('click', this.do_search.bind(this));
		this.add_widget(this.search_button);
	}
	build_clear_button(){
		this.clear_button = new bricks.Button({
			label:this.opts.clear_label || 'Clear',
			orientation:'horizontal',
			width:'auto',
			height:'auto',
			flexShrink:0
		});
		this.clear_button.bind('click', this.clear_search.bind(this));
		this.add_widget(this.clear_button);
	}
	input_changed(event){
		var d = event.params || {};
		this.keyword = d[this.input_w.name] || '';
	}
	keydown_handle(event){
		if (event.key == 'Enter'){
			this.do_search(event);
		}
	}
	get_keyword(){
		this.keyword = this.input_w.resultValue() || '';
		return this.keyword;
	}
	set_keyword(keyword){
		this.keyword = keyword || '';
		this.input_w.setValue(this.keyword);
	}
	focus(){
		this.input_w.focus();
	}
	do_search(event){
		var keyword = this.get_keyword();
		this.dispatch('search', {keyword:keyword});
		if (event && event.stopPropagation){
			event.stopPropagation();
		}
	}
	clear_search(event){
		this.set_keyword('');
		this.dispatch('search', {keyword:''});
		if (event && event.stopPropagation){
			event.stopPropagation();
		}
	}
}

bricks.Factory.register('SearchBar', bricks.SearchBar);
var bricks = window.bricks || {};
bricks.DataViewer = class extends bricks.VBox {
	constructor(opts){
		opts.width = '100%';
		opts.height = '100%';
		opts.overflow = 'hidden';
		super(opts);
		this.loader = new bricks.PageDataLoader({
			url:this.opts.data_url,
			params:this.opts.data_params,
			pagerows:this.opts.page_rows,
			method:this.opts.data_method,
			cache_pages:this.opts.cache_limit
		});
		this.old_params = null;
		this.select_row = null;
		this.active_item = null;
		this.loading = false;
		this.data_offset = 0;
		this.search_keyword = this.get_initial_search_keyword();
		this.keyselectable = true;
		this.bind('row_check_changed', this.show_check_event_data.bind(this));
		schedule_once(this.build_all.bind(this), 0.1);
	}
	set_key_select_items(){
		if (!this.scrollpanel) return;
		var items = this.scrollpanel.children;
		this.key_select_items = items.filter(i => i != items[0]);
	}
	async build_all(){
		this.build_title_widget();
		this.build_description_widget();
		this.build_toolbar_widget();
		this.build_searchbar_widget();
		this.build_records_area();
		await this.build_other();
		this.check_changed_row = null;
		this.scrollpanel.bind('min_threshold', this.load_previous_page.bind(this));
		this.scrollpanel.bind('max_threshold', this.load_next_page.bind(this));
		await this.render();
		this.set_key_select_items();
		bricks.debug_obj = this.scrollpanel;
	}
	async build_other(){
	}
	async render(params) {
		params = this.merge_search_params(params || {});
		if (params == this.old_params){
			return;
		}
		this.old_params = params;
		bricks.debug('params=', params, 'render() called');
		var d = await this.loader.loadData(params);
		if (d){
			this.scrollpanel.clear_widgets();
			await this.before_data_handle();
			await this.dataHandle(d);
		} else {
			bricks.debug(params, 'load data return null');
		}
	}
	async before_data_handle(){
	}
	async dataHandle(d){
		var data = d.rows;
		var page = d.add_page;
		if (!data){
			return;
		}
		await this.renderPageData(data, page);
		if (d.delete_page){
			this.delete_page(d.delete_page);
		}
	}
	build_records_area(){
		this.filler_widget = new bricks.Filler({});
		this.add_widget(this.filler_widget)
		this.scrollpanel = new bricks.VScrollPanel({});
		this.filler_widget.add_widget(this.scrollpanel);
	}
	get_initial_search_keyword(){
		if (!this.searchable){
			return '';
		}
		if (this.search_value != null){
			return this.search_value;
		}
		if (typeof this.searchable == 'object' && this.searchable.value != null){
			return this.searchable.value;
		}
		return '';
	}
	build_searchbar_widget(){
		if (!this.searchable){
			return;
		}
		var opts = {};
		if (typeof this.searchable == 'object'){
			opts = bricks.extend(opts, this.searchable);
		}
		opts.width = opts.width || this.search_width || '100%';
		opts.placeholder = opts.placeholder || this.search_placeholder;
		opts.value = opts.value || this.search_value || this.search_keyword || '';
		opts.search_label = opts.search_label || this.search_label;
		opts.clear_label = opts.clear_label || this.clear_label;
		this.searchbar_w = new bricks.SearchBar(opts);
		this.searchbar_w.bind('search', this.search_event_handle.bind(this));
		this.add_widget(this.searchbar_w);
	}
	merge_search_params(params){
		var merged = bricks.extend({}, params || {});
		if (this.searchable){
			var search_param = this.search_param || 'keyword';
			if (this.search_keyword){
				merged[search_param] = this.search_keyword;
			} else {
				delete merged[search_param];
			}
		}
		/* data_filter: send the filter JSON + collected var values */
		if (this.opts.data_filter){
			merged['data_filter'] = JSON.stringify(this.opts.data_filter);
			var filter_values = this.filter_values || {};
			for (var k in filter_values){
				if (filter_values[k] !== '' && filter_values[k] !== null && filter_values[k] !== undefined){
					merged[k] = filter_values[k];
				}
			}
		}
		return merged;
	}
	async search_event_handle(event){
		var d = event.params || {};
		this.search_keyword = d.keyword || '';
		this.old_params = null;
		this.select_row = null;
		this.active_item = null;
		this.data_offset = 0;
		if (this.loader){
			this.loader.pages = [];
		}
		await this.render({});
	}
	async renderPageData(data, page){
		var pos;
		if (! this.loader.is_max_page(page)){
			data.reverse();
			pos = this.data_offset;
		} else {
			pos = null;
		}
		
		for(var i=0; i<data.length;i++){
			var rec = data[i];
			await this.build_row(rec, page, pos);
		}
	}
	async build_record_view(record){
		/* will be overwrite by subclass */
		var w = new bricks.VBox({width: '100px',height:'100px'});
		w.set_css('test_box');

		return w;
	}
	async build_row(record, page, pos){
		var r = await this.build_record_view(record);
		r.set_attribute('data-page', page);
		this.scrollpanel.add_widget(r, pos);
	}
	show_check_event_data(event){
		var d = event.params;
		console.log('row_check_changed event data=', d);
	}
	build_toolbar_widget(){
		var edit_names = [];
		var tbdesc = {
			width:'auto',
			tools:[]
		}
		if (this.editable){
			tbdesc.tools = [
				{
					name:'add',
					tip:'add new record',
					icon:this.editable.add_icon || bricks_resource('imgs/add.svg')
				},
				{
					name:'update',
					tip:'update selected record',
					selected_row:true,
					icon:this.editable.update_icon || bricks_resource('imgs/edit.svg')
				},
				{
					name:'clone',
					tip:'clone selected record',
					selected_row:true,
					icon:this.editable.clone_icon || bricks_resource('imgs/clone.svg')
				},
				{
					name:'delete',
					tip:'delete selected record',
					selected_row:true,
					icon:this.editable.delete_icon || bricks_resource('imgs/delete.svg')
				}
			];
			tbdesc.tools.forEach(t => {
				edit_names.push(t.name);
			});
		}
		/* data_filter: add search tool to toolbar */
		if (this.opts.data_filter){
			tbdesc.tools.push({
				name:'filter',
				label: this.opts.filter_label || '搜索',
				tip: 'filter records',
				icon: this.opts.filter_icon || bricks_resource('imgs/search.svg')
			});
		}
		if (this.toolbar){
			this.toolbar.tools.forEach(t => {
				if (! edit_names.includes(t.name) && t.name !== 'filter'){
					tbdesc.tools.push(t);
				}
			});
		}
		if (tbdesc.tools.length == 0){
			return;
		}
		this.toolbar_w = new bricks.IconTextBar(tbdesc);
		this.add_widget(this.toolbar_w);
		this.toolbar_w.bind('command', this.command_event_handle.bind(this));
	}
	async command_event_handle(event){
		var tdesc = event.params;
		if (tdesc.selected_row && ! this.select_row){
			bricks.show_error({title:'Error', message:'need select a row'});
			return;
		}
		if (tdesc.name == 'add'){
			await this.add_record();
			return;
		}
		if (tdesc.name == 'update'){
			await this.update_record(this.select_row);
			return;
		}
		if (tdesc.name == 'clone'){
			await this.clone_record(this.select_row);
			return;
		}
		if (tdesc.name == 'delete'){
			this.delete_record(this.select_row);
			return;
		}
		if (tdesc.name == 'filter'){
			await this.show_filter_form();
			return;
		}
		var data = null;
		if (this.select_row){
			var r = this.select_row;
			var data =  r.user_data;
		}
		console.log(tdesc.name, 'clicked ==================', tdesc.name, data)
		this.dispatch(tdesc.name, data);
	}
	/* Recursively extract {var, field, op} from data_filter JSON tree */
	get_filter_fields(){
		var fields = [];
		var self = this;
		var alters = (this.opts.browserfields && this.opts.browserfields.alters) || {};
		var labels = this.opts.filter_labels || {};

		function extract(node){
			if (!node || typeof node !== 'object') return;
			var keys = Object.keys(node);
			for (var i = 0; i < keys.length; i++){
				var key = keys[i];
				var val = node[key];
				if (key === 'AND' || key === 'OR'){
					if (Array.isArray(val)){
						val.forEach(extract);
					}
				} else if (key === 'NOT'){
					extract(val);
				} else if (key === 'field'){
					if (node.var){
						var alter = alters[node.field] || {};
						var f = {
							name: node.var,
							label: labels[node.var] || node.field,
							op: node.op || '='
						};
						if (alter.uitype === 'code'){
							f.uitype = 'code';
							if (alter.data && Array.isArray(alter.data)){
								f.data = alter.data;
							}
							if (alter.dataurl){
								f.dataurl = alter.dataurl;
								f.datamethod = alter.datamethod || 'GET';
								f.dataparams = alter.dataparams || {};
							}
							if (alter.data_field){
								f.data_field = alter.data_field;
							}
						}
						fields.push(f);
					}
					return;
				}
			}
		}
		extract(this.opts.data_filter);
		return fields;
	}
	async show_filter_form(){
		var fields = this.get_filter_fields();
		var submit_url = this.opts.data_url || '';
		var form_opts = {
			submit_url: '#',
			width: '100%',
			height: '100%',
			fields: fields
		};
		var form = new bricks.Form(form_opts);
		var popup = new bricks.PopupWindow({
			title: this.opts.filter_title || '搜索过滤',
			icon: bricks_resource('imgs/search.svg'),
			widget: this,
			archor: 'cc',
			movable: true,
			resizable: true,
			width: '50%',
			height: 'auto'
		});
		form.bind('cancel', popup.dismiss.bind(popup));
		form.bind('submited', this.filter_form_submited.bind(this, popup, form));
		popup.add_widget(form);
		popup.open();
	}
	async filter_form_submited(popup, form, event){
		popup.dismiss();
		this.filter_values = form._getValue();
		this.old_params = null;
		this.select_row = null;
		this.active_item = null;
		this.data_offset = 0;
		if (this.loader){
			this.loader.pages = [];
		}
		await this.render({});
	}
	get_edit_fields(){
		var fs = this.row_options.fields;
		this.fields = [];
		var exclouded = [];
		if (this.row_options.editexclouded){
			exclouded = this.row_options.editexclouded;
		}
		fs.forEach(f => {
			if (!exclouded.includes(f.name)){
				this.fields.push(f);
			}
		});
	}
	record_check_changed(event){
		this.check_changed_row = event.params;
		this.dispatch('row_check_changed', event.params.user_data);
	}
	async renew_record_view(form, row){
		var d = form._getValue();
		d = form._getValue();
		var record = bricks.extend(row.user_data, d);
		row.renew(record);
	}
	get_hidefields(){
		var fs = [];
		var params = this.data_params || {};
		for (var k in params){
			fs.push({name:k, value:params[k], uitype:'hide'});
		}
		return fs;
	}
	build_add_form(){
		var hidefields = [];
		var submit_url = this.editable.new_data_url;
		var opts= {
			submit_url: submit_url,
			width: '100%',
			height: '100%'
		};
		var fs = this.get_hidefields();
		for (var i=0;i<this.fields.length;i++){
			var f = bricks.extend({}, this.fields[i]);
			fs.push(f);
		}
		opts.fields = fs
		var formw = new bricks.Form(opts);
		return formw;
	}
	build_update_form(data){
		var hidefields = [];
		var submit_url = this.editable.update_data_url;
		var opts = {
			submit_url: submit_url,
			submit_changed:true,
			width: '100%',
			height: '100%'
		};
		var fs = this.get_hidefields();
		for (var i=0;i<this.fields.length;i++){
			var f = bricks.extend({}, this.fields[i]);
			f.value = data[f.name];
			fs.push(f);
		}
		fs.push({name:'id', value:data.id, uitype:'hide'})
		opts.fields = fs
		var formw = new bricks.Form(opts);
		return formw;
	}
	build_clone_form(data){
		var hidefields = [];
		var submit_url = this.editable.new_data_url;
		var opts = {
			submit_url: submit_url,
			width: '100%',
			height: '100%'
		};
		var fs = this.get_hidefields();
		for (var i=0;i<this.fields.length;i++){
			var f = bricks.extend({}, this.fields[i]);
			f.value = data[f.name];
			fs.push(f);
		}
		opts.fields = fs
		var formw = new bricks.Form(opts);
		return formw;
	}
	build_window(icon, title, form){
		var f = new bricks.PopupWindow({
				"title": title,
				"icon": icon,
				"widget":this,
				"archor":"cc",
				"movable":true,
				"resizable":true,
				"archor":"cc",
				"width":"90%",
				"height":"70%"
		});
		form.bind('cancel', f.dismiss.bind(f));
		f.add_widget(form);
		f.open();
		return f
	}
	async add_record(){
		var icon = bricks_resource('imgs/add.svg');
		var title = bricks.app.i18n._("Add record");
		var form = this.build_add_form();
		var win = this.build_window(icon, title, form);
		form.bind('submited', this.add_record_finish.bind(this, win));
	}
	async add_record_finish(f, event){
		f.dismiss();
		this.render();
		var resp = event.params;
		var desc = await resp.json();
		var w = await bricks.widgetBuild(desc);
	}
	async update_record(){
		var record = this.select_row.user_data;
		var icon = bricks_resource('imgs/edit.svg');
		var title = bricks.app.i18n._("Update record");
		var form = this.build_update_form(record);
		var win = this.build_window(icon, title, form);
		form.bind('submited', this.update_record_finish.bind(this, win, form));
	}
	async update_record_finish(win, form, event){
		await this.renew_record_view(form, this.select_row);
		var resp = event.params;
		var desc = await resp.json();
		var w = await bricks.widgetBuild(desc);
		w.open();
		win.dismiss();
	}
	async clone_record(){
		var record = this.select_row.user_data;
		var icon = bricks_resource('imgs/clone.svg');
		var title = bricks.app.i18n._("Clone record");
		var form = this.build_clone_form(record);
		var win = this.build_window(icon, title, form);
		form.bind('submited', this.add_record_finish.bind(this, win));
	}
	delete_record(row, record){
		var conform_w = new bricks.Conform({
			cwidth:16,
			cheight:9,
			target:this,
			title:'Delete conform',
			message:'Are you sure to delete is record?'
		});
		conform_w.bind('conformed', this.delete_record_act.bind(this, row, record));
		conform_w.bind('discard', conform_w.dismiss.bind(conform_w));
	}
	
	async delete_record_act(){
		var id = this.select_row.user_data.id;
		var url = this.editable.delete_data_url;
		var hc = new bricks.HttpJson();
		var desc = await hc.post(url, {
			params:this.select_row.user_data
		});
		var w = await bricks.widgetBuild(desc);
		if (desc.widgettype == 'Message'){
			this.scrollpanel.remove_widget(this.select_row);
			this.select_row = null;
			this.render();
		}
	}
	async load_previous_page(){
		// console.log('tabular:load_previous_page() called');
		if (this.loading){
			bricks.debug('this.loading is set, do not thing');
			return;
		}
		var running = new bricks.Running({target:this});
		this.loading = true;
		try {
			var d = await this.loader.loadPreviousPage();
			if (d){
				this.dataHandle(d);
				var total = this.scrollpanel.dom_element.scrollHeight - this.scrollpanel.dom_element.clientHeight;
				this.scrollpanel.dom_element.scrollTop = d.pos_rate * total;
			} else {
				bricks.debug(this.loader, 'load previous page error');
			}
		} catch (e) {
			bricks.debug('e=', e);
		}
		this.loading = false;
		running.dismiss();
	}
	async load_next_page(){
		// console.log('tabular:load_next_page() called');
		if (this.loading){
			bricks.debug('this.loading is set, do not thing');
			return;
		}
		var running = new bricks.Running({target:this});
		this.loading = true;
		try {
			var d = await this.loader.loadNextPage();
			if (d){
				this.dataHandle(d);
			//	var total = this.scrollpanel.dom_element.scrollHeight - this.scrollpanel.dom_element.clientHeight;
			//	this.scrollpanel.dom_element.scrollTop = d.pos_rate * total;
			} else {
				bricks.debug(this.loader, 'load next page error');
			}
		} catch (e){
			bricks.debug('error happened', e);
		}
		this.loading = false;
		running.dismiss();
		bricks.debug('load_next_page() finished');
	}
	delete_page(page){
		var items = this.dom_element.querySelectorAll('[data-page="' + page + '"]');
		for (var i=0;i<items.length;i++) {
			var w = items[i].bricks_widget;
			this.scrollpanel.remove_widget(w);
		}
	}
}

bricks.Factory.register('DataViewer', bricks.DataViewer);
var bricks = window.bricks || {};
bricks.TreeNode = class extends bricks.VBox {
	constructor(tree, pnode, data){
		var opts = {
			width:'100%',
			height:'auto',
		}
		super(opts);
		this.tree = tree;
		this.parent_node = pnode;
		this.children_loaded = false;
		this.user_data = data;
		this.setup_icon_urls()
		this.is_leaf_field = this.tree.is_leafField || 'is_leaf';
		this.is_leaf = this.user_data[this.is_leaf_field];
		this.params = bricks.extend({}, this.tree.params)
		this.params = bricks.extend(this.params, {id:this.user_data[this.tree.opts.idField]});
		if (this.tree.opts.typeField){
			this.params.type = this.user_data[this.tree.opts.typeField];
		}
		var n = new bricks.HBox({
				height:this.tree.row_height,
				width:'100%'
		})
		n.dom_element.style.margin = bricks.app.charsize * 0.2;
		this.add_widget(n);
		n.bind('click', this.tree.node_click_handle.bind(this.tree, this));
		this.node_widget = n;
		schedule_once(this.create_node_content.bind(this,n), 0.01);
		if (! this.user_data.is_leaf) {
			this.container = new bricks.VBox({height:'auto'});
			this.add_widget(this.container);
			this.container.dom_element.style.marginLeft = bricks.app.charsize + 'px';
			if (this.user_data.children){
				this.tree.create_node_children(this, this.user_data.children);
			}
			this.container.hide();
		}
	}
	getValue(){
		var v = this.user_data;
		if (this.container){
			var children = [];
			for (var i=0; i<this.container.children.length;i++){
				var sv = this.container.children[i].getValue();
				children.push(sv);
			}
			v.children = children;
		}
		return v;
	}
	get_id(){
		return this.user_data[this.tree.idField];
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
		this.node_state = 'open';
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
		this.node_state = 'close'
		if (this.is_leaf){
			return;
		}
		this.container.hide();
	}
	create_triple(){
		return new bricks.StatedSvg({
			state:'close',
			states:[
				{
					state: 'open',
					url: bricks_resource('imgs/node-expand.svg')
				},
				{
					state: 'close',
					url: bricks_resource('imgs/node-collapse.svg')
				}
			],
			rate: 1,
		});
	}
	change_node_type(){
		if (this.is_leaf){
			this.triple.set_state('close');
			this.triple.bind('state_changed', this.toggleExpandCollapse.bind(this));
			return;
			this.triple.set_url(null);
			this.triple.unbind('state_changed', this.toggleExpandCollapse.bind(this));
		} else {
			this.triple.set_state('close');
			this.triple.bind('state_changed', this.toggleExpandCollapse.bind(this));
		}
	}
	async create_node_content(widget){
		var img_size = bricks.app.charsize;
		this.triple = this.create_triple();
		widget.add_widget(this.triple);
		this.change_node_type();
		if (this.tree.checkField){
			var v = this.user_data[this.tree.checkField];
			this.check_w = new bricks.UiCheck({name:'check', value:v});
			widget.add_widget(this.check_w);
			this.check_w.bind('changed', this.tree.node_checked.bind(this.tree, this))
		}
		var icon_url;
		if ( isString(this.icons_urls)){
			icon_url = this.icons_urls;
		} else {
			icon_url = this.icons_urls.leaf;
			if (this.is_leaf) icon_url = this.icons_urls.leaf;
			else if (this.node_state == 'expand') this.icon_url = this.icons_urls.open;
			else this.icon_url = this.icons_urls.close;
		}
		console.log('icons=', this.icons_urls, 'icon_url=', icon_url, this.user_data);
		var img = new bricks.Svg({
			rate:1,
			url:icon_url
		});
		widget.add_widget(img);
		if (this.tree.node_view){
			this.view_w = await bricks.widgetBuild(this.tree.node_view, widget, this.user_data);
			if (this.view_w){
				widget.add_widget(this.view_w);
			}
		} else {
			var txt = this.user_data[this.tree.opts.textField];
			this.str_w = new bricks.Text({text:txt});
			widget.add_widget(this.str_w);
		}
	}
	async update_content(){
		if (this.tree.node_view){
			this.node_widget.remove_Widget(this.view_w);
			this.view_w = await bricks.widgetBuild(this.tree.node_view, widget, this.user_data);
			if (this.view_w){
				widget.add_widget(this.view_w);
			}
		}
		this.str_w.set_text(this.user_data[this.tree.opts.textField]);
	}
	setup_icon_urls(){
		var icons = null;
		if (this.tree.opts.typeField){
			var ntype = this.user_data[this.tree.opts.typeField];
			if (this.tree.node_typeicons){
				icons  = this.tree.node_typeicons[ntype];
				if (!icons){
					var dt = this.tree.node_typeicons.default_type;
					icons = this.tree.node_typeicons[dt];
				}
			}
			console.log('ntype=', ntype, 'icons=', icons, this.user_data, this.tree.opts.typeField);
		}
		if (! icons){
			icons = {
				open: bricks_resource('imgs/open-folders.svg'),
				close: bricks_resource('imgs/close-folder.svg'),
				leaf: bricks_resource('imgs/close-folder.svg')
			};
		}
		this.icons_urls = icons;
	}
}

bricks.Tree = class extends bricks.VScrollPanel {
	/*
	{
		row_height:
		idField:
		is_leafField:
		textField:
		type_icons:
		typeField:
		default_type:
		data:
		dataurl:
		node_typeicons:{
			nodetype:{
				open:url,
				close:url,
				leaf:url
			}
			default_type:
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
		this.row_height = this.opts.row_height || '35px';
		this.multitype_tree = this.opts.multitype_tree||false;
		this.selected_node = null;
		this.build_title();
		this.build_description();
		this.create_toolbar();
		this.checked_data = [];
		this.container = new bricks.VBox({
			"width":"100%",
			"height":"auto",
			"overflow":"auto"
		});
		this.add_widget(this.container);
		this.data_id = null;
		if (this.opts.dataurl){
			this.params = options.params || {};
			schedule_once(this.get_children_data.bind(this, this), 0.1);
		} else {
			this.user_data = {
				id:null,
				children:this.opts.data
			}
			this.create_node_children(this, this.opts.data);
		}
	}
	getValue(){
		var v = this.user_data;
		if (this.container){
			var children = [];
			for (var i=0; i<this.container.children.length;i++){
				var sv = this.container.children[i].getValue();
				children.push(sv);
			}
			v.children = children;
		}
		return v;
	}
	get_id(){
		return this.user_data[this.idField];
	}
	create_toolbar(){
		var toolbar = bricks.extend({}, this.toolbar);
		var tools = [];
		if (this.editable){
			tools.push({icon:bricks_resource('imgs/add.svg'), name:'add'});
			tools.push({icon:bricks_resource('imgs/edit.svg'), name:'update'});
			tools.push({icon:bricks_resource('imgs/delete.svg'), name:'delete'});
		}
		if (toolbar.tools){
			toolbar.tools.forEach(f => tools.push(f));
		}
		if (tools.length == 0){
			return;
		}
		toolbar.tools = tools;
		this.toolbar_w = new bricks.IconTextBar(toolbar);
		this.add_widget(this.toolbar_w);
		this.toolbar_w.bind('command', this.toolbar_command.bind(this))
	}
	toolbar_command(event){
		var opts = event.params;
		switch (opts.name){
			case 'add':
				this.add_new_node();
				break;
			case 'delete':
				this.delete_node();
				break;
			case 'update':
				this.update_node();
				break;
			default:
				if (opts.selected_data && ! this.selected_node){
					var w = new bricks.Error({title:'Error', message:'No selected node found'});
					w.open();
					return;
				}
				if (opts.checked_data && this.checked_data.length == 0){
					var w = new bricks.Error({title:'Error', message:'No checked node found'});
					w.open();
					return;
				}
				var d = {};
				if (opts.selected_data){
					d = this.selected_node.user_data;
				} else if (opts.checked_data){
					d = this.checked_data;
				} else {
					if (this.selected_node){
						d = this.selected_node.user_data;
					} else if (this.checked_data.length>0) {
						d = this.checked_data[0];
					} else {
						d = this.opts.params;
					}
				}
				d.meta_data = {
					referer: this.id,
					title: opts.label,
					icon: opts.icon
				}
				this.dispatch(opts.name, d);
				break;
		}
	}
	async add_new_node(){
		var w = new bricks.ModalForm({
			target:this,
			"width":"80%",
			"height":"80%",
			title:'add new node',
			fields:this.editable.fields
		});
		w.bind('submit', this.new_node_inputed.bind(this))
	}
	
	async new_node_inputed(event){
		var d = event.params;
		var node = this;
		if (this.selected_node){
			console.log('selected node exists')
			node = this.selected_node;
			if (d instanceof FormData){
				d.append(this.parentField, node.get_id());
			} else {
				d[this.parentField] = node.get_id();
			}
		} else if (this.opts.params) {
			if (d instanceof FormData){
				d.append(this.parentField, this.opts.params.id);
			} else {
				d[this.parentField] = this.opts.params.id;
			}
		}
		if (this.opts.newdata_params){
			for (const [k, v] of Object.entries(this.opts.newdata_params)){
				if (d instanceof FormData){
					d.append(k, v);
				} else {
					d[k] = v;
				}
			}
		}
		if (this.editable.add_url){
			var jc = new bricks.HttpJson()
			var desc = await jc.post(this.editable.add_url, {params:d});
			if (desc.widgettype == 'Message'){
				var data = desc.options.user_data;
				this.append_new_subnode(node, data);
				node.is_leaf = false;
				if (node != this) node.change_node_type();
			}
			var w = await bricks.widgetBuild(desc, this);
			w.open();
		} else {
			d[this.idField] = bricks.uuid();
			this.append_new_subnode(node, d);
		}
	}
	async create_tree_nodes(node, records){
		for (var i=0;i<records.length;i++){
			this.build_subnode(node, records[i]);
		}
	}
	append_new_subnode(node, data){
		data.is_left = true;
		if (!node.user_data){
			node.user_data = {};
		}
		if (!node.user_data.children){
			node.user_data.children = [];
		}
		node.is_leaf = false;
		node.children_loaded = true;
		node.user_data.children.push(data)
		this.build_subnode(node, data);
	}

	build_subnode(node, data){
		var n = new bricks.TreeNode(this, node, data);
		node.container.add_widget(n);
	}

	async delete_node(){
		if (! this.selected_node){
			w = new bricks.Error({title:'Delete', message:'No selected node found'});
			w.open();
			return;
		}
		var w = new bricks.Conform({
			cwidth:16,
			cheight:9,
			title:'Delete node',
			message:'Please conform delete selected node'
		});
		w.bind('conformed', this.delete_node_conformed.bind(this))
	}
	async delete_node_conformed(event){
		if (this.editable.delete_url){
			var jc = new bricks.HttpJson()
			var desc = await jc.post(this.editable.delete_url, {params:this.selected_node.user_data});
			if (desc.widgettype == 'Message'){
				var pnode = this.selected_node.parent_node;
				console.log('parent node=', pnode);
				if (pnode && pnode.container){
					pnode.container.remove_widget(this.selected_node);
				}
				this.selected_node = null;
			}
			var w = await bricks.widgetBuild(desc, this);
			w.open();
		} else {
			var pnode = this.selected_node.parent_node;
			if (pnode && pnode.container){
				pnode.container.remove_widget(this.selected_node);
			}
			this.selected_node = null;
		}
	}
	delete_subnode(node, subnode){
		var subid = subnode.user_data[this.idField];
		var children = [];
		for (var i=0;i< node.user_data.children.length;i++){
			var c = node.user_data.children[i];
			if (c[this.idField] != subid){
				children.push(c);
			}
		}
		node.user_data.children = children;
		node.container.remove_widget(subnode);
	}

	async update_node(){
		if (! this.selected_node){
			w = new bricks.Error({title:'Update', message:'No selected node found'});
			w.open();
			return;
		}
		var fields = [];
		for (var i=0;i<this.editable.fields.length;i++){
			var f = bricks.extend({}, this.editable.fields[i]);
			f.value = this.selected_node.user_data[f.name];
			fields.push(f);
		}
		var w = new bricks.ModalForm({
			target:this,
			"width":"80%",
			"height":"80%",
			title:'add new node',
			fields:fields
		});
		w.bind('submit', this.update_node_inputed.bind(this))
	}

	async update_node_inputed(event){
		var d = event.params;
		var node = this.selected_node;
		if (d instanceof FormData){
			d.append(this.idField, node.get_id());
		} else {
			d[this.idField] = node.get_id();
		}
		if(this.editable.update_url){
			var jc = new bricks.HttpJson()
			var desc = await jc.post(this.editable.update_url, {params:d});
			if (desc.widgettype == 'Message'){
				var o = formdata2object(d);
				await this.update_node_data(node, o);
			}
			var w = await bricks.widgetBuild(desc, this);
			w.open();
		} else {
			var o = formdata2object(d);
			await this.update_node_data(node, o);
		}
	}
	
	async update_node_data(node, data){
		var data_keys = Object.keys(node.user_data);
		Object.keys(data).forEach(k => {
			if (data_keys.includes(k)){
				console.log(node.user_data[k], ':', k, ':', data[k]);
				node.user_data[k] = data[k];
			}
		});
		await node.update_content();
	}

	async get_children_data(node){
		var jc = new bricks.HttpJson();
		var p = bricks.extend({}, this.params);
		if (node != this){
			p.id = node.user_data[this.idField];
		}
		console.log('params=', p);
		var d = await jc.httpcall(this.opts.dataurl,{
				method : this.opts.method || 'GET',
				params : p
			})
		if (d.length == 0){
			node.is_leaf = true;
		} else {
			this.user_data = {
				children:d
			}
			this.create_tree_nodes(node, d);
		}
	}
	create_node_children(node, data){
		if(!data) return;
		for (var i=0; i<data.length; i++){
			var n = new bricks.TreeNode(this, node, data[i]);
			node.container.add_widget(n);
		}
	}
	node_click_handle(node, event){
		if (this.selected_node){
			this.node_selected(this.selected_node, false);
		}
		if (this.selected_node == node){
			this.selected_node = null;
		} else {
			this.selected_node = node;
			this.node_selected(node, true);
		}
	}
	node_selected(node, flag){
		console.log('node_selected():node=', node, flag);
		node.selected(flag);
		var d = bricks.extend(node.user_data, {
			selected:flag
		});

		this.dispatch('node_selected', d);
	}
	async node_checked(node, event){
		var cb = event.target.bricks_widget;
		var stat = cb.getValue().check;
		if (stat){
			this.checked_data.push(node.user_data);
		} else {
			this.checked_data = this.checked_data.filter((d , idnex) => d.id == node.user_data.id);
		}
		node.user_data[this.checkField] = stat;
		if (stat){
			console.log('value=', cb.getValue(), 'node=', node);
		}
		this.dispatch('check_changed', node.user_data);
	}
}

bricks.Factory.register('Tree', bricks.Tree);
bricks.Factory.register('EditableTree', bricks.EditableTree);
var bricks = window.bricks || {};
bricks.MultipleStateImage = class extends bricks.Layout {
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
		this.img = new bricks.Image(desc);
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

bricks.Factory.register('MultipleStateImage', bricks.MultipleStateImage);

var bricks = window.bricks || {};

bricks.DynamicColumn = class extends bricks.Layout {
	/*
	{
		mobile_cols:
		col_cwidth:
		col_cgap:
		col_width:
	}
	*/
	constructor(opts){
		if (! opts.col_cwidth){
			if(! opts.col_width){
				opts.col_cwidth = 20;
			}
		}
		opts.col_cgap = opts.col_cgap || 0.5;
		opts.mobile_cols = opts.mobile_cols|| 1;
		super(opts);
		this.set_style('display', 'grid');
		// this.set_column_width();
		this.bind('on_parent', this.set_column_width.bind(this));
		this.bind('resize', this.set_column_width.bind(this));
		if (this.cwidth){
			bricks.app.bind('charsize', this.set_column_width.bind(this));
		}
	}
	set_column_width(){
		var cw;
		var cols;
		var gap;
		gap = bricks.app.charsize * (this.col_cgap || 0.1);
		var width = bricks.app.screenWidth();
		var height = bricks.app.screenHeight();
		if (bricks.is_mobile() && width < height){
			cols = this.mobile_cols;
			cw = (width - (cols - 1) * gap) / cols;
			console.log('====mobile==cols=', cols, '====');
		} else {
			if (this.col_cwidth){
				cw = bricks.app.charsize * this.col_cwidth;
			} else {
				cw = this.col_width;
			}
		}
		this.dom_element.style.gridTemplateColumns = "repeat(auto-fill, minmax(" + cw + "px, 1fr))";
		this.set_style('gap', gap + 'px');
	}
}

bricks.Factory.register('DynamicColumn', bricks.DynamicColumn);
var bricks = window.bricks || {};

bricks.need_formdata_fields = ['file', 'video', 'audio'];

bricks.show_resp_message_or_error = async function(resp){
	var desc = await resp.json();
	await bricks.widgetBuild(desc, bricks.Body);
}

bricks.FieldGroup = class {
	constructor(opts){
		this.opts = opts
	}
	build_fields(form, parent, fields){
		var dc = new bricks.DynamicColumn({mobile_cols:2});
		for (var i=0;i<fields.length;i++){
			if (fields[i].uitype == 'group'){
				if (dc.children.length>0){
					parent.add_widget(dc);
					dc = new bricks.DynamicColumn({mobile_cols:2});
				}
				this.build_fields(form, dc, fields[i].fields);
				parent.add_widget(dc);
				dc = new bricks.DynamicColumn({mobile_cols:2});
				dc.set_id(fields[i].name+'_box');
				if (fields[i].nonuse){
					dc.disabled(true);
					dc.hide();
				}
			} else {
				var box;
				if (! form.opts.input_layout || form.opts.input_layout == 'VBox'){
					box = new bricks.VBox({height:'auto',overflow:'none'});
				} else {
					box = new bricks.HBox({height:'auto',overflow:'none'});
				}
				box.set_css('inputbox');
				if (fields[i].uitype !== 'hide'){
					dc.add_widget(box);
				}
				if(bricks.need_formdata_fields.includes(fields[i].uitype)){
					form.need_formdata = true;
				}
				var txt = new bricks.Text({
						otext:fields[i].label||fields[i].name, 
						dynsize:true,
						height:'auto',
						i18n:true});
				box.add_widget(txt);
				box.set_id(fields[i].name + '_box')
				if (fields[i].nonuse){
					box.disabled(true);
					box.hide();
				}
				var w = Input.factory(fields[i]);
				if (w){
					box.add_widget(w);
					form.name_inputs[fields[i].name] = w;
					w.set_id(fields[i].name);
				} else {
					bricks.debug(fields[i], 'createInput failed');
				}
			}
		}
		if (dc.children.length > 0){
			parent.add_widget(dc);
		}
	}
}
bricks.FormBody = class extends bricks.VScrollPanel {
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
		exclusionfields:[
			[a,b,c], # a,b,c互斥，a enabled，b,c必须disabled
			[x,y]		# x,y互斥
		]
	}
	*/
	constructor(form, opts){
		opts.width = '100%';
		opts.height = '100%';
		super(opts);
		this.form = form;
		this.name_inputs = {};
		this.fg = new bricks.FieldGroup({});
		this.fg.build_fields(form, this, form.nontextfields);
		this.build_text_fields();
	}
	build_text_fields(){
		this.form.textfields.forEach((f) => {
			var labelw = new bricks.Text({
				cheight: 2,
				otext: f.label || f.name,
				i18n: true
			});
			var txtw = new bricks.UiText({
				name:f.name,
				css: "filler",
				value:f.value
			});
			var cell = new bricks.VBox({
				css: "inputbox",
				width: "100%",
				height: "45%"
			});
			cell.add_widget(labelw);
			cell.add_widget(txtw);
			this.add_widget(cell);
			this.form.name_inputs[f.name] = txtw;
			cell.set_id(f.name);
		});
	}
	create(){
		this.dom_element = this._create('form');
	}
}

/*
submit_changed: false
fields
submit_url
*/
bricks.FormBase = class extends bricks.Layout {
	constructor(opts){
		super(opts);
		this.name_inputs = {};
	}
	build_toolbar(widget){
		var box = new bricks.HBox({height:'auto', width:'100%'});
		widget.add_widget(box);
		var tools = [
			{
				icon:bricks_resource('imgs/submit.svg'),
				name:'submit',
				css:'submit_btn',
				label:'Submit'
			},
			{
				icon:bricks_resource('imgs/reset.svg'),
				name:'reset',
				css:'reset_btn',
				label:'Reset'
			},
			{
				icon:bricks_resource('imgs/cancel.svg'),
				name:'cancel',
				css:'clear_btn',
				label:'Cancel'
			}
		]
		var tb_desc={};
		var names = [ 'submit', 'reset', 'cancel' ];
		if (this.toolbar){
			tb_desc = bricks.extend(tb_desc, this.toolbar);
			tb_desc.tools = tools;
			tools.forEach(t => {
				if (! names.includes(t.name)) {
					tb_desc.tools.push(t);
				}
			});
			this.toolbar.tools.forEach(t => {
				if (! names.includes(t.name)) {
					tb_desc.tools.push(t);
				}
			});
		} else {
			tb_desc = {
				width:"auto",
				tools:tools
			};
		}
		var tbw = new bricks.IconTextBar(tb_desc);
		tbw.bind('command', this.command_handle.bind(this));
		box.add_widget(new bricks.Filler());
		box.add_widget(tbw);
		box.add_widget(new bricks.Filler());
	}
	command_handle(event){
		var params = event.params;
		bricks.debug('Form(): click_handle() params=', params);
		if (!params){
			error('click_handle() get a null params');
			return
		}
		if (params.name == 'submit'){
			this.validation();
		} else if (params.name == 'cancel'){
			this.cancel();
		} else if (params.name == 'reset'){
			this.reset_data();
		} else {
			if (params.action){
				var f = bricks.buildEventHandler(this, params);
				if (f) f(event);
			} else {
				this.dispatch(params.name);
			}
		}
	}
	cancel(){
		this.dispatch('cancel');
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
	_getValue(){
		var data = {};
		for (var name in this.name_inputs){
			if (! this.name_inputs.hasOwnProperty(name)){
				continue;
			}

			var w = this.name_inputs[name];
			var d = w.getValue();
			if (w.required && ( d[name] == '' || d[name] === null)){
				bricks.debug('data=', data, 'd=', d);
				new bricks.Error({title:'Requirement', message:'required field must input"' + w.label + '"'})
				w.focus();
				return;
			}
			bricks.extend(data, d);
		}
		return data;
	}
	getValue(){
		if (this.data) {
			var ret = this.data;
			this.data = null;
			return ret;
		}
		return this.get_formdata();
	}
	toggle_disable(field_name, flg){
		var w = bricks.getWidgetById(field_name + '_box', this);
		if (! w) return;
		w.disabled(flg);
		if (flg) w.hide();
		else w.show();
		if (flg) return;
		this.exclusionfields.forEach(arr =>{
			if (arr.include(field_name)){
				arr.forEach(x => {
					if (x!=field_name){
						var w1 = bricks.getWidgetById(x + '_box', this);
						if (w1) {
							w1.disabled(true);
							w1.hide();
						}
					}
				});
			}
		});
	}
	enable_field(field_name){
		this.toggle_disable(field_name, false);
	}
	disable_field(field_name){
		this.toggle_disable(field_name, true);
	}
	get_formdata(){
		var data = new FormData();
		var changed = false;
		for (var name in this.name_inputs){
			if (! this.name_inputs.hasOwnProperty(name)){
				continue;
			}
			var w = this.name_inputs[name];
			if (w.parent.is_disabled()) continue;
			var d = w.getValue();
			if (w.required && ( d[name] == '' || d[name] === null)){
				new bricks.Error({title:'Requirement', message:'required field must input"' + w.label + '"'})
				w.focus();
				return;
			}
			if (d[name] === null){
				continue;
			}
			if (this.submit_changed){
				if (name != 'id' && this.origin_data[name] == d[name]){
					continue;
				}
			}
			w.set_formdata(data);
			changed = true;
		}
		this.data = data;
		if (changed){
			return data;
		}
		return null
	}
	async validation(){
		var running = new bricks.Running({target:this});
		try {
			var data;
			data = this.get_formdata();
			if (! data) {
				running.dismiss();
				return;
			}
			// data = bricks.delete_null_values(data);
			this.dispatch('submit', data);
			if (this.submit_url){
				var rc = new bricks.HttpResponse();
				var resp = await rc.httpcall(this.submit_url,
							{
								method:this.method || 'POST',
								params:data
							});
				this.dispatch('submited', resp);
			}
		} catch (e){
			console.log('form submit error', e);
		}
		running.dismiss();
	}
	save_origin_data(){
		this.origin_data = {};
		for (var name in this.name_inputs){
			var w = this.name_inputs[name];
			var d = w.getValue();
			this.origin_data[name] = d[name];
		}
	}
}

bricks.InlineForm = class extends bricks.FormBase {
	constructor(opts){
		opts.height = "100%";
		opts.width = "100%";
		opts.overflow = "auto";
		super(opts);
		this.fg = new bricks.FieldGroup({});
		this.fg.build_fields(this, this, this.opts.fields)
		this.build_toolbar(this.children[0]);
		this.save_origin_data();
	}
}

bricks.Form = class extends bricks.FormBase {
	/*
	{
		title:
		description:
		notoolbar:False,
		input_layout:"VBox" or "HBox", default is "VBox",
		cols:
		dataurl:
		toolbar:
		submit_url:
		method:
		exclussionfields:[
			[a,b,c],
			[x,y]
		]
		fields
	}
	field {
		name:
		label:
		uitype:
		nonuse:	# 不使用
		...
	}
	*/
	constructor(opts){
		opts.height = "100%";
		opts.width = "100%";
		opts.overflow = "auto";
		super(opts);
		this.need_formdata = false;
		if (this.opts.title){
			var t = new bricks.Title3({
					otext:this.opts.title,
					height:'auto',
					i18n:true});
			this.add_widget(t, 0);
		}
		if (this.opts.description){
			var d = new bricks.Text({
					otext:this.opts.description,
					height:'auto',
					i18n:true});
			this.add_widget(d);
		}
		this.set_css('vcontainer');
		var filler = new bricks.Filler({});
		this.add_widget(filler);
		this.nontextfields = [];
		this.textfields = [];
		this.fields.forEach((f) => {
			if (f.uitype == 'text'){
				this.textfields.push(f);
			} else {
				this.nontextfields.push(f);
			}
		});
		this.body = new bricks.FormBody(this, opts);
		filler.add_widget(this.body);
		if (! opts.notoolbar)
			this.build_toolbar(this);
		this.save_origin_data();
	}
}

bricks.Factory.register('InlineForm', bricks.InlineForm);
bricks.Factory.register('Form', bricks.Form);
var bricks = window.bricks || {};

bricks.Message = class extends bricks.PopupWindow {
	/* 
	{
		title:
		message:
	}
	*/
	constructor(opts){
		opts.auto_open = true;
		super(opts);
		this.create_message_widget();
		this.set_css('message');
	}
	create_message_widget(){
		var w = new bricks.Filler();
		this.add_widget(w);
		var w1 = new bricks.VScrollPanel({});
		w.add_widget(w1);
		var t = new bricks.Text({otext:this.opts.message,
					wrap:true,
					halign:'middle',
					i18n:true});
		w1.add_widget(t);
	}
}

bricks.Error = class extends bricks.Message {
	constructor(opts){
		super(opts);
		this.set_css('error');
	}
}

bricks.show_error = function(opts){
	opts.cheight = opts.cheight || 9;
	opts.cwidth = opts.cwidth || 16;
	var w = new bricks.Error(opts);
	w.open();
}

bricks.show_message = function(opts){
	opts.cheight = opts.cheight || 9;
	opts.cwidth = opts.cwidth || 16;
	var w = new bricks.Message(opts);
	w.open();
}

bricks.Factory.register('Message', bricks.Message);
bricks.Factory.register('Error', bricks.Error);
var bricks = window.bricks || {};
bricks.Conform = class extends bricks.PopupWindow {
	constructor(opts){
		opts.timeout = 0;
		opts.auto_open = true;
		super(opts);
		this.create_conform();
	}
	create_conform(){
		var w = new bricks.VBox({width:'100%', height: '100%'});
		this.create_message(w);
		this.create_toolbar(w);
		this.add_widget(w);
	}
	create_message(widget){
		var w = new bricks.Filler();
		widget.add_widget(w);
		var w1 = new bricks.VScrollPanel({});
		w.add_widget(w1);
		var t = new bricks.Text({otext:this.opts.message,
					wrap:true,
					halign:'middle',
					i18n:true});
		w1.add_widget(t);
	}
	create_toolbar(widget){
		var desc = {
			tools:[
				bricks.extend({
					"name":"conform",
					"icon":bricks_resource('imgs/conform.svg'),
					"label":'Conform'
				}, this.opts.conform||{}),
				bricks.extend({
					"name":"discard",
					"icon":bricks_resource('imgs/cancel.svg'),
					"label":"Discard"
				}, this.opts.discard||{})
			]
		}
		var w = new bricks.IconTextBar(desc);
		w.bind('conform', this.conform_hndl.bind(this));
		w.bind('discard', this.discard_hndl.bind(this));
		if (!w) return;
		widget.add_widget(w);
	}
	conform_hndl(event){
		this.dismiss();
		this.dispatch('conformed');
	}
	discard_hndl(event){
		this.dismiss();
		this.dispatch('cancelled');
	}
}

bricks.Factory.register('Conform', bricks.Conform);

var bricks = window.bricks || {};
bricks.BufferedDataLoader = class {
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
		var p = objcopy(this.params);
		bricks.extend(p, params);
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
		var params = objcopy(this.cur_params);
		params.page = this.cur_page;
		params.rows = this.pagerows;
		var jc = new bricks.HttpJson();
		var d = await jc.httpcall(this.url, {
					method:this.method,
					params:params});
		this.total_records = d.total;
		d.page = this.cur_page;
		d.total_page = this.total_records / this.pagerows;
		if (d.total_page * this.pagerows < this.total_record){
			d.total_page += 1;
		}
		this.total_page = d.total_page;
		this.widget.add_rows(d.rows, this.direction);
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
var bricks = window.bricks || {};
bricks.Row = class {
	constructor(dg, rec) {
		this.dg = dg;
		this.data = objcopy(rec);
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
			bricks.extend(opts, {
				name: f.name,
				label: f.label,
				uitype: f.uitype,
				width: f.width,
				required: true,
				row_data: objcopy(this.data),
				readonly: true
			});
			if (opts.uitype == 'button') {
				opts.icon = f.icon;
				opts.action = f.action;
				opts.action.params = objcopy(this.data);
				opts.action.params.row = this;
				w = new bricks.Button(opts);
				w.bind('click', this.button_click.bind(w))
			} else {
				w = bricks.viewFactory(opts, this.data);
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
			var row = new bricks.HBox({ height: 'auto' })
			for (var i = 0; i < cols.length; i++) {
				row.add_widget(cols[i]);
			}
			return row;
		}
		return null;
	}
	button_click(event){
		this.getValue=function(){
			return this.desc_dic.row_data;
		}
		var desc = this.desc_dic.action;
		desc.datawidget = this;
		desc.datamethod = 'getValue';
		var f = universal_handler(this, this.rowObj, desc);
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

bricks.DataGrid = class extends bricks.VBox {
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
			this.title_bar = new bricks.HBox({ height: 'auto' });
			this.add_widget(this.title_bar);
			var tw = new bricks.Title1({ otext: this.title, i18n: true });
			this.title_bar.add_widget(tw);
		}
		if (this.description) {
			this.descbar = new bricks.HBox({ height: 'auto' });
			this.add_widget(this.descbar);
			var dw = new bricks.Text({ otext: this.description, i18n: true });
			this.descbar.add_widget(dw);
		}
		
		if (this.opts.miniform || this.opts.toolbar){
			this.admin_bar = new bricks.HBox({height:'auto'});
		}
		if (this.opts.miniform){
			this.miniform = new bricks.MiniForm(this.opts.miniform);
			this.miniform.bind('input', this.miniform_input.bind(this));
			this.admin_bar.add_widget(this.miniform);
		}
		if (this.opts.toolbar) {
			this.admin_bar.add_widget(new bricks.Filler({}));
			this.toolbar = new bricks.Toolbar(this.opts.toolbar);
			this.toolbar.bind('command', this.command_handle.bind(this));
			this.admin_bar.add_widget(this.toolbar);
		}
		this.create_parts();
		if (this.show_info) {
			this.infow = new bricks.HBox({ height: '40px' });
			this.add_widget(this.infow);
		}
		if (this.dataurl) {
			this.loader = new bricks.BufferedDataLoader(this, {
				pagerows: 80,
				buffer_pages: 5,
				url: bricks.absurl(this.dataurl, this),
				method: this.method,
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
		if (! direction) direction = 'down';
		var index = null;
		if (direction == 'down') {
			index = 0
		}

		for (var i = 0; i < records.length; i++) {
			this.add_row(records[i], index);
		}
	}
	add_row(data, index) {
		var row = new bricks.Row(this, data);
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
		var hbox = new bricks.HBox({});
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
		bricks.debug('width=', this.freeze_width, '-', this.normal_width, '...');
		if (this.freeze_fields.length > 0) {
			this.freeze_part = new bricks.VBox({});
			this.freeze_part.set_css('datagrid-left');
			this.freeze_part.set_style('width', this.freeze_width + 'px');
			this.freeze_header = new bricks.HBox({ height: this.row_height + 'px', width: this.freeze_width + 'px'});
			this.freeze_body = new bricks.VScrollPanel({ height: "100%", 
									width: this.freeze_width + 'px' })
			this.freeze_body.set_css('datagrid-body');
			this.freeze_body.bind('scroll', this.coscroll.bind(this));
		}
		if (this.normal_fields.length > 0) {
			this.normal_part = new bricks.VBox({ 
				width: this.normal_width + 'px',
				height:'100%',
				csses:"hscroll"
			});
			this.normal_part.set_css('datagrid-right');
			this.normal_header = new bricks.HBox({ height: this.row_height + 'px', width: this.normal_width + 'px'});
			// this.normal_header.set_css('datagrid-row');
			this.normal_body = new bricks.VScrollPanel({ 
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
		bricks.debug('event min_threshold fired ........');
		this.loader.previousPage();
	}
	load_next_data() {
		bricks.debug('event max_threshold fired ........');
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
			var t = new bricks.Text({
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
			var t = new bricks.Text({
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
		bricks.debug('DataGrid():click_handler, row=', row, 'event=', event);
	}
}

bricks.Factory.register('DataGrid', bricks.DataGrid);
var bricks = window.bricks || {};
bricks.Iframe = class extends bricks.Layout {
	constructor(opts){
		opts.height = opts.height || '100%';
		super(opts);
		this.dom_element.src = opts.url;
	}
	create(){
		this.dom_element = document.createElement('iframe');
	}
}

bricks.NewWindow = class extends bricks.JsWidget {
	constructor(opts){
		super(opts);
		window.open(opts.url, opts.name || '_blank');
	}
}

bricks.Factory.register('NewWindow', bricks.NewWindow);
bricks.Factory.register('Iframe', bricks.Iframe);
bricks = window.bricks || {}

bricks.Cols = class extends bricks.VBox {
	/*
	{
		data_url:
		data_params:
		data_method:
		col_width:
		col_cwidth:
		record_view:{
		}
	}
	event:
		record_click
	*/
	constructor(opts){
		super(opts);
		this.loading = false;
		this.loader = new bricks.PageDataLoader({
			url:this.opts.data_url,
			params:this.opts.data_params,
			pagerows:this.opts.page_rows,
			method:this.opts.data_method,
			cache_pages:this.opts.cache_limit
		});
		this.select_record = null;
		this.container = new bricks.VScrollPanel({width:"100%"});
		this.container.set_css('filler');
		this.container.bind('min_threshold', this.load_previous_page.bind(this));
		this.container.bind('max_threshold', this.load_next_page.bind(this));
		if (this.title){
			this.title_w = new bricks.Title4({
				i18n:true,
				otext:this.title,
				dynsize:true
			});
			this.add_widget(this.title_w);
		}
		if (this.description){
			this.desc_w = new bricks.MdWidget({mdtext:this.description});
			this.add_widget(this.desc_w);
		}
		if (this.toolbar){
			this.toolbar_w = new bricks.Toolbar(this.toolbar);
			this.add_widget(this.toolbar_w);
			this.toolbar_w.bind('command', this.command_handle.bind(this));
		}
		this.add_widget(this.container);
		this.create_main_widget();
		schedule_once(this.load_first_page.bind(this), 0.5);
	}
	command_handle(event){
		var params = event.params;
		this.dispatch(params.name);
	}

	async handle_click(rw, event){
		event.stopPropagation();
		var orev = null;
		if (this.select_record){
			orev = this.select_record;
			this.select_record.set_css('selected_record', true);
			this.select_record = null;
			if (rw == orev) return;
		}
		this.select_record = rw;
		this.select_record.set_css('selected_record');
		console.log('record data=', rw.user_data);
		this.dispatch('record_click', rw.user_data);
	}

	async dataHandle(d){
		var data = d.rows;
		var page = d.add_page;
		if (!data){
			return;
		}
		var rev = ! this.loader.is_max_page(page);
		if (rev){
			data.reverse();
		}
		for (var i=0;i<data.length;i++){
			var r = data[i];
			var w = await bricks.widgetBuild(this.record_view, this.main, r);
			w.user_data = r;
			w.bind('click', this.handle_click.bind(this, w));
			w.set_attribute('data-page', page);
			if (rev){
				this.main.add_widget(w, 0);
			} else {
				this.main.add_widget(w);
			}
		}
		if (d.delete_page){
			this.delete_page(d.delete_page);
		}
	}
	delete_page(page){
		var items = this.dom_element.querySelectorAll('[data-page="' + page + '"]');
		for (var i=0;i<items.length;i++) {
			var w = items[i].bricks_widget;
			this.main.remove_widget(w);
		}
	}
	create_main_widget(){
		this.container.clear_widgets();
		this.main = new bricks.DynamicColumn({
			width:"100%", 
			col_cwidth:this.col_cwidth,
			mobile_cols:this.mobile_cols || 2
		});
		this.container.add_widget(this.main);
	}
	async show_with_data(data){
		this.data = data;
		this.data_url = null;
		await load_first_page(params);
	}
	async load_first_page(params){
		var running = null;
		try {
			var d;
			running = new bricks.Running({target:this});
			if (this.data_url){
				if (this.loading){
					bricks.debug('this.loading is set, do not thing');
					throw 't';
				}
				this.loading = true;
				var p = bricks.extend({}, this.data_params);
				if (params){
					p = bricks.extend(p, params);
				}
				var d = await this.loader.loadData(p);
			} else {
				if (this.data) {
					d = this.data;
				}
			}
			if (d){
				this.main.clear_widgets();
				this.dataHandle(d);
				var total = this.container.dom_element.scrollHeight - this.container.dom_element.clientHeight;
				// this.container.dom_element.scrollTop = d.pos_rate * total;
			} else {
				bricks.debug(this.loader, 'data is null');
			}
		} catch (e) {
			bricks.debug('e=', e);
		}
		this.loading = false;
		if (running) running.dismiss();
	}

	async load_previous_page(){
		if(! this.data_url) return;
		if (this.loading){
			bricks.debug('this.loading is set, do not thing');
			return;
		}
		var running = new bricks.Running({target:this});
		this.loading = true;
		try {
			var d = await this.loader.loadPreviousPage();
			if (d){
				this.dataHandle(d);
				var total = this.container.dom_element.scrollHeight - this.container.dom_element.clientHeight;
				this.container.dom_element.scrollTop = d.pos_rate * total;
			} else {
				bricks.debug(this.loader, 'load previous page error');
			}
		} catch (e) {
			bricks.debug('e=', e);
		}
		this.loading = false;
		running.dismiss();
	}
	async load_next_page(){
		if(! this.data_url) return;
		if (this.loading){
			bricks.debug('this.loading is set, do not thing');
			return;
		}
		var running = new bricks.Running({target:this});
		this.loading = true;
		try {
			var d = await this.loader.loadNextPage();
			if (d){
				this.dataHandle(d);
				var total = this.container.dom_element.scrollHeight - this.container.dom_element.clientHeight;
				// this.container.dom_element.scrollTop = d.pos_rate * total;
			} else {
				console.log(this.loader, 'load next page error');
			}
		} catch (e){
			console.log('error happened', e);
		}
		this.loading = false;
		running.dismiss();
		bricks.debug('load_next_page() finished');
	}
}
bricks.Factory.register('Cols', bricks.Cols);
var bricks = window.bricks || {};
bricks.bug = true;
bricks.EchartsExt = class extends bricks.VBox {
/*
	{
		title:
		description:
		pie_optiosn:
		data_url:
		nameField:
		valueField:
		serieField:
		valueFields:
		data_params:
		data:[]
	}
	event:element_click

	*/
	constructor(opts){
		super(opts);
		if(!this.idField) this.idField = 'id';
		if(!this.nameField) this.nameField = 'name';
		if(!this.valueFields) this.valueFields = ['value'];
		// === 新增：处理 refresh_period ===
		this.refresh_period = opts.refresh_period; // 单位：秒
		this._refresh_timer = null;

		this.build_title_widget();
		this.build_description_widget();
		this.holder = new bricks.Filler({});
		this.add_widget(this.holder);
		this.chart = echarts.init(this.holder.dom_element);
		if (this.user_data){
			this.render_data(this.user_data)
		} else if (this.data_url) {
			schedule_once(this.render_urldata.bind(this), 0.1);
		}
		this.bind('element_resize', this.chart.resize.bind(this.chart));
		// === 启动定时刷新（如果配置了 refresh_period）===
		if (this.refresh_period && this.data_url) {
			this.start_auto_refresh();
		}
	}
    // === 启动自动刷新任务 ===
    start_auto_refresh() {
		if (this._refresh_timer) return; // 防止重复启动

		const doRefresh = () => {
			this.render_urldata().then(() => {
				// 继续下一轮
				if (this._refresh_timer) { // 检查是否已被取消
					this._refresh_timer = setTimeout(doRefresh, this.refresh_period * 1000);
				}
			}).catch(err => {
				console.error('Auto-refresh failed:', err);
				this._refresh_timer = setTimeout(doRefresh, this.refresh_period * 1000); // 失败也重试
			});
		};

		// 初始延迟后开始第一轮，之后循环
		this._refresh_timer = setTimeout(doRefresh, this.refresh_period * 1000);
	}

	// === 停止自动刷新 ===
	stop_auto_refresh() {
		if (this._refresh_timer) {
			clearTimeout(this._refresh_timer);
			this._refresh_timer = null;
		}
	}

	// === 覆盖 destroy 方法，清理定时器 ===
	destroy() {
		this.stop_auto_refresh(); // 清理资源
		if (this.chart) {
			this.chart.dispose();
			this.chart = null;
		}
		super.destroy();
	}

	pivotify(data){
		var series = [];
		data.forEach(x => {
			if (series.indexOf(x[this.serieField]) == -1){
				series.push(x[this.serieField]);
			}
		});
		data.sort( (x, y) => {
			if(x[this.nameField] > y[this.nameField]) return 1;
			if(x[this.nameField] < y[this.nameField]) return -1;
			return 0;
		});
		var ndic = {}
		for (var i=0;i<data.length;i++){
			var k = data[i][this.nameField];
			if( !ndic[k] ){
				ndic[k] = {
				};
				ndic[k][this.nameField] = data[i][this.nameField];
			}
			ndic[k][data[i][this.serieField]] = data[i][this.valueField];
		}
		var nd = Object.values(ndic);
		nd.sort( (x, y) => {
			if(x[this.nameField] > y[this.nameField]) return 1;
			if(x[this.nameField] < y[this.nameField]) return -1;
			return 0;
		});
		return nd;
	}
	get_series(data){
		if (!this.serieField){
			return null;
		}
		var series = [];
		data.forEach(x => {
			if (series.indexOf(x[this.serieField]) == -1){
				series.push(x[this.serieField]);
			}
		});
		return series;
	}
	render_data(){
		var data = this.user_data;
		if (this.serieField){
			if (!this.valueField) this.valueFields[0];
			this.valueFields = this.get_series(data);
			data = this.pivotify(data);
		}
		var opts = this.setup_options(data);
		opts.grid = {
			left: '3%',
			right: '3%',
			bottom: '3%',
			containLabel: true
		};
		if (this.valueFields.length>1 && opts.legend ){
			opts.legend.data = this.valueFields;
		}
		console.log('opts=', opts);
		this.chart.setOption(opts);
		this.chart.on('click', this.click_handle.bind(this));
	}
	click_handle(params){
		console.log('params=', params);
		this.dispatch('element_click', this.user_data[params.dataIndex]);
	}
	async render_urldata(params){
		if (! params) params = {};
		var _params = bricks.extend({}, this.data_params);
		_params = bricks.extend(_params, params);
		var jc = new bricks.HttpJson();
		var d = await jc.httpcall(this.data_url, {method:this.method || 'GET', params:_params});
		if (d){
			this.user_data = d;
			this.render_data();
		}
	}
}

var bricks = window.bricks || {};

bricks.IconBar = class extends bricks.HBox {
	/*
	{
		margin:
		rate:
		tools:[
			{
				name:
				icon:
				rate:
				dynsize:
				tip
			}
		]
	}
	*/	
	constructor(opts){
		if (! opts.cheight){
			opts.cheight = 2;
		}
		if (! opts.rate){
			opts.rate = 1;
		}
		super(opts);
		this.set_css('childrensize');
		this.select_name = null;
		this.height_int = 0;
		var tools = this.opts.tools;
		this.toolws = {};
		for (var i=0;i<tools.length;i++){
			var opts_i = bricks.extend({}, tools[i]);
			if (!opts_i.rate){
				opts_i.rate = this.rate;
			}
			opts_i.cheight = opts.cheight;
			opts_i.cwidth = opts.cheight;
			opts_i.dynsize = true;
			var w = this.build_item(opts_i);
			w.set_style('margin-left', this.opts.margin || '10px');
			w.set_style('margin-right', this.opts.margin || '10px');
			if (tools[i].name){
				w.set_id(tools[i].name);
			}
			w.set_style('cursor', 'pointer');
			this.add_widget(w);
			this.toolws[tools[i].name] = w;
		}
		this.set_style('alignItems', 'center');
		// this.set_style('justifyContent', 'center');
	}
	build_item(opts){
		var rate = opts.rate || this.opts.rate || 1;
		var h = bricks.app.charsize * rate * opts.cheight;
		if (this.height_int < h){
			this.height_int = h;
		}
		if (opts.name == 'blankicon'){
			return new bricks.BlankIcon({
				rate:rate,
				cheight:opts.cheight,
				cwidth:opts.cwidth,
				dynsize:opts.dynsize||true
			});
		}
		opts.url = opts.icon;
		var w = new bricks.Svg(opts);
		w.bind('click', this.regen_event.bind(this, opts));
		return w;
	}
	regen_event(desc, event){
		if (this.selected_name){
			this.toolws[this.selected_name].set_css('selected', true);
		}
		this.selected_name = desc.name;
		this.dispatch(desc.name, desc);
		this.dispatch('command', desc);
		this.toolws[this.selected_name].set_css('selected');

		event.preventDefault();
		event.stopPropagation();
	}
}

bricks.IconTextBar = class extends bricks.IconBar {
	build_item(opts){
		var rate = opts.rate || this.opts.rate || 1;
		var o = {
			width:'auto',
			height:'auto',
			cheight:1.3 * rate
		};
		if (opts.tip){
			o.tip = opts.tip;
		}
		var box = new bricks.HBox(o);
		if (opts.icon){
			var desc = {
				url:opts.icon,
				rate:opts.rate || rate,
				dynsize:opts.dynsize||true
			};
			var w = new bricks.Svg(desc);
			box.add_widget(w);
		}
		if (opts.label){
			var desc = {
				otext:opts.label,
				i18n:true,
				wrap:true,
				haligh:'left',
				rate:opts.rate || rate,
				dynsize:opts.dynsize||true
			};
			var w = new bricks.Text(desc);
			box.add_widget(w);
		}
		var h = bricks.app.charsize * rate;
		if (this.height_int < h){
			this.height_int = h;
		}
		box.bind('click', this.regen_event.bind(this,opts));
		return box;
	}
}
bricks.FloatIconBar = class extends bricks.HBox {
	constructor(opts){
		super(opts);
		this.float_w = new bricks.Svg({url:bricks_resource('imgs/float-out.png')});
		this.float_w.bind('mousemove', this.show_icons.bind(this));
		this.add_widget(this.float_w);
		this.icons_box = this.build_bar(opts);
		this.add_widget(this.icons_box);
		this.hide_icons()
		this.set_style('height', this.icons_box.height_int + 'px')
		bricks.Body.bind('click', this.hide_icons.bind(this));
	}
	build_bar(opts){
		return new bricks.IconBar(opts);
	}
	show_icons(){
		this.icons_box.set_style('display', 'flex');
	}
	hide_icons(){
		this.icons_box.set_style('display', 'none');
	}
}

bricks.FloatIconTextBar = class extends bricks.FloatIconBar {
	build_bar(opts){
		return new bricks.IconTextBar(opts);
	}
}

bricks.Factory.register('IconBar', bricks.IconBar);
bricks.Factory.register('IconTextBar', bricks.IconTextBar);
bricks.Factory.register('FloatIconBar', bricks.FloatIconBar);
bricks.Factory.register('FloatIconTextBar', bricks.FloatIconTextBar);
var bricks = window.bricks || {};
bricks.MiniForm = class extends bricks.HBox {
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
		var desc = objcopy(f);
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
		bricks.debug('show_options() called ...');
		this.choose.show();
	}
	change_input(e){
		var name = this.choose.value;
		this.build_widgets(name);
	}
	input_handle(e){
		var d = this.getValue();
		bricks.debug('input_handle() ..', d);
		this.dispatch('input', d);
	}
	getValue(){
		var d = this.opts.params || {};
		var v = this.input.getValue();
		bricks.extend(d, v);
		return d;
	}
}

bricks.Factory.register('MiniForm', bricks.MiniForm);
var bricks = window.bricks || {};
/*
dependent on xterm.js
*/
bricks.Wterm = class extends bricks.JsWidget {
	/*
	{
		ws_url:
		ping_timeout:19
	}
	*/
	constructor(opts){
		super(opts);
		this.socket = null;
		this.ping_timeout = opts.ping_timeout || 19;
		schedule_once(this.open.bind(this), 1);
		this.bind('domon', this.send_term_size.bind(this));
		this.bind('domoff', this.destroy.bind(this));
	}
	close_websocket(){
		try {
			console.log('socket alive, destroy it');
			// this.socket.send(JSON.stringify({ type: "close"}));
			this.socket.close(1000,'close now');
			this.socket.onopen = null;
			this.socket.onmessage = null;
			this.socket.onerror = null;
			this.socket.onclose = null;
			this.socket = null;
		} catch(e) {
			this.socket = null;
			console.log('e=', e);
		}
	}
	close_terminal(){
		try {
			this.fitAddon.dispose();
			this.term.dispose();
			this.term = null;
		} catch(e){
			this.term = null;
			console.log('e=', e);
		}
	}
	destroy(){
		console.debug('------domoff event, destory this widget');
		try {
			this.unbind('element_resize', this.term_resize.bind(this))
		} catch(e) {
			console.log('error ', e);
		}
		console.debug('---1--domoff event, destory this widget');
		if (this.socket){
			this.close_websocket();
		}
		console.debug('---2--domoff event, destory this widget');
		if (this.term){
			this.close_terminal();
		}
		console.debug('---3--domoff event, destory this widget');
	}
	charsize_sizing(){
		var cs = bricks.app.charsize;
		this.term.setOption('fontSize', cs);
	}
	send_term_size(){
		console.debug('------domon event, send the terminal size to server');
		try {
			console.log('resize():rows=', this.term.rows, this.term.cols);
			this.socket.send(JSON.stringify({ type: "resize", 
						width:this.get_width(),
						height: this.get_height(),
						rows: this.term.rows, 
						cols: this.term.cols }));
		} catch (e) {
			console.log('ws not ready');
		}
	}
	send_data(d){
		this.socket.send(JSON.stringify({type: "input", "data":d}));
	}
	async open(){
		var term_options = bricks.extend({width: "100%", height: "100%"}, this.term_options);
		var term = new Terminal(term_options);
		this.term = term;
		term.open(this.dom_element);
		// var sessdata = bricks.app.get_session();
		// var ws = new WebSocket(this.opts.ws_url, sessdata);
		var ws = new WebSocket(this.opts.ws_url);
		this.socket = ws;

		this.fitAddon = new FitAddon.FitAddon()
		term.loadAddon(this.fitAddon)
		this.fitAddon.fit();
		this.charsize_sizing();
		ws.onmessage = event => {
			var msg = JSON.parse(event.data);
			console.log('ws msg=', msg);
			if (msg.data.type  == 'heartbeat'){
				console.log('connection alive');
			} else if (msg.data.type == 'data') {
				term.write(msg.data.data);
			} else {
				console.log('get server data = ', msg.data);
			}
		};
		ws.onclose = (event) => {
			console.log('websocket closed:', event.code, '--', event.reason);
		};
		ws.onopen = () => {
			this.send_term_size();
			this.bind('element_resize', this.term_resize.bind(this))
		};
		term.onData((key) => {
			console.log('key=', key);
			this.send_data(key);
		});
		term.onResize(({cols, rows}) =>{
			this.send_term_size();
		});
		this.send_term_size();
		term.focus();
	}
	term_resize(){
		try {
			console.log('widget resize event fired');
			this.fitAddon.fit();
			// this.send_term_size();
		} catch(e){
			console.log('resize error', e);
		}
	}
}

bricks.Factory.register('Wterm', bricks.Wterm);

var bricks = window.bricks || {};
bricks.AccordionItem = class extends bricks.VBox {
	constructor(opts){
		super(opts);
		this.set_css('accordion-item');
	}
}

bricks.AccordionInfo = class extends bricks.FHBox {
	constructor(opts){
		super(opts);
		this.set_css('accordion-item-info');
	}
}

bricks.DynamicAccordion = class extends bricks.VScrollPanel {
	/*
		{
			"data_url",
			"data_method",
			"cache_limit",
			"page_rows",
			"row_cheight":1.5
			"record_view"
			"content_rely_on"
			"content_rely_value"
			"editable"
			"fields":
			"record_toolbar",
			"record_toolbar_collapsable"
			"header"
			"content_view"
		}
	*/
	constructor(opts){
		super(opts);
		this.row_cheight = opts.row_cheight || 1.5;
		// this.set_style('overflow', 'auto');
		this.loader = new bricks.PageDataLoader({
			url:this.opts.data_url,
			params:this.opts.data_params,
			pagerows:this.opts.page_rows,
			method:this.opts.data_method,
			cache_pages:this.opts.cache_limit
		});
		this.old_params = null;
		this.active_item = null;
		this.active_content = null;
		this.loading = false;
		schedule_once(this.build_all.bind(this), 0.1);
	}
	async build_all(){
		if (this.title){
			this.build_title();
		}
		if (this.description){
			this.build_description();
		}
		await this.build_toolbar();
		await this.build_header();
		var filler = new bricks.Filler();
		this.container = new bricks.VScrollPanel({ });
		filler.add_widget(this.container);
		this.add_widget(filler);
		this.container.bind('min_threshold', this.load_previous_page.bind(this));
		this.container.bind('max_threshold', this.load_next_page.bind(this));
		await this.render();
	}
	build_title(){
		var w = new bricks.Title3({
			otext:this.title,
			i18n:true,
			wrap:true,
			dynsize:true,
			halign:'left'
		});
		this.add_widget(w);
	}
	build_description(){
		var w = new bricks.Text({
			otext:this.description,
			i18n:true,
			wrap:true,
			dynsize:true,
			halign:'left'
		});
		this.add_widget(w);
	}
	build_toolbar(){
		this.toolbar_w = new bricks.IconTextBar(this.toolbar);
		this.add_widget(this.toolbar_w);
	}
	async build_header(){
		this.header_w = await this.build_item();
		this.add_widget(this.header_w);
		/* 
		var w = await this.build_item();
		w.set_style('position', 'sticky');
		w.set_style('top', 0);
		return w;
		*/
	}
	async build_item(record){
		var item  = new bricks.AccordionItem({});
		var info = await this.build_info(item, record);
		var content = new bricks.VBox({
			height:'auto',
			display:'none'
		});
		var build_content = true;
		if (!record){
			build_content = false;
		} else {
			if (this.content_rely_on){
					var v = this.content_rely_value || true;
					if(record[this.content_rely_on] != v){
							build_content = false;
					}
			}
		}
		content.set_css('accordion-item-content');
		content.hide();
		if (record){
			info.bind('click', 
				this.line_clicked.bind(this, info, content, record));
		}
		item.add_widget(content);
		return item;
	}

	async build_info(item, record){
		if (! this.fields && !record){
			return;
		}
		var w;
		var tb = null;
		var info = new bricks.AccordionInfo({cheight:this.cheight});
		info.user_data = record;
		item.add_widget(info);
		tb = this.build_record_toolbar(info, record);
		if (! record){
			record = {};
			for (var i=0;i<this.fields.length;i++){
				var f = this.fields[i];
				record[f.name] = f.label || f.name;
			}
		}
		w = await bricks.widgetBuild(this.record_view, info, record);
		if (w){
			if (tb){
			w.add_widget(tb, 0);
			}
			info.add_widget(w);
		} else {
			bricks.debug('bricks.widgetBuild(), tmpl=', this.record_view, 'record=', record);
		}       
		return info;
	}
	add_record(info){
		var w = info.parent;
		var hided;
		var content = w.children[1];
		content.clear_widgets();
		var hided = content.is_hide();
		var fields = this.fields;
		if (this.data_params){
			for (var k in this.data_params){
				fields.push({
					name:k,
					value:this.data_params[k],
					uitype:'hide'
				});
			}
		}
		var f = new bricks.Form({
				"cheight":this.editable.form_cheight||7,
				"submit_url":this.editable.new_data_url,
				"fields":fields
		});
		f.bind('cancel', this.add_record_abort.bind(this, info));
		content.add_widget(f, 0);
		content.show();
		f.bind('submited', this.add_record_finish.bind(this, info));
	}
	async add_record_abort(info, event){
		var content = info.parent.children[1];
		content.hide();
		content.clear_widgets();
	}
	async add_record_finish(info, event){
		var resp = event.params;
		var desc = await resp.json();
		var w = await bricks.widgetBuild(desc);
		console.log(resp, desc, w);
		var content = info.parent.children[1];
		content.hide();
		this.render();
	}
	update_record(info, record){
		console.log('update_record():info=', info)
		var w = info.parent;
		var hided;
		var content = w.children[1];
		content.clear_widgets();
		var fields = [];
		for (var i=0; i< this.fields.length; i++){
			var f = bricks.extend({}, this.fields[i]);
			f.value = record[f.name];
			fields.push(f);
		}
		var f = new bricks.Form({
				"cheight":this.editable.form_cheight||7,
				"submit_url":this.editable.update_data_url+'?id=' + record.id,
				"fields":fields
		});
		content.add_widget(f, 0);
		f.bind('submited', this.update_record_finish.bind(this, info, content, f));
		f.bind('cancel', this.update_cancel.bind(this, info, content));
		content.show();
	}
	update_cancel(info, content){
		content.clear_widgets();
		content.hide();
	}
	async update_record_finish(info, content, form, event){
		content.remove_widget(form);
		content.hide();
		var resp = event.params;
		var desc = await resp.json();
		var w = await bricks.widgetBuild(desc);
		if (desc.widgettype == 'Message'){
			await this.renew_record_view(form, info);
		}
	}
	async renew_record_view(form, info){
		var d = form.getValue();
		var record = bricks.extend(info.user_data, d);
		var w = info.children[0];
		info.clear_widgets();
		var rtb = w.children[0];
		var w = await bricks.widgetBuild(this.record_view, info, record);
		w.add_widget(rtb, 0);
		info.add_widget(w);
	}
	delete_record(info, record){
		var conform_w = new bricks.Conform({
			target:this,
			title:'Delete conform',
			message:'Are you sure to delete is record?'
		});
		conform_w.bind('conformed', this.delete_record_act.bind(this, info, record));
		conform_w.bind('discard', conform_w.dismiss.bind(conform_w));
	}
	
	async delete_record_act(info, record){
		var url = this.editable.delete_data_url + '?id=' + record.id;
		var hc = new bricks.HttpJson();
		var desc = await hc.get(url);
		var w = await bricks.widgetBuild(desc);
		if (desc.widgettype == 'Message'){
			this.container.remove_widget(info.parent);
		}
	}
	async build_new_form(){
		var desc = {
			"widgettype":"VBox",
			"options":{
				"height":"auto",
			},
			"subwidgets":[
				{
					"id":"new",
					"widgettype":"IconBar",
					"options":{
						"tools":[
							{
								"name":"add",
								"tip":"add a new record",
								"icon":this.editable.add_icon || bricks_resource('imgs/add.svg')
							}
						]
					}
				},
				{
					"widgettype":"Form",
					"options":{
						"cheight":this.editable.form_cheight||7,
						"submit_url":this.editable.new_data_url,
						"fields":this.fields
					}
				}
			]
		};
		var w = await bricks.widgetBuild(desc, this);
		w.children[1].hide();
		w.children[0].bind('add',function(){ w.children[1].toggle_hide()})
		this.new_form = w.children[1];
		this.new_form.bind('submited', this.render.bind(this));
		this.add_widget(w);
	}
	async render(params) {
		params = params || {};
		if (params == this.old_params){
			return;
		}
		this.old_params = params;
		bricks.debug('params=', params, 'render() called');
		var d = await this.loader.loadData(params);
		if (d){
			this.container.clear_widgets();
			await this.dataHandle(d);
		} else {
			bricks.debug(params, 'load data return null');
		}
	}
	async dataHandle(d){
		var data = d.rows;
		var page = d.add_page;
		if (!data){
			return;
		}
		await this.renderAccordionItems(data, page);
		if (d.delete_page){
			this.delete_page(d.delete_page);
		}
	}
	build_record_toolbar(info, record){
		var c = new bricks.Layout({cwidth:2.5, height:'auto'})
		var desc;
		var edit_tools = [];
		if (this.record_toolbar){
			desc = bricks.extend({}, this.record_toolbar);
		} else {
			desc = {
				cwidth:2.5,
				tools:[]
			}
		}
		var event_names = [];
		for (var i=0;i<desc.tools.length;i++){
			event_names.push(desc.tools[i].name);
		}
		if (! record){
			var mytools = [];
			for (var i=0;i<desc.tools.length;i++){
				mytools.push({ name:'blankicon'});
			}
			if (this.editable){
				edit_tools = [
					{
						name:'add',
						tip:'add new record',
						icon:this.editable.add_icon || bricks_resource('imgs/add.svg')
					},
					{
						name:'blankicon'
					}
				];
				desc.tools = edit_tools.concat(mytools);
			} else {
				desc.tools = mytools;
			}
			var w = new bricks.IconBar(desc);
			if (this.editable){
				w.bind('add', this.add_record.bind(this, info, record));
			}
			c.add_widget(w);
			return c;
		} 
		if (this.editable){
			var edit_tools = [
				{
					name:"update",
					tip:"update record in this line",
					icon:this.editable.update_icon || bricks_resource('imgs/update.svg')
				},
				{
					name:'delete',
					tip:"delete record in this line",
					icon:this.editable.delete_icon || bricks_resource('imgs/delete.svg')
				}
			]
			desc.tools = edit_tools.concat(desc.tools);
		}
		var w = new bricks.IconBar(desc);
		if (this.editable){
			w.bind('update', this.update_record.bind(this, info, record));
			w.bind('delete', this.delete_record.bind(this, info, record));
		}
		for (var i=0;i<event_names.length;i++){
			w.bind(event_names[i], this.fire_event.bind(this, event_names[i], record));
		}
		c.add_widget(w);
		return c;
	}
	fire_event(event_name, data){
		this.dispatch(event_name, data);
	}
	async renderAccordionItems(data, page) {
		var pos;
		for (var i=0;i<data.length;i++){
			if (this.loader.is_max_page(page)){
				pos = -1;
			} else {
				pos = i;
			}
			var record = data[i];
			var item = await this.build_item(record);
			item.set_attribute('data-page', page);
			this.container.add_widget(item, pos);
		};
	}
	delete_page(page){
		var items = this.dom_element.querySelectorAll('[data-page="' + page + '"]');
		for (var i=0;i<items.length;i++) {
			var w = items[i].bricks_widget;
			this.container.remove_widget(w);
		}
	}
	select_line(info){
		if (this.select_row){
			this.select_row.unset_css('accordion-item-info-selected');
		}
		this.select_row = info;
		this.select_row.set_css('accordion-item-info-selected');
		this.dispatch('row_selected', info);
	}
	async line_clicked(info, content, record, event){
		this.select_line(info);
		if(! this.content_view){
			return;
		}
		this.toggle_content(info, content, record, event);
	}
	async toggle_content(info, content, record, event){
		if(! this.content_view){
			return;
		}
		var h = this.container.dom_element.offsetHeight  - 3 * info.dom_element.offsetHeight;
		content.set_style('height', h + 'px');
		if (this.active_content){
			if (this.active_content != content){
				this.active_content.clear_widgets();
				this.active_content.hide();
				this.active_content = null;
			}
		}
		content.toggle_hide();
		if (content.dom_element.style.display == 'none'){
			bricks.debug('content just collapsed');
			content.clear_widgets();
			this.active_content = null;
			return;
		}
		
		var w;
		w = await bricks.widgetBuild(this.content_view, content, record);
		if (w){
			content.add_widget(w);
			this.active_content = content;
		} else {
			this.active_content = null;
			content.hide();
		}
	}
	async load_previous_page(){
		if (this.loading){
			bricks.debug('this.loading is set, do not thing');
			return;
		}
		var running = new bricks.Running({target:this});
		this.loading = true;
		try {
			var d = await this.loader.loadPreviousPage();
			if (d){
				this.dataHandle(d);
				var total = this.container.dom_element.scrollHeight - this.container.dom_element.clientHeight;
				this.container.dom_element.scrollTop = d.pos_rate * total;
			} else {
				bricks.debug(this.loader, 'load previous page error');
			}
		} catch (e) {
			bricks.debug('e=', e);
		}
		this.loading = false;
		running.dismiss();
	}
	async load_next_page(){
		if (this.loading){
			bricks.debug('this.loading is set, do not thing');
			return;
		}
		var running = new bricks.Running({target:this});
		this.loading = true;
		try {
			var d = await this.loader.loadNextPage();
			if (d){
				this.dataHandle(d);
				var total = this.container.dom_element.scrollHeight - this.container.dom_element.clientHeight;
				this.container.dom_element.scrollTop = d.pos_rate * total;
			} else {
				bricks.debug(this.loader, 'load next page error');
			}
		} catch (e){
			bricks.debug('error happened', e);
		}
		this.loading = false;
		running.dismiss();
		bricks.debug('load_next_page() finished');
	}
}
bricks.Factory.register('DynamicAccordion', bricks.DynamicAccordion);
bricks = window.bricks || {};

bricks.UpStreaming = class extends bricks.JsWidget {
	/*
	{
		"url":
	}
	*/
	constructor(opts){
		super(opts);
	}
	async go(){
		this.body = new ReadableStream(this);
		this.headers = new Headers();
		this.headers.append('Content-Type', 
					'application/octet-stream');
		var resp = await fetch(this.url, {
		  method: 'POST',
		  headers: this.headers,
		  duplex: 'full',
		  body: this.body
		});
		return resp
	}
	send(data){
		this.stream_ctlr.enqueue(data);
	}
	finish(){
		this.stream_ctlr.close();
	}
	start(controller){
		this.stream_ctlr = controller;
	}
}

bricks.down_streaming = async function*(response) {
	if (! response){
		return;
	}
	const reader = response.body.getReader();
	var value;
	var t = 0;
	while (true){
		done, value = await reader.read();
		if (value.done){
			break;
		}
		let result = '';
		for (let i = 0; i < value.value.length; i++) {
			result += String.fromCharCode(value.value[i]);
		}
		console.log('audio set url=', result);
		yield result;
	}
}
var bricks = window.bricks || {};

bricks.StreamAudio = class extends bricks.VBox {
	constructor(opts){
		opts.height = '100%';
		opts.name = opts.name || 'asr_text';
		super(opts);
		this.button = new bricks.Button({label:'start'});
		this.filler = new bricks.Filler({});
		this.add_widget(this.button);
		this.add_widget(this.filler);
		this.text_w = new bricks.Text({text:' ', wrap:true});
		this.filler.add_widget(this.text_w);
		this.button.bind('click', this.toggle_status.bind(this));
	}
	toggle_status(){
		if (this.upstreaming){
			this.stop();
		} else {
			this.start();
		}
	}
	start(){
		this.button.text_w.set_otext('stop');
		schedule_once(this._start.bind(this), 0.1);
	}
	async _start(){
		if (bricks.vad){
			await bricks.vad.stop();
		}
		var f = this.handle_audio.bind(this);
		this.vad = await vad.MicVAD.new({
			onSpeechEnd:(audio) => {
				console.log(audio, this.vad);
				this.handle_audio(audio);
			}
		});
		this.vad.start();
		bricks.vad = this;
		this.upstreaming = new bricks.UpStreaming({url:this.url});
		this.resp_text = '';
		this.resp = await this.upstreaming.go();
		await this.recieve_data();
	}
	stop(){
		this.button.text_w.set_otext('start');
		schedule_once(this._stop.bind(this), 0.1);
	}
	async _stop(){
		if (this.upstreaming){
			this.upstreaming.finish();
			this.upstreaming = null;
		}
		await this.vad.pause();
		bricks.vad = null;
	}
	async receive_data(){
		const reader = resp.body.getReader();
		const decoder = new TextDecoder('utf-8');
		var line = await reader.readline();
		while (line){
			try {
				var d = JSON.parse(line);
				this.text_w.set_text(d.content);
			} catch(e){
				console.log(line, 'can not parse as a json');
			}
			line = await reader.readline();
		}
	}
	handle_audio(audio){
		console.log('handle_audil() called', audio);
		var b64audio = btoa(audio);
		this.upstreaming.send(b64audio);
	}
}

bricks.Factory.register('StreamAudio', bricks.StreamAudio);
bricks.Factory.register('ASRText', bricks.StreamAudio);
var bricks = window.bricks || {};
/** @param sampleRate {number} */
/** @param channelBuffers {Float32Array[]} */
function audioBufferToWav(channelBuffers, sampleRate) {
  const totalSamples = channelBuffers[0].length * channelBuffers.length;

  const buffer = new ArrayBuffer(44 + totalSamples * 2);
  const view = new DataView(buffer);

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  /* RIFF identifier */
  writeString(view, 0, "RIFF");
  /* RIFF chunk length */
  view.setUint32(4, 36 + totalSamples * 2, true);
  /* RIFF type */
  writeString(view, 8, "WAVE");
  /* format chunk identifier */
  writeString(view, 12, "fmt ");
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, channelBuffers.length, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 4, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, channelBuffers.length * 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, "data");
  /* data chunk length */
  view.setUint32(40, totalSamples * 2, true);

  // floatTo16BitPCM
  let offset = 44;
  for (let i = 0; i < channelBuffers[0].length; i++) {
    for (let channel = 0; channel < channelBuffers.length; channel++) {
      const s = Math.max(-1, Math.min(1, channelBuffers[channel][i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }

  return buffer;
}

bricks.VadText = class extends bricks.VBox {
	constructor(opts){
		opts.height = '100%';
		opts.name = opts.name || 'asr_text';
		super(opts);
		this.button = new bricks.Button({
			label:'start',
			icon:bricks_resource('imgs/speak.svg')
		});
		this.audio = new bricks.AudioPlayer({});
		this.audio.set_css('filler');
		var hbox = new bricks.HBox({width:'100%', height:'auto'});
		hbox.add_widget(this.button);
		hbox.add_widget(this.audio)
		this.add_widget(hbox);
		this.filler = new bricks.Filler({});
		this.add_widget(this.filler);
		this.text_w = new bricks.Text({text:' ', wrap:true});
		this.filler.add_widget(this.text_w);
		this.button.bind('click', this.toggle_status.bind(this));
		this.bind('audio_ready', this.handle_audio.bind(this));
	}
	toggle_status(){
		if (this.vad){
			this.stop();
		} else {
			this.start();
		}
	}
	start(){
		this.button.text_w.set_otext('stop');
		schedule_once(this._start.bind(this), 0.1);
	}
	async _start(){
		if (bricks.vad){
			await bricks.vad.stop();
		}
		this.vad = await vad.MicVAD.new({
			onSpeechEnd:(audio) => {
				console.log(audio, this.vad);
				this.dispatch('audio_ready', audio);
				this.handle_audio(audio);
			}
		});
		this.vad.start();
		bricks.vad = this;
		this.text = '';
	}
	stop(){
		this.button.text_w.set_otext('start');
		schedule_once(this._stop.bind(this), 0.1);
	}
	async _stop(){
		await this.vad.pause();
		this.vad = null;
		bricks.vad = null;
		if(this.text != ''){
			this.dispatch('changed', this.getValue());
		}
	}
	async handle_audio(audio){
		console.log('handle_audil() called', audio);
		var wavBuffer = audioBufferToWav([audio], 16000);
		var b64audio = this.arrayBufferToBase64(wavBuffer);
		this.audio.set_url('data:audio/wav;base64,' + b64audio);
		var hj = new bricks.HttpJson();
		var d={
			method:'POST',
			params:{
				model:this.model,
				audio:b64audio
			}
		}
		var rj = await hj.httpcall(this.url, d);
		if (rj.status == 'ok'){
			this.text += rj.content
			this.text_w.set_text(this.text);
		} else {
			var w = new bricks.Error({title:'Error', 
						timeout:4, 
						message:rj.message
			});
			w.open();
		}
	}
	arrayBufferToBase64(wavBuffer) {
		let binary = '';
		const bytes = new Uint8Array(wavBuffer);
		for (let i = 0; i < bytes.byteLength; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return btoa(binary);
	}
	getValue(){
		var d = {}
		d[this.name] = this.text;
	}
}

bricks.Factory.register('VadText', bricks.VadText);
var bricks = window.bricks || {}

bricks.VideoBox = class extends bricks.JsWidget {
	create(){
		this.dom_element = this._create('video');
		this.set_attribute('autoplay', true);
		this.set_attribute('muted', true);
	}
	get_stream(){
		return this.stream;
	}
	set_stream(stream){
		this.stream = stream
		this.dom_element.srcObject = this.stream;
	}
}

bricks.Signaling = class {
	/*
	{
		signaling_url:
		info:
		connect_opts:
		onclose:
		onlogin:
	}
	*/
	constructor(opts){
		this.signaling_url = opts.signaling_url;
		this.info = opts.info;
		this.connect_opts = opts.connect_opts;
		this.peers = [];
		this.sessions = {};
		this.handlers = {};
		this.sessionhandlers = {};
		this.init_websocket();
		this.hb_task = null;
		this.heartbeat_period = opts.heartbeat_period;
		this.onclose = opts.onclose;
		this.onlogin = opts.onlogin;
		this.onopen = opts.onopen;
		if (!this.heartbeat_period){
			this.heartbeat_period = 0;
		}
	}

	init_websocket(){
		var sessdata = bricks.app.get_session();
		this.socket = new WebSocket(this.signaling_url, sessdata);
		this.socket.onmessage = this.signaling_recvdata.bind(this);
		this.socket.onopen = this.login.bind(this);
		this.socket.onclose = this.reconnect.bind(this);
		this.socket.onerror = this.reconnect.bind(this);
	}
	reconnect(){
		console.log('eror happened');
		if (this.hb_task){
			clearInterval(this.hb_task);
			this.hb_task = null;
		}
		if (this.onclose){
			this.onclose();
		}
		return;
	}
	del_handler(sessionid){
		var handlers = {};
		delete this.handlers[sessionid];
	}
	async signaling_recvdata(event){
        var datapkg = JSON.parse(event.data);
        var data = datapkg.data;
		console.log('ws recv data=', data);
		if (data.session) {
			var sessionid = data.session.sessionid;
			var sessiontype = data.session.sessiontype;
			var handler = this.handlers[sessionid]
			if (!handler){
				var k = this.sessionhandlers[sessiontype];
				if (!k){
					throw 'recvdata_handler() exception(' + sessiontype + ')';
				}
				var h = new k(this, data.session, this.connect_opts);
				handler = h.recvdata_handler.bind(h);
				this.add_handler(sessionid, handler);
			}
			await handler(data);
		} else {
			await this.recvdata_handler(data);
		}
	}
	add_handler(key, handler){
		this.handlers[key] = handler;
	}
	add_sessionhandler(sessiontype, handler){
		this.sessionhandlers[sessiontype] = handler;
	}
	async recvdata_handler(data){
		console.log('recv data=', data);
		if (data.type == 'online'){
			data.online.forEach(p => {
				var d = this.peers[p.id];
				if (!d) d = {};
				d = bricks.extend(d, p);
				this.peers[p.id] = d;
			});
			if (this.onlogin){
				this.onlogin(data.online);
			}
			return;
		}
		console.log('recv data=', data, 'NOT HANDLED');
	}
	new_session(sessiontype, peer){
		var k = this.sessionhandlers[sessiontype];
		if (!k){
			throw 'new_session() exception(' + sessiontype + ')';
		}
		var sessionid = bricks.uuid();
		var session = {
			sessiontype:sessiontype,
			sessionid:sessionid
		}
		var d = {
			type:'new_session',
			session: session
		};
		this.send_data(d);
		var opts = bricks.extend({}, this.connect_options);
		opts.peer_info = peer;
		var h = new k(this, session, opts);
		this.add_handler(sessionid, h.recvdata_handler.bind(h) );
		return h
	}
	login(){
		console.log('login send', this.heartbeat_period)
		var d = {
			type:'login',
		}
		this.send_data(d);
		if (this.heartbeat_period > 0){
			console.log('call login again in', this.heartbeat_period, ' seconds');
		}
	}

	logout(){
		var d= {
			type:'logout',
		}
		this.send_data(d);
	}
	send_data(d){
		d.msgfrom = this.info;
		var s = JSON.stringify(d);
		console.log('send_data()', s);
		this.socket.send(s);
	}
	socket_send(s){
		this.socket.send(s);
	}
}

bricks.RTCP2PConnect = class {
	/*
	opts:{
		ice_servers:
		peer_info:
		auto_callaccept: true or false
		media_options: { video:trur or false, audio:true or false }
		data_connect: true or false
	}
	*/

	constructor(signaling, session, opts){
		this.id = bricks.uuid();
		this.signaling = signaling;
		this.session = session;
		this.requester = false;
		this.opts = opts;
		this.peers = {};
		this.signal_handlers = {};
		this.local_stream = null;
		this.localVideo = null;
		this.add_handler('sessioncreated', this.h_sessioncreated.bind(this));
		this.add_handler('callrequest', this.h_callrequest.bind(this));
		this.add_handler('callaccepted', this.h_callaccepted.bind(this));
		this.add_handler('offer', this.h_offer.bind(this));
		this.add_handler('answer', this.h_answer.bind(this));
		this.add_handler('icecandidate', this.h_icecandidate.bind(this));
		this.add_handler('sessionquit', this.h_sessionquit.bind(this));
	}

	add_handler(type, f){
		this.signal_handlers[type] = f;
	}
	get_handler(typ){
		return this.signal_handlers[typ];
	}

	async p2pconnect(peer){
		await this.getLocalStream();
		var p = this.peers[peer.id];
		if (!p){
			await this.createPeerConnection(peer);
		} else {
			aconsole.log(peer, 'connect exists', this);
		}
		console.log('p2pconnect() called, this=', this, 'peer=', peer);
	}
	async h_sessioncreated(data){
		await this.p2pconnect(this.opts.peer_info, 'requester');
		if (this.opts.peer_info){
			var d = {
				type:'callrequest',
				msgto:this.opts.peer_info
			}
			this.signaling_send(d);
			this.requester = true;
		}
	}
	async h_callrequest(data){
		if (this.opts.auto_callaccept || true){
			await this.p2pconnect(data.msgfrom, 'responser');
			var d = {
				type:'callaccepted',
				msgto:data.msgfrom
			};
			this.signaling_send(d);
			return;
		}
	}
	async h_callaccepted(data){
		this.createDataChannel(data.msgfrom);
		await this.send_offer(data.msgfrom, true);
	}
	async h_offer(data){
		console.log('h_offer(), this=', this, 'peer=', data.msgfrom);
		var pc = this.peers[data.msgfrom.id].pc;
		var offer = new RTCSessionDescription(data.offer);
		await pc.setRemoteDescription(offer);
		var answer = await pc.createAnswer();
		await pc.setLocalDescription(answer);
		this.signaling_send({
			type:'answer',
			answer:pc.localDescription,
			msgto:data.msgfrom
		});
		if (this.peers[data.msgfrom.id].role != 'requester'){
			await this.send_offer(data.msgfrom);
		}
		
	}
	async h_answer(data){
		var desc = new RTCSessionDescription(data.answer);
		var pc = this.peers[data.msgfrom.id].pc;
		await pc.setRemoteDescription(desc);
	}
	async h_icecandidate(data){
		var candidate = new RTCIceCandidate(data.candidate);
		var pc = this.peers[data.msgfrom.id].pc;
		await pc.addIceCandidate(candidate);
	}
	async h_sessionquit(data){
		var pc = this.peers[data.msgfrom.id].pc;
		pc.close();
	}
	async send_offer(peer, initial){
		console.log('send_offer(), peers=', this.peers, 'peer=', peer);
		var pc = this.peers[peer.id].pc;
		if (initial){
			this.peers[peer.id].role = 'requester';
		} else {
			this.peers[peer.id].role = 'responser';
		}
        var offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        var d = {
            type:'offer',
            offer:pc.localDescription,
            msgto:peer
        };
		this.signaling_send(d);
	}
	
	send_candidate(peer, event){
		console.log('send_candidate called, peer=', peer, 'event=', event); 
        if (event.candidate) {
            var candidate = event.candidate;
            this.signaling_send({ 
                type: 'icecandidate', 
                msgto:peer,
                candidate: candidate
            }); 
        }
	}

	signaling_send(d){
		d.session = this.session;
		this.signaling.send_data(d);
	}

	async recvdata_handler(data){
		console.log('recvdata=', data, this.signal_handlers);
		var f = this.get_handler(data.type);
		if (f) {
			await f(data);
			return;
		}
		console.log('recvdata=', data, 'NOT HANDLED');
	}

	async ice_statechange(peer, event){
		var pc = this.peers[peer.id].pc;
		console.log(`oniceconnectionstatechange, pc.iceConnectionState is ${pc.iceConnectionState}.`);
	}

	async connection_statechange(peer, event){
		var pc = this.peers[peer.id].pc;
		console.log(`${peer.id} state changed. new state=${pc.connectionState}`);
		console.log('state=', pc.connectionState, typeof(pc.connectionState));
		if (pc.connectionState == 'disconnected'){
			this.peer_close(peer);
			if (this.opts.on_pc_disconnected){
				this.opts.on_pc_disconnected(peer);
			}
            return;
        }
        if (pc.connectionState == 'connected'){
			console.log('state is connected, data_connect=',
						this.opts.data_connect);
			if(this.opts.on_pc_connected){
				this.opts.on_pc_connected(peer);
			}
        }
	}

	async dc_accepted(peer, event){
		console.log('accept datachannel ....');
		this.peers[peer.id].dc = event.channel;
		await this.dc_created(peer, this.peers[peer.id].dc);
	}
	async dc_created(peer, dc){
		console.log('dc_created.....', dc);
		dc.onmessage = this.datachannel_message.bind(peer);
		dc.onopen = this.datachannel_open(peer);
		dc.onclose = this.datachannel_close(peer);
	}

	async datachannel_message(peer, event){
		console.log('datachannel_message():', this, arguments);
		var dc = this.peers[peer.id].dc;
		if (this.opts.on_dc_messaage){
			await this.opts.on_dc_message(dc, event.data);
		}
	}
	async datachannel_open(peer){
		console.log('datachannel_open():', this, arguments);
		var dc = this.peers[peer.id].dc
		if (this.opts.on_dc_open){
			await this.opts.on_dc_open(dc);
		}
	}
	async datachannel_close(peer){
		console.log('datachannel_close():', this, arguments);
		var dc = this.peers[peer.id].dc
		if (this.opts.on_dc_close){
			await this.opts.on_dc_close(dc);
		}
	}
	async createDataChannel(peer){
		var pc = this.peers[peer.id].pc;
		this.peers[peer.id].dc = pc.createDataChannel('chat', {ordered:true});
		var dc = this.peers[peer.id].dc;
		await this.dc_created(peer, this.peers[peer.id].dc);
		console.log('dc created', this.peers[peer.id].dc);
	}
	async createPeerConnection(peer){
		const configuration = {
			iceServers:this.opts.ice_servers
		}
		console.log('RTCPC configuration=', configuration);
		var pc = new RTCPeerConnection(configuration);
		if (this.local_stream){
			this.local_stream.getTracks()
			.forEach(track => {
				pc.addTrack(track, this.local_stream);
			});
		}
		this.peers[peer.id] = bricks.extend({}, peer);
		this.peers[peer.id].pc = pc;
		this.peers[peer.id].role = '';
		var remoteVideo = new bricks.VideoBox();
		this.peers[peer.id].video = remoteVideo;
        pc.onicecandidate = this.send_candidate.bind(this, peer);
        pc.oniceconnectionstatechange = this.ice_statechange.bind(this, peer);
        pc.onconnectionstatechange = this.connection_statechange.bind(this, peer);
		pc.ondatachanel = this.dc_accepted.bind(this, peer);
		pc.ontrack = event => {
			remoteVideo.set_stream(event.streams[0]);
		}
	}
	async changeLocalVideoStream(peer, new_stream){
		var pc = this.peers[peer.id].pc;
	    const senders = pc.getSenders();
		const oldVideoTrackSender = senders.find(sender => sender.track && sender.track.kind === 'video');
		if (oldVideoTrackSender) {
			pc.removeTrack(oldVideoTrackSender);
		}
		new_stream.getTracks().forEach(track => {
			if (track.kind === 'video') {
				pc.addTrack(track, newStream);
			}
		});
		await this.send_offer(peer, true);
	}
	async getLocalStream() {
		if (this.opts.media_options){
			try {
				var mediaOptions = this.opts.media_options;
				this.local_stream = await navigator.mediaDevices.getUserMedia(mediaOptions);
				this.localVideo = new bricks.VideoBox();
				this.localVideo.set_stream(this.local_stream);
			} catch (error) {
				console.error('获取本地媒体流失败：', error);
			}
			try {
				this.local_screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
			} catch (error) {
				console.error('获取本地Screen失败：', error);
			}
		}
	}
	peer_close(peer){
		var pc = this.peers[peer.id].pc;
		var video = this.peers[peer.id].video;
		pc.getReceivers().forEach(receiver => {
			if (receiver.track){
				receiver.track.stop();
			}
		});
		pc.getSenders().forEach(receiver => {
			if (receiver.track){
				receiver.track.stop();
			}
		});
		video.get_stream().getTracks().forEach(track => track.stop());
		var dc = this.peers[peer.id].dc;
		if (dc){
			dc.close();
		}
		pc.close();
		delete this.peers[peer.id];
		var keys = Object.keys(this.peers);
		if (keys.length == 0){
			this.localVideo.get_stream()
			.getTracks().forEach(track => track.stop());
			this.local_stream.getTracks().forEach(track => track.stop());
			this.local_screan.getTracks().forEach(track => track.stop());
			this.signaling.del_handler(this.session.sessionid);
		}
	}
};

/* need mammoth module
<script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.2/mammoth.browser.min.js"></script>
*/
var bricks = window.bricks || {};

bricks.DOCXviewer = class extends bricks.VBox {
	/*
	url:
	*/
	constructor(opts){
		super(opts);
		this.bind('on_parent', this.set_url.bind(this));
		// schedule_once(this.set_url.bind(this, this.url), 0.2);
	}
	async set_url(url){
		var container = this.dom_element
		var hab = new bricks.HttpArrayBuffer();
		var ab = await hab.get(this.url);
		var result = await mammoth.convertToHtml({ arrayBuffer: ab });
		container.innerHTML = result.value;
	}
}

function extractBodyContent(htmlString) {
  // 正则表达式匹配<body>和</body>之间的内容
  const regex = /<body[^>]*>([\s\S]*?)<\/body>/i;
  const matches = htmlString.match(regex);
  return matches ? matches[1] : null; // 如果匹配到，返回匹配的内容，否则返回null
}

bricks.EXCELviewer = class extends bricks.VBox {
	constructor(opts){
		opts.height = "100%",
		super(opts);
		this.sheets_w = new bricks.HBox({cheight:3, width:'100%'});
		this.sheets_w.set_css('scroll');
		this.cur_sheetname = null;
		this.container = new bricks.Filler({});
		this.add_widget(this.container);
		this.add_widget(this.sheets_w);
		this.bind('on_parent', this.set_url.bind(this));
	}
	async set_url(url){
		this.sheets_w.clear_widgets();
		var hab = new bricks.HttpArrayBuffer();
		var ab = await hab.get(this.url);
		const data = new Uint8Array(ab);
		this.workbook = XLSX.read(data, {type: 'array'});
		this.workbook.SheetNames.forEach((sheetname, index) => {
			var w = new bricks.Text({text:sheetname, wrap:false});
			w.set_css('clickable');
			w.set_style('padding', '10px');
			w.bind('click', this.show_sheet_by_name.bind(this, sheetname, w));
			this.sheets_w.add_widget(w);
			if (index==0){
				this.show_sheet_by_name(this.workbook.SheetNames[0], w);
			}
		});
	}
	show_sheet_by_name(sheetname, tw){
		if (this.cur_sheetname == sheetname) return;
		this.sheets_w.children.forEach(c => c.set_css('selected', true));
		tw.set_css('selected');
		const x = new bricks.VScrollPanel({width: '100%', height: '100%'});
		const sheet = this.workbook.Sheets[sheetname];
		// const html = extractBodyContent(XLSX.utils.sheet_to_html(sheet));
		const html = XLSX.utils.sheet_to_html(sheet);
		x.dom_element.innerHTML = html;
		this.container.clear_widgets();
		this.container.add_widget(x);
		this.cur_sheetname = sheetname;
	}
}

bricks.PDFviewer = class extends bricks.VBox {
	/*
	url:
	*/
	constructor(opts){
		opts.width = '100%';
		super(opts);
		this.bind('on_parent', this.set_url.bind(this));
	}
	async set_url(url){
		var container = this.dom_element
		var hab = new bricks.HttpArrayBuffer();
		var ab = await hab.get(this.url);
		const task = pdfjsLib.getDocument({ data: ab });
		task.promise.then((pdf) => {
			this.pdf = pdf;
			for (let i = 1; i <= this.pdf.numPages; i++) {
				this.pdf.getPage(i).then((page) => {
					this.add_page_content(page);
				});
			}
		}).catch((err) => {
			console.log('error');
		})
	}
	add_page_content(page){
		const scale = 1.5;
		const viewport = page.getViewport({ scale });
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		canvas.height = viewport.height;
		canvas.width = viewport.width;
		page.render({ canvasContext: context, viewport });
		var w = new bricks.JsWidget();
		w.dom_element.appendChild(canvas);
		this.add_widget(w);
		if (i < this.pdf.numPages){
			w = new bricks.Splitter();
			this.add_widget(w)
		} 
	}
}
bricks.Factory.register('DOCXviewer', bricks.DOCXviewer);
bricks.Factory.register('EXCELviewer', bricks.EXCELviewer);
bricks.Factory.register('PDFviewer', bricks.PDFviewer);
bricks = window.bricks || {}

bricks.LlmMsgAudio = class extends bricks.UpStreaming {
	constructor(opts){
		super(opts);
		this.olddata = '';
		this.data = '';
		this.cn_p = ["。","，","！","？","\n"];
		this.other_p = [".",",","!","?","\n"];
		this.audio = AudioPlayer({})
	}
	detectLanguage(text) {
		try {
			const detector = new Intl.LocaleDetector();
			const locale = detector.detectLocaleOf(text);
			return locale.language;
		} catch (error) {
			console.error('无法检测语言:', error);
			return '未知';
		}
	}
	send(data){
		var newdata = data.slice(this.olddata.length);
		this.olddata = data;
		this.data += newdata;
		var lang = detectLaguage(this.data);
		var parts;
		if (lang='zh'){
			parts = this.data.split(this.cn_p).filter(part => part.trim()!== '');
		} else {
			parts = this.data.split(this.oter_p).filter(part => part.trim()!== '');
		}
		for(var i=0;i<parts.length - 1; i++){
			super.send(parts[i]);
		}
		this.data = parts[parts.length - 1];
	}
	async go(){
		var resp = await super.go();
		this.audio.set_source_from_response(resp);
		return resp;
	}
}
bricks.ModelOutput = class extends bricks.VBox {
	/* {
		icon:
	}
	完成模型输出的控件的初始化以及获得数据后的更新， 更新是的数据在流模式下，需要使用累积数据
	*/
	constructor(opts){
		if(! opts){
			opts = {};
		}
		opts.width = '100%';
		opts.height = 'auto';
		super(opts);
		var hb = new bricks.HBox({width:'100%', cheight:2});
		this.img = new bricks.Svg({
			rate:2,
			tip:this.opts.modelname,
			url:this.icon||bricks_resource('imgs/llm.svg')
		});
		hb.add_widget(this.img);
		var mname = new bricks.Text({text:this.opts.modelname});
		hb.add_widget(mname);
		this.add_widget(hb);
		
		this.content = new bricks.HBox({width:'100%'});
		this.add_widget(this.content);
		this.llmusageid = null;
		this.run = new bricks.BaseRunning({target:this, cheight:2, cwidth:2});
		this.content.add_widget(this.run);
		this.filler = new bricks.LlmOut({width: '100%', css: 'card'});
		this.filler.set_css('filler');
		this.content.add_widget(new bricks.BlankIcon({rate:2, flexShrink:0}));
		this.content.add_widget(this.filler);
		// this.content.add_widget(new bricks.BlankIcon({rate:2, flexShrink:0}));
		this.build_estimate_widgets();
	}
	build_estimate_widgets(){
		if (!this.estimate_url) return;
		this.estimate_w = new bricks.HBox({width:'100%', cheight:2});
		var txtw = new bricks.Text({
			otext:'结果满意吗？',
			i18n:true,
		});
		var likew = new bricks.Svg({rate:1.5, url:bricks_resource('imgs/praise.svg')});
		var unlikew = new bricks.Svg({rate:1.5, url:bricks_resource('imgs/criticize.svg')});
		likew.bind('click', this.estimate_llm.bind(this, likew, 1));
		unlikew.bind('click', this.estimate_llm.bind(this, unlikew, -1))
		this.estimate_w.add_widget(txtw);
		this.estimate_w.add_widget(likew);
		this.estimate_w.add_widget(new bricks.BlankIcon({rate:1, flexShrink:0}));
		this.estimate_w.add_widget(unlikew);
		likew.set_style('cursor', 'pointer');
		unlikew.set_style('cursor', 'pointer');
		this.add_widget(this.estimate_w);
		this.estimate_w.hide();
	}
	async estimate_llm(icon, val, event){
		var desc = {
			"widgettype":"urlwidget",
			"options":{
				"params":{
					"id":this.llmusageid,
					"value":val
				},
				"url":this.estimate_url
			}
		};
		icon.rate = 2;
		icon.charsize_sizing();
		var w = await bricks.widgetBuild(desc, this);
		this.estimate_w.disabled(true);
	}
	run_stopped(){
		if (this.run) {
			this.run.stop_timepass();
			this.content.remove_widget(this.run);
			this.run = null;
		}
	}
	async update_data(data){
		this.run_stopped();
		this.filler.update(data);
		if (data.llmusageid) {
			this.llmusageid = data.llmusageid
		}
		return;
	}
	finish(){
		console.log('finished')
	}
}

bricks.LlmModel = class extends bricks.JsWidget {
	/*
		{
			icon:
			model:
			url:
			params:
			user_message_format:
			system_message_format:
			llm_message_format:
			use_session:
			input_from:
			textvoice:
			tts_url:
			response_mode:stream, sync or async
		}
	*/
	constructor(llmio, opts){
		super(opts);
		this.llmio = llmio;
	}
	render_title(){
		var w = new bricks.HBox({padding:'15px'});
		w.bind('click', this.show_setup_panel.bind(this))
		var img = new bricks.Svg({
			rate:2,
			tip:this.opts.modelname,
			url:this.opts.icon||bricks_resource('imgs/llm.svg')
		});
		w.add_widget(img);
		// var txt = new bricks.Text({text:this.opts.modelname});
		// w.add_widget(txt);
		return w;
	}
	show_setup_panel(event){

	}
	inputdata2uploaddata(data){
		var d;
		if (data instanceof FormData){
			d = bricks.formdata_copy(data);
		} else {
			d = objcopy(data);
		}
		if (data instanceof FormData){
			if( ! this.llmio.model_inputed ) d.append('model', this.opts.model)
			d.append('llmid', this.opts.llmid)
			d.append('stream', this.opts.stream)
			if (this.llmio.enabled_kdb){
				Object.keys(this.llmio.kdb_setting).forEach(k =>{
					d.append(k, this.llmio.kdb_setting[k]);
				});
			}
		} else {
			if (! this.llmio.model_inputed) d.model = this.opts.model;
			d.llmid = this.opts.llmid;
			if (this.llmio.enabled_kdb){
				Object.keys(this.llmio.kdb_setting).forEach(k =>{
					d[k] = this.llmio.kdb_setting[k];
				});
			}
		}
		return d;
	}
	async model_inputed(data){
		var mout = new bricks.ModelOutput({
					textvoice:this.textvoice,
					tts_url:this.tts_url,
					icon:this.opts.icon,
					response_mode: this.opts.response_mode,
					model:this.opts.model, 
					modelname:this.opts.modelname,
					estimate_url:this.llmio.estimate_url
					});
		this.llmio.o_w.add_widget(mout);
		switch (this.response_mode) {
			case 'async':
				var d = this.inputdata2uploaddata(data);
				console.log('data_inouted=', data, 'upload_data=', d);
				var hj = new bricks.HttpJson()
				var resp = await hj.post(this.opts.url, {params:d});
				if (! resp) {
					mout.run_stopped();
					return;
				}
				mout.update_data(resp);
				if (resp.status == 'FAILED'){
					return;
				}
				await this.query_task_status(mout, resp.taskid)
				break;
			case 'stream':
				var d = this.inputdata2uploaddata(data);
				var hr = new bricks.HttpResponseStream();
				var resp = await hr.post(this.opts.url, {params:d});
				if (! resp) {
					mout.run_stopped();
					return;
				}
				await hr.handle_chunk(resp, this.chunk_response.bind(this, mout));
				this.chunk_ended();
				break;
			default:
				var d = this.inputdata2uploaddata(data);
				console.log('data_inouted=', data, 'upload_data=', d);
				var hj = new bricks.HttpJson()
				var resp = await hj.post(this.opts.url, {params:d});
				if (! resp) {
					mout.run_stopped();
					return;
				}
				mout.update_data(resp);
		}
		mout.estimate_w.show();
	}
	is_accept_source(source){
		if (this.opts.input_from == source){
			return true;
		}
		return false;
	}
	llm_msg_format(){
		return this.llm_message_format || {role:'assistant', content:"${content}"}
	}
	async query_task_status(mout, taskid){
		var pt = this.opts.period_time || 30 * 1000;
		while (true) {
			var hj = new bricks.HttpJson()
			var d = {
				taskid: taskid
			}
			var resp = await hj.post(this.opts.query_url, {params:d});
			if (! resp) {
				return;
			}
			mout.update_data(resp)
			if (resp.status != 'ok'){
				console.log('error:' + resp.data.message);
			}
			var data = resp.data.response
			mout.update_data(data);
			if (data.status == 'FAILED' || data.status == 'SUCCEEDED'){
				return;
			}
			await bricks.sleep(pt);
		}
	}
	chunk_response(mout, l){
		l = l.trim();
		try {
			var d = JSON.parse(l);
		} catch(e){
			console.log(l, 'is not a json data');
			return
		}
		if (this.opts.response_mode == 'async'){
			if (d.taskid){
				this.query_task_status(mout, d.taskid)
			}
		} 
		console.log('l=', l, 'd=', d);
		mout.update_data(d);
	}
	chunk_ended(){
		console.log('chunk end');
	}
}
bricks.LlmIO = class extends bricks.VBox {
	/*
	options:
	{
		user_icon:
		list_models_url:
		input_fields:
		models:
	}
	models:[
		{
			icon:
			model:
			modelnmae:
			url:
			params:
			use_session:
			system_prompt:
			user_parmpt:
			input_from:
			io_mode:stream, sync or async
		}
	]
	*/
	constructor(opts){
		super(opts);
		this.llmmodels = [];
		this.title_w = new bricks.HBox({cheight:3});
		var bottom_box = new bricks.HBox({cheight:3});
		this.i_w = new bricks.Svg({
				rate:2, 
				url:bricks_resource('imgs/input.svg'),
				margin:'14px',
				tip:'input data',
				css:'clickable'
		});
		this.nm_w = new bricks.Svg({
				rate:2, 
				url:bricks_resource('imgs/add.svg'), 
				margin:'14px',
				tip:'add new model',
				css:'clickable'
		});
		if (this.enabled_kdb){
			this.kdb_w = new bricks.Svg({
                rate:2,
                url:bricks_resource('imgs/kdb.svg'),
                margin:'14px',
                tip:'setup kdb config',
                css:'clickable'
			});
			bottom_box.add_widget(this.kdb_w);
			this.kdb_w.bind('click', this.setup_kdb.bind(this));
		}
		this.input_fields.forEach(f => {
			if (f.name == 'model') this.model_inputed = true;
		});
		bottom_box.add_widget(this.i_w);
		bottom_box.add_widget(this.nm_w);
		
		this.nm_w.bind('click', this.open_search_models.bind(this));
		this.i_w.bind('click', this.open_input_widget.bind(this));
		this.o_w = new bricks.Filler({overflow:'auto'});
		this.add_widget(this.title_w);
		this.add_widget(this.o_w);
		if (this.models.length < 2 && this.tts_url){
			this.textvoice = true;
		}
		this.add_widget(bottom_box);
		this.models.forEach( m =>{
			this.show_added_model(m);
		});
	}
    async show_input(params){
        var box = new bricks.HBox({width:'100%'});
        var data = inputdata2dic(params);
        console.log('data=', data);
        var w = new bricks.UserInputView({
			width: '100%',
			input_fields: this.input_fields,
			data:data
		});
        w.set_css(this.msg_css||'user_msg');
        w.set_css('filler');
        var img = new bricks.Svg({rate:2,url:this.user_icon||bricks_resource('imgs/chat-user.svg')}); 
        // box.add_widget(new bricks.BlankIcon({rate:2, flexShrink:0}));
        box.add_widget(w);
        box.add_widget(img);
        this.o_w.add_widget(box);
    }   

	show_added_model(m){
		if (this.textvoice){
			m.textvoice = true;
			m.tts_url = this.tts_url;
		}
		var lm = new bricks.LlmModel(this, m);
		this.llmmodels.push(lm);
		var tw = lm.render_title();
		this.title_w.add_widget(tw);
	}
	async open_search_models(event){
		event.preventDefault();
		event.stopPropagation();
		var rect = this.showRectage();
		var opts = {
			title:"select model",
			icon:bricks_resource('imgs/search.png'),
			auto_destroy:true,
			auto_open:true,
			auto_dismiss:false,
			movable:true,
			top:rect.top + 'px',
			left:rect.left + 'px',
			width: rect.right - rect.left + 'px',
			height: rect.bottom - rect.top + 'px'
		}
		var w = new bricks.PopupWindow(opts);
		var sopts = {
			data_url:this.list_models_url,
			data_params:{
				llmid:this.models[0].llmid,
				llmcatelogid:this.models[0].llmcatelogid
			},
			data_method:'POST',
			col_cwidth: 24,
			record_view:{
				widgettype:"VBox",
				options:{
					cheight:20,
					css:"card"
				},
				subwidgets:[
					{
						widgettype: "HBox",
						options: {
							cheight: 2
						},
						subwidgets: [
							{
								widgettype:"Svg",
								options: {
									url:"/appbase/show_icon.dspy?id=${iconid}"
								}
							},
							{
								widgettype:"Title6",
								options:{
									text:"${name}"
								}
							}
						]
					},
					{
						widgettype:"Filler",
						options:{
							css:"scroll"
						},
						subwidgets:[
							{
								widgettype:"VBox",
								options:{
									css:"subcard"
								},
								subwidgets:[
									{
										widgettype:"Text",
										options:{
											text:"模型描述：${description}",
											wrap:true
										}
									},
									{
										widgettype:"Text",
										options:{
											text:"启用日期：${enable_date}"
										}
									}
								]
							}
						]
					}
				]
			}
		};
		var cols = new bricks.Cols(sopts);
		cols.bind('record_click', this.add_new_model.bind(this));
		cols.bind('record_click', w.dismiss.bind(w));
		w.add_widget(cols);
		w.open();
	}
	async add_new_model(event){
		event.preventDefault();
		event.stopPropagation();
		var llm = event.params;
		this.models.push(llm);
		this.show_added_model(llm);
	}
	async setup_kdb(event){
		var data = this.kdb_setting
		if (! this.kdb_setting.prompt_tmpl){
			this.kdb_setting.prompt_tmpl = `将下面的提示词按照后面贴出的参考知识改写:

{{prompt}}

{% for r in records %}
参考{{loop.index}}:{{r.content}}

{% endfor %}`;
		}
		event.preventDefault();
		event.stopPropagation();
		var rect = this.showRectage();
		var opts = {
			title:"choose kdb",
			icon:bricks_resource('imgs/kdb.svg'),
			auto_destroy:true,
			auto_open:true,
			auto_dismiss:false,
			movable:true,
			top:rect.top + 'px',
			left:rect.left + 'px',
			width: rect.right - rect.left + 'px',
			height: rect.bottom - rect.top + 'px'
		}
		var w = new bricks.PopupWindow(opts);
		var fopts = {
			fields:[
				{
					"name": "kdbids",
					"value":data.kdbids,
					"uitype":"checkbox",
					"multicheck": true,
					"required": true,
					"label":"知识库",
					"valueField":"id",
					"textField":"name",
					"dataurl":this.get_kdb_url
				},
				{
					"name":"recall_cnt",
					"uitype":"int",
					"value": data.recall_cnt,
					"label":"召回数量"
				},
				{
					"name":"prompt_tmpl",
					"value":data.prompt_tmpl,
					"uitype":"text",
					"required": true,
					"label":"模版"
				}
			]
		}
		var fw = new bricks.Form(fopts);
		fw.bind('submit', this.handle_kdb_setup.bind(this));
		fw.bind('submit', w.destroy.bind(w));
		w.add_widget(fw);
		w.open();
	}
	async handle_kdb_setup(event){
		event.preventDefault();
		event.stopPropagation();
		this.kdb_setting = formdata2object(event.params);
		console.log('kdb_setting=', this.kdb_setting);
	}
	async open_input_widget(event){
		event.preventDefault();
		event.stopPropagation();
		var rect = this.showRectage();
		var opts = {
			title:"input data",
			icon:bricks_resource('imgs/input.svg'),
			auto_destroy:true,
			auto_open:true,
			auto_dismiss:false,
			movable:true,
			top:rect.top + 'px',
			left:rect.left + 'px',
			width: rect.right - rect.left + 'px',
			height: rect.bottom - rect.top + 'px'
		}
		var w = new bricks.PopupWindow(opts);
		var fopts = {
			fields:this.input_fields
		}
		var fw = new bricks.Form(fopts);
		fw.bind('submit', this.handle_input.bind(this));
		fw.bind('submit', w.destroy.bind(w));
		w.add_widget(fw);
		w.open();
	}
	async handle_input(event){
		var params = event.params;
		this.show_input(params);
		for(var i=0;i<this.llmmodels.length;i++){
			var lm = this.llmmodels[i];
			schedule_once(lm.model_inputed.bind(lm, params), 0.01);
		};
	}
}

bricks.Factory.register('LlmIO', bricks.LlmIO);
var bricks = window.bricks || {}
bricks.WebSocket = class extends bricks.VBox {
	/*
	options = {
		ws_url:
		with_session:
	}
	event:
		onopen:
		onmessage:
		onerror:
		onclose:
		ontext:
		onbase64audio
		onbase64video
	*/
	constructor(opts){
		super(opts);
		if (opts.with_session){
			var session =  bricks.app.get_session();
			this.ws = new WebSocket(this.ws_url, session);
		} else {
			this.ws = new WebSocket(this.ws_url);
		}
		this.ws.onopen = this.on_open.bind(this);
		this.ws.onmessage = this.on_message.bind(this);
		this.ws.onclose = this.on_close.bind(this);
		this.ws.onerror = this.on_error.bind(this);
	}
	on_open(e){
		this.dispatch('onopen');
		console.log("open");
	}
	on_close(e){
		this.dispatch('onclose');
		console.log("close");
	}
	on_error(e){
		this.dispatch('onerror');
		console.log(e);
	}
	on_message(e){
		var d = JSON.parse(e.data);
		var eventname = 'on' + d.type;
		this.dispatch(eventname, d.data);
	}
	send_text(text){
		var d = {
			type: "text",
			data: text
		}
		this.send(d);
	}
	send_base64_video(b64video){
		var d = {
			type: "base64video",
			data: b64video
		}
		this.send(d);
	}
	send_base64_audio(b64audio){
		var d = {
			type: "base64audio",
			data: b64audio
		}
		this.send(d);
	}
	send_typedata(type, data){
		var d = {
			type:type,
			data:data
		}
		return send(d);
	}
	send(d){
		/* d is a object:
		{
			type:
			data:
		}
		*/
		var s = JSON.stringify(d);
		this.ws.send(s);
	}
}
bricks.Factory.register('WebSocket', bricks.WebSocket);

var bricks = window.bricks || {};

bricks.DataRow = class extends bricks.HBox {
	/*
	{
		toolbar:[
		]
		fields:[]
		css
		browserfields{
			exclouded:[],
			cwidth:{
				field:10,
				field2:11
			}
		}
		editexclouded:[],
		header_css
	}
	*/
	constructor(opts){
		super(opts);
		this.record_w = null;
	}
	render_header(){
		this.render(true);
	}
	render_data(){
		this.render(false);
	}
	render(header){
		// this.build_toolbar(header);
		if (this.checkField){
			var w;
			if (header){
				w = new bricks.BlankIcon({});
			} else {
				var v = 0
				if (this.user_data){
					v = this.user_data[this.checkField];
				}
				w = new bricks.UiCheck({name:this.checkField,value:v});
				w.bind('changed', this.get_check_state.bind(this));
			}
			this.add_widget(w);
		}
		this.build_fields(header);
	}
	renew(record){
		this.user_data = record;
		this.record_w.clear_widgets();
		this._build_fields(false, this.record_w);
	}
	get_check_state(e){
		var d = e.target.bricks_widget.getValue()
		this.user_data[this.checkField] = d[this.checkField];
		this.dispatch('check_changed', this);
	}
	build_toolbar(header){
		var tools = [];
		if (header){
			if (this.toolbar){
				this.toolbar.tools.forEach(t => {
					tools.push({name:'blankicon'});
				});
			}
		} else {
			if (this.toolbar){
				this.toolbar.tools.forEach(t => {
					tools.push(t);
				});
			}
		}
		var toolbar = bricks.extend({cwidth:2.5}, this.toolbar || {});
		toolbar.tools = tools;
		var w = new bricks.IconBar(toolbar);
		this.add_widget(w);
		this.toolbar_w = w;
		this.event_names = []
		for(var i=0;i<tools.length;i++){
			if (tools[i].name != 'blankicon'){
				this.event_names.push(tools[i].name);
				w.bind(tools[i].name, this.my_dispatch(tools[i].name));
			}
		}
	}
		
	my_dispatch(e){
		this.dispatch(e);
	}
	build_fields(header, cw){
		this.record_w = new bricks.HBox({height:'auto'});
		this.record_w.set_css('childrensize');
		this.add_widget(this.record_w);
		this._build_fields(header, this.record_w);
	}
	_build_fields(header, cw){
		var exclouded = [];
		var cwidths = {};
		if (this.browserfields && this.browserfields.exclouded){
			exclouded = this.browserfields.exclouded;
		}
		if (this.browserfields && this.browserfields.cwidths){
			cwidths = this.browserfields.cwidths;
		}
		if (this.checkField){
			exclouded.push(this.checkField);
		}
		for (var i=0;i<this.fields.length;i++){
			var f = this.fields[i]
			if (exclouded.includes(f.name)){
				continue;
			}
			var opts = bricks.extend({
				margin:'1px'
			}, f);
			if (header || ! this.user_data){
				opts.value = f.label || f.name;
			} else {
				opts.user_data = this.user_data;
				opts.value = opts.tip = this.user_data[f.name];
			}
			opts.cwidth = cwidths[f.name] ||f.cwidth || 10;
			var f = bricks.get_ViewBuilder(f.uitype);
			if (!f) f = bricks.get_ViewBuilder('str');
			var w = f(opts);
			w.set_css('tabular-cell');
			cw.add_widget(w)
		}
	}
}

bricks.Factory.register('DataRow', bricks.DataRow);
var bricks = window.bricks || {};
bricks.Tabular = class extends bricks.DataViewer {
	constructor(opts){
		super(opts);
		this.bind('row_check_changed', this.show_check_event_data.bind(this));
	}
	async build_other(){
		this.get_edit_fields();
	}
	async before_data_handle(){
		await this.build_header_row();
		this.data_offset = 1;
	}
	async build_header_row(){
		var options = bricks.extend({cheight:this.cheight}, this.row_options);
		var dr = new bricks.DataRow(options);
		dr.render(false);
		dr.set_css('tabular-header-row');
		this.scrollpanel.add_widget(dr);
	}
	async build_record_view(record){
		var r = await this.build_info(record);
		if (!this.content_view){
			r.user_data = record;
			r.bind('click', this.record_clicked.bind(this, r, record));
			return r;
		}
		var row = new bricks.VBox({
		});
		row.add_widget(r);
		var content = new bricks.VBox({
			height:'auto',
			display:'none'
		});
		row.add_widget(content);
		r.bind('click', this.record_clicked.bind(this, row, record));
		row.rec_widget = r;
		row.content_widget = content;
		row.user_data = record;
		return row
	}
	async record_clicked(row, record, event){
		var r = event.target.bricks_widget;
		bricks.debug('record_clicked', 'row=', row, 'record=', record, 'target=', event.target, 'targetWidget=', r);
		// Prevent click on interactive elements (links, buttons, inputs) from triggering selection
		var target = event.target;
		if (target && (target.tagName === 'A' || target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')) {
			bricks.debug('record_clicked: skip interactive element', target.tagName);
			return;
		}
		
		var old_select_row = this.select_row;
		if (old_select_row){
			this.select_row = null;
			if (this.content_view){
				await this.toggle_content(old_select_row, false);
				old_select_row.rec_widget.set_css('tabular-row-selected', true);
			} else {
				old_select_row.set_css('tabular-row-selected', true);
			}
		}
		if (old_select_row != row){
			this.select_row = row;
			if (this.content_view){
				row.rec_widget.set_css('tabular-row-selected');
				await this.toggle_content(row, true);
			} else {
				row.set_css('tabular-row-selected');
			}
			bricks.debug('record_clicked: row selected, dispatching row_selected');
			this.dispatch('row_selected', row.user_data);
		}
	}
	async toggle_content(row, flag){
		if (flag){
			row.content_widget.show();
			row.content_widget.clear_widgets();
			var desc = objcopy(this.content_view);
			desc = bricks.apply_data(desc, row.user_data);
			var w = await bricks.widgetBuild(desc, row.content_widget);
			if (w){
				row.content_widget.add_widget(w);
			}
		} else {
			row.content_widget.hide();
			row.content_widget.clear_widgets();
		}
	}
	get_edit_fields(){
		var fs = this.row_options.fields;
		this.fields = [];
		var exclouded = [];
		if (this.row_options.editexclouded){
			exclouded = this.row_options.editexclouded;
		}
		fs.forEach(f => {
			if (!exclouded.includes(f.name)){
				this.fields.push(f);
			}
		});
	}

	async build_info(record){
		var header = true;
		var options = bricks.extend({cheight:this.cheight}, this.row_options);
		if (record){
			options.user_data = record;
			header = false;
		}
		var dr = new bricks.DataRow(options);
		dr.set_css('tabular-row');
		dr.render(header);
		/*
		dr.event_names.forEach(e => {
			dr.toolbar_w.bind(e, this.record_event_handle.bind(this, e, record, dr));
		});
		*/
		dr.bind('check_changed', this.record_check_changed.bind(this));
		return dr;
	}
	record_check_changed(event){
		this.check_changed_row = event.params;
		this.dispatch('row_check_changed', event.params.user_data);
	}
	async renew_record_view(form, row){
		var d = form._getValue();
		var record = bricks.extend(row.user_data, d);
		if (this.content_view){
			row.rec_widget.renew(record);
		} else {
			row.renew(record);
		}
	}
	record_event_handle(event_name, record, row, item){
		console.log('event_name=', event_name, 'record=', record);
		this.dispatch(event_name, record);
	}
	get_hidefields(){
		var fs = [];
		var params = this.data_params || {};
		for (var k in params){
			fs.push({name:k, value:params[k], uitype:'hide'});
		}
		return fs;
	}
}

bricks.Factory.register('Tabular', bricks.Tabular);
var bricks = window.bricks || {};

bricks.ContinueAudioPlayer = class extends bricks.VBox {
    constructor(options) {
	super(options);
        this.ws_url = options.ws_url;
        this.options = options || {};
        this.audioContext = null;
        this.gainNode = null;
        this.nextStartTime = 0;
        this.started = false;
        this.muted = false;
        this.volume = 1.0;

        this.initAudioContext();
    }

    initAudioContext() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.volume;
        this.gainNode.connect(this.audioContext.destination);

        this.nextStartTime = this.audioContext.currentTime;
        this.started = true;
    }

    base64ToArrayBuffer(base64) {
        const binaryStr = atob(base64);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }
        return bytes.buffer;
    }

    handleAudioTrack(arrayBuffer) {
        this.audioContext.decodeAudioData(arrayBuffer).then(decodedBuffer => {
            const source = this.audioContext.createBufferSource();
            source.buffer = decodedBuffer;
            source.connect(this.gainNode);

            const startTime = Math.max(this.audioContext.currentTime, this.nextStartTime);
            source.start(startTime);

            this.nextStartTime = startTime + decodedBuffer.duration;

            if (typeof this.options.onStart === 'function') {
                this.options.onStart();
            }

            source.onended = () => {
                if (typeof this.options.onEnd === 'function') {
                    this.options.onEnd();
                }
            };
        }).catch(err => {
            console.error("Error decoding audio data:", err);
        });
    }

    /**
     * ⏸ 暂停播放
     */
    pauseAudio() {
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend().then(() => {
                if (typeof this.options.onPause === 'function') {
                    this.options.onPause();
                }
            });
        }
    }

    /**
     * ▶️ 恢复播放
     */
    resumeAudio() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                if (typeof this.options.onResume === 'function') {
                    this.options.onResume();
                }
            });
        }
    }

    /**
     * 🔁 重新开始播放
     */
    restart() {
        console.log("Restarting audio playback...");
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close().then(() => {
                this.initAudioContext();
            });
        } else {
            this.initAudioContext();
        }
    }

    /**
     * 🔊 设置音量（0.0 - 1.0）
     */
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.gainNode) {
            this.gainNode.gain.value = this.muted ? 0 : this.volume;
        }
        this.emit('onVolumeChange', this.volume);
    }

    /**
     * 🔇 切换静音
     */
    toggleMute() {
        this.muted = !this.muted;
        this.gainNode.gain.value = this.muted ? 0 : this.volume;
        this.emit('onVolumeChange', this.muted ? 0 : this.volume);
    }

    /**
     * 🧩 触发事件回调
     */
    emit(eventName, ...args) {
        if (typeof this.options[eventName] === 'function') {
            this.options[eventName](...args);
        }
    }
}

bricks.Factory.register('ContinueAudioPlayer', bricks.ContinueAudioPlayer);
var bricks = window.bricks || {};

bricks.ChartLine = class extends bricks.EchartsExt {
	/*
	{
		data_url,
		data_params,
		method,
		data,
		line_options,
		nameField,
		valueFields
	}
	*/
	values_from_data(data, name){
		var d = [];
		data.forEach(x => {
			d.push(x[name]);
		});
		return d;
	}
	lineinfo_from_data(data, name){
		return {
			name:name,
			type:'line',
			data:this.values_from_data(data, name)
		}
	}
	setup_options(data){
		var n_data = [];
		var series = [];
		this.valueFields.forEach(v => {
			series.push(this.lineinfo_from_data(data, v));
		});
		data.forEach(d => {
			n_data.push(d[this.nameField]);
		});
		var opts = {
			tooltip:{
				trigger:'axis'
			},
			legend:{
				data:this.valueFields
			},
			xAxis:{
				type:'category',
				data: n_data
			},
			yAxis:{
				type: 'value'
			},
			series:series
		}
		return opts;
	}
}

bricks.Factory.register('ChartLine', bricks.ChartLine);
var bricks = window.bricks || {};

bricks.ChartPie = class extends bricks.EchartsExt {
	/*
	{
		title:
		description:
		legend:
		pie_optiosn:
		data_url:
		nameField:
		valueFields:
		data_params:
		data:[]
	}
	event:element_click

	*/
	constructor(opts){
		super(opts);
	}
	setup_options(data){
		var nd = [];
		data.forEach(d => {
			var x = {};
			x.value = d[this.valueFields[0]];
			x.name = d[this.nameField];
			nd.push(x);
		});
		var s_opts = bricks.extend({}, this.pie_options);
		s_opts.data = nd;
		var legend = this.legend || {};
		// legend.data = this.valueFields;
		var options = {
			legend:legend,
			tooltip:{
				trigger: 'item'
			},
			series:[
				s_opts
			]
		}
		return options;
	}
}

bricks.Factory.register('ChartPie', bricks.ChartPie);
var bricks = window.bricks || {};

bricks.ChartBar = class extends bricks.EchartsExt {
	/*
	{
		data_url,
		data_params,
		method,
		data,
		nameField,
		valueFields
	}
	*/
	values_from_data(data, name){
		var d = [];
		data.forEach(x => {
			d.push(x[name]);
		});
		return d;
	}
	
	lineinfo_from_data(data, name){
		return {
			name:name,
			type:'bar',
			data:this.values_from_data(data, name)
		}
	}
	setup_options(data){
		var n_data = [];
		var series = [];
		this.valueFields.forEach(v => {
			series.push(this.lineinfo_from_data(data, v));
		});
		data.forEach(d => {
			n_data.push(d[this.nameField]);
		});
		var opts = {
			tooltip:{
				trigger:'axis'
			},
			legend:{
				data:this.valueFields
			},
			xAxis:{
				type:'category',
				data: n_data
			},
			yAxis:{
				type: 'value'
			},
			series:series
		}
		return opts;
	}
}

bricks.Factory.register('ChartBar', bricks.ChartBar);
var bricks = window.bricks || {}

bricks.GobangPoint = class extends bricks.Image {
	/*
		p_status: 0:empty, 1:black, 2:white
		p_x: horontical position from 1 to 15
		p_y: verical position, from 1 to 15
	*/
	constructor(opts){
		super(opts);
		var url = this.calc_url();
		this.set_url(url);
		this.bind('mouseover', this.set_current_position.bind(this, true));
		this.bind('mouseout', this.set_current_position.bind(this, false));
	}
	set_current_position(flg, event){
		this.set_css('curpos', !flg);
	}

	calc_url(){
		var one, two, st;
		switch(this.p_status){
			case 0:
				st = 'empty';
				break;
			case 1:
				st = 'black';
				break;
			case 2:
				st = 'white';
				break;
		}
		switch(this.p_y){
			case 1:
				one = "t";
				break;
			case 15:
				one = "b";
				break;
			default:
				one = "c"
		}
		switch(this.p_x){
			case 1:
				two = "l";
				break;
			case 15:
				two = "r";
				break;
			default:
				two = "c"
		}
		var name = 'imgs/' + one + two + '_' + st + '.png';
		// console.log(name, this.p_x, this.p_y, one, two);
		return bricks_resource(name);
	}
	getValue(){
		return {
			status:this.p_status,
			x:this.p_x,
			y:this.p_y
		}
	}
	str(){
		return '(' + this.p_status + ',' + this.p_x + ',' + this.p_y + ')';
	}
}
bricks.Gobang = class extends bricks.VBox {
	/*
	player:{
		"name":"ttt",
		"type":"user", "llm"
		"url":
		"delay":seconds
		"params":
	}
	{
		black_player:{}
		white_player:{}
	}
	*/
	constructor(opts){
		super(opts);
		this.filler = new bricks.Filler({});
		this.add_widget(this.filler);
		this.render_empty_area()
		this.inform_go('black')
		this.filler.bind('element_resize', this.resize_area.bind(this));
	}
	resize_area(){
		var ele = this.filler.dom_element;
		var siz = Math.min(ele.clientWidth, 
					ele.clientHeight)/ 15;
		console.log(siz, ele.clientWidth, ele.clientHeight);
		for(var i=0;i<15;i++){
			for(var j=0;j<15;j++){
				var w = this.area[i][j];
				w.set_style('width', siz+'px');
				w.set_style('height', siz+'px');
			}
		}
	}
	inform_go(party){
	}
	render_empty_area(){
		this.area = [];
		var vbox = new bricks.VBox({});
		vbox.h_center();
		for (var i=1; i<=15; i++){
			var hbox = new bricks.HBox({})
			vbox.add_widget(hbox);
			var l = [];
			for (var j=1; j<=15; j++){
				var w = new bricks.GobangPoint({
					p_status:0,
					tip: '(' + i + ',' + j + ')',
					p_x: j,
					p_y: i
				});
				hbox.add_widget(w);
				l.push(w);
			}
			this.area.push(l);
		}
		this.filler.add_widget(vbox);
	}
}

bricks.Factory.register('Gobang', bricks.Gobang);
var bricks = window.bricks || {};
bricks.str2date = function(sdate){
	let [year, month, day] = sdate.split("-");
	var dateObj = new Date(year, month - 1, day);
	return dateObj;
}
bricks.date2str = function(date){
	let year = date.getFullYear();
	let month = String(date.getMonth() + 1).padStart(2, '0');
	let day = String(date.getDate()).padStart(2, '0');
	let formattedDate = `${year}-${month}-${day}`;
	return formattedDate;
}
bricks.addMonths = function(dateObj, months){
    var newDate = new Date(dateObj);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
}
bricks.addYears = function(dateObj, years){
	const newDate = new Date(dateObj);
    newDate.setYear(newDate.getYear() + years);
    return newDate;
}
bricks.addDays = function(dateObj, days){
	var newdate = new Date(dateObj);
	newdate.setDate(newdate.getDate() + days);
	return newdate;
}

bricks.PeriodDays = class extends bricks.HBox {
	/*
	{
		start_date:
		end_date:
		step_type: 'days', 'months', 'years'
		step_cnt:
		title:'',
		splitter:' -- ' 
	}
	event: 'changed';
	*/
	constructor(opts){
		opts.splitter = opts.splitter || ' 至 ';
		opts.step_cnt = opts.step_cnt || 1;
		super(opts);
		this.start_w = new bricks.Text({
			text:opts.start_date
		});
		this.end_w = new bricks.Text({
			text:opts.end_date
		});
		this.start_w.set_css('clickable');
		this.end_w.set_css('clickable');
		this.start_w.bind('click', this.step_back.bind(this));
		this.end_w.bind('click', this.step_forward.bind(this));
		if (this.title){
			this.add_widget(new bricks.Text({otext:this.title, i18n:true}));
		}
		this.add_widget(this.start_w);
		this.add_widget(new bricks.Text({
			otext:this.splitter, 
			i18n:true
		}));
		this.add_widget(this.end_w);
	}
	date_add(strdate, step_cnt, step_type){
		var date = bricks.str2date(strdate);
		switch(step_type){
			case 'years':
				var nd = bricks.addYears(date, step_cnt);
				return bricks.date2str(nd);
				break;
			case 'months':
				var nd = bricks.addMonths(date, step_cnt);
				return bricks.date2str(nd);
				break;
			default:
				var nd = bricks.addDays(date, step_cnt);
				return bricks.date2str(nd);
				break;
		}
	}
	step_back(){
		this.start_date = this.date_add(this.start_date, -this.step_cnt, this.step_type);
		this.end_date = this.date_add(this.end_date, -this.step_cnt, this.step_type);
		this.start_w.set_text(this.start_date);
		this.end_w.set_text(this.end_date);
		this.dispatch('changed', {start_date:this.start_date, end_date:this.end_date});
	}
	step_forward(){
		this.start_date = this.date_add(this.start_date, this.step_cnt, this.step_type);
		this.end_date = this.date_add(this.end_date, this.step_cnt, this.step_type);
		this.start_w.set_text(this.start_date);
		this.end_w.set_text(this.end_date);
		this.dispatch('changed', {start_date:this.start_date, end_date:this.end_date});
	}
}

bricks.Factory.register('PeriodDays', bricks.PeriodDays);
var bricks = window.bricks || {};
bricks.IconbarPage = class extends bricks.VBox {
	/*
	opts={
		bar_opts:
		bar_at: top or bottom
	}
	bar_opts:{
		margin:
		rate:
		tools:
	}
	tools = [
		tool, ...
	]
	tool = {
		name:
		icon:
		label: optional
		tip,
		dynsize
		rate:
		content:
	}
	*/
	
	constructor(opts){
		opts.height = '100%'
		opts.bar_at = opts.bar_at || 'top';
		super(opts);
		var bar = new bricks.IconTextBar(this.bar_opts);
		this.content = new bricks.Filler({});
		if (this.bar_at == 'top'){
			this.add_widget(bar);
			this.add_widget(this.content);
		} else {
			this.add_widget(this.content);
			this.add_widget(bar);
		}
		bar.bind('command', this.command_handle.bind(this))
		schedule_once(this.show_content.bind(this, this.bar_opts.tools[0]), 0.1);
	}
	async command_handle(event){
		var tool = event.params;
		await this.show_content(tool);
	}
	async show_content(tool){
		var w = await bricks.widgetBuild(tool.content, this);
		if (w && ! w.parent) {
			this.content.clear_widgets();
			this.content.add_widget(w);
		}
	}
}

bricks.Factory.register('IconbarPage', bricks.IconbarPage);
var bricks = window.bricks || {};

bricks.KeyPress = class extends bricks.VBox {
	constructor(opts){
		super(opts);
		bricks.app.bind('keydown', this.key_handler.bind(this));
	}
	key_handler(event){
		var key = event.key;
		if (!key) return;
		this.clear_widgets();
		var w = new bricks.Text({text:'key press is:' + key});
		this.add_widget(w)
	}
}

bricks.Factory.register('KeyPress', bricks.KeyPress);

var bricks = window.bricks || {};
bricks.ASRClient = class extends bricks.VBox {
	/*
	options:
	{
		start_icon:record.png, 
		stop_icon:stop.png
		ws_url:
		icon_options
		ws_params:
	}
	event:
	start: start recording, no params
	stop:	stop recording, no params
	transtext: recognised text, params={
		"content":
		"speaker":
		"start":
		"end":
	}
	*/
	constructor(opts){
		super(opts);
		var icon_options = this.icon_options || {};
		icon_options.url = this.start_icon || bricks_resource('imgs/start_recording.svg');
		this.icon = new bricks.Svg(icon_options);
		this.status = 'stop';
		this.icon.bind('click', this.toggle_button.bind(this));
		this.add_widget(this.icon);
		var sessdata = bricks.app.get_session();
		this.socket = new WebSocket(this.ws_url, sessdata);
		this.socket.onmessage = this.response_data.bind(this);
		this.bind('transtext', this.response_log.bind(this));
	}
	response_log(event){
		console.log('response data=', event.params);
	}
	toggle_button(){
		if (this.status == 'stop'){
			this.icon.set_url(this.start_icon||bricks_resource('imgs/stop_recording.svg'));
			this.status = 'start';
			this.start_recording();
		} else {
			this.icon.set_url(this.stop_icon||bricks_resource('imgs/start_recording.png'));
			this.status = 'stop';
			this.stop_recording();
		}
	}
	async start_recording() {
		this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		this.mediaRecorder = new MediaRecorder(this.stream);
		this.mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) {
				// 将音频数据通过 WebSocket 发送到服务器
				blobToBase64(event.data).then((b64str) => {
					var d = objcopy(this.ws_params);
					d.type = 'audiobuffer';
					d.data = b64str;
					this.socket.send(JSON.stringify(d));
				}).catch((error) => {
					console.log('Error', error);
				});
			}
		}
		this.mediaRecorder.start(1000); // 每 1 秒发送一次数据
	}
	stop_recording(){
		this.mediaRecorder.stop();
	}
	response_data(event){
		var d = JSON.parse(event.data);
		this.dispatch('transtext', d);
	}
}

bricks.Factory.register('ASRClient', bricks.ASRClient);
var bricks = window.bricks || {};

bricks.WebTTS = class extends bricks.VBox {
	constructor(opts){
		super(opts);
	}
	speak(text){
		// 检查浏览器是否支持SpeechSynthesis
		if ('speechSynthesis' in window) {
		  var utterance = new SpeechSynthesisUtterance(text);
		  // 设置语音属性，例如语言
		  utterance.lang = bricks.app.lang;
		  utterance.pitch = 1;
		  utterance.rate = 1;
		  utterance.onstart = function(event) {
			console.log('语音合成开始');
		  };
		  // 当语音合成结束时触发
		  utterance.onend = function(event) {
			console.log('语音合成结束');
		  };
		  // 当语音合成出错时触发
		  utterance.onerror = function(event) {
			console.error('语音合成出错:', event.error);
		  };
		  // 将utterance添加到语音合成队列
		  window.speechSynthesis.speak(utterance);
		} else {
		  console.error('浏览器不支持SpeechSynthesis');
		}
	}
}

bricks.WebASR = class extends bricks.VBox {
	constructor(opts){
		super(opts);
		this.reognition = None;
	}
	start_recording(){
		// 检查浏览器是否支持SpeechRecognition
		if ('SpeechRecognition' in window) {
		  // 创建SpeechRecognition实例
		  this.recognition = new SpeechRecognition();
		  // 处理识别错误
		  this.recognition.onerror = function(event) {
			console.error('识别错误:', event.error);
		  };
		  // 处理语音识别结束事件
		  this.recognition.onend = function() {
			console.log('语音识别已结束');
		  };
		  // 处理识别结果
		  this.recognition.onresult = function(event) {
			var transcript = event.results[0][0].transcript;
			this.dispatch('asr_result', {
				content:transcript
			});
			console.log('识别结果:', transcript);
		  };
		  this.recognition.lang = bricks.app.lang;
		  this.recognition.start();
		} else {
			console.log('browser has not SpeechRecognition');
		}
	}
	stop_recording(){
		this.recognition.stop();
	}
}

bricks.Factory.register('WebTTS', bricks.WebTTS);
bricks.Factory.register('WebASR', bricks.WebASR);

var bricks = window.bricks || {};

bricks.formatTime = function(seconds) {
	let hrs = Math.floor(seconds / 3600);
	let mins = Math.floor((seconds % 3600) / 60);
	let secs = seconds % 60;

	return [
		hrs.toString().padStart(2, '0'),
		mins.toString().padStart(2, '0'),
		secs.toString().padStart(2, '0')
	].join(':');
}
bricks.TimePassed = class extends bricks.VBox {
	constructor(opts){
		super(opts);
		this.seconds = 0;
		var t = bricks.formatTime(this.seconds);
		this.text_w = new bricks.Text({
			text:t, 
			rate:this.text_rate
		});
		this.add_widget(this.text_w);
	}
	start(){
		this.task = schedule_interval(this.add_one_second.bind(this), 1);
	}
		
	add_one_second(){
		this.seconds += 1;
		var t = bricks.formatTime(this.seconds);
		this.text_w.set_text(t);
	}
	stop(){
		clearInterval(this.task);
		this.task = null;
	}
}
bricks.Countdown = class extends bricks.VBox {
	/* 
	options:
		limit_time: 01:00:00
		text_rate:
	event:
		timeout
		timeout event is fired after the countdown time is over.
	method:
		start
		start method is to start the countdown, step is 1 secord
	*/
	constructor(opts){
		super(opts);
		var parts = opts.limit_time.split(':');
		var hours, minutes, seconds;
		switch(parts.length){
			case 0:
				hours = 0;
				minutes = 0;
				seconds = 0;
				break;
			case 1:
				hours = 0;
				minutes = 0;
				seconds = parseInt(parts[0])
				break;
			case 2:
				hours = 0;
				minutes = parseInt(parts[0]);
				seconds = parseInt(parts[1])
				break;
			case 3:
			default:
				hours = parseInt(parts[0]);
				minutes = parseInt(parts[1]);
				seconds = parseInt(parts[2])
				break;
		}
		this.seconds = hours * 3600 + minutes * 60 + seconds;
		this.text_w = new bricks.Text({
			text:this.limit_time, 
			rate:this.text_rate
		});
		this.add_widget(this.text_w);
	}
	start(){
		this.task = schedule_interval(this.time_down_second.bind(this), 1)
	}
	stop(){
		if (this.task){
			clearInterval(this.task);
		}
		this.task = null;
	}
	time_down_second(){
		var h, m, s;
		this.seconds -= 1;
		var ts = bricks.formatTime(this.seconds);
		this.text_w.set_text(ts);
		if (this.seconds < 1){
			this.stop();
			this.dispatch('timeout');
		}
	}
}

bricks.Factory.register('Countdown', bricks.Countdown);
bricks.Factory.register('TimePassed', bricks.TimePassed);
var bricks = window.bricks || {};

bricks.ProgressBar = class extends bricks.HBox {
	/*
	options:
		total_value
		bar_cwidth
	event:
	*/
	constructor(opts){
		super(opts);
		this.set_css('progress-container');
		this.text_w = new bricks.Text({text:'0%', cheight:this.bar_cwidth||2});
		this.text_w.set_css('progress-bar')
		this.add_widget(this.text_w);
	}
	set_value(v){
		var pzt =  this.total_value ? (v / this.total_value) * 100 : 0;
		pzt = Math.max(0, Math.min(100, pzt));
		this.text_w.set_style('width', pzt + '%')
	}
}
bricks.Factory.register('ProgressBar', bricks.ProgressBar);

bricks = window.bricks || {};

bricks.QAFrame = class extends bricks.VBox {
	/*
	{
		ws_url:
		ws_params:
		title:
		description:
		courseware:{
			type: "audio" or "video", "image", "markdown"
			url:
			timeout:
		}
		timeout:0 no timeout, number in seconds
		"accept data type"
		1:
			type:courseware:
			data:{
				type:
				url:
			}
		2:
			type:askready
			data:{
				total_q
				cur_q
			}
		3:
			type:question
			data: {
				q_desc:
				total_q:
				cur_q
			}
		4:
			type:result
			data: {
				total_q:
				correct_cnt:
				error_cnt
			}
		5:
			type:error_list,
			data: {
				error_cnt,
				rows:[
					{
						pos:
						q_desc:
						your_a:
						corrent_a:
						error_desc:
					}
				]
			}

		send message:
		1: 
			type: qa_start
			data:null

		2:
	}
	*/
	constructor(opts){
		super(opts);
		this.top_w = new bricks.HBox({
			cheight:2
		});
		this.bottom_w = new bricks.HBox({
			cheight:2
		});
		this.main_w = new bricks.Filler({});
		this.add_widget(this.top_w);
		this.add_widget(this.main_w);
		this.add_widget(this.bottom_w);
		var url = this.ws_url;
		if (this.ws_params){
			url += '?' + new URLSearchParams(this.ws_params).toString();
		}
		this.ws = new bricks.WebSocket({
				ws_url:url
		});
		this.ws.bind('onopen', this.start_question_answer.bind(this));
		this.ws.bind('onquestion', this.show_question.bind(this));
		this.ws.bind('oncourseware', this.show_courseware.bind(this));
		this.ws.bind('onaskstart', this.show_conform.bind(this));
		this.ws.bind('oncourseware', this.show_courseware.bind(this));
		this.ws.bind('oncourseware', this.show_courseware.bind(this));
	}
	show_question(d){
		console.log('show_question(), d=', d);
		this.qtotal_w.set_text(str(d.total_q));
		this.qcur_w.set_text(str(d.cur_q));
		var w = bricks.widgetBuild(d.q_desc, this);
		this.main_w.clear_widgets();
		if (w){
			this.main_w.add_widget(w);
		}
	}
	show_courseware(d){
		var w;
		this.main_w.clear_widgets();
		console.log('show_courseware(), d=', d);
		switch(d.type){
			case 'video':
				w = new bricks.Video({
					width:'100%',
					height:'100%',
					url:d.url,
					autoplay:true
				});
				break;
			case 'audio':
				w = new bricks.AudioPlayer({
					width:'100%',
					height:'100%',
					url:d.url,
					autoplay:true
				});
				break;
			case 'image':
				w = new bricks.Image({
					width:'100%',
					height:'100%',
					url:d.url,
				});
				break;
			case 'markdown':
				w = new bricks.MdWidget({
					height:'100%',
					width:'100%',
					md_url: d.url
				});
				break;
		}
		this.main_w.add_widget(w);
	}
	show_conform(d){
		this.main_w.clear_widgets();
		var btn = new bricks.Button({
			label: 'Start ?'
		});
		btn.bind('click', this.start_question_answer.bind(this));
		this.main_w.clear_widgets();
		this.main_w.add_widget(btn);
	}
	build_startbtn(){
		var btn = new bricks.Button({
				label:'press to start'
		});
		btn.bind('click', this.conform_start.bind(this));
		this.bottom_w.add_widget(btn);
	}
	conform_start(){
		var d = {
			type: 'conform_start',
			data: null
		}
		this.ws.send(d);
	}
	start_question_answer(){
		this.main_w.clear_widgets();
		var d = {
			'type': 'qa_start',
			'data': {
				d: 'test data',
				v: 100
			}
		};
		this.ws.send(d);
	}
	async send_audio_answer(e){
		var audio = e.data;
		var b64audio = blobToBase64(audio.audio);
		this.ws.send({
			type: 'audio_answer',
			data: b64audio
		})
	}
	send_text_answer(e){
		var answer = e.data;
		console.log('answer=', answer);
		this.ws.send({
			type: 'text_answer',
			data: answer.texta
		});
	}
	build_input_widgets(){
		var hw = StrInput({
			name:texta,
			css:'filler'
		});
		var speakw = new bricks.AudioRecorder({
			icon_rate:1.7,
			padding: '6px'
		});
		/*
		var imagew = new bricks.Svg({
			rate:1.7,
			padding: '6px',
			url: bricks_resource('imgs/camera.svg')
		});
		var videow = new bricks.Svg({
			rate: 1.7,
			padding: '6px',
			url: bricks_resource('imgs/recorder.svg')
		});
		this.bottom_w.add_widget(imagew);
		this.bottom_w.add_widget(videow);
		*/
		hw.bind('blur', this.send_text_answer.bind(this));
		speakw.bind('record_ended', this.send_audio_data.bind(this));
		
		this.bottom_w.add_widget(speakw);
		this.bottom_w.add_widget(hw);
	}
	play_course(){
		switch(this.courseware.type){
			case 'video':
				this.cw = new bricks.VideoPlayer({
					url:this.courseware.url, 
					autoplay:true
				});
				break;
			case 'audio':
				this.cw = new bricks.AudioPlayer({
					url:this.courseware.url,
					autoplay:true
				});
				break;
			case 'image':
				this.cw = new bricks.Image({
					url:this.courseware.url
				});
				break;
			case 'markdown':
				this.cw = new bricks.MdWidget({
					md_url:this.courseware.url
				});
				break;
			default:
				return
		}
		this.main_w.add_widget(this.cw);
	} 
}

bricks.Factory.register('QAFrame', bricks.QAFrame);
var bricks = window.bricks || {};
bricks.Svg = class extends bricks.VBox {
	/*
	options:{
		rate:
		url:
		color:*
		blinktime:*
	}
	*/
	constructor(opts){
		opts.rate = opts.rate || 1;
		opts.cwidth = opts.rate;
		opts.cheight = opts.rate;
		opts.blinktime = opts.blinktime? opts.blinktime : 0;
		opts.dynsize = true;
		super(opts);
		if (! this.color) {
			this.color = bricks.app.get_color();
		}
		if (opts.url){
			this.set_url(opts.url);
		}
	}
	set_url(url){
		if (!url){
			this.dom_element.innerHTML = '';
			return;
		}
		this.url = url;
		fetch(url)
			.then(response => response.text())
			.then(svgText => {
				if (svgText.startsWith("<svg ")){
					this.svgText = svgText;
					this.set_colored_svg(this.color);
					if (this.blinktime) this.start_blink();
				}
			});
	}
	set_ancent_color(e){
		var pstyle = getComputedStyle(this.parent);
		this.set_color(pstyle.color);
	}
	set_color(color){
		this.color = color;
		this.set_colored_svg(color);
	}
	set_colored_svg(color){
		this.cur_color = color;
		this.svg_text = bricks.obj_fmtstr({color: color}, this.svgText);
		this.dom_element.innerHTML = this.svg_text;
	}
	_blink(){
		if (this.blinktime) {
			if (this.dom_element.innerHTML == '')
				this.dom_element.innerHTML = this.svg_text;
			else
				this.dom_element.innerHTML = ''
		}
	}
	start_blink(){
		if (!this.blink_task){
			this.blink_task = schedule_interval(this._blink.bind(this), 
				this.blinktime);
		}
	}
	end_blink(){
		if (this.blink_task)
			clearInterval(this.blink_task);
		this.blink_task = null;
	}
}

bricks.StatedSvg = class extends bricks.Svg {
	/* {
		states:[{state:aaa,url:} ,,],
		state:
	} */
	constructor(opts){
		super(opts);	
		this.curstate = null;
		if (this.states){
			if (! this.state){
				this.state = this.states[0].state;
			}
			this.set_state(this.state);
		}
		this.bind('click', this.trigger.bind(this));
	}
	trigger(event){
		event.stopPropagation();
		event.preventDefault();
		for (var i=0;i<this.states.length;i++){
			var g = this.states[i];
			if (this.curstate == g.state) {
				var k = 0;
				if (i < this.states.length - 1){
					k = i + 1;
				}
				this.set_state(this.states[k].state);
				return;
			}
		}
	}
	set_state(state){
		if (state == this.curstate){
			return;
		}
		this.curstate = state;
		var done = false;
		this.states.forEach(s => {
			if (s.state == state){
				this.set_url(s.url);
				this.dispatch('state_changed', state);
				done = true;
				return;
			}
		});
		if (! done) this.set_url(null);
	}
}
bricks.MultipleStateIcon = class extends bricks.Svg {
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
bricks.Factory.register('Svg', bricks.Svg);
bricks.Factory.register('StatedSvg', bricks.StatedSvg);
bricks.Factory.register('MultipleStateIcon', bricks.MultipleStateIcon);

var bricks = window.bricks || {}
/*
use hls to play m3u8
 https://cdn.jsdelivr.net/npm/hls.js@latest
use dash to play dash
	https://cdn.dashjs.org/latest/dash.all.min.js
*/

bricks.VideoPlayer = class extends bricks.VBox {
	/*
		opts:
			url: video source
			autoplay:true or false
	*/
	constructor(opts) {
		super(opts);
		this.set_css('video-container');
		this.dom_element.innerHTML = `<video id="video" class="video-element"></video>
    <div class="controls">
      <div class="controls-bottom">
        <button class="play-pause">▶</button>
        <div class="volume-container">
          <button class="mute">🔊</button>
          <input type="range" class="volume" min="0" max="1" step="0.01" value="1" />
        </div>
        <span class="time">00:00 / 00:00</span>
        <div class="speed-container">
          <select class="playback-speed">
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1" selected>1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
        <div class="audio-tracks">
          <select class="audio-track-select"></select>
        </div>
        <button class="fullscreen">⛶</button>
      </div>
    </div>`
		this.video = this.dom_element.querySelector('.video-element');
		this.controls = this.dom_element.querySelector('.controls');
		this.hls = null;
		this.dashPlayer = null;

		this.playPauseBtn = this.controls.querySelector('.play-pause');
		this.muteBtn = this.controls.querySelector('.mute');
		this.volumeInput = this.controls.querySelector('.volume');
		this.timeDisplay = this.controls.querySelector('.time');
		this.speedSelect = this.controls.querySelector('.playback-speed');
		this.audioTrackSelect = this.controls.querySelector('.audio-track-select');
		this.fullscreenBtn = this.controls.querySelector('.fullscreen');

		this.bind('domon', this.init.bind(this));
		this.bind('domoff', this.destroy.bind(this));
		this.bind('click', this.show_controls.bind(this));
		schedule_once(this.hide_controls.bind(this), 40);
	}

	show_controls(){
		this.controls.style.display = '';
		schedule_once(this.hide_controls.bind(this), 40);
	}
	hide_controls(){
		this.controls.style.display = 'none';
	}
	destroy(){
		if (this.hls) {
			this.hls.destroy();
			this.hls = null;
		}
		if (this.dashPlayer) {
			this.dashPlayer.reset();
			this.dashPlayer = null;
		}
		this.video.src = ''; // 清空
	}
	init() {
		this.loadVideo(this.opts.url); // 可替换为 mp4 / m3u8 / mpd
		this.bindEvents();
		this.updateUI();
		if (this.opts.autoplay && this.video.paused){
			this.playPauseBtn.click();
		}
	}

	loadVideo(src) {
		// 销毁旧播放器
		this.destroy()

		if (src.endsWith('.m3u8') || src.includes('m3u8')) {
			if (Hls.isSupported()) {
				this.hls = new Hls({
					enableWebVTT: false,   // 不加载 WebVTT
					enableIMSC1: false,    // 不加载 IMSC1/TTML
					renderTextTracksNatively: false // 不用浏览器原生 track
				});
				this.hls.subtitleTrack = -1; // 关闭字幕轨道
				this.hls.loadSource(src);
				this.hls.attachMedia(this.video);
				this.hls.on(Hls.Events.MANIFEST_PARSED, () => this.onLoaded());
			} else {
				console.error('HLS not supported');
			}
		} else if (src.endsWith('.mpd') || src.includes('mpd')) {
			this.dashPlayer = dashjs.MediaPlayer().create();
			this.dashPlayer.initialize(this.video, src, true);
			this.dashPlayer.on('manifestParsed', () => this.onLoaded());
		} else {
			// 普通视频
			this.video.src = src;
			this.video.addEventListener('loadedmetadata', () => this.onLoaded());
		}
	}

	onLoaded() {
		this.updateAudioTracks();
		this.updateUI();
	}

	bindEvents() {
		// 播放/暂停
		this.playPauseBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			e.preventDefault();
			if (this.video.paused) {
				this.video.play();
			} else {
				this.video.pause();
			}
		});

		// 静音切换
		this.muteBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			e.preventDefault();
			this.video.muted = !this.video.muted;
			this.updateMuteUI();
		});

		// 音量变化
		this.volumeInput.addEventListener('input', (e) => {
			this.video.volume = e.target.value;
			this.video.muted = this.video.volume === 0;
			this.updateMuteUI();
		});

		// 播放速度
		this.speedSelect.addEventListener('change', (e) => {
			this.video.playbackRate = parseFloat(e.target.value);
		});

		// 音轨切换
		this.audioTrackSelect.addEventListener('change', (e) => {
			const index = parseInt(e.target.value);
			if (this.video.audioTracks) {
				for (let i = 0; i < this.video.audioTracks.length; i++) {
					this.video.audioTracks[i].enabled = i === index;
				}
			}
		});

		// 全屏
		this.fullscreenBtn.addEventListener('click', () => {
			var full_txt='⛶';
			var norm_txt = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" 
       fill="currentColor" viewBox="0 0 16 16">
    <path d="M3 3h5V1H1v7h2V3zm10 0v5h2V1h-7v2h5zM3 13V8H1v7h7v-2H3zm10 0h-5v2h7V8h-2v5z"/>
  </svg>`;
  			if (this.dom_element == document.fullscreenElement){
				this.fullscreenBtn.textContent = full_txt;
				if (document.exitFullscreen) {
					document.exitFullscreen();
				} else if (document.webkitExitFullscreen) { // Safari
					document.webkitExitFullscreen();
				} else if (document.msExitFullscreen) { // IE/Edge 旧版
					document.msExitFullscreen();
				}
			} else {
				this.fullscreenBtn.innerHTML = norm_txt;
				if (this.dom_element.requestFullscreen) {
					this.dom_element.requestFullscreen();
				} else if (this.dom_element.webkitRequestFullscreen) {
					this.dom_element.webkitRequestFullscreen();
				} else if(this.dom_element.msRequestFullscreen){
					this.dom_element.msRequestFullscreen();
				}
			}
		});

		// 视频事件
		this.video.addEventListener('play', () => this.updatePlayPauseUI());
		this.video.addEventListener('pause', () => this.updatePlayPauseUI());
		this.video.addEventListener('timeupdate', () => this.updateProgress());
		this.video.addEventListener('durationchange', () => this.updateProgress());
		this.video.addEventListener('volumechange', () => {
			this.updateMuteUI();
			this.volumeInput.value = this.video.volume;
		});
		this.video.addEventListener('loadedmetadata', () => {
			this.updateAudioTracks();
		});
	}

	updateUI() {
		this.updatePlayPauseUI();
		this.updateMuteUI();
		this.updateProgress();
		this.volumeInput.value = this.video.volume;
	}

	updatePlayPauseUI() {
		this.playPauseBtn.textContent = this.video.paused ? '▶' : '❚❚';
	}

	updateMuteUI() {
		this.muteBtn.textContent = this.video.muted || this.video.volume === 0 ? '🔇' : '🔊';
	}

	updateProgress() {
		const percent = this.video.duration ? this.video.currentTime / this.video.duration : 0;
		this.timeDisplay.textContent = `${this.formatTime(this.video.currentTime)} / ${this.formatTime(this.video.duration || 0)}`;
	}

	updateAudioTracks() {
		this.audioTrackSelect.innerHTML = '';
		if (this.video.audioTracks && this.video.audioTracks.length > 0) {
			for (let i = 0; i < this.video.audioTracks.length; i++) {
				const track = this.video.audioTracks[i];
				const option = document.createElement('option');
				option.value = i;
				option.textContent = track.label || `音轨 ${i + 1}`;
				if (track.enabled) option.selected = true;
				this.audioTrackSelect.appendChild(option);
			}
		} else {
			const option = document.createElement('option');
			option.textContent = '无音轨';
			option.disabled = true;
			this.audioTrackSelect.appendChild(option);
		}
	}

	formatTime(seconds) {
		const s = Math.floor(seconds % 60);
		const m = Math.floor((seconds / 60) % 60);
		const h = Math.floor(seconds / 3600);
		return h > 0
			? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
			: `${m}:${s.toString().padStart(2, '0')}`;
	}

}
bricks.Iptv = class extends bricks.VBox {
	/*
	{
		iptv_data_url:
		playok_url:
		playfailed_url:
	}
	*/
	constructor(opts){
		super(opts);
		schedule_once(this.build_subwidgets.bind(this), 0.1);
	}
	async build_subwidgets(){
		console.log('build_subwidgets called');
		if (!this.user_data){
			var jc = new bricks.HttpJson();
			this.deviceid = bricks.deviceid('iptv')
			this.user_data = await jc.httpcall(this.iptv_data_url, {
				params:{
					deviceid:this.deviceid
				}, 
				method:'GET'
			});
		}
		console.log('this.user_data =', this.user_data);
		this.video = new bricks.VideoPlayer({
			autoplay:true,
			url:this.user_data.url
		});
		this.title_w = new bricks.Text({text:this.user_data.tv_name, wrap:false});
		this.add_widget(this.title_w);
		this.add_widget(this.video);
		this.video.bind('play_ok', this.report_play_ok.bind(this));
		this.video.bind('play_failed', this.report_play_failed.bind(this));
	}
	async report_play_ok(){
		console.log(this.user_data, 'channel playing ...', this.playok_url);
		if (this.playok_url){
			var ht = new bricks.HttpText();
			var resp = ht.httpcall(this.playok_url,{
				params:{
					deviceid:this.deviceid,
					channelid:this.user_data.id
				},
				method:"GET"
			});
			if (resp != 'Error'){
				console.log('report playok ok');
			} else {
				console.log('report playok failed');
			}
		} else {
			console.log('this.playok_url not defined', this.playok_url);
		}
	}
	async report_play_failed(){
		console.log(this.user_data, 'channel play failed ...');
		if (this.playfailed_url){
			var ht = new bricks.HttpText();
			var resp = ht.httpcall(this.playfailed_url,{
				params:{
					deviceid:this.deviceid,
					channelid:this.user_data.id
				},
				method:"GET"
			});
			if (resp != 'Error'){
				console.log('report playfailed ok');
			} else {
				console.log('report playfailed failed');
			}
		} else {
			console.log('this.playfailed_url not defined', this.playfailed_url);
		}
	}
	setValue(data){
		this.user_data = data;
		this.title_w.set_text(data.tv_name);
		this.video.set_url(data.url);
	}
}
bricks.Factory.register('Iptv', bricks.Iptv);
bricks.Factory.register('VideoPlayer', bricks.VideoPlayer);
bricks.Factory.register('Video', bricks.VideoPlayer);
var bricks = window.bricks || {};

bricks.ChartScatter = class extends bricks.EchartsExt {
  /*
   * opts:
   * {
   *   data_url,
   *   data_params,
   *   method,
   *   user_data,
   *   nameField: 可选，用于标签
   *   xField:     X坐标字段
   *   yField:     Y坐标字段
   *   sizeField?: 气泡大小字段（可选）
   *   categoryField?: 分组字段（用于不同颜色）
   * }
   */

  setup_options(data) {
    let seriesMap = {};

    if (this.categoryField) {
      // 按 categoryField 分组
      data.forEach(item => {
        const cat = item[this.categoryField] || 'default';
        if (!seriesMap[cat]) {
          seriesMap[cat] = {
            name: cat,
            type: 'scatter',
            data: []
          };
        }
        seriesMap[cat].data.push([
          item[this.xField],
          item[this.yField],
          item[this.nameField] || null,
          item[this.sizeField] || 1
        ]);
      });
    } else {
      // 单一系列
      const seriesData = data.map(item => [
        item[this.xField],
        item[this.yField],
        item[this.nameField] || null,
        item[this.sizeField] || 1
      ]);

      seriesMap['scatter'] = {
        type: 'scatter',
        data: seriesData
      };
    }

    const series = Object.values(seriesMap);
    const xAxisName = this.xField;
    const yAxisName = this.yField;

    return {
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          const p = params[0];
          return `${p.seriesName}<br/>${xAxisName}: ${p.value[0]}<br/>${yAxisName}: ${p.value[1]}`;
        }
      },
      legend: {
        data: Object.keys(seriesMap)
      },
      xAxis: {
        type: 'value',
        name: xAxisName
      },
      yAxis: {
        type: 'value',
        name: yAxisName
      },
      series: series
    };
  }
};

// 注册工厂
bricks.Factory.register('ChartScatter', bricks.ChartScatter);

/*
new bricks.ChartScatter({
  user_data: [
    { x: 10, y: 20, size: 30, group: 'Group A', label: 'Point 1' },
    { x: 15, y: 25, size: 40, group: 'Group B', label: 'Point 2' }
  ],
  xField: 'x',
  yField: 'y',
  sizeField: 'size',
  categoryField: 'group',
  nameField: 'label'
});
*/
var bricks = window.bricks || {};

bricks.ChartRadar = class extends bricks.EchartsExt {
    /*
    数据格式示例:
    [
        { name: '张三', indicator1: 80, indicator2: 60, ... },
        { name: '李四', indicator1: 70, indicator2: 90, ... }
    ]

    参数:
    {
        data_url,
        data_params,
        nameField: 'name',
        valueFields: ['indicator1', 'indicator2', ...],
        radar_options: { // 自定义雷达配置
            indicator: [
                { name: '销售', max: 100 },
                { name: '管理', max: 100 }, ...
            ]
        }
    }
    */
    setup_options(data) {
        const { nameField, valueFields } = this;
        const series = [];
        const indicator = this.radar_options?.indicator || valueFields.map(f => ({ name: f, max: 100 }));

        data.forEach(item => {
            series.push({
                name: item[nameField],
                type: 'radar',
                data: [
                    {
                        value: valueFields.map(f => item[f]),
                        name: item[nameField]
                    }
                ]
            });
        });

        return {
            tooltip: { trigger: 'item' },
            legend: { data: data.map(d => d[nameField]) },
            radar: { indicator },
            series
        };
    }
};

bricks.Factory.register('ChartRadar', bricks.ChartRadar);
/*
*/
var bricks = window.bricks || {};

bricks.ChartKLine = class extends bricks.EchartsExt {
    /*
    数据格式:
    [
        { name: '2025-04-01', open: 2100, close: 2150, low: 2080, high: 2160 },
        ...
    ]

    参数:
    {
        data_url,
        nameField: 'name',         // 时间轴字段
        valueFields: ['open','close','low','high']
    }
    */
    setup_options(data) {
        const { nameField } = this;
        const categories = data.map(d => d[nameField]);
        const kData = data.map(d => [d.open, d.close, d.low, d.high]);

        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' }
            },
            xAxis: {
                type: 'category',
                data: categories,
                scale: true
            },
            yAxis: {
                type: 'value',
                scale: true
            },
            series: [{
                type: 'candlestick',
                data: kData
            }],
            dataZoom: [
                { type: 'inside' },
                { type: 'slider' }
            ]
        };
    }
};

bricks.Factory.register('ChartKLine', bricks.ChartKLine);
var bricks = window.bricks || {};

bricks.ChartHeatmap = class extends bricks.EchartsExt {
    /*
    数据格式:
    [
        { x: '周一', y: '上午', value: 120 },
        { x: '周二', y: '下午', value: 90 }, ...
    ]

    参数:
    {
        data_url,
        xField: 'x',       // X 轴字段
        yField: 'y',       // Y 轴字段
        valueField: 'value'
    }
    */
    setup_options(data) {
        const xField = this.xField || 'x';
        const yField = this.yField || 'y';
        const valueField = this.valueField || 'value';

        const xs = [...new Set(data.map(d => d[xField]))];
        const ys = [...new Set(data.map(d => d[yField]))];

        const map = {};
        ys.forEach(y => map[y] = {});
        data.forEach(d => {
            map[d[yField]][d[xField]] = d[valueField];
        });

        const heatmapData = [];
        for (let j = 0; j < ys.length; j++) {
            const y = ys[j];
            for (let i = 0; i < xs.length; i++) {
                const x = xs[i];
                heatmapData.push([i, j, map[y][x] || 0]);
            }
        }

        return {
            tooltip: { position: 'top' },
            grid: { height: '80%', top: '10%' },
            xAxis: {
                type: 'category',
                data: xs,
                splitArea: { show: true }
            },
            yAxis: {
                type: 'category',
                data: ys,
                splitArea: { show: true }
            },
            visualMap: {
                min: 0,
                max: Math.max(...data.map(d => d[valueField])),
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: '5%'
            },
            series: [{
                type: 'heatmap',
                data: heatmapData,
                label: { show: false },
                emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } }
            }]
        };
    }
};

bricks.Factory.register('ChartHeatmap', bricks.ChartHeatmap);
var bricks = window.bricks || {};

bricks.ChartMap = class extends bricks.EchartsExt {
    /*
    数据格式:
    [
        { name: '北京', value: 120 },
        { name: '上海', value: 90 }, ...
    ]

    参数:
    {
        data_url,
        nameField: 'name',
        valueField: 'value',
        map_name: 'china',     // 对应 echarts.registerMap 注册的地图名
        map_options: {}        // 可选自定义样式
    }
    */
    async setup_options(data) {
        const { nameField, valueField = 'value', map_name = 'china', map_options } = this;

        const mapData = data.map(d => ({
            name: d[nameField],
            value: d[valueField]
        }));

        return {
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c}'
            },
            visualMap: {
                min: 0,
                max: Math.max(...mapData.map(d => d.value)),
                left: 'left',
                top: 'bottom',
                text: ['高', '低'],
                calculable: true
            },
            series: [{
                name: '数据',
                type: 'map',
                map: map_name,
                roam: false,
                label: { show: true, color: '#fff' },
                itemStyle: {
                    areaColor: '#eee',
                    borderColor: '#444'
                },
                emphasis: {
                    label: { color: '#fff' },
                    itemStyle: { areaColor: '#e09191' }
                },
                data: mapData
            }],
            ...(map_options || {})
        };
    }
};

bricks.Factory.register('ChartMap', bricks.ChartMap);
/*
💡 使用前需通过 `echarts.registerMap('china', geoJson)` 注册地图数据。
*/
var bricks = window.bricks || {};
bricks.QRCodeScan = class extends bricks.VBox {
	/*
	event: 
		recognized
			识别到二维码
			参数为识别到的正文
		stopped
			扫码已停止
			无参数
	*/
	constructor(opts){
		opts.width = '300px';
		opts.height = '300px';
		super(opts);
		this.scan_config = {
		  fps: 10,               // 每秒尝试识别次数
		  qrbox: { width: 250, height: 250 }, // 扫描框大小
		  aspectRatio: 1.0,      // 保持正方形
		  disableFlip: false     // 是否禁用镜像（移动端前置摄像头会镜像）
		};
		this.bind('click', this.stop.bind(this))
		schedule_once(this.start.bind(this), 0.5)
	}
	get_qr_result(decodedText, decodedResult){
		this.dispatch('recognized', {text: decodedText})
		console.log('decodeText=', {text: decodedText})
		this.scanner.stop()
	}
	errorhandle(msg){
		console.log("识别失败:", msg);
	}
	start(){
		this.scanner = new Html5Qrcode(this.id);
		this.scanner.start({ facingMode: "environment" },
			this.scan_config,
			this.get_qr_result.bind(this),
			this.errorhandle.bind(this)
		).catch(err => {
			console.error('启动摄像头失败')
		});

	}
	stop(){
		if (this.scanner && this.scanner.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
			this.scanner.stop();
			this.dispatch('stopped');
		}
	}
}
bricks.Factory.register('QRCodeScan', bricks.QRCodeScan);
var bricks = window.bricks || {};

bricks.DeletableLabel = class extends bricks.HBox {
	/*
		rate:0.6
		label:
		i18n:false
	*/
	constructor(opts){
		opts.cheight = 1;
		opts.width = '100%';
		super(opts);
		this.rate = opts.rate || 0.6;
		var lopts = {
			rate: this.rate
		}
		if (opts.i18n){
			lopts.i18n = true;
			lopts.otext = opts.label;
		} else {
			lopts.text = opts.label;
		}
		this.labelw = new bricks.Text(lopts);
		this.deletew = new bricks.Svg({
			cwidth: this.rate,
			cheight: this.rate,
			url: bricks_resource('imgs/delete.svg')
		});
		this.deletew.bind('click', this.deletelabel.bind(this));
		this.add_widget(this.labelw);
		this.add_widget(this.deletew);
	}
	deletelabel(){
		this.parent.remove_widget(this);
		this.dispatch('deleted', {label:tihis.label});
	}
}
bricks.TextFiles = class extends bricks.VBox {
	/*
	输入长文本和一到多个文件，高度随着输入文本的多少以及添加的文件数量变化，添加的文件有一个删除按钮可以删除掉
	有一个按钮提交数据，点击后触发“inputed”事件
	{
		"params": 参数
	}
	*/
	constructor(opts){
		opts.height = 'auto';
		opts.width = '100%';
		super(opts);
		this.inputfilew = new bricks.UiFile({name:'add_file'});
		this.filesbar = new bricks.DynamicColumn({col_cwidth:10});
		this.add_files = [];
		this.textw = new bricks.UiText({name: 'prompt'});
		var addfilew = new bricks.Svg({
			cwidth: 1.5,
			cheight: 1.5,
			url: bricks_resource('imgs/add.svg')
		});
		addfilew.bind('click', this.add_file.bind(this));
		var inputw = new bricks.Svg({
			cwidth: 1.5,
            cheight: 1.5,
            url: opts.url || bricks_resource('imgs/submit.svg')
        });
		inputw.bind('click', this.input_finished.bind(this));
		var hbox = new bricks.HBox({cheight: 1.5});
		this.add_widget(this.inputfilew);
		this.add_widget(this.filesbar);
		this.add_widget(this.textw);
		this.add_widget(hbox);
		hbox.add_widget(addfilew);
		hbox.add_widget(new bricks.VBox({css:'filler'}));
		hbox.add_widget(inputw);
		this.filesbar.hide();
		this.inputfilew.hide();
		this.inputfilew.bind('changed', this.file_added.bind(this));
	}
	input_finished(){
		var txt = this.textw.getValue();
		if (! txt.prompt || txt.prompt.length<1){
			return;
		}
		var p = this.params || {};
		var d = Object.assign({}, p, {
			add_files: this.add_files,
			prompt: txt.prompt
		});
		this.dispatch('inputed', d);
		this.textw.setValue('');
		this.add_files = [];
	}
	file_added(e){
		this.inputfilew.hide();
		var file = this.inputfilew.getValue().add_file;
		this.inputfilew.reset();
		this.add_files.push(file);
		var w = new bricks.DeletableLabel({label: file.name})
		this.filesbar.add_widget(w);
		this.filesbar.show();
		this.filesbar.clear_widgets();
		w.bind('deleted', this.deleted_file.bind(this, file));
	}
	deleted_file(file){
		files = this.add_files.filter(i => i !== file);
		this.add_files = files;
		if (this.add_files.length ==0){
			this.filesbar.hide();
		}
	}
	add_file(){
		this.inputfilew.show();
	}
}
bricks.Factory.register('TextFiles', bricks.TextFiles);
bricks.Factory.register('DeletableLabel', bricks.DeletableLabel);
bricks = window.bricks || {}

bricks.LlmMsgAudio = class extends bricks.UpStreaming {
	constructor(opts){
		super(opts);
		this.olddata = '';
		this.data = '';
		this.cn_p = ["。","，","！","？","\n"];
		this.other_p = [".",",","!","?","\n"];
		this.audio = AudioPlayer({})
	}
	detectLanguage(text) {
		try {
			const detector = new Intl.LocaleDetector();
			const locale = detector.detectLocaleOf(text);
			return locale.language;
		} catch (error) {
			console.error('无法检测语言:', error);
			return '未知';
		}
	}
	send(data){
		var newdata = data.slice(this.olddata.length);
		this.olddata = data;
		this.data += newdata;
		var lang = detectLaguage(this.data);
		var parts;
		if (lang='zh'){
			parts = this.data.split(this.cn_p).filter(part => part.trim()!== '');
		} else {
			parts = this.data.split(this.oter_p).filter(part => part.trim()!== '');
		}
		for(var i=0;i<parts.length - 1; i++){
			super.send(parts[i]);
		}
		this.data = parts[parts.length - 1];
	}
	async go(){
		var resp = await super.go();
		this.audio.set_source_from_response(resp);
		return resp;
	}
}
bricks.AgentOut = class extends bricks.VBox {
    constructor(opts){
        super(opts);
        this.rc_w = null;
        this.c_w = null;
        this.v_w = null;
        this.i_w = null;
        this.a_w = null;
        this.glb_w = null;
        this.images = [];
        this.reasoning_content = '';
        this.content = '';
        this.error = '';
		this.qa_w  = null;
    }

    update(data){
        if (data.audio){
            var url = data.audio;
            if (! data.audio.startsWith('http')){
                if (! data.audio.startsWith('data:audio/')){
                    url = 'data:audio/wav;base64,' + url;
                }
            }
            if (!this.a_w) {
                this.a_w = new bricks.AudioPlayer({
                    width: '100%',
                    autoplay: true,
                    url: url,
                    cheight:2
                });
            } else {
                this.a_w.add_url(url);
            }
        }
        if (data.glb){
            this.glb_w = new bricks.GlbViewer({
                url:data.glb,
                width: '100%'
            });
        }
        if (data.video){
            if (!this.v_w){
                this.v_w = new bricks.VideoPlayer({
                    width: '100%',
                    url: data.video,
                    autoplay: true
                });
            } else {
                this.v_w.add_url(data.video);
            }
        }
        if (data.error){
            this.error += data.error;
        }
        if (data.reasoning_content){
            this.reasoning_content += data.reasoning_content;
        }
        if (data.content){
            this.content += data.content;
        }
        if (data.image){
            if (Array.isArray(data.image)){
                this.images.concat(data.image);
            } else {
                this.images.push(data.image);
            }
        }
		if (data.reply){
			var opts = {
				dimiss_events: [ 'submit' ],
				auto_open: true,
				content: {
					widgettype: "Form",
					options: {
						submit_url: this.rply_url,
						title: "补充信息",
						description: data.reply.question,
						fields:[
							{
								name: 'questionkey',
								uitype: 'hide',
								value: data.reply.questionkey
							},
							{
								name: ' answer',
								uitype: 'text',
								required: true
							}
						]
					}
				}
			};
			var win = new bricks.PopupWindow(opts);
		}
        this.clear_widgets();
        if (this.error.length) {
            var txt = bricks.escapeSpecialChars(this.error);
            this.c_w = new bricks.Text({
                text: this.error,
                wrap: true,
                halign: 'left',
                css: 'resp-error',
                width: '100%'
            });
            this.add_widget(this.c_w);
        }
        if (this.reasoning_content.length) {
            var txt = bricks.escapeSpecialChars(this.reasoning_content);
            this.rc_w = new bricks.MdWidget({
                mdtext: this.reasoning_content,
                css: 'thinking-content',
                bgcolor: '#f0d0d0',
                width: '100%'
            });
            this.add_widget(this.rc_w);
        }
        if (this.content.length) {
            var txt = bricks.escapeSpecialChars(this.content);
            this.c_w = new bricks.MdWidget({
                mdtext: this.content,
                css: 'resp-content',
                width: '100%'
            });
            this.add_widget(this.c_w);
        }
        if (this.v_w) {
            this.add_widget(this.v_w);
        }
        if (this.glb_w){
            this.add_widget(this.glb_w);
        }
        if (this.a_w) {
            this.add_widget(this.a_w);
        }
        if (this.images.length){
            this.images.forEach( i => {
                var w = new bricks.Image({
                    width: '100%',
                    url: i
                });
                this.add_widget(w)
            });
        }
    }
}

bricks.AgentOutput = class extends bricks.VBox {
	/* {
		icon:
		reply_url:
	}
	完成模型输出的控件的初始化以及获得数据后的更新， 更新是的数据在流模式下，需要使用累积数据
	*/
	constructor(opts){
		if(! opts){
			opts = {};
		}
		opts.width = '100%';
		opts.height = 'auto';
		super(opts);
		var hb = new bricks.HBox({width:'100%', cheight:2});
		this.img = new bricks.Svg({
			rate:2,
			tip:this.opts.modelname,
			url:this.icon||bricks_resource('imgs/agent.svg')
		});
		hb.add_widget(this.img);
		this.add_widget(hb);
		
		this.content = new bricks.HBox({width:'100%'});
		this.add_widget(this.content);
		this.run = new bricks.BaseRunning({target:this, cheight:2, cwidth:2});
		this.content.add_widget(this.run);
		this.filler = new bricks.AgentOut({width: '100%', 
			css: 'card', 
			reply_url: this.reply_url});
		this.filler.set_css('filler');
		this.content.add_widget(new bricks.BlankIcon({rate:2, flexShrink:0}));
		this.content.add_widget(this.filler);
		// this.content.add_widget(new bricks.BlankIcon({rate:2, flexShrink:0}));
	}
	run_stopped(){
		if (this.run) {
			this.run.stop_timepass();
			this.content.remove_widget(this.run);
			this.run = null;
		}
	}
	async update_data(data){
		this.run_stopped();
		this.filler.update(data);
		if (data.llmusageid) {
			this.llmusageid = data.llmusageid
		}
		return;
	}
	finish(){
		console.log('finished')
	}
}

bricks.AgentInputView = class extends bricks.VBox {
    constructor(opts){
        super(opts);
        this.v_w = null;
        this.a_v = null;
        this.show_input(this.data);
    }
    show_input(data){
        var mdtext = bricks.escapeSpecialChars(data.prompt) + '\n';
		if (data.add_files){
        data.add_files.forEach(f =>{
			if (f.type.startsWith('video/')) {
				var url = URL.createObjectURL(f);
				this.v_w = new bricks.VideoPlayer({
					url:url,
					autoplay:true,
					width: '100%'
				});
			} else if (f.type.startsWith('audio')){
				var url = URL.createObjectURL(f);
				this.a_w = new bricks.AudioPlayer({
					url:url,
					autoplay:true,
					width: '100%'
				});
			} else if (f.type.startsWith('image')){
				var url = URL.createObjectURL(f);
				mdtext += `![${f.name}](${url})`;
			} else {
				var url = URL.createObjectURL(f);
				mdtext += `[${f.name}](${url})`;
			}
        });
		}
        this.clear_widgets();
        var w = new bricks.MdWidget({
            width: '100%',
            mdtext:mdtext
        });
        console.log('mdtext=', mdtext);
        this.add_widget(w);
        if (this.v_w){
            this.add_widget(this.v_w);
        }
        if (this.a_w){
            this.add_widget(this.a_w);
        }
    }
}

bricks.AgentModel = class extends bricks.JsWidget {
	/*
		{
			icon:
			url:
			params:
			method:
			reply_url:
		}
	*/
	constructor(llmio, opts){
		super(opts);
		this.llmio = llmio;
	}
	async set_inputed(data){
		var mout = new bricks.AgentOutput({
						reply_url: this.opts.reply_url
					});
		this.llmio.msg_box.add_widget(mout);
		var d = data;
		var hr = new bricks.HttpResponseStream();
		var resp = await hr.post(this.opts.url, {params:d});
		if (! resp) {
			mout.run_stopped();
			return;
		}
		await hr.handle_chunk(resp, this.chunk_response.bind(this, mout));
		this.chunk_ended();
	}
	chunk_response(mout, l){
		l = l.trim();
		try {
			var d = JSON.parse(l);
		} catch(e){
			console.log(l, 'is not a json data');
			return
		}
		console.log('l=', l, 'd=', d);
		mout.update_data(d);
	}
	chunk_ended(){
		console.log('chunk end');
	}
}
bricks.AgentIO = class extends bricks.VBox {
	/*
	options:
	{
		agent_using_llmid: #agent使用的大模型id
		reply_url：			# 补充问题url
		url:				# agent接受问题的url
	}
	*/
	constructor(opts){
		if (!opts.height) opts.height = '100%';
		super(opts);
		this.llmmodels = [];
		this.msg_box = new bricks.VScrollPanel({
			width: '100%',
			css: 'filler'
		});
		this.inputw = new bricks.TextFiles({});
		this.inputw.bind('inputed', this.user_inputed.bind(this));
		this.add_widget(this.msg_box);
		this.add_widget(this.inputw);
	}
	user_inputed(e){
		this.show_input(e.params);
		var params = e.params;
		params.llmid = this.agent_using_llmid;
		var agent = new bricks.AgentModel(this, {
			url:this.opts.url,
			params: params,
			method: this.opts.method || 'POST',
			reply_url: this.opts.reply_url
		});
		agent.set_inputed(params);
	}
    async show_input(params){
        var box = new bricks.HBox({width:'100%'});
        var data = params;
        var w = new bricks.AgentInputView({
			width: '100%',
			data:data
		});
        w.set_css(this.msg_css||'user_msg');
        w.set_css('filler');
        var img = new bricks.Svg({rate:2,url:this.user_icon||bricks_resource('imgs/chat-user.svg')}); 
        // box.add_widget(new bricks.BlankIcon({rate:2, flexShrink:0}));
        box.add_widget(w);
        box.add_widget(img);
        this.msg_box.add_widget(box);
    }   
}

bricks.Factory.register('AgentIO', bricks.AgentIO);
