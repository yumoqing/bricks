class BufferedDataLoader {
	/*
	{
		url:
		method:
		params:
		buffer_pages:
		pagerows:
	}
	usage:
	var p = Paging({...});
	p.loadData(); // return page(1) data
	p.getPage(5); // return page(5) data
	p.nextPage()
	p.previousPage() 
	*/
	constructor(w, opts){
		this.widget = w;
		this.url = opts.url;
		this.loading = false
		this.method = opts.method || 'GET';
		this.params = opts.params || {};
		this.buffer_pages = opts.buffer_pages || 5;
		this.pagerows = opts.pagerows || 60;
		this.initial();
	}
	initial(){
		this.cur_page = -1;
		this.buffer = {};
		this.buffered_pages = 0;
		this.total_record = -1;
		this.cur_params = {};
	}
	async loadData(params){
		this.initial();
		this.widget.clear_data();
		this.buffer = {};
		if (!params) params = {};
		var p = this.params.copy();
		p.update(params);
		p.rows = this.pagerows;
		this.cur_params = p;
		this.cur_page = 1;
		return this.loadPage();
	}

	async loadPage(page){
		if (this.loading) return;
		this.loading = true;
		if (this.buffered_pages >= this.buffer_pages){
			this.widget.del_old_rows(this.pagerows, this.direction);
			this.buffered_pages -= 1;
		}
		var params = this.cur_params.copy();
		params.page = this.cur_page;
		params.rows = this.pagerows;
		var d = await jcall(this.url, {
					method:this.method,
					params:params});
		this.total_records = d.total;
		d.page = this.cur_page;
		d.total_page = this.total_records / this.pagerows;
		if (d.total_page * this.pagerows < this.total_record){
			d.total_page += 1;
		}
		this.total_page = d.total_page;
		this.widget.add_rows(d.rows, this.direction);
		this.buffered_pages += 1;
		this.loading = false;
		return d;
	}
	
	async nextPage(){
		if (this.loading) return;
		if (this.cur_page >= this.total_page){
			return;
		}
		this.direction = 'down';
		this.cur_page += 1;
		return await this.loadPage();
	}
	async previousPage(){
		if (this.loading) return;
		if (this.cur_page <= 1){
			return
		}
		this.direction = 'up';
		this.cur_page -= 1;
		return await this.loadPage();
	}
}
