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
				height:item_size,
				item_size:item_size,
				name:items[i].name,
				icon:items[i].icon,
				text:items[i].text,
				orientation:'horizontal',
				css:item_css
			}
			var b = new Button(opts);
			b.set_height(item_size);
			b.bind('click', this.change_content.bind(this));
			this.items.push(b);
			this.add_widget(b);
		}
		this.content = new VBox({});
	}
	async change_content(evnet){
		var name = event.params.name;
		var pos = -1;
		for (var i=0; i< this.opts.items.length; i++){
			if (name == this.opts.items[i].name){
				pos = i;
				break
			}
		}
		var c = this.subcontents.get(name);
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
