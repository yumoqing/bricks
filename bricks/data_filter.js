var bricks = window.bricks || {};

/*
 * DataFilter widget — renders a search form from a data_filter definition.
 *
 * Usage:
 *   new bricks.DataFilter({
 *       data_filter: { "AND": [
 *           {"field": "name", "op": "LIKE", "var": "name_input"},
 *           {"field": "status", "op": "=", "var": "status_input"}
 *       ]},
 *       browserfields: { alters: { status: { uitype: "code", data: [...] } } }  // optional
 *   });
 *
 * Events:
 *   filter_search: { values: { name_input: "x", status_input: "y" } }
 *   filter_clear:  {}
 */
bricks.DataFilter = class extends bricks.VBox {
	constructor(opts){
		opts = opts || {};
		opts.width = opts.width || '100%';
		opts.height = opts.height || 'auto';
		super(opts);
		this.set_style('alignItems', 'center');
		this.set_style('gap', opts.gap || '0.5rem');
		this.set_style('flexWrap', 'wrap');
		this.filter_values = {};
		this.var_fields = [];
		this._parse_filter();
		this._build_inputs();
		this._build_buttons();
	}

	/* Recursively extract all {var, op, field} from the filter tree */
	_parse_filter(){
		this.var_fields = [];
		if (!this.opts.data_filter) return;
		this._extract_vars(this.opts.data_filter);
	}

	_extract_vars(node){
		if (!node || typeof node !== 'object') return;
		var self = this;
		var keys = Object.keys(node);
		for (var i = 0; i < keys.length; i++){
			var key = keys[i];
			var val = node[key];
			if (key === 'AND' || key === 'OR'){
				if (Array.isArray(val)){
					val.forEach(function(item){ self._extract_vars(item); });
				}
			} else if (key === 'NOT'){
				this._extract_vars(val);
			} else if (key === 'field'){
				// This node is a leaf condition: {field, op, var|const}
				if (node.var){
					this.var_fields.push({
						var_name: node.var,
						field_name: node.field,
						op: node.op || '='
					});
				}
				return; // leaf node, don't recurse into siblings
			}
		}
	}

	_build_inputs(){
		var self = this;
		var alters = (this.opts.browserfields && this.opts.browserfields.alters) || {};
		this.var_fields.forEach(function(vf){
			var wrapper = new bricks.HBox({
				width: 'auto',
				height: 'auto'
			});
			wrapper.set_style('alignItems', 'center');
			wrapper.set_style('gap', '0.25rem');

			// Label
			var label_text = self.opts.field_labels && self.opts.field_labels[vf.var_name]
				? self.opts.field_labels[vf.var_name]
				: vf.field_name;
			var label_w = new bricks.Text({
				text: label_text,
				fontSize: '14px'
			});
			wrapper.add_widget(label_w);

			// Input — choose type based on op and alters
			var alter = alters[vf.field_name];
			var input_w;
			if (alter && alter.uitype === 'code'){
				// Dropdown
				input_w = self._build_code_input(vf, alter);
			} else if (vf.op === 'IN' || vf.op === 'NOT IN'){
				input_w = self._build_text_input(vf, 'a,b,c');
			} else if (vf.op === 'LIKE' || vf.op === 'NOT LIKE'){
				input_w = self._build_text_input(vf, '');
			} else {
				// =, !=, >, >=, <, <= etc.
				input_w = self._build_text_input(vf, '');
			}
			input_w.set_style('minWidth', '120px');
			input_w.set_style('maxWidth', '200px');
			wrapper.add_widget(input_w);
			vf.input_widget = input_w;

			self.add_widget(wrapper);
		});
	}

	_build_text_input(vf, placeholder){
		var input_w = new bricks.UiStr({
			name: vf.var_name,
			value: '',
			placeholder: placeholder || '',
			width: '100%'
		});
		input_w.set_style('padding', '0.35rem 0.5rem');
		input_w.set_style('boxSizing', 'border-box');
		input_w.set_style('height', 'auto');
		input_w.bind('changed', this._input_changed.bind(this));
		input_w.dom_element.addEventListener('keydown', this._keydown_handle.bind(this));
		return input_w;
	}

	_build_code_input(vf, alter){
		var input_opts = {
			name: vf.var_name,
			value: '',
			placeholder: '',
			width: '100%',
			dataurl: alter.dataurl || null,
			datamethod: alter.datamethod || 'GET',
			dataparams: alter.dataparams || {}
		};
		if (alter.data && Array.isArray(alter.data)){
			input_opts.data = alter.data;
		}
		if (alter.data_field){
			input_opts.data_field = alter.data_field;
		}
		var input_w = new bricks.UiCode(input_opts);
		input_w.set_style('padding', '0.25rem');
		input_w.set_style('boxSizing', 'border-box');
		input_w.set_style('height', 'auto');
		input_w.bind('changed', this._input_changed.bind(this));
		return input_w;
	}

	_build_buttons(){
		var btn_box = new bricks.HBox({
			width: 'auto',
			height: 'auto'
		});
		btn_box.set_style('alignItems', 'center');
		btn_box.set_style('gap', '0.5rem');

		this.search_btn = new bricks.Button({
			label: this.opts.search_label || '搜索',
			orientation: 'horizontal',
			width: 'auto',
			height: 'auto'
		});
		this.search_btn.bind('click', this._do_search.bind(this));
		btn_box.add_widget(this.search_btn);

		this.clear_btn = new bricks.Button({
			label: this.opts.clear_label || '清空',
			orientation: 'horizontal',
			width: 'auto',
			height: 'auto'
		});
		this.clear_btn.bind('click', this._clear_search.bind(this));
		btn_box.add_widget(this.clear_btn);

		this.add_widget(btn_box);
	}

	_input_changed(event){
		var d = event.params || {};
		for (var k in d){
			this.filter_values[k] = d[k];
		}
	}

	_keydown_handle(event){
		if (event.key === 'Enter'){
			this._do_search(event);
		}
	}

	_get_all_values(){
		var values = {};
		var self = this;
		this.var_fields.forEach(function(vf){
			var w = vf.input_widget;
			if (!w) return;
			if (w.resultValue){
				values[vf.var_name] = w.resultValue() || '';
			} else if (w.getValue){
				values[vf.var_name] = w.getValue() || '';
			} else {
				values[vf.var_name] = '';
			}
		});
		return values;
	}

	_do_search(event){
		var values = this._get_all_values();
		this.filter_values = values;
		this.dispatch('filter_search', { values: values });
		if (event && event.stopPropagation){
			event.stopPropagation();
		}
	}

	_clear_search(event){
		var self = this;
		this.var_fields.forEach(function(vf){
			var w = vf.input_widget;
			if (!w) return;
			if (w.setValue){
				w.setValue('');
			}
		});
		this.filter_values = {};
		this.dispatch('filter_clear', {});
		this._do_search(event);
	}

	/* Programmatically set a filter value */
	set_filter_value(var_name, value){
		var self = this;
		this.var_fields.forEach(function(vf){
			if (vf.var_name === var_name && vf.input_widget){
				if (vf.input_widget.setValue){
					vf.input_widget.setValue(value);
				}
			}
		});
	}
};

bricks.Factory.register('DataFilter', bricks.DataFilter);
