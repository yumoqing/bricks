/*
*/
class Menu extends VBox {
	/*
	{
		"items":
	}
	*/
	constructor(options){
		super(options);
		this.dom_element.style.display = "";
		this.dom_element.style.position = "absolute";
		this.dom_element.style.backgroundColor = options.bgcolor || "white";
		this.dom_element.style.zIndex = "1000";
		this.create_children(this.dom_element, this.opts.items);
		this.bind('click', this.menu_clicked);
	}
	create_submenu_container(){
		let cp = document.createElement('div');
		cp.style.marginLeft = "15px";
		cp.style.display = 'none';
		return cp;
	}
	async menu_clicked(event){
		let mit = event.target;
		if (mit.children.length > 0){
			for (var i=0;i<mit.children.length; i++){
				if (mit.children[i].style.display == 'none'){
					mit.children[i].style.display = "";
				} else {
					mit.children[i].style.display = 'none';
				}
			}
			return
		}
		console.log('item clicked');
	}
	create_children(p, items){
		console.log('create_children():items=', items, 'p=', p);
		for (let i=0;i<items.length;i++){
			let item = items[i];
			let menu_item = this.create_menuitem(item);
			p.appendChild(menu_item);
			if (item.hasOwnProperty('items')){
				let cp = this.create_submenu_container();
				menu_item.appendChild(cp);
				this.create_children(cp, item.items);
			}
		}
	}
	create_menuitem(item){
		let i18n = bricks_app.i18n;
		console.log('i18n=', i18n);
		let e = document.createElement('div');
		e.textContent = i18n._(item.label || item.name);
		// e.description = item
		console.log('create_menuitem():item=', item, 'obj=', e);
		return e;
	}
}

Factory.register('Menu', Menu);
