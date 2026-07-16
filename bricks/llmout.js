var bricks = window.bricks || {};

/*
bricks.UserInputView
将所有输入转换成一个Markdown，音视频媒体数据独立显示
*/
bricks.UserInputView = class extends bricks.VBox {
	constructor(opts){
		super(opts);
		this.v_ws = [];
		this.a_ws = [];
		this.show_input(this.data);
	}
	show_input(data){
		var mdtext = '';
		this.v_ws = [];
		this.a_ws = [];
		this.input_fields.forEach(f =>{
			var vals = data[f.name];
			if (!vals) return;
			if (!Array.isArray(vals)) vals = [vals];
			vals.forEach(val => {
				if (f.name.startsWith('video')){
					var url = URL.createObjectURL(val);
					this.v_ws.push(new bricks.VideoPlayer({
						url:url,
						autoplay:false,
						width: '100%'
					}));
				} else if (f.name.startsWith('audio')){
					var url = URL.createObjectURL(val);
					this.a_ws.push(new bricks.AudioPlayer({
						url:url,
						autoplay:false,
						width: '100%'
					}));
				} else if (f.name.startsWith('image')){
					var url = URL.createObjectURL(val);
					mdtext += `
* ${f.label || f.name}
![${f.label || f.name}](${url})
`;
				} else {
					mdtext += `
* ${f.label || f.name}

${val}

`;
				}
			});
		});
		this.clear_widgets();
		var w = new bricks.MdWidget({
			width: '100%',
			mdtext:mdtext
		});
		console.log('mdtext=', mdtext);
		this.add_widget(w);
		this.v_ws.forEach(v => this.add_widget(v));
		this.a_ws.forEach(a => this.add_widget(a));
	}
}
/*
根据大模型返回数据自动构造显示内容
大模型返回json格式数据，下面的属性可选
reasoning_content:推理文本
content：应答文本
error: 错误信息
audio：语音url或base64语音
video：视频url或base64视频
image：如果是个数组，则多个图片url
*/

bricks.LlmOut = class extends bricks.VBox {
	constructor(opts){
		super(opts);
		this.rc_w = null;
		this.c_w = null;
		this.s_w = null;  // 状态
		this.glbs = [];
		this.videos = [];
		this.audios = []
		this.images = [];
		this.reasoning_content = '';
		this.content = '';
		this.error = '';
	}
	
	render_video(v){
		var w = new bricks.VideoPlayer({
			width: '100%',
			url: v,
			autoplay: true
		});
		this.add_widget(w);
	}
	render_glb(glb){
		var w = new bricks.GlbViewer({
			url:glb,
			width: '100%'
		});
		this.add_widget(w);
	}
	render_audio(a){
		var url = a;
		if (! url.startsWith('http')){
			if (! url.startsWith('data:audio/')){
				url = 'data:audio/wav;base64,' + url;
			}
		}
		var w = new bricks.AudioPlayer({
				width: '100%',
				autoplay: true,
				url: url,
				cheight:2
			});
		this.add_widget(w);
	}
	render_image(i){
		var w = new bricks.Image({
			width: '100%',
			url: i
		});
		this.add_widget(w);
	}
	update(data){
		if (data.status){
			this.s_w = new bricks.Text({
				width: '100%',
				height: 'auto',
				text: JSON.stringify(data)
			});
		}
		if (data.audio){
			if (Array.isArray(data.audio)){
				this.audios = this.audios.concat(data.audio);
			} else {
				this.audios.push(data.audio);
			}
		}
		if (data.glb){
			if (Array.isArray(data.glb)){
				this.glbs = this.glbs.concat(data.glb);
			} else {
				this.glbs.push(data.glb);
			}
		}
		if (data.video){
			if (Array.isArray(data.video)){
				this.videos = this.videos.concat(data.video);
			} else {
				this.videos.push(data.video);
			}
		}
		if (data.image){
			if (Array.isArray(data.image)){
				this.images = this.images.concat(data.image);
			} else {
				this.images.push(data.image);
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
		this.videos.forEach(v => {
			this.render_video(v);
		});
		this.glbs.forEach(glb => {
			this.render_glb(glb);
		});
		this.audios.forEach(a => {	
			this.render_audio(a);
		});
		this.images.forEach(i => {
			this.render_image(i);
		});
		if(this.s_w){
			this.add_widget(this.s_w);
		}
	}
}
bricks.Factory.register('LlmOut', bricks.LlmOut);
