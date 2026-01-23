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
		this.task = schedule_interval(this.open_recorder.bind(this), 0.1);
	}
	tick_task(){
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
			var blob = new Blob(this.recordedChunks, 
							{ type: this.mimetype }); 
			// 1. 在本地播放
			blob = await this.blob_convert(blob);
			const url = URL.createObjectURL(blob);
			// 2. 转成 File 对象
			var filename;
			if (this.mimetype == 'video/mp4'){
				filename = 'recorded_video.mp4';
			} else {
				filename = 'recorded_audio.wav'
			}
			const file = new File([blob], 
						filename, 
						{ type: this.mimetype });
			var data = {
				url: url,
				file: file
			}
			this.dispatch('record_end', data);
			console.log('"record_end" fired', file);
		};

		this.start_time = Date.now();
		this.task = schedule_interval(this.tick_task.bind(this), this.task_period);
		this.mediaRecorder.start();
		this.dispatch('record_started')
		console.log("Recording started...");
	}
	async blob_convert(blob){
		return blob;
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
			clearInterval(this.task);
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
		this.mimetype = 'audio/webm';
		this.stream = await navigator.mediaDevices.getUserMedia(options);
		this.toggle_record.disabled(false);
		this.preview.disabled(true);
	}
	async blob_convert(webmBlob){
		// 2. 解码 WebM → PCM
		const arrayBuffer = await webmBlob.arrayBuffer();
		const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		const decodedData = await audioCtx.decodeAudioData(arrayBuffer);

		// 3. 转换为 WAV Blob
		const wavBlob = this.encodeWAV(decodedData);
		return wavBlob;
	}
	encodeWAV(audioBuffer) {
		const numChannels = audioBuffer.numberOfChannels;
		const sampleRate = audioBuffer.sampleRate;
		const format = 1; // PCM
		const bitDepth = 16;

		// interleave channels
		let result;
		if (numChannels === 2) {
			result = this.interleave(audioBuffer.getChannelData(0), audioBuffer.getChannelData(1));
		} else {
			result = audioBuffer.getChannelData(0);
		}

		// float → 16-bit PCM
		const buffer = new ArrayBuffer(44 + result.length * 2);
		const view = new DataView(buffer);

		/* RIFF header */
		this.writeString(view, 0, "RIFF");
		view.setUint32(4, 36 + result.length * 2, true);
		this.writeString(view, 8, "WAVE");
		this.writeString(view, 12, "fmt ");
		view.setUint32(16, 16, true);
		view.setUint16(20, format, true);
		view.setUint16(22, numChannels, true);
		view.setUint32(24, sampleRate, true);
		view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
		view.setUint16(32, numChannels * (bitDepth / 8), true);
		view.setUint16(34, bitDepth, true);

		this.writeString(view, 36, "data");
		view.setUint32(40, result.length * 2, true);

		// PCM samples
		let offset = 44;
		for (let i = 0; i < result.length; i++, offset += 2) {
			const s = Math.max(-1, Math.min(1, result[i]));
			view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
		}
		return new Blob([view], { type: "audio/wav" });
	}

	interleave(left, right) {
		const length = left.length + right.length;
		const result = new Float32Array(length);

		let inputIndex = 0;
		for (let i = 0; i < length;) {
			result[i++] = left[inputIndex];
			result[i++] = right[inputIndex];
			inputIndex++;
		}
		return result;
	}

	writeString(view, offset, string) {
		for (let i = 0; i < string.length; i++) {
			view.setUint8(offset + i, string.charCodeAt(i));
		}
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
		this.pic_task = schedule_interval(this.show_picture.bind(this), this.task_period);
	}
	async show_picture(){
		if (this.task_period == 0){
			return;
		}
		var blob = await this.imageCapture.takePhoto();
		this.dataurl = URL.createObjectURL(blob);
		this.imgfile = new File([blob],
                        'image.jpg',
                        { type: 'image/jpeg' });
		this.imgw.set_url(this.dataurl);
	}
	close_recorder(){
		super.close_recorder();
		if (this.pic_task){
			clearInterval(this.pic_task);
			this.pic_task = null;
		}
	}
}
bricks.SysCamera= class extends bricks.SysVideoRecorder {
	switch_record(){
		console.log('shot it ............');
		event.stopPropagation();
		if (this.task){
			clearInterval(this.task);
			this.task = null;
		}
		this.task_period = 0;
		this.task = null;
		this.dispatch('shot', {url: this.dataurl, file:this.imgfile});
		this.close_recorder();
	}
}
bricks.Factory.register('SysCamera', bricks.SysCamera);
bricks.Factory.register('WidgetRecorder', bricks.WidgetRecorder);
bricks.Factory.register('SysAudioRecorder', bricks.SysAudioRecorder);
bricks.Factory.register('SysVideoRecorder', bricks.SysVideoRecorder);
