var bricks = window.bricks || {};

bricks.ProgressBar = class extends bricks.HBox {
	/*
	options:
		total_value
		bar_cwidth
	event:
	*/
	constructor(opts){
		super(opts);
		this.set_css('progress-container');
		this.text_w = new bricks.Text({text:'0%', cheight:this.bar_cwidth||2});
		this.text_w.set_css('progress-bar')
		this.add_widget(this.text_w);
	}
	set_value(v){
		var pzt =  (current / total) * 100;
		pzt = Math.max(0, Math.min(100, percentage));
		this.text_w.set_style('width', pzt + '%')
	}
}
bricks.Factory.register('ProgressBar', bricks.ProgressBar);

