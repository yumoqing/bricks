/*
<script src="https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.7/dist/bundle.min.js"></script>
<script>
  async function main() {
    const myvad = await vad.MicVAD.new({
      onSpeechEnd: (audio) => {
        // do something with `audio` (Float32Array of audio samples at sample rate 16000)...
      },
    })
    myvad.start()
  }
  main()
</script>
*/

var bricks = window.bricks || {};
bricks.enable_vad = async function(func){
	/*
	func accept one argument "audio"(float32array of audio samples at sample rate 16000)
	*/
	bricks.vad = await vad.MicVAD.new({
		onSpeechEnd:func
	});
	bricks.vad.start();
}
bricks.disable_vad = async function(){
	bricks.vad.stop();
	bricks.vad = null;
}
