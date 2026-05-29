# QAFrame

**Widget Functionality**: Implements an interactive Q&A framework that supports receiving course content (such as audio, video, images, Markdown), question information, and result feedback via WebSocket. It allows users to submit answers in text or audio format. Suitable for online teaching, quizzes, and similar scenarios.

**Type**: Container Widget  
**Parent Widget**: `bricks.VBox`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `ws_url` | String | WebSocket connection URL used for communication with the backend |
| `ws_params` | Object (optional) | Query parameters object to be appended to `ws_url`, which will be converted into a URL query string |
| `title` | String (optional) | Page title (not directly used in code, may be passed externally) |
| `description` | String (optional) | Description text |
| `courseware` | Object (optional) | Initial course resource configuration, including:<br>- `type`: `"audio"`, `"video"`, `"image"`, `"markdown"`<br>- `url`: Resource URL<br>- `timeout`: Playback timeout in seconds; 0 means no timeout |
| `timeout` | Number | Overall timeout control in seconds; 0 means no timeout |

> **Note**: During initialization, internal child widgets are created: `top_w` (HBox), `main_w` (Filler), and `bottom_w` (HBox), and a WebSocket connection is established.

## Main Events

| Event Name | Trigger Condition | Data Format Description |
|-----------|-------------------|--------------------------|
| `onopen` | When the WebSocket connection opens | Automatically triggers the `start_question_answer()` method and sends a startup message: `{ type: 'qa_start', data: { d: 'test data', v: 100 } }` |
| `onquestion` | When question data is received | Data structure:<br>`{ q_desc: question description, total_q: total number of questions, cur_q: current question number }`<br>Calls `show_question(d)` to display the question |
| `oncourseware` | When course resource data is received | Data structure:<br>`{ type: "audio"/"video"/"image"/"markdown", url: resource link }`<br>Calls `show_courseware(d)` to display corresponding media content |
| `onaskstart` | When the server requests confirmation to start | Triggers display of a "Start?" button; clicking it calls `start_question_answer()` to send the start signal |
| `click` (custom button) | When user clicks the "press to start" or "Start?" button | Calls `conform_start()` to send `{ type: 'conform_start', data: null }` to the server |

### Received Data Types (from Server)

1. **courseware**: Play specified type of course content
   ```json
   {
     "type": "courseware",
     "data": {
       "type": "audio|video|image|markdown",
       "url": "resource URL"
     }
   }
   ```

2. **askready**: Ask if the client is ready
   ```json
   {
     "type": "askready",
     "data": {
       "total_q": 5,
       "cur_q": 1
     }
   }
   ```

3. **question**: Deliver a question
   ```json
   {
     "type": "question",
     "data": {
       "q_desc": "question text in HTML or Markdown",
       "total_q": 5,
       "cur_q": 1
     }
   }
   ```

4. **result**: Return answer result statistics
   ```json
   {
     "type": "result",
     "data": {
       "total_q": 5,
       "correct_cnt": 3,
       "error_cnt": 2
     }
   }
   ```

5. **error_list**: List of detailed errors
   ```json
   {
     "type": "error_list",
     "data": {
       "error_cnt": 2,
       "rows": [
         {
           "pos": 1,
           "q_desc": "stem of question 1",
           "your_a": "your answer",
           "corrent_a": "correct answer",
           "error_desc": "explanation of error"
         }
       ]
     }
   }
   ```

### Sent Message Types (Client → Server)

1. **qa_start**: Automatically sent after successful connection, indicating readiness to begin
   ```json
   { "type": "qa_start", "data": { "d": "test data", "v": 100 } }
   ```

2. **conform_start**: Sent after user clicks the start button
   ```json
   { "type": "conform_start", "data": null }
   ```

3. **text_answer**: Submit text answer
   ```json
   { "type": "text_answer", "data": "user input content" }
   ```

4. **audio_answer**: Submit recorded audio answer (Base64 encoded)
   ```json
   { "type": "audio_answer", "data": "base64-encoded audio string" }
   ```

> All messages are sent through the built-in `WebSocket` instance using `this.ws.send(message)`.