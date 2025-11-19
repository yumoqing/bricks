# MultipleStateImage

**Widget Functionality**: An image widget with switchable states that displays different images based on its current state. Clicking the image automatically switches it to the next state.

**Type**: Ordinary Widget  
**Parent Widget**: `bricks.Layout`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `state` | String | The initial state name, which must exist as a key in the `urls` object |
| `urls` | Object | A mapping of states to image URLs, formatted as `{ state1: url1, state2: url2, ... }` |
| `width` | Number (optional) | Display width of the image |
| `height` | Number (optional) | Display height of the image |

**Example**:
```js
{
  state: "normal",
  urls: {
    normal: "image-normal.png",
    hover: "image-hover.png",
    disabled: "image-disabled.png"
  },
  width: 100,
  height: 50
}
```

## Main Events

| Event Name | Trigger Timing | Data Carried |
|-----------|----------------|--------------|
| `state_changed` | Triggered after the widget's state changes due to a click or calling `set_state` | The new state name (String) |

**Notes**:
- When the user clicks the image, the widget cycles through the states defined in the `urls` object in order and triggers the `state_changed` event.
- You can also manually set the state and update the displayed image by calling the `set_state(state)` method.