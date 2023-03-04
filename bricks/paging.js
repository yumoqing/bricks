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
	constructor(opts){
		this.url = opts.url;
		this.method = opts.method || 'GET';
		this.params = opts.params || {};
		this.buffer_pages = opts.buffer_pages || 5;
		this.pagerows = opts.pagerows || 60;
		this.cur_page = -1;
		this.buffer = {};
		this.total_record = -1;
		this.cur_params = {};
	}
	async loadData(params){
		this.cur_page = 1
		this.buffer = {};
		if (!params) params = {};
		var p = this.params.copy();
		p.update(params);
		this.cur_params = p;
		p.page = cur_page;
		p.rows = this.pagerows;
		return this.loadPage();
	}

	async _loadPage(page){
		if (this.in_buffer(page)){
			return buffer[page]
		}
		this.cur_page = page;
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
		this.buffer[page] = d;
		return d;
	}
	
	async getPage(page){
		this.cur_page = page;
		return await this.loadPage();
	}
	buffer_is_full(){
		var ks = Object.keys(this.buffer);
		if (ks.length>= this.buffer_pages){
			var p;
			if (this.direction == 'down'){
				p = Math.min(ks);
			} else {
				p = Math.max(ks);
			}
			this.buffer[p];
		}
	}

	async nextPage(){
		if (this.cur_page >= this.total_page){
			return;
		}
		this.direction = 'down';
		this.buffer_is_full();
		this.cur_page += 1;
		return await this._loadPage();
	}
	async previousPage(){
		if (this.cur_page == 1){
			return
		}
		this.direction = 'up';
		this.buffer_is_full();
		this.cur_page += 1;
		return await this._loadPage();
	}
}
