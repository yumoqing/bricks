class Row {
	constructor(tree, rec){
		this.tree = tree;
		this.data = rec;
		this.freeze_cols = [];
		this.normal_cols = [];
		this.name_widgets = {};
		this.click_handler = this.tree.click_handler.bind(this.tree, this);
		if (this.tree.checkable){
		}
		if (this.tree.lineno){
		}
		for (var i=0;i<this.tree.fields.length;i++){
			var f = this.tree.fields[i];
			var opts = f.uioptions|| {};
			opts.update({
				name:f.name,
				label:f.label,
				uitype:f.uitype,
				value:rec[name],
				readonly
			});
			var w = Input.factory(opts);
			if (f.freeze){
				this.freeze_cols.push(w);
			} else {
				this.normal_cols.push(w);
			}
			this.name_widgets.update({f.name:w});
			w.bind('click', this.click_handler);
		}
		this.freeze_row = null;
		this.normal_row = null;
		if (this.freeze_cols.length > 0){
			this.freeze_row = HBox({height:'auto'})
			for (var i=0;i<this.freeze_cols.length;i++){
				this.freeze_row.add_widget(this.freeze_cols[i]);
			}
		}
		if (this.normal_cols.length > 0){
			this.normal_row = HBox({height:'auto'})
			for (var i=0;i<this.normal_cols.length;i++){
				this.normal_row.add_widget(this.normal_cols[i]);
			}
		}
	}
	
}

class DataGrid extends VBox {
	/*
	{
		dataloader:{
			page:
			rows:
			dataurl:
			method:
			params:
		}
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
		this.set_css('vbox');
		this.title = opts.title;
		this.description = opts.description;
		this.show_info = opts.show_info;
		this.admin = opts.admin;
		this.row_height = opts.row_height;
		this.fields = opts.fields;
		this.createParts();
		this.header_css = opts.header_css || 'grid_header';
		this.body_css = opts.body_css || 'grid_body';
		if (this.title){
			var tw = new Title1({otext:this.title, i18n:true});
			this.add_widget(tw);
		}
		if (this.description){
			var dw = new Text({otext:this.description, i18n:true});
			this.add_widget(dw);
		}
		if (this.admin){
			var desc = {
			};
			var tbw = new Toolbar(desc);
			this.add_widget(tbw);
		}
		this.create_grid();
		if (this.show_info){
			this.infow = new HBox({height:'40px'});
			this.add_widget(this.infow);
		}
	}
	create_parts(){
		this.freeze_fields = [];
		this.normal_fields = [];
		for (var i=0; i<this.fields.length; i++){
			f = this.fields[i];
			if (f.freeze) {
				this.freeze_fields.push(f);
			} else {
				this.normla_fields.push(f);
			}
		}
		this.freeze_part = null;
		this.normal_part = null;
		if (this.freeze_fields.length>0){
			this.freeze_part = new VBox({height:'auto'});
			this.freeze_header = new HBox({height:'auto'});
			this.freeze_body = new VScrollPanel({});
			this.freeze_part.add_widget(this.freeze_header);
			this.freeze_part.add_widget(this.freeze_body);
		}
		if (this.normal_fields.length>0){
			this.normal_part = new HScrollPanel({});
			this.normal_header = new HBox({height:'auto'});
			this.normal_body = new VScrollPanel({});
			this.normal_part.add_widget(this.normal_header);
			this.normal_part.add_widget(this.normal_body);
		}
	}
	create_header(){
		for (var i=0; i<this.freeze_fields; i++){
			var f = this.freeze_fields[i];
			var t = new Text({
					otext:f.label||f.name
					i18n:true,
			});
			if (f.width){
				t.dom_element.style.width = f.width
			}
			this.freeze_header.add_widget(t);
			t.element.column_no = 'f' + i;
		}
		for (var i=0; i<this.normal_fields; i++){
			var f = this.normal_fields[i];
			var t = new Text({
					otext:f.label||f.name
					i18n:true,
			});
			if (f.width){
				t.dom_element.style.width = f.width
			}
			this.normal_header.add_widget(t);
			t.element.column_no = 'n' + i;
		}
	}
}
