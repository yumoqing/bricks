
var import_cache = new Map()

var import_css = async function(url){
	if (impor_cache.get(url)===1) return;
	var result = await get(url);
	var s = document.createElement('style');
	s.setAttribute('type', 'text/javascript');
	s.innerHTML = result;
	document.getElementsByTagName("head")[0].appendChild(s);
	import_cache.set(url, 1);
}

var import_js = async function(url){
	if (impor_cache.get(url)===1) return;
	var result = await get(url);
	var s = document.createElement('style');
	s.setAttribute('type', 'text/css');
	s.innerHTML = result;
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

var get = function(obj, key, defval){
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

Object.prototype.fmtstr = function(fmt){
	return obj_fmtstr(this, fmt);
}

Object.prototype.update = function(obj){
	extend(this, obj);
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
