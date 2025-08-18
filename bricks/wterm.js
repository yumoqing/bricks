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
		schedule_once(this.open.bind(this), 1);
	}
	charsize_sizing(){
		var cs = bricks.app.charsize;
		this.term.setOption('fontSize', cs);
	}
	send_term_size(){
		try {
			console.log('resize():rows=', this.term.rows, this.term.cols);
			this.socket.send(JSON.stringify({ type: "resize", 
						width:this.get_width(),
						height: this.get_height(),
						rows: this.term.rows, 
						cols: this.term.cols }));
		} catch (e) {
			console.log('ws not ready');
		}
	}
	send_data(d){
		this.socket.send(JSON.stringify({type: "input", "data":d}));
	}
	send_heartbeat(){
		this.socket.send(JSON.stringify({ type: "heartbeat"  }));
	
	}
	heartbeat(){
		if (this.socket.readyState != 1) return;
		this.send_heartbeat();
		this.heartbeat_task = schedule_once(this.heartbeat.bind(this), 
								this.ping_timeout);
	}
	async close(){
		this.term.close();
		this.socket.close();
	}
	async open(){
		var term_options = bricks.extend({width: "100%", height: "100%"}, this.term_options);
		var term = new Terminal(term_options);
		this.term = term;
		term.open(this.dom_element);
		// var sessdata = bricks.app.get_session();
		// var ws = new WebSocket(this.opts.ws_url, sessdata);
		var ws = new WebSocket(this.opts.ws_url);
		this.socket = ws;

		this.fitAddon = new FitAddon.FitAddon()
		term.loadAddon(this.fitAddon)
		this.fitAddon.fit();
		this.charsize_sizing();
		ws.onmessage = event => {
			var msg = JSON.parse(event.data);
			console.log('ws msg=', msg);
			if (msg.data.type  == 'heartbeat'){
				console.log('connection alive');
			} else if (msg.data.type == 'data') {
				term.write(msg.data.data);
			} else {
				console.log('get server data = ', msg.data);
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
			this.send_term_size();
			this.bind('element_resize', this.term_resize.bind(this))
			this.heartbeat_task = schedule_once(this.heartbeat.bind(this), 
							this.ping_timeout);
		};
		term.onData((key) => {
			console.log('key=', key);
			this.send_data(key);
		});
		term.onResize(({cols, rows}) =>{
			this.send_term_size();
		});
		term.focus();
	}
	term_resize(){
		try {
			console.log('widget resize event fired');
			this.fitAddon.fit();
			// this.send_term_size();
		} catch(e){
			console.log('resize error', e);
		}
	}
}

bricks.Factory.register('Wterm', bricks.Wterm);

