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
		this.url = opts.url || '/i18n_getmsgs'
		this.i18n_path = opts.i18n_path;
		this.lang = opts.lang;
		this.method = opts.method || 'GET';
		this.lang_msgs = {};
		this.msgs = {};
		this.uni18n = {};
	}

	_(txt, obj){
		var outt, mt;
		this.change_lang(this.lang);
		var msgs = this.lang_msgs[this.lang].msgs || {};
		mt = msgs[txt] || txt;
		if (obj instanceof Object){
			// 🔴 必须用 bricks.obj_fmtstr（该函数定义在 utils.js 的 bricks 命名空间下，
			// 裸 obj_fmtstr 是 ReferenceError）。此前这行从未被执行（无调用方传 obj），
			// 直到 i18n_params 动态文本特性（widget.js 传 params）才暴露此 bug。
			outt = bricks.obj_fmtstr(obj, mt);
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
		return this.lang_msgs[this.lang].unmsgs;
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
			this.lang_msgs[lang] = {
				msgs:{},
				unmsgs:{}
			}
		}
	
	}
	async change_lang(lang){
		this.lang = lang;
		if (this.lang_msgs[lang]){
			return;
		}
		await this.get_lang_dic(lang);
	}
}

