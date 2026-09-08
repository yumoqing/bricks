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
	async bricks_fetch(url, {method='GET', headers=null, params=null, signal=null}={}){
		url = this.url_parse(url);
		var data = this.add_own_params(params);
		var header = this.add_own_headers(headers);
		var _params = {
			method:method
		}
		// AbortController signal：调用方可中断在飞的请求（流式 agent「停」指令用）
		if (signal) _params.signal = signal;
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
				params: opts.params,
				signal: opts.signal});
		if (fetchResult.status == 401 && bricks.app.login_url){
			console.log('401 unauthorized, opening login')
			return await this.withLoginInfo(url, opts);
		}
		if (fetchResult.status == 403){
			var w = new bricks.Error({
				"title":bricks.app.i18n._("access error"),
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
				"title":bricks.app.i18n._("access error"),
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
		// 登录窗单例（2026-09-08）：手机首屏并发多个 401 请求时，旧实现每个请求
		// 各建一个登录窗 → 叠开多个登录页。共享同一个窗：后来者等它销毁后重试。
		if (bricks._login_window_pending){
			await new Promise(resolve => {
				bricks._login_window_pending.bind('destroy', resolve);
			});
			return await this._retry_after_login(url, opts);
		}
		var login_window = await bricks.widgetBuild({
			"widgettype":"urlwidget",
			"options":{
				"url":bricks.app.login_url,
				"params":{
					"login_source":"auto"
				}
			}
		});
		
		if (!login_window){
			console.log('withLoginInfo: failed to build login widget');
			return null;
		}
		bricks._login_window_pending = login_window;
		
		// Wait for login window to be destroyed (successful login)
		await new Promise(resolve => {
			login_window.bind('destroy', resolve);
		});
		bricks._login_window_pending = null;
		return await this._retry_after_login(url, opts);
	}
	async _retry_after_login(url, opts){
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
		// 登录页文档内登录成功（手机/直接打开 login.ui 入口）：shell 是 in-place
		// 渲染进登录页文档的，document URL 仍是 .../login.ui → baseURI 错误 →
		// 后续所有根绝对 urlwidget 解析到 /rbac/user/xxx 反复 401 → 登录窗反复
		// 打开（2026-09-08 用户报障实测根因）。导航回根域名让 shell 以正确
		// baseURI 重建。桌面弹窗登录的 document 是 shell 页，不受影响。
		if (window.location.pathname.indexOf('login.ui') >= 0){
			window.location.replace('/');
			return null;
		}
		// Dispatch user_logined event so shell can reload menu
		if (bricks.app && bricks.app.dispatch) {
			if (bricks.app._login_no_reload) {
				bricks.app._login_no_reload = false;
				console.log('withLoginInfo: non-user login, skip menu reload');
			} else {
				bricks.app.dispatch('user_logined');
			}
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
	async post(url, {headers=null, params=null, signal=null}={}){
		return await this.httpcall(url, {
					method:'POST',
					headers:headers,
					params:params,
					signal:signal
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
		var buff_ = '';
		var result;
		try {
			result = await reader.read();
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
		} catch (e){
			// AbortController.abort() → reader.read() 抛 AbortError：
			// 用户主动「停」是预期中断，静默结束读取循环（不刷错误），
			// 保留 buff_ 里已收到的完整行，尾行照常处理。
			if (e && (e.name === 'AbortError' || e.code === 20)) {
				// cancel() 返回 Promise，abort 后流已处于 error 态可能 reject
				// → 必须 .catch() 兜底，否则冒泡成 unhandledrejection
				try { Promise.resolve(reader.cancel()).catch(function(){}); } catch(_){}
			} else {
				throw e;
			}
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

