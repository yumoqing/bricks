/*
dependent on xterm.js
*/
class Wterm extends JsWidget {
	/*
	{
		ws_url:
		host:
		ssh_port:
		user:
	}
	*/
	constructor(opts){
		super(opts);
		schedule_once(this.open.bind(this), 0.5);
	}
	async open(){
		var term = new Terminal();
		this.term = term;
		term.open(this.dom_element);
		var ws = new WebSocket(this.opts.ws_url);
		ws.onmessage = msg => {
			term.write(JSON.parse(msg.data).data);
		};

		term.onData(function(key) {
			//Enter
			let msg = {
				data:{data:key},
				type:1
			}
			ws.send(key);
		});
	}
}

Factory.register('Wterm', Wterm);

