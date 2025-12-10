# LlmMsgAudio

**Widget Functionality**: Handles voice message streams, supports segmentation by Chinese and non-Chinese punctuation, and plays the model's audio response through an audio player.  
**Type**: Regular widget  
**Parent Widget**: `bricks.UpStreaming`

## Initialization Parameters

| Parameter | Type   | Description |
|---------|--------|-------------|
| opts    | Object | Configuration options passed to the parent class, handled by `UpStreaming` |

> **Note**: This widget internally initializes the following properties:  
> - `olddata` / `data`: Used for accumulating text data  
> - `cn_p` / `other_p`: Arrays of common Chinese and non-Chinese punctuation marks  
> - `audio`: Audio playback instance created using `AudioPlayer({})`

## Main Events

No explicit events are bound, but the following methods are overridden to participate in data stream processing:  
- `send(data)`: Receives incremental text, splits it by language-specific punctuation, and sends playable segments  
- `go()`: Initiates a request, sets the audio source, and plays the voice based on the response content  

---

# ModelOutput

**Widget Functionality**: Displays output from large language models, supporting dynamic updates, status indication, user feedback (like/dislike), and integrated TTS audio playback.  
**Type**: Container widget  
**Parent Widget**: `bricks.VBox`

## Initialization Parameters

| Parameter | Type    | Required | Description |
|----------|---------|----------|-------------|
| opts.modelname     | String  | No       | Displayed model name |
| opts.icon          | String  | No       | Model icon URL; defaults to a default LLM icon if not provided |
| opts.response_mode | String  | No       | Response mode: `stream`, `sync`, or `async` |
| opts.estimate_url  | String  | No       | API endpoint for submitting user ratings (e.g., like/dislike) |
| opts.textvoice     | Boolean | No       | Whether to enable text-to-speech reading |
| opts.tts_url       | String  | No       | TTS service API endpoint for generating speech |

## Main Events

| Event Name | Trigger Condition | Callback Function |
|-----------|-------------------|-------------------|
| click (on like icon)    | User clicks the "like" icon | `estimate_llm(icon, 1)` |
| click (on unlike icon)  | User clicks the "dislike" icon | `estimate_llm(icon, -1)` |

> **Other Behaviors**:  
> - `update_data(data)`: Receives model output and updates displayed content  
> - `finish()`: Called when streaming ends; currently logs only  

---

# LlmModel

**Widget Functionality**: Encapsulates the logic for calling a single large language model, including input preprocessing, request sending, response stream handling, and result rendering. Supports multiple interaction modes (synchronous, streaming, asynchronous).  
**Type**: Regular widget  
**Parent Widget**: `bricks.JsWidget`

## Initialization Parameters

| Parameter | Type    | Required | Description |
|----------|---------|----------|-------------|
| llmio                    | Object  | Yes      | The owning `LlmIO` instance, used for shared configuration |
| opts.model               | String  | Yes      | Model identifier |
| opts.modelname           | String  | Yes      | Display name |
| opts.url                 | String  | Yes      | Model API endpoint |
| opts.icon                | String  | No       | Custom icon path |
| opts.params              | Object  | No       | Additional request parameters |
| opts.user_message_format     | String  | No       | Template format for user messages |
| opts.system_message_format   | String  | No       | Template format for system messages |
| opts.llm_message_format      | Object  | No       | Structure definition for assistant messages |
| opts.use_session         | Boolean | No       | Whether to maintain conversation context |
| opts.input_from          | String  | No       | Source identifier for input |
| opts.textvoice           | Boolean | No       | Whether to enable voice output |
| opts.tts_url             | String  | No       | TTS API endpoint |
| opts.response_mode       | String  | Yes      | Request mode: `stream`, `sync`, or `async` |

## Main Events

| Event Name | Trigger Condition | Callback Function |
|-----------|-------------------|-------------------|
| click (on title) | Clicking the model title area | `show_setup_panel(event)` — Can be extended by subclasses |

> **Key Internal Methods**:  
> - `model_inputed(data)`: Triggers a model request upon receiving input data  
> - `chunk_response(mout, line)`: Processes each chunk in a streaming response  
> - `is_accept_source(source)`: Determines whether data from a given source should be accepted  

---

# LlmIO

**Widget Functionality**: Serves as the core container for the overall LLM interaction interface. Manages multiple model instances, input dialogs, knowledge base configurations, user inputs, and output displays. Provides a unified entry point for coordinating multiple models.  
**Type**: Container widget  
**Parent Widget**: `bricks.VBox`

## Initialization Parameters

| Parameter | Type    | Required | Description |
|----------|---------|----------|-------------|
| opts.user_icon        | String   | No       | User avatar icon URL |
| opts.list_models_url  | String   | No       | API endpoint for retrieving available model list |
| opts.input_fields     | Array    | Yes      | Form field definitions (e.g., prompt, temperature, etc.) |
| opts.models           | Array    | Yes      | Initial array of model configurations |
| opts.tts_url          | String   | No       | Global TTS service URL |
| opts.get_kdb_url      | String   | No       | API endpoint for retrieving knowledge base list |
| opts.estimate_url     | String   | No       | Endpoint for submitting user feedback |
| opts.enabled_kdb      | Boolean  | No       | Whether to enable knowledge base augmentation |

> **Example `models` structure**:  
> ```js
> {
>   model: "qwen",
>   modelname: "通义千问",
>   url: "/api/llm/qwen",
>   response_mode: "stream"
> }
> ```

## Main Events

| Event Name | Trigger Condition | Callback Function |
|-----------|-------------------|-------------------|
| click (i_w)            | Clicking the input button | `open_input_widget(event)` — Opens input form dialog |
| click (nm_w)           | Clicking the "Add Model" button | `open_search_models(event)` — Opens model selection panel |
| click (kdb_w)          | Clicking the knowledge base settings button | `setup_kdb(event)` — Opens KDB configuration form |
| submit (in form)       | User submits the input form | `handle_input(event)` — Distributes input to all models |
| record_click (in Cols) | Selecting a model record | `add_new_model(event)` — Adds a new model instance |
| submit (in kdb form)   | Submitting knowledge base configuration | `handle_kdb_setup(event)` — Saves and applies configuration |

> **Other Core Behaviors**:  
> - `show_input(params)`: Displays user input in the chat area  
> - `show_added_model(m)`: Registers and displays a new model instance