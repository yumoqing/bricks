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
		this.set_css('video-js');
		this.set_css('vjs-big-play-centered');
		this.set_css('vjs-fluid');
		this.cur_url = options.url;
		this.cur_vtype = options.vtype;
		console.log('here1');
		schedule_once(this.create_player.bind(this), 0.1);
	}
	create(){
		this.dom_element = document.createElement('video');
	}
	create_player(){
		console.log('here2');
		this.player = videojs(this.dom_element);
		console.log('here3');
		this._set_source();
	}
	_set_source(){
		console.log('--------set source ---------');
	}
	set_source(url){
		this.cur_url = url;
		this._set_source();
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
