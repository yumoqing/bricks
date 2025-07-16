var bricks = window.bricks || {};

bricks.formatMs=function(ms,all){
	var ss=ms%1000;ms=(ms-ss)/1000;
	var s=ms%60;ms=(ms-s)/60;
	var m=ms%60;ms=(ms-m)/60;
	var h=ms;
	var t=(h?h+":":"")
		+(all||h+m?("0"+m).substr(-2)+":":"")
		+(all||h+m+s?("0"+s).substr(-2)+"″":"")
		+("00"+ss).substr(-3);
	return t;
};

bricks.AudioPlayer = class extends bricks.JsWidget {
	/*
	{
		url:
		autoplay:
	}
	*/

	constructor(options){
		super(options);
		this.url = options.url;
		this.audio = this._create('audio');
		this.audio.controls = true;
		if (this.opts.autoplay){
			this.audio.addEventListener('canplay', this.play.bind(this));
		}
		this.audio.addEventListener('ended', this.playended.bind(this));
		this.audio.style.width = "100%"
		this.dom_element.appendChild(this.audio);
		if ( this.url ){
			this.set_source(this.url);
		}
	}
	playended(e){
		this.dispatch('ended');
	}
	set_stream_urls(response){
		async function* dyn_urls(response) {
			const reader = response.body.getReader();
			var value;
			var done;
			while (true){
				done, value = await reader.read();
				if (value.done){
					console.log('done=', done, 'value=', value);
					break;
				}   
				let result = ''; 
				for (let i = 0; i < value.value.length; i++) {
					result += String.fromCharCode(value.value[i]);
				}   
				console.log('audio set url=', result);
				yield result;
			}   
		}
		this.url_generator = dyn_urls(response);
		this.srcList = [];
		this.notBegin = true;
		schedule_once(this.load_queue_url.bind(this), 0.1);
	}
	async load_queue_url(){
		while (true){
			var d = await this.url_generator.next();
			if (d.done){
				return;
			}
			this.srcList.push({played:false, url:d.value});
			if (this.srcList.length < 2	){
				await this.play_srclist();
				this.audio.addEventListener('ended', 
							this.play_srclist.bind(this));
			}
		}
	}
	async play_srclist(evnet){
		if (event && ! this.audio.ended){
			return;
		}
		for (var i=0;i<this.srcList.length;i++){
			if (!this.srcList[i].played){
				console.log('playit', i, this.srcList[i]);
				this.set_url(this.srcList[i].url);
				this.srcList[i].played = true;
				await this.play();
				return;
			}
		}
	}
	set_source(url){
		if (! this.source){
			this.source = this._create('source');
			this.source.src = url;
			this.audio.appendChild(this.source);
		}
		this.url = this.audio.src = url;
		console.log(this.audio.src,' new src seted');
	}
	set_source_from_response(resp){
	  // 将服务器返回的数据设置为音频源
	  this.audio.src = URL.createObjectURL(new Blob([response.body]));
	  // 播放音频
	  this.audio.play();
	}
	async play(){
		await this.audio.play();
	}
	async toggle_play(){
		if (this.audio.paused){
			await this.audio.play();
		} else {
			await this.audio.pause();
		}
	}
	set_url(url){
		this.set_source(url);
		this.audio.play();
	}
}


bricks.AudioRecorder = class extends bricks.HBox {
	/*
	{
		"upload_url":
		"icon_rate":
	}
	we need this module:
	https://gitee.com/xiangyuecn/Recorder
	events:
		record_started
		record_ended
	realtime record wave show need a another package
	we only use the wav file format
	*/
	constructor(opts){
		super(opts);
		this.set_css('clickable');
		this.start_icon = opts.start_icon || bricks_resource('imgs/start_recording.svg');
		this.stop_icon = opts.stop_icon || bricks_resource('imgs/stop_recording.svg');
		this.rec_btn = new bricks.Svg({
			url:this.start_icon, 
			rate:this.icon_rate 
		});
		// this.player = new bricks.AudioPlayer({url:"",width:'80px'});
		this.rec_time = new bricks.Text({
			text:" record time", 
			i18n:false,
			dynsize:true,
			wrap:false, 
			width:'120px'
		});
		this.upload_url = opts.upload_url;
		this.bind('click', this.rec_btn_pressed.bind(this))
		this.URL = window.URL||webkitURL;
		this.rec = null;
		this.wave = null;
		this.mic_opened = false;
		this.add_widget(this.rec_btn);
		this.add_widget(this.rec_time);
		this.recordData = null;
		if (this.upload_url){
			this.bind('record_ended', this.upload.bind(this));
		}
	}
	rec_btn_pressed(){
		if(this.rec_btn.url == this.start_icon){
			console.log('start recording .......');
			this.rec_btn.set_url(this.stop_icon);
			this.start_recording();
		} else {
			console.log('stop recording ....');
			this.rec_btn.set_url(this.start_icon);
			this.stop_recording();
		}
	}
	on_process(buffers,powerLevel,
						bufferDuration,bufferSampleRate,
						newBufferIdx,asyncEnd){
		//录音实时回调，大约1秒调用12次本回调
		// document.querySelector(".recpowerx").style.width=powerLevel+"%";
		//可视化图形绘制
		// wave.input(buffers[buffers.length-1],powerLevel,bufferSampleRate);
		this.rec_time.set_text(' ' + bricks.formatMs(bufferDuration,1));
		
	}
	recOpen(){
		this.rec=null;
		this.wave=null;
		var newRec = Recorder({
			type:"wav",sampleRate:16000,bitRate:16
			,onProcess:this.on_process.bind(this)
		});

		newRec.open(function(){//打开麦克风授权获得相关资源
			this.mic_opened = true;
			this.rec=newRec;
			this.rec.start();
			this.dispatch('record_started');
			//此处创建这些音频可视化图形绘制浏览器支持妥妥的
			//this.wave=Recorder.FrequencyHistogramView({elem:".recwave"});
		}.bind(this),function(msg,isUserNotAllow){//用户拒绝未授权或不支持
			bricks.debug('open recorder failed');
		});
	}
	recClose(){
		if(this.rec){
			this.rec.close();
			this.rec = null;
			this.mic_opened = false;
		}else{
			bricks.debug('close recorder error');
		};
	}
	start_recording(){
		this.recordData = null;
		if (this.mic_opened){
			this.rec.start();
			this.dispatch('record_started');
		}
		this.recOpen();
	}
	pause_recording(){
		if(this.rec&&Recorder.IsOpen()){
			this.rec.pause();
		}else{
			bricks.debug("gCAR::未打开录音");
		};
	}
	resume_recording(){
		if(this.rec&&Recorder.IsOpen()){
			this.rec.resume();
		}else{
			bricks.debug("Ob6S::未打开录音");
		};
	}
	stop_recording(){
		if(!(this.rec&&Recorder.IsOpen())){
			bricks.debug("5JuL::未打开录音");
			return;
		};
		this.rec.stop(function(blob,duration){
			var localURL = this.URL.createObjectURL(blob);
			var d = {
				data:blob,
				url:localURL,
				duration:duration
			}
			this.recordData = d;
			this.dispatch('record_ended', d);

		}.bind(this),function(msg){
			bricks.debug("kGZO::录音失败:");
		});
		this.recClose();
	}
	async upload(){
		var running = new bricks.Running({target:this});
		if(!this.recordData){
			bricks.debug("DUTn::请先录音，然后停止后再上传");
			return;
		};
		if(!this.upload_url){
			return;
		}
		var blob=this.recordData.data;
		bricks.debug('blob=', blob, this.recordData);
		var form=new FormData();
		form.append("audiofile",blob,"recorder.wav");
		var jpost = bricks.jpost
		var ret = await jpost(this.upload_url,{
			params:form
		});
		bricks.debug('ret=', ret);
		this.dispatch('uploaded', ret)
		running.dismiss();
	}
	download(){
		if(!this.recordData){
			bricks.debug('recorder not opened');
			return;
		};
		var fileName="recorder-"+Date.now()+".wav";
		var downA=document.createElement("A");
		downA.innerHTML="下载"+fileName;
		downA.href=this.recordData.url;
		downA.download=fileName;
		// document.querySelector("."+cls).appendChild(downA);
		if(bricks.is_mobile()){
			bricks.debug('mobile device');
		}
		downA.click();
		//不用了时需要revokeObjectURL，否则霸占内存
		(window.URL||webkitURL).revokeObjectURL(downA.href);
	}
}

bricks.TextedAudioPlayer = class extends bricks.VBox {
	constructor(opts){
		super(opts);
		this.audio = new bricks.AudioPlayer({
			height:'60px'
		});
		this.audio.bind('ended', this.playnext.bind(this));
		var filler, panel;
		filler  = new bricks.Filler({});
		this.add_widget(this.audio);
		this.add_widget(filler);
		panel = new bricks.VScrollPanel({
			height: '100%'
		});
		filler.add_widget(panel);
		this.textw = new bricks.Text({
			text: ' ',
			wrap: true
		});
		panel.add_widget(this.textw);
		this.streaming_buffer = [];
		this.wait_play = true;
	}
	async playnext(){
		var json = this.streaming_buffer.shift();
		console.log('======', json);
		if (json && ! json.done){
			var url = base64_to_url(json.audio);
			this.audio.set_url(url);
			this.wait_play = false;
			this.textw.set_text(json.text);
			await this.audio.play();
		} else {
			this.textw.set_text('');
			this.audio.set_url(null);
			this.wait_play = true;
		}
	}
	async set_stream_urls(response){
		this.wait_play = true;
		await streamResponseJson(response, this.load_stream_data.bind(this));
	}
	async load_stream_data(json){
		console.log('***', json);
		this.streaming_buffer.push(json);
		if (this.wait_play) {
			await this.playnext();
		}
	}
}
bricks.Factory.register('AudioPlayer', bricks.AudioPlayer);
bricks.Factory.register('AudioRecorder', bricks.AudioRecorder);
bricks.Factory.register('TextedAudioPlayer', bricks.TextedAudioPlayer);


