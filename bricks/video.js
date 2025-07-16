var bricks = window.bricks || {};
/*
we use videojs for video play
https://videojs.com
event: play_end		video play finished
	play_failed		video play failed
	play_ok			video start to play

*/
bricks.VideoBody = class extends bricks.Layout {
	constructor(opts){
		super(opts||{});
		this.set_css('video-js');
		this.set_css('vjs-big-play-centered');
		this.set_css('vjs-fluid');
		this.cur_url = opts.url;
		this.cur_vtype = opts.type;
	}
	create(){
		var e;
		e = document.createElement('video');
		this.dom_element = e;
		e.controls = true;
	}
}
bricks.Video = class extends bricks.Layout {
	/*
	{
		title:
		vtype:
		url:
		fullscreen:
		autoplay:
	}
	*/
	constructor(options){
		super(options);
		// this.video_body = new bricks.VideoBody(options);
		this.set_css('video-js');
		this.set_css('vjs-big-play-centered');
		this.set_css('vjs-fluid');
		this.set_style('width', '100%');
		this.set_style('height', '100%');
		this.set_style('object-fit', 'contain');
		this.cur_url = opts.url;
		this.cur_vtype = opts.type;
		schedule_once(this.create_player.bind(this), 0.1);
	}
	create(){
		var e;
		e = document.createElement('video');
		this.dom_element = e;
		e.controls = true;
	}
		
	destroy_resource(params, event){
		var w = event.target.bricks_widget;
		if (! w.parent){
			bricks.debug('destroy resource .......');
			this.player.pause();
			this.player.dispose();
			this.player = null;
		}
	}
	disable_captions(){
		this.player.nativeTextTracks = false;
		var tt =  this.player.textTracks()
		bricks.debug('textTracks=', tt);
		if (tt){
			for(var i=0;i<tt.length;i++){
				tt[i].mode = 'disabled';
			}
		}
	}
	findVideoButtonByClass(cls){
		var e = this.dom_element;
		return e.querySelector('.' + cls);
	}

	auto_play(){
		return;
		schedule_once(this._auto_play.bind(this), 0.5);
	}
	_auto_play(){
		this.set_url(this.opts.url);
		return;
		var play_btn = this.findVideoButtonByClass('vjs-big-play-button');
		if (!play_btn){
			console.log('vjs-big-play-button not found');
			return;
		}
		if (play_btn.style.display == 'none'){
			console.log('playing .............already');
			return;
		}
		console.log('video ready, auto_playing ....');
        var clickevent = new MouseEvent('click', {
          'bubbles': true,      // 事件是否冒泡
          'cancelable': true    // 事件是否可取消
        });
        play_btn.dispatchEvent(clickevent);
		/*
		if (this.autounmute && this.player.muted){
			schedule_once(this.dispatch_mute.bind(this), 1);
		}
		*/
	}

	play(){
		console.log('Video:play() called....');
		this.player.play();
		// this.player.muted(false);
	}
	unmuted(){
		this.player.muted(false);
	}
	set_fullscreen(){
		if (this.fullscreen){
			if (!this.player.isFullscreen()) {
				this.player.requestFullscreen();
			}
		} else {
			if (this.player.isFullscreen()) {
				this.player.exitFullscreen();
			}
		}
	}
	dispatch_mute(){
		var mute_btn = this.findVideoButtonByClass("vjs-mute-control.vjs-control.vjs-button");
		if (!mute_btn){
			var isMute = this.player.muted();
			if (isMuted){
				this.player.muted(False);
			}
			bricks.test_element = this;
			console.log(this, 'there is not mute button found, isMuted=', isMuted);
			return;
		}
		var clickevent = new MouseEvent('click', {
		  'bubbles': true,      // 事件是否冒泡
		  'cancelable': true    // 事件是否可取消
		});
		var isMuted = this.player.muted();
		if (isMuted){
			mute_btn.dispatchEvent(clickevent);
		}
	}

	create_player(){
		if(this.url){
			// this.player = videojs(this.video_body.dom_element, {
			this.player = videojs(this.dom_element, {
				controls:true,
				autoplay:this.autoplay,
				muted:true,
				crossorigin:"anonymous",
				nativeTextTracks:false,
				textTrackSettings: false
			});
			this.player.on('error',this.report_error.bind(this));
			this.player.on('play', this.report_playok.bind(this));
			this.player.on('ended', this.report_ended.bind(this));
			this.set_url(this.opts.url);
			this.player.ready(this.set_fullscreen.bind(this));
			if (this.autoplay){
				this.auto_play();
			}
		}
	}
	report_ended(){
		if (this.play_status != 'playok'){
			returnl
		}
		this.play_status = 'playend';
		this.dispatch('play_end',{src:this.cur_url,type:this.cur_vtype});
	}
	report_playok(){
		if (this.play_status != ''){
			return;
		}
		this.play_status = 'playok';
		console.log(this.cur_url, 'play ok');
		if (this.autounmute && this.player.muted()){
			schedule_once(this.dispatch_mute.bind(this), 2.5);
			console.log('mute btn clicked');
		} else {
			console.log(this.autounmute, 'player.muted=', this.player.muted);
		}
		this.dispatch('play_ok', {src:this.cur_url,type:this.cur_vtype});
	}
	report_error(){
		if (this.play_status != ''){
			return;
		}
		this.play_status = 'playfailed';
		console.log(this.cur_url, 'play failed', this.err_cnt, 'times');
		this.dispatch('play_failed', {'src':this.cur_url, type:this.cur_vtype});
	}
	_set_source(){
		if (this.player){
			this.player.src({
				src:this.cur_url,
				type:this.cur_vtype
			});
			this.play_status = '';
		}
    }
	set_source(url, vtype){
		var t = url.toLowerCase();
		if (t.endsWith('.m3u8')){
			vtype = 'application/x-mpegURL';
		} else if (t.endsWith('.mp4')){
			vtype = 'video/mp4';
		} else if (t.endsWith('.avi')){
			vtype = 'video/avi';
		} else if (t.endsWith('.webm')){
			vtype = 'video/webm';
		} else {
			vtype = 'application/x-mpegURL';
		}
		if(this.player){
			this.cur_url = url;
			this.cur_vtype = vtype;
			this._set_source();
			this.play();
		}
	}
	set_url(url){
		this.set_source(url);
	}
}

bricks.Iptv = class extends bricks.VBox {
	/*
	{
		iptv_data_url:
		playok_url:
		playfailed_url:
	}
	*/
	constructor(opts){
		super(opts);
		schedule_once(this.build_subwidgets.bind(this), 0.1);
	}
	async build_subwidgets(){
		console.log('build_subwidgets called');
		var jc = new bricks.HttpJson();
		this.deviceid = bricks.deviceid('iptv')
		this.user_data = await jc.httpcall(this.iptv_data_url, {
			params:{
				deviceid:this.deviceid
			}, 
			method:'GET'
		});
		console.log('this.user_data =', this.user_data);
		this.video = new bricks.Video({
			autoplay:true,
			autounmute:this.autounmute,
			url:this.user_data.url
		});
		this.title_w = new bricks.Text({text:this.user_data.tv_name, wrap:false});
		this.add_widget(this.title_w);
		this.add_widget(this.video);
		this.video.bind('play_ok', this.report_play_ok.bind(this));
		this.video.bind('play_failed', this.report_play_failed.bind(this));
	}
	async report_play_ok(){
		console.log(this.user_data, 'channel playing ...', this.playok_url);
		if (this.playok_url){
			var ht = new bricks.HttpText();
			var resp = ht.httpcall(this.playok_url,{
				params:{
					deviceid:this.deviceid,
					channelid:this.user_data.id
				},
				method:"GET"
			});
			if (resp != 'Error'){
				console.log('report playok ok');
			} else {
				console.log('report playok failed');
			}
		} else {
			console.log('this.playok_url not defined', this.playok_url);
		}
	}
	async report_play_failed(){
		console.log(this.user_data, 'channel play failed ...');
		if (this.playfailed_url){
			var ht = new bricks.HttpText();
			var resp = ht.httpcall(this.playfailed_url,{
				params:{
					deviceid:this.deviceid,
					channelid:this.user_data.id
				},
				method:"GET"
			});
			if (resp != 'Error'){
				console.log('report playfailed ok');
			} else {
				console.log('report playfailed failed');
			}
		} else {
			console.log('this.playfailed_url not defined', this.playfailed_url);
		}
	}
	setValue(data){
		this.user_data = data;
		this.title_w.set_text(data.tv_name);
		this.video.set_url(data.url);
	}

	
}
bricks.Factory.register('Video', bricks.Video);
bricks.Factory.register('Iptv', bricks.Iptv);
