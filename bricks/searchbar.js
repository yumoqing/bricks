var bricks = window.bricks || {};

bricks.SearchBar = class extends bricks.HBox {
	/*
	options:
	{
		placeholder: input placeholder text,
		value: initial keyword,
		width: component width,
		search_label: search button label,
		clear_label: clear button label,
		input_width: input width, default 100%
	}
	events:
		search: {keyword: string}
	*/
	constructor(opts){
		opts = opts || {};
		if (!opts.width){
			opts.width = '100%';
		}
		if (!opts.height){
			opts.height = 'auto';
		}
		super(opts);
		this.keyword = opts.value || '';
		this.set_style('alignItems', 'center');
		this.set_style('gap', opts.gap || '0.5rem');
		this.build_input();
		this.build_search_button();
		this.build_clear_button();
	}
	build_input(){
		var input_opts = {
			name:this.opts.name || 'keyword',
			value:this.keyword,
			placeholder:this.opts.placeholder || '',
			width:this.opts.input_width || '100%',
			css:this.opts.input_css || 'input',
			flexShrink:1
		};
		this.input_w = new bricks.UiStr(input_opts);
		this.input_w.set_style('minWidth', this.opts.input_min_width || '0');
		this.input_w.set_style('height', this.opts.input_height || 'auto');
		this.input_w.set_style('padding', this.opts.input_padding || '0.5rem');
		this.input_w.set_style('boxSizing', 'border-box');
		this.input_w.bind('changed', this.input_changed.bind(this));
		this.input_w.bind('blur', this.input_changed.bind(this));
		this.input_w.dom_element.addEventListener('keydown', this.keydown_handle.bind(this));
		this.add_widget(this.input_w);
	}
	build_search_button(){
		this.search_button = new bricks.Button({
			label:this.opts.search_label || 'Search',
			orientation:'horizontal',
			width:'auto',
			height:'auto',
			flexShrink:0
		});
		this.search_button.bind('click', this.do_search.bind(this));
		this.add_widget(this.search_button);
	}
	build_clear_button(){
		this.clear_button = new bricks.Button({
			label:this.opts.clear_label || 'Clear',
			orientation:'horizontal',
			width:'auto',
			height:'auto',
			flexShrink:0
		});
		this.clear_button.bind('click', this.clear_search.bind(this));
		this.add_widget(this.clear_button);
	}
	input_changed(event){
		var d = event.params || {};
		this.keyword = d[this.input_w.name] || '';
	}
	keydown_handle(event){
		if (event.key == 'Enter'){
			this.do_search(event);
		}
	}
	get_keyword(){
		this.keyword = this.input_w.resultValue() || '';
		return this.keyword;
	}
	set_keyword(keyword){
		this.keyword = keyword || '';
		this.input_w.setValue(this.keyword);
	}
	focus(){
		this.input_w.focus();
	}
	do_search(event){
		var keyword = this.get_keyword();
		this.dispatch('search', {keyword:keyword});
		if (event && event.stopPropagation){
			event.stopPropagation();
		}
	}
	clear_search(event){
		this.set_keyword('');
		this.dispatch('search', {keyword:''});
		if (event && event.stopPropagation){
			event.stopPropagation();
		}
	}
}

bricks.Factory.register('SearchBar', bricks.SearchBar);
