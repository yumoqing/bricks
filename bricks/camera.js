var bricks = window.bricks || {}
bricks.Camera = class extends bricks.Popup {
	/*
	{
		fps:60
	}
	*/
	constructor(opts){
		opts.fps = opts.fps || 60;
		opts.auto_dismiss = false;
		super(opts);
		this.recordedChunks = [];
		this.mediaRecorder = null;
		this.stream = null;
		this.video = document.createElement('video');
		var filler = new bricks.Filler({});
		var hbox = new bricks.HBox({
				cheight:3
		});
		this.cur_camera_id = 0;
		this.add_widget(filler);
		this.add_widget(hbox);
		var shot_btn = new bricks.Svg({
			url:bricks_resource('imgs/camera.svg'),
			margin: '10px',
			tip:'Take a picture',
			rate:2.5
		});
		var switch_btn = new bricks.Svg({
			url:bricks_resource('imgs/switch-camera.svg'),
			tip:'switch camera',
			margin: '10px',
			rate:1.5
		});
		var del_btn = new bricks.Svg({
			url:bricks_resource('imgs/delete.Svg'),
			tip:'canel it',
			margin: '10px',
			rate:1.5
		})
		del_btn.bind('click', this.dismiss.bind(this));
		shot_btn.bind('click', this.take_picture.bind(this));
		switch_btn.bind('click', this.switch_camera.bind(this, switch_btn));
		this.imgw = new bricks.Image({
			width:'100%'
		});
		hbox.add_widget(switch_btn);
		hbox.add_widget(shot_btn);
		hbox.add_widget(new bricks.Filler({}));
		hbox.add_widget(del_btn);
		filler.add_widget(this.imgw);
		this.task_period = 1 / this.fps;
    	schedule_once(this.startCamera.bind(this), 0.1);
	}
	async switch_camera(btn, event){
		if (bricks.app.video_devices.length < 2){
			btn.disabled(true);
			return;
		}
		var vpos = bricks.app.vpos;
		vpos += 1;
		if (vpos >= bricks.app.video_devices.length){
			vpos = 0;
		}
		this.startCamera(vpos);
	}
    async startCamera(vpos) {
		await bricks.app.start_camera(vpos);
		this.stream = bricks.app.video_stream;
		this.video.srcObject = this.stream;
		this.video.play();
		this.show_cnt = 1;
		this.task = schedule_once(this.show_picture.bind(this), this.task_period);
    }
	show_picture(){
		if (this.task_period == 0){
			return;
		}
		var canvas = document.createElement('canvas');
        canvas.height = this.video.videoHeight;
        canvas.width = this.video.videoWidth;
		const context = canvas.getContext('2d');
        context.drawImage(this.video, 0, 0);
		this.imgw.set_url(canvas.toDataURL('image/jpeg'));
		this.task = schedule_once(this.show_picture.bind(this), this.task_period);
		this.show_cnt += 1;
	}
	videorecorder_start(){
		if (!this.stream) {
		  throw new Error('Media stream is not initialized. Call init() first.');
		}
		this.recordedChunks = [];
		this.mediaRecorder = new MediaRecorder(this.stream);
		this.mediaRecorder.ondataavailable = (event) => {
		  if (event.data.size > 0) {
			this.recordedChunks.push(event.data);
		  }
		};
		this.mediaRecorder.start();
	}
	videorecorder_stop(){
		return new Promise((resolve) => {
			this.mediaRecorder.onstop = () => {
				const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
				const url = URL.createObjectURL(blob);
				resolve({ blob, url });
			};
			this.mediaRecorder.stop();
			this.mediaRecorder = null;
			this.recordedChunks = [];
		});
	}
	take_picture(event){
		event.stopPropagation();
		if (this.task){
			task.cancel();
			this.task = null;
		}
		this.task_period = 0;
		this.task = null;
		var d = this.imgw.base64();
		this.dispatch('shot', d);
	}
}

bricks.Factory.register('Camera', bricks.Camera);
