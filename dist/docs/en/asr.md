# ASRClient

**Widget Functionality**: Implements a speech recognition client that communicates with the server via WebSocket, sending audio data in real-time and receiving transcription results. Provides interactive buttons to start/stop recording and triggers corresponding events.

**Type**: Standard Widget  
**Parent Widget**: `bricks.VBox`

## Initialization Parameters

- `start_icon` (String, optional)  
  Icon path displayed when in the recording-start state. Default is `imgs/start_recording.svg`.

- `stop_icon` (String, optional)  
  Icon path displayed when in the recording-stop state. Default is `imgs/stop_recording.svg`.

- `ws_url` (String, required)  
  WebSocket server address used to establish a connection with the speech recognition backend.

- `icon_options` (Object, optional)  
  Configuration options for the icon widget, passed directly to the `bricks.Svg` instance, allowing customization of icon appearance.

- `ws_params` (Object, optional)  
  Additional parameters sent to the WebSocket server, merged and included when transmitting audio data.

## Main Events

- `start`  
  **Triggered when**: The user clicks the icon to begin recording.  
  **Parameters**: None

- `stop`  
  **Triggered when**: The user clicks the icon to stop recording.  
  **Parameters**: None

- `transtext`  
  **Triggered when**: A speech recognition result is received from the server.  
  **Parameters**:  
  ```json
  {
    "content": "Transcribed text content",
    "speaker": "Speaker identifier (if supported)",
    "start": "Timestamp indicating the start of the audio segment",
    "end": "Timestamp indicating the end of the audio segment"
  }
  ```
  **Note**: This event is dispatched after the `response_data` method parses the server message, enabling higher-level components to handle the recognition result.