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
		this.chart = echarts.init(this.holder.dom_element);
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

