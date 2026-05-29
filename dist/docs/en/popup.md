# Popup

**Widget Functionality**: A popup layer widget used to display modal or non-modal floating windows on a page. Supports features such as automatic open/close, closing when clicking outside the popup, drag-to-move, resize, and auto-close after a timeout.  
**Type**: Container Widget  
**Parent Widget**: `bricks.VBox`

## Initialization Parameters

| Parameter | Type | Default Value | Description |
|---------|------|---------------|-------------|
| `timeout` | number | `0` | Auto-close delay time (in milliseconds); 0 means no auto-closing |
| `anchor` | string | `'cc'` | Anchor point for popup positioning, one of: `tl`, `tc`, `tr`, `cl`, `cc`, `cr`, `bl`, `bc`, `br`, indicating position relative to the screen |
| `widget` | string / Widget / null | `null` | Associated target widget (ID or object), used for positioning or disabling |
| `auto_open` | boolean | `true` | Whether to automatically open the popup after creation |
| `auto_dismiss` | boolean | `true` | Whether to automatically close when clicking outside the popup area |
| `auto_destroy` | boolean | `true` | Whether to automatically destroy the widget after closing |
| `movable` | boolean | `true` | Whether dragging to move is allowed |
| `resizable` | boolean | `false` | Whether resizing is allowed |
| `modal` | boolean | `true` | Whether it's a modal window (with overlay and disables target widget) |
| `content` | object | `undefined` | Content configuration object that will be asynchronously loaded when opened |
| `dismiss_events` | array | `undefined` | Array of event names; triggers dismissal when any of these events occur |

> Note: On mobile devices, default width and height are `100%`; on desktop, they are `70%`.

## Main Events

| Event Name | Trigger Timing | Description |
|-----------|----------------|------------|
| `opened` | Triggered after the popup is displayed and layout completed | Typically used for loading dynamic content |
| `dismissed` | Triggered when the popup is hidden | Can be used for resource cleanup |
| `destroy` | Triggered when the widget is destroyed | Only triggered if `auto_destroy` is true |

---

# PopupWindow

**Widget Functionality**: An application-level window widget with title bar, supporting drag, resize, minimize, maximize, fullscreen, and close operations. Commonly used to simulate desktop application windows.  
**Type**: Container Widget  
**Parent Widget**: `bricks.Popup`

## Initialization Parameters

| Parameter | Type | Default Value | Description |
|----------|------|---------------|-------------|
| `title` | string | `"[Untitle window]"` | Window title text |
| `icon` | string | Built-in icon path | URL of the icon displayed at the top-left corner of the window |
| `rate` | number | `1.5` | Icon scaling ratio |
| `auto_open` | boolean | `true` | Whether to automatically open the window after creation |
| Other parameters | —— | Inherited from `Popup` | Includes `width`, `height`, `modal`, `movable`, `resizable`, etc., all inherited with `movable` and `resizable` enabled by default |

> Note: `PopupWindow` forcibly sets `movable=true`, `resizable=true`, and defaults `auto_dismiss=false`, `auto_destroy=false`.

## Main Events

| Event Name | Trigger Timing | Description |
|-----------|----------------|------------|
| `opened` | Triggered after the window opens and rendering completes | Inherited from `Popup` |
| `dismissed` | Triggered when the window is closed (minimizing is also considered dismissed) | Can be used for state synchronization |
| `destroy` | Triggered when calling `destroy()` method or clicking the close button | Executes cleanup logic before actual destruction |

### Built-in Toolbar Event Bindings

- `delete`: Triggered when the close button is clicked; calls `destroy()` to destroy the window.
- `minimize`: Triggered when the minimize button is clicked; calls `win_minimize()` to hide the window and add it to the `app.mwins` list.
- `fullscreen`: Triggered when the fullscreen button is clicked; enters fullscreen mode.

> Minimized windows can be reopened via the `WindowsPanel`.