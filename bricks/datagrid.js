class Row {
	constructor(tree, rec){
		this.tree = tree;
		this.data = rec;
		this.freeze_cols = [];
		this.normal_cols = [];
		this.name_widgets = {};
		this.click_handler = this.tree.click_handler.bind(this.tree, this);
		this.freeze_row = create_col_widgets(this.tree.freeze_fields, this.freeze_cols);
		this.normal_row = create_col_widgets(this.tree.normal_fields, this.normal_cols);
	}
	create_col_widgets(fields, cols){
		for (var i=0;i<fields.length;i++){
			var f = fields[i];
			var opts = f.uioptions|| {};
			opts.update({
				name:f.name,
				label:f.label,
				uitype:f.uitype,
				value:rec[name],
				readonly
			});
			var w = Input.factory(opts);
			cols.push(w);
			this.name_widgets[f.name] = w;
			w.bind('click', this.click_handler);
		}
		if (cols.length>0){
			var row = HBox({height:'auto'})
			for (var i=0;i<cols.length;i++){
				row.add_widget(cols[i]);
			}
			return row;
		}
		return null;
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
		admin:
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
	constructor(opts){
		super(opts);
		this.set_height('100%');
		this.set_width('100%');
		this.set_css('vbox');
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
		if (this.title){
			this.title_bar = new HBox({height:'auto'});
			this.add_widget(this.title_bar);
			var tw = new Title1({otext:this.title, i18n:true});
			this.title_bar.add_widget(tw);
		}
		if (this.description){
			this.descbar = new HBox({height:'auto'});
			this.add_widget(this.descbar);
			var dw = new Text({otext:this.description, i18n:true});
			this.descbar.add_widget(dw);
		}
		if (this.admin){
			var desc = {
				height:'auto',
				tools:[]
			};
			var tbw = new Toolbar(desc);
			this.add_widget(tbw);
		}
		this.create_parts();
		if (this.show_info){
			this.infow = new HBox({height:'40px'});
			this.add_widget(this.infow);
		}
		if (this.dataurl){
			this.loader = new BufferedDataLoader(this, {
				pagerows:80,
				buffer_pages:5,
				url:absurl(this.dataurl,this),
				methiod:this.method,
				params:this.params
			})
			schedule_once(this.loader.loadData.bind(this.loader), 0.01);
			if (this.freeze_body){
				this.freeze_body.bind('min_threshold', this.loader.nextPage.bind(this.loader));
				this.freeze_body.bind('max_threshold', this.loader.previousPage.bind(this.loader));
			}
			this.normal_body.bind('min_threshold', this.loader.nextPage.bind(this.loader));
			this.normal_body.bind('max_threshold', this.loader.previousPage.bind(this.loader));
		} else {
			if (this.data){
				this.add_rows(data);
			}
		}
	}
	del_old_rows(cnt, direction){
		if (this.freeze_body){
			if (direction == 'down'){
				this.freeze_body.remove_widgets_at_begin(cnt);
			} else {
				this.freeze_body.remove_widgets_at_end(cnt);
			}
		}
		if (direction == 'down'){
			this.normal_body.remove_widgets_at_begin(cnt);
		} else {
			this.normal_body.remove_widgets_at_end(cnt);
		}
	}
	add_rows(records, direction){
		var index = null;
		if (direction=='down'){
			index = 0
		}
		for (var i=0;i<records.length;i++){
			this.add_row(records[i], index);
		}
	}
	add_row(row, index){
		var row = new Row();
		this.freeze_body.add_widget(row.freeze_row, index);
		this.normal_body.add_widget(row.normal_row, index);
	}
	check_desc(){
		return {
			uitype:'check',
			name:'_check'
		}
	}
	lineno_desc(){
		return {
			uitype:'int',
			name:'_lineno',
			label:'lineno',
			width:'25px'
		}
	}
	create_parts(){
		var hbox = new HBox({});
		this.add_widget(hbox);
		this.freeze_fields = [];
		this.normal_fields = [];
		if (this.check){
			this.freeze_fields.push(this.check_desc());
		}
		if (this.lineno){
			this.freeze_fields.push(this.lineno_desc());
		}
		for (var i=0; i<this.fields.length; i++){
			var f = this.fields[i];
			if (f.freeze) {
				this.freeze_fields.push(f);
			} else {
				this.normal_fields.push(f);
			}
		}
		console.log('freeze_fields=', this.freeze_fields);
		console.log('normal_fields=', this.normal_fields);
		this.freeze_part = null;
		this.normal_part = null;
		if (this.freeze_fields.length>0){
			this.freeze_part = new VBox({height:'100%'});
			this.freeze_header = new HBox({height:'auto'});
			this.freeze_body = new VScrollPanel({});
			this.freeze_body.bind('scroll', this.coscroll.bind(this));
			this.freeze_part.add_widget(this.freeze_header);
			this.freeze_part.add_widget(this.freeze_body);
			hbox.add_widget(this.freeze_part);
		}
		if (this.normal_fields.length>0){
			this.normal_part = new HScrollPanel({});
			this.normal_header = new HBox({height:'auto'});
			this.normal_body = new VScrollPanel({});
			this.normal_part.add_widget(this.normal_header);
			this.normal_part.add_widget(this.normal_body);
			this.normal_body.bind('scroll', this.coscroll.bind(this));
			hbox.add_widget(this.normal_part);
		}
		this.create_header();
	}
	coscroll(event){
		var w = event.target;
		if (w==this.freeze_body){
			this.normal_body.dom_element.scrollTop = w.dom_element.scrollTop;
		} else if (w == this.normal_body && this.freeze_body){
			this.freeze_body.dom_element.scrollTop = w.dom_element.scrollTop;
		}
	}
			
	create_header(){
		for (var i=0; i<this.freeze_fields.length; i++){
			var f = this.freeze_fields[i];
			var t = new Text({
					otext:f.label||f.name,
					i18n:true,
			});
			if (f.width){
				t.dom_element.style.width = f.width
			}
			this.freeze_header.add_widget(t);
			t.dom_element.column_no = 'f' + i;
		}
		for (var i=0; i<this.normal_fields.length; i++){
			var f = this.normal_fields[i];
			var t = new Text({
					otext:f.label||f.name,
					i18n:true,
			});
			if (f.width){
				t.dom_element.style.width = f.width
			}
			this.normal_header.add_widget(t);
			t.dom_element.column_no = 'n' + i;
		}
	}
}

Factory.register('DataGrid', DataGrid);
