# VScrollPanel

**Control Function**: Vertical scroll panel, used to provide vertical scrolling capability when content exceeds the container height. It also supports triggering threshold events when scrolling approaches the top or bottom.

**Type**: Container control  
**Parent Control**: `bricks.VBox`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `min_threshold` | Number (optional) | Threshold ratio at which the `min_threshold` event is triggered when the scrollbar approaches the top. Default is `0.02` (i.e., 2%) |
| `max_threshold` | Number (optional) | Threshold ratio at which the `max_threshold` event is triggered when the scrollbar approaches the bottom. Default is `0.95` (i.e., 95%) |
| `width` | String | Defaults to `'100%'`, meaning the control occupies the full width of its parent container |
| `height` | String | Defaults to `'100%'`, meaning the control occupies the full height of its parent container |
| `css` | String (optional) | Custom CSS class name; the class `'scrollpanel'` will be added in addition |
| `overflow` | String | Fixed as `'auto'`, enabling automatic display of scrollbars |

> Note: The above `width`, `height`, `css`, and `overflow` properties are automatically set in the constructor.

## Main Events

- **`min_threshold`**  
  Triggered when the vertical scroll position approaches the top (determined by `min_threshold`). Typically indicates that the user has scrolled to the very top, useful for actions such as loading more content.

- **`max_threshold`**  
  Triggered when the vertical scroll position approaches the bottom (determined by `max_threshold`). Commonly used to implement "infinite scroll" or "load more on reaching end" functionality.

---

# HScrollPanel

**Control Function**: Horizontal scroll panel, used to provide horizontal scrolling capability when content exceeds the container width. It can trigger threshold events when scrolling approaches the far left or right edges.

**Type**: Container control  
**Parent Control**: `bricks.HBox`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `min_threshold` | Number (optional) | Threshold ratio at which the `min_threshold` event is triggered when the horizontal scrollbar approaches the left edge. Default is `0.01` (i.e., 1%) |
| `max_threshold` | Number (optional) | Threshold ratio at which the `max_threshold` event is triggered when the horizontal scrollbar approaches the right edge. Default is `0.99` (i.e., 99%) |
| `width` | String | Defaults to `'100%'`, meaning the control occupies the full width of its parent container |
| `height` | String | Defaults to `'100%'`, meaning the control occupies the full height of its parent container |
| `css` | String (optional) | Custom CSS class name; will be combined with the `'scrollpanel'` class |
| `overflow` | String | Fixed as `'auto'`, allowing horizontal scrollbar to appear when needed |

> Note: `width`, `height`, `css`, and `overflow` are automatically configured by the constructor.

## Main Events

- **`min_threshold`**  
  Triggered when the horizontal scroll position approaches the far left. Can be used to load additional content on the left or execute other logic.

- **`max_threshold`**  
  Triggered when the horizontal scroll position approaches the far right. Suitable for implementing "load more on horizontal scroll" scenarios.