# WebTTS

用于实现网页端的文本转语音（Text-to-Speech）功能，基于浏览器原生 `SpeechSynthesis` API。该控件为**普通控件**，继承自 `VBox`。

## 主要方法

- `speak(text: String)`  
  开始朗读指定的文本内容。若浏览器不支持语音合成功能，则输出错误日志。

## 主要事件

无自定义事件派发。

## 源码例子

```json
{
  "id": "tts_widget",
  "widgettype": "WebTTS",
  "options": {
    // 可选配置项（当前无特定 options）
  },
  "binds": [
    {
      "actiontype": "method",           // 调用方法动作
      "wid": "btn_speak",               // 触发组件ID：一个按钮
      "event": "click",                 // 监听点击事件
      "target": "tts_widget",           // 目标控件ID
      "method": "speak",                // 调用的方法名
      "dataparams": {
        "text": "欢迎使用Bricks框架的WebTTS功能"
      }
    },
    {
      "actiontype": "method",
      "wid": "input_text",              // 输入框控件ID
      "event": "change",                // 值变化时触发
      "target": "tts_widget",
      "method": "speak",
      "datawidget": "input_text",       // 从input_text控件获取数据
      "datamethod": "getValue"          // 调用其getValue方法获取输入值
    }
  ]
}
```

> **注释说明：**
> - 此控件通过调用 `speak()` 方法播放语音。
> - 示例中绑定了两个事件：
>   1. 点击按钮时，朗读固定欢迎语；
>   2. 当输入框内容改变时，自动朗读输入的内容。
> - 需确保运行环境支持 `window.speechSynthesis`，否则会打印不支持提示。

---

# WebASR

实现语音识别（Automatic Speech Recognition, ASR）功能，基于浏览器的 `SpeechRecognition` 接口。该控件为**普通控件**，继承自 `VBox`。

## 主要方法

- `start_recording()`  
  启动麦克风录音并开始语音识别，识别结果通过事件派发。

- `stop_recording()`  
  停止语音识别过程。

## 主要事件

- `asr_result`  
  当语音识别完成并获得结果时触发，携带参数 `{ content: string }`，表示识别出的文本内容。

## 源码例子

```json
{
  "id": "asr_widget",
  "widgettype": "WebASR",
  "options": {},
  "subwidgets": [
    {
      "id": "btn_start_asr",
      "widgettype": "Button",
      "options": {
        "label": "开始录音"
      }
    },
    {
      "id": "btn_stop_asr",
      "widgettype": "Button",
      "options": {
        "label": "停止录音"
      }
    },
    {
      "id": "result_display",
      "widgettype": "Label",
      "options": {
        "text": "等待识别结果..."
      }
    }
  ],
  "binds": [
    {
      "actiontype": "method",
      "wid": "btn_start_asr",
      "event": "click",
      "target": "asr_widget",
      "method": "start_recording"
      // 开始语音识别
    },
    {
      "actiontype": "method",
      "wid": "btn_stop_asr",
      "event": "click",
      "target": "asr_widget",
      "method": "stop_recording"
      // 停止语音识别
    },
    {
      "actiontype": "event",
      "wid": "asr_widget",
      "event": "asr_result",            // 监听控件自身派发的 asr_result 事件
      "target": "result_display",       // 目标是显示结果的 Label 控件
      "dispatch_event": "setValue",     // 派发 setValue 事件来更新文本
      "params": {
        "value": "{content}"           // 使用事件携带的数据字段 content 更新显示
      }
    }
  ]
}
```

> **注释说明：**
> - `WebASR` 控件依赖于浏览器是否支持 `SpeechRecognition`。
> - 用户点击“开始录音”按钮后，激活麦克风进行语音识别。
> - 识别完成后，控件派发 `asr_result` 事件，携带识别文本。
> - 利用 `event` 类型绑定将识别结果动态更新到 `result_display` 标签中。
> - “停止录音”按钮可手动结束识别流程。

--- 

> 💡 **提示：**  
> 在实际使用中，请确保页面在 HTTPS 环境下运行，因为大多数浏览器对非安全上下文下的麦克风和语音合成功能进行了限制。