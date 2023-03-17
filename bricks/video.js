class Video extends JsWidget {
	constructor(options){
		super(options);
		this.dom_element.controls = "";
		if (this.opts.autoplay) 
			this.dom_element.autoplay = "";
		this.dom_element.type="application/vnd.apple.mpegurl";
		this.dom_element.add_css('media-document');
		this.dom_element.add_css('mac');
		this.dom_element.add_css('video');
		if (this.opts.url){
			this.dom_element.src = this.opts.url;
		}
	}
	create(){
		this.dom_element = document.createElement('video');
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
