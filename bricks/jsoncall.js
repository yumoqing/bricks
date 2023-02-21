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
		var data = add_own_params(params);
		var header = add_own_headers(headers);
		var _params = {
			"method":method,
		}
		_params.headers = _headers;
		if (headers) {
			_params.headers = Object(_headers, headers);
		}
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

	async httpcall_json(url, {method='GET', headers=null, body=null, params=null}={}){
		return httpcall(url, 
									{
										"method":method,
										"headers":headers,
										"resulttype":'json',
										"params":params
									});
	}

	async gettext(url, {headers=null, params=null}={}){
		return await httpcall(url, {
								"method":"GET",
								"header":headers,
								"params":params
							});
	}
	async posttext(url, {headers=null, params=null}={}){
		return await httpcall(url, {
								"method":"POST",
								"header":headers,
								"params":params
							});
	}
	async getjson(url, {headers=null, params=null}={}){
		return await httpcall(url, {
								"method":"GET",
								"header":headers,
								"resulttype":'json',
								"params":params
							});
	}
	async postjson(url, {headers=null, params=null}={}){
		return await httpcall(url, {
								"method":"POST",
								"header":headers,
								"resulttype":'json',
								"params":params
							});
	}
}
var hc = new HttpClient();
var httpcall = hc.httpcall;
var jcall = hc.httpcall_json;
var jget = hc.getjson;
var jpost = hc.postjson;
var tget = hc.gettext;
var tpost = hc.posttext;

