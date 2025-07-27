var bricks = window.bricks || {};
/*
we use videojs for video play
https://videojs.com
event: play_end		video play finished
	play_failed		video play failed
	play_ok			video start to play

*/
var bricks = window.bricks || {};

bricks.Video = class extends bricks.Layout {
    constructor(opts) {
        super(opts);
        this.opts = opts || {};
        this.set_csses('video-js', 'vjs-big-play-centered', 'vjs-fluid');
		this.set_style('object-fit', 'contain');
        this.set_style('width', '100%');
        this.set_style('height', '100%');
        this.cur_url = opts.url;
        this.cur_vtype = opts.type || this.guess_type(this.cur_url);
        schedule_once(this.create_player.bind(this), 0.1);
    }

    create() {
        let e = document.createElement('video');
        this.dom_element = e;
        e.controls = true;
    }

    create_player() {
        this.player = videojs(this.dom_element, {
            controls: true,
            autoplay: this.opts.autoplay || false,
			preload: "auto", 
            muted: true,
            crossorigin: 'anonymous',
            nativeTextTracks: false
        });

        this.player.on('play', () => this.dispatch('play_ok', { src: this.cur_url }));
        this.player.on('ended', () => this.dispatch('play_end', { src: this.cur_url }));
        this.player.on('error', () => this.dispatch('play_failed', { src: this.cur_url }));

        this.player.ready(() => {
            this.disable_captions();
            if (this.opts.fullscreen && !this.player.isFullscreen()) {
                this.player.requestFullscreen();
            }
            this.set_source(this.cur_url, this.cur_vtype);
			schedule_once(this.unmuted.bind(this), 1);
        });
    }

    disable_captions() {
        let tt = this.player.textTracks();
        for (let i = 0; i < tt.length; i++) {
            tt[i].mode = 'disabled';
        }
    }

    set_source(url, vtype) {
        this.cur_url = url;
        this.cur_vtype = vtype || this.guess_type(url);
        this.player.src({ src: this.cur_url, type: this.cur_vtype });
    }

    guess_type(url) {
        let t = url.toLowerCase();
        if (t.endsWith('.m3u8')) return 'application/x-mpegURL';
        if (t.endsWith('.mp4')) return 'video/mp4';
        if (t.endsWith('.avi')) return 'video/avi';
        if (t.endsWith('.webm')) return 'video/webm';
        return 'application/x-mpegURL';
    }

    play() {
        if (this.player) this.player.play();
    }

    unmuted() {
        if (this.player) {
            this.player.muted(false);
            this.player.volume(1.0);
        }
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
		if (!this.user_data){
			var jc = new bricks.HttpJson();
			this.deviceid = bricks.deviceid('iptv')
			this.user_data = await jc.httpcall(this.iptv_data_url, {
				params:{
					deviceid:this.deviceid
				}, 
				method:'GET'
			});
		}
		console.log('this.user_data =', this.user_data);
		this.video = new bricks.Video({
			autoplay:true,
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
