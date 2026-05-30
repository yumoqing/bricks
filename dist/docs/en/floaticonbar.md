# IconBar

**Widget Functionality**: Creates an icon toolbar containing multiple clickable SVG icon buttons, supporting selection states and event dispatching.  
**Type**: Container widget  
**Parent Widget**: `bricks.HBox`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `opts.cheight` | Number | Height of child widgets (in character units), default is `2` |
| `opts.rate` | Number | Scaling factor affecting icon size, default is `1` |
| `opts.margin` | String | Left and right margins between icons, in CSS format (e.g., `'10px'`) |
| `opts.tools` | Array | Array of tool items, each being an object with the following fields:<br>- `name`: Tool name (used for identification and events)<br>- `icon`: URL of the SVG icon<br>- `rate`: Optional scaling ratio for this specific icon<br>- `dynsize`: Whether to dynamically adjust size (boolean)<br>- `tip`: Tooltip text (optional) |

> If `cheight` or `rate` is not provided, default values will be automatically set.

## Main Events

| Event Name | Trigger Condition | Payload Data |
|-----------|-------------------|--------------|
| `desc.name` (i.e., `tools[i].name`) | Triggered when a specific icon is clicked; event name equals the `name` field of that icon | Passes the corresponding icon's `desc` object |
| `command` | Triggered on any icon click — a unified event for all icons | Passes the `desc` object of the clicked icon |

> Events are dispatched via `dispatch`, allowing external components to listen for specific commands or general actions.

---

# IconTextBar

**Widget Functionality**: Extends `IconBar`. Each tool item is displayed as a combination of "icon + text", suitable for toolbars requiring labeled descriptions.  
**Type**: Container widget  
**Parent Widget**: `bricks.IconBar`

## Initialization Parameters

Inherits all parameters from `IconBar`, with enhanced support for each item in the `tools` array:

| Parameter | Type | Description |
|---------|------|-------------|
| `opts.tools[i].label` | String | Text label displayed next to the icon |
| `opts.tools[i].tip` | String | Tooltip shown on hover, applied to the entire icon+text container |
| Other parameters same as `IconBar` | —— | Supports `name`, `icon`, `rate`, `dynsize`, etc. |

> Each tool item is constructed as a horizontal layout (`HBox`), internally composed of `Svg` and `Text` widgets in sequence.

## Main Events

Identical to `IconBar`:

| Event Name | Trigger Condition | Payload Data |
|-----------|-------------------|--------------|
| `desc.name` | Triggered when a tool item is clicked; event name is its `name` | The corresponding `desc` object |
| `command` | Triggered on every icon click | `desc` object of the current item |

> Events are bound to the overall `HBox`; clicking either the icon or the text triggers the event.

---

# FloatIconBar

**Widget Functionality**: A floating icon toolbar that initially displays only a "floating icon". On mouse hover, it expands into a full `IconBar`. Commonly used for side-floating toolbars.  
**Type**: Container widget  
**Parent Widget**: `bricks.HBox`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `opts` | Object | Configuration object passed to the internal `IconBar`, structured like `IconBar`'s `opts.tools` and related options |
| Uses `bricks_resource('imgs/float-out.png')` internally | —— | Fixed icon for the floating button |

> Actual tool items are defined through the provided `opts`, which are used to construct the internal `IconBar`.

## Main Events

Same as the internal `IconBar`:

| Event Name | Trigger Condition | Payload Data |
|-----------|-------------------|--------------|
| `desc.name` | Triggered when a user clicks an icon in the expanded toolbar | `desc` object of the corresponding icon |
| `command` | Triggered on any icon click in the expanded bar | `desc` object of the clicked icon |

> Events originate from the embedded `IconBar` instance and are automatically forwarded (transparently passed up).

Additional behavioral events:
- `mousemove` over the floating icon triggers expansion of the menu
- A `click` anywhere on the page triggers collapse of the menu (via listening on `bricks.Body`)

---

# FloatIconTextBar

**Widget Functionality**: Floating "icon + text" toolbar, an extended version of `FloatIconBar`. When expanded, it displays tool items with textual labels.  
**Type**: Container widget  
**Parent Widget**: `bricks.FloatIconBar`

## Initialization Parameters

Same as `FloatIconBar`:

| Parameter | Type | Description |
|---------|------|-------------|
| `opts` | Object | Contains the `tools` array and other configurations, used internally when constructing the `IconTextBar` |

> Internally calls `build_bar(opts)` to create an `IconTextBar` instance, thus supporting text-related properties such as `label` and `tip`.

## Main Events

Same as `IconTextBar`:

| Event Name | Trigger Condition | Payload Data |
|-----------|-------------------|--------------|
| `desc.name` | Triggered when a tool item in the expanded bar is clicked | `desc` object of the selected item |
| `command` | Triggered on any click within the expanded bar | `desc` object of the current item |

> All events are emitted by the internal `IconTextBar` instance and automatically bubble up.