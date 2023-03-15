class Video extends JsWidget {
	constructor(options){
		super(options);
		this.create('video');
		this.dom_element.controls = true;
		if (this.opts.url){
			this.dom_element.src = this.opts.url;
		}
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
		this.create('div');
		var autoplay = '';
		if (this.opts.autoplay){
			autoplay = 'autoplay';
		}
		var url = this.opts.url;
		this.dom_element.innerHTML = `<video width="100%" controls ${autoplay} > \
		<source src=${url} /> \
		</video>`;
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
