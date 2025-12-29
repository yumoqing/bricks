var bricks = window.bricks || {};
/*
*/
bricks.url_menuitems = {
}

bricks.Menu = class extends bricks.VScrollPanel {
	/*
	{
		"items":
	}
	*/
	constructor(options){
		opts.height = '100%';
		super(options);
		this.dom_element.style.display = "";
		this.dom_element.style.backgroundColor = options.bgcolor || "white";
		this.build_title();
		this.build_description();
		this.user_data = opts;
		this.bind('item_click', this.menu_clicked.bind(this));
		this.container = new bricks.VBox({});
		this.container.user_data = opts;
		this.add_widget(this.container);
		schedule_once(this.create_children.bind(this, this, this.opts.items), 0.1);
	}
	create_submenu_container(){
		let cp = new bricks.VBox({});
		cp.set_style('marginLeft', "15px");
		cp.set_style('display', 'none');
		return cp;
	}
	async menu_clicked(event){
		let e = event.target;
		let opts = event.params;
		var t;
		var popts;
		var target = opts.target || this.target;
		var popup_options = opts.popup_options || this.popup_options;
		if (target == 'PopupWindow'){
			popts = bricks.get_popupwindow_default_options();
			bricks.extend(popts, popup_options || {});
			popts.icon = opts.icon;
			popts.title = opts.label || opts.name
			t = new bricks.PopupWindow(popts);
		} else if (this.target == 'Popup'){
			popts = bricks.get_popup_default_options();
			bricks.extend(popts, popup_options || {});
			t = new bricks.Popup(popts);
		} else {
			t = bricks.getWidgetById(target, this);
		}
		if (t){
			if (opts.url){
				var desc = {
					"widgettype":"urlwidget",
					"options":{
						"url":opts.url
					}
				}
				var w = await bricks.widgetBuild(desc, this);
				if (w && ! w.parent){
					t.clear_widgets();
					t.add_widget(w);
				} else {
					console.log('menu_clicked():widgetBuild() failed', desc);
				}
			} else if (opts.script){
				var AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
				var f = new AsyncFunction('menu', 'event', opts.script);
				if (!f){
					console.log('menu item define error', opts);
				}
				f.bind(t, this)(event);
			} else if (opts.method){
				var f = target[opts.method];
				if (!f){
					console.log('menu item define error', opts);
				}
				f.bind(t, this)(evnet);
			} else if (opts.rfname){
				var f = bricks.RF.get(opts.rfname);
				if (!f){
					console.log('menu item define error', opts);
				}
				f.bind(t, this)(event);
			}
		} else {
			console.log('menu_clicked():', this.target, 'not found')
		}
		this.dispatch('command', opts);
	}
	async create_children(w, items){
		var container = w.container;
		if (w == this){
			console.log('build menu children called');
		} else {
			console.log('ggggggggggggggggggggg');
		}
		for (let i=0;i<items.length;i++){
			let item = items[i];
			let subw = this.create_menuitem(item);
			if (item.submenu){
				item.items = await this.get_submenu_items(item.submenu);
			}
			if (item.hasOwnProperty('items')){
				var itw = new bricks.VBox({});
				let w1 = this.create_submenu_container();
				itw.add_widget(subw);
				itw.add_widget(w1);
				this.create_children(w1, item.items);
				subw.bind('click', this.items_toggle_hide.bind(this, w1));
				itw.container = w1;
				itw.user_data = item;
				container.add_widget(itw);
			} else {
				subw.bind('click', this.regen_menuitem_event.bind(this, item))
				subw.user_data = item;
				container.add_widget(subw);
			}
		}
	}
	async get_submenu_items(url){
		var items = bricks.url_menuitems[url];
		if (items) return items;
		var jc = new bricks.HttpJson();
		var d = await jc.get(url);
		items =  d.options.items;
		bricks.url_menuitems[url] = items;
		return items;
	}
	get_container(w, mpath){
		var x = mpath.split('/');
		var name = x.shift()
		var container = w.container;
		var fc;
		if (! container) 
		{
			console.log(w, mpath, 'get_container() container is null');
			return null;
		}
		containers.children.forEach(c=>{
			if (c.user_data){
				if (c.user_data.name == name) fc = c;
			} else {
				throw 'menu data error';
			}
		});
		if (! fc) {
			console.log(name, 'not found in subitems')
			return null;
		}
		if (x.length == 0){
			console.log('notmal return');
			return fc;
		}
		mpath = x.join('/')
		return this.get_container(fc, mpath);
	}

	hide_item(menu_path, event){
		var w = this.get_container(this, mpath);
		if (w) w.hide();
		event.stopPropagation();
	}
	show_item(menu_path, event){
		var w = this.get_container(this, mpath);
		if (w) w.show();
		event.stopPropagation();
	}
	items_toggle_hide(w, event){
		w.toggle_hide();
		event.stopPropagation();
	}
	create_menuitem(item){
		var w = new bricks.HBox({cheight:this.item_cheight||2});
		var iw, tw;
		if (item.icon){
			iw = new bricks.Icon({cwidth: 1.3, cheight:1.3, url:item.icon});
		} else {
			iw = new bricks.BlankIcon({cwidth: 1.3, cheight:1.3});
		}
		w.add_widget(iw);
		tw = new bricks.Text({
			css: "filler",
			otext:item.label,
			i18n:true,
			wrap:true,
			halign:'left'
		});
		w.add_widget(tw);
		iw.menuitem = w;
		tw.menuitem = w;
		w.set_css(this.menuitem_css || 'menuitem');
		return w;
	}
	regen_menuitem_event(item, event){
		console.log('regen_menuitem_event()', item);
		this.dispatch('item_click', item);
		event.stopPropagation();
	}
}

bricks.Factory.register('Menu', bricks.Menu);
