function url_params(data) {
  return Object.keys(data).map(key => `${key}=${encodeURIComponent(data[key])}`).join('&');
}
class HttpClient {
async jcall(url, method, opts){
	console.log('jcall(', url, method, opts, ')');
	let headers = {
		"Accept": "application/json",
		"Content-Type": "application/json",
	}
	let data = {
		"_webbricks_":1
	}
	if (opts.hasOwnProperty('data')) {
		data = Object.assign(data, opts.data);
	}

	let params = {
		"method":method,
	}
	if (opts.hasOwnProperty('headers')) {
		params.headers = Object(headers, opts.headers);
	}
	if (method == 'GET' || method == 'HEAD') {
		let pstr = url_params(data);
		url = url + '?' + pstr;
	} else {
		params.body = JSON.stringify(data);
	}
	const fetchResult = await fetch(url, params);
	const result = await fetchResult.json();
	if (fetchResult.ok){
		console.log('method=', method, 'url=', url, 'params=', params);
		console.log('result=', result);
		return result;
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
async get(url, opts){
	return await jcall(url, 'GET', opts);
}
async post(url, opts){
	return await jcall(url, 'POST', opts);
}
}
var hc = new HttpClient();
var jcall = hc.jcall;

