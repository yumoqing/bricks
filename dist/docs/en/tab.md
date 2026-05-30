# TabPanel

**Control Functionality**: TabPanel is a container control designed to implement tabbed interface switching. Users can switch between different content areas by clicking on corresponding tab buttons. It supports tab layouts positioned at the top, bottom, left, or right; allows dynamic addition and removal of tabs; and can cache previously created page content to improve performance.

**Type**: Container Control  
**Parent Control**: `bricks.Layout`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `tab_pos` | String | Position of the tabs. Possible values are `"top"` (default), `"bottom"`, `"left"`, `"right"`, which determine the orientation and placement of the tab bar. |
| `tab_long` | String | Proportional width or height of the tabs, default is `"100%"`, controlling the overall stretch behavior of the tab strip. |
| `css` | Object/String | Custom CSS class name(s) applied to the root element. Available classes include: `tab`, `tab-button`, `tab-button-active`, `tab-button-hover`, `tab-content`. |
| `items` | Array | Array of tab item objects, each containing the following properties:<br>- `name`: Unique identifier for the tab (required)<br>- `label`: Display text<br>- `icon`: Icon class name (optional)<br>- `removable`: Whether the tab can be closed (boolean)<br>- `refresh`: Whether content should be reloaded every time the tab is switched (boolean)<br>- `content`: A widget description object or an instance of `bricks.JsWidget` representing the content |

**Example**:
```js
{
  tab_pos: "top",
  items: [
    {
      name: "tab1",
      label: "Home",
      icon: "fa fa-home",
      removable: false,
      refresh: false,
      content: { widgettype: "Text", text: "Welcome!" }
    }
  ]
}
```

## Main Events

### `switch`
- **Triggered When**: After a tab switch is completed and the new content is displayed.
- **Event Data**: The currently activated content widget instance (`w`, of type `bricks.JsWidget`).
- **Usage**: Useful for monitoring changes in the content area, synchronizing state, or logging.

**Example Listener**:
```js
tabpanel.bind('switch', function(event) {
  console.log('Currently displayed content widget:', event.data);
});
```

### `active` (Content Widget Event)
- **Triggered When**: A content widget is brought to the foreground (i.e., becomes active).
- **Description**: This event is dispatched by the content widget itself via `dispatch('active')`. It's suitable for executing initialization logic when a page becomes visible (e.g., refreshing data, focusing an input field).

> **Note**: This event is not directly emitted by TabPanel, but rather dispatched by its internal content widgets when they become active.

---

**Remarks**:
- TabPanel uses `bricks.Toolbar` to render the tab button bar, supporting both horizontal and vertical layouts.
- The content area uses `bricks.Filler` as the container, dynamically replacing content via the `switch_content()` method.
- Loaded content is cached by default in `content_buffer`; unless `refresh: true` is set, the content will not be recreated upon reactivation.
- Supports dynamically adding new tabs via `add_tab(desc)` and handling close operations through event bindings.