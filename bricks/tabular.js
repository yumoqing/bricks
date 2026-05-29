var bricks = window.bricks || {};
bricks.Tabular = class extends bricks.DataViewer {
	constructor(opts){
		super(opts);
		this.bind('row_check_changed', this.show_check_event_data.bind(this));
	}
	async build_other(){
		this.get_edit_fields();
	}
	async before_data_handle(){
		await this.build_header_row();
		this.data_offset = 1;
	}
	async build_header_row(){
		var options = bricks.extend({cheight:this.cheight}, this.row_options);
		var dr = new bricks.DataRow(options);
		dr.render(false);
		dr.set_css('tabular-header-row');
		this.scrollpanel.add_widget(dr);
	}
	async build_record_view(record){
		var r = await this.build_info(record);
		if (!this.content_view){
			r.user_data = record;
			r.bind('click', this.record_clicked.bind(this, r, record));
			return r;
		}
		var row = new bricks.VBox({
		});
		row.add_widget(r);
		var content = new bricks.VBox({
			height:'auto',
			display:'none'
		});
		row.add_widget(content);
		r.bind('click', this.record_clicked.bind(this, row, record));
		row.rec_widget = r;
		row.content_widget = content;
		row.user_data = record;
		return row
	}
	async record_clicked(row, record, event){
		var r = event.target.bricks_widget;
		// Prevent click on interactive elements (links, buttons, inputs) from triggering selection
		var target = event.target;
		if (target && (target.tagName === 'A' || target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')) {
			return;
		}
		
		var old_select_row = this.select_row;
		if (old_select_row){
			this.select_row = null;
			if (this.content_view){
				await this.toggle_content(old_select_row, false);
				old_select_row.rec_widget.set_css('tabular-row-selected', true);
			} else {
				old_select_row.set_css('tabular-row-selected', true);
			}
		}
		if (old_select_row != row){
			this.select_row = row;
			if (this.content_view){
				row.rec_widget.set_css('tabular-row-selected');
				await this.toggle_content(row, true);
			} else {
				row.set_css('tabular-row-selected');
			}
			this.dispatch('row_selected', row.user_data);
		}
	}
	async toggle_content(row, flag){
		if (flag){
			row.content_widget.show();
			row.content_widget.clear_widgets();
			var desc = objcopy(this.content_view);
			desc = bricks.apply_data(desc, row.user_data);
			var w = await bricks.widgetBuild(desc, row.content_widget);
			if (w){
				row.content_widget.add_widget(w);
			}
		} else {
			row.content_widget.hide();
			row.content_widget.clear_widgets();
		}
	}
	get_edit_fields(){
		var fs = this.row_options.fields;
		this.fields = [];
		var exclouded = [];
		if (this.row_options.editexclouded){
			exclouded = this.row_options.editexclouded;
		}
		fs.forEach(f => {
			if (!exclouded.includes(f.name)){
				this.fields.push(f);
			}
		});
	}

	async build_info(record){
		var header = true;
		var options = bricks.extend({cheight:this.cheight}, this.row_options);
		if (record){
			options.user_data = record;
			header = false;
		}
		var dr = new bricks.DataRow(options);
		dr.set_css('tabular-row');
		dr.render(header);
		/*
		dr.event_names.forEach(e => {
			dr.toolbar_w.bind(e, this.record_event_handle.bind(this, e, record, dr));
		});
		*/
		dr.bind('check_changed', this.record_check_changed.bind(this));
		return dr;
	}
	record_check_changed(event){
		this.check_changed_row = event.params;
		this.dispatch('row_check_changed', event.params.user_data);
	}
	async renew_record_view(form, row){
		var d = form._getValue();
		var record = bricks.extend(row.user_data, d);
		if (this.content_view){
			row.rec_widget.renew(record);
		} else {
			row.renew(record);
		}
	}
	record_event_handle(event_name, record, row, item){
		console.log('event_name=', event_name, 'record=', record);
		this.dispatch(event_name, record);
	}
	get_hidefields(){
		var fs = [];
		var params = this.data_params || {};
		for (var k in params){
			fs.push({name:k, value:params[k], uitype:'hide'});
		}
		return fs;
	}
}

bricks.Factory.register('Tabular', bricks.Tabular);
