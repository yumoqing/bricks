bricks = window.bricks || {}

bricks.Cols = class extends bricks.VBox {
	/*
	{
		data_url:
		data_params:
		data_method:
		col_width:
		col_cwidth:
		record_view:{
		}
	}
	event:
		record_click
	*/
	constructor(opts){
		super(opts);
		this.loading = false;
		this.loader = new bricks.PageDataLoader({
			url:this.opts.data_url,
			params:this.opts.data_params,
			pagerows:this.opts.page_rows,
			method:this.opts.data_method,
			cache_pages:this.opts.cache_limit
		});
		this.select_record = null;
		this.container = new bricks.VScrollPanel({width:"100%"});
		this.container.set_css('filler');
		this.container.bind('min_threshold', this.load_previous_page.bind(this));
		this.container.bind('max_threshold', this.load_next_page.bind(this));
		if (this.title){
			this.title_w = new bricks.Title4({
				i18n:true,
				otext:this.title,
				dynsize:true
			});
			this.add_widget(this.title_w);
		}
		if (this.description){
			this.desc_w = new bricks.MdWidget({mdtext:this.description});
			this.add_widget(this.desc_w);
		}
		if (this.toolbar){
			this.toolbar_w = new bricks.Toolbar(this.toolbar);
			this.add_widget(this.toolbar_w);
			this.toolbar_w.bind('command', this.command_handle.bind(this));
		}
		this.add_widget(this.container);
		this.create_main_widget();
		schedule_once(this.load_first_page.bind(this), 0.5);
	}
	command_handle(event){
		var params = event.params;
		this.dispatch(params.name);
	}

	async handle_click(rw, event){
		event.stopPropagation();
		var orev = null;
		if (this.select_record){
			orev = this.select_record;
			this.select_record.set_css('selected_record', true);
			this.select_record = null;
			if (rw == orev) return;
		}
		this.select_record = rw;
		this.select_record.set_css('selected_record');
		console.log('record data=', rw.user_data);
		this.dispatch('record_click', rw.user_data);
	}

	async dataHandle(d){
		var data = d.rows;
		var page = d.add_page;
		if (!data){
			return;
		}
		var rev = ! this.loader.is_max_page(page);
		if (rev){
			data.reverse();
		}
		for (var i=0;i<data.length;i++){
			var r = data[i];
			var w = await bricks.widgetBuild(this.record_view, this.main, r);
			w.user_data = r;
			w.bind('click', this.handle_click.bind(this, w));
			w.set_attribute('data-page', page);
			if (rev){
				this.main.add_widget(w, 0);
			} else {
				this.main.add_widget(w);
			}
		}
		if (d.delete_page){
			this.delete_page(d.delete_page);
		}
	}
	delete_page(page){
		var items = this.dom_element.querySelectorAll('[data-page="' + page + '"]');
		for (var i=0;i<items.length;i++) {
			var w = items[i].bricks_widget;
			this.main.remove_widget(w);
		}
	}
	create_main_widget(){
		this.container.clear_widgets();
		this.main = new bricks.DynamicColumn({
			width:"100%", 
			col_cwidth:this.col_cwidth,
			mobile_cols:this.mobile_cols || 2
		});
		this.container.add_widget(this.main);
	}
	async show_with_data(data){
		this.data = data;
		this.data_url = null;
		await load_first_page(params);
	}
	async load_first_page(params){
		var running = null;
		try {
			var d;
			running = new bricks.Running({target:this});
			if (this.data_url){
				if (this.loading){
					bricks.debug('this.loading is set, do not thing');
					throw 't';
				}
				this.loading = true;
				var p = bricks.extend({}, this.data_params);
				if (params){
					p = bricks.extend(p, params);
				}
				var d = await this.loader.loadData(p);
			} else {
				if (this.data) {
					d = this.data;
				}
			}
			if (d){
				this.main.clear_widgets();
				this.dataHandle(d);
				var total = this.container.dom_element.scrollHeight - this.container.dom_element.clientHeight;
				// this.container.dom_element.scrollTop = d.pos_rate * total;
			} else {
				bricks.debug(this.loader, 'data is null');
			}
		} catch (e) {
			bricks.debug('e=', e);
		}
		this.loading = false;
		if (running) running.dismiss();
	}

	async load_previous_page(){
		if(! this.data_url) return;
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
		if(! this.data_url) return;
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
				// this.container.dom_element.scrollTop = d.pos_rate * total;
			} else {
				console.log(this.loader, 'load next page error');
			}
		} catch (e){
			console.log('error happened', e);
		}
		this.loading = false;
		running.dismiss();
		bricks.debug('load_next_page() finished');
	}
}
bricks.Factory.register('Cols', bricks.Cols);
