var bricks = window.bricks || {};

bricks.MediaRecorder = class extends bricks.Popup {
	constructor(opts){
		super(opts);
		opts.fps = opts.fps || 30;
		this.task_period = 1 / this.fps;
		this.task = null;
		this.stream = null;
		this.normal_stop = false;
		this.mimetype = 'audio/wav';
		this.preview = new bricks.VBox({width: '100%', css: 'filler'});
		this.controls = new bricks.HBox({width: '100%', cheight: 2.5});
		this.toggle_record = new bricks.Svg({
			url: bricks_resource('/imgs/start_recording.svg'),
			tip: 'start or stop record',
			rate: 2
		});
		this.timepass = new bricks.Text({text:'00:00:00', cheight: 10});
		var filler = new bricks.Filler({});
		var cancel = new bricks.Svg({
						url: bricks_resource('imgs/delete.svg'), 
						rate:2,
						tip: 'cancel recording'});
		cancel.bind('click', this.cancel_record.bind(this))
		this.add_widget(this.preview);
		this.add_widget(this.controls);
		this.controls.add_widget(this.toggle_record);
		this.controls.add_widget(this.timepass);
		this.controls.add_widget(filler);
		this.controls.add_widget(cancel);
		this.record_status = 'standby';
		this.toggle_record.bind('click', this.switch_record.bind(this));
		this.toggle_record.disabled(true);
		schedule_once(this.open_recorder.bind(this), 0.1);
	}
	tick_task(){
		this.task = schedule_once(this.tick_taask.bind(this), this.task_period);
		this.timepass.set_text(bricks.timeDiff(this.start_time));
	}
	async switch_record(){
		console.log('toggle_record called');
		if (this.record_status == 'standby'){
			this.start_recorder();
			this.toggle_record.set_url(bricks_resource('imgs/stop_recording.svg'));
			this.record_status = 'recording';
		} else {
			this.stop_recorder();
			this.toggle_record.set_url(bricks_resource('imgs/start_recording.svg'));
			this.record_status = 'standby';
		}
	}
	cancel_record(){
		this.close_recorder();
	}
	async open_recorder(){
		console.debug('open recorder for record');
	}
	async start_recorder(){
		this.normal_stop = false;
		this.mediaRecorder = new MediaRecorder(this.stream, 
								{mimeType: this.mimetype});
		this.recordedChunks = [];
		this.mediaRecorder.ondataavailable = (event) => {
			console.log('ondataavailabe() called', event.data.size);
			if (event.data.size > 0) {
				this.time_diff = bricks.timeDiff(this.start_time);
				this.recordedChunks.push(event.data);
				this.timepass.set_text(this.time_diff);
			}
		};
		this.mediaRecorder.onstop = async () => {
			console.log('onstop() called', this.normal_stop);
			if (!this.normal_stop) return;
			const blob = new Blob(this.recordedChunks, 
							{ type: this.mimetype }); 
			// 1. 在本地播放
			const url = URL.createObjectURL(blob);
			// 2. 转成 File 对象
			const file = new File([blob], 
						"recorded_video.webm", 
						{ type: this.mimetype });
			var data = {
				url: url,
				file: file
			}
			this.dispatch('record_end', data);
			console.log('"record_end" fired', file);
		};

		this.start_time = Date.now();
		this.task = schedule_once(this.tick_taask.bind(this), this.task_period);
		this.mediaRecorder.start();
		this.dispatch('record_started')
		console.log("Recording started...");
	}

	stop_recorder(){
		this.normal_stop = true;
		this.time_diff = bricks.timeDiff(this.start_time);
		this.timepass.set_text(this.time_diff);
		this.mediaRecorder.stop();
		this.mediaRecorder = null;
		this.close_recorder();
		console.log("Recording stopped.");
	}

	close_recorder(){
		if (this.task){
			this.task.cancel();
			this.task = null;
		}
		if (this.stream){
			if (this.mediaRecorder){
				this.mediaRecorder.stop();
				this.mediaRecorder = null;
			}
			this.stream.getTracks().forEach(track => track.stop());
			this.stream = null;
		}
		this.dismiss();
	}
}

bricks.WidgetRecorder = class extends bricks.MediaRecorder {
	async open_recorder(){
		var widget = bricks.getWidgetById(this.opts.widgetid,bricks.app);
		if (widget.dom_element.tagName == 'VIDEO'){
			this.mimetype = 'video/mp4';
		} else if (widget.dom_element.tagName == 'AUDIO'){
			this.mimetype = 'audio/wav';
		} else {
			throw 'Error, not a media element';
		}
		this.stream = source.captureStream();
		this.toggle_record.disabled(false);
	}
}
bricks.SysAudioRecorder = class extends bricks.MediaRecorder {
	async open_recorder(){
		var options = {}
		options.audio = true;
		this.mimetype = 'audio/wav';
		this.stream = await navigator.mediaDevices.getUserMedia(options);
		this.toggle_record.disabled(false);
		this.preview.disabled(true);
	}
}
bricks.SysVideoRecorder = class extends bricks.MediaRecorder {
	async open_recorder(){
		var options = {
			audio: true,
			video: true
		}
		this.mimetype = 'video/mp4';
		this.stream = await navigator.mediaDevices.getUserMedia(options);
		const track = this.stream.getVideoTracks()[0];
		const settings = track.getSettings();
		this.imageCapture = new ImageCapture(track);
		this.camera_height = settings.height;
		this.camera_width = settings.width;
		this.imgw = new bricks.Image({width: '100%'});
		this.preview.add_widget(this.imgw);
		this.toggle_record.disabled(false);
		this.pic_task = schedule_once(this.show_picture.bind(this), this.task_period);
	}
	async show_picture(){
		if (this.task_period == 0){
			return;
		}
		const blob = await this.imageCapture.takePhoto();
		this.dataurl = URL.createObjectURL(blob);
		this.imgw.set_url(this.dataurl);
		this.pic_task = schedule_once(this.show_picture.bind(this), 
									this.task_period);
	}
	close_recorder(){
		super.close_recorder();
		if (this.pic_task){
			this.pic_task.cancel();
			this.pic_task = null;
		}
	}
}
bricks.SysCamera= class extends bricks.SysVideoRecorder {
	switch_record(){
		console.log('shot it ............');
		event.stopPropagation();
		if (this.task){
			task.cancel();
			this.task = null;
		}
		this.task_period = 0;
		this.task = null;
		this.dispatch('shot', this.dataurl);
		this.close_recorder();
	}
}
bricks.Factory.register('SysCamera', bricks.SysCamera);
bricks.Factory.register('WidgetRecorder', bricks.WidgetRecorder);
bricks.Factory.register('SysAudioRecorder', bricks.SysAudioRecorder);
bricks.Factory.register('SysVideoRecorder', bricks.SysVideoRecorder);
