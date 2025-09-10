var bricks = window.bricks || {}

bricks VideoPlayer = class extends bricks.VBox {
	constructor(opts) {
		super(opts)
		this.video = videoElement;
		this.hls = null;
		this.dashPlayer = null;

		this.audioTrackSelect = document.getElementById('audioTrackSelect');
		this.timeDisplay = document.getElementById('timeDisplay');
		/*
		this.initEventListeners();
		this.initTrackChangeHandler();
		*/
	}
	create(){
		this.dom_element = document.createElement('video', {controls: true});
	}
	// 播放指定 URL 的视频
	load(src) {
		const video = this.video;

		// 销毁之前的播放器实例
		this.destroy();

		// 判断视频类型
		if (Hls.isSupported() && src.endsWith('.m3u8')) {
			this.loadHLS(src);
		} else if (src.endsWith('.mpd')) {
			this.loadDASH(src);
		} else {
			// 普通视频（MP4/WebM/Ogg）
			video.src = src;
			video.load();
			this.setupEventHandlers();
		}
	}

	loadHLS(src) {
		this.hls = new Hls();
		this.hls.loadSource(src);
		this.hls.attachMedia(this.video);
		this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
			this.video.play().catch(e => console.warn("自动播放被阻止", e));
			this.setupEventHandlers();
			this.updateAudioTracks();
		});
		this.hls.on(Hls.Events.ERROR, (event, data) => {
			if (data.fatal) {
				console.error('HLS 错误:', data);
				if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
					this.hls.startLoad();
				}
			}
		});
	}

	loadDASH(src) {
		this.dashPlayer = dashjs.MediaPlayer().create();
		this.dashPlayer.initialize(this.video, src, true);
		this.dashPlayer.on('error', (e) => {
			console.error('DASH 播放出错:', e);
		});
		this.setupEventHandlers();
		setTimeout(() => this.updateAudioTracks(), 1000); // 延迟获取音轨
	}

	setupEventHandlers() {
		const video = this.video;

		video.addEventListener('play', () => this.onPlay());
		video.addEventListener('pause', () => this.onPause());
		video.addEventListener('timeupdate', () => this.onTimeUpdate());
		video.addEventListener('loadedmetadata', () => this.onLoadedMetadata());
		video.addEventListener('ended', () => this.onEnded());
		video.addEventListener('error', (e) => this.onError(e));
	}

	// 事件回调
	onPlay() {
		console.log('视频开始播放');
	}

	onPause() {
		console.log('视频暂停');
	}

	onTimeUpdate() {
		const { currentTime, duration } = this.video;
		this.timeDisplay.textContent = `${this.formatTime(currentTime)} / ${this.formatTime(duration)}`;
	}

	onLoadedMetadata() {
		console.log('元数据加载完成');
		this.updateAudioTracks();
	}

	onEnded() {
		console.log('视频播放结束');
	}

	onError(e) {
		console.error('视频播放错误:', e);
	}

	// 音轨切换支持
	updateAudioTracks() {
		const select = this.audioTrackSelect;
		select.innerHTML = ''; // 清空

		const tracks = this.getAudioTracks();

		if (tracks.length === 0) {
			const option = document.createElement('option');
			option.textContent = '无可用音轨';
			option.disabled = true;
			select.appendChild(option);
			select.disabled = true;
			return;
		}

		select.disabled = false;

		tracks.forEach((track, index) => {
			const option = document.createElement('option');
			option.value = index;
			option.textContent = track.label || track.language || `音轨 ${index + 1}`;
			select.appendChild(option);
		});

		// 默认选中第一个
		select.value = 0;
		this.bindAudioTrackChange();
	}

	getAudioTracks() {
		const video = this.video;

		// DASH 情况：使用 dash.js API
		if (this.dashPlayer) {
			const audioTracks = this.dashPlayer.getTracksFor('audio');
			return audioTracks.map(t => ({
				label: t.label || t.lang,
				language: t.lang,
				_track: t
			}));
		}

		// HLS 情况：使用 hls.js 的 audio tracks
		if (this.hls && this.hls.audioTracks.length > 0) {
			return this.hls.audioTracks.map(track => ({
				label: track.name || track.lang,
				language: track.lang,
				_track: track
			}));
		}

		// 原生 HTMLTrackElement（较少见，主要用于 <track kind="audio">）
		const nativeTracks = Array.from(video.audioTracks || []);
		if (nativeTracks.length > 0) {
			return nativeTracks.map(track => ({
				label: track.label || track.language,
				language: track.language,
				_track: track
			}));
		}

		// fallback：返回主音轨
		return [{ label: '主音轨', language: 'und' }];
	}

	bindAudioTrackChange() {
		this.audioTrackSelect.removeEventListener('change', this.handleAudioTrackChange.bind(this));
		this.audioTrackSelect.addEventListener('change', this.handleAudioTrackChange.bind(this));
	}

	handleAudioTrackChange() {
		const selectedIndex = parseInt(this.audioTrackSelect.value, 10);
		const tracks = this.getAudioTracks();
		const selected = tracks[selectedIndex];

		if (this.hls && selected._track && selected._track.id !== undefined) {
			this.hls.currentLevel = -1; // 确保视频流不变
			this.hls.audioTrack = selected._track.id;
		}

		if (this.dashPlayer && selected._track) {
			this.dashPlayer.setCurrentTrack(selected._track);
		}

		// 对于原生音轨（较少见）
		if (selected._track && selected._track.enabled !== undefined) {
			Array.from(this.video.audioTracks).forEach(t => {
				t.enabled = (t === selected._track);
			});
		}

		console.log('切换到音轨:', selected);
	}

	// 工具函数：格式化时间
	formatTime(seconds) {
		const s = Math.floor(seconds % 60).toString().padStart(2, '0');
		const m = Math.floor((seconds / 60) % 60).toString().padStart(2, '0');
		const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
		return seconds >= 3600 ? `${h}:${m}:${s}` : `${m}:${s}`;
	}

	// 播放/暂停控制
	togglePlay() {
		if (this.video.paused) {
			this.video.play().catch(e => console.warn("播放失败:", e));
		} else {
			this.video.pause();
		}
	}

	// 销毁当前播放器实例
	destroy() {
		if (this.hls) {
			this.hls.destroy();
			this.hls = null;
		}
		if (this.dashPlayer) {
			this.dashPlayer.reset();
			this.dashPlayer = null;
		}
	}
}

// 初始化播放器
document.addEventListener('DOMContentLoaded', () => {
	const video = document.getElementById('videoPlayer');
	const player = new VideoPlayer(video);

	// 绑定播放/暂停按钮
	document.getElementById('playPause').addEventListener('click', () => {
		player.togglePlay();
	});

	// 示例：自动加载一个 m3u8 视频（替换为你的实际链接）
	// player.load('https://example.com/stream.m3u8');

	// 或者加载 DASH
	// player.load('https://example.com/stream.mpd');

	// 或者普通 MP4
	player.load('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
});
