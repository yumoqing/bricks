var bricks = window.bricks || {};

/*
根据大模型返回数据自动构造显示内容
大模型返回json格式数据，下面的属性可选
reasoning_content:推理文本
content：应答文本
audio：语音url或base64语音
video：视频url或base64视频
image：如果是个数组，则多个图片url
*/

bricks.LlmOut = class extends bricks.VBox {
	constructor(opts){
		super(opts);
		this.rc_w = null;
		this.c_w = null;
		this.v_w = null;
		this.i_w = null;
		this.a_w = null;
		this.images = [];
		this.reasoning_content = '';
		this.content = '';
	}
	
	update(data){
		if (data.audiao){
			if (!this.a_w) {
				this.a_w = new bricks.AudioPlay({
					width: '100%',
					autoplay: true,
					url: data.audio,
					cheight:2
				});
			} else {
				this.a_w.add_url(data.audio);
			}
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
		this.clear_widgets();
		if (this.reasoning_content.length) {
			var txt = bricks.escapeSpecialChars('<think>\n\n' + this.reasoning_content + '\n\n</think>');
			this.rc_w = new bricks.MdWidget({
				mdtext: txt,
				width: '100%'
			});
			this.add_widget(this.rc_w);
		}
		if (this.reasoning_content.length) {
			var txt = bricks.escapeSpecialChars(this.content);
			this.c_w = new bricks.MdWidget({
				mdtext: txt,
				width: '100%'
			});
			this.add_widget(this.c_w);
		}
		if (this.v_w) {
			this.add_widget(this.v_w);
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
bricks.Factory.register('LimOut', bricks.LlmOut');

