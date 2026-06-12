bricks = window.bricks || {}

bricks.LlmMsgAudio = class extends bricks.UpStreaming {
	constructor(opts){
		super(opts);
		this.olddata = '';
		this.data = '';
		this.cn_p = ["。","，","！","？","\n"];
		this.other_p = [".",",","!","?","\n"];
		this.audio = AudioPlayer({})
	}
	detectLanguage(text) {
		try {
			const detector = new Intl.LocaleDetector();
			const locale = detector.detectLocaleOf(text);
			return locale.language;
		} catch (error) {
			console.error('无法检测语言:', error);
			return '未知';
		}
	}
	send(data){
		var newdata = data.slice(this.olddata.length);
		this.olddata = data;
		this.data += newdata;
		var lang = detectLaguage(this.data);
		var parts;
		if (lang='zh'){
			parts = this.data.split(this.cn_p).filter(part => part.trim()!== '');
		} else {
			parts = this.data.split(this.oter_p).filter(part => part.trim()!== '');
		}
		for(var i=0;i<parts.length - 1; i++){
			super.send(parts[i]);
		}
		this.data = parts[parts.length - 1];
	}
	async go(){
		var resp = await super.go();
		this.audio.set_source_from_response(resp);
		return resp;
	}
}
bricks.ModelOutput = class extends bricks.VBox {
	/* {
		icon:
	}
	完成模型输出的控件的初始化以及获得数据后的更新， 更新是的数据在流模式下，需要使用累积数据
	*/
	constructor(opts){
		if(! opts){
			opts = {};
		}
		opts.width = '100%';
		opts.height = 'auto';
		super(opts);
		var hb = new bricks.HBox({width:'100%', cheight:2});
		this.img = new bricks.Svg({
			rate:2,
			tip:this.opts.modelname,
			url:this.icon||bricks_resource('imgs/llm.svg')
		});
		hb.add_widget(this.img);
		var mname = new bricks.Text({text:this.opts.modelname});
		hb.add_widget(mname);
		this.add_widget(hb);
		
		this.content = new bricks.HBox({width:'100%'});
		this.add_widget(this.content);
		this.llmusageid = null;
		this.run = new bricks.BaseRunning({target:this, cheight:2, cwidth:2});
		this.content.add_widget(this.run);
		this.filler = new bricks.LlmOut({width: '100%', css: 'card'});
		this.filler.set_css('filler');
		this.content.add_widget(new bricks.BlankIcon({rate:2, flexShrink:0}));
		this.content.add_widget(this.filler);
		// this.content.add_widget(new bricks.BlankIcon({rate:2, flexShrink:0}));
		this.build_estimate_widgets();
	}
	build_estimate_widgets(){
		if (!this.estimate_url) return;
		this.estimate_w = new bricks.HBox({width:'100%', cheight:2});
		var txtw = new bricks.Text({
			otext:'结果满意吗？',
			i18n:true,
		});
		var likew = new bricks.Svg({rate:1.5, url:bricks_resource('imgs/praise.svg')});
		var unlikew = new bricks.Svg({rate:1.5, url:bricks_resource('imgs/criticize.svg')});
		likew.bind('click', this.estimate_llm.bind(this, likew, 1));
		unlikew.bind('click', this.estimate_llm.bind(this, unlikew, -1))
		this.estimate_w.add_widget(txtw);
		this.estimate_w.add_widget(likew);
		this.estimate_w.add_widget(new bricks.BlankIcon({rate:1, flexShrink:0}));
		this.estimate_w.add_widget(unlikew);
		likew.set_style('cursor', 'pointer');
		unlikew.set_style('cursor', 'pointer');
		this.add_widget(this.estimate_w);
		this.estimate_w.hide();
	}
	async estimate_llm(icon, val, event){
		var desc = {
			"widgettype":"urlwidget",
			"options":{
				"params":{
					"id":this.llmusageid,
					"value":val
				},
				"url":this.estimate_url
			}
		};
		icon.rate = 2;
		icon.charsize_sizing();
		var w = await bricks.widgetBuild(desc, this);
		this.estimate_w.disabled(true);
	}
	run_stopped(){
		if (this.run) {
			this.run.stop_timepass();
			this.content.remove_widget(this.run);
			this.run = null;
		}
	}
	async update_data(data){
		this.run_stopped();
		this.filler.update(data);
		if (data.llmusageid) {
			this.llmusageid = data.llmusageid
		}
		return;
	}
	finish(){
		console.log('finished')
	}
}

bricks.LlmModel = class extends bricks.JsWidget {
	/*
		{
			icon:
			model:
			url:
			params:
			user_message_format:
			system_message_format:
			llm_message_format:
			use_session:
			input_from:
			textvoice:
			tts_url:
			response_mode:stream, sync or async
		}
	*/
	constructor(llmio, opts){
		super(opts);
		this.llmio = llmio;
	}
	render_title(){
		var w = new bricks.HBox({cwidth:3, cheight:3, padding:'4px', margin:'2px', css:'clickable'});
		w.bind('click', this.show_setup_panel.bind(this))
		var img = new bricks.Svg({
			rate:2,
			tip:this.opts.modelname,
			url:this.opts.icon||bricks_resource('imgs/llm.svg')
		});
		w.add_widget(img);
		// var txt = new bricks.Text({text:this.opts.modelname});
		// w.add_widget(txt);
		return w;
	}
	show_setup_panel(event){

	}
	inputdata2uploaddata(data){
		var d;
		if (data instanceof FormData){
			d = bricks.formdata_copy(data);
		} else {
			d = objcopy(data);
		}
		if (data instanceof FormData){
			if( ! this.llmio.model_inputed ) d.append('model', this.opts.model)
			d.append('llmid', this.opts.llmid)
			d.append('stream', this.opts.stream)
			if (this.opts.llmcatelogid) d.append('llmcatelogid', this.opts.llmcatelogid)
			if (this.llmio.enabled_kdb){
				Object.keys(this.llmio.kdb_setting).forEach(k =>{
					d.append(k, this.llmio.kdb_setting[k]);
				});
			}
		} else {
			if (! this.llmio.model_inputed) d.model = this.opts.model;
			d.llmid = this.opts.llmid;
			if (this.opts.llmcatelogid) d.llmcatelogid = this.opts.llmcatelogid;
			if (this.llmio.enabled_kdb){
				Object.keys(this.llmio.kdb_setting).forEach(k =>{
					d[k] = this.llmio.kdb_setting[k];
				});
			}
		}
		return d;
	}
	async model_inputed(data){
		var mout = new bricks.ModelOutput({
					textvoice:this.textvoice,
					tts_url:this.tts_url,
					icon:this.opts.icon,
					response_mode: this.opts.response_mode,
					model:this.opts.model, 
					modelname:this.opts.modelname,
					estimate_url:this.llmio.estimate_url
					});
		this.llmio.o_w.add_widget(mout);
		switch (this.response_mode) {
			case 'async':
				var d = this.inputdata2uploaddata(data);
				console.log('data_inouted=', data, 'upload_data=', d);
				var hj = new bricks.HttpJson()
				var resp = await hj.post(this.opts.url, {params:d});
				if (! resp) {
					mout.run_stopped();
					return;
				}
				mout.update_data(resp);
				if (resp.status == 'FAILED'){
					return;
				}
				await this.query_task_status(mout, resp.taskid)
				break;
			case 'stream':
				var d = this.inputdata2uploaddata(data);
				var hr = new bricks.HttpResponseStream();
				var resp = await hr.post(this.opts.url, {params:d});
				if (! resp) {
					mout.run_stopped();
					return;
				}
				await hr.handle_chunk(resp, this.chunk_response.bind(this, mout));
				this.chunk_ended();
				break;
			default:
				var d = this.inputdata2uploaddata(data);
				console.log('data_inouted=', data, 'upload_data=', d);
				var hj = new bricks.HttpJson()
				var resp = await hj.post(this.opts.url, {params:d});
				if (! resp) {
					mout.run_stopped();
					return;
				}
				mout.update_data(resp);
		}
		mout.estimate_w.show();
	}
	is_accept_source(source){
		if (this.opts.input_from == source){
			return true;
		}
		return false;
	}
	llm_msg_format(){
		return this.llm_message_format || {role:'assistant', content:"${content}"}
	}
	async query_task_status(mout, taskid){
		var pt = this.opts.period_time || 30;
		while (1){
		var hj = new bricks.HttpJson()
		var d = {
			taskid: taskid
		}
		var resp = await hj.post(this.opts.query_url, {params:d});
		if (! resp) {
			return;
		}
		if (resp.status != 'ok'){
			console.log('error:' + resp.data.message);
		}
		var data = resp.data.response
		mout.update_data(data);
		if (data.status == 'FAILED' || data.status == 'SUCCEEDED'){
			return;
		}
		await bricks.sleep(pt);
		}
		//schedule_once(this.query_task_status.bind(this), pt)
	}
	chunk_response(mout, l){
		l = l.trim();
		try {
			var d = JSON.parse(l);
		} catch(e){
			console.log(l, 'is not a json data');
			return
		}
		console.log('l=', l, 'd=', d);
		mout.update_data(d);
	}
	chunk_ended(){
		console.log('chunk end');
	}
}
bricks.LlmIO = class extends bricks.VBox {
	/*
	options:
	{
		user_icon:
		list_models_url:
		input_fields:
		models:
	}
	models:[
		{
			icon:
			model:
			modelnmae:
			url:
			params:
			use_session:
			system_prompt:
			user_parmpt:
			input_from:
			io_mode:stream, sync or async
		}
	]
	*/
	constructor(opts){
		super(opts);
		this.llmmodels = [];
		this.title_w = new bricks.HBox({cheight:3});
		var bottom_box = new bricks.HBox({cheight:3});
		this.i_w = new bricks.Svg({
				rate:2, 
				url:bricks_resource('imgs/input.svg'),
				margin:'14px',
				tip:'input data',
				css:'clickable'
		});
		this.nm_w = new bricks.Svg({
				rate:2, 
				url:bricks_resource('imgs/add.svg'), 
				margin:'14px',
				tip:'add new model',
				css:'clickable'
		});
		if (this.enabled_kdb){
			this.kdb_w = new bricks.Svg({
                rate:2,
                url:bricks_resource('imgs/kdb.svg'),
                margin:'14px',
                tip:'setup kdb config',
                css:'clickable'
			});
			bottom_box.add_widget(this.kdb_w);
			this.kdb_w.bind('click', this.setup_kdb.bind(this));
		}
		this.input_fields.forEach(f => {
			if (f.name == 'model') this.model_inputed = true;
		});
		bottom_box.add_widget(this.i_w);
		bottom_box.add_widget(this.nm_w);
		
		this.nm_w.bind('click', this.open_search_models.bind(this));
		this.i_w.bind('click', this.open_input_widget.bind(this));
		this.o_w = new bricks.Filler({overflow:'auto'});
		this.add_widget(this.title_w);
		this.add_widget(this.o_w);
		if (this.models.length < 2 && this.tts_url){
			this.textvoice = true;
		}
		this.add_widget(bottom_box);
		this.models.forEach( m =>{
			this.show_added_model(m);
		});
	}
    async show_input(params){
        var box = new bricks.HBox({width:'100%'});
        var data = inputdata2dic(params);
        console.log('data=', data);
        var w = new bricks.UserInputView({
			width: '100%',
			input_fields: this.input_fields,
			data:data
		});
        w.set_css(this.msg_css||'user_msg');
        w.set_css('filler');
        var img = new bricks.Svg({rate:2,url:this.user_icon||bricks_resource('imgs/chat-user.svg')}); 
        // box.add_widget(new bricks.BlankIcon({rate:2, flexShrink:0}));
        box.add_widget(w);
        box.add_widget(img);
        this.o_w.add_widget(box);
    }   

	show_added_model(m){
		if (this.textvoice){
			m.textvoice = true;
			m.tts_url = this.tts_url;
		}
		var lm = new bricks.LlmModel(this, m);
		this.llmmodels.push(lm);
		var tw = lm.render_title();
		this.title_w.add_widget(tw);
	}
	async open_search_models(event){
		event.preventDefault();
		event.stopPropagation();
		var rect = this.showRectage();
		var opts = {
			title:"select model",
			icon:bricks_resource('imgs/search.png'),
			auto_destroy:true,
			auto_open:true,
			auto_dismiss:false,
			movable:true,
			top:rect.top + 'px',
			left:rect.left + 'px',
			width: rect.right - rect.left + 'px',
			height: rect.bottom - rect.top + 'px'
		}
		var w = new bricks.PopupWindow(opts);
		var sopts = {
			data_url:this.list_models_url,
			data_params:{
				llmid:this.models[0].llmid,
				llmcatelogid:this.models[0].llmcatelogid
			},
			data_method:'POST',
			col_cwidth: 36,
			record_view:{
				widgettype:"VBox",
				options:{
					cheight:14,
					css:"card",
					margin:"8px"
				},
				subwidgets:[
					{
						widgettype: "HBox",
						options: {
							cheight: 2
						},
						subwidgets: [
							{
								widgettype:"Svg",
								options: {
									url:"/appbase/show_icon.dspy?id=${iconid}"
								}
							},
							{
								widgettype:"Title6",
								options:{
									text:"${name}"
								}
							}
						]
					},
					{
						widgettype:"Filler",
						options:{
							css:"scroll"
						},
						subwidgets:[
							{
								widgettype:"VBox",
								options:{
									css:"subcard"
								},
								subwidgets:[
									{
										widgettype:"Text",
										options:{
											text:"模型描述：${description}",
											wrap:true
										}
									},
									{
										widgettype:"Text",
										options:{
											text:"启用日期：${enable_date}"
										}
									}
								]
							}
						]
					}
				]
			}
		};
		var cols = new bricks.Cols(sopts);
		cols.bind('record_click', this.add_new_model.bind(this));
		cols.bind('record_click', w.dismiss.bind(w));
		w.add_widget(cols);
		w.open();
	}
	async add_new_model(event){
		event.preventDefault();
		event.stopPropagation();
		var llm = event.params;
		this.models.push(llm);
		this.show_added_model(llm);
	}
	async setup_kdb(event){
		var data = this.kdb_setting
		if (! this.kdb_setting.prompt_tmpl){
			this.kdb_setting.prompt_tmpl = `将下面的提示词按照后面贴出的参考知识改写:

{{prompt}}

{% for r in records %}
参考{{loop.index}}:{{r.content}}

{% endfor %}`;
		}
		event.preventDefault();
		event.stopPropagation();
		var rect = this.showRectage();
		var opts = {
			title:"choose kdb",
			icon:bricks_resource('imgs/kdb.svg'),
			auto_destroy:true,
			auto_open:true,
			auto_dismiss:false,
			movable:true,
			top:rect.top + 'px',
			left:rect.left + 'px',
			width: rect.right - rect.left + 'px',
			height: rect.bottom - rect.top + 'px'
		}
		var w = new bricks.PopupWindow(opts);
		var fopts = {
			fields:[
				{
					"name": "kdbids",
					"value":data.kdbids,
					"uitype":"checkbox",
					"multicheck": true,
					"required": true,
					"label":"知识库",
					"valueField":"id",
					"textField":"name",
					"dataurl":this.get_kdb_url
				},
				{
					"name":"recall_cnt",
					"uitype":"int",
					"value": data.recall_cnt,
					"label":"召回数量"
				},
				{
					"name":"prompt_tmpl",
					"value":data.prompt_tmpl,
					"uitype":"text",
					"required": true,
					"label":"模版"
				}
			]
		}
		var fw = new bricks.Form(fopts);
		fw.bind('submit', this.handle_kdb_setup.bind(this));
		fw.bind('submit', w.destroy.bind(w));
		w.add_widget(fw);
		w.open();
	}
	async handle_kdb_setup(event){
		event.preventDefault();
		event.stopPropagation();
		this.kdb_setting = formdata2object(event.params);
		console.log('kdb_setting=', this.kdb_setting);
	}
	async open_input_widget(event){
		event.preventDefault();
		event.stopPropagation();
		var rect = this.showRectage();
		var opts = {
			title:"input data",
			icon:bricks_resource('imgs/input.svg'),
			auto_destroy:true,
			auto_open:true,
			auto_dismiss:false,
			movable:true,
			top:rect.top + 'px',
			left:rect.left + 'px',
			width: rect.right - rect.left + 'px',
			height: rect.bottom - rect.top + 'px'
		}
		var w = new bricks.PopupWindow(opts);
		var fopts = {
			fields:this.input_fields
		}
		var fw = new bricks.Form(fopts);
		fw.bind('submit', this.handle_input.bind(this));
		fw.bind('submit', w.destroy.bind(w));
		w.add_widget(fw);
		w.open();
	}
	async handle_input(event){
		var params = event.params;
		this.show_input(params);
		for(var i=0;i<this.llmmodels.length;i++){
			var lm = this.llmmodels[i];
			schedule_once(lm.model_inputed.bind(lm, params), 0.01);
		};
	}
}

bricks.Factory.register('LlmIO', bricks.LlmIO);
