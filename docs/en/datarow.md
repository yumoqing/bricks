# DataRow

**Control Functionality**: Used to display a single row of data in a table or list, supporting rendering of both header and data rows. It can include field display, checkbox selection, and toolbar operations. Commonly used for row-level interactions in data browsing interfaces.

**Type**: Container Control  
**Parent Control**: `bricks.HBox`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `opts.toolbar` | Array | Toolbar configuration array, defining operation icon buttons that can be displayed on the row (only effective for non-header rows). Each tool item triggers its corresponding event. |
| `opts.fields` | Array | Array of field definitions; each element describes a displayed field, including attributes such as `name`, `label`, `uitype`, `cwidth`, etc. |
| `opts.css` | String/Object | Custom CSS class name or CSS property object applied to the root element of this control. |
| `opts.browserfields` | Object | Field control options in browse mode:<br> - `excluded`: Array of field names to exclude from display;<br> - `cwidth`: Column width for each field specified in character units. |
| `opts.editexcluded` | Array | List of fields to exclude in edit mode (currently unused). |
| `opts.header_css` | String/Object | Custom styles specifically applied to the header row. |
| `opts.checkField` | String | If set, adds a checkbox at the beginning of the row bound to the specified field name, enabling selection/deselection of records. |

> Note: `DataRow` inherits from `HBox`, so it also supports layout-related parameters such as `height: 'auto'`.

## Main Events

| Event Name | Trigger Timing | Passed Parameters |
|----------|----------------|-------------------|
| `check_changed` | Triggered when the checkbox state within the row changes | The `DataRow` instance that triggered the event |
| `[tool.name]` (dynamic) | Triggered when clicking a non-blank icon button in the toolbar; the event name corresponds to the button's `name` attribute | Triggered by `IconBar`, carrying click information, forwarded to external listeners via `my_dispatch` |

> Example: If `toolbar.tools` contains `{ name: 'delete' }`, clicking this icon will trigger an event named `delete`.