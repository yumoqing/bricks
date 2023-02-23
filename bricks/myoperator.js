class Oper {
	constructor(v){
		this.value = v;
	}
	__plus__(a, b){
		console.log(a, b);
		return new Oper(a.value + b.value);
	}
	__add__(a, b){
		console.log(a, b);
		return new Oper(a.value + b.value);
	}
}
