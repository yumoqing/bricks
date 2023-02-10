function url_params(data) {
  return Object.keys(data).map(key => `${key}=${encodeURIComponent(data[key])}`).join('&');
}
class HttpClient {
	async httpcall(url, {method='GET', headers=null, params=null, resulttype='text'}={}){
		let data = {
			"_webbricks_":1
		}
		var _headers = {
			"Accept":"text/html",
			"Content-Type":"text/html; charset=utf-8"
		}
		if (resulttype == 'json'){
			_headers = {
				"Accept": "application/json",
				"Content-Type": "application/json",
			};
		}
		
		if (params) {
			data = Object.assign(data, params);
		}

		let _params = {
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
			_params.body = JSON.stringify(data);
		}
		const fetchResult = await fetch(url, _params);
		var result=null;
		if (resulttype == 'json'){
			result = await fetchResult.json();
		}
		else {
			result = await fetchResult.text();
		}
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

	async httpcall_json(url, {method='GET', headers=null, params=null}={}){
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

