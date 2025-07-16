var bricks = window.bricks || {};

bricks.StreamAudio = class extends bricks.VBox {
	constructor(opts){
		opts.height = '100%';
		opts.name = opts.name || 'asr_text';
		super(opts);
		this.button = new bricks.Button({label:'start'});
		this.filler = new bricks.Filler({});
		this.add_widget(this.button);
		this.add_widget(this.filler);
		this.text_w = new bricks.Text({text:' ', wrap:true});
		this.filler.add_widget(this.text_w);
		this.button.bind('click', this.toggle_status.bind(this));
	}
	toggle_status(){
		if (this.upstreaming){
			this.stop();
		} else {
			this.start();
		}
	}
	start(){
		this.button.text_w.set_otext('stop');
		schedule_once(this._start.bind(this), 0.1);
	}
	async _start(){
		if (bricks.vad){
			await bricks.vad.stop();
		}
		var f = this.handle_audio.bind(this);
		this.vad = await vad.MicVAD.new({
			onSpeechEnd:(audio) => {
				console.log(audio, this.vad);
				this.handle_audio(audio);
			}
		});
		this.vad.start();
		bricks.vad = this;
		this.upstreaming = new bricks.UpStreaming({url:this.url});
		this.resp_text = '';
		this.resp = await this.upstreaming.go();
		await this.recieve_data();
	}
	stop(){
		this.button.text_w.set_otext('start');
		schedule_once(this._stop.bind(this), 0.1);
	}
	async _stop(){
		if (this.upstreaming){
			this.upstreaming.finish();
			this.upstreaming = null;
		}
		await this.vad.pause();
		bricks.vad = null;
	}
	async receive_data(){
		const reader = resp.body.getReader();
		const decoder = new TextDecoder('utf-8');
		var line = await reader.readline();
		while (line){
			try {
				var d = JSON.parse(line);
				this.text_w.set_text(d.content);
			} catch(e){
				console.log(line, 'can not parse as a json');
			}
			line = await reader.readline();
		}
	}
	handle_audio(audio){
		console.log('handle_audil() called', audio);
		var b64audio = btoa(audio);
		this.upstreaming.send(b64audio);
	}
}

bricks.Factory.register('StreamAudio', bricks.StreamAudio);
bricks.Factory.register('ASRText', bricks.StreamAudio);
