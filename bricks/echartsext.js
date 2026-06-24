var bricks = window.bricks || {};
bricks.bug = true;
bricks.EchartsExt = class extends bricks.VBox {
/*
	{
		title:
		description:
		pie_optiosn:
		data_url:
		nameField:
		valueField:
		serieField:
		valueFields:
		data_params:
		data:[]
	}
	event:element_click

	*/
	constructor(opts){
		super(opts);
		if(!this.idField) this.idField = 'id';
		if(!this.nameField) this.nameField = 'name';
		if(!this.valueFields) this.valueFields = ['value'];
		// === 新增：处理 refresh_period ===
		this.refresh_period = opts.refresh_period; // 单位：秒
		this._refresh_timer = null;

		this.build_title_widget();
		this.build_description_widget();
		this.holder = new bricks.Filler({});
		this.add_widget(this.holder);
		this.chart = echarts.init(this.holder.dom_element);
		if (this.user_data){
			this.render_data(this.user_data)
		} else if (this.data_url) {
			schedule_once(this.render_urldata.bind(this), 0.1);
		}
		this.bind('element_resize', this.chart.resize.bind(this.chart));
		// === 启动定时刷新（如果配置了 refresh_period）===
		if (this.refresh_period && this.data_url) {
			this.start_auto_refresh();
		}
	}
    // === 启动自动刷新任务 ===
    start_auto_refresh() {
		if (this._refresh_timer) return; // 防止重复启动

		const doRefresh = () => {
			if (!this.is_in_dom()) {
				console.log('EchartsExt: widget not in DOM, stop auto-refresh');
				this._refresh_timer = null;
				return;
			}
			this.render_urldata().then(() => {
				// 继续下一轮
				if (this._refresh_timer) { // 检查是否已被取消
					this._refresh_timer = setTimeout(doRefresh, this.refresh_period * 1000);
				}
			}).catch(err => {
				console.error('Auto-refresh failed:', err);
				if (this.is_in_dom()) {
					this._refresh_timer = setTimeout(doRefresh, this.refresh_period * 1000); // 失败也重试
				} else {
					this._refresh_timer = null;
				}
			});
		};

		// 初始延迟后开始第一轮，之后循环
		this._refresh_timer = setTimeout(doRefresh, this.refresh_period * 1000);
	}

	// === 停止自动刷新 ===
	stop_auto_refresh() {
		if (this._refresh_timer) {
			clearTimeout(this._refresh_timer);
			this._refresh_timer = null;
		}
	}

	// === 覆盖 destroy 方法，清理定时器 ===
	destroy() {
		this.stop_auto_refresh(); // 清理资源
		if (this.chart) {
			this.chart.dispose();
			this.chart = null;
		}
		super.destroy();
	}

	pivotify(data){
		var series = [];
		data.forEach(x => {
			if (series.indexOf(x[this.serieField]) == -1){
				series.push(x[this.serieField]);
			}
		});
		data.sort( (x, y) => {
			if(x[this.nameField] > y[this.nameField]) return 1;
			if(x[this.nameField] < y[this.nameField]) return -1;
			return 0;
		});
		var ndic = {}
		for (var i=0;i<data.length;i++){
			var k = data[i][this.nameField];
			if( !ndic[k] ){
				ndic[k] = {
				};
				ndic[k][this.nameField] = data[i][this.nameField];
			}
			ndic[k][data[i][this.serieField]] = data[i][this.valueField];
		}
		var nd = Object.values(ndic);
		nd.sort( (x, y) => {
			if(x[this.nameField] > y[this.nameField]) return 1;
			if(x[this.nameField] < y[this.nameField]) return -1;
			return 0;
		});
		return nd;
	}
	get_series(data){
		if (!this.serieField){
			return null;
		}
		var series = [];
		data.forEach(x => {
			if (series.indexOf(x[this.serieField]) == -1){
				series.push(x[this.serieField]);
			}
		});
		return series;
	}
	render_data(){
		var data = this.user_data;
		if (this.serieField){
			if (!this.valueField) this.valueFields[0];
			this.valueFields = this.get_series(data);
			data = this.pivotify(data);
		}
		var opts = this.setup_options(data);
		opts.grid = {
			left: '3%',
			right: '3%',
			bottom: '3%',
			containLabel: true
		};
		if (this.valueFields.length>1 && opts.legend ){
			opts.legend.data = this.valueFields;
		}
		console.log('opts=', opts);
		this.chart.setOption(opts);
		this.chart.on('click', this.click_handle.bind(this));
	}
	click_handle(params){
		console.log('params=', params);
		this.dispatch('element_click', this.user_data[params.dataIndex]);
	}
	async render_urldata(params){
		if (! params) params = {};
		var _params = bricks.extend({}, this.data_params);
		_params = bricks.extend(_params, params);
		var jc = new bricks.HttpJson();
		var d = await jc.httpcall(this.data_url, {method:this.method || 'GET', params:_params});
		if (d){
			this.user_data = d;
			this.render_data();
		}
	}
}

