let bricks_app = null;
class Factory_ {
	constructor(){
		this.widgets_kv = new Object();
		this.widgets_kv['_t_'] = 1;
		console.log('kv=', this.widgets_kv);
	}
	register(name, widget){
		this.widgets_kv[name] = widget;
	}
	get(name){
		if (this.widgets_kv.hasOwnProperty(name)){
			return this.widgets_kv[name];
		}
		return null;
	}
}
const Factory = new Factory_();

class DomElement {
	dom_element = null;
	constructor(options){
		this.opts = options;
	}
	create(tagname){
		this.dom_element = document.createElement(tagname);
	}
	set_id(id){
		this.dom_element.id = id;
	}
	show(){
		this.dom_element.style.display = '';
	}
	hide(){
		this.dom_element.style.display = 'none'
	}
}

class Text extends DomElement {
	constructor(options){
		super(options);
		this.opts = options;
		this.create("span");
		this.set_attrs();
	}
	set_attrs(){
		if (this.opts.hasOwnProperty('text')){
			this.text = this.opts.text;
		}
		if (this.opts.hasOwnProperty('otext')){
			this.otext = this.opts.otext;
			console.log('otext=', this.opts.otext, this.otext);
		}
		if (this.opts.hasOwnProperty('i18n')){
			this.i18n = this.opts.i18n;
		}
		this._i18n = new I18n();
		if (this.i18n && this.otext) {
			this.text = this._i18n.i18n(this.otext);
			console.log('otext=', this.otext, 'text=', this.text);
		}
		this.dom_element.innerHTML = this.text;
		console.log('text=', this.text, 'ops=', this.opts);
	}
}

class Title1 extends Text {
	constructor(options){
		super(options);
		this.opts = options;
		this.create('H1');
		this.set_attrs();
	}
}

class Title2 extends Text {
	constructor(options){
		super(options);
		this.opts = options;
		this.create('H2');
		this.set_attrs();
	}
}

class Title3 extends Text {
	constructor(options){
		super(options);
		this.opts = options;
		this.create('H3');
		this.set_attrs();
	}
}

class Title4 extends Text {
	constructor(options){
		super(options);
		this.opts = options;
		this.create('H4');
		this.set_attrs();
	}
}

class Title5 extends Text {
	constructor(options){
		super(options);
		this.opts = options;
		this.create('H5');
		this.set_attrs();
	}
}

class Title6 extends Text {
	constructor(options){
		super(options);
		this.opts = options;
		this.create('H6');
		this.set_attrs();
	}
}

Factory.register('Text', Text);
Factory.register('Title1', Title1);
Factory.register('Title2', Title2);
Factory.register('Title3', Title3);
Factory.register('Title4', Title4);
Factory.register('Title5', Title5);
Factory.register('Title6', Title6);

class I18n {
	constructor(){
		this.msgs = {}
	}
	i18n(txt){
		if (this.msgs.hasOwnProperty(txt)){
			return this.msgs[txt];
		}
		return txt;
	}
}

class Bricks {
	widgetBuild(desc){
		const klassname = desc.widgettype;
		let klass = Factory.get(desc.widgettype);
		if (! klass){
			return null;
		}
		let w = new klass(desc.options);
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
		if (opts.i18n) {
			desc = istructuredClone(ops.i18n);
		}
	}
	run(){
		let b = new Bricks();
		let opts = structuredClone(this.opts.widget);
		let w = b.widgetBuild(opts);
		let root = document.getElementsByTagName('body')[0];
		root.append(w.dom_element);
	}
}
