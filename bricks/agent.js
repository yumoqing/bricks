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
		this.inputw = new bricks.AgentInput({model_dataurl:this.opts.model_dataurl,model_cwidth:this.opts.model_cwidth,model_params:this.opts.model_params,placeholder:this.opts.placeholder});
		this.inputw.bind('inputed', this.user_inputed.bind(this));
		this.add_widget(this.msg_box);
		this.add_widget(this.inputw);
		// 用户上翻看历史时暂停跟滚，滚回底部恢复（scroll_to_bottom 依据 _follow）
		this.msg_box.bind('scroll', this._track_follow.bind(this));
		// 内容增长即跟滚到底（2026-09-01 根治）：agent 输出多为 widget 描述符，
		// AgentOut.update 走 widgetBuild().then() 异步挂载——同步滚总在挂载前执行、
		// 滚不到新内容。MutationObserver 在挂载落 DOM 后触发，同步/异步渲染全覆盖，
		// 后台 tab 也生效（rAF 在后台 tab 不触发，已弃用）。
		var mo = window.MutationObserver;
		if (mo) {
			this._mo = new mo(this.scroll_to_bottom.bind(this));
			this._mo.observe(this.msg_box.dom_element,
				{childList: true, subtree: true, characterData: true});
		}
	}
	// 会话区保持最后输出可见（2026-09-01）：内容超出显示范围时自动滚到底。
	// 仅当用户本就停在底部附近才跟滚——用户主动上翻看历史时不强行拉回；
	// 滚回底部或发送新消息后恢复跟滚。
	// 同步滚：读 scrollHeight 本身强制布局，拿到的是新内容尺寸；
	// 不用 rAF（后台 tab 不触发 rAF，流式更新时不滚）。
	scroll_to_bottom(){
		var e = this.msg_box && this.msg_box.dom_element;
		if (!e) return;
		if (this._follow === false) {
			var near_bottom = (e.scrollHeight - e.scrollTop - e.clientHeight) < 80;
			if (!near_bottom) return;
		}
		e.scrollTop = e.scrollHeight;
	}
	_track_follow(){
		var e = this.msg_box && this.msg_box.dom_element;
		if (!e) return;
		var st = e.scrollTop;
		var near = (e.scrollHeight - st - e.clientHeight) < 80;
		if (near) {
			// 滚回底部附近 → 恢复跟滚
			this._follow = true;
		} else if (this._last_st !== undefined && st < this._last_st - 5) {
			// scrollTop 减小 = 用户真上翻 → 暂停跟滚。
			// 程序滚底只会增大 scrollTop；异步 widget 挂载使 scroll 事件滞后时
			// gap 会瞬时 >80，但 st 不减小——不能误判为用户上翻（2026-09-01 根因：
			// 旧实现按 gap 判 follow，第二条消息后程序滚底被自己的 scroll 事件
			// 误关 follow，后续输出不再跟滚）。
			this._follow = false;
		}
		this._last_st = st;
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
		this.scroll_to_bottom();
	}
	chunk_ended(){
		console.log('chunk end');
	}
	// 切换产线（2026-09-07 移动端）：重设 chat/menus/model 地址的 pipeline_id 与
	// session_id（m_<pid>，每产线独立会话不混历史）并清空会话区。
	// 不重建控件 —— inputw 的未发草稿/附件保留。
	// 入参兼容：字符串 pid / 数据对象 {id|pipeline_id} / bind 事件对象
	// （method handler 收到的是 event，数据在 event.params —— ChipBar select）。
	set_pipeline(p){
		if (p && p.params) p = p.params;
		var pid = (typeof p === 'string') ? p
			: ((p && (p.pipeline_id || p.id)) || '');
		if (!pid) return;
		function _u(base, pl){
			if (!base) return base;
			var u = base;
			function _set(key, val){
				if (new RegExp('[?&]' + key + '=').test(u)){
					u = u.replace(new RegExp('([?&]' + key + '=)[^&]*'), '$1' + encodeURIComponent(val));
				} else {
					u += (u.indexOf('?') >= 0 ? '&' : '?') + key + '=' + encodeURIComponent(val);
				}
			}
			_set('pipeline_id', pl);
			_set('session_id', 'm_' + pl);
			return u;
		}
		this._base_chat_url = this._base_chat_url || this.opts.url;
		this._base_model_url = this._base_model_url || this.opts.model_dataurl;
		this.opts.url = _u(this._base_chat_url, pid);
		if (this._base_model_url) {
			this.opts.model_dataurl = _u(this._base_model_url, pid);
			// 模型下拉按产线过滤（capabilities 等参数保留在 _base_model_url 里）
			if (this.inputw && this.inputw.set_model_dataurl) {
				this.inputw.set_model_dataurl(this.opts.model_dataurl,
					{pipeline_id: pid, session_id: 'm_' + pid});
			}
		}
		this.pipeline_id = pid;
		this.msg_box.clear_widgets();
	}
	async user_inputed(e){
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
		// 上传文件：add_files 是浏览器 File 对象，JSON 序列化会丢失内容，改用 FormData
		var files = params.add_files || [];
		var send_params = params;
		if (files.length > 0) {
			send_params = new FormData();
			Object.keys(params).forEach(function(k){
				if (k !== 'add_files' && k !== 'file_names') {
					send_params.append(k, params[k]);
				}
			});
			files.forEach(function(f){ send_params.append('file', f); });
		}
		var resp = await hr.post(this.opts.url, {params:send_params});
		if (! resp) {
			mout.run_stopped();
			return;
		}
		await hr.handle_chunk(resp, this.chunk_response.bind(this, mout));
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
        // 用户刚发的消息必须可见：强制跟滚到底
        this._follow = true;
        this.scroll_to_bottom();
    }   
}

bricks.Factory.register('AgentIO', bricks.AgentIO);
