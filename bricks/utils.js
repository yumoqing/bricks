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
	if (objget(import_cache, url)===1) return;
	var result = await tget(url);
	debug('import_css():tget() return', result); 
	var s = document.createElement('style');
	s.setAttribute('type', 'text/javascript');
	s.innerHTML = result;
	document.getElementsByTagName("head")[0].appendChild(s);
	import_cache.set(url, 1);
}

var import_js = async function(url){
	if (objget(import_cache, url)===1) return;
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
	var tsf = obj_fmtstr(o, 'translateY(-${y}) translateX(-${x})');
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
var objcopy = function(obj){
    var o = {}
    for ( k in obj){
        if (obj.hasOwnProperty(k)){
            o[k] = obj[k];
        }
    }
    return o;
}
