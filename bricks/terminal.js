
/*
need xterm.js
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm@4.19.0/css/xterm.css" />
<script src="https://cdn.jsdelivr.net/npm/xterm@4.19.0/lib/xterm.js"></script>
*/
class XTerminal extends JsWidget {
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
		schedule_once(this.open.bind(this), 0.1);
	}
	async open(){
		try {
			this.term = new Terminal({
				cursorBlink: "block"
			});
		}
		catch(e){
			console.log(e);
			return;
		}
		
		this.ws = new WebSocket(this.opts.ws_url, "echo-protocol");
		var curr_line = "";
		var entries = [];
		this.term.open(this.dom_element);
		this.term.write("web shell $ ");

		this.term.prompt = () => {
			if (curr_line) {
				let data = { method: "command", command: curr_line };
				this.ws.send(JSON.stringify(data));
			}
		};
		this.term.prompt();

		// Receive data from socket
		this.ws.onmessage = msg => {
		this.term.write("\r\n" + JSON.parse(msg.data).data);
		curr_line = "";
		};

		this.term.on("key", function(key, ev) {
		//Enter
		if (ev.keyCode === 13) {
		  if (curr_line) {
			entries.push(curr_line);
			this.term.write("\r\n");
			this.term.prompt();
		  }
		} else if (ev.keyCode === 8) {
		  // Backspace
		  if (curr_line) {
			curr_line = curr_line.slice(0, curr_line.length - 1);
			this.term.write("\b \b");
		  }
		} else {
		  curr_line += key;
		  this.term.write(key);
		}
		});

		// paste value
		this.term.on("paste", function(data) {
		curr_line += data;
		this.term.write(data);
		});
	}
}

Factory.register('XTerminal', XTerminal);

