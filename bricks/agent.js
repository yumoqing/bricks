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
bricks.AgentOut = class extends bricks.VBox {
    constructor(opts){
        super(opts);
        this.rc_w = null;
        this.c_w = null;
        this.v_w = null;
        this.i_w = null;
        this.a_w = null;
        this.glb_w = null;
        this.images = [];
        this.reasoning_content = '';
        this.content = '';
        this.error = '';
		this.qa_w  = null;
        this.bricks_widgets = [];  // bricks widget descriptor chunks
    }

    update(data){
        // Handle bricks widget descriptor JSON ({"widgettype": "Text", "options": {...}})
        if (data.widgettype){
            bricks.widgetBuild(data).then(function(w){
                if (w){
                    this.bricks_widgets.push(w);
                    if (!(w instanceof bricks.PopupWindow)){
                        this.add_widget(w);
                    }
                }
            }.bind(this));
            return;
        }
        if (data.audio){
            var url = data.audio;
            if (! data.audio.startsWith('http')){
                if (! data.audio.startsWith('data:audio/')){
                    url = 'data:audio/wav;base64,' + url;
                }
            }
            if (!this.a_w) {
                this.a_w = new bricks.AudioPlayer({
                    width: '100%',
                    autoplay: true,
                    url: url,
                    cheight:2
                });
            } else {
                this.a_w.add_url(url);
            }
        }
        if (data.glb){
            this.glb_w = new bricks.GlbViewer({
                url:data.glb,
                width: '100%'
            });
        }
        if (data.video){
            if (!this.v_w){
                this.v_w = new bricks.VideoPlayer({
                    width: '100%',
                    url: data.video,
                    autoplay: true
                });
            } else {
                this.v_w.add_url(data.video);
            }
        }
        if (data.error){
            this.error += data.error;
        }
        if (data.reasoning_content){
            this.reasoning_content += data.reasoning_content;
        }
        if (data.content){
            this.content += data.content;
        }
        if (data.image){
            if (Array.isArray(data.image)){
                this.images.concat(data.image);
            } else {
                this.images.push(data.image);
            }
        }
		if (data.reply){
			var opts = {
				dimiss_events: [ 'submit' ],
				auto_open: true,
				content: {
					widgettype: "Form",
					options: {
						submit_url: this.rply_url,
						title: "补充信息",
						description: data.reply.question,
						fields:[
							{
								name: 'questionkey',
								uitype: 'hide',
								value: data.reply.questionkey
							},
							{
								name: ' answer',
								uitype: 'text',
								required: true
							}
						]
					}
				}
			};
			var win = new bricks.PopupWindow(opts);
		}
        this.clear_widgets();
        if (this.error.length) {
            var txt = bricks.escapeSpecialChars(this.error);
            this.c_w = new bricks.Text({
                text: this.error,
                wrap: true,
                halign: 'left',
                css: 'resp-error',
                width: '100%'
            });
            this.add_widget(this.c_w);
        }
        if (this.reasoning_content.length) {
            var txt = bricks.escapeSpecialChars(this.reasoning_content);
            this.rc_w = new bricks.MdWidget({
                mdtext: this.reasoning_content,
                css: 'thinking-content',
                bgcolor: '#f0d0d0',
                width: '100%'
            });
            this.add_widget(this.rc_w);
        }
        if (this.content.length) {
            var txt = bricks.escapeSpecialChars(this.content);
            this.c_w = new bricks.MdWidget({
                mdtext: this.content,
                css: 'resp-content',
                width: '100%'
            });
            this.add_widget(this.c_w);
        }
        if (this.v_w) {
            this.add_widget(this.v_w);
        }
        if (this.glb_w){
            this.add_widget(this.glb_w);
        }
        if (this.a_w) {
            this.add_widget(this.a_w);
        }
        if (this.images.length){
            this.images.forEach( i => {
                var w = new bricks.Image({
                    width: '100%',
                    url: i
                });
                this.add_widget(w)
            });
        }
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
		this.filler = new bricks.AgentOut({width: '100%', 
			css: 'card', 
			reply_url: this.reply_url});
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
        var mdtext = bricks.escapeSpecialChars(data.prompt) + '\n';
		if (data.add_files){
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
		}
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

bricks.AgentIO = class extends bricks.VBox {
	/*
	options:
	{
		agent_using_llmid: #agent使用的大模型id
		reply_url：			# 补充问题url
		url:				# agent接受问题的url
	}
	*/
	constructor(opts){
		if (!opts.height) opts.height = '100%';
		super(opts);
		this.llmmodels = [];
		this.msg_box = new bricks.VScrollPanel({
			width: '100%',
			css: 'filler'
		});
		this.inputw = new bricks.AgentInput({model_dataurl:this.opts.model_dataurl,model_cwidth:this.opts.model_cwidth,placeholder:this.opts.placeholder});
		this.inputw.bind('inputed', this.user_inputed.bind(this));
		this.add_widget(this.msg_box);
		this.add_widget(this.inputw);
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
	async user_inputed(e){
		// 中止上一次请求
		if (this._current_hr) {
			this._current_hr.abort();
			this._current_hr = null;
		}
		this.show_input(e.params);
		var params = e.params;
		params.llmid = this.agent_using_llmid;
		console.log('params=', params);
		/*
		var agent = new bricks.AgentModel(this, {
			url:this.opts.url,
			params: params,
			method: this.opts.method || 'POST',
			reply_url: this.opts.reply_url
		});
		agent.set_inputed(params);
		*/
		var mout = new bricks.AgentOutput({
						reply_url: this.opts.reply_url
					});
		this.msg_box.add_widget(mout);
		var hr = new bricks.HttpResponseStream();
		this._current_hr = hr;
		var resp = await hr.post(this.opts.url, {params:params});
		if (! resp) {
			mout.run_stopped();
			this._current_hr = null;
			return;
		}
		await hr.handle_chunk(resp, this.chunk_response.bind(this, mout));
		this._current_hr = null;
		this.chunk_ended();
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
        this.msg_box.add_widget(box);
    }   
}

bricks.Factory.register('AgentIO', bricks.AgentIO);
