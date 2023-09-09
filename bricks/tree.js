class TreeNode extends VBox {
	constructor(tree, parent, data){
		var opts = {
			width:'100%',
			height:'auto',
			overflow:'hidden'
		}
		super(opts);
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
				overflow:'hidden',
				width:'100%'
		})
		n.dom_element.style.margin = bricks_app.charsize * 0.2;
		this.add_widget(n);
		n.bind('click', this.tree.node_click_handle.bind(this.tree, this));
		this.node_widget = n;
		this.create_node_content(n);
		if (! this.data.is_leaf) {
			this.container = new VBox({height:'auto', overflow:'hidden'});
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
			sources['open'] = objget(srcs, 'open', bricks_resource('imgs/down_arrow.png'));
			sources['close'] = objget(srcs, 'close', bricks_resource('imgs/right_arrow.png'));
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
		var icon = objget(TypeIcons, dtype);
		if (!icon && this.tree.opts.default_type){
			icon = objget(TypeIcons, his.tree.opts.default_type);
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
		this.input = new UiStr({name:'text', value:txt});
		this.input.bind('blur', this.edit_handle.bind(this));
		widget.add_widget(this.str_w);
	}
	edit(){
		this.node_widget.remove_widget(this.str_w);
		this.input.setValue(this.str_w.text);
		this.node_widget.add_widget(this.input);
	}
	async edit_handle(){
		if (this.input.value==this.str_w.text)
			return;
		var v = this.input.value;
		r = await this.syncdata('edit');
		this.data[this.tree.opts.textField] = v;
		this.str_w = new Text({text:v});
		this.node_widget.remove_widget(this.input);
		this.node_widget.add_widget(this.str_w);
	}
	async syncdata(mode){
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
		this.set_height('100%');
		this.row_height = this.opts.row_height || '35px';
		this.multitype_tree = this.opts.multitype_tree||false;
		this.selected_node = null;
		this.create_toolbar();
		this.container = new VScrollPanel({});
		this.add_widget(this.container);
		this.data_id = null;
		if (this.opts.dataurl){
			schedule_once(0.01, this.get_children_data.bind(this, this));
		}
		this.create_node_children(this, this.opts.data);
	}
	create_toolbar(){
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

class EditableTree extends Tree {
	/*
	{
		...
		admin:{
			url:
			add:{
				icon:
			}
			delete_node:{
				icon:
			}
			move_up:
			move_down:
			move_top:
			move_bottom:
		}
	}
	*/
	constructor(opts){
		super(opts);
	}
	create_toolbar(){
		if (!this.opts.admin){
			return
		}
		var desc = {
			height:'auto',
			tools:[
				{
					name:'add',
					icon:bricks_resource('imgs/add.png')
				},
				{
					name:'edit',
					icon:bricks_resource('imgs/edit.png')
				},
				{
					name:'move_top',
					icon:bricks_resource('imgs/move_top.png')
				},
				{
					name:'move_up',
					icon:bricks_resource('imgs/move_up.png')
				},
				{
					name:'move_down',
					icon:bricks_resource('imgs/move_down.png')
				},
				{
					name:'move_button',
					icon:bricks_resource('imgs/move_bottom.png')
				},
				{
					name:'delete',
					icon:bricks_resource('imgs/delete_node.png')
				}
			]
		}
		this.toolbar = new Toolbar(desc);
		this.toolbar.bind('command', this.command_handle.bind(this));
		this.add_widget(this.toolbar, 0);
	}
	command_handle(e){
		console.log('command event fire ...', e);
		var name = e.params.name;
		switch (name) {
			case 'add':
				this.add_node();
				break;
			case 'delete':
				this.delete_node();
				break;
			case 'edit':
				this.edit_node();
				break;
			case 'move_top':
				this.move_top();
				break;
			case 'move_up':
				this.move_up();
				break;
			case 'move_down':
				this.move_down();
				break;
			case 'move_bottom':
				this.move_bottom();
				break;
		}
	}
	add_node(){
		var node = this;
		if (this.selected_node) node = this.selected_node;
		var data = { };
		data[this.opts.idField] = 'undefined';
		data[this.opts.textField] = 'new node';
		var n = new TreeNode(this, node, data);
		node.container.add_widget(n);
		n.edit();
		console.log('add_node() finished ...');
	}
	edit_node(){
		if (! this.selected_node){
			return;
		}
		this.selected_node.edit();
	}
	delete_node(){
		if (! this.selected_node){
			return;
		}
		this.selected_node.delete();
	}
	move_top(){
		if (! this.selected_node){
			return;
		}
		this.selected_node.move_top();
	}
	move_up(){
		if (! this.selected_node){
			return;
		}
		this.selected_node.move_up();
	}
	move_down(){
		if (! this.selected_node){
			return;
		}
		this.selected_node.move_down();
	}
	move_botton(){
		if (! this.selected_node){
			return;
		}
		this.selected_node.move_botton();
	}
}
class  PolymorphyTree extends Tree {
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
Factory.register('EditableTree', EditableTree);
