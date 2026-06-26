var bricks = window.bricks || {};

bricks.BaseRunning = class extends bricks.HBox {
	/*
	{
		"icon"
	}
	*/
	constructor(opts){
		if (! opts.cwidth) opts.width = 'auto';
		if (! opts.cheight) opts.cheight = 2;
		super(opts);
		this.icon_w = new bricks.Icon({
			height: '100%',
			width: 'auto',
			url:opts.icon || bricks_resource('imgs/running.gif')
		});
		this.time_w = new bricks.Text({
			text:'00:00:00',
			color:'#222',
			wrap:false,
			i18n:false
		});
		this.time_start = new Date().getTime();
		this.add_widget(this.icon_w);
		this.add_widget(this.time_w);
		this.showtime_task = schedule_interval(this.show_timepass.bind(this), 0.05);
	}
	
	show_timepass(){
		var t = new Date().getTime() - this.time_start;
		var txt = bricks.formatMs(t, 1);
		this.time_w.set_text(txt);
	}
	stop_timepass(){
		if (this.showtime_task){
			clearInterval(this.showtime_task);
			this.showtime_task = null;
		}
	}
}

bricks.Running = class extends bricks.BaseModal {
	/*
	{
		target:
		icon:
	}
	*/
	constructor(opts){
		opts.auto_open = true;
		opts.archor = 'cc';
		super(opts);
		this.w = new bricks.BaseRunning({icon:opts.icon});
		this.add_widget(this.w);
	}
	dismiss(){
		this.w.stop_timepass();
		bricks.BaseModal.prototype.dismiss.bind(this)();
	}
}

bricks.Factory.register('Running', bricks.Running);
