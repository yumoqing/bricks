let bricks_app = null;
class Bricks {
	async widgetBuild(desc){
		const klassname = desc.widgettype;
		if (klassname === 'urlwidget'){
			let url = desc.options.url;
			let method = desc.options.method || 'GET';
			let opts = desc.options.params || {};
			desc = await jcall(url, { "method":method, "params":opts});
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
				if ( sw ){
					w.add_widget(sw);
				} else {
					console.log('widgetBuild() error: sdesc=', sdesc);
				}
			}
		}
		if (desc.hasOwnProperty('binds')){
			for (var i=0;i<desc.binds.length; i++){
				this.buidlBind(w, desc.binds[i]);
			}
		}
		console.log('w=', w);
		return w;
	}

	buildBind(w, bind_desc){
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
			options: for methods kwargs


		script action:
			script:
			options:

		registerfunction action:
			rfname:
			params:

		event action:
			dispatch_event:
			params:

		multiple action:
			actions:[
				{
					actiontype:
					target:
					datawidget:
					datascript:
					datamethod:
					datakwargs:
					...plus specified action attributes
				}
				...
			]
		*/
	}
	getWidgetById(id, from_widget){
		var ids = id.split('/');
		var el = from_widget.dom_element;
		var j = 0;
		for (var i in ids){
			if (j == 0){
				j = 1;
				if (i=='root'){
					el = bricks_app.root.dom_element;
					continue;
				}
				if (i=='app'){
					return bricks_app;
				}
				if (i == 'window'){
					el = Body.dom_element;
					continue;
				}
			}
					
			if (i[0] == '-'){
				i = substr(1, i.length - 1)
				el = el.closest('#' + i);
			} else {
				el = el.getSelector('#' + i);
			}
			if ( el == null ){
				return null;
			}
		}
		if (typeof(el.bricks_widget) !== 'undefined'){
			return el.bricks_widget;
		}
		return el;
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
		d = await jcall(desc.url, {
					"method":desc.method||'GET', params:params});
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
