# AudioPlayer

**Functionality**: Used to play audio files, supporting local URLs or streaming loading. Features include play, pause, autoplay, playback queue, and status detection.  
**Type**: Regular widget  
**Parent Widget**: `bricks.JsWidget`

## Initialization Parameters

| Parameter | Type    | Description |
|---------|--------|-------------|
| `url`     | String | URL of the audio resource (optional). If provided during construction, the audio will be loaded immediately. |
| `autoplay`| Boolean| Whether to automatically start playback once the audio is ready. Default is `false`. |

## Main Events

| Event Name | Trigger Condition |
|-----------|--------------------|
| `ended`   | Triggered when current audio finishes playing and the playback queue is empty. |

---

# AudioRecorder

**Functionality**: Implements audio recording functionality using browser microphone permissions, records in WAV format via the third-party library Recorder.js. Provides features such as start/stop recording, real-time timer display, and upload/download of recordings. Depends on the external library Recorder.js (WAV format).  
**Type**: Container widget (inherits from HBox, contains buttons and text)  
**Parent Widget**: `bricks.HBox`

## Initialization Parameters

| Parameter      | Type    | Description |
|---------------|--------|-------------|
| `upload_url`   | String | Target URL for automatic upload after recording ends (optional). |
| `start_icon`   | String | SVG icon path displayed on the "Start Recording" button; uses built-in default if not specified. |
| `stop_icon`    | String | SVG icon path displayed on the "Stop Recording" button; uses built-in default if not specified. |
| `icon_rate`    | Number | Scaling ratio for SVG icons, passed to the internal `Svg` widget. |

## Main Events

| Event Name        | Trigger Condition |
|------------------|--------------------|
| `record_started` | Triggered when user clicks to start recording and microphone permission is successfully granted. |
| `record_ended`   | Triggered when user stops recording, after the blob data is generated. Carries `{data, url, duration}` as parameters. |
| `uploaded`       | Triggered upon successful upload of the recorded file to the server. Carries the server's response data. |

> ⚠️ Note: Requires including the external library [Recorder.js](https://gitee.com/xiangyuecn/Recorder) to enable recording functionality.

---

# TextedAudioPlayer

**Functionality**: A composite widget combining audio playback with text display, suitable for scenarios like voice narration with synchronized subtitles. Supports loading audio and corresponding text in chunks from a streaming response, and plays them sequentially in order.  
**Type**: Container widget (vertical layout VBox)  
**Parent Widget**: `bricks.VBox`

## Initialization Parameters

No independent initialization parameters. Internally creates the following child widgets automatically:

- An `AudioPlayer` instance for audio playback.
- A `Text` instance for displaying associated text content.
- A `VScrollPanel` to enable scrolling within the text area.

## Main Events

No directly exposed custom events. Behavior is driven by the `ended` event of the internal `AudioPlayer`, which automatically calls `playnext()` to play the next segment.

> Internally receives streaming JSON data via `set_stream_urls(response)`. Each item should contain the fields: `audio` (Base64-encoded audio), `text` (corresponding text), and `done` (indicates end of stream).

---

> ✅ All widgets have been registered via `bricks.Factory.register` and can be instantiated in templates or configurations using their string names.