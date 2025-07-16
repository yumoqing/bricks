var bricks = window.bricks || {};
bricks.Accordion = class extends bricks.VBox {
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
		this.keyselectable = true;
		var item_size = this.opts.item_size || '25px';
		this.set_height('100%');
		var items = this.opts.items;
		this.w_items = [];
		this.subcontents = {};
		var item_css = this.opts.item_css || 'accordion' + '-button';
		var content_css = this.opts.content_css || 'accordion' + '-content';
		for (var i=0; i< items.length; i++){
			var opts = {
				name:items[i].name,
				icon:items[i].icon,
				label:items[i].label,
				height:'auto',
				orientation:'horizontal'
			}
			var b = new bricks.Button(opts);
			b.bind('click', this.change_content.bind(this));
			this.w_items.push(b);
			this.add_widget(b);
		}
		this.key_select_items = this.w_items;
		this.content = new bricks.Filler({});
		this.sub_container = new bricks.VScrollPanel({height:'100%'});
		this.content.add_widget(this.sub_container);
		this.w_items[0].dispatch('click');
	}
	async change_content(event){
		var refresh = false;
		var b = event.target.bricks_widget;
		var name = b.opts.name;
		this.select_item(b);
		bricks.debug('accordion: button=', b, 'name=', name);
		var pos = -1;
		for (var i=0; i< this.opts.items.length; i++){
			if (name == this.opts.items[i].name){
				pos = i;
				if (this.opts.items[i].refresh) refresh = true;
				break
			}
		}
		if (pos==-1){
			debug('Accordion():name=',name, 'not found in items',this.opts.items);
		}
		var c = objget(this.subcontents,name);
		if (refresh || ! c ){
			if (!this.opts.items[pos].content){
				console.log('***', pos, 'item dont has content');
				return;
			}
			c = await bricks.widgetBuild(this.opts.items[pos].content);
			this.subcontents[name] = c;
		}
		this.sub_container.clear_widgets();
		this.sub_container.add_widget(c);
		try {
			this.remove_widget(this.content);
		}
		catch(e){
			;
		}
		this.add_widget(this.content, pos+1);
	}
}

bricks.Factory.register('Accordion', bricks.Accordion);
