
class AudioPlayer extends JsWidget {
	constructor(options){
		super(options);
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
	play_audio(){
		var btns; // = this.audio.getElementsByClassName('play-pause bar paused');
		btns = querySelectorAllShadows('.play-pause', this.audio);
		if (btns.length > 0){
			btns[0].click();
			console.log('AudioPlayer():playing ...')
		}
		console.log('AudioPlayer():play button not found');
		// this.audio.play();
	}
}

Factory.register('AudioPlayer', AudioPlayer);
