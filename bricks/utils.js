var bricks = window.bricks || {};
bricks.bug = false;

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
	window.setTimeout(f, t);
}

var schedule_interval = function(f, t){
	var mf = function(func, t){
		console.log('arguments:', func, t);
		func();
		schedule_once(mf.bind(func, t), t);
	}
	schedule_once(mf.bind(f,t), t);
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
// 使用队列
const queue = new Queue();
queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);
queue.print(); // 输出: 1,2,3
console.log(queue.dequeue()); // 输出: 1
queue.print(); // 输出: 2,3
*/
