
class AG_Grid extends JsWidget {
	/*
		{
			dataurl:
			fields:

		}
	*/
	constructor(opts){
		super(opts);
		ag_opts = {}
	}
	
	init(){
		this.datasource = {
			getRows:this.getRows,
			startRow
		this.ag_opts.columnDefs = [];
		this.ag_opts.rowModelType = 'infinite';
		this.ag_opts.maxConcurrentDatasourceRequests: 1,
		this.ag_opts.datasource = this.datasource;
		for (var i=0; i< this.opts.fields.length; i++){
			var f = {
				width:this.opts.fields[i].width | 100,
				headerName:this.opts.fields[i].label|this.opts.fields[i].name,
				field:this.opts.fields[i].name
			},
			this.ag_opts.columnDefs.push(f)
		}
		this.ag_opts.defaultColDef = {sortable: true, filter: true};
		this.ag_opts.rowSelection = 'multiple';
		this.ag_opts.animateRows = true;
		this.ag_opts.onCellClicked = this.cell_clicked.bind(this);
		this.aggrid = new agGrid.Grid(this.dom_element, this.ag_opts);
		fetch(this.opts.dataurl)
        .then(response => response.json())
        .then(data => {
          // load fetched data into grid
          this.ag_opts.api.setRowData(data);
        });
	}
	cell_clicked(params){
		console.log('clicked, params=', params);
	}
}
