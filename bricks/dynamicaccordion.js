var bricks = window.bricks || {};
bricks.AccordionItem = class extends bricks.VBox {
	constructor(opts){
		super(opts);
		this.set_css('accordion-item');
	}
}

bricks.AccordionInfo = class extends bricks.FHBox {
	constructor(opts){
		super(opts);
		this.set_css('accordion-item-info');
	}
}

bricks.DynamicAccordion = class extends bricks.VScrollPanel {
	/*
		{
			"data_url",
			"data_method",
			"cache_limit",
			"page_rows",
			"row_cheight":1.5
			"record_view"
			"content_rely_on"
			"content_rely_value"
			"editable"
			"fields":
			"record_toolbar",
			"record_toolbar_collapsable"
			"header"
			"content_view"
		}
	*/
	constructor(opts){
		super(opts);
		this.row_cheight = opts.row_cheight || 1.5;
		// this.set_style('overflow', 'auto');
		this.loader = new bricks.PageDataLoader({
			url:this.opts.data_url,
			params:this.opts.data_params,
			pagerows:this.opts.page_rows,
			method:this.opts.data_method,
			cache_pages:this.opts.cache_limit
		});
		this.old_params = null;
		this.active_item = null;
		this.active_content = null;
		this.loading = false;
		schedule_once(this.build_all.bind(this), 0.1);
	}
	async build_all(){
		if (this.title){
			this.build_title();
		}
		if (this.description){
			this.build_description();
		}
		await this.build_toolbar();
		await this.build_header();
		var filler = new bricks.Filler();
		this.container = new bricks.VScrollPanel({ });
		filler.add_widget(this.container);
		this.add_widget(filler);
		this.container.bind('min_threshold', this.load_previous_page.bind(this));
		this.container.bind('max_threshold', this.load_next_page.bind(this));
		await this.render();
	}
	build_title(){
		var w = new bricks.Title3({
			otext:this.title,
			i18n:true,
			wrap:true,
			dynsize:true,
			halign:'left'
		});
		this.add_widget(w);
	}
	build_description(){
		var w = new bricks.Text({
			otext:this.description,
			i18n:true,
			wrap:true,
			dynsize:true,
			halign:'left'
		});
		this.add_widget(w);
	}
	build_toolbar(){
		this.toolbar_w = new bricks.IconTextBar(this.toolbar);
		this.add_widget(this.toolbar_w);
	}
	async build_header(){
		this.header_w = await this.build_item();
		this.add_widget(this.header_w);
		/* 
		var w = await this.build_item();
		w.set_style('position', 'sticky');
		w.set_style('top', 0);
		return w;
		*/
	}
	async build_item(record){
		var item  = new bricks.AccordionItem({});
		var info = await this.build_info(item, record);
		var content = new bricks.VBox({
			height:'auto',
			display:'none'
		});
		var build_content = true;
		if (!record){
			build_content = false;
		} else {
			if (this.content_rely_on){
					var v = this.content_rely_value || true;
					if(record[this.content_rely_on] != v){
							build_content = false;
					}
			}
		}
		content.set_css('accordion-item-content');
		content.hide();
		if (record){
			info.bind('click', 
				this.line_clicked.bind(this, info, content, record));
		}
		item.add_widget(content);
		return item;
	}

	async build_info(item, record){
		if (! this.fields && !record){
			return;
		}
		var w;
		var tb = null;
		var info = new bricks.AccordionInfo({cheight:this.cheight});
		info.user_data = record;
		item.add_widget(info);
		tb = this.build_record_toolbar(info, record);
		if (! record){
			record = {};
			for (var i=0;i<this.fields.length;i++){
				var f = this.fields[i];
				record[f.name] = f.label || f.name;
			}
		}
		w = await bricks.widgetBuild(this.record_view, info, record);
		if (w){
			if (tb){
			w.add_widget(tb, 0);
			}
			info.add_widget(w);
		} else {
			bricks.debug('bricks.widgetBuild(), tmpl=', this.record_view, 'record=', record);
		}       
		return info;
	}
	add_record(info){
		var w = info.parent;
		var hided;
		var content = w.children[1];
		content.clear_widgets();
		var hided = content.is_hide();
		var fields = this.fields;
		if (this.data_params){
			for (var k in this.data_params){
				fields.push({
					name:k,
					value:this.data_params[k],
					uitype:'hide'
				});
			}
		}
		var f = new bricks.Form({
				"cheight":this.editable.form_cheight||7,
				"submit_url":this.editable.new_data_url,
				"fields":fields
		});
		f.bind('cancel', this.add_record_abort.bind(this, info));
		content.add_widget(f, 0);
		content.show();
		f.bind('submited', this.add_record_finish.bind(this, info));
	}
	async add_record_abort(info, event){
		var content = info.parent.children[1];
		content.hide();
		content.clear_widgets();
	}
	async add_record_finish(info, event){
		var resp = event.params;
		var desc = await resp.json();
		var w = await bricks.widgetBuild(desc);
		console.log(resp, desc, w);
		var content = info.parent.children[1];
		content.hide();
		this.render();
	}
	update_record(info, record){
		console.log('update_record():info=', info)
		var w = info.parent;
		var hided;
		var content = w.children[1];
		content.clear_widgets();
		var fields = [];
		for (var i=0; i< this.fields.length; i++){
			var f = bricks.extend({}, this.fields[i]);
			f.value = record[f.name];
			fields.push(f);
		}
		var f = new bricks.Form({
				"cheight":this.editable.form_cheight||7,
				"submit_url":this.editable.update_data_url+'?id=' + record.id,
				"fields":fields
		});
		content.add_widget(f, 0);
		f.bind('submited', this.update_record_finish.bind(this, info, content, f));
		f.bind('cancel', this.update_cancel.bind(this, info, content));
		content.show();
	}
	update_cancel(info, content){
		content.clear_widgets();
		content.hide();
	}
	async update_record_finish(info, content, form, event){
		content.remove_widget(form);
		content.hide();
		var resp = event.params;
		var desc = await resp.json();
		var w = await bricks.widgetBuild(desc);
		if (desc.widgettype == 'Message'){
			await this.renew_record_view(form, info);
		}
	}
	async renew_record_view(form, info){
		var d = form.getValue();
		var record = bricks.extend(info.user_data, d);
		var w = info.children[0];
		info.clear_widgets();
		var rtb = w.children[0];
		var w = await bricks.widgetBuild(this.record_view, info, record);
		w.add_widget(rtb, 0);
		info.add_widget(w);
	}
	delete_record(info, record){
		var conform_w = new bricks.Conform({
			target:this,
			title:'Delete conform',
			message:'Are you sure to delete is record?'
		});
		conform_w.bind('conformed', this.delete_record_act.bind(this, info, record));
		conform_w.bind('discard', conform_w.dismiss.bind(conform_w));
	}
	
	async delete_record_act(info, record){
		var url = this.editable.delete_data_url + '?id=' + record.id;
		var hc = new bricks.HttpJson();
		var desc = await hc.get(url);
		var w = await bricks.widgetBuild(desc);
		if (desc.widgettype == 'Message'){
			this.container.remove_widget(info.parent);
		}
	}
	async build_new_form(){
		var desc = {
			"widgettype":"VBox",
			"options":{
				"height":"auto",
			},
			"subwidgets":[
				{
					"id":"new",
					"widgettype":"IconBar",
					"options":{
						"tools":[
							{
								"name":"add",
								"tip":"add a new record",
								"icon":this.editable.add_icon || bricks_resource('imgs/add.svg')
							}
						]
					}
				},
				{
					"widgettype":"Form",
					"options":{
						"cheight":this.editable.form_cheight||7,
						"submit_url":this.editable.new_data_url,
						"fields":this.fields
					}
				}
			]
		};
		var w = await bricks.widgetBuild(desc, this);
		w.children[1].hide();
		w.children[0].bind('add',function(){ w.children[1].toggle_hide()})
		this.new_form = w.children[1];
		this.new_form.bind('submited', this.render.bind(this));
		this.add_widget(w);
	}
	async render(params) {
		params = params || {};
		if (params == this.old_params){
			return;
		}
		this.old_params = params;
		bricks.debug('params=', params, 'render() called');
		var d = await this.loader.loadData(params);
		if (d){
			this.container.clear_widgets();
			await this.dataHandle(d);
		} else {
			bricks.debug(params, 'load data return null');
		}
	}
	async dataHandle(d){
		var data = d.rows;
		var page = d.add_page;
		if (!data){
			return;
		}
		await this.renderAccordionItems(data, page);
		if (d.delete_page){
			this.delete_page(d.delete_page);
		}
	}
	build_record_toolbar(info, record){
		var c = new bricks.Layout({cwidth:2.5, height:'auto'})
		var desc;
		var edit_tools = [];
		if (this.record_toolbar){
			desc = bricks.extend({}, this.record_toolbar);
		} else {
			desc = {
				cwidth:2.5,
				tools:[]
			}
		}
		var event_names = [];
		for (var i=0;i<desc.tools.length;i++){
			event_names.push(desc.tools[i].name);
		}
		if (! record){
			var mytools = [];
			for (var i=0;i<desc.tools.length;i++){
				mytools.push({ name:'blankicon'});
			}
			if (this.editable){
				edit_tools = [
					{
						name:'add',
						tip:'add new record',
						icon:this.editable.add_icon || bricks_resource('imgs/add.svg')
					},
					{
						name:'blankicon'
					}
				];
				desc.tools = edit_tools.concat(mytools);
			} else {
				desc.tools = mytools;
			}
			var w = new bricks.IconBar(desc);
			if (this.editable){
				w.bind('add', this.add_record.bind(this, info, record));
			}
			c.add_widget(w);
			return c;
		} 
		if (this.editable){
			var edit_tools = [
				{
					name:"update",
					tip:"update record in this line",
					icon:this.editable.update_icon || bricks_resource('imgs/update.svg')
				},
				{
					name:'delete',
					tip:"delete record in this line",
					icon:this.editable.delete_icon || bricks_resource('imgs/delete.svg')
				}
			]
			desc.tools = edit_tools.concat(desc.tools);
		}
		var w = new bricks.IconBar(desc);
		if (this.editable){
			w.bind('update', this.update_record.bind(this, info, record));
			w.bind('delete', this.delete_record.bind(this, info, record));
		}
		for (var i=0;i<event_names.length;i++){
			w.bind(event_names[i], this.fire_event.bind(this, event_names[i], record));
		}
		c.add_widget(w);
		return c;
	}
	fire_event(event_name, data){
		this.dispatch(event_name, data);
	}
	async renderAccordionItems(data, page) {
		var pos;
		for (var i=0;i<data.length;i++){
			if (this.loader.is_max_page(page)){
				pos = -1;
			} else {
				pos = i;
			}
			var record = data[i];
			var item = await this.build_item(record);
			item.set_attribute('data-page', page);
			this.container.add_widget(item, pos);
		};
	}
	delete_page(page){
		var items = this.dom_element.querySelectorAll('[data-page="' + page + '"]');
		for (var i=0;i<items.length;i++) {
			var w = items[i].bricks_widget;
			this.container.remove_widget(w);
		}
	}
	select_line(info){
		if (this.select_row){
			this.select_row.unset_css('accordion-item-info-selected');
		}
		this.select_row = info;
		this.select_row.set_css('accordion-item-info-selected');
		this.dispatch('row_selected', info);
	}
	async line_clicked(info, content, record, event){
		this.select_line(info);
		if(! this.content_view){
			return;
		}
		this.toggle_content(info, content, record, event);
	}
	async toggle_content(info, content, record, event){
		if(! this.content_view){
			return;
		}
		var h = this.container.dom_element.offsetHeight  - 3 * info.dom_element.offsetHeight;
		content.set_style('height', h + 'px');
		if (this.active_content){
			if (this.active_content != content){
				this.active_content.clear_widgets();
				this.active_content.hide();
				this.active_content = null;
			}
		}
		content.toggle_hide();
		if (content.dom_element.style.display == 'none'){
			bricks.debug('content just collapsed');
			content.clear_widgets();
			this.active_content = null;
			return;
		}
		
		var w;
		w = await bricks.widgetBuild(this.content_view, content, record);
		if (w){
			content.add_widget(w);
			this.active_content = content;
		} else {
			this.active_content = null;
			content.hide();
		}
	}
	async load_previous_page(){
		if (this.loading){
			bricks.debug('this.loading is set, do not thing');
			return;
		}
		var running = new bricks.Running({target:this});
		this.loading = true;
		try {
			var d = await this.loader.loadPreviousPage();
			if (d){
				this.dataHandle(d);
				var total = this.container.dom_element.scrollHeight - this.container.dom_element.clientHeight;
				this.container.dom_element.scrollTop = d.pos_rate * total;
			} else {
				bricks.debug(this.loader, 'load previous page error');
			}
		} catch (e) {
			bricks.debug('e=', e);
		}
		this.loading = false;
		running.dismiss();
	}
	async load_next_page(){
		if (this.loading){
			bricks.debug('this.loading is set, do not thing');
			return;
		}
		var running = new bricks.Running({target:this});
		this.loading = true;
		try {
			var d = await this.loader.loadNextPage();
			if (d){
				this.dataHandle(d);
				var total = this.container.dom_element.scrollHeight - this.container.dom_element.clientHeight;
				this.container.dom_element.scrollTop = d.pos_rate * total;
			} else {
				bricks.debug(this.loader, 'load next page error');
			}
		} catch (e){
			bricks.debug('error happened', e);
		}
		this.loading = false;
		running.dismiss();
		bricks.debug('load_next_page() finished');
	}
}
bricks.Factory.register('DynamicAccordion', bricks.DynamicAccordion);
