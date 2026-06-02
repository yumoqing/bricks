var bricks = window.bricks || {};
bricks.DataViewer = class extends bricks.VBox {
	constructor(opts){
		opts.width = '100%';
		opts.height = '100%';
		opts.overflow = 'hidden';
		super(opts);
		this.loader = new bricks.PageDataLoader({
			url:this.opts.data_url,
			params:this.opts.data_params,
			pagerows:this.opts.page_rows,
			method:this.opts.data_method,
			cache_pages:this.opts.cache_limit
		});
		this.old_params = null;
		this.select_row = null;
		this.active_item = null;
		this.loading = false;
		this.data_offset = 0;
		this.search_keyword = this.get_initial_search_keyword();
		this.keyselectable = true;
		this.bind('row_check_changed', this.show_check_event_data.bind(this));
		schedule_once(this.build_all.bind(this), 0.1);
	}
	set_key_select_items(){
		if (!this.scrollpanel) return;
		var items = this.scrollpanel.children;
		this.key_select_items = items.filter(i => i != items[0]);
	}
	async build_all(){
		this.build_title_widget();
		this.build_description_widget();
		this.build_toolbar_widget();
		this.build_searchbar_widget();
		this.build_records_area();
		await this.build_other();
		this.check_changed_row = null;
		this.scrollpanel.bind('min_threshold', this.load_previous_page.bind(this));
		this.scrollpanel.bind('max_threshold', this.load_next_page.bind(this));
		await this.render();
		this.set_key_select_items();
		bricks.debug_obj = this.scrollpanel;
	}
	async build_other(){
	}
	async render(params) {
		params = this.merge_search_params(params || {});
		if (params == this.old_params){
			return;
		}
		this.old_params = params;
		bricks.debug('params=', params, 'render() called');
		var d = await this.loader.loadData(params);
		if (d){
			this.scrollpanel.clear_widgets();
			await this.before_data_handle();
			await this.dataHandle(d);
		} else {
			bricks.debug(params, 'load data return null');
		}
	}
	async before_data_handle(){
	}
	async dataHandle(d){
		var data = d.rows;
		var page = d.add_page;
		if (!data){
			return;
		}
		await this.renderPageData(data, page);
		if (d.delete_page){
			this.delete_page(d.delete_page);
		}
	}
	build_records_area(){
		this.filler_widget = new bricks.Filler({});
		this.add_widget(this.filler_widget)
		this.scrollpanel = new bricks.VScrollPanel({});
		this.filler_widget.add_widget(this.scrollpanel);
	}
	get_initial_search_keyword(){
		if (!this.searchable){
			return '';
		}
		if (this.search_value != null){
			return this.search_value;
		}
		if (typeof this.searchable == 'object' && this.searchable.value != null){
			return this.searchable.value;
		}
		return '';
	}
	build_searchbar_widget(){
		if (!this.searchable){
			return;
		}
		var opts = {};
		if (typeof this.searchable == 'object'){
			opts = bricks.extend(opts, this.searchable);
		}
		opts.width = opts.width || this.search_width || '100%';
		opts.placeholder = opts.placeholder || this.search_placeholder;
		opts.value = opts.value || this.search_value || this.search_keyword || '';
		opts.search_label = opts.search_label || this.search_label;
		opts.clear_label = opts.clear_label || this.clear_label;
		this.searchbar_w = new bricks.SearchBar(opts);
		this.searchbar_w.bind('search', this.search_event_handle.bind(this));
		this.add_widget(this.searchbar_w);
	}
	merge_search_params(params){
		var merged = bricks.extend({}, params || {});
		if (this.searchable){
			var search_param = this.search_param || 'keyword';
			if (this.search_keyword){
				merged[search_param] = this.search_keyword;
			} else {
				delete merged[search_param];
			}
		}
		/* data_filter: send the filter JSON + collected var values */
		if (this.opts.data_filter){
			merged['data_filter'] = JSON.stringify(this.opts.data_filter);
			var filter_values = this.filter_values || {};
			for (var k in filter_values){
				if (filter_values[k] !== '' && filter_values[k] !== null && filter_values[k] !== undefined){
					merged[k] = filter_values[k];
				}
			}
		}
		return merged;
	}
	async search_event_handle(event){
		var d = event.params || {};
		this.search_keyword = d.keyword || '';
		this.old_params = null;
		this.select_row = null;
		this.active_item = null;
		this.data_offset = 0;
		if (this.loader){
			this.loader.pages = [];
		}
		await this.render({});
	}
	async renderPageData(data, page){
		var pos;
		if (! this.loader.is_max_page(page)){
			data.reverse();
			pos = this.data_offset;
		} else {
			pos = null;
		}
		
		for(var i=0; i<data.length;i++){
			var rec = data[i];
			await this.build_row(rec, page, pos);
		}
	}
	async build_record_view(record){
		/* will be overwrite by subclass */
		var w = new bricks.VBox({width: '100px',height:'100px'});
		w.set_css('test_box');

		return w;
	}
	async build_row(record, page, pos){
		var r = await this.build_record_view(record);
		r.set_attribute('data-page', page);
		this.scrollpanel.add_widget(r, pos);
	}
	show_check_event_data(event){
		var d = event.params;
		console.log('row_check_changed event data=', d);
	}
	build_toolbar_widget(){
		var edit_names = [];
		var tbdesc = {
			width:'auto',
			tools:[]
		}
		if (this.editable){
			tbdesc.tools = [
				{
					name:'add',
					tip:'add new record',
					icon:this.editable.add_icon || bricks_resource('imgs/add.svg')
				},
				{
					name:'update',
					tip:'update selected record',
					selected_row:true,
					icon:this.editable.update_icon || bricks_resource('imgs/edit.svg')
				},
				{
					name:'clone',
					tip:'clone selected record',
					selected_row:true,
					icon:this.editable.clone_icon || bricks_resource('imgs/clone.svg')
				},
				{
					name:'delete',
					tip:'delete selected record',
					selected_row:true,
					icon:this.editable.delete_icon || bricks_resource('imgs/delete.svg')
				}
			];
			tbdesc.tools.forEach(t => {
				edit_names.push(t.name);
			});
		}
		/* data_filter: add search tool to toolbar */
		if (this.opts.data_filter){
			tbdesc.tools.push({
				name:'filter',
				label: this.opts.filter_label || '搜索',
				tip: 'filter records',
				icon: this.opts.filter_icon || bricks_resource('imgs/search.svg')
			});
		}
		if (this.toolbar){
			this.toolbar.tools.forEach(t => {
				if (! edit_names.includes(t.name) && t.name !== 'filter'){
					tbdesc.tools.push(t);
				}
			});
		}
		if (tbdesc.tools.length == 0){
			return;
		}
		this.toolbar_w = new bricks.IconTextBar(tbdesc);
		this.add_widget(this.toolbar_w);
		this.toolbar_w.bind('command', this.command_event_handle.bind(this));
	}
	async command_event_handle(event){
		var tdesc = event.params;
		if (tdesc.selected_row && ! this.select_row){
			bricks.show_error({title:'Error', message:'need select a row'});
			return;
		}
		if (tdesc.name == 'add'){
			await this.add_record();
			return;
		}
		if (tdesc.name == 'update'){
			await this.update_record(this.select_row);
			return;
		}
		if (tdesc.name == 'clone'){
			await this.clone_record(this.select_row);
			return;
		}
		if (tdesc.name == 'delete'){
			this.delete_record(this.select_row);
			return;
		}
		if (tdesc.name == 'filter'){
			await this.show_filter_form();
			return;
		}
		var data = null;
		if (this.select_row){
			var r = this.select_row;
			var data =  r.user_data;
		}
		console.log(tdesc.name, 'clicked ==================', tdesc.name, data)
		this.dispatch(tdesc.name, data);
	}
	/* Recursively extract {var, field, op} from data_filter JSON tree */
	get_filter_fields(){
		var fields = [];
		var self = this;
		var bf = this.opts.browserfields || (this.opts.row_options && this.opts.row_options.browserfields) || {};
		var alters = bf.alters || {};
		var labels = this.opts.filter_labels || {};

		function extract(node){
			if (!node || typeof node !== 'object') return;
			var keys = Object.keys(node);
			for (var i = 0; i < keys.length; i++){
				var key = keys[i];
				var val = node[key];
				if (key === 'AND' || key === 'OR'){
					if (Array.isArray(val)){
						val.forEach(extract);
					}
				} else if (key === 'NOT'){
					extract(val);
				} else if (key === 'field'){
					if (node.var){
						var alter = alters[node.field] || {};
						var f = {
							name: node.var,
							label: labels[node.var] || node.field,
							op: node.op || '='
						};
						if (alter.uitype === 'code'){
							f.uitype = 'code';
							f.data = [];
							// 检查是否已有空选项
							var hasEmpty = alter.data && alter.data.some(d => 
								d.value === '' || d.value === null || d.value === undefined
							);
							if (!hasEmpty) {
								f.data.push({value: '', text: ''});
							}
							if (alter.data && Array.isArray(alter.data)){
								f.data = f.data.concat(alter.data);
							}
							if (alter.dataurl){
								f.dataurl = alter.dataurl;
								f.datamethod = alter.datamethod || 'GET';
								f.dataparams = alter.dataparams || {};
							}
							if (alter.data_field){
								f.data_field = alter.data_field;
							}
						} else if (alter.uitype === 'select' && alter.options){
							f.uitype = 'code';
							f.data = [];
							// 检查是否已有空选项
							var hasEmpty = alter.options && alter.options.some(d => 
								d.value === '' || d.value === null || d.value === undefined
							);
							if (!hasEmpty) {
								f.data.push({value: '', text: ''});
							}
							f.data = f.data.concat(alter.options);
						} else {
							f.uitype = 'str';
						}
						fields.push(f);
					}
					return;
				}
			}
		}
		extract(this.opts.data_filter);
		return fields;
	}
	async show_filter_form(){
		var fields = this.get_filter_fields();
		var submit_url = this.opts.data_url || '';
		var form_opts = {
			submit_url: '#',
			width: '100%',
			height: '100%',
			fields: fields
		};
		var form = new bricks.Form(form_opts);
		var popup = new bricks.PopupWindow({
			title: this.opts.filter_title || '搜索过滤',
			icon: bricks_resource('imgs/search.svg'),
			widget: this,
			archor: 'cc',
			movable: true,
			resizable: true,
			width: '50%',
			height: 'auto'
		});
		form.bind('cancel', popup.dismiss.bind(popup));
		form.bind('submited', this.filter_form_submited.bind(this, popup, form));
		popup.add_widget(form);
		popup.open();
	}
	async filter_form_submited(popup, form, event){
		popup.dismiss();
		this.filter_values = form._getValue();
		this.old_params = null;
		this.select_row = null;
		this.active_item = null;
		this.data_offset = 0;
		if (this.loader){
			this.loader.pages = [];
		}
		await this.render({});
	}
	get_edit_fields(){
		var fs = this.row_options.fields;
		this.fields = [];
		var exclouded = [];
		if (this.row_options.editexclouded){
			exclouded = this.row_options.editexclouded;
		}
		fs.forEach(f => {
			if (!exclouded.includes(f.name)){
				this.fields.push(f);
			}
		});
	}
	record_check_changed(event){
		this.check_changed_row = event.params;
		this.dispatch('row_check_changed', event.params.user_data);
	}
	async renew_record_view(form, row){
		var d = form._getValue();
		d = form._getValue();
		var record = bricks.extend(row.user_data, d);
		row.renew(record);
	}
	get_hidefields(){
		var fs = [];
		var params = this.data_params || {};
		for (var k in params){
			fs.push({name:k, value:params[k], uitype:'hide'});
		}
		return fs;
	}
	build_add_form(){
		var hidefields = [];
		var submit_url = this.editable.new_data_url;
		var opts= {
			submit_url: submit_url,
			width: '100%',
			height: '100%'
		};
		var fs = this.get_hidefields();
		for (var i=0;i<this.fields.length;i++){
			var f = bricks.extend({}, this.fields[i]);
			fs.push(f);
		}
		opts.fields = fs
		var formw = new bricks.Form(opts);
		return formw;
	}
	build_update_form(data){
		var hidefields = [];
		var submit_url = this.editable.update_data_url;
		var opts = {
			submit_url: submit_url,
			submit_changed:true,
			width: '100%',
			height: '100%'
		};
		var fs = this.get_hidefields();
		for (var i=0;i<this.fields.length;i++){
			var f = bricks.extend({}, this.fields[i]);
			f.value = data[f.name];
			fs.push(f);
		}
		fs.push({name:'id', value:data.id, uitype:'hide'})
		opts.fields = fs
		var formw = new bricks.Form(opts);
		return formw;
	}
	build_clone_form(data){
		var hidefields = [];
		var submit_url = this.editable.new_data_url;
		var opts = {
			submit_url: submit_url,
			width: '100%',
			height: '100%'
		};
		var fs = this.get_hidefields();
		for (var i=0;i<this.fields.length;i++){
			var f = bricks.extend({}, this.fields[i]);
			f.value = data[f.name];
			fs.push(f);
		}
		opts.fields = fs
		var formw = new bricks.Form(opts);
		return formw;
	}
	build_window(icon, title, form){
		var f = new bricks.PopupWindow({
				"title": title,
				"icon": icon,
				"widget":this,
				"archor":"cc",
				"movable":true,
				"resizable":true,
				"archor":"cc",
				"width":"90%",
				"height":"70%"
		});
		form.bind('cancel', f.dismiss.bind(f));
		f.add_widget(form);
		f.open();
		return f
	}
	async add_record(){
		var icon = bricks_resource('imgs/add.svg');
		var title = bricks.app.i18n._("Add record");
		var form = this.build_add_form();
		var win = this.build_window(icon, title, form);
		form.bind('submited', this.add_record_finish.bind(this, win));
	}
	async add_record_finish(f, event){
		f.dismiss();
		this.render();
		var resp = event.params;
		var desc = await resp.json();
		var w = await bricks.widgetBuild(desc);
	}
	async update_record(){
		var record = this.select_row.user_data;
		var icon = bricks_resource('imgs/edit.svg');
		var title = bricks.app.i18n._("Update record");
		var form = this.build_update_form(record);
		var win = this.build_window(icon, title, form);
		form.bind('submited', this.update_record_finish.bind(this, win, form));
	}
	async update_record_finish(win, form, event){
		await this.renew_record_view(form, this.select_row);
		var resp = event.params;
		var desc = await resp.json();
		var w = await bricks.widgetBuild(desc);
		w.open();
		win.dismiss();
	}
	async clone_record(){
		var record = this.select_row.user_data;
		var icon = bricks_resource('imgs/clone.svg');
		var title = bricks.app.i18n._("Clone record");
		var form = this.build_clone_form(record);
		var win = this.build_window(icon, title, form);
		form.bind('submited', this.add_record_finish.bind(this, win));
	}
	delete_record(row, record){
		var conform_w = new bricks.Conform({
			cwidth:16,
			cheight:9,
			target:this,
			title:'Delete conform',
			message:'Are you sure to delete is record?'
		});
		conform_w.bind('conformed', this.delete_record_act.bind(this, row, record));
		conform_w.bind('discard', conform_w.dismiss.bind(conform_w));
	}
	
	async delete_record_act(){
		var id = this.select_row.user_data.id;
		var url = this.editable.delete_data_url;
		var hc = new bricks.HttpJson();
		var desc = await hc.post(url, {
			params:this.select_row.user_data
		});
		var w = await bricks.widgetBuild(desc);
		if (desc.widgettype == 'Message'){
			this.scrollpanel.remove_widget(this.select_row);
			this.select_row = null;
			this.render();
		}
	}
	async load_previous_page(){
		// console.log('tabular:load_previous_page() called');
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
				var total = this.scrollpanel.dom_element.scrollHeight - this.scrollpanel.dom_element.clientHeight;
				this.scrollpanel.dom_element.scrollTop = d.pos_rate * total;
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
		// console.log('tabular:load_next_page() called');
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
			//	var total = this.scrollpanel.dom_element.scrollHeight - this.scrollpanel.dom_element.clientHeight;
			//	this.scrollpanel.dom_element.scrollTop = d.pos_rate * total;
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
	delete_page(page){
		var items = this.dom_element.querySelectorAll('[data-page="' + page + '"]');
		for (var i=0;i<items.length;i++) {
			var w = items[i].bricks_widget;
			this.scrollpanel.remove_widget(w);
		}
	}
}

bricks.Factory.register('DataViewer', bricks.DataViewer);
