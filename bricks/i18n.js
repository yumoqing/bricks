var bricks = window.bricks || {};

bricks.I18n = class {
	/*
	opts={
		i18n
		lang
	}
	*/
	constructor(opts){
		/*
		{
		 	url:
			method:
			lang:
			i18n_path:
		}
		*/
		this.url = opts.url || '/i18n'
		this.i18n_path = opts.i18n_path;
		this.lang = opts.lang;
		this.method = opts.method || 'GET';
		this.lang_msgs = {};
		this.msgs = {};
		this.uni18n = {};
	}

	_(txt, obj){
		var outt, mt;
		var msgs = this.lang_msgs[this.lang].msgs;
		mt = msgs[txt] || txt;
		if (obj instanceof Object){
			outt = obj_fmtstr(obj, mt);
		} else {
			outt = mt;
		}
		if (mt == txt) {
			this.set_uni18n(txt);
		}
		return outt;
	}
	set_uni18n(txt){
		var d = this.lang_msgs[this.lang].unmsgs;
		if (! d[txt]){
			d[txt] = 1;
		}
	}
	is_loaded(lang){
		if (objget(this.lang_msgs, lang)) return true;
		return false;
	}
	get_uni18n(){
		return self.lang_msgs[this.lang].unmsgs;
	}
	setup_dict(dic, lang){
		this.lang = lang;
		this.lang_msgs[lang] = {
			msgs:dic,
			unmsgs:{}
		}
	}
	async get_lang_dic(lang){
		let params = {
			lang:lang,
			i18n: this.i18n_path
		};
		try {
			var jc = new bricks.HttpJson();
			var d = await jc.httpcall(this.url, {
						"method":this.method || 'GET',
						params:params
			});
			this.setup_dict(d, lang);
		} catch(e) {
			console.log('get_lang_dic() error', lang, e);
			this.setup_dict({}, lang);
		}
	
	}
	async change_lang(lang){
		if (this.lang_msgs[lang]){
			return;
		}
		await this.get_lang_dic(lang);
	}
}

