var bricks = window.bricks || {};

bricks.WebTTS = class extends bricks.VBox {
	constructor(opts){
		super(opts);
	}
	speak(text){
		// 检查浏览器是否支持SpeechSynthesis
		if ('speechSynthesis' in window) {
		  var utterance = new SpeechSynthesisUtterance(text);
		  // 设置语音属性，例如语言
		  utterance.lang = bricks.app.lang;
		  utterance.pitch = 1;
		  utterance.rate = 1;
		  utterance.onstart = function(event) {
			console.log('语音合成开始');
		  };
		  // 当语音合成结束时触发
		  utterance.onend = function(event) {
			console.log('语音合成结束');
		  };
		  // 当语音合成出错时触发
		  utterance.onerror = function(event) {
			console.error('语音合成出错:', event.error);
		  };
		  // 将utterance添加到语音合成队列
		  window.speechSynthesis.speak(utterance);
		} else {
		  console.error('浏览器不支持SpeechSynthesis');
		}
	}
}

bricks.WebASR = class extends bricks.VBox {
	constructor(opts){
		super(opts);
		this.reognition = None;
	}
	start_recording(){
		// 检查浏览器是否支持SpeechRecognition
		if ('SpeechRecognition' in window) {
		  // 创建SpeechRecognition实例
		  this.recognition = new SpeechRecognition();
		  // 处理识别错误
		  this.recognition.onerror = function(event) {
			console.error('识别错误:', event.error);
		  };
		  // 处理语音识别结束事件
		  this.recognition.onend = function() {
			console.log('语音识别已结束');
		  };
		  // 处理识别结果
		  this.recognition.onresult = function(event) {
			var transcript = event.results[0][0].transcript;
			this.dispatch('asr_result', {
				content:transcript
			});
			console.log('识别结果:', transcript);
		  };
		  this.recognition.lang = bricks.app.lang;
		  this.recognition.start();
		} else {
			console.log('browser has not SpeechRecognition');
		}
	}
	stop_recording(){
		this.recognition.stop();
	}
}

bricks.Factory.register('WebTTS', bricks.WebTTS);
bricks.Factory.register('WebASR', bricks.WebASR);

