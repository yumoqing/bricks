bricks = window.bricks || {};

bricks.QAFrame = class extends bricks.VBox {
	/*
	{
		ws_url:
		ws_params:
		title:
		description:
		courseware:{
			type: "audio" or "video", "image", "markdown"
			url:
			timeout:
		}
		timeout:0 no timeout, number in seconds
		"accept data type"
		1:
			type:courseware:
			data:{
				type:
				url:
			}
		2:
			type:askready
			data:{
				total_q
				cur_q
			}
		3:
			type:question
			data: {
				q_desc:
				total_q:
				cur_q
			}
		4:
			type:result
			data: {
				total_q:
				correct_cnt:
				error_cnt
			}
		5:
			type:error_list,
			data: {
				error_cnt,
				rows:[
					{
						pos:
						q_desc:
						your_a:
						corrent_a:
						error_desc:
					}
				]
			}

		send message:
		1: 
			type: qa_start
			data:null

		2:
	}
	*/
	constructor(opts){
		super(opts);
		this.top_w = new bricks.HBox({
			cheight:2
		});
		this.bottom_w = new bricks.HBox({
			cheight:2
		});
		this.main_w = new bricks.Filler({});
		this.add_widget(this.top_w);
		this.add_widget(this.main_w);
		this.add_widget(this.bottom_w);
		var url = this.ws_url;
		if (this.ws_params){
			url += '?' + new URLSearchParams(this.ws_params).toString();
		}
		this.ws = new bricks.WebSocket({
				ws_url:url
		});
		this.ws.bind('onopen', this.start_question_answer.bind(this));
		this.ws.bind('onquestion', this.show_question.bind(this));
		this.ws.bind('oncourseware', this.show_courseware.bind(this));
		this.ws.bind('onaskstart', this.show_conform.bind(this));
		this.ws.bind('oncourseware', this.show_courseware.bind(this));
		this.ws.bind('oncourseware', this.show_courseware.bind(this));
	}
	show_question(d){
		console.log('show_question(), d=', d);
		this.qtotal_w.set_text(str(d.total_q));
		this.qcur_w.set_text(str(d.cur_q));
		var w = bricks.widgetBuild(d.q_desc, this);
		this.main_w.clear_widgets();
		if (w){
			this.main_w.add_widget(w);
		}
	}
	show_courseware(d){
		var w;
		this.main_w.clear_widgets();
		console.log('show_courseware(), d=', d);
		switch(d.type){
			case 'video':
				w = new bricks.Video({
					width:'100%',
					height:'100%',
					url:d.url,
					autoplay:true
				});
				break;
			case 'audio':
				w = new bricks.AudioPlayer({
					width:'100%',
					height:'100%',
					url:d.url,
					autoplay:true
				});
				break;
			case 'image':
				w = new bricks.Image({
					width:'100%',
					height:'100%',
					url:d.url,
				});
				break;
			case 'markdown':
				w = new bricks.MdWidget({
					height:'100%',
					width:'100%',
					md_url: d.url
				});
				break;
		}
		this.main_w.add_widget(w);
	}
	show_conform(d){
		this.main_w.clear_widgets();
		var btn = new bricks.Button({
			label: 'Start ?'
		});
		btn.bind('click', this.start_question_answer.bind(this));
		this.main_w.clear_widgets();
		this.main_w.add_widget(btn);
	}
	build_startbtn(){
		var btn = new bricks.Button({
				label:'press to start'
		});
		btn.bind('click', this.conform_start.bind(this));
		this.bottom_w.add_widget(btn);
	}
	conform_start(){
		var d = {
			type: 'conform_start',
			data: null
		}
		this.ws.send(d);
	}
	start_question_answer(){
		this.main_w.clear_widgets();
		var d = {
			'type': 'qa_start',
			'data': {
				d: 'test data',
				v: 100
			}
		};
		this.ws.send(d);
	}
	async send_audio_answer(e){
		var audio = e.data;
		var b64audio = blobToBase64(audio.audio);
		this.ws.send({
			type: 'audio_answer',
			data: b64audio
		})
	}
	send_text_answer(e){
		var answer = e.data;
		console.log('answer=', answer);
		this.ws.send({
			type: 'text_answer',
			data: answer.texta
		});
	}
	build_input_widgets(){
		var hw = StrInput({
			name:texta,
			css:'filler'
		});
		var speakw = new bricks.AudioRecorder({
			icon_rate:1.7,
			padding: '6px'
		});
		/*
		var imagew = new bricks.Svg({
			rate:1.7,
			padding: '6px',
			url: bricks_resource('imgs/camera.svg')
		});
		var videow = new bricks.Svg({
			rate: 1.7,
			padding: '6px',
			url: bricks_resource('imgs/recorder.svg')
		});
		this.bottom_w.add_widget(imagew);
		this.bottom_w.add_widget(videow);
		*/
		hw.bind('blur', this.send_text_answer.bind(this));
		speakw.bind('record_ended', this.send_audio_data.bind(this));
		
		this.bottom_w.add_widget(speakw);
		this.bottom_w.add_widget(hw);
	}
	play_course(){
		switch(this.courseware.type){
			case 'video':
				this.cw = new bricks.VideoPlayer({
					url:this.courseware.url, 
					autoplay:true
				});
				break;
			case 'audio':
				this.cw = new bricks.AudioPlayer({
					url:this.courseware.url,
					autoplay:true
				});
				break;
			case 'image':
				this.cw = new bricks.Image({
					url:this.courseware.url
				});
				break;
			case 'markdown':
				this.cw = new bricks.MdWidget({
					md_url:this.courseware.url
				});
				break;
			default:
				return
		}
		this.main_w.add_widget(this.cw);
	} 
}

bricks.Factory.register('QAFrame', bricks.QAFrame);
