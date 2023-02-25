class Toolbar extends BoxLayout {
	/* toolbar options
	{
		orientation:
		target:
		tools:
	}
	tool options
	{
		icon:
		name:
		label:
	}

	event:
		ready: after all the tools built, fire this event
		command: after user click one of the tool will fire the event with params of the tools[i] object.
		remove: after user delete a removable tool from the toolbar, will fire the event with its tool description object as params. the params can reach with event.params.


	*/
	constructor(options){
		super(options);
		this.create('div');
		this.toolList = [];
		if (this.opts.orientation == 'vertical'){
			this.bar = new VBox(options);
			this.dom_element.classList.add('vtoolbar')
		} else {
			this.bar = new HBox(options);
			this.dom_element.classList.add('htoolbar')
		}
		this.add_widget(this.bar);
		this.preffix_css = this.opts.css || 'toolbar';
		schedule_once(this.createTools.bind(this), 0.01);
	}
	createTools = async function(){
		for (var i=0;i<this.opts.tools.length; i++){
			await this.createTool(this.opts.tools[i]);
		}
		this.dispatch('ready');
	}
	createTool = async function(desc){
		var options = {
			"widgettype":"HBox",
			"options":{},
			"subwidgets":[]
		}
		if (desc.icon){
			options.subwidgets.push({
				"widgettype":"Image",
				"options":{
					"source":desc.icon
				}
			})
		}
		options.subwidgets.push({
			"widgettype":"Text",
			"options":{
				"otext":desc.label||desc.name,
				"i18n":true
			}
		})
		var w = await widgetBuild(options);
		if (! w){
			console.log('Toolbar(): build widget failed', options);
			return
		}
		console.log('Toolbar():createTool(): w = ', w);
		w.dom_element.classList.add(this.preffix_css + '-button');
		w.bind('click', this.do_handle.bind(this, w));
		w.tool_opts = desc;
		this.add_removable(w);
		this.toolList.push(w);
		this.bar.add_widget(w);
		return w;
	}
	remove_item(w, event){
		this.bar.remove_widget(w);
		this.toolList.remove(w);
		w.unbind('click',this.do_handle.bind(this, w));
		this.dispatch('remove', w.tool_opts);
		event.preventDefault();
		event.stopPropagation();
	}
	do_handle(tool, event){
		// var tool = event.target;
		console.log('Toolbar() onclock,target=', event.target, tool);
		var e = new Event('command');
		var d = {};
		d.update(tool.tool_opts);
		if (this.opts.target){
			d.target = this.opts.target;
		}
		this.dispatch('command', d);

		for (var i=0;i<this.toolList.length;i++){
			this.toolList[i].dom_element.classList.remove(this.preffix_css + '-button-active');
		}
		tool.dom_element.classList.add(this.preffix_css + '-button-active');
	}
	add_removable(item){
		if (! item.tool_opts.removable) return;
		var img_src = currentScriptPath() + 'imgs/delete.png';
		var opts = {
			source:img_src,
			width:'24px',
			heigh:'24px'
		};
		var image = new Image(opts);
		if (image){
			item.add_widget(image);
			image.bind('click',this.remove_item.bind(this, item));
			console.log('Toolbar(): add_removable() for ', img_src);
		} else {
			console.log('Toolbar(): Image create error', img_src);
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

Factory.register('Toolbar', Toolbar);
