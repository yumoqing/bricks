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
	// 会话被用户「停」中断：冻结已输出内容（停在输入「停」之前的状态），
	// 移除"思考中"动画，末尾追加一个轻量「已停止」标记（挂在 AgentOutput 自身，
	// 不受 filler 重渲染影响；不新增对话气泡）。
	show_stopped(){
		if (this._stopped) return;
		this._stopped = true;
		this.run_stopped();
		try {
			var t = new bricks.Text({
				text: '已停止', otext: '已停止', i18n: true,
				halign: 'left', cfontsize: 0.85, color: '#94a3b8'
			});
			this.add_widget(t);
		} catch(e){}
	}
	async update_data(data){
		if (this._stopped) return;   // 已停止：不再接收/渲染后续 chunk（冻结输出）
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
		this._running_streams = [];   // 在飞的流 [{controller:AbortController, mout:AgentOutput}]，「停」统一中断
		this.msg_box = new bricks.VScrollPanel({
			width: '100%',
			css: 'filler'
		});
		this.inputw = new bricks.AgentInput({model_dataurl:this.opts.model_dataurl,model_cwidth:this.opts.model_cwidth,model_params:this.opts.model_params,placeholder:this.opts.placeholder,secret_dataurl:this.opts.secret_dataurl,secret_params:this.opts.secret_params,secret_format:this.opts.secret_format,secret_title:this.opts.secret_title,secret_url:this.opts.secret_url,secret_tip:this.opts.secret_tip});
		this.inputw.bind('inputed', this.user_inputed.bind(this));
		this.add_widget(this.msg_box);
		this.add_widget(this.inputw);
		// 用户上翻看历史时暂停跟滚，滚回底部恢复（scroll_to_bottom 依据 _follow）
		this.msg_box.bind('scroll', this._track_follow.bind(this));
		// 会话开场提示（2026-11-15 用户口径）：本产线做什么 + 你先这样做 是**会话 agent 的第一条
		// 输出**，显示在会话区里，不是挂在工具栏/菜单行上。构造时按 chat url 同目录的
		// agent_welcome.dspy 拉一次（会话/产线参数跟着原查询串带过去）。
		this.load_welcome();
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
	// 会话开场提示的地址：默认 = chat url 同目录的 agent_welcome.dspy（原查询串照带，
	// session_id/pipeline_id 天然对齐）。可用 options.welcome_url 覆盖；welcome_url:false 关闭。
	// 为什么按同目录推导：所有产线会话页（开发/投标/商机/移动端/通用）都只配了 chat url，
	// 推导可让它们零改动拿到开场白，不必逐仓改 index.ui。
	welcome_url(){
		var o = this.opts || {};
		if (o.welcome_url === false) return '';
		if (o.welcome_url) return o.welcome_url;
		var u = String(o.url || '');
		var q = u.indexOf('?');
		var path = q >= 0 ? u.slice(0, q) : u;
		var qs = q >= 0 ? u.slice(q) : '';
		if (!/\.dspy$/.test(path)) return '';
		// chat url 没带 pipeline_id = 还不知道是哪个产线（如移动端先建 AgentIO、等 ChipBar 拿到
		// 产线列表再 set_pipeline）：此时不拉，否则会先渲染一瞬「开发产线」的错误引导。
		if (!/[?&]pipeline_id=/.test(qs)) return '';
		return path.replace(/[^\/]+$/, 'agent_welcome.dspy') + qs;
	}
	// 拉开场提示并按「agent 的一条输出」渲染（AgentOutput 气泡：头像 + 卡片）。
	// 2026-11-15 二改口径：服务端**每次都返回**（常驻引导条，会话区顶部），只有未登录/异常才返回 {}
	// → 什么都不显示。（旧口径「已有对话记录就不出」已废弃，别按它加回判定。）
	async load_welcome(){
		var url = this.welcome_url();
		if (!url) return;
		var gen = (this._welcome_seq || 0) + 1;
		this._welcome_seq = gen;
		try {
			// 用底层 bricks_fetch 而不用 httpcall：httpcall 对非 2xx 会弹 5 秒错误窗，
			// 而"该页没有开场白端点（404）/服务端异常"都不该打扰用户快照页面。
			var jc = new bricks.HttpJson();
			var resp = await jc.bricks_fetch(url, {method:'GET'});
			if (!resp || !resp.ok) return;
			var desc = JSON.parse(await resp.text());
			if (gen !== this._welcome_seq) return;   // 期间切了产线/会话：丢弃过期结果
			if (!desc || !desc.widgettype) return;
			var mout = new bricks.AgentOutput({});
			mout.run_stopped();        // 开场白不是"思考中"，不要转圈的运行指示
			// 必须落在「第一条」：慢网/重试窗口里用户可能已经先发了消息，
			// 追加到末尾就把开场白挤到提问与回复之后了 —— 有内容就插到 0 位。
			var has_kids = this.msg_box.children && this.msg_box.children.length > 0;
			if (has_kids) { this.msg_box.add_widget(mout, 0); mout.parent = this.msg_box; }
			else this.msg_box.add_widget(mout);
			mout.update_data(desc);
			this.scroll_to_bottom();   // 不强制恢复跟滚：用户上翻看历史时不许被拉回
		} catch(e){
			console.log('agent welcome load failed:', e);
		}
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
	// 「停」类快捷指令识别（2026-09-08）：整句精确匹配，绝不子串匹配——
	// 「别停下来继续说」「为什么任务已取消」含停止词但语义是继续/提问，
	// 子串匹配会误杀（教训见技能「用户意图识别」节）。
	is_stop_command(text){
		var t = String(text || '').trim().replace(/[。.!！?？~～\s]+$/,'').toLowerCase();
		return ['停','停止','停下','停一下','取消','终止','stop','cancel','abort'].indexOf(t) >= 0;
	}
	// 中断所有在飞的流式应答：abort fetch（服务端连接断开 → 生成器在下个
	// yield 点收到 GeneratorExit 终止，不再调 LLM/工具）+ 冻结输出气泡
	// （不再渲染后续 chunk，停在输入「停」之前的状态）+ 追加「已停止」标记。
	// 返回中断的流数量（0 = 当前没有在跑的应答）。
	stop_running(){
		var running = this._running_streams || [];
		var n = running.length;
		running.forEach(function(it){
			try { it.controller.abort(); } catch(e){}
			if (it.mout && it.mout.show_stopped) it.mout.show_stopped();
		});
		this._running_streams = [];
		return n;
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
		// 切产线 = 换了一个新会话区：开场提示按新产线重拉（旧的已随 clear_widgets 清掉）
		this.load_welcome();
	}
	async user_inputed(e){
		var params = e.params;
		// 「停」快捷指令（2026-09-08 修复：用户输入停 → 会话要停在输入停之前，
		// 而不是回一句"已停止"、旧流还在继续输出）：
		// 有在飞的流 → 前端直接中断（abort fetch + 冻结旧输出气泡 + 标记已停止），
		// 消息不上屏、不发请求（零 LLM 费用）；没有在跑的流 → 按普通消息走后端。
		if (this.is_stop_command(params.prompt) && (this._running_streams||[]).length > 0){
			this.stop_running();
			this.scroll_to_bottom();
			return;
		}
		this.show_input(params);
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
		// 每条流一个 AbortController：注册到 _running_streams，「停」指令统一中断
		var controller = window.AbortController ? new AbortController() : null;
		var self = this;
		var slot = null;
		if (controller){
			slot = {controller: controller, mout: mout};
			if (!this._running_streams) this._running_streams = [];
			this._running_streams.push(slot);
		}
		var _unregister = function(){
			if (slot && self._running_streams){
				self._running_streams = self._running_streams.filter(function(s){ return s !== slot; });
			}
		};
		try {
			var resp = await hr.post(this.opts.url, {params:send_params,
					signal: controller ? controller.signal : null});
			if (! resp) {
				mout.run_stopped();
				return;
			}
			// 用户新输入已真正发起（进入流式）：停掉本会话历史应答里的实时面板（历史状态定格、不再轮询）
			// 传本 AgentIO 的 DOM 作作用域：只停本会话面板，不误停同页其它会话 tab 正在看的面板
			if (bricks.RefreshWidget && bricks.RefreshWidget.stop_live_panels) bricks.RefreshWidget.stop_live_panels(this.dom_element);
			await hr.handle_chunk(resp, this.chunk_response.bind(this, mout));
			this.chunk_ended();
		} catch(err){
			// abort 时 fetch 本身 reject AbortError（headers 未回阶段）；
			// 读流阶段的 AbortError 已在 handle_chunk 内静默。
			// stop_running 已冻结气泡+标记，这里只需静默收尾，不弹错误。
			if (!(err && (err.name === 'AbortError' || err.code === 20))) {
				console.log('agent stream error:', err);
				mout.run_stopped();
			}
		} finally {
			_unregister();
		}
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
