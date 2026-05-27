# SysCamera

**Functionality**: Captures static photos using the system camera, supports real-time preview, and returns the captured image as both a `data URL` and a `File` object.  
**Type**: Regular widget  
**Parent Widget**: `bricks.SysVideoRecorder`

## Initialization Parameters

- No explicit custom initialization parameters (inherited from parent class `MediaRecorder`).  
- In practice, options such as `widgetid` may need to be passed when creating an instance if used by the parent class (though not directly utilized in this class).

## Main Events

- **`shot`**  
  Triggered when: The user clicks the capture button to take a photo.  
  Callback data:
  ```js
  {
    url: string,   // Data URL of the image, suitable for display in `<img>`
    file: File     // File object, usable for upload or saving
  }
  ```

---

# WidgetRecorder

**Functionality**: Records media streams from a specified widget (e.g., `<video>` or `<audio>` elements) on the page, supporting audio or video recording.  
**Type**: Regular widget  
**Parent Widget**: `bricks.MediaRecorder`

## Initialization Parameters

- `widgetid` *(String)*: Unique ID of the target widget to record; used with `bricks.getWidgetById()` to retrieve the corresponding DOM element.

## Main Events

- **`record_started`**  
  Triggered when: Recording begins.  
  Callback data: None.

- **`record_end`**  
  Triggered when: Recording stops normally.  
  Callback data:
  ```js
  {
    url: string,   // Object URL of the recorded media file, usable for playback
    file: File     // Generated file object (WAV audio or MP4 video)
  }
  ```

---

# SysAudioRecorder

**Functionality**: Records audio using the system microphone, automatically converts WebM format audio to WAV format upon output, suitable for scenarios requiring high-quality audio capture.  
**Type**: Regular widget  
**Parent Widget**: `bricks.MediaRecorder`

## Initialization Parameters

- No additional initialization parameters; all configurations are set internally.

## Main Events

- **`record_started`**  
  Triggered when: Microphone is activated and recording starts.  
  Callback data: None.

- **`record_end`**  
  Triggered when: Recording ends normally and format conversion is complete.  
  Callback data:
  ```js
  {
    url: string,   // Object URL of the converted WAV file
    file: File     // WAV format File object (suitable for upload or processing)
  }
  ```

---

# SysVideoRecorder

**Functionality**: Records audio and video using the system camera and microphone, supports real-time video preview, and outputs an MP4 video file upon completion.  
**Type**: Regular widget  
**Parent Widget**: `bricks.MediaRecorder`

## Initialization Parameters

- No additional initialization parameters; uses default media device permission requests (including both audio and video).

## Main Events

- **`record_started`**  
  Triggered when: Successfully obtains camera/microphone stream and starts recording.  
  Callback data: None.

- **`record_end`**  
  Triggered when: Recording stops and the video file is generated.  
  Callback data:
  ```js
  {
    url: string,   // Object URL of the video file
    file: File     // MP4 format File object
  }
  ```