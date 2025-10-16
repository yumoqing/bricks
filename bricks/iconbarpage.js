var bricks = window.bricks || {};
bricks.IconbarPage = class extends bricks.VBox {
	/*
	opts={
		bar_opts:
		bar_at: top or bottom
	}
	bar_opts:{
		margin:
		rate:
		tools:
	}
	tools = [
		tool, ...
	]
	tool = {
		name:
		icon:
		label: optional
		tip,
		dynsize
		rate:
		content:
	}
	*/
	
	constructor(opts){
		opts.height = '100%'
		opts.bar_at = opts.bar_at || 'top';
		super(opts);
		var bar = new bricks.IconTextBar(this.bar_opts);
		this.content = new bricks.Filler({});
		if (this.bar_at == 'top'){
			this.add_widget(bar);
			this.add_widget(this.content);
		} else {
			this.add_widget(this.content);
			this.add_widget(bar);
		}
		bar.bind('command', this.command_handle.bind(this))
		schedule_once(this.show_content.bind(this, this.bar_opts.tools[0]), 0.1);
	}
	async command_handle(event){
		var tool = event.params;
		await this.show_content(tool);
	}
	async show_content(tool){
		var w = await bricks.widgetBuild(tool.content, this);
		if (w && ! w.parent) {
			this.content.clear_widgets();
			this.content.add_widget(w);
		}
	}
}

bricks.Factory.register('IconbarPage', bricks.IconbarPage);
