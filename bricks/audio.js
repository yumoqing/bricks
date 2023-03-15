
class AudioPlayer extends JsWidget {
	/*
	{
		url:
		autoplay:
	}
	*/

	constructor(options){
		super(options);
		this.url = opt.url;
		this.create('div');
		this.audio = this._create('audio');
		// this.audio.autoplay = this.opts.autoplay;
		this.audio.controls = true;
		if (this.opts.autoplay){
			this.audio.addEventListener('canplay', this.play_audio.bind(this));
		}
		this.audio.style.width = "100%"
		var s = this._create('source');
		s.src = this.opts.url;
		this.audio.appendChild(s);
		this.dom_element.appendChild(this.audio);
	}
	toggle_play(){
		if (this.audio.paused){
			this.audio.play();
		} else {
			this.audio.pause();
		}
	}
}

Factory.register('AudioPlayer', AudioPlayer);
