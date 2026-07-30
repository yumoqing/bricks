var bricks = window.bricks || {};

bricks.DimensionFilter = class extends bricks.VBox {
	/*
	options:
	{
		h_data_url: URL to fetch horizontal dimension labels/values,
		v_measure_url: URL to fetch vertical dimension labels/values,
		show_data_url: base URL to fetch display data,
		search_placeholder: placeholder text for search input
	}
	events:
		filter_changed: {h_id: string, v_id: string, keyword: string}
	*/
	constructor(opts){
		opts.width = '100%';
		opts.height = '100%';
		opts.overflow = 'hidden';
		super(opts);
		this.selected_h_id = 'all';
		this.selected_v_id = 'all';
		this.search_keyword = '';
		this.h_buttons = [];
		this.v_buttons = [];
		this.h_data = [];
		this.v_data = [];
		schedule_once(this.build_all.bind(this), 0.1);
	}

	async build_all(){
		this.build_search_bar();
		this.build_horizontal_bar();
		this.build_content_area();
		await this.load_dimensions_data();
	}

	build_search_bar(){
		this.searchbar = new bricks.SearchBar({
			placeholder: this.opts.search_placeholder || '搜索...',
			width: '100%',
			search_label: this.opts.search_label || '搜索',
			clear_label: this.opts.clear_label || '清除'
		});
		this.searchbar.bind('search', this.search_handle.bind(this));
		this.add_widget(this.searchbar);
	}

	build_horizontal_bar(){
		var bar = new bricks.HBox({width: '100%', height: 'auto', flexShrink: 0});
		bar.set_style('alignItems', 'center');

		this.left_arrow = new bricks.Button({
			label: '◀',
			width: 'auto',
			height: 'auto',
			flexShrink: 0,
			nonepack: true
		});
		this.left_arrow.bind('click', this.scroll_left.bind(this));
		bar.add_widget(this.left_arrow);

		this.h_scroll = new bricks.HBox({
			width: '100%',
			flexGrow: 1,
			overflow: 'hidden'
		});
		bar.add_widget(this.h_scroll);

		this.right_arrow = new bricks.Button({
			label: '▶',
			width: 'auto',
			height: 'auto',
			flexShrink: 0,
			nonepack: true
		});
		this.right_arrow.bind('click', this.scroll_right.bind(this));
		bar.add_widget(this.right_arrow);

		this.add_widget(bar);
	}

	build_content_area(){
		var content = new bricks.HBox({width: '100%', height: '100%'});

		/* Left: vertical measure buttons in a scroll panel */
		this.v_scroll = new bricks.VScrollPanel({width: 'auto', height: '100%'});
		this.v_scroll.set_style('maxWidth', '200px');
		this.v_scroll.set_style('minWidth', '80px');
		content.add_widget(this.v_scroll);

		/* Right: display area for show_data_url results */
		this.display_filler = new bricks.Filler({flexGrow: 1});
		this.display_w = new bricks.VBox({width: '100%', height: '100%'});
		this.display_filler.add_widget(this.display_w);
		content.add_widget(this.display_filler);

		this.add_widget(content);
	}

	scroll_left(){
		var el = this.h_scroll.dom_element;
		el.scrollLeft -= 150;
	}

	scroll_right(){
		var el = this.h_scroll.dom_element;
		el.scrollLeft += 150;
	}

	async load_dimensions_data(){
		var jc = new bricks.HttpJson();
		try {
			var hd = await jc.get(this.opts.h_data_url);
			this.h_data = (hd && hd.rows) ? hd.rows : [];
		} catch(e) {
			console.error('DimensionFilter: failed to load h_data_url', e);
		}
		try {
			var vd = await jc.get(this.opts.v_measure_url);
			this.v_data = (vd && vd.rows) ? vd.rows : [];
		} catch(e) {
			console.error('DimensionFilter: failed to load v_measure_url', e);
		}
		this.build_horizontal_buttons();
		this.build_vertical_buttons();
		await this.refresh_display();
	}

	build_horizontal_buttons(){
		this.h_scroll.clear_widgets();
		this.h_buttons = [];

		var all_btn = this._make_dim_btn('全部', 'all', true);
		all_btn._is_h = true;
		this.h_scroll.add_widget(all_btn);
		this.h_buttons.push(all_btn);

		for (var i = 0; i < this.h_data.length; i++){
			var dim = this.h_data[i];
			var label = dim.name || dim.label || dim.id || String(dim);
			var id = dim.id || dim.name || label;
			var btn = this._make_dim_btn(label, id, false);
			btn._is_h = true;
			this.h_scroll.add_widget(btn);
			this.h_buttons.push(btn);
			if (this.selected_h_id == id){
				this.select_h_button(btn);
			}
		}
	}

	build_vertical_buttons(){
		this.v_scroll.clear_widgets();
		this.v_buttons = [];

		var all_btn = this._make_dim_btn('全部', 'all', true);
		all_btn._is_h = false;
		this.v_scroll.add_widget(all_btn);
		this.v_buttons.push(all_btn);

		for (var i = 0; i < this.v_data.length; i++){
			var dim = this.v_data[i];
			var label = dim.name || dim.label || dim.id || String(dim);
			var id = dim.id || dim.name || label;
			var btn = this._make_dim_btn(label, id, false);
			btn._is_h = false;
			this.v_scroll.add_widget(btn);
			this.v_buttons.push(btn);
			if (this.selected_v_id == id){
				this.select_v_button(btn);
			}
		}
	}

	_make_dim_btn(label, id, is_selected){
		var btn = new bricks.Button({
			label: label,
			width: 'auto',
			height: 'auto',
			flexShrink: 0
		});
		btn.dim_id = id;
		if (is_selected){
			btn.set_css('dimension-btn-active');
		}
		btn.bind('click', this.dim_button_clicked.bind(this, btn));
		return btn;
	}

	dim_button_clicked(btn){
		if (btn._is_h){
			this.selected_h_id = btn.dim_id;
			this.select_h_button(btn);
		} else {
			this.selected_v_id = btn.dim_id;
			this.select_v_button(btn);
		}
		this.refresh_display();
	}

	select_h_button(btn){
		for (var i = 0; i < this.h_buttons.length; i++){
			this.h_buttons[i].set_css('dimension-btn-active', true);
		}
		btn.set_css('dimension-btn-active');
	}

	select_v_button(btn){
		for (var i = 0; i < this.v_buttons.length; i++){
			this.v_buttons[i].set_css('dimension-btn-active', true);
		}
		btn.set_css('dimension-btn-active');
	}

	search_handle(event){
		var d = event.params || {};
		this.search_keyword = d.keyword || '';
		this.refresh_display();
	}

	async refresh_display(){
		this.display_w.clear_widgets();
		var hp = this.opts.h_param_name || 'h_id';
		var vp = this.opts.v_param_name || 'v_id';
		var kp = this.opts.keyword_param_name || 'keyword';
		var params = {};
		if (this.selected_h_id != 'all') params[hp] = this.selected_h_id;
		if (this.selected_v_id != 'all') params[vp] = this.selected_v_id;
		if (this.search_keyword) params[kp] = this.search_keyword;
		var desc = {
			widgettype: 'urlwidget',
			options: {
				url: this.opts.show_data_url,
				params: params,
				method: this.opts.show_data_method || 'GET'
			}
		};
		var w = await bricks.widgetBuild(desc, this);
		if (w){
			this.display_w.add_widget(w);
		}
		this.dispatch('filter_changed', params);
	}
};

bricks.Factory.register('DimensionFilter', bricks.DimensionFilter);
