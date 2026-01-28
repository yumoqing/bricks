var bricks = window.bricks || {};
class Factory_ {
	constructor(){
		this.widgets_kv = new Object();
		this.widgets_kv['_t_'] = 1;
	}
	register(name, widget){
		this.widgets_kv[name] = widget;
	}
	isWidgetType(w, typename){
		var typ = this.get(typename);
		if (! typ) return false;
		if (w instanceof typ) return true;
		return false;
	}
	get(name){
		if (this.widgets_kv.hasOwnProperty(name)){
			return this.widgets_kv[name];
		}
		return null;
	}
}
bricks.Factory = new Factory_();

