var bricks = window.bricks || {};
bricks.TreeNode = class extends bricks.VBox {
	constructor(tree, pnode, data){
		var opts = {
			width:'100%',
			height:'auto',
		}
		super(opts);
		this.tree = tree;
		this.parent_node = pnode;
		this.children_loaded = false;
		this.user_data = data;
		this.setup_icon_urls()
		this.is_leaf_field = this.tree.is_leafField || 'is_leaf';
		this.is_leaf = this.user_data[this.is_leaf_field];
		this.params = bricks.extend({}, this.tree.params)
		this.params = bricks.extend(this.params, {id:this.user_data[this.tree.opts.idField]});
		if (this.tree.opts.typeField){
			this.params.type = this.user_data[this.tree.opts.typeField];
		}
		var n = new bricks.HBox({
				height:this.tree.row_height,
				width:'100%'
		})
		n.dom_element.style.margin = bricks.app.charsize * 0.2;
		this.add_widget(n);
		n.bind('click', this.tree.node_click_handle.bind(this.tree, this));
		this.node_widget = n;
		schedule_once(this.create_node_content.bind(this,n), 0.01);
		if (! this.user_data.is_leaf) {
			this.container = new bricks.VBox({height:'auto'});
			this.add_widget(this.container);
			this.container.dom_element.style.marginLeft = bricks.app.charsize + 'px';
			if (this.user_data.children){
				this.tree.create_node_children(this, this.user_data.children);
			}
			this.container.hide();
		}
	}
	getValue(){
		var v = this.user_data;
		if (this.container){
			var children = [];
			for (var i=0; i<this.container.children.length;i++){
				var sv = this.container.children[i].getValue();
				children.push(sv);
			}
			v.children = children;
		}
		return v;
	}
	get_id(){
		return this.user_data[this.tree.idField];
	}
	selected(flg){
		if (flg){
			this.str_w.set_css('selected');
		} else {
			this.str_w.set_css('selected',true);
		}
	}
	async toggleExpandCollapse(event){
		if (event.params == 'open') {
			await this.expand();
		} else {
			this.collapse()
		}
	}

	async expand(){
		this.node_state = 'open';
		if (this.is_leaf){
			return;
		}
		if (this.tree.opts.dataurl && !this.is_leaf && !this.children_loaded){
			await this.tree.get_children_data(this)
			this.children_loaded = true;
		}
		this.container.show();
	}
	collapse(){
		this.node_state = 'close'
		if (this.is_leaf){
			return;
		}
		this.container.hide();
	}
	create_triple(){
		return new bricks.StatedSvg({
			state:'close',
			states:[
				{
					state: 'open',
					url: bricks_resource('imgs/node-expand.svg')
				},
				{
					state: 'close',
					url: bricks_resource('imgs/node-collapse.svg')
				}
			],
			rate: 1,
		});
	}
	change_node_type(){
		if (this.is_leaf){
			this.triple.set_state('close');
			this.triple.bind('state_changed', this.toggleExpandCollapse.bind(this));
			return;
			this.triple.set_url(null);
			this.triple.unbind('state_changed', this.toggleExpandCollapse.bind(this));
		} else {
			this.triple.set_state('close');
			this.triple.bind('state_changed', this.toggleExpandCollapse.bind(this));
		}
	}
	async create_node_content(widget){
		var img_size = bricks.app.charsize;
		this.triple = this.create_triple();
		widget.add_widget(this.triple);
		this.change_node_type();
		if (this.tree.checkField){
			var v = this.user_data[this.tree.checkField];
			this.check_w = new bricks.UiCheck({name:'check', value:v});
			widget.add_widget(this.check_w);
			this.check_w.bind('changed', this.tree.node_checked.bind(this.tree, this))
		}
		var icon_url;
		if ( isString(this.icons_urls)){
			icon_url = this.icons_urls;
		} else {
			icon_url = this.icons_urls.leaf;
			if (this.is_leaf) icon_url = this.icons_urls.leaf;
			else if (this.node_state == 'expand') this.icon_url = this.icons_urls.open;
			else this.icon_url = this.icons_urls.close;
		}
		console.log('icons=', this.icons_urls, 'icon_url=', icon_url, this.user_data);
		var img = new bricks.Svg({
			rate:1,
			url:icon_url
		});
		widget.add_widget(img);
		if (this.tree.node_view){
			this.view_w = await bricks.widgetBuild(this.tree.node_view, widget, this.user_data);
			if (this.view_w){
				widget.add_widget(this.view_w);
			}
		} else {
			var txt = this.user_data[this.tree.opts.textField];
			this.str_w = new bricks.Text({text:txt});
			widget.add_widget(this.str_w);
		}
	}
	async update_content(){
		if (this.tree.node_view){
			this.node_widget.remove_Widget(this.view_w);
			this.view_w = await bricks.widgetBuild(this.tree.node_view, widget, this.user_data);
			if (this.view_w){
				widget.add_widget(this.view_w);
			}
		}
		this.str_w.set_text(this.user_data[this.tree.opts.textField]);
	}
	setup_icon_urls(){
		var icons = null;
		if (this.tree.opts.typeField){
			var ntype = this.user_data[this.tree.opts.typeField];
			if (this.tree.node_typeicons){
				icons  = this.tree.node_typeicons[ntype];
				if (!icons){
					var dt = this.tree.node_typeicons.default_type;
					icons = this.tree.node_typeicons[dt];
				}
			}
			console.log('ntype=', ntype, 'icons=', icons, this.user_data, this.tree.opts.typeField);
		}
		if (! icons){
			icons = {
				open: bricks_resource('imgs/open-folders.svg'),
				close: bricks_resource('imgs/close-folder.svg'),
				leaf: bricks_resource('imgs/close-folder.svg')
			};
		}
		this.icons_urls = icons;
	}
}

bricks.Tree = class extends bricks.VScrollPanel {
	/*
	{
		row_height:
		idField:
		is_leafField:
		textField:
		type_icons:
		typeField:
		default_type:
		data:
		dataurl:
		node_typeicons:{
			nodetype:{
				open:url,
				close:url,
				leaf:url
			}
			default_type:
		},
		admin:{
			{
				addurl:
				deleteurl:
				updateurl:
				othertools:[
				]
			}
		}
	}
	*/
	constructor(options){
		super(options);
		this.row_height = this.opts.row_height || '35px';
		this.multitype_tree = this.opts.multitype_tree||false;
		this.selected_node = null;
		this.build_title();
		this.build_description();
		this.create_toolbar();
		this.checked_data = [];
		this.container = new bricks.VBox({
			"width":"100%",
			"height":"auto",
			"overflow":"auto"
		});
		this.add_widget(this.container);
		this.data_id = null;
		if (this.opts.dataurl){
			this.params = options.params || {};
			schedule_once(this.get_children_data.bind(this, this), 0.1);
		} else {
			this.user_data = {
				id:null,
				children:this.opts.data
			}
			this.create_node_children(this, this.opts.data);
		}
	}
	getValue(){
		var v = this.user_data;
		if (this.container){
			var children = [];
			for (var i=0; i<this.container.children.length;i++){
				var sv = this.container.children[i].getValue();
				children.push(sv);
			}
			v.children = children;
		}
		return v;
	}
	get_id(){
		return this.user_data[this.idField];
	}
	create_toolbar(){
		var toolbar = bricks.extend({}, this.toolbar);
		var tools = [];
		if (this.editable){
			tools.push({icon:bricks_resource('imgs/add.svg'), name:'add'});
			tools.push({icon:bricks_resource('imgs/edit.svg'), name:'update'});
			tools.push({icon:bricks_resource('imgs/delete.svg'), name:'delete'});
		}
		if (toolbar.tools){
			toolbar.tools.forEach(f => tools.push(f));
		}
		if (tools.length == 0){
			return;
		}
		toolbar.tools = tools;
		this.toolbar_w = new bricks.IconTextBar(toolbar);
		this.add_widget(this.toolbar_w);
		this.toolbar_w.bind('command', this.toolbar_command.bind(this))
	}
	toolbar_command(event){
		var opts = event.params;
		switch (opts.name){
			case 'add':
				this.add_new_node();
				break;
			case 'delete':
				this.delete_node();
				break;
			case 'update':
				this.update_node();
				break;
			default:
				if ((opts.selected_data || opts.checked_data) && ! this.selected_node){
					w = new bricks.Error({title:'Error', message:'No selected node found'});
					w.open();
					return;
				}
				console.log('opts=', opts);
				var d = null;
				if (opts.checked_data){
					d = this.checked_data
				} else if (opts.selected_data){
					d = this.selected_node.user_data
				}
				d.meta_data = {
					referer: this.id,
					title: opts.label,
					icon: opts.icon
				}
				this.dispatch(opts.name, d);
				break;
		}
	}
	async add_new_node(){
		var w = new bricks.ModalForm({
			target:this,
			"width":"80%",
			"height":"80%",
			title:'add new node',
			fields:this.editable.fields
		});
		w.bind('submit', this.new_node_inputed.bind(this))
	}
	
	async new_node_inputed(event){
		var d = event.params;
		var node = this;
		if (this.selected_node){
			console.log('selected node exists')
			node = this.selected_node;
			if (d instanceof FormData){
				d.append(this.parentField, node.get_id());
			} else {
				d[this.parentField] = node.get_id();
			}
		} else if (this.opts.params.id) {
			console.log('selected node not exists')
			if (d instanceof FormData){
				d.append(this.parentField, this.opts.params.id);
			} else {
				d[this.parentField] = this.opts.params.id;
			}
		}
		if (this.opts.newdata_params){
			for (const [k, v] of Object.entries(this.opts.newdata_params)){
				if (d instanceof FormData){
					d.append(k, v);
				} else {
					d[k] = v;
				}
			}
		}
		if (this.editable.add_url){
			var jc = new bricks.HttpJson()
			var desc = await jc.post(this.editable.add_url, {params:d});
			if (desc.widgettype == 'Message'){
				var data = desc.options.user_data;
				this.append_new_subnode(node, data);
				node.is_leaf = false;
				if (node != this) node.change_node_type();
			}
			var w = await bricks.widgetBuild(desc, this);
			w.open();
		} else {
			d[this.idField] = bricks.uuid();
			this.append_new_subnode(node, d);
		}
	}
	async create_tree_nodes(node, records){
		for (var i=0;i<records.length;i++){
			this.build_subnode(node, records[i]);
		}
	}
	append_new_subnode(node, data){
		data.is_left = true;
		if (!node.user_data){
			node.user_data = {};
		}
		if (!node.user_data.children){
			node.user_data.children = [];
		}
		node.is_leaf = false;
		node.children_loaded = true;
		node.user_data.children.push(data)
		this.build_subnode(node, data);
	}

	build_subnode(node, data){
		var n = new bricks.TreeNode(this, node, data);
		node.container.add_widget(n);
	}

	async delete_node(){
		if (! this.selected_node){
			w = new bricks.Error({title:'Delete', message:'No selected node found'});
			w.open();
			return;
		}
		var w = new bricks.Conform({
			cwidth:16,
			cheight:9,
			title:'Delete node',
			message:'Please conform delete selected node'
		});
		w.bind('conformed', this.delete_node_conformed.bind(this))
	}
	async delete_node_conformed(event){
		if (this.editable.delete_url){
			var jc = new bricks.HttpJson()
			var desc = await jc.post(this.editable.delete_url, {params:this.selected_node.user_data});
			if (desc.widgettype == 'Message'){
				var pnode = this.selected_node.parent_node;
				console.log('parent node=', pnode);
				if (pnode && pnode.container){
					pnode.container.remove_widget(this.selected_node);
				}
				this.selected_node = null;
			}
			var w = await bricks.widgetBuild(desc, this);
			w.open();
		} else {
			var pnode = this.selected_node.parent_node;
			if (pnode && pnode.container){
				pnode.container.remove_widget(this.selected_node);
			}
			this.selected_node = null;
		}
	}
	delete_subnode(node, subnode){
		var subid = subnode.user_data[this.idField];
		var children = [];
		for (var i=0;i< node.user_data.children.length;i++){
			var c = node.user_data.children[i];
			if (c[this.idField] != subid){
				children.push(c);
			}
		}
		node.user_data.children = children;
		node.container.remove_widget(subnode);
	}

	async update_node(){
		if (! this.selected_node){
			w = new bricks.Error({title:'Update', message:'No selected node found'});
			w.open();
			return;
		}
		var fields = [];
		for (var i=0;i<this.editable.fields.length;i++){
			var f = bricks.extend({}, this.editable.fields[i]);
			f.value = this.selected_node.user_data[f.name];
			fields.push(f);
		}
		var w = new bricks.ModalForm({
			target:this,
			"width":"80%",
			"height":"80%",
			title:'add new node',
			fields:fields
		});
		w.bind('submit', this.update_node_inputed.bind(this))
	}

	async update_node_inputed(event){
		var d = event.params;
		var node = this.selected_node;
		if (d instanceof FormData){
			d.append(this.idField, node.get_id());
		} else {
			d[this.idField] = node.get_id();
		}
		if(this.editable.update_url){
			var jc = new bricks.HttpJson()
			var desc = await jc.post(this.editable.update_url, {params:d});
			if (desc.widgettype == 'Message'){
				var o = formdata2object(d);
				await this.update_node_data(node, o);
			}
			var w = await bricks.widgetBuild(desc, this);
			w.open();
		} else {
			var o = formdata2object(d);
			await this.update_node_data(node, o);
		}
	}
	
	async update_node_data(node, data){
		var data_keys = Object.keys(node.user_data);
		Object.keys(data).forEach(k => {
			if (data_keys.includes(k)){
				console.log(node.user_data[k], ':', k, ':', data[k]);
				node.user_data[k] = data[k];
			}
		});
		await node.update_content();
	}

	async get_children_data(node){
		var jc = new bricks.HttpJson();
		var p = bricks.extend({}, this.params);
		if (node != this){
			p.id = node.user_data[this.idField];
		}
		console.log('params=', p);
		var d = await jc.httpcall(this.opts.dataurl,{
				method : this.opts.method || 'GET',
				params : p
			})
		if (d.length == 0){
			node.is_leaf = true;
		} else {
			this.user_data = {
				children:d
			}
			this.create_tree_nodes(node, d);
		}
	}
	create_node_children(node, data){
		if(!data) return;
		for (var i=0; i<data.length; i++){
			var n = new bricks.TreeNode(this, node, data[i]);
			node.container.add_widget(n);
		}
	}
	node_click_handle(node, event){
		if (this.selected_node){
			this.node_selected(this.selected_node, false);
		}
		if (this.selected_node == node){
			this.selected_node = null;
		} else {
			this.selected_node = node;
			this.node_selected(node, true);
		}
	}
	node_selected(node, flag){
		console.log('node_selected():node=', node, flag);
		node.selected(flag);
		var d = bricks.extend(node.user_data, {
			selected:flag
		});

		this.dispatch('node_selected', d);
	}
	async node_checked(node, event){
		var cb = event.target.bricks_widget;
		var stat = cb.getValue().check;
		if (stat){
			this.checked_data.push(node.user_data);
		} else {
			this.checked_data = this.checked_data.filter((d , idnex) => d.id == node.user_data.id);
		}
		node.user_data[this.checkField] = stat;
		if (stat){
			console.log('value=', cb.getValue(), 'node=', node);
		}
		this.dispatch('check_changed', node.user_data);
	}
}

bricks.Factory.register('Tree', bricks.Tree);
bricks.Factory.register('EditableTree', bricks.EditableTree);
