class UiTypesDef {
	constructor(opts){
		this.opts = opts;
		this.uitypes = {
		}
	}
	set(uitype, viewKlass, inputKlass){
		if (! this.uitypes[uitype]){
			this.uitypes[uitype] = {};
		}
		this.uitypes[uitype].viewKlass = viewKlass;
		this.uitypes[uitype].inputKlass = inputKlass;
	}
	get(uitype){
		return [this.uitypes[uitype].viewKlass, this.uitypes[uitype].inputClass];
	}
	getInputKlass(uitype){
		return this.uitypes[uitype].inputKlass;
	}
	getViewKlass(uitype){
		return this.uitypes[uitype].viewKlass;
	}
	setViewKlass(uitype, klass){
		if (! this.uitypes[uitype]){
			this.uitypes[uitype] = {};
		}
		this.uitypes[uitype].viewKlass = klass;
	}
	setInputKlass(uitype, klass){
		if (! this.uitypes[uitype]){
			this.uitypes[uitype] = {};
		}
		this.uitypes[uitype].inputKlass = klass;
	}
}

var uitypesdef = new UiTypesDef();
