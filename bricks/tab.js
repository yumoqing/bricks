class TabPanel extends Layout {
	/*
	options
	{
		css:
		tab_wide:
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
	*/
	constructor(options){
		super(options);
		this.content_buffer = {};
		this.cur_tab_name = '';
		this.content_container = new VBox({});
		if (this.opts.tab_pos == 'top' ||  this.opts.tab_pos == 'bottom'){
			this.panel = new VBox({});
			var height = this.opts.tab_wide || '45px';
			this.tab_container = new VBox({height:height});
			this.tab_container.dom_element.style.width = this.opts.tab_long || '100%';
		} else {
			this.panel = new HBox({});
			var width= this.opts.tab_wide || '70px';
			this.tab_container = new VBox({width:width});
			this.tab_container.dom_element.style.height = this.opts.tab_long || '100%';
		}
		if (this.opts.tab_pos == 'top' || this.opts.tab_pos == 'left'){
			this.panel.add_widget(this.tab_container);
			this.panel.add_widget(this.content_container);
		} else {
			this.panel.add_widget(this.content_container);
			this.panel.add_widget(this.tab_container);
		}
		this.add_widget(this.panel);
		this.createToolbar();
		this.panel.dom_element.classList.add('tabpanel');
		this.content_container.dom_element.classList.add('tabpanel-content');
	}
	show_first_tab(){
		this.show_content_by_tab_name(this.opts.items[0].name);
	}
	show_content_by_tab_name(name){
		this.toolbar.click(name);
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
		this.toolbar = new Toolbar(desc);
		this.toolbar.bind('command', this.show_tabcontent.bind(this));
		this.toolbar.bind('remove', this.tab_removed.bind(this));
		this.toolbar.bind('ready', this.show_first_tab.bind(this));
		this.tab_container.add_widget(this.toolbar);
	}
	show_tabcontent = async function(event){
		var tdesc = event.params;
		var items = this.opts.items;
		if (tdesc.name == this.cur_tab_name){
			console.log('TabPanel(): click duplication click on same tab', tdesc)
			return;
		}
		for (var i=0;i<items.length;i++){
			if (tdesc.name == items[i].name){
				var w = get(this.content_buffer,tdesc.name);
				if (w && ! items[i].refresh){
					this.content_container.clear_widgets();
					this.content_container.add_widget(w);
					this.cur_tab_name = name;
					return;
				}
				var b = new Bricks();
				w = await b.widgetBuild(items[i].content);
				if (! w){
					console.log('TabPanel():create content error', items[i].content);
					return;
				}
				this.content_buffer[tdesc.name] = w;
				this.content_container.clear_widgets();
				this.content_container.add_widget(w);
				this.cur_tab_name = tdesc.name;
				return;
			}
		}
		console.log('TabPanel(): click event handled but noting to do', tdesc)
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

Factory.register('TabPanel', TabPanel);
