var bricks = window.bricks || {};

class RegisterFunction {
	constructor(){
		this.rfs = {};
	}
	register(n, f){
		this.rfs[n] = f;
	}
	get(n){
		try {
			return this.rfs[n];
		} catch(e){
			return null;
		}
	}
}

bricks.RF = new RegisterFunction();
