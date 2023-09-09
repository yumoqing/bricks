class Accordion extends VBox {
	/* 
	{
		item_size:
		items:[
			{
				icon:
				text:
				content:{
					widgettype:
					...
				}
			}
		]
	}
	*/
	constructor(opts){
		super(opts);
		var item_size = this.opts.item_size || '25px';
		this.set_height('100%');
		var items = this.opts.items;
		this.items = [];
		this.subcontents = {};
		var item_css = this.opts.css || 'accordion' + '-button';
		var content_css = this.opts.css || 'accordion' + '-content';
		for (var i=0; i< items.length; i++){
			var opts = {
				name:items[i].name,
				icon:items[i].icon,
				text:items[i].text,
				height:'auto',
				orientation:'horizontal'
			}
			var b = new Button(opts);
			b.bind('click', this.change_content.bind(this));
			this.items.push(b);
			this.add_widget(b);
		}
		this.content = new VBox({});
	}
	async change_content(evnet){
		var b = event.target.bricks_widget;
		var name = b.opts.name;
		console.log('accordion: button=', b, 'name=', name);
		var pos = -1;
		for (var i=0; i< this.opts.items.length; i++){
			if (name == this.opts.items[i].name){
				pos = i;
				break
			}
		}
		if (pos==-1){
			debug('Accordion():name=',name, 'not found in items',this.opts.items);
		}
		var c = objget(this.subcontents,name);
		if (! c){
			c = await widgetBuild(this.opts.items[pos].content);
			this.subcontents[name] = c;
		}
		this.content.clear_widgets();
		this.content.add_widget(c);
		try {
			this.remove_widget(this.content);
		}
		catch(e){
			;
		}
		this.add_widget(this.content, pos+1);
	}
}

Factory.register('Accordion', Accordion);
