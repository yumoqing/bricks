/*
// Create the context menu element
const contextMenu = document.createElement("div");
contextMenu.style.display = "none";
contextMenu.style.position = "absolute";
contextMenu.style.backgroundColor = "white";
contextMenu.style.zIndex = "1000";

// Add some menu items to the context menu
const menuItem1 = document.createElement("div");
menuItem1.textContent = "Item 1";
contextMenu.appendChild(menuItem1);

const menuItem2 = document.createElement("div");
menuItem2.textContent = "Item 2";
contextMenu.appendChild(menuItem2);

// Add the context menu to the document
document.body.appendChild(contextMenu);

// Show the context menu on right-click
document.addEventListener("contextmenu", event => {
  event.preventDefault();
  contextMenu.style.left = `${event.clientX}px`;
  contextMenu.style.top = `${event.clientY}px`;
  contextMenu.style.display = "block";
});

// Hide the context menu on click outside of it
document.addEventListener("click", event => {
  contextMenu.style.display = "none";
});
*/
class Menu extends VBox {
	/*
	{
		"items":
	}
	*/
	constructor(options){
		super(options);
		this.create('div');
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
