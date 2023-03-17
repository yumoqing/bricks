class Factory_ {
	constructor(){
		this.widgets_kv = new Object();
		this.widgets_kv['_t_'] = 1;
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

