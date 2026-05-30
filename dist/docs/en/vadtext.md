# VadText

**Control Functionality**: A composite control that integrates voice capture, audio playback, and speech recognition text display. The user clicks a button to start recording. When speech termination is detected, the audio is automatically converted into WAV format and sent to the backend for speech recognition. The recognition result is then displayed in real time within the text area.  
**Type**: Container Control  
**Parent Control**: `bricks.VBox`

## Initialization Parameters

- `opts.name` *(Optional)*: Name of the control; defaults to `'asr_text'`.
- `opts.height`: Defaults to `'100%'`, occupying the full height of the parent container.
- Other common layout parameters inherited from `VBox` (such as `width`, `align`, etc.) can also be passed in.

## Main Events

- `audio_ready`: Triggered when voice activity detection (VAD) captures a complete utterance and generates audio data. The event carries `Float32Array` type audio sample data.
- `changed`: Triggered after recording stops, when speech recognition is completed and returns non-empty text content. Carries the current control's value object `{ [name]: text }`, which can be used for form submission or state synchronization.