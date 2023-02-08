let bricks_app = null;
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

class Bricks {
	async widgetBuild(desc){
		const klassname = desc.widgettype;
		if (klassname === 'urlwidget'){
			let url = desc.options.url;
			let method = desc.options.method || 'GET';
			let opts = desc.options.params || {};
			desc = await jcall(url, method, opts);
		}
		let klass = Factory.get(desc.widgettype);
		if (! klass){
			return null;
		}
		let w = new klass(desc.options);
		if (desc.hasOwnProperty('id')){
			w.set_id(desc.id);
		}
		if (desc.hasOwnProperty('subwidgets')){
			for (let i=0; i<desc.subwidgets.length; i++){
				let sdesc = desc.subwidgets[i];
				let sw = await this.widgetBuild(sdesc);
				console.log('sw=', sw, 'sdesc=', sdesc, desc.subwidgets);
				if ( sw ){
					w.add_widget(sw);
				}
			}
		}
		console.log('w=', w);
		return w;
	}
	getWidgetById(id, from_widget){
		if (from_widget){
			return from_widget.getElementById(id);
		}
		return document.getElementById(id);
	}
}

class BricksApp {
	constructor(opts){
		/*
		opts = {
			"i18n":{
				"url":'rrr',
				"options":{
					"method":"GET",
					"params":{}
				}
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
		this.i18n = new I18n();
	}
	async setup_i18n(desc){
		let params = desc.params;
		d = await jcall(desc.url, method=desc.method||'GET', params=params);
		this.i18n.setup_dict(d);
	}
	async run(){
		if (this.opts.i18n) {
			desc = structuredClone(ops.i18n);
			this.setup_i18n(desc);
		}
		let b = new Bricks();
		let opts = structuredClone(this.opts.widget);
		let w = await b.widgetBuild(opts);
		Body.add_widget(w);
	}
}
