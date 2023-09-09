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
		console.log('FitAddon=', FitAddon);
		this.fitAddon = new FitAddon.FitAddon()
		term.loadAddon(this.fitAddon)
		// this.fitAddon.fit()
		this.bind('resize', this.term_resize.bind(this))
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
		term.focus();
		term.paste("ls -l\n");
	}
	term_resize(){
		try {
			this.fitAddon.fit();
		} catch(e){
			console.log('resize error', e);
		}
	}
}

Factory.register('Wterm', Wterm);

