# WebTTS

**Widget Functionality**: Implements browser-based Text-to-Speech (TTS) functionality, supporting multiple languages, pitch, and speech rate settings, along with event callbacks during the speech synthesis process.  
**Type**: Container widget  
**Parent Widget**: bricks.VBox  

## Initialization Parameters

- `opts`: Inherits initialization parameters from `bricks.VBox`, used to configure layout and basic properties.  
  - Supports all common configuration options of a VBox container (such as styles, child widgets, etc.).

## Main Events

No custom events are triggered; however, the following speech synthesis events are internally used for status monitoring:
- `onstart`: Logs a message when speech synthesis begins.
- `onend`: Logs a message when speech synthesis ends.
- `onerror`: Outputs error information if speech synthesis fails.

> Note: This widget performs speech playback by calling the `speak(text)` method and does not rely on external event binding mechanisms to trigger UI changes.

---

# WebASR

**Widget Functionality**: Implements browser-based Speech Recognition functionality, converting user's spoken input into text content and dispatching recognition results via events.  
**Type**: Container widget  
**Parent Widget**: bricks.VBox  

## Initialization Parameters

- `opts`: Inherits initialization parameters from `bricks.VBox`, used to configure layout and basic properties.  
  - Supports all common configuration options of a VBox container.

## Main Events

- `asr_result`: Triggered when speech recognition successfully returns a result, carrying the recognized text content.  
  - Data format: `{ content: string }`  
  - Example: `{ content: "Hello World" }`

> Note: Requires browser support for the `SpeechRecognition` API; otherwise, a "not supported" message will be logged.