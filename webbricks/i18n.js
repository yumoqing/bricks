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

