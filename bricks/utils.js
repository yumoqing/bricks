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
		console.log('has currentScriot');
	} else {
		console.log('has not currentScriot');
		var scripts = document.querySelectorAll( 'script[src]' );
		if (scripts.length < 1){
			return null;
		}
		currentScript = scripts[ scripts.length - 1 ].src;
	}
	console.log('currentScript=', currentScript);
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
