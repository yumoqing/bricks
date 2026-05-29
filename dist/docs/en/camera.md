# Camera

**Widget Functionality**: Used to access the device's camera for taking photos or recording videos. Supports features such as switching cameras, starting/stopping video recording, and capturing photos.  
**Type**: Standard widget (an extension based on `Popup`)  
**Parent Widget**: `bricks.Popup`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `fps` | Number | Frame rate for video capture; default is 60 FPS |
| `type` | String | Widget mode; allowed values are `'picture'` (photo mode) or `'recorder'` (video recording mode) |
| `auto_dismiss` | Boolean | Whether the popup should automatically close; default is `false` (explicitly set in code) |

> **Note**: `opts.auto_dismiss = false;` is forcibly set within the constructor.

## Main Events

| Event | Trigger Condition | Data Carried |
|------|-------------------|------------|
| `shot` | Triggered when the user clicks the capture button | The captured image data URL (JPEG image in base64 format) |
| `recorded` | Triggered when video recording ends | The recorded video file object (`File` type, WebM format) |

> **Explanation**:
> - When `type='picture'`, clicking the capture button triggers the `shot` event and returns the captured image data.
> - When `type='recorder'`, clicking the record button starts or stops recording. After stopping, the `recorded` event is triggered and returns the recorded video file.