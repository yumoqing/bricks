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
	contructor(options){
		super(options);
		this.create('div');
		this.dom_element.style.display = "none";
		this.dom_element.style.position = "absolute";
		this.dom_element.style.backgroundColor = options.bgcolor || "white";
		this.dom_element.style.zIndex = "1000";
		this.create_menutree();
		this.bind('click', this.menu_clicked);
	}
	async menu_clicked(event){
		let mit = event.target;
		console.log('item clicked');
	}
	create_menutree(){
		this.create_children(this.dom_element, this.opts.items);
	}
	create_children(p, items){
		for (let i=0;i<items.length;i++){
			let item = items[i];
			let menu_item = this.create_menuitem(item);
			p.appendChild(menu_item);
			if (item.hasOwnProperty('items')){
				this.create_children(menu_item, item.items);
			}
		}
	}
	create_menuitem(item){
		let e = createElement('div');
		e.textContent = i18n(item.label || item.name);
		e.description = item
		return e;
	}
}
