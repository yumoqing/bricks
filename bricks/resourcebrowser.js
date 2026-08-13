var bricks = window.bricks || {};

/*
 * ResourceBrowser — a composite widget: tree (left) + browser (right).
 *
 * use case:
 * {
 *   "widgettype": "ResourceBrowser",
 *   "options": {
 *       "title": "optional title",
 *       "description": "optional description",
 *       "tree_options": {
 *           "widgettype": "Tree",
 *           "options": { "idField": "id", "textField": "text", "dataurl": "..." },
 *           "tools": [ { "widgettype": "Button", "options": {...}, "binds": [...] } ]   // optional
 *       },
 *       "browser_options": {
 *           "widgettype": "urlwidget",
 *           "options": { "url": "...", "method": "GET", "params": {...} },
 *           "tools": [ ... ]                                                            // optional
 *       },
 *       "tree_width": "280px"   // optional, tree column width (default 280px)
 *   }
 * }
 *
 * behaviour:
 *   - on create, calls browser render with id=null
 *   - tree node click only selects (never unselects); on selection change,
 *     calls browser render with the newly selected node's id
 *
 * layout:
 *   -------------------------
 *   | Title                  |
 *   | description            |
 *   | tools | tools          |
 *   | tree  | browser        |
 *   -------------------------
 *   both tree and browser are scrollable.
 */
bricks.ResourceBrowser = class extends bricks.VBox {
	constructor(opts){
		opts = opts || {};
		opts.width = opts.width || '100%';
		opts.height = opts.height || '100%';
		super(opts);
		this.tree_options = opts.tree_options || {};
		this.browser_options = opts.browser_options || {};
		this.current_id = undefined;
		this.id_param_name = opts.id_param_name || 'id';
		schedule_once(this.build_all.bind(this), 0.1);
	}

	async build_all(){
		// ensure column flex so the body can fill the remaining height
		this.dom_element.style.display = 'flex';
		this.dom_element.style.flexDirection = 'column';

		this.build_title();
		this.build_description();
		this.build_tools_row();
		await this.build_body();

		// initial render with id=null
		await this.render_browser(null);
	}

	/*
	 * The base Layout.build_title()/build_description() read this.title /
	 * this.description (copied from opts by opts_set_style). Keep the optional
	 * title/description rendering through them.
	 */

	/*
	 * tools row: "tools | tools" — one toolbar above the tree column and one
	 * above the browser column. tools are widget descriptors.
	 */
	build_tools_row(){
		var tree_tools = this.tree_options.tools || [];
		var browser_tools = this.browser_options.tools || [];
		if (tree_tools.length == 0 && browser_tools.length == 0){
			return;
		}
		var row = new bricks.HBox({width:'100%', height:'auto'});
		row.dom_element.style.flexShrink = '0';
		this.add_widget(row);

		var tree_toolbar = new bricks.HBox({width:this.get_tree_width(), height:'auto'});
		tree_toolbar.dom_element.style.flexShrink = '0';
		row.add_widget(tree_toolbar);
		tree_tools.forEach(async (t) => {
			var w = await bricks.widgetBuild(t, tree_toolbar);
			if (w) tree_toolbar.add_widget(w);
		});

		var browser_toolbar = new bricks.HBox({width:'100%', height:'auto'});
		browser_toolbar.dom_element.style.flex = '1';
		row.add_widget(browser_toolbar);
		browser_tools.forEach(async (t) => {
			var w = await bricks.widgetBuild(t, browser_toolbar);
			if (w) browser_toolbar.add_widget(w);
		});
	}

	get_tree_width(){
		return this.opts.tree_width || '280px';
	}

	async build_body(){
		var body = new bricks.HBox({width:'100%', height:'100%'});
		body.dom_element.style.flex = '1';
		body.dom_element.style.overflow = 'hidden';
		body.dom_element.style.minHeight = '0';
		this.add_widget(body);

		// ── tree column (fixed width, scrollable) ──
		var tree_col = new bricks.VBox({width:this.get_tree_width(), height:'100%'});
		tree_col.dom_element.style.flexShrink = '0';
		tree_col.dom_element.style.overflow = 'hidden';
		tree_col.dom_element.style.minHeight = '0';
		body.add_widget(tree_col);

		var tree_desc = this.clone_descriptor(this.tree_options);
		delete tree_desc.tools;
		// select-only: clicking the same node must not unselect it
		tree_desc.options = tree_desc.options || {};
		tree_desc.options.select_only = true;
		this.tree = await bricks.widgetBuild(tree_desc, tree_col);
		if (this.tree){
			tree_col.add_widget(this.tree);
			this.tree.bind('node_selected', this.node_selected.bind(this));
		}

		// ── browser column (fills remaining width, scrollable) ──
		var browser_col = new bricks.VBox({width:'100%', height:'100%'});
		browser_col.dom_element.style.flex = '1';
		browser_col.dom_element.style.overflow = 'hidden';
		browser_col.dom_element.style.minHeight = '0';
		body.add_widget(browser_col);

		this.browser_panel = new bricks.VScrollPanel({width:'100%', height:'100%'});
		this.browser_panel.dom_element.style.flex = '1';
		this.browser_panel.dom_element.style.minHeight = '0';
		browser_col.add_widget(this.browser_panel);
	}

	/* tree node selected → render browser with the new node id */
	async node_selected(event){
		var d = event.params || {};
		var id_field = (this.tree && this.tree.idField) || 'id';
		var id = d[id_field];
		if (id === undefined){
			id = d.id;
		}
		await this.render_browser(id);
	}

	/*
	 * render the browser for a given node id.
	 * deep-copies browser_options, injects the id param, re-builds content.
	 */
	async render_browser(id){
		if (id === this.current_id){
			return;
		}
		this.current_id = id;
		if (!this.browser_panel){
			return;
		}

		var desc = this.clone_descriptor(this.browser_options);
		delete desc.tools;
		desc.options = desc.options || {};
		desc.options.params = bricks.extend({}, desc.options.params || {});
		if (id === null || id === undefined){
			delete desc.options.params[this.id_param_name];
		} else {
			desc.options.params[this.id_param_name] = id;
		}

		this.browser_panel.clear_widgets();
		var w = await bricks.widgetBuild(desc, this.browser_panel);
		if (w){
			this.browser_panel.add_widget(w);
		}
	}

	/* deep copy a widget descriptor so we never mutate the caller's object */
	clone_descriptor(desc){
		return JSON.parse(JSON.stringify(desc));
	}
};

bricks.Factory.register('ResourceBrowser', bricks.ResourceBrowser);
