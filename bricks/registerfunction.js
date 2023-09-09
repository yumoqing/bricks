class RegisterFunction {
	constructor(){
		this.rfs = {};
	}
	register(n, f){
		extend(this.rfs, {n:f});
	}
	get(n){
		return objget(this.rfs, n);
	}
}
