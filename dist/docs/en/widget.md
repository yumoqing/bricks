# Tooltip

**Widget Function**: A floating text widget used to display tooltip information, typically shown when the mouse hovers over an element.  
**Type**: Standard Widget  
**Parent Widget**: `bricks.Text`

## Initialization Parameters

| Parameter | Type   | Description |
|---------|--------|-------------|
| `otext` | String | The original text content to be displayed; supports internationalization |
| `rate`  | Number | Font scaling ratio, default is `0.8` |
| `tip`   | null   | Fixed as `null` to prevent inheriting tooltip behavior |

> Note: During construction, `Tooltip` automatically sets `rate=0.8`, adds the `modal` CSS class, and sets a minimum width of `90px`.

## Main Events

| Event Name | Trigger Timing | Payload |
|-----------|----------------|--------|
| No custom events | —— | —— |

> `Tooltip` does not dispatch any custom events itself, but visibility can be controlled via the `show(otext, event)` and `hide()` methods.

---

# Text

**Widget Function**: A basic text display widget that supports center alignment and font size adjustments based on character size.  
**Type**: Standard Widget  
**Parent Widget**: `bricks.TextBase`

## Initialization Parameters

| Parameter | Type    | Description |
|----------|---------|------------|
| `text`   | String  | The text content to display |
| `otext`  | String  | Original text for internationalization support |
| `i18n`   | Boolean | Whether to enable internationalization (default: `false`) |
| `halign` | String  | Horizontal alignment: `left`, `center`, `right` (default: `center`) |
| `valign` | String  | Vertical alignment: `top`, `center`, `bottom` (default: `center`) |
| `wrap`   | Boolean | Whether line wrapping is allowed |
| `css`    | String  | Custom CSS class name |
| `rate`   | Number  | Font scaling factor, default is `1` |

> Font size dynamically adjusts based on global `bricks.app.charsize`; initial `cfontsize = 1`.

## Main Events

| Event Name | Trigger Timing | Payload |
|-----------|----------------|--------|
| None | `Text` is a static widget with no interactive events | —— |

---

# KeyinText

**Widget Function**: A text input widget that dynamically updates its displayed content by listening to keyboard events; suitable for simple input scenarios.  
**Type**: Standard Widget  
**Parent Widget**: `bricks.Text`

## Initialization Parameters

| Parameter | Type   | Description |
|----------|--------|------------|
| `name`   | String | Data field name, defaults to `'data'`, used as the key in the `changed` event output |
| Other parameters inherited from `Text` | —— | Supports all parameters from `Text` |

> Automatically binds to global `keydown` events, accepting single-character inputs such as letters, numbers, and Enter.

## Main Events

| Event Name | Trigger Timing | Payload |
|-----------|----------------|--------|
| `changed` | Whenever the text changes (including input or deletion) | Object format: `{ [this.name]: current text }`, e.g., `{ data: "abc" }` |

---

# Title1

**Widget Function**: Level-1 title widget with bold font and large font size, intended for main page headings.  
**Type**: Standard Widget  
**Parent Widget**: `bricks.TextBase`

## Initialization Parameters

| Parameter | Type    | Description |
|----------|---------|------------|
| `text` / `otext` | String  | Displayed text or original text for internationalization |
| `i18n`   | Boolean | Whether to enable internationalization |
| `halign` | String  | Horizontal alignment |
| `valign` | String  | Vertical alignment |
| `rate`   | Number  | Scaling ratio, inherits by default |

> Built-in styles: `fontWeight: bold`, `cfontsize: 1.96`, responsive to character size changes.

## Main Events

| Event Name | Trigger Timing | Payload |
|-----------|----------------|--------|
| None | Static text widget, no interaction events | —— |

---

# Title2

**Widget Function**: Level-2 title widget, bold with slightly smaller font than Title1, used for section headings.  
**Type**: Standard Widget  
**Parent Widget**: `bricks.TextBase`

## Initialization Parameters

Same as `Title1`, supports identical parameters.

> Built-in property: `cfontsize: 1.80`, otherwise consistent with `Title1`.

## Main Events

| Event Name | Trigger Timing | Payload |
|-----------|----------------|--------|
| None | Static widget | —— |

---

# Title3

**Widget Function**: Level-3 title widget, used for sub-module or subsection headings.  
**Type**: Standard Widget  
**Parent Widget**: `bricks.TextBase`

## Initialization Parameters

Same as above.

> `cfontsize: 1.64`

## Main Events

| Event Name | Trigger Timing | Payload |
|-----------|----------------|--------|
| None | —— | —— |

---

# Title4

**Widget Function**: Level-4 title widget, a smaller bold title suitable for fine-grained structural division.  
**Type**: Standard Widget  
**Parent Widget**: `bricks.TextBase`

## Initialization Parameters

Same as above.

> `cfontsize: 1.48`

## Main Events

| Event Name | Trigger Timing | Payload |
|-----------|----------------|--------|
| None | —— | —— |

---

# Title5

**Widget Function**: Level-5 title widget with a lightweight styling.  
**Type**: Standard Widget  
**Parent Widget**: `bricks.TextBase`

## Initialization Parameters

Same as above.

> `cfontsize: 1.32`

## Main Events

| Event Name | Trigger Timing | Payload |
|-----------|----------------|--------|
| None | —— | —— |

---

# Title6

**Widget Function**: Level-6 title widget—the smallest heading style, close to body text but still bold.  
**Type**: Standard Widget  
**Parent Widget**: `bricks.TextBase`

## Initialization Parameters

Same as above.

> `cfontsize: 1.16`

## Main Events

| Event Name | Trigger Timing | Payload |
|-----------|----------------|--------|
| None | —— | —— |