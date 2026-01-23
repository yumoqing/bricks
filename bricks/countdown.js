var bricks = window.bricks || {};

bricks.formatTime = function(seconds) {
	let hrs = Math.floor(seconds / 3600);
	let mins = Math.floor((seconds % 3600) / 60);
	let secs = seconds % 60;

	return [
		hrs.toString().padStart(2, '0'),
		mins.toString().padStart(2, '0'),
		secs.toString().padStart(2, '0')
	].join(':');
}
bricks.TimePassed = class extends bricks.VBox {
	constructor(opts){
		super(opts);
		this.seconds = 0;
		var t = bricks.formatTime(this.seconds);
		this.text_w = new bricks.Text({
			text:this.t, 
			rate:this.text_rate
		});
		this.add_widget(this.text_w);
	}
	start(){
		this.task = schedule_once(this.add_one_second.bind(this), 1);
	}
		
	add_one_second(){
		this.seconds += 1;
		var t = bricks.formatTime(this.seconds);
		this.text_w.set_text(t);
		this.task = schedule_once(this.add_one_second.bind(this), 1);
	}
	stop(){
		this.task.cancel();
		this.task = null;
	}
}
bricks.Countdown = class extends bricks.VBox {
	/* 
	options:
		limit_time: 01:00:00
		text_rate:
	event:
		timeout
		timeout event is fired after the countdown time is over.
	method:
		start
		start method is to start the countdown, step is 1 secord
	*/
	constructor(opts){
		super(opts);
		var parts = opts.limit_time.split(':');
		var hours, minutes, seconds;
		switch(parts.length){
			case 0:
				hours = 0;
				minutes = 0;
				seconds = 0;
				break;
			case 1:
				hours = 0;
				minutes = 0;
				seconds = parseInt(parts[0])
				break;
			case 2:
				hours = 0;
				minutes = 0;
				seconds = parseInt(parts[0])
				break;
			case 3:
			default:
				hours = parseInt(parts[0]);
				minutes = parseInt(parts[1]);
				seconds = parseInt(parts[2])
				break;
		}
		this.seconds = hours * 3600 + minutes * 60 + seconds;
		this.text_w = new bricks.Text({
			text:this.limit_time, 
			rate:this.text_rate
		});
		this.add_widget(this.text_w);
	}
	start(){
		schedule_once(this.time_down_second.bind(this), 1)
	}
	time_down_second(){
		if (this.seconds < 1){
			this.dispatch('timeout');
			return;
		}
		var h, m, s;
		this.seconds -= 1;
		var ts = bricks.formatTime(this.seconds);
		this.text_w.set_text(ts);
		schedule_once(this.time_down_second.bind(this), 1)
	}
}

bricks.Factory.register('Countdown', bricks.Countdown);
bricks.Factory.register('TimePassed', bricks.TimePassed);
