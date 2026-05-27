# Toolbar

**Control Functionality:** Creates a toolbar that can contain multiple tool buttons, supporting horizontal or vertical layouts. Each button can trigger command events, and buttons can be dynamically added or removed.  
**Type:** Container Control  
**Parent Control:** `bricks.Layout`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `orientation` | String | Orientation of the toolbar. Options are `'horizontal'` (default) or `'vertical'`. Affects the type of scroll panel and the direction of spacing. |
| `target` | Any | Optional target object that will be attached to the event data when a command event is triggered. |
| `interval` | String or Number | Spacing size between toolbar items, default is `'10px'`. Sets width or height depending on orientation. |
| `tools` | Array\<Object\> | Array of tool button descriptors. Each object contains the following properties:<br>- `icon`: Path or class name for the button icon<br>- `name`: Unique name for the button, used for event dispatching and lookup<br>- `label`: Display text of the button<br>- `css`: Custom CSS class name<br>- `removable`: Boolean indicating whether the button can be removed (if `true`, a delete icon is displayed) |

**Example:**
```js
{
  orientation: 'horizontal',
  interval: '10px',
  target: myTarget,
  tools: [
    { name: 'save', label: 'Save', icon: 'save-icon.png', css: 'btn-save', removable: true },
    { name: 'undo', label: 'Undo', icon: 'undo-icon.png' }
  ]
}
```

## Main Events

| Event Name | Trigger Condition | Data Passed |
|-----------|-------------------|-------------|
| `command` | Triggered when any tool button is clicked | `{ name, label, icon, css, [target] }` — Contains all configuration information of the clicked tool; includes `target` if it was set |
| `[tool.name]` | Dynamic event named after the tool's `name`; fired individually for each button | Same as above; useful for listening to specific button actions |
| `remove` | Triggered when the user clicks the delete icon on a removable button | The original `tool_opts` object of the removed tool |

> **Example:** If a tool has `name: 'export'`, clicking it triggers both the `command` and `export` events.

### Additional Notes
- Use the `click(name)` method to programmatically simulate a click on a button with the specified name.
- Keyboard selection is supported via `enable_key_select()`.
- All tool buttons are built using `JsWidget`, created asynchronously to ensure correct initialization of the component tree.