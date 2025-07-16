var bricks = window.bricks || {}

bricks.escapeSpecialChars = function(s){
  return s
    .replace(/\\/g, '\\\\')  // escape backslashes
    .replace(/"/g, '\\"')   // escape double quotes
    // .replace(/'/g, '\\\'')   // escape single quotes
    .replace(/\n/g, '\\n')   // escape newlines
    .replace(/\r/g, '\\r')   // escape carriage returns
    .replace(/\t/g, '\\t')   // escape tabs
    .replace(/\f/g, '\\f')   // escape form feeds
    .replace(/\v/g, '\\v')   // escape vertical tabs
    .replace(/\0/g, '\\0');  // escape null bytes
}

bricks.UserMsgBox = class extends bricks.HBox {
	/*
	{
		"icon",
		"prompt",
		"msg_css"
	}
	*/
	constructor(opts){
		super(opts);
		var img = new bricks.Svg({rate:2,url:this.icon||bricks_resource('imgs/chat-user.svg')});
		var w = new bricks.MdWidget({mdtext:this.prompt});
		w.set_css('filler');
		w.set_css(this.msg_css||'user_msg');
		this.add_widget(new bricks.BlankIcon({rate:2, flexShrink:0}));
		this.add_widget(w);
		this.add_widget(img);
	}
}

bricks.LlmMsgBox = class extends bricks.HBox {
	/*
	{
		"model",
		"mapi",
		"url",
		"icon",
		"msg_css"
		"response_mode"
		"user_msg":{
		}
		
		"llm_msg":{
		}
	}
	*/
	constructor(opts){
		super(opts);
		var img = new bricks.Svg({rate:2,url:this.icon||bricks_resource('imgs/user.png')});
		this.w = new bricks.MdWidget({mdtext:' '});
		this.w.set_css('filler');
		this.run = new bricks.BaseRunning({target:this});
		this.w.set_css(this.msg_css||'llm_msg');
		this.add_widget(img);
		this.add_widget(this.run)
		this.add_widget(this.w);
		this.add_widget(new bricks.BlankIcon({rate:2, flexShrink:0}));
		this.messages = [];
	}
	responsed(){
		this.run.stop_timepass();
		this.remove_widget(this.run);
		this.w.md_content = '';
	}
	user_msg_format(){
		return this.user_msg||{role:'user',content:"${prompt}"}
	}
	llm_msg_format(){
		return this.llm_msg || {role:'assistant', content:"${content}"}
	}
	chunk_response(l){
		var d = JSON.parse(l);
		if (! d.content || d.content == ''){
			return;
		}
		var txt = this.w.md_content + d.content;
		this.w.set_content(txt);
		this.bind('updated');
	}
	chunk_ended(){
		var msg = this.llm_msg_format();
		var txt = this.w.md_content;
		txt = bricks.escapeSpecialChars(txt);
		var lmsg = bricks.apply_data(msg, {content:txt});
		this.messages.push(lmsg);
	}
	async set_prompt(prompt){
		var msg = this.user_msg_format();
		var umsg = bricks.apply_data(msg,{prompt:prompt});
		this.messages.push(umsg);
		var d = {
			messages:this.messages,
			mapi:this.mapi,
			model:this.model,
		}
		// console.log('messages=', this.messages, 'msg=', msg, 'umsg=', umsg);
		if (this.response_mode == 'stream') {
			var hr = new bricks.HttpResponseStream();
			var resp = await hr.post(this.url, {data:d});
			this.responsed();
			await hr.handle_chunk(resp, this.chunk_response.bind(this));
			this.chunk_ended();
		} else {
			var hj = new bricks.HttpJson()
			var resp = await hj.post(this.url, {params:d});
			if (this.response_mode == 'sync'){
				this.responsed();
				this.w.set_content(resp.content);
				var msg = this.llm_msg_format();
				var lmsg = bricks.apply_data(msg, resp);
				this.messages.push(lmsg)
			} else {
				;
			}
		}
	}
}

bricks.LlmDialog = class extends bricks.VBox {
	/*
	{
		"models":[
			{
				"model":
				"mapi":
				"icon":
				"url"
				"css"
				"user_msg":{
				}
				
				"llm_msg":{
				}
			}
		]
		"response_mode":"stream", "async","async"
		"user_msg_css"
		"user_icon",
		"title_ccs"
	}
	method:
	set_prompt(prompt)
	event:
	llm_answer event.params = assistant answer content
	*/
	constructor(opts){
		opts.height = opts.height || '100%';
		super(opts);
		this.title_w = new bricks.HBox({cheight:2});
		this.title_w.set_css(this.title_ccs||'llm_title');
		this.add_widget(this.title_w);
		this.model_info_ws = {};
		this.show_models_info();
		var filler = new bricks.Filler({});
		this.body = new bricks.VScrollPanel({height:'100%'});
		filler.add_widget(this.body);
		this.add_widget(filler);
	}
	show_models_info(){
		for(var i=0;i<this.models.length;i++){
			this.show_model_info(this.models[i]);
		}
	}
	show_model_info(model){
		var w = new bricks.HBox({margin:'5px'});
		w.add_widget(new bricks.Svg({url:model.icon||bricks_resource('imgs/llm.svg'), rate:2}));
		w.add_widget(new bricks.Text({text:model.model}));
		this.title_w.add_widget(w);
		this.model_info_ws[model.model] = w;
	}
	add_model(model){
		this.models.push(model);
		this.show_model_info(model);
	}
	delete_model(model){
		for(var i=0;i<this.models.length;i++){
			if (this.models[i].model == model.model){
				this.models.splice(i,1);
				break;
			}
		}
		delete this.model_info_ws[model.model];
	}
	async set_prompt(prompt){
		prompt = bricks.escapeSpecialChars(prompt);
		var box = new bricks.UserMsgBox({
				width:'100%',
				icon:this.user_icon,
				prompt:prompt,
				msg_css:this.user_msg_css||'user_msg'
		});
		this.body.add_widget(box);
		this.body.dom_element.scrollTop = this.body.dom_element.scrollHeight;
		await this.llm_request(prompt);
	}
	async llm_request(prompt){
		for (var i=0;i<this.models.length;i++){
			var model = this.models[i];
			var box = new bricks.LlmMsgBox({
				width:'100%',
				response_mode:this.response_mode || 'stream',
				model:model.model,
				mapi:model.mapi,
				icon:model.icon,
				msg_css:model.css,
				url:model.url,
				user_msg:model.user_msg,
				llm_msg:model.llm_msg
			});
			this.body.add_widget(box);
			schedule_once(box.set_prompt.bind(box, prompt), 0.1);
		}
	}
}

bricks.Factory.register('LlmDialog', bricks.LlmDialog);

