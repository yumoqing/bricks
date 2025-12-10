# Svg

**Widget Functionality**: Used to load and display SVG icons. Supports dynamic color setting, blinking effects, and adaptive sizing.  
**Type**: Regular widget  
**Parent Widget**: `bricks.VBox`

## Initialization Parameters

| Parameter   | Type   | Description |
|-----------|--------|-------------|
| `rate`     | Number | Scaling factor, default is 1. Affects width and height (`cwidth` and `cheight`) |
| `url`      | String | URL of the SVG file, used to dynamically load SVG content |
| `color`    | String | Fill color for the SVG (optional). If not specified, the default color is retrieved from the application |
| `blinktime`| Number | Blinking interval in milliseconds. If set, enables periodic blinking (show/hide) |

> **Notes**:
> - `cwidth` and `cheight` are automatically set to the value of `rate`.
> - `dynsize` is fixed as `true`, indicating dynamic sizing is enabled.
> - If `color` is not provided, `bricks.app.get_color()` will be called to obtain the default color.

## Main Events

No custom events. However, interaction can be achieved via DOM event binding.

---

# StatedSvg

**Widget Functionality**: Inherits from `Svg`. An SVG widget that supports multiple state switching. Each state corresponds to an SVG resource URL. Clicking cycles through states in order and triggers a state change event.  
**Type**: Regular widget  
**Parent Widget**: `bricks.Svg`

## Initialization Parameters

| Parameter   | Type    | Description |
|-----------|---------|-------------|
| `states` | Array<{state: String, url: String}> | Array of states, each element contains a state identifier and its corresponding SVG URL |
| `state`  | String  | Initial state value; if not set, defaults to `states[0].state` |

> Example format:
> ```js
> states: [
>   { state: 'on', url: '/icons/light_on.svg' },
>   { state: 'off', url: '/icons/light_off.svg' }
> ]
> ```

## Main Events

| Event Name       | Trigger Condition |
|------------------|-------------------|
| `state_changed`  | Triggered when the current state changes, passing the new state as parameter |

> Usage example:
> ```js
> widget.on('state_changed', function(newState) {
>   console.log('State changed to:', newState);
> });
> ```

---

# MultipleStateIcon

**Widget Functionality**: A multi-state icon widget that manages multiple states and their corresponding SVG URLs using key-value pairs. Clicking cycles through the states and updates the displayed content.  
**Type**: Regular widget  
**Parent Widget**: `bricks.Svg`

## Initialization Parameters

| Parameter   | Type             | Description |
|-----------|------------------|-------------|
| `urls`    | Object<String: String> | Keys are state names, values are corresponding SVG URLs, e.g., `{ normal: '...', active: '...' }` |
| `state`   | String           | Initial state; must be one of the keys in `urls` |

> Example:
> ```js
> urls: {
>   play: '/icons/play.svg',
>   pause: '/icons/pause.svg',
>   stop: '/icons/stop.svg'
> },
> state: 'play'
> ```

## Main Events

| Event Name       | Trigger Condition |
|------------------|-------------------|
| `state_changed`  | Triggered after a successful state switch via `change_state`, passing the new state name as parameter |

> Supports listening to state changes via `.on('state_changed', ...)` method.