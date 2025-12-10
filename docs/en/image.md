# Image

## Widget Functionality, Type (Basic or Container Widget), and Parent Widget  
A widget used to display images. Supports setting an image URL, a default fallback image for error cases, and exporting the current image content as a Base64 string.  
**Type:** Basic Widget  
**Parent Widget:** `bricks.JsWidget`

### Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `url` | String | The image URL; automatically assigned to the `<img>` element's `src` attribute during construction |
| `default_url` | String | Fallback image URL displayed when the original image fails to load |
| `height` | Number (Optional) | Sets the image height (can also be handled by CSS or DOM) |
| `width` | Number (Optional) | Sets the image width (can also be handled by CSS or DOM) |

> Note: All parameters are passed into the constructor via the `opts` object.

### Main Events

No explicit events defined. However, the native `<img>` element's `onerror` event is internally used to handle image loading failures:

- **`onerror` → Triggers `set_default_url()`**  
  When image loading fails, automatically switches to the fallback image specified by `default_url`, and removes the error listener to prevent recursive triggering.

---

# Icon

## Widget Functionality, Type (Basic or Container Widget), and Parent Widget  
An icon widget extended from `Image`, supporting size scaling based on character units (`charsize`), dynamic resizing, and layout adaptation. Commonly used for small icons aligned with text in UIs.  
**Type:** Basic Widget  
**Parent Widget:** `bricks.Image`

### Initialization Parameters

| Parameter | Type | Description |
|----------|------|-------------|
| `url` | String | Icon image URL, inherited from `Image` |
| `rate` | Number | Scaling factor, default is `1`; actual size = `charsize * rate` |
| `cwidth` | Number | Occupied character width, default is `1` |
| `cheight` | Number | Occupied character height, default is `1` |
| `dynsize` | Boolean | Whether dynamic sizing is enabled, default is `true`; adjusts size according to `charsize_sizing()` |

> Note: `charsize` comes from `bricks.app.charsize`, which is a font-based base unit at the application level.

### Main Events

No independent events defined. Behavior is primarily triggered through `options_parse()` during initialization or after property changes.

- **`options_parse()`**  
  Called during widget initialization to parse and apply size-related options, including setting the URL and adjusting dimensions.

---

# StatedIcon

## Widget Functionality, Type (Basic or Container Widget), and Parent Widget  
A stateful icon widget that switches between different images based on its current state. Suitable for scenarios such as toggle states or multi-state indicators.  
**Type:** Basic Widget  
**Parent Widget:** `bricks.Icon` (indirectly inherits from `Image`)

### Initialization Parameters

| Parameter | Type | Description |
|----------|------|-------------|
| `states` | Array<{state: String, url: String}> | Array of states, each containing a state name and corresponding image URL |
| `state` | String | Initial state name; if not specified, defaults to `states[0].state` |
| `rate`, `cwidth`, `cheight`, `dynsize` | Same as above | Layout and styling parameters inherited from `Icon` |

> Example:
> ```js
> {
>   states: [
>     { state: 'normal', url: 'icon-normal.png' },
>     { state: 'active', url: 'icon-active.png' }
>   ],
>   state: 'normal'
> }
> ```

### Main Events

- **`set_state(state)`**  
  Method: Manually sets the current state. The widget searches for the matching state entry and updates the image URL, then re-parses options and re-renders.  
  - Parameter: `state` — the target state string  
  - Behavior: Iterates through `this.states`, finds the matching item, and calls `super.options_parse()` to update the view.

---

# BlankIcon

## Widget Functionality, Type (Basic or Container Widget), and Parent Widget  
A blank placeholder icon widget that displays no image, serving only as a transparent spacer with fixed character dimensions. Used for layout alignment or reserving space before dynamic replacement.  
**Type:** Basic Widget  
**Parent Widget:** `bricks.JsWidget`

### Initialization Parameters

| Parameter | Type | Description |
|----------|------|-------------|
| `rate` | Number | Size scaling factor, default is `1`, affects calculation based on `charsize` |
| `cwidth` | Number | Occupied character width, default is `1` |
| `cheight` | Number | Occupied character height, default is `1` |
| `dynsize` | Boolean | Whether dynamic sizing is enabled, default is `true`; controls responsiveness to `charsize_sizing()` |

### Main Events

No public events or callbacks. Its core purpose is to maintain consistent sizing behavior with other icons in the UI layout, without loading any image resources.