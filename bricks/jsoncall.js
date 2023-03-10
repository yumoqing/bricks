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
		return params;
	}
	add_own_headers(headers){
		if (! headers){
			headers = {};
		}
		return Object.assign(this.headers, headers);
	}

	async httpcall(url, {method='GET', headers=null, params=null}={}){
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

