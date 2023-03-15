class TreeNode extends VBox {
	constructor(tree, parent, data){
		super(data);
		this.tree = tree;
		this.parent = parent;
		this.children_loaded = false;
		this.data = data;
		this.is_leaf = this.data.is_leaf;
		this.params = {id:this.data[this.tree.opts.idField]};
		if (this.tree.multitype_tree){
			this.params['type'] = this.data[this.tree.opts.typeField];
		}
		var n = new HBox({
				height:'auto',
				width:'100%'
		})
		n.dom_element.style.margin = bricks_app.charsize * 0.2;
		this.add_widget(n);
		n.bind('click', this.tree.node_click_handle.bind(this.tree, this));
		this.node_widget = n;
		this.create_node_content(n);
		if (! this.data.is_leaf) {
			this.container = new VBox({});
			this.add_widget(this.container);
			this.container.dom_element.style.marginLeft = bricks_app.charsize + 'px';
			if (this.data.children){
				this.tree.create_node_children(this, this.data.children);
			}
			this.container.hide();
		}
	}
	selected(flg){
		if (flg){
			this.str_w.dom_element.classList.add('selected');
		} else {
			this.str_w.dom_element.classList.remove('selected');
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
		if (this.is_leaf){
			return;
		}
		this.container.hide();
	}
	create_node_content(widget){
		var img_size = bricks_app.charsize;
		if (this.is_leaf){
			widget.add_widget(new BlankIcon({}));
		} else {
			var srcs = this.tree.opts.node_state_imgs || {};
			var sources = {};
			sources['open'] = srcs.get('open', bricks_resource('imgs/down_arrow.png'));
			sources['close'] = srcs.get('close', bricks_resource('imgs/right_arrow.png'));
			this.trigle = new MultipleStateIcon({
				state:'close',
				urls:sources,
				height:img_size,
				width:img_size
			});
			this.trigle.bind('state_changed', this.toggleExpandCollapse.bind(this));
			widget.add_widget(this.trigle);
		}
		var dtype = this.data[this.tree.opts.typeField];
		var icon = TypeIcons.get(dtype);
		if (!icon && this.tree.opts.default_type){
			icon = TypeIcons.get(his.tree.opts.default_type);
		}
		if (!icon){
			icon = bricks_resource('imgs/folder.png');
		}
		var img = new Icon({
			url:icon
		});
		widget.add_widget(img);
		var txt = this.data[this.tree.opts.textField];
		widget.add_widget(
		this.str_w = new Text({text:txt}));
		widget.add_widget(this.str_w);
	}
}

class Tree extends VBox {
	/*
	{
		row_height:
		multitype_tree:false,
		idField:
		textField:
		type_icons:
		typeField:
		default_type:
		data:
		dataurl:
		node_state_imgs:{
			open:url,
			close:url
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
		this.create('div');
		this.set_height('100%');
		this.row_height = this.opts.row_height || '35px';
		this.multitype_tree = this.opts.multitype_tree||false;
		this.selected_node = null;
		this.container = this;
		this.data_id = null;
		if (this.opts.admin){
			this.create_admin_toolbar();
		}
		if (this.opts.dataurl){
			schedule_once(0.01, this.get_children_data.bind(this, this));
		}
		this.create_node_children(this, this.opts.data);
	}
	async get_children_data(node){
		var d = await jcall(this.opts.dataurl,{
				method : this.opts.method || 'GET',
				params : node.params
			})
		if (d.length == 0){
			node.is_leaf = true;
		} else {
			this.create_tree_nodes(node, d);
		}
	}
	create_node_children(node, data){
		for (var i=0; i<data.length; i++){
			var n = new TreeNode(this, node, data[i]);
			node.container.add_widget(n);
		}
	}
	node_click_handle(node, event){
		if (this.selected_node){
			this.selected_node.selected(false);
		}
		this.selected_node = node;
		node.selected(true);
		this.dispatch('node_click', node);
	}
}

class PolymorphyTree extends Tree {
	/*
	{
		root:[t1],
		nodetypes:{
			t1:{
				idField:
				typeField:
				textField:
				icon:
				contextmenu:
				subtypes:[]
			}
		}
		data:
		dataurl:
	}
	*/
	constructor(opts){
		super(opts);
	}
}
Factory.register('Tree', Tree);
