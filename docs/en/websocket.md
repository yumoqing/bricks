# WebSocket

**Widget Functionality**: Establishes a WebSocket connection with the backend, supports sending and receiving text and Base64-encoded audio/video data, and provides various event callbacks.  
**Type**: Regular widget  
**Parent Widget**: `bricks.VBox`

## Initialization Parameters

| Parameter Name | Type    | Description |
|----------------|---------|-------------|
| ws_url         | string  | The WebSocket server URL (e.g., `ws://example.com/socket`) |
| with_session   | boolean | Whether to include current session information; if `true`, retrieves session from `bricks.app.get_session()` and passes it to the WebSocket constructor (Note: There is a typo in the source code — `sessopn` should be `session`) |

> Example:
> ```js
> new bricks.WebSocket({
>   ws_url: "ws://localhost:8080/ws",
>   with_session: true
> });
> ```

## Main Events

| Event Name        | Trigger Condition |
|-------------------|-------------------|
| onopen            | Triggered when the WebSocket connection is successfully opened |
| onmessage         | Triggered when a message is received from the server (raw message) |
| onerror           | Triggered when an error occurs in the WebSocket connection |
| onclose           | Triggered when the WebSocket connection is closed |
| ontext            | Triggered when a message of type `text` is received (dispatched after parsing by `on_message`) |
| onbase64audio     | Triggered when a message of type `base64audio` is received |
| onbase64video     | Triggered when a message of type `base64video` is received |

> Other custom types can be dynamically dispatched via the `ontypedata` pattern, formatted as `on + type`.

### Event Data Description

- All event data dispatched after parsing in `onmessage` comes from JSON-formatted `e.data`, with the following structure:
  ```json
  {
    "type": "text",
    "data": "Hello"
  }
  ```
  The widget automatically dispatches the corresponding event (e.g., `ontext`) based on the `type` field, and passes the `data` field as the parameter to the event handler.