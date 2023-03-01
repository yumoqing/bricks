class I18n {
	constructor(url, default_lang){
		/*
		{
		 	url:
			method:
			default_lang
		}
		*/
		this.url = opts.url;
		this.default_lang = opts.default_lang||'en';
		this.method = opts.method || 'GET';
		this.lang_msgs = {};
		this.msgs = {};
	}
	_(txt, obj){
		if (this.msgs.hasOwnProperty(txt)){
			itxt = this.msgs[txt];
		}
		if (obj instanceof Object){
				return obj.fmtstr(itxt);
		}
		return txt;
	}
	is_loaded(lang){
		if (this.lang_msgs.get(lang)) return true;
		return false;
	}
	setup_dict(dic, lang){
		this.cur_lang = lang;
		this.lang_msgs.update({lang:dic});
		this.msgs = dic;
	}
	async change_lang(lang){
		if (this.lang_msgs.get(lang)){
			this.msgs = this.lang_msgs.get(lang);
			return;
		}
		
		if (! this.url) return;

		let params = {'lang':lang};
		d = await jcall(desc.url, {
					"method":this.method || 'GET', 
					params:params
		});
		this.setup_dict(d, lang);
	}
}

