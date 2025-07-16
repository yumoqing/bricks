bricks = window.bricks || {};

bricks.UpStreaming = class extends bricks.JsWidget {
	/*
	{
		"url":
	}
	*/
	constructor(opts){
		super(opts);
	}
	async go(){
		this.body = new ReadableStream(this);
		this.headers = new Headers();
		this.headers.append('Content-Type', 
					'application/octet-stream');
		var resp = await fetch(this.url, {
		  method: 'POST',
		  headers: this.headers,
		  duplex: 'full',
		  body: this.body
		});
		return resp
	}
	send(data){
		this.stream_ctlr.enqueue(data);
	}
	finish(){
		this.stream_ctlr.close();
	}
	start(controller){
		this.stream_ctlr = controller;
	}
}

bricks.down_streaming = async function*(response) {
	if (! response){
		return;
	}
	const reader = response.body.getReader();
	var value;
	var t = 0;
	while (true){
		done, value = await reader.read();
		if (value.done){
			break;
		}
		let result = '';
		for (let i = 0; i < value.value.length; i++) {
			result += String.fromCharCode(value.value[i]);
		}
		console.log('audio set url=', result);
		yield result;
	}
}
