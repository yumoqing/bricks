var bricks = window.bricks || {}
/*
use hls to play m3u8
 https://cdn.jsdelivr.net/npm/hls.js@latest
use dash to play dash
	https://cdn.dashjs.org/latest/dash.all.min.js
*/

bricks.VideoPlayer = class extends bricks.VBox {
	/*
		opts:
			url: video source
			autoplay:true or false
	*/
	constructor(opts) {
		super(opts)
		this.set_css('video-container');
		this.dom_element.innerHTML = `<video id="video" class="video-element"></video>
    <div class="controls">
      <div class="progress-container">
        <input type="range" class="progress-bar" value="0" step="0.0001" />
      </div>
      <div class="controls-bottom">
        <button class="play-pause">▶</button>
        <div class="volume-container">
          <button class="mute">🔊</button>
          <input type="range" class="volume" min="0" max="1" step="0.01" value="1" />
        </div>
        <span class="time">00:00 / 00:00</span>
        <div class="speed-container">
          <select class="playback-speed">
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1" selected>1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
        <div class="audio-tracks">
          <select class="audio-track-select"></select>
        </div>
        <button class="fullscreen">⛶</button>
      </div>
    </div>`
		this.video = this.dom_element.querySelector('.video-element');
		this.controls = this.dom_element.querySelector('.controls');

		this.hls = null;
		this.dashPlayer = null;

		this.playPauseBtn = this.controls.querySelector('.play-pause');
		this.muteBtn = this.controls.querySelector('.mute');
		this.volumeInput = this.controls.querySelector('.volume');
		this.progressBar = this.controls.querySelector('.progress-bar');
		this.timeDisplay = this.controls.querySelector('.time');
		this.speedSelect = this.controls.querySelector('.playback-speed');
		this.audioTrackSelect = this.controls.querySelector('.audio-track-select');
		this.fullscreenBtn = this.controls.querySelector('.fullscreen');

		this.bind('domon', this.init.bind(this));
		this.bind('domoff', this.destroy.bind(this));
	}

	destroy(){
		if (this.hls) {
			this.hls.destroy();
			this.hls = null;
		}
		if (this.dashPlayer) {
			this.dashPlayer.reset();
			this.dashPlayer = null;
		}
		this.video.src = ''; // 清空
	}
	init() {
		this.loadVideo(this.opts.url); // 可替换为 mp4 / m3u8 / mpd
		this.bindEvents();
		this.updateUI();
		if (this.opts.autoplay && this.video.paused){
			this.playPauseBtn.click();
		}
	}

	loadVideo(src) {
		// 销毁旧播放器
		this.destroy()

		if (src.endsWith('.m3u8') || src.includes('m3u8')) {
			if (Hls.isSupported()) {
				this.hls = new Hls({
					enableWebVTT: false,   // 不加载 WebVTT
					enableIMSC1: false,    // 不加载 IMSC1/TTML
					renderTextTracksNatively: false // 不用浏览器原生 track
				});
				this.hls.subtitleTrack = -1; // 关闭字幕轨道
				this.hls.loadSource(src);
				this.hls.attachMedia(this.video);
				this.hls.on(Hls.Events.MANIFEST_PARSED, () => this.onLoaded());
			} else {
				console.error('HLS not supported');
			}
		} else if (src.endsWith('.mpd') || src.includes('mpd')) {
			this.dashPlayer = dashjs.MediaPlayer().create();
			this.dashPlayer.initialize(this.video, src, true);
			this.dashPlayer.on('manifestParsed', () => this.onLoaded());
		} else {
			// 普通视频
			this.video.src = src;
			this.video.addEventListener('loadedmetadata', () => this.onLoaded());
		}
	}

	onLoaded() {
		this.updateAudioTracks();
		this.updateUI();
	}

	bindEvents() {
		// 播放/暂停
		this.playPauseBtn.addEventListener('click', () => {
			if (this.video.paused) {
				this.video.play();
			} else {
				this.video.pause();
			}
		});

		// 静音切换
		this.muteBtn.addEventListener('click', () => {
			this.video.muted = !this.video.muted;
			this.updateMuteUI();
		});

		// 音量变化
		this.volumeInput.addEventListener('input', (e) => {
			this.video.volume = e.target.value;
			this.video.muted = this.video.volume === 0;
			this.updateMuteUI();
		});

		// 进度条拖动
		this.progressBar.addEventListener('input', (e) => {
			const time = e.target.value * this.video.duration;
			this.video.currentTime = time;
		});

		// 播放速度
		this.speedSelect.addEventListener('change', (e) => {
			this.video.playbackRate = parseFloat(e.target.value);
		});

		// 音轨切换
		this.audioTrackSelect.addEventListener('change', (e) => {
			const index = parseInt(e.target.value);
			if (this.video.audioTracks) {
				for (let i = 0; i < this.video.audioTracks.length; i++) {
					this.video.audioTracks[i].enabled = i === index;
				}
			}
		});

		// 全屏
		this.fullscreenBtn.addEventListener('click', () => {
			if (this.dom_element.requestFullscreen) {
				this.dom_element.requestFullscreen();
			} else if (this.dom_element.webkitRequestFullscreen) {
				this.dom_element.webkitRequestFullscreen();
			}
		});

		// 视频事件
		this.video.addEventListener('play', () => this.updatePlayPauseUI());
		this.video.addEventListener('pause', () => this.updatePlayPauseUI());
		this.video.addEventListener('timeupdate', () => this.updateProgress());
		this.video.addEventListener('durationchange', () => this.updateProgress());
		this.video.addEventListener('volumechange', () => {
			this.updateMuteUI();
			this.volumeInput.value = this.video.volume;
		});
		this.video.addEventListener('loadedmetadata', () => {
			this.updateAudioTracks();
		});
		this.video.addEventListener('seeking', () => {
			this.progressBar.value = this.video.currentTime / this.video.duration;
		});
	}

	updateUI() {
		this.updatePlayPauseUI();
		this.updateMuteUI();
		this.updateProgress();
		this.volumeInput.value = this.video.volume;
	}

	updatePlayPauseUI() {
		this.playPauseBtn.textContent = this.video.paused ? '▶' : '❚❚';
	}

	updateMuteUI() {
		this.muteBtn.textContent = this.video.muted || this.video.volume === 0 ? '🔇' : '🔊';
	}

	updateProgress() {
		const percent = this.video.duration ? this.video.currentTime / this.video.duration : 0;
		this.progressBar.value = percent;
		this.timeDisplay.textContent = `${this.formatTime(this.video.currentTime)} / ${this.formatTime(this.video.duration || 0)}`;
	}

	updateAudioTracks() {
		this.audioTrackSelect.innerHTML = '';
		if (this.video.audioTracks && this.video.audioTracks.length > 0) {
			for (let i = 0; i < this.video.audioTracks.length; i++) {
				const track = this.video.audioTracks[i];
				const option = document.createElement('option');
				option.value = i;
				option.textContent = track.label || `音轨 ${i + 1}`;
				if (track.enabled) option.selected = true;
				this.audioTrackSelect.appendChild(option);
			}
		} else {
			const option = document.createElement('option');
			option.textContent = '无音轨';
			option.disabled = true;
			this.audioTrackSelect.appendChild(option);
		}
	}

	formatTime(seconds) {
		const s = Math.floor(seconds % 60);
		const m = Math.floor((seconds / 60) % 60);
		const h = Math.floor(seconds / 3600);
		return h > 0
			? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
			: `${m}:${s.toString().padStart(2, '0')}`;
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
		this.video = new bricks.VideoPlayer({
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
bricks.Factory.register('Iptv', bricks.Iptv);
bricks.Factory.register('VideoPlayer', bricks.VideoPlayer);
bricks.Factory.register('Video', bricks.VideoPlayer);
