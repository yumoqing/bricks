# UserInputView

**Control Functionality**: Converts user-input data (including text, images, audio, video, etc.) into Markdown format for display. Audio and video media are presented using standalone player components.  
**Type**: Container control  
**Parent Control**: `bricks.VBox`

## Initialization Parameters

- `opts` (Object) - Configuration options, inheriting general parameters from `VBox`:
  - `data` (Object) - Raw data object provided by the user, where keys correspond to field names and values to their respective content.
  - `input_fields` (Array) - Array of field definitions, each containing:
    - `name` (String) - Field name (e.g., `video1`, `audio2`, `image3`, plain text fields, etc.)
    - `label` (String, optional) - Display label used as a heading in Markdown output.

> **Note**: Blob objects in `data` are converted to previewable URLs via `URL.createObjectURL()`.

## Main Events

No explicit custom events. Content layout is automatically refreshed when `show_input(data)` is called.

---

# LlmOut

**Control Functionality**: Dynamically constructs a response interface based on JSON data returned from a large language model (LLM), supporting rendering of various content types such as reasoning text, final responses, error messages, audio, video, and images.  
**Type**: Container control  
**Parent Control**: `bricks.VBox`

## Initialization Parameters

- `opts` (Object) - Configuration options, inheriting general parameters from `VBox`. No special constructor parameters.

Internal state properties (managed by the `update(data)` method):
- `reasoning_content` (String) - Accumulated reasoning process text.
- `content` (String) - Accumulated final response content.
- `error` (String) - Error message text.
- `images` (Array) - List of image URLs.
- Media widget instances: `rc_w`, `c_w`, `v_w`, `a_w`, `i_w`, etc.

## Main Events

### update(data)

**Trigger Condition**: Manually invoked when new output data from the LLM is received.

The `data` parameter (Object) supports the following optional properties:

| Property | Type | Description |
|--------|------|-------------|
| `reasoning_content` | String | Text describing the reasoning process, typically rendered with Markdown |
| `content` | String | Final response content, supports Markdown formatting |
| `error` | String | Error message, displayed in red styling |
| `audio` | String | Audio resource, either a URL or Base64-encoded string; protocol prefix is handled automatically |
| `video` | String | Video resource, supports URL or Base64 encoding |
| `image` | String or Array[String] | Single image URL or an array of multiple image URLs |

**Behavior Details**:
- Newly received content is automatically merged and appended to existing fields (append mode).
- When a media resource appears for the first time, the corresponding player component (e.g., `AudioPlayer`, `VideoPlayer`) is created; subsequent updates use its `add_url()` method.
- All content is added to the container in the following order: error → reasoning content → response content → video → audio → images.
- The method calls `clear_widgets()` to remove old components before re-rendering, ensuring visual consistency.

> **Registration Note**: This control is registered via `bricks.Factory.register('LlmOut', bricks.LlmOut)`, enabling configuration-driven instantiation.