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
		output_view:
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
		this.logid = null;
		this.run = new bricks.BaseRunning({target:this});
		this.content.add_widget(this.run);
		this.filler = new bricks.VBox({});
		this.filler.set_css('filler');
		this.content.add_widget(new bricks.BlankIcon({rate:2, flexShrink:0}));
		this.content.add_widget(this.filler);
		this.content.add_widget(new bricks.BlankIcon({rate:2, flexShrink:0}));
		this.build_estimate_widgets();
	}
	build_estimate_widgets(){
		if (!this.estimate_url) return;
		this.estimate_w = new bricks.HBox({width:'100%', cheight:2});
		var txtw = new bricks.Text({
			otext:'结果满意吗？',
			i18n:true,
		});
		var likew = new bricks.Svg({rate:2, url:bricks_resource('imgs/like.svg')});
		var unlikew = new bricks.Svg({rate:2, url:bricks_resource('imgs/dislike.svg')});
		likew.bind('click', this.estimate_llm.bind(this, 1));
		unlikew.bind('click', this.estimate_llm.bind(this, -1))
		this.estimate_w.add_widget(txtw);
		this.estimate_w.add_widget(likew);
		this.estimate_w.add_widget(new bricks.BlankIcon({rate:1, flexShrink:0}));
		this.estimate_w.add_widget(unlikew);
		likew.set_style('cursor', 'pointer');
		unlikew.set_style('cursor', 'pointer');
		this.estimate_w.hide();
	}
	async estimate_llm(val, event){
		var desc = {
			"widgettype":"urlwidget",
			"options":{
				"params":{
					"logid":this.logid,
					"value":val
				},
				"url":this.estimate_url
			}
		};
		var icon = event.target.bricks_widget;
		icon.rate = 2;
		icon.charsize_sizing();
		var w = await bricks.widgetBuild(desc, this);
		this.estimate_w.disabled(true);
	}
	async update_data(data){
		if (this.run) {
			this.received_content = '';
			this.received_reasoning_content = '';
			this.run.stop_timepass();
			this.content.remove_widget(this.run);
		}
		if (data.content){
			this.received_content += data.content;
			data.content = bricks.escapeSpecialChars(this.received_content);
			bricks.escapeSpecialChars(data.content)
		}
		if (data.reasoning_content){
			this.received_reasoning_content += data.reasoning_content;
			data.reasoning_content = bricks.escapeSpecialChars(this.received_reasoning_content);
		}
		this.run = null;
		this.filler.clear_widgets();
		if (typeof this.output_view === 'string'){
			this.output_view = JSON.parse(this.output_view);
		}
		var desc = bricks.apply_data(this.output_view, data);
		var w = await bricks.widgetBuild(desc, this.llmio);
		if (! w){
			console.log('widgetBuild() return null, desc=', this.output_view, desc, 'data=', data);
			return;
		}
		w.set_css('llm_msg');
		w.set_style('width', '100%');
		this.filler.add_widget(w);
		this.filler.add_widget(this.estimate_w);
		if (data.logid){
			this.logid = data.logid;
			if (this.estimate_url){
				this.estimate_w.show();
			}
		}
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
			output_view:
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
		var w = new bricks.HBox({padding:'15px'});
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
			d.append('model', this.opts.model)
			d.append('llmid', this.opts.llmid)
		} else {
			d.model = this.opts.model;
			d.llmid = this.opts.llmid;
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
					estimate_url:this.llmio.estimate_url,
					output_view:this.opts.output_view});
		this.llmio.o_w.add_widget(mout);
		if (this.response_mode == 'stream' || this.response_mode == 'async') {
			var d = this.inputdata2uploaddata(data);
			var hr = new bricks.HttpResponseStream();
			var resp = await hr.post(this.opts.url, {params:d});
			await hr.handle_chunk(resp, this.chunk_response.bind(this, mout));
			this.chunk_ended();
		} else {
			var d = this.inputdata2uploaddata(data);
			console.log('data_inouted=', data, 'upload_data=', d);
			var hj = new bricks.HttpJson()
			var resp = await hj.post(this.opts.url, {params:d});
			resp.content = bricks.escapeSpecialChars(resp.content)
			mout.update_data(resp);
		}
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
	chunk_response(mout, l){
		l = l.trim();
		try {
			var d = JSON.parse(l);
		} catch(e){
			console.log(l, 'is not a json data');
			return
		}
		if (this.opts.response_mode == 'async'){
			if(d.status != 'SUCCEEDED'){
				console.log('filter all message not successed');
				return;
			}
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
		input_view:
		output_view:
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
				mii:this.models[0].modelinstanceid,
				mti:this.models[0].modeltypeid
			},
			data_method:'POST',
			col_cwidth: 24,
			record_view:{
				widgettype:"VBox",
				options:{
					cheight:20,
					css:"card"
				},
				subwidgets:[
					{
						widgettype:"Title4",
						options:{
							text:"${name}"
						}
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
		this.models.push(event.params);
		this.show_added_model(event.params);
	}
	async open_input_widget(event){
		event.preventDefault();
		event.stopPropagation();
		var rect = this.showRectage();
		var opts = {
			title:"input data",
			icon:bricks_resource('imgs/input.png'),
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
		await this.show_input(params);
		for(var i=0;i<this.llmmodels.length;i++){
			var lm = this.llmmodels[i];
			schedule_once(lm.model_inputed.bind(lm, params), 0.01);
		};
	}
	async show_input(params){
		var box = new bricks.HBox({width:'100%'});
		var data = inputdata2dic(params);
		console.log('data=', data, 'input_view=', this.input_view);
		var w = await bricks.widgetBuild(this.input_view, this.o_w, data);
		w.set_css(this.msg_css||'user_msg');
		w.set_css('filler');
		var img = new bricks.Svg({rate:2,url:this.user_icon||bricks_resource('imgs/chat-user.svg')});
		box.add_widget(new bricks.BlankIcon({rate:2, flexShrink:0}));
		box.add_widget(w);
		box.add_widget(img);
		this.o_w.add_widget(box);
	}
}

bricks.Factory.register('LlmIO', bricks.LlmIO);
