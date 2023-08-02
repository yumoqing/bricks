/*
we use videojs for video play
https://videojs.com
*/
class Video extends JsWidget {
	/*
	{
		vtype:
		url:
		autoplay:
	}
	*/
	constructor(options){
		super(options);
		this.dom_element.type="application/vnd.apple.mpegurl";
		this.dom_element.add_css('video-js');
		this.dom_element.add_css('vjs-big-play-centered');
		this.dom_element.add_css('vjs-fluid');
		if (this.opts.url){
			this.dom_element.src = this.opts.url;
		}
	}
	create(){
		this.dom_element = document.createElement('video');
		this.player = videojs(this.dom_element, {
			controls: true, // 是否显示控制条
			// poster: 'xxx', // 视频封面图地址
			preload: 'auto',
			autoplay: this.opts.autoplay || false,
			fluid: true, // 自适应宽高
			language: 'zh-CN', // 设置语言
			muted: false, // 是否静音
			inactivityTimeout: false,
			controlBar: { // 设置控制条组件
				/* 设置控制条里面组件的相关属性及显示与否
				'currentTimeDisplay':true,
				'timeDivider':true,
				'durationDisplay':true,
				'remainingTimeDisplay':false,
				volumePanel: {
				  inline: false,
				}
				*/
				/* 使用children的形式可以控制每一个控件的位置，
				以及显示与否 */
				children: [
					{name: 'playToggle'}, // 播放按钮
					{name: 'currentTimeDisplay'}, // 当前已播放时间
					{name: 'progressControl'}, // 播放进度条
					{name: 'durationDisplay'}, // 总时间
					{ // 倍数播放
					name: 'playbackRateMenuButton',
					'playbackRates': [0.5, 1, 1.5, 2, 2.5]
					},
					{
						name: 'volumePanel', // 音量控制
						inline: false, // 不使用水平方式
					},
					{name: 'FullscreenToggle'} // 全屏
				]
			},
			sources:[ // 视频源
				{
				  src: this.opts.src,
				  type: this.opts.vtype || 'video/mp4'
				  // poster: '//vjs.zencdn.net/v/oceans.png'
				}
			]
		}, function (){
			console.log('视频可以播放了',this);
		});
	}
}

class VideoPlayer extends VBox {
	/* 
	we use [indigo-player](https://github.com/matvp91/indigo-player) as a base.
	inside body, need to add following line before bricks.js
	<script src="https://cdn.jsdelivr.net/npm/indigo-player@1/lib/indigo-pla    yer.js"></script>
	options 
	{
		url:
	}
	*/
	constructor(options){
		super(options);
		var autoplay = '';
		if (this.opts.autoplay){
			autoplay = 'autoplay';
		}
		var url = this.opts.url;
		this.dom_element.innerHTML = `<video width="90%" controls ${autoplay} src="${url}" type="application/vnd.apple.mpegurl" class="media-document mac video" ></video>`;
		this.video = this.dom_element.querySelector('video');
	}
	toggle_play(){
		if (this.video.paused){
			this.video.play();
		} else {
			this.video.pause();
		}
	}
		
}
Factory.register('VideoPlayer', VideoPlayer);
Factory.register('Video', Video);
