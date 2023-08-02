class Row {
	constructor(dg, rec) {
		this.dg = dg;
		this.data = rec.copy();
		this.freeze_cols = [];
		this.normal_cols = [];
		this.name_widgets = {};
		this.click_handler = this.dg.click_handler.bind(this.dg, this);
		this.freeze_row = this.create_col_widgets(this.dg.freeze_fields, this.freeze_cols);
		if (this.freeze_row){
			// this.freeze_row.set_css('datagrid-row');
			this.freeze_row.set_style('width', this.freeze_width + 'px');
		}
		this.normal_row = this.create_col_widgets(this.dg.normal_fields, this.normal_cols);
		if (this.normal_row){
			// this.normal_row.set_css('datagrid-row');
			this.normal_row.set_style('width', this.normal_width + 'px');
		}
	}
	create_col_widgets(fields, cols) {
		for (var i = 0; i < fields.length; i++) {
			var f = fields[i];
			var opts = f.uioptions || {};
			var w;
			opts.update({
				name: f.name,
				label: f.label,
				uitype: f.uitype,
				width: f.width,
				required: true,
				row_data: this.data.copy(),
				readonly: true
			});
			if (opts.uitype == 'button') {
				opts.icon = f.icon;
				opts.action = f.action;
				opts.action.params = this.data.copy();
				opts.action.params.row = this;
				w = new Button(opts);
				w.data = this.opts.copy();
				w.bind('click', this.button_click
				buildEventBind(this.dg, w, 'click', opts.action);
			} else {
				opts.value = this.data[f.name],
					w = Input.factory(opts);
				w.bind('click', this.click_handler);
			}
			w.dom_element.style['min-width'] = w.width + 'px';
			w.set_style('flex', '0 0 ' + convert2int(f.width) + 'px');
			cols.push(w);
			this.name_widgets[f.name] = w;
		}
		if (cols.length > 0) {
			var row = new HBox({ height: 'auto' })
			for (var i = 0; i < cols.length; i++) {
				row.add_widget(cols[i]);
			}
			return row;
		}
		return null;
	}
	selected() {
		if (this.freeze_row) {
			this.freeze_cols.forEach(w => { w.set_css('selected', false) })
		}
		if (this.normal_row) {
			this.normal_cols.forEach(w => { w.set_css('selected', false) })
		}
	}
	unselected() {
		if (this.freeze_row) {
			this.freeze_cols.forEach(w => { w.set_css('selected', true) })
		}
		if (this.normal_row) {
			this.normal_cols.forEach(w => { w.set_css('selected', true) })
		}
	}
	toogle_select(e, f) {
		if (f) e.classList.add('selected');
		else e.classList.remove('selected');
	}
}

class DataGrid extends VBox {
	/*
	{
		data:
		dataurl:
		method:
		params:
		title:
		description:
		show_info:
		miniform:
		toolbar:
		tailer:
		row_height:
		header_css:
		body_css:
		fields:[
			{
				name:
				label:
				datatype:
				uitype:
				uioptions:
				freeze:
				width:
			}
		]
	}
	*/
	constructor(opts) {
		super(opts);
		this.loading = false;
		this.select_row = null;
		this.set_css('datagrid');
		this.dataurl = opts.dataurl;
		this.method = opts.method;
		this.params = opts.params;
		this.title = opts.title;
		this.check = opts.check || false;
		this.lineno = opts.lineno || false;
		this.description = opts.description;
		this.show_info = opts.show_info;
		this.admin = opts.admin;
		this.row_height = opts.row_height;
		this.fields = opts.fields;
		this.header_css = opts.header_css || 'grid_header';
		this.body_css = opts.body_css || 'grid_body';
		if (this.title) {
			this.title_bar = new HBox({ height: 'auto' });
			this.add_widget(this.title_bar);
			var tw = new Title1({ otext: this.title, i18n: true });
			this.title_bar.add_widget(tw);
		}
		if (this.description) {
			this.descbar = new HBox({ height: 'auto' });
			this.add_widget(this.descbar);
			var dw = new Text({ otext: this.description, i18n: true });
			this.descbar.add_widget(dw);
		}
		
		if (this.opts.miniform || this.opts.toolbar){
			this.admin_bar = new HBox({height:'auto'});
		}
		if (this.opts.miniform){
			this.miniform = new MiniForm(this.opts.miniform);
			this.miniform.bind('input', this.miniform_input.bind(this));
			this.admin_bar.add_widget(this.miniform);
		}
		if (this.opts.toolbar) {
			this.admin_bar.add_widget(new HFiller({}));
			self.toolbar = new Toolbar(this.opts.toolbar);
			self.toolbar.bind('command', this.command_handle.bind(this));
			this.admin_bar.add_widget(this.toolbar);
		}
		this.create_parts();
		if (this.show_info) {
			this.infow = new HBox({ height: '40px' });
			this.add_widget(this.infow);
		}
		if (this.dataurl) {
			this.loader = new BufferedDataLoader(this, {
				pagerows: 80,
				buffer_pages: 5,
				url: absurl(this.dataurl, this),
				methiod: this.method,
				params: this.params
			})
			schedule_once(this.loader.loadData.bind(this.loader), 0.01);
			if (this.freeze_body) {
				this.freeze_body.bind('min_threshold', this.loader.previousPage.bind(this.loader));
				this.freeze_body.bind('max_threshold', this.loader.nextPage.bind(this.loader));
			}
			this.normal_body.bind('min_threshold', this.loader.previousPage.bind(this.loader));
			this.normal_body.bind('max_threshold', this.loader.nextPage.bind(this.loader));
		} else {
			if (this.data) {
				this.add_rows(this.data);
			}
		}
	}
	clear_data(){
		if (this.normal_body)
			this.normal_body.clear_widgets();
		if (this.freeze_body)
			this.freeze_body.clear_widgets()
		this.selected_row = null;
	}
	miniform_input(event){
		var params = this.miniform.getValue();
		this.loadData(params);
	}
	loadData(params){
		this.loader.loadData(params)
	}
	command_handle(event){
	}
	del_old_rows(cnt, direction) {
		if (this.freeze_body) {
			if (direction == 'down') {
				this.freeze_body.remove_widgets_at_begin(cnt);
			} else {
				this.freeze_body.remove_widgets_at_end(cnt);
			}
		}
		if (direction == 'down') {
			this.normal_body.remove_widgets_at_begin(cnt);
		} else {
			this.normal_body.remove_widgets_at_end(cnt);
		}
	}
	add_rows(records, direction) {
		var index = null;
		if (direction == 'down') {
			index = 0
		}
		for (var i = 0; i < records.length; i++) {
			this.add_row(records[i], index);
		}
	}
	add_row(data, index) {
		var row = new Row(this, data);
		if (this.freeze_body)
			this.freeze_body.add_widget(row.freeze_row, index);
		if (this.normal_body)
			this.normal_body.add_widget(row.normal_row, index);
	}
	check_desc() {
		return {
			freeze:true,
			uitype: 'check',
			name: '_check',
			width: '20px'
		}
	}
	lineno_desc() {
		return {
			freeze:true,
			uitype: 'int',
			name: '_lineno',
			label: '#',
			width: '100px'
		}
	}
	create_parts() {
		this.freeze_width = 0;
		this.normal_width = 0;
		var hbox = new HBox({});
		hbox.set_css('datagrid-grid');
		this.add_widget(hbox);
		this.freeze_fields = [];
		this.normal_fields = [];
		if (this.check) {
			this.fields.push(this.check_desc());
		}
		if (this.lineno) {
			this.fields.push(this.lineno_desc());
		}
		for (var i = 0; i < this.fields.length; i++) {
			var f = this.fields[i];
			if (!f.width || f.width <= 0 ) f.width = 100;
			if (f.freeze) {
				this.freeze_fields.push(f);
				this.freeze_width += convert2int(f.width);
			} else {
				this.normal_fields.push(f);
				this.normal_width += convert2int(f.width);

			}
		}
		this.freeze_part = null;
		this.normal_part = null;
		console.log('width=', this.freeze_width, '-', this.normal_width, '...');
		if (this.freeze_fields.length > 0) {
			this.freeze_part = new VBox({});
			this.freeze_part.set_css('datagrid-left');
			this.freeze_part.set_style('width', this.freeze_width + 'px');
			this.freeze_header = new HBox({ height: this.row_height + 'px', width: this.freeze_width + 'px'});
			this.freeze_body = new VScrollPanel({ height: "100%", 
									width: this.freeze_width + 'px' })
			this.freeze_body.set_css('datagrid-body');
			this.freeze_body.bind('scroll', this.coscroll.bind(this));
		}
		if (this.normal_fields.length > 0) {
			this.normal_part = new VBox({ 
				width: this.normal_width + 'px',
				height:'100%',
				csses:"hscroll"
			});
			this.normal_part.set_css('datagrid-right');
			this.normal_header = new HBox({ height: this.row_height + 'px', width: this.normal_width + 'px'});
			// this.normal_header.set_css('datagrid-row');
			this.normal_body = new VScrollPanel({ 
				height:"100%",
				width: this.normal_width + 'px' 
			});
			this.normal_body.set_css('datagrid-body')
		}
		this.create_header();
		if (this.freeze_fields.length > 0) {
			this.freeze_part.add_widget(this.freeze_header);
			this.freeze_part.add_widget(this.freeze_body);
			hbox.add_widget(this.freeze_part);
		}
		if (this.normal_fields.length > 0) {
			this.normal_part.add_widget(this.normal_header);
			this.normal_part.add_widget(this.normal_body);
			this.normal_body.bind('scroll', this.coscroll.bind(this));
			this.normal_body.bind('min_threshold', this.load_previous_data.bind(this));
			this.normal_body.bind('max_threshold', this.load_next_data.bind(this));
			hbox.add_widget(this.normal_part);
		}
	}
	load_previous_data() {
		console.log('event min_threshold fired ........');
		this.loader.previousPage();
	}
	load_next_data() {
		console.log('event max_threshold fired ........');
		this.loader.nextPage();
	}
	coscroll(event) {
		var w = event.target.bricks_widget;
		if (w == this.freeze_body) {
			this.normal_body.dom_element.scrollTop = w.dom_element.scrollTop;
		} else if (w == this.normal_body && this.freeze_body) {
			this.freeze_body.dom_element.scrollTop = w.dom_element.scrollTop;
		}
	}

	create_header() {
		for (var i = 0; i < this.freeze_fields.length; i++) {
			var f = this.freeze_fields[i];
			var t = new Text({
				otext: f.label || f.name,
				i18n: true,
			});
			if (f.width) {
				t.set_style('flex','0 0 ' + convert2int(f.width) + 'px');
			} else {
				t.set_style('flex','0 0 100px');
			}
			this.freeze_header.add_widget(t);
			t.dom_element.column_no = 'f' + i;
		}
		for (var i = 0; i < this.normal_fields.length; i++) {
			var f = this.normal_fields[i];
			var t = new Text({
				otext: f.label || f.name,
				i18n: true,
			});
			if (f.width) {
				t.set_style('flex','0 0 ' + convert2int(f.width) + 'px');
			} else {
				t.set_style('flex','0 0 100px');
			}
			this.normal_header.add_widget(t);
			t.dom_element.column_no = 'n' + i;
		}
	}
	click_handler(row, event) {
		if (this.selected_row) {
			this.selected_row.unselected();
		}
		this.selected_row = row;
		this.selected_row.selected();
		this.dispatch('row_click', row);
		console.log('DataGrid():click_handler, row=', row, 'event=', event);
	}
}

Factory.register('DataGrid', DataGrid);
