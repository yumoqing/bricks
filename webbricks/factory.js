class Factory_ {
	constructor(){
		this.widgets_kv = {};
	}
	register(name, widget){
		this.widgets_kv[name] = widget;
	}
	get(name){
		if (this.widgets_kv.has(name)){
			return this.widgets_kv[name];
		}
		return null;
	}
}
const Factory = new Factory_();
