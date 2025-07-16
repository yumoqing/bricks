var bricks = window.bricks || {};
/*
dependent on xterm.js
*/
bricks.Wterm = class extends bricks.JsWidget {
	/*
	{
		ws_url:
		ping_timeout:19
	}
	*/
	constructor(opts){
		super(opts);
		this.socket = null;
		this.ping_timeout = opts.ping_timeout || 19;
		schedule_once(this.open.bind(this), 0.5);
	}
	charsize_sizing(){
		var cs = bricks.app.charsize;
		this.term.setOption('fontSize', cs);
	}
	heartbeat(){
		if (this.socket.readyState != 1) return;
		this.socket.send('_#_heartbeat_#_');
		this.heartbeat_task = schedule_once(this.heartbeat.bind(this), 
								this.ping_timeout);
	}
	async open(){
		var term_options = this.term_options || {};
		var term = new Terminal(term_options);
		this.term = term;
		term.open(this.dom_element);
		var sessdata = bricks.app.get_session();
		var ws = new WebSocket(this.opts.ws_url, sessdata);
		this.socket = ws;

		this.fitAddon = new FitAddon.FitAddon()
		term.loadAddon(this.fitAddon)
		this.fitAddon.fit();
		this.charsize_sizing();
		this.bind('resize', this.term_resize.bind(this))
		ws.onmessage = event => {
			var msg = JSON.parse(event.data);
			console.log('ws msg=', msg);
			if (msg.data == '_#_heartbeat_#_'){
				console.log('connection alive');
			} else {
				term.write(msg.data);
			}
		};
		ws.onclose = (event) => {
			console.log('websocket closed:', event.code, '--', event.reason);
			if (this.heartbeat_task) {
				this.heartbeat_task.cancel();
				this.heartbeat_task = null;
			}
		};
		ws.onopen = () => {
			this.heartbeat_task = schedule_once(this.heartbeat.bind(this), 
							this.ping_timeout);
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
	}
	term_resize(){
		try {
			this.fitAddon.fit();
		} catch(e){
			console.log('resize error', e);
		}
	}
}

bricks.Factory.register('Wterm', bricks.Wterm);

