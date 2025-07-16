var bricks = window.bricks || {};
/** @param sampleRate {number} */
/** @param channelBuffers {Float32Array[]} */
function audioBufferToWav(channelBuffers, sampleRate) {
  const totalSamples = channelBuffers[0].length * channelBuffers.length;

  const buffer = new ArrayBuffer(44 + totalSamples * 2);
  const view = new DataView(buffer);

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  /* RIFF identifier */
  writeString(view, 0, "RIFF");
  /* RIFF chunk length */
  view.setUint32(4, 36 + totalSamples * 2, true);
  /* RIFF type */
  writeString(view, 8, "WAVE");
  /* format chunk identifier */
  writeString(view, 12, "fmt ");
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, channelBuffers.length, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 4, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, channelBuffers.length * 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, "data");
  /* data chunk length */
  view.setUint32(40, totalSamples * 2, true);

  // floatTo16BitPCM
  let offset = 44;
  for (let i = 0; i < channelBuffers[0].length; i++) {
    for (let channel = 0; channel < channelBuffers.length; channel++) {
      const s = Math.max(-1, Math.min(1, channelBuffers[channel][i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }

  return buffer;
}

bricks.VadText = class extends bricks.VBox {
	constructor(opts){
		opts.height = '100%';
		opts.name = opts.name || 'asr_text';
		super(opts);
		this.button = new bricks.Button({
			label:'start',
			icon:bricks_resource('imgs/speak.svg')
		});
		this.audio = new bricks.AudioPlayer({});
		this.audio.set_css('filler');
		var hbox = new bricks.HBox({width:'100%', height:'auto'});
		hbox.add_widget(this.button);
		hbox.add_widget(this.audio)
		this.add_widget(hbox);
		this.filler = new bricks.Filler({});
		this.add_widget(this.filler);
		this.text_w = new bricks.Text({text:' ', wrap:true});
		this.filler.add_widget(this.text_w);
		this.button.bind('click', this.toggle_status.bind(this));
		this.bind('audio_ready', this.handle_audio.bind(this));
	}
	toggle_status(){
		if (this.vad){
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
		this.vad = await vad.MicVAD.new({
			onSpeechEnd:(audio) => {
				console.log(audio, this.vad);
				this.dispatch('audio_ready', audio);
				this.handle_audio(audio);
			}
		});
		this.vad.start();
		bricks.vad = this;
		this.text = '';
	}
	stop(){
		this.button.text_w.set_otext('start');
		schedule_once(this._stop.bind(this), 0.1);
	}
	async _stop(){
		await this.vad.pause();
		this.vad = null;
		bricks.vad = null;
		if(this.text != ''){
			this.dispatch('changed', this.getValue());
		}
	}
	async handle_audio(audio){
		console.log('handle_audil() called', audio);
		var wavBuffer = audioBufferToWav([audio], 16000);
		var b64audio = this.arrayBufferToBase64(wavBuffer);
		this.audio.set_url('data:audio/wav;base64,' + b64audio);
		var hj = new bricks.HttpJson();
		var d={
			method:'POST',
			params:{
				model:this.model,
				audio:b64audio
			}
		}
		var rj = await hj.httpcall(this.url, d);
		if (rj.status == 'ok'){
			this.text += rj.content
			this.text_w.set_text(this.text);
		} else {
			var w = new bricks.Error({title:'Error', 
						timeout:4, 
						message:rj.message
			});
			w.open();
		}
	}
	arrayBufferToBase64(wavBuffer) {
		let binary = '';
		const bytes = new Uint8Array(wavBuffer);
		for (let i = 0; i < bytes.byteLength; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return btoa(binary);
	}
	getValue(){
		var d = {}
		d[this.name] = this.text;
	}
}

bricks.Factory.register('VadText', bricks.VadText);
