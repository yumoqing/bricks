var bricks = window.bricks || {};
bricks.PageDataLoader = class {
	/*
	options:
	{
		"url":
		"cache_pages":
		"pagerows":
		"method":
		"params":
	}
	usage:
	var p = new PageDataLoader({...});
	p.loadData(); // return page(1) data
	p.nextPage()
	p.previousPage() 

	*/
	constructor(options){
		this.data_url = options.url;
		this.base_params = options.params || {};
		this.rows = options.pagerows || 80;
		this.cache_pages = options.cache_pages || 5;
		this.method = options.method || 'GET';
		this.pages = [];
	}
	async loadData(params){
		params = params || {};
		this.pages = [];
		var _params = bricks.extend({}, this.base_params);
		this.params = bricks.extend(_params, params);
		return await this.loadPage(1);
	}
	is_max_page(p){
		return p == Math.max(...this.pages);
	}
	async loadNextPage(){
		var page = Math.max(...this.pages) + 1;
		if (page <= this.lastPage){
			var d = await this.loadPage(page);
			var p = this.pages.length - 1;
			d.pos_rate = p / this.pages.length;
			return d;
		}
	}
	async loadPreviousPage(){
		var page = Math.min(...this.pages) - 1;
		if (page > 0){
			var d = await this.loadPage(page);
			d.pos_rate = 1 / this.pages.length;
			return d;
		}
	}
	async loadPage(page) {
		if (this.pages.indexOf(page) == -1) {
			var jc = new bricks.HttpJson();
			var params = bricks.extend({}, this.params);
			params = bricks.extend(params,{
				page:page, 
				pagerows:this.rows
				rows:this.rows
			});
			var d = await jc.httpcall(this.data_url,{method:this.method, params:params});
			if (!d){
				bricks.debug(this.data_url,{params:params}, 'error');
				this.loading = false;
				return;
			}
			this.lastPage = Math.ceil(d.total / this.rows);
			d.last_page = this.lastPage;
			this.pages.push(page);
			d.add_page = page;
			// 检查缓存是否已满
			if (this.pages.length > this.cache_pages) {
				// 删除当前页最远的一页
				var max, min;
				max = Math.max(...this.pages);
				min = Math.min(...this.pages);
				const farthestPage = page == max? min : max;
				var idx = this.pages.indexOf(farthestPage);
				this.pages.splice(idx, 1);
				d.delete_page = farthestPage;
			}
			return d;
		} else {
			bricks.debug(page, 'already n buffer, do not thing');
		}
		return;
	}
}
