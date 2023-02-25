class TreeNode extends VBox {
	constructor(opts){
		super();
		this.tree = opts.tree;
		this.data = opts.record;
		this.data_id = this.data[this.tree.opts.idField];
		this.parent = opts.parent;
		var n = new HBox({
				height:this.tree.opts.row_height,
				width:'100%'
		})
		this.add_widget(n);
		this.create_node_content(n);
		this.is_leaf = this.data.is_leaf;
		if (! this.data.is_leaf) {
			this.container = new VBox({});
			this.add_widget(this.container);
			this.container.hide();
			if (this.data.children){
				this.tree.create_node_children(this, this.data.children);
			}
		}
	}
	create_node_content(widget){
		if (this.is_leaf){
			widget.add_widget(new Image({source=null}));
		} else {
			this.trigle = new MultipleStateImage({
				sources:{
					'close': bricks_resource('right_arrow.png'),
					'open':bricks_resource('down_arrow.png'),
				},
				height:img_size,
				width:img_size
			});
			this.trigle.bind('click', this.toggleExpandCollapse.bind(this));
			widget.add_widget(this.trigle);
		}
		var dtype = this.data[this.opts.typeField];
		var icon = this.tree.getTypeIcon(dtype);
		var img = Image({
			source:icon,
			height:img_size,
			width:img_size});
		widget.add_widget(img);
		var txt = this.data[this.tree.opts.textField];
		widget.add_widget(new Text({
			text:txt}));
	}
}

class Tree extends VBox {
	/*
	{
		row_height:
		idField:
		textField:
		type_icons:
		typeField:
		default_icon:
		data:
		dataurl:
		updateurl:
		deleteurl:
		addurl:
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
		this.create('div');
		this.set_height('100%');
		this.container = this;
		this.data_id = null;
		if (this.opts.admin){
			this.create_admin_toolbar();
		}
		if (this.opts.dataurl){
			schedule_once(0.01, this.get_tree_data.bind(this, this));
		}
		this.create_tree_nodes(this, this.opts.data);
	}
	async get_tree_data(node){
		var d = await jcall(this.opts.dataurl,params = {id:node.data_id})
		this.create_tree_nodes(node, d);
	}
	create_node_children(node, data){
		for (var i=0; i<data.length; i++){
			var n = new TreeNode({tree:this,
						parent:node, record:data[i]});
			node.container.add_widget(n);
		}
	}
}

Factory.register('Tree', Tree);
