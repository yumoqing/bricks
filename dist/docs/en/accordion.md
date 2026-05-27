# Accordion

**Control Functionality**: Accordion is a collapsible panel control that allows users to toggle the display of different content areas by clicking on title buttons. It is commonly used to organize multiple content blocks and save interface space.

**Type**: Container Control  
**Parent Control**: `bricks.VBox`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `item_size` | String (optional) | The height of each accordion item's header; defaults to `'25px'`. |
| `items` | Array\<Object\> | List of accordion items. Each object contains the following properties:<br>- `name`: Unique identifier for the item<br>- `icon`: Icon displayed before the button (optional)<br>- `label`: Text shown on the button<br>- `content`: Widget configuration object (e.g., `widgettype`) used to dynamically build the content<br>- `refresh` (Boolean, optional): Whether to reload the content every time the item is clicked |
| `item_css` | String (optional) | CSS class name for the header buttons; defaults to `'accordion-button'`. |
| `content_css` | String (optional) | CSS class name for the content area; defaults to `'accordion-content'`. |

Example:
```js
{
  item_size: '30px',
  items: [
    {
      name: 'panel1',
      label: 'Basic Information',
      icon: 'info',
      content: { widgettype: 'Label', text: 'This is basic information' }
    },
    {
      name: 'panel2',
      label: 'Settings',
      refresh: true,
      content: { widgettype: 'Form', fields: [...] }
    }
  ]
}
```

## Main Events

| Event Name | Trigger Timing | Callback Parameters | Description |
|-----------|----------------|----------------------|-------------|
| `click` (internally bound) | Triggered when a user clicks on an accordion item's header button | `event.target.bricks_widget` refers to the clicked `Button` instance | Core event controlling content switching. Internally bound and handled to manage content loading and display. |

> Note: This control does not expose custom event APIs externally, but its behavior relies on the `Button`'s `click` event to drive the content-switching logic. Developers can extend functionality by listening to child control events.