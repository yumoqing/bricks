class RegisterFunction {
	constructor(){
		this.rfs = {};
	}
	register(n, f){
		this.rfs.update({n:f});
	}
	get(n){
		return get(this.rfs, n);
	}
}
