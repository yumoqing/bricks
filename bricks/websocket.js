var bricks = window.bricks || {}
bricks.WebSocket = class extends bricks.VBox {
	/*
	options = {
		ws_url:
		with_session:
	}
	event:
		onopen:
		onmessage:
		onerror:
		onclose:
		ontext:
		onbase64audio
		onbase64video
	*/
	constructor(opts){
		super(opts);
		if (opts.with_session){
			var session =  bricks.app.get_session();
			this.ws = new WebSocket(this.ws_url, sessopn);
		} else {
			this.ws = new WebSocket(this.ws_url);
		}
		this.ws.onopen = this.on_open.bind(this);
		this.ws.onmessage = this.on_message.bind(this);
		this.ws.onclose = this.on_close.bind(this);
		this.ws.onerror = this.on_error.bind(this);
	}
	on_open(e){
		this.dispatch('onopen');
		console.log("open");
	}
	on_close(e){
		this.dispatch('onclose');
		console.log("close");
	}
	on_error(e){
		this.dispatch('onerror');
		console.log(error);
	}
	on_message(e){
		var d = JSON.parse(e.data);
		var eventname = 'on' + d.type;
		this.dispatch(eventname, d.data);
	}
	send_text(text){
		var d = {
			type: "text",
			data: text
		}
		this.send(d);
	}
	send_base64_video(b64video){
		var d = {
			type: "base64video",
			data: b64video
		}
		this.send(d);
	}
	send_base64_audio(b64audio){
		var d = {
			type: "base64audio",
			data: b64audio
		}
		this.send(d);
	}
	send_typedata(type, data){
		var d = {
			type:type,
			data:data
		}
		return send(d);
	}
	send(d){
		/* d is a object:
		{
			type:
			data:
		}
		*/
		var s = JSON.stringify(d);
		this.ws.send(s);
	}
}
bricks.Factory.register('WebSocket', bricks.WebSocket);

