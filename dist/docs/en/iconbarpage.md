# IconbarPage

**Widget Functionality**: A page container with an icon toolbar that supports placing the icon-text toolbar (IconTextBar) either at the top or bottom. Clicking a toolbar item dynamically loads and displays the corresponding content component.  
**Type**: Container widget  
**Parent Widget**: `bricks.VBox`

## Initialization Parameters

- `opts`: Configuration object containing the following properties:
  - `bar_opts` *(Object)*: Configuration options for the icon toolbar, passed to `bricks.IconTextBar`.
    - `margin` *(String | Number)*: External margin of the toolbar.
    - `rate` *(Number)*: Proportion this toolbar occupies in the layout.
    - `tools` *(Array)*: Array of tool items, each being an object with the following structure:
      - `name` *(String)*: Name of the tool, used as an identifier.
      - `icon` *(String)*: Class name or path of the icon.
      - `label` *(String, optional)*: Text label for the tool.
      - `tip` *(String)*: Tooltip shown when hovering over the tool.
      - `dynsize` *(Boolean)*: Whether to dynamically resize.
      - `rate` *(Number)*: Proportion this tool occupies in the layout.
      - `content` *(Object | String)*: Configuration or type name describing the child widget to be loaded, used to dynamically construct the content.
  - `bar_at` *(String)*: Specifies the position of the toolbar; valid values are `'top'` or `'bottom'`, default is `'top'`.

> **Note**: The constructor automatically sets `height: '100%'`.

## Main Events

- `command` event:
  - **Source**: Triggered by the internal `IconTextBar` instance.
  - **Callback parameter**: `event.params` contains the clicked `tool` object.
  - **Behavior**: When a user clicks on a tool icon, the `command_handle` method is invoked, which dynamically creates a content component based on `tool.content` and replaces the current content area.

```javascript
bar.bind('command', this.command_handle.bind(this))
```