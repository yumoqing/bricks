var bricks = window.bricks || {};

bricks.ChartBar = class extends bricks.EchartsExt {
	/*
	{
		data_url,
		data_params,
		method,
		data,
		nameField,
		valueFields
	}
	*/
	values_from_data(data, name){
		var d = [];
		data.forEach(x => {
			d.push(x[name]);
		});
		return d;
	}
	
	lineinfo_from_data(data, name){
		return {
			name:name,
			type:'bar',
			data:this.values_from_data(data, name)
		}
	}
	setup_options(data){
		var n_data = [];
		var series = [];
		this.valueFields.forEach(v => {
			series.push(this.lineinfo_from_data(data, v));
		});
		data.forEach(d => {
			n_data.push(d[this.nameField]);
		});
		var opts = {
			tooltip:{
				trigger:'axis'
			},
			legend:{
				data:n_data
			},
			xAxis:{
				type:'category',
				data: n_data
			},
			yAxis:{
				type: 'value'
			},
			series:series
		}
		return opts;
	}
}

bricks.Factory.register('ChartBar', bricks.ChartBar);
