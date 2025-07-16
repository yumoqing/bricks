var bricks = window.bricks || {};
bricks.Toolbar = class extends bricks.Layout {
	/* toolbar options
	{
		orientation:
		target:
		interval::
		tools:
	}
	tool options
	{
		icon:
		name:
		label:
		css:
	}

	*/
	constructor(options){
		super(options);
		this.toolList = [];
		if (this.opts.orientation == 'vertical'){
			this.bar = new bricks.VScrollPanel(options);
			this.dom_element.classList.add('vtoolbar')
		} else {
			this.bar = new bricks.HScrollPanel(options);
			this.dom_element.classList.add('htoolbar')
		}
		this.bar.enable_key_select()
		this.add_widget(this.bar);
		this.clicked_btn = null;
		this.preffix_css = this.opts.css || 'toolbar';
		schedule_once(this.createTools.bind(this), 0.01);
	}
	add_interval_box(){
		if (this.opts.orientation == 'vertical'){
			this.bar.add_widget(new bricks.JsWidget({
						height:this.opts.interval || '10px'
			}));
		} else {
			this.bar.add_widget(new bricks.JsWidget({
						width:this.opts.interval || '10px'
			}));
		}
	}
	async createTools(){
		var l = this.opts.tools.length;
		for (var i=0;i<l; i++){
			await this.createTool(this.opts.tools[i]);
			if (i < l -1 ){
				this.add_interval_box();
			}
		}
	}
	async createTool(desc){
		var options = {
			"widgettype":"Button",
			"options":{
				width:"auto",
				orientation:"horizontal",
				flexShrink:0,
				icon:desc.icon,
				label:desc.label,
				name:desc.name,
				css:desc.css
			}
		};
		var w = await bricks.widgetBuild(options);
		if (! w){
			bricks.debug('Toolbar(): build widget failed', options);
			return
		}
		w.bind('click', this.do_handle.bind(this, w));
		w.tool_opts = desc;
		this.add_removable(w);
		this.toolList.push(w);
		this.bar.add_widget(w);
		return w;
	}
	remove_item(w, event){
		this.bar.remove_widget(w);
		this.bar.unselect_item(w);
		this.toolList.remove(w);
		w.unbind('click',this.do_handle.bind(this, w));
		this.dispatch('remove', w.tool_opts);
		event.preventDefault();
		event.stopPropagation();
	}
	do_handle(tool, event){
		// var tool = event.target;
		bricks.debug('Toolbar() onclick,target=', event.target, tool);
		var d = {};
		bricks.extend(d, tool.tool_opts);
		if (this.opts.target){
			d.target = this.opts.target;
		}
		this.bar.select_item(tool);
		this.dispatch('command', d);
		this.dispatch(tool.tool_opts.name, d);
		bricks.debug('event ', tool.tool_opts.name, ' fired ...')
		if (this.clicked_btn){
			this.clicked_btn.set_css(this.preffix_css + '-button-active', true);
		}
		tool.set_css(this.preffix_css + '-button-active');
		this.clicked_btn = tool;
	}
	add_removable(item){
		if (! item.tool_opts.removable) return;
		var img_src = bricks_resource('imgs/delete.svg');
		var image = new bricks.Svg({url:img_src});
		if (image){
			item.add_widget(image);
			image.bind('click',this.remove_item.bind(this, item));
			bricks.debug('Toolbar(): add_removable() for ', img_src);
		} else {
			bricks.debug('Toolbar(): Image create error', img_src);
		}
	}
	click(name){
		for (var i=0;i<this.toolList.length;i++){
			if (name==this.toolList[i].tool_opts.name){
				this.toolList[i].dom_element.click();
			}
		}
	}
}

bricks.Factory.register('Toolbar', bricks.Toolbar);
