# Wterm

**Widget Functionality**: A web terminal widget based on xterm.js, enabling an interactive terminal interface embedded in a browser that communicates with the backend via WebSocket. Supports features such as adaptive terminal sizing, heartbeat keep-alive, and data transmission for input and output.

**Type**: Regular Widget  
**Parent Widget**: `bricks.JsWidget`

## Initialization Parameters

- `ws_url` (String, required)  
  The WebSocket URL used to establish communication with the backend terminal service.

- `ping_timeout` (Number, optional, default: 19)  
  Interval (in seconds) for sending heartbeat messages to the server to maintain an active connection.

> Other general options inherited from `JsWidget` also apply, such as layout and styling.

## Main Events

- `domon`  
  Triggered when the widget is mounted into the DOM. Automatically calls `send_term_size()` to send the current terminal dimensions to the server.

- `domoff`  
  Triggered when the widget is removed from the DOM. Performs cleanup tasks including closing the WebSocket connection and destroying the terminal instance.

- `element_resize`  
  Triggered when the size of the widget's container element changes. Adjusts the terminal display area and re-applies size fitting (via `FitAddon`).

- `terminal_input` (implicit event)  
  Fired via `term.onData` when the user inputs characters in the terminal. Sends the input data to the server through the WebSocket connection.

- `terminal_resize`  
  Triggered when the number of rows or columns in the terminal changes (listened via `term.onResize`). Automatically calls `send_term_size()` to synchronize the updated dimensions with the server.

- `websocket_message`  
  Handles incoming WebSocket messages according to their type:
  - `data`: Writes the content to the terminal display.
  - `heartbeat`: Heartbeat response indicating the connection is alive.
  - Other types: Logs messages for debugging purposes.

- `websocket_open`, `websocket_close`, `websocket_error`  
  WebSocket lifecycle events that handle connection establishment, closure, and errors respectively, ensuring proper resource cleanup and release.