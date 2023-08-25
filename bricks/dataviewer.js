
class DataViewer extends VScrollPanel {
	/*
	opts={
		dataurl:
		pagerows:
		params:
		buffer_page:
		viewer_url: or
		viewer_tmpl:
	}
	*/
	constructor(opts){
		opts.width = '100%';
		super(opts);
		this.loader = new BufferedDataLoader(this, {
				pagerows: opts.pagerows || 80,
				buffer_pages: opts.buffer_pages || 5,
				url: opts.dataurl,
				method: opts.method || 'GET',
				params: opts.params
			});
		this.set_css('multicolumns');
		this.bind('min_threshold', 
					this.loader.previousPage.bind(this.loader))
		this.bind('max_threshold', 
					this.loader.nextPage.bind(this.loader))
		if (opts.viewer_tmpl){
			this.viewer_tmpl = opts.viewer_tmpl;
		}
		if (opts.viewer_url){
			this.get_tmpl_string();
		}
	}
	loadData(params){
		this.loader.loadData(params)
	}
	get_tmpl_string(){
		fetch(this.opts.viewer_url)
		.then(response => response.text())
		.then(data => {
			console.log('viewer_tmpl=', data);
			this.viewer_tmpl = data
			schedule_once(this.loader.loadData.bind(this.loader), 0.01);
		});
	}
	clear_data(){
		this.clear_widgets();
	}
	add_rows = async function(rows, direction){
		for (var i=0;i<rows.length;i++){
			await this.add_row(rows[i], direction);
		}
	}
	add_row = async function(row, direction){
		var s = obj_fmtstr(row, this.viewer_tmpl);
		var desc = JSON.parse(s);
		var w = await widgetBuild(desc, this);
		if (! w){
			console.log(desc, 'widgetBuild() failed...........');
			return;
		}
		w.row_data = row;
		var index = null;
		if (direction == 'down') index = 0;
		console.log('w=', w, 'this=', this);
		this.add_widget(w, index);
	}
}
Factory.register('DataViewer', DataViewer);
