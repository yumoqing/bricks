class I18n {
	constructor(){
		this.msgs = {};
		console.log('I18n():msg=', this.msgs);
	}
	_(txt){
		if (this.msgs.hasOwnProperty(txt)){
			return this.msgs[txt];
		}
		return txt;
	}
}

