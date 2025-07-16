var bricks = window.bricks || {};
bricks.TabPanel = class extends bricks.Layout {
	/*
	options
	{
		css:
		tab_long: 100%
		tab_pos:"top"
		items:[
			{
				name:
				label:"tab1",
				icon:
				removable:
				refresh:false,
				content:{
					"widgettype":...
				}
			}
		]
	}
	css:
		tab
		tab-button
		tab-button-active
		tab-button-hover
		tab-content
	
	events:
		switch: fired when switch content
		event data: actived content widget

	content wedget event:
		active: fired when the content event is switch to show
	*/
	constructor(options){
		super(options);
		this.content_buffer = {};
		this.cur_tab_name = '';
		this.content_container = new bricks.Filler({});
		if (this.opts.tab_pos == 'top' ||  this.opts.tab_pos == 'bottom'){
			this.set_css('vbox');
			this.tab_container = new bricks.VBox({
					height:'auto',
					width:'auto'
			});
		} else {
			this.set_css('hbox');
			this.tab_container = new bricks.VBox({
					width:'auto',
					height:'auto'
			});
		}
		if (this.opts.tab_pos == 'top' || this.opts.tab_pos == 'left'){
			this.add_widget(this.tab_container);
			this.add_widget(this.content_container);
		} else {
			this.add_widget(this.content_container);
			this.add_widget(this.tab_container);
		}
		this.createToolbar();
		this.set_css('tabpanel');
		this.content_container.set_css('tabpanel-content');
		this.show_first_tab();
	}
	show_first_tab(){
		this.toolbar.dispatch('command', this.opts.items[0]);
	}
	createToolbar(){
		var desc = {
			tools:this.opts.items
		};
		var orient;
		if (this.opts.tab_pos == 'top' || this.opts.tab_pos == 'bottom'){
			orient = 'horizontal';
		} else {
			orient = 'vertical';
		}
		desc.orientation = orient;
		this.toolbar = new bricks.Toolbar(desc);
		this.toolbar.bind('command', this.show_tabcontent.bind(this));
		this.toolbar.bind('remove', this.tab_removed.bind(this));
		this.toolbar.bind('ready', this.show_first_tab.bind(this));
		this.tab_container.add_widget(this.toolbar);
	}
	async show_tabcontent(event){
		var tdesc = event.params;
		var items = this.opts.items;
		if (tdesc.name == this.cur_tab_name){
			bricks.debug('TabPanel(): click duplication click on same tab', tdesc)
			return;
		}
		for (var i=0;i<items.length;i++){
			if (tdesc.name == items[i].name){
				var w = objget(this.content_buffer, tdesc.name);
				if (w && ! items[i].refresh){
					this.cur_tab_name = name;
					this.switch_content(w);
					return;
				}
				try {
					if (items[i].content instanceof bricks.JsWidget){
						w = items[i].content;
					} else {
						w = await bricks.widgetBuild(items[i].content, this, {});
					}
					if (! w){
						bricks.debug('TabPanel():create content error', items[i].content);
						return;
					}
					this.content_buffer[tdesc.name] = w;
					this.cur_tab_name = tdesc.name;
					this.switch_content(w);
					return;
				}
				catch (e) {
					console.log('except ', e)
				}
			}
		}
		bricks.debug('TabPanel(): click event handled but noting to do', tdesc)
	}
	switch_content(w){
		this.content_container.clear_widgets();
		this.content_container.add_widget(w);
		this.dispatch('switch', w);
		w.dispatch('active');
	}
	add_tab(desc){
		var item = this.toolbar.createTool(desc);
		if (desc.removable){
			this.add_removeable(item);
		}
	}
	tab_removed(event){
		var desc = event.params;
		if (this.content_buffer.hasOwnProperty(desc.name))
			delete this.content_buffer[desc.name];
		
		if (desc.name == this.cur_tab_name){
			this.show_first_tab();
		}
	}
}

bricks.Factory.register('TabPanel', bricks.TabPanel);
