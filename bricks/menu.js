var bricks = window.bricks || {};
/*
*/
bricks.Menu = class extends bricks.VBox {
	/*
	{
		"items":
	}
	*/
	constructor(options){
		super(options);
		this.dom_element.style.display = "";
		this.dom_element.style.backgroundColor = options.bgcolor || "white";
		this.build_title();
		this.build_description();
		this.create_children(this, this.opts.items);
		this.bind('item_click', this.menu_clicked.bind(this));
	}
	create_submenu_container(){
		let cp = new bricks.VBox({});
		cp.set_style('marginLeft', "15px");
		cp.set_style('display', 'none');
		return cp;
	}
	async menu_clicked(event){
		console.log(event);
		let e = event.target;
		let opts = event.params;
		var t;
		var popts;
		if (this.target == 'PopupWindow'){
			popts = bricks.get_popupwindow_default_options();
			bricks.extend(popts, this.popup_options || {});
			t = new bricks.PopupWindow(popts);
		} else if (this.target == 'Popup'){
			popts = bricks.get_popup_default_options();
			bricks.extend(popts, this.popup_options || {});
			t = new bricks.Popup(popts);
		} else {
			t = bricks.getWidgetById(this.target);
		}
		if (t){
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
		} else {
			console.log('menu_clicked():', this.target, 'not found')
		}
		this.dispatch('command', opts);
	}
	create_children(w, items){
		for (let i=0;i<items.length;i++){
			let item = items[i];
			let subw = this.create_menuitem(item);
			if (item.hasOwnProperty('items')){
				var itw = new bricks.VBox({});
				w.add_widget(itw);
				let w1 = this.create_submenu_container();
				itw.add_widget(subw);
				itw.add_widget(w1);
				this.create_children(w1, item.items);
				subw.bind('click', this.items_toggle_hide.bind(this, w1));
			} else {
				subw.bind('click', this.regen_menuitem_event.bind(this, item))
				w.add_widget(subw);
			}
		}
	}
	items_toggle_hide(w, event){
		w.toggle_hide();
		event.stopPropagation();
	}
	create_menuitem(item){
		var w = new bricks.HBox({cheight:this.item_cheight||2});
		var iw, tw;
		if (item.icon){
			iw = new bricks.Icon({url:item.icon, rate:1.3});
		} else {
			iw = new bricks.BlankIcon({rate:1.3});
		}
		w.add_widget(iw);
		tw = new bricks.Text({
			otext:item.label,
			i18n:true,
			wrap:true,
			haligin:'left'
		});
		tw.set_css('filler');
		w.add_widget(tw);
		for (var k in item){
			if (item.hasOwnProperty(k)){
				w[k] = item[k];
			}
		}
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
