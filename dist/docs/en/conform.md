# Conform

**Control Functionality**: Displays a confirmation dialog containing a message and "Confirm" and "Cancel" action buttons, typically used for secondary confirmation before user actions.  
**Type**: Container control  
**Parent Control**: `bricks.PopupWindow`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `message` | String | The message text to display; supports internationalization (i18n) and automatic line wrapping. |
| `conform` | Object | Optional; customizes the "Confirm" button configuration, such as event handlers, icons, labels, etc. This will be merged into the default configuration. |
| `discard` | Object | Optional; customizes the "Cancel" button configuration, with behavior similar to `conform`. |
| `timeout` | Number | Inherited from parent class, but forcibly set to 0 in this control, meaning auto-closing is disabled. |
| `auto_open` | Boolean | Inherited from parent class, set to true, indicating that the dialog automatically pops up after construction. |

> Note: Other parameters inherited from `PopupWindow` in `opts` are also applicable, but this control internally overrides `timeout` and `auto_open`.

## Main Events

| Event Name | Trigger Timing | Payload Data |
|-----------|----------------|--------------|
| `conformed` | Triggered when the user clicks the "Confirm" button | No specific data, event notification only |
| `cancelled` | Triggered when the user clicks the "Cancel" button | No specific data, event notification only |

> Events are dispatched via `this.dispatch()` and can be listened to by binding event listeners on the instance.