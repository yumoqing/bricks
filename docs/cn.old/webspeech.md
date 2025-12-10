# WebTTS 与 WebASR 模块技术文档

---

## 简介

`bricks.WebTTS` 和 `bricks.WebASR` 是基于浏览器原生 API 实现的语音合成（Text-to-Speech, TTS）和语音识别（Automatic Speech Recognition, ASR）组件。它们扩展自 `bricks.VBox`，可用于在 Web 应用中集成语音输入与输出功能。

这些模块依赖于现代浏览器提供的 `SpeechSynthesis` 和 `SpeechRecognition` API，适用于支持这些特性的主流浏览器。

---

## 1. `bricks.WebTTS` - 文本转语音组件

### 类定义
```js
class bricks.WebTTS extends bricks.VBox
```

### 构造函数
```js
constructor(opts)
```
- **参数**：
  - `opts` (Object): 传递给父类 `VBox` 的配置选项。
- **说明**：调用父类构造函数初始化组件。

### 方法：`speak(text)`

触发文本到语音的合成功能。

#### 参数
| 参数名 | 类型   | 描述               |
|--------|--------|--------------------|
| text   | String | 要朗读的文本内容   |

#### 功能描述
- 检查当前浏览器是否支持 `speechSynthesis` API。
- 创建一个 `SpeechSynthesisUtterance` 对象，并设置以下属性：
  - `lang`: 使用 `bricks.app.lang` 设置语言。
  - `pitch`: 音调设为 1（正常）。
  - `rate`: 语速设为 1（正常）。
- 注册事件回调：
  - `onstart`: 语音开始播放时输出日志。
  - `onend`: 语音结束时输出日志。
  - `onerror`: 出错时输出错误信息。
- 将语音任务加入系统队列并播放。

#### 示例代码
```js
const tts = new bricks.WebTTS();
tts.speak("你好，欢迎使用语音合成功能！");
```

#### 浏览器兼容性提示
若浏览器不支持 `speechSynthesis`，将在控制台打印错误：
```text
浏览器不支持SpeechSynthesis
```

> ⚠️ 注意：该功能在部分旧版或移动浏览器上可能受限，需确保运行环境支持。

---

## 2. `bricks.WebASR` - 语音识别组件

### 类定义
```js
class bricks.WebASR extends bricks.VBox
```

### 构造函数
```js
constructor(opts)
```
- **参数**：
  - `opts` (Object): 传递给父类 `VBox` 的配置选项。
- **内部初始化**：
  - `this.recognition` 初始化为 `None`（注意：应为 `null` 或 `undefined`，此处可能存在拼写/语法错误）

> ❌ Bug 提示：`None` 在 JavaScript 中未定义，正确写法应为 `null`。

建议修正为：
```js
this.recognition = null;
```

### 方法：`start_recording()`

启动麦克风录音并进行实时语音识别。

#### 功能描述
- 检测浏览器是否支持 `SpeechRecognition` 接口。
- 若支持，则创建 `SpeechRecognition` 实例，并配置如下：
  - `lang`: 使用 `bricks.app.lang` 设置识别语言。
  - `onresult`: 当识别结果返回时，提取首个备选文本（`event.results[0][0].transcript`），并通过 `dispatch` 触发 `asr_result` 自定义事件。
  - `onend`: 识别结束时输出日志。
  - `onerror`: 发生错误时输出错误类型。
- 启动识别服务。

#### 示例代码
```js
const asr = new bricks.WebASR();
asr.start_recording();

// 监听识别结果
asr.on('asr_result', function(data) {
    console.log('用户说:', data.content);
});
```

#### 控制台输出示例
```text
识别结果: 今天天气真好
```

#### 兼容性处理
如果浏览器不支持 `SpeechRecognition`，将输出：
```text
browser has not SpeechRecognition
```

> ⚠️ 注意：Chrome 及基于 Chromium 的浏览器支持较好；Safari 和 Firefox 支持有限或需要前缀。

---

### 方法：`stop_recording()`

停止正在进行的语音识别。

#### 功能描述
调用底层 `SpeechRecognition.stop()` 方法终止录音和识别过程。

#### 示例
```js
asr.stop_recording();
```

> ✅ 建议配合 UI 控件（如“按住说话”按钮）使用，在释放时调用此方法。

---

## 3. 工厂注册

这两个组件通过 `bricks.Factory` 进行注册，便于动态创建实例。

```js
bricks.Factory.register('WebTTS', bricks.WebTTS);
bricks.Factory.register('WebASR', bricks.WebASR);
```

### 用途
允许通过字符串名称来创建组件实例，例如（假设有工厂创建方法）：
```js
let tts = bricks.Factory.create('WebTTS');
let asr = bricks.Factory.create('WebASR');
```

这提高了系统的可扩展性和解耦程度。

---

## 使用前提条件

### 1. 浏览器支持要求
| 特性 | 推荐浏览器 |
|------|------------|
| `SpeechSynthesis` | Chrome、Edge、Firefox、Safari（部分支持） |
| `SpeechRecognition` | 主要支持 Chrome（需 HTTPS 或 localhost） |

> 🔒 安全限制：大多数浏览器要求页面运行在 **HTTPS** 或本地开发环境（`localhost`）下才能启用麦克风权限。

### 2. 语言设置依赖
组件使用全局变量：
```js
bricks.app.lang
```
请确保在应用启动时正确设置该值，例如：
```js
bricks.app.lang = 'zh-CN'; // 中文普通话
// 或
bricks.app.lang = 'en-US'; // 英语（美国）
```

常见语言代码参考：
- `zh-CN`: 中文（普通话）
- `en-US`: 英语（美式）
- `ja-JP`: 日语
- `ko-KR`: 韩语

---

## 已知问题与改进建议

| 问题 | 说明 | 建议修复 |
|------|------|---------|
| `None` 错误 | `this.reognition = None;` 是无效语法 | 改为 `this.recognition = null;` |
| 拼写错误 | `reognition` → `recognition` | 修正所有相关拼写 |
| 缺少权限请求处理 | 未显式请求麦克风权限 | 可增加 `navigator.mediaDevices.getUserMedia` 预检 |
| 事件作用域问题 | `onresult` 中 `this` 指向可能丢失 | 使用箭头函数或 `.bind(this)` |

### 推荐修复后的 `start_recording` 片段
```js
this.recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    this.dispatch('asr_result', { content: transcript });
    console.log('识别结果:', transcript);
};
```

---

## 总结

| 组件       | 功能             | 核心 API                  | 是否需要网络 | 是否需要麦克风 |
|------------|------------------|----------------------------|--------------|----------------|
| `WebTTS`   | 文本转语音       | `SpeechSynthesis`          | 否           | 否             |
| `WebASR`   | 语音转文本       | `SpeechRecognition`        | 是（云端）   | 是             |

✅ 适用场景：
- 教育类应用中的发音朗读
- 智能助手对话界面
- 无障碍访问工具
- 语音指令控制系统

🚫 不适用场景：
- 无网络环境下离线高精度 ASR
- 低延迟工业级语音处理

---

## 参考链接

- [MDN: SpeechSynthesis](https://developer.mozilla.org/zh-CN/docs/Web/API/SpeechSynthesis)
- [MDN: SpeechRecognition](https://developer.mozilla.org/zh-CN/docs/Web/API/SpeechRecognition)
- [Google Chrome 语音识别限制说明](https://www.chromium.org/developers/design-documents/media/capture)

--- 

📝 **维护建议**：定期检查浏览器对 Web Speech API 的支持情况，并考虑降级方案（如接入第三方 SDK）。