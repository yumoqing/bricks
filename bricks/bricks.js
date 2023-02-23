let bricks_app = null;
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
	conform:
and each type of binds specified attributes list following

url action:
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
class Bricks {
	async widgetBuild(desc){
		const klassname = desc.widgettype;
		var base_url = null;
		if (klassname === 'urlwidget'){
			let url = desc.options.url;
			let method = desc.options.method || 'GET';
			let opts = desc.options.params || {};
			desc = await jcall(url, { "method":method, "params":opts});
		}
		let klass = Factory.get(desc.widgettype);
		if (! klass){
			console.log('widgetBuild():',desc.widgettype, 'not registered');
			return null;
		}
		let w = new klass(desc.options);
		if (base_url) {
			w.set_baseURL(base_url);
		}
		if (desc.hasOwnProperty('id')){
			w.set_id(desc.id);
		}
		if (desc.hasOwnProperty('subwidgets')){
			for (let i=0; i<desc.subwidgets.length; i++){
				let sdesc = desc.subwidgets[i];
				let sw = await this.widgetBuild(sdesc);
				if ( sw ){
					w.add_widget(sw);
				} else {
					console.log('widgetBuild() error: sdesc=', sdesc);
				}
			}
		}
		if (desc.hasOwnProperty('binds')){
			for (var i=0;i<desc.binds.length; i++){
				this.buildBind(w, desc.binds[i]);
			}
		}
		console.log('w=', w);
		return w;
	}

	buildBind(w, desc){
		var widget = this.getWidgetById(desc.wid, w);
		var handler = this.buildEventHandler(w, desc);
		if (! handler){
			console.log('buildBind(): handler is null', desc);
			return;
		}
		if (desc.conform){
			var conform_widget = this.widgetBuild(desc.conform);
			conform_widget.bind('on_conform', handler);
			handler = conform_widget.open.bind(conform_widget);
		}
		widget.bind(desc.event, handler);
	}
	buildEventHandler(w, desc){
		var target = this.getWidgetById(desc.target, w);
		if (! target){
			console.log('target miss', desc);
			return null
		}
		var rtdata = null;
		if (desc.datawidget){
			var data_desc = {
				widget:desc.datawidget,
				method:desc.datamethod,
				params:desc.dataparams,
				script:desc.datascript
			}
			rtdata = this.getRealtimeData(data_desc);
		}
		switch (desc.actiontype){
			case 'bricks':
				return this.buildBricksHandler(w, target, rtdata, desc);
				break;
			case 'registerfunction':
				return this.buildRegisterFunction(w, target, rtdata, desc);
				break;
			case 'method':
				return this.buildMethodHandler(w, target, rtdata, desc);
				break;
			case 'script':
				console.log('buildEventHandler():here');
				var f = this.buildScriptHandler(w, target, rtdata, desc);
				console.log('buildEventHandler():here1--', f);
				return f;
				break;
			case 'event':
				return this.buildDispatchEventHandler(w, target, rtdata, desc);
				break;
			default:
				console.log('invalid actiontype', target, desc);
				break;
		}
	}
	buildBrickHandler(w, target, rtdata, desc){
		var f = function(target, mode, options){
			var b = new Bricks()
			var w = b.widgetBuild(options);
			if (mode == 'replace'){
				target.clear_widgets();
			}
			target.add_widget(w);
		}
		var options = {};
		options.update(desc.options);
		if (options.params || rtdata){
			options.update(options.params.update(rtdata));
		}
		return f.bind(target, desc.mode || 'replace', options);
	}
	buildRegisterFunctionHandler(w, target, rtdata, desc){
		var f = registerfunctions.get(desc.rfname);
		if( ! f){
			console.log('rfname:', desc.rfname, 'not registed', desc);
		}
		var params = desc.params || {};
		if (rtdata){
			params.update(rtdata);
		}
		return f.bind(target, params);
	}
	buildMethodHandler(w, target, rtdata, desc){
		var f = target[desc.method];
		var params = desc.params || {};
		if (rtdata){
			params.update(rtdata);
		}
		return f.bind(target, params);
	}
	buildScriptHandler(w, target, rtdata, desc){
		var params = desc.params||{}
		if (rtdata){
			params.update(rtdata);
		}
		var f = new Function('target', 'params', 'event', desc.script);
		return f.bind(target, params);
	}
	buildDispatchEventHandler(w, target, rtdata, desc){
		var params = desc.params || {}
		if (rtdata){
			params.update(rtdata);
		}
		var f = function(target, event_name, params){
			target.dispatch(event_name, params);
		}
		return f.bind(target, params);
	}

	getWidgetById(id, from_widget){
		if (! id){
			return from_widget;
		}
		var ids = id.split('/');
		var el = from_widget.dom_element;
		var j = 0;
		for (var i=0; i< ids.length; i++){
			if (j == 0){
				j = 1;
				if (ids[i] == 'self'){
					el = from_widget.dom_element;
					continue;
				}
				if (ids[i]=='root'){
					el = bricks_app.root.dom_element;
					continue;
				}
				if (ids[i]=='app'){
					return bricks_app;
				}
				if (ids[i] == 'window'){
					el = Body.dom_element;
					continue;
				}
			}
					
			try {
				if (ids[i][0] == '-'){
					var wid = substr(1, ids[i].length - 1)
					el = el.closest('#' + wid);
				} else {
					el = el.querySelector('#' + ids[i]);
				}
			}
			catch(err){
				console.log('getWidgetById():i=', ids[i], id, 'not found', err);
				return null;
			}
			if ( el == null ){
				console.log('getWidgetById():', id, el);
				return null;
			}
		}
		if (typeof(el.bricks_widget) !== 'undefined'){
			console.log('getWidgetById():', id, el, 'widget');
			return el.bricks_widget;
		}
		console.log('getWidgetById():', id, el);
		return el;
	}
}

class BricksApp {
	constructor(opts){
		/*
		opts = {
			"charsize:
			"language":
			"i18n":{
				"url":'rrr',
			},
			"widget":{
				"widgettype":"Text",
				"options":{
				}
			}
		}
		*/
		this.opts = opts;
		bricks_app = this;
		this.charsize = this.opts.charsize || 20;
		if (this.opts.language){
			this.lang = this.opts.language;
		}
		else {
			this.lang = navigator.language;
		}
		this.textList = [];
		this.i18n = new I18n();
		schedule_once(this.build.bind(this), 0.01);
	}
	get_textsize(ctype){
		var tsize = this.charsize;
		var stimes = {
			"text":1.0,
			"title1":1.96,
			"title2":1.80,
			"title3":1.64,
			"title4":1.48,
			"title5":1.32,
			"title6":1.16
		}
		tsize = parseInt(stimes[ctype] * tsize);
		return tsize + 'px';
	}
	text_ref(textWidget){
		this.textList.push(new WeakRef(textWidget));
	}
	text_remove_dead(){
		var tList = this.textList;
		for (var i=0;i<tList.length;i++){
			if (! tList[i].deref()){
				this.textList.remove(tList[i]);
			}
		}
	}
	async setup_i18n(){
		let params = {'lang':this.lang};
		d = await jcall(desc.url, {
					"method":desc.method||'GET', params:params});
		this.i18n.setup_dict(d);
	}
	build = async function(){
		var b = new Bricks();
		var opts = structuredClone(this.opts.widget);
		var w = await b.widgetBuild(opts);
		return w
	}
	async run(){
		if (this.opts.i18n) {
			this.setup_i18n();
		}
		var w = await this.build();
		this.root = w;
		Body.add_widget(w);
	}
	text_resize = function(){
		var txts = this.textList;
		for (var i=0;i<txts.length;i++){
			if(! txts[i].deref()){
				w = txts[i].deref();
				w.set_fontsize();
			}
		}
	}
	change_language = async function(lang){
		this.lang = lang;
		await this.setup_i18n();
		var txts = this.textList;
		for (var i=0;i<txts.length;i++){
			if(! txts[i].deref()){
				w = txts[i].deref();
				if (w.opts.i18n) {
					w.set_i18n_text();
				}
			}
		}
	}
}
