var bricks = window.bricks || {};
bricks.ASRClient = class extends bricks.VBox {
	/*
	options:
	{
		start_icon:record.png, 
		stop_icon:stop.png
		ws_url:
		icon_options
		ws_params:
	}
	event:
	start: start recording, no params
	stop:	stop recording, no params
	transtext: recognised text, params={
		"content":
		"speaker":
		"start":
		"end":
	}
	*/
	constructor(opts){
		super(opts);
		var icon_options = this.icon_options || {};
		icon_options.url = this.start_icon || bricks_resource('imgs/start_recording.svg');
		this.icon = new bricks.Svg(icon_options);
		this.status = 'stop';
		this.icon.bind('click', this.toggle_button.bind(this));
		this.add_widget(this.icon);
		var sessdata = bricks.app.get_session();
		this.socket = new WebSocket(this.ws_url, sessdata);
		this.socket.onmessage = this.response_data.bind(this);
		this.bind('transtext', this.response_log.bind(this));
	}
	response_log(event){
		console.log('response data=', event.params);
	}
	toggle_button(){
		if (this.status == 'stop'){
			this.icon.set_url(this.start_icon||bricks_resource('imgs/stop_recording.svg'));
			this.status = 'start';
			this.start_recording();
		} else {
			this.icon.set_url(this.stop_icon||bricks_resource('imgs/start_recording.png'));
			this.status = 'stop';
			this.stop_recording();
		}
	}
	async start_recording() {
		this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		this.mediaRecorder = new MediaRecorder(this.stream);
		this.mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) {
				// 将音频数据通过 WebSocket 发送到服务器
				blobToBase64(event.data).then((b64str) => {
					var d = objcopy(this.ws_params);
					d.type = 'audiobuffer';
					d.data = b64str;
					this.socket.send(JSON.stringify(d));
				}).catch((error) => {
					console.log('Error', error);
				});
			}
		}
		this.mediaRecorder.start(1000); // 每 1 秒发送一次数据
	}
	stop_recording(){
		this.mediaRecorder.stop();
	}
	response_data(event){
		var d = JSON.parse(event.data);
		this.dispatch('transtext', d);
	}
}

bricks.Factory.register('ASRClient', bricks.ASRClient);
