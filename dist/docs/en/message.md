# Message

## Control Functionality, Type (Regular or Container Control), and Parent Control
- **Functionality**: Displays a popup notification with a title and message content. Supports automatic opening, text wrapping, center alignment, and internationalization (i18n).
- **Type**: Container control (can contain child controls such as text, scroll panels, etc.)
- **Parent Control**: `bricks.PopupWindow`

## Initialization Parameters
| Parameter | Type | Required | Description |
|---------|------|----------|-------------|
| title | string | Yes | Title text of the popup |
| message | string | Yes | Message content to be displayed |
| cheight | number | No | Height of the content area (default is 9) |
| cwidth | number | No | Width of the content area (default is 16) |
| auto_open | boolean | Automatically set to `true` | Automatically set to `true` during construction; the window opens immediately after creation |

> Note: `auto_open` is forcibly set to `true` in the constructor.

## Main Events
No custom events defined. Standard inherited events from `PopupWindow`, such as `onOpen` and `onClose`, are available.

---

# Error

## Control Functionality, Type (Regular or Container Control), and Parent Control
- **Functionality**: Based on the `Message` control, specifically designed for displaying error messages. Adds an "error" CSS class to visually highlight the error state.
- **Type**: Container control
- **Parent Control**: `bricks.Message`

## Initialization Parameters
Inherits all parameters from the `Message` control:
| Parameter | Type | Required | Description |
|---------|------|----------|-------------|
| title | string | Yes | Title of the error popup |
| message | string | Yes | Detailed error content |
| cheight | number | No | Popup height, default is 9 |
| cwidth | number | No | Popup width, default is 16 |

> Note: The `'error'` style class is automatically applied upon instantiation.

## Main Events
Same as `Message`; no additional events. Inherited events like `onOpen` and `onClose` can be used.

> In practice, this is typically invoked via the `bricks.show_error()` function.

---

### Additional Utility Methods (Not Controls — Not Documented Separately)

#### `bricks.show_error(opts)`
- **Functionality**: Quickly displays an error message popup
- **Parameters**:
  - `opts`: An object containing `title` and `message`, optionally `cheight` / `cwidth`
- **Behavior**:
  - Uses default dimensions (`cheight=9`, `cwidth=16`) if not specified
  - Creates a `bricks.Error` instance and calls `.open()`

#### `bricks.show_message(opts)`
- **Functionality**: Quickly displays a general message popup
- **Parameters**:
  - `opts`: Same as above, includes `title` and `message`
- **Behavior**:
  - Creates a `Message` popup with default size and opens it

> These two functions provide convenient shortcuts, suitable for scenarios where manual lifecycle management of components is not required.