# UiType

**Functionality**: Base class for all input controls, providing common methods for value getting, setting, resetting, and disabling.  
**Type**: Regular control  
**Parent Control**: `bricks.Layout`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `name` | string | Control name (required) |
| `value` / `defaultvalue` | any | Default value |
| `required` | boolean | Whether the field is required; default is `false` |

## Main Events

- `changed`: Triggered when the control's value changes, carrying key-value data of the current control.
- `blur`: May be dispatched when the control loses focus (implemented by subclasses).

---

# UiHide

**Functionality**: Hidden field control used to store non-visible data; rendered in DOM as `display: none`.  
**Type**: Regular control  
**Parent Control**: `UiType`

## Initialization Parameters

Inherits from `UiType`, no additional parameters.

## Main Events

- `changed`: Triggered when the value changes.

---

# UiStr

**Functionality**: Single-line text input field supporting alignment, length limits, placeholder, etc.  
**Type**: Regular control  
**Parent Control**: `UiType`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `align` | string | Text alignment: `left`, `center`, `right` |
| `length` | number | Maximum character count (`maxlength`) |
| `minlength` | number | Minimum character count (`minlength`) |
| `tip` | string | Tooltip message (currently unused) |
| `width` | string | Input width (e.g., `'200px'`) |
| `readonly` | string/boolean | Whether the field is read-only |
| `required` | boolean | Whether it is a required field |
| `placeholder` | string | Placeholder text (supports internationalization) |
| `css` | string | Custom CSS class name |
| `dynsize` | boolean | Whether to dynamically adjust font size; default `true` |
| `cfontsize` | number | Font scaling ratio |

## Main Events

- `focus`: Triggered when gaining focus.
- `blur`: Triggered when losing focus.
- `changed`: Triggered when input content changes and passes regex validation.
- `keydown`: Pressing Enter triggers the `blur` event.

---

# UiPassword

**Functionality**: Password input field, inherits from `UiStr`, with masked input display.  
**Type**: Regular control  
**Parent Control**: `UiStr`

## Initialization Parameters

Same as `UiStr`.

## Main Events

Same as `UiStr`.

---

# UiInt

**Functionality**: Integer input field that automatically restricts input to digits only, right-aligned display.  
**Type**: Regular control  
**Parent Control**: `UiStr`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `length` | number | Maximum number of digits allowed (optional) |

## Main Events

- `changed`: Triggered when a valid integer is entered.
- Value is always returned as an integer (via `parseInt`).

---

# UiFloat

**Functionality**: Floating-point number input field, supports decimal precision control and step settings.  
**Type**: Regular control  
**Parent Control**: `UiInt`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `dec_len` | number | Number of decimal places to retain after the decimal point; default is 2 |

## Main Events

- `changed`: Triggered when a valid floating-point number is entered.
- Return value is `parseFloat(this.value)`.

---

# UiTel

**Functionality**: Phone number input field using `<input type="tel">`, supports custom pattern validation.  
**Type**: Regular control  
**Parent Control**: `UiStr`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `pattern` | string | Regular expression string for validating input format |

## Main Events

- `changed`: Triggered when input matches the specified pattern.

---

# UiEmail

**Functionality**: Email input field using `<input type="email">`, supports optional custom pattern validation.  
**Type**: Regular control  
**Parent Control**: `UiStr`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `pattern` | string | Optional custom regex validation rule |

## Main Events

- `changed`: Triggered when input is in valid email format.

---

# UiFile

**Functionality**: File upload control supporting drag-and-drop upload, click-to-select, file type restrictions, and multiple file selection.  
**Type**: Container control  
**Parent Control**: `VBox`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `accept` | string | MIME type prefix accepted, e.g., `'image/'`, `'audio/'` |
| `multiple` | boolean | Whether multiple files are allowed |
| `width` | string | Container width; default `'100%'` |

## Main Events

- `dragenter` / `dragover` / `dragleave` / `drop`: Drag-and-drop related events for highlighting and receiving files.
- `changed`: Triggered after selecting or dropping files, passing file object(s).
- `input`: Native input change event listener.

---

# UiImage

**Functionality**: Image upload control supporting drag-and-drop, click-to-upload, camera button, and image preview after upload.  
**Type**: Container control  
**Parent Control**: `UiFile`

## Initialization Parameters

Same as `UiFile`, with default `accept='image/'`.

## Main Events

- `changed`: Triggered after file selection or taking a photo, includes File object.
- `shot`: Photo capture complete event dispatched by `SysCamera` and captured here.

---

# UiAudio

**Functionality**: Audio upload control supporting microphone recording, with playback preview after upload.  
**Type**: Container control  
**Parent Control**: `UiFile`

## Initialization Parameters

Same as `UiFile`, with default `accept='audio/'`.

## Main Events

- `changed`: Triggered after file selection or recording completes.
- `record_end`: Event dispatched by `SysAudioRecorder` upon completion of recording.

---

# UiVideo

**Functionality**: Video upload control supporting camera-based video recording, with playback preview after upload.  
**Type**: Container control  
**Parent Control**: `UiFile`

## Initialization Parameters

Same as `UiFile`, with default `accept='video/'`.

## Main Events

- `changed`: Triggered after file selection or recording completes.
- `record_end`: Event dispatched by `SysVideoRecorder` upon completion of video recording.

---

# UiCheck

**Functionality**: Checkbox control (visually implemented as icon toggle), representing boolean state (`true`/`false`).  
**Type**: Regular control  
**Parent Control**: `UiType`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `value` | boolean | Initial checked state |

## Main Events

- `changed`: Triggered when state toggles, carries `{name: true/false}` data.
- `state_changed`: Icon state change event (from `MultipleStateIcon`).

---

# UiCheckBox

**Functionality**: Multi-select or single-select group control that generates multiple `UiCheck` + text labels based on data. Supports static data or remote loading.  
**Type**: Container control  
**Parent Control**: `UiType`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `label` | string | Group title |
| `data` | array | Static option list `[ {text:'', value:''} ]` |
| `dataurl` | string | Remote data URL |
| `method` | string | Request method; default is GET |
| `params` | object | Request parameters |
| `textField` | string | Field name for display; default `'text'` |
| `valueField` | string | Field name for value; default `'value'` |
| `value` / `defaultValue` | string/array | Default selected value (string for single-select, array for multi-select) |

> Note: If the `multicheck` property exists and is truthy, the control operates in multi-select mode.

## Main Events

- `changed`: Triggered when any option's state changes, carries `{name: selectedValue(s)}`.
- Internally binds to `UiCheck`'s `changed` event to update values.

---

# UiDate

**Functionality**: Date picker using native `<input type="date">`, supports minimum and maximum date constraints.  
**Type**: Regular control  
**Parent Control**: `UiStr`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `max_date` | string | Maximum allowed date (format YYYY-MM-DD) |
| `min_date` | string | Minimum allowed date (format YYYY-MM-DD) |

## Main Events

- `changed`: Triggered when the date is changed.
- `blur` / `focus`: Focus events supported via parent class.

---

# UiText

**Functionality**: Multi-line text area (`<textarea>`), supports Tab indentation, line breaks on Enter, and dynamic font sizing.  
**Type**: Regular control  
**Parent Control**: `UiType`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `rows` | number | Number of rows; default 5 |
| `cols` | number | Number of columns; default 40 |
| `readonly` | boolean | Whether the field is read-only |
| `required` | boolean | Whether it is required |
| `value` / `defaultvalue` | string | Default text content |

## Main Events

- `input`: Updates internal value when content changes.
- `keydown`: Intercepts Tab and Enter keys to enable smart indentation and line breaks.
- `changed`: Manually dispatched when content changes.

---

# UiCode

**Functionality**: Dropdown select box (`<select>`), used for code table selection, supports local data or asynchronous loading.  
**Type**: Regular control  
**Parent Control**: `UiType`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `data` | array | Static options data `[ {text:'', value:''} ]` |
| `dataurl` | string | API endpoint for asynchronously fetching options |
| `method` | string | Request method; default GET |
| `params` | object | Request parameters |
| `textField` | string | Display field name; default `'text'` |
| `valueField` | string | Value field name; default `'value'` |
| `nullable` | boolean | Whether to allow null selection (adds empty item at start) |
| `value` / `defaultvalue` | string | Default selected value |

## Main Events

- `input`: Triggered when selection changes, updates value and dispatches `changed`.
- `changed`: Notifies external components after value change.
- Supports externally triggered data reload (e.g., for cascading filters).

---

# UiSearch

**Functionality**: Search selection control — clicking the icon opens a popup window showing a table for selection, commonly used for associated queries.  
**Type**: Container control  
**Parent Control**: `HBox`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `search_url` | string | URL of the page loaded in the popup |
| `valueField` | string | Field name corresponding to return value |
| `textField` | string | Field name corresponding to display text |
| `popup_options` | object | Configuration options for the popup window |
| `value` | string | Initial value |
| `text` | string | Initial display text |

## Main Events

- `click` on icon: Opens the search popup.
- `changed`: Triggered after selecting a record from the popup, returns the selected value.
- `dismiss`: Event triggered when the popup is closed.