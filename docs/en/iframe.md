# NewWindow

## Widget Functionality, Type (Regular or Container Widget), and Parent Widget
- **Widget Functionality**: Opens a new browser window and loads the specified URL.
- **Widget Type**: Regular widget
- **Parent Widget**: `bricks.JsWidget`

## Initialization Parameters
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `url`     | string | Yes      | The URL of the page to open in the new window. |
| `name`    | string | No       | The name of the new window (i.e., the second parameter of `window.open`). Defaults to `'_blank'`, which opens a new tab. |

## Key Events
No key events. This widget immediately executes `window.open()` upon initialization and does not provide any listenable events.

---

# Iframe

## Widget Functionality, Type (Regular or Container Widget), and Parent Widget
- **Widget Functionality**: Creates an embedded iframe to include another web page within the current page. Supports setting height and automatically loading the specified URL.
- **Widget Type**: Regular widget
- **Parent Widget**: `bricks.Layout`

## Initialization Parameters
| Parameter | Type          | Required | Description |
|-----------|---------------|----------|-------------|
| `url`     | string        | Yes      | The URL of the page to embed in the iframe. |
| `height`  | string or number | No   | The height of the iframe. Defaults to `'100%'`. |

## Key Events
No key events. This widget directly sets the `src` attribute in the constructor to load the page and does not define any custom events.