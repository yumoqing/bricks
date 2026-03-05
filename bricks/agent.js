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
bricks.AgentOutput = class extends bricks.VBox {
	/* {
		icon:
		reply_url:
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
			url:this.icon||bricks_resource('imgs/agent.svg')
		});
		hb.add_widget(this.img);
		this.add_widget(hb);
		
		this.content = new bricks.HBox({width:'100%'});
		this.add_widget(this.content);
		this.run = new bricks.BaseRunning({target:this, cheight:2, cwidth:2});
		this.content.add_widget(this.run);
		this.filler = new bricks.LlmOut({width: '100%', css: 'card'});
		this.filler.set_css('filler');
		this.content.add_widget(new bricks.BlankIcon({rate:2, flexShrink:0}));
		this.content.add_widget(this.filler);
		// this.content.add_widget(new bricks.BlankIcon({rate:2, flexShrink:0}));
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

bricks.AgentInputView = class extends bricks.VBox {
    constructor(opts){
        super(opts);
        this.v_w = null;
        this.a_v = null;
        this.show_input(this.data);
    }
    show_input(data){
        var mdtext = data.prompt + '\n';
        data.add_files.forEach(f =>{
			if (f.type.startsWith('video/')) {
				var url = URL.createObjectURL(f);
				this.v_w = new bricks.VideoPlayer({
					url:url,
					autoplay:true,
					width: '100%'
				});
			} else if (f.type.startsWith('audio')){
				var url = URL.createObjectURL(f);
				this.a_w = new bricks.AudioPlayer({
					url:url,
					autoplay:true,
					width: '100%'
				});
			} else if (f.type.startsWith('image')){
				var url = URL.createObjectURL(f);
				mdtext += `![${f.name}](${url})`;
			} else {
				var url = URL.createObjectURL(f);
				mdtext += `[${f.name}](${url})`;
			}
        });
        this.clear_widgets();
        var w = new bricks.MdWidget({
            width: '100%',
            mdtext:mdtext
        });
        console.log('mdtext=', mdtext);
        this.add_widget(w);
        if (this.v_w){
            this.add_widget(this.v_w);
        }
        if (this.a_w){
            this.add_widget(this.a_w);
        }
    }
}

bricks.AgentModel = class extends bricks.JsWidget {
	/*
		{
			icon:
			url:
			params:
			reply_url:
		}
	*/
	constructor(llmio, opts){
		super(opts);
		this.llmio = llmio;
	}
	async model_inputed(data){
		var mout = new bricks.AgentOutput({
					});
		this.llmio.o_w.add_widget(mout);
		var d = data;
		var hr = new bricks.HttpResponseStream();
		var resp = await hr.post(this.opts.url, {params:d});
		if (! resp) {
			mout.run_stopped();
			return;
		}
		await hr.handle_chunk(resp, this.chunk_response.bind(this, mout));
		this.chunk_ended();
		mout.estimate_w.show();
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
bricks.AgentIO = class extends bricks.VBox {
	/*
	options:
	{
		user_icon:
		agent_icon:
		agent_url:
		params:
	}
	*/
	constructor(opts){
		super(opts);
		this.llmmodels = [];
		this.msg_box = new bricks.VScrollPanel({
			width: '100%',
			css: 'filler'
		});
		this.inputw = new bricks.TextFiles({});
		this.inputw.bind('inputed', this.user_inputed.bind(this));
		this.add_widget(this.msg_box);
		this.add_widget(this.inputw);
	}
	user_inputed(e){
		this.show_input(e.params);
		new llmmodel = new bricks.LlmModel();
		llmmodel.model_inputed(e.params);
	}
    async show_input(params){
        var box = new bricks.HBox({width:'100%'});
        var data = params;
        var w = new bricks.AgentInputView({
			width: '100%',
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
}

bricks.Factory.register('AgentIO', bricks.AgentIO);
