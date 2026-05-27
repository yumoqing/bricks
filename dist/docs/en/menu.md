# Menu

**Widget Functionality**: Used to create interactive menu components, supporting static menu items, nested submenus, and dynamically loading remote submenus. Clicking a menu item can trigger actions such as page navigation or opening a popup window.  
**Type**: Container widget  
**Parent Widget**: `bricks.VBox`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `options.bgcolor` | String | Background color of the menu; default is `"white"` |
| `options.items` | Array | Array of menu items, where each item contains properties like label, url, icon, target, etc. (see `create_menuitem` and `create_children` methods for details) |
| `options.item_cheight` | Number | Height unit (cheight) for menu items, affecting layout of icons and text |
| `options.menuitem_css` | String | Custom CSS class name for styling menu items |
| `options.target` | String | Target container type after clicking a menu item, e.g., `'PopupWindow'`, `'Popup'`, or another widget ID |
| `options.popup_options` | Object | Configuration options for popup behavior, used to customize display settings of PopupWindow or Popup |

> Note: `options` are also passed to the parent class `VBox`, inheriting its general layout parameters.

## Main Events

- **`item_click`**  
  **Trigger**: When a user clicks a menu item  
  **Callback Parameters**: `item` object (contains fields such as `label`, `url`, `icon`, `target`)  
  **Handling Logic**: Determines the opening method based on `item.target` (e.g., new window, popup, or replacing content in a specified widget), and loads the corresponding URL content via `widgetBuild`.

- **`command`**  
  **Trigger**: Dispatched after `menu_clicked` finishes handling navigation logic  
  **Callback Parameters**: Same `opts` object as in `item_click`  
  **Purpose**: Notifies external systems to execute additional commands or perform state updates.

> Event binding is set via `this.bind('item_click', ...)` in the constructor and triggered by `regen_menuitem_event`.