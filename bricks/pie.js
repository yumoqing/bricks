var bricks = window.bricks || {};

bricks.ChartPie = class extends bricks.EchartsExt {
	/*
	{
		title:
		description:
		legend:
		pie_optiosn:
		data_url:
		nameField:
		valueFields:
		data_params:
		data:[]
	}
	event:element_click

	*/
	constructor(opts){
		super(opts);
	}
	setup_options(data){
		var nd = [];
		data.forEach(d => {
			var x = {};
			x.value = d[this.valueFields[0]];
			x.name = d[this.nameField];
			nd.push(x);
		});
		var s_opts = bricks.extend({}, this.pie_options);
		s_opts.data = nd;
		var legend = this.legend || {};
		// legend.data = this.valueFields;
		var options = {
			legend:legend,
			tooltip:{
				trigger: 'item'
			},
			series:[
				s_opts
			]
		}
		return options;
	}
}

bricks.Factory.register('ChartPie', bricks.ChartPie);
