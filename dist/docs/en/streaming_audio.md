# StreamAudio

**Widget Functionality**: Implements real-time audio stream capture, voice activity detection (VAD) triggering, audio upload, and receiving recognized text results returned from the server. Commonly used in speech recognition scenarios.  
**Type**: Container widget  
**Parent Widget**: `bricks.VBox`

## Initialization Parameters

- `opts` {Object} - Configuration options object, inherited from `VBox`, with the following extended properties:
  - `name` {string} (Optional) - Widget name; defaults to `'asr_text'`.
  - `height` {string} - Fixed height of `'100%'`; cannot be overridden.
  - Other general parameters supported by `VBox` (e.g., `layout`, etc.).

> **Note**: The constructor automatically sets `height='100%'` and the default `name`, and creates internal child widgets (button, spacers, text display, etc.).

## Main Events

No custom events are directly exposed externally; however, the following behaviors are handled via binding and callback mechanisms:

- **Button Click Event**: A `click` event is bound to the internal `this.button`, which triggers the `toggle_status()` method to start or stop audio stream capture.
- **Speech End Event**: Triggered by the `onSpeechEnd(audio)` callback from `vad.MicVAD`, which calls `handle_audio(audio)` to encode and send the audio data.
- **Data Reception Event**: In `receive_data()`, the method continuously reads responses from the server stream using `reader.readline()`. Each received JSON message updates the displayed text.

---

# ASRText

**Widget Functionality**: Identical to `StreamAudio`. It serves as an alias widget, providing a more semantic representation of the speech recognition text output component.  
**Type**: Container widget  
**Parent Widget**: `bricks.VBox` (inherits the same actual hierarchy as `StreamAudio`)

## Initialization Parameters

Same as `StreamAudio`.

## Main Events

Same as `StreamAudio`.