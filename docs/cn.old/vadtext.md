# `VadText` 技术文档

```markdown
# bricks.VadText 模块技术文档

## 概述

`bricks.VadText` 是一个基于 Web Audio 和语音活动检测（VAD）的交互式语音识别组件，用于实时采集用户语音、转换为 WAV 格式并发送至后端 ASR（自动语音识别）服务，最终将识别结果展示在界面上。该组件封装了音频录制、编码、网络请求和 UI 控件逻辑。

该模块依赖于全局对象 `bricks`，并使用了 VAD（Voice Activity Detection）库进行语音检测。

---

## 1. 工具函数：`audioBufferToWav`

### 功能说明
将多通道的 `Float32Array[]` 音频数据（标准 Web Audio API 的 `AudioBuffer` 数据格式）转换为标准的 WAV 容器格式的 `ArrayBuffer`。

### 函数签名
```js
function audioBufferToWav(channelBuffers, sampleRate)
```

### 参数
| 参数名         | 类型                 | 描述 |
|----------------|----------------------|------|
| `channelBuffers` | `Float32Array[]`     | 包含每个声道音频数据的数组，例如 `[leftChannel, rightChannel]`。单声道时为 `[monoData]`。 |
| `sampleRate`    | `number`             | 音频采样率（Hz），如 16000、44100 等。 |

### 返回值
- `{ArrayBuffer}`：符合 RIFF/WAV 标准的二进制缓冲区，可用于生成 Blob 或 Base64 编码。

### 实现细节
- 输出为 **16-bit PCM**、小端字节序（little-endian）。
- 支持任意声道数（单声道/立体声等）。
- 自动填充 WAV 头部信息（44 字节标准头）：
  - RIFF 标识符与长度
  - fmt 块：PCM 格式、声道数、采样率、比特率等
  - data 块：实际音频样本

#### 关键步骤
1. 计算总样本数：`channelBuffers[0].length * channelBuffers.length`
2. 创建大小合适的 `ArrayBuffer`（44 字节头部 + 每样本 2 字节）
3. 写入 WAV 文件头字段（使用 `DataView` 和辅助函数 `writeString`）
4. 将浮点样本（范围 [-1, 1]）转换为 16 位整数 PCM：
   ```js
   s < 0 ? s * 0x8000 : s * 0x7FFF
   ```

> ⚠️ 注意：此函数假设所有通道具有相同长度。

---

## 2. 主类：`bricks.VadText`

继承自 `bricks.VBox`，提供垂直布局容器功能，并集成语音输入与文本输出界面。

### 构造函数
```js
new bricks.VadText(opts)
```

#### 参数 `opts`
| 属性名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|-------|--------|------|
| `name` | string | 否 | `'asr_text'` | 表单字段名称，用于 `getValue()` 输出 |
| `height` | string | 否 | `'100%'` | 组件高度（会被强制设置） |
| 其他属性 | any | 否 | - | 传递给父类 `VBox` |

#### 内部初始化内容
- **按钮 (`this.button`)**：点击切换录音状态，图标为 `speak.svg`
- **音频播放器 (`this.audio`)**：回放已录制的语音片段，样式为 `'filler'`
- **水平布局 (`hbox`)**：包含按钮和音频播放器
- **填充分隔符 (`this.filler`)**：容纳文本显示区域
- **文本控件 (`this.text_w`)**：显示 ASR 识别结果，支持换行
- **事件绑定**：
  - 按钮点击 → `toggle_status()`
  - 触发 `'audio_ready'` 事件 → `handle_audio()`

---

## 3. 核心方法

### `toggle_status()`
切换录音启停状态：
- 若正在录音（`this.vad` 存在），则调用 `stop()`
- 否则调用 `start()`

---

### `start()`
启动语音识别流程。

#### 流程
1. 更新按钮文本为 “stop”
2. 使用 `schedule_once` 延迟执行 `_start()` 以避免同步阻塞

---

### `async _start()`
异步初始化麦克风 VAD 实例。

#### 步骤
1. 如果已有全局 `bricks.vad` 实例，先停止它（保证唯一性）
2. 创建新的 `vad.MicVAD` 实例：
   - 配置 `onSpeechEnd` 回调：当检测到语音结束时触发
   - 回调中派发 `'audio_ready'` 事件并处理音频
3. 启动 VAD 监听
4. 设置全局引用 `bricks.vad = this`
5. 清空历史文本 `this.text = ''`

> ✅ 提示：`MicVAD.new()` 应返回 Promise，确保异步加载完成。

---

### `stop()`
停止当前录音。

#### 流程
1. 更新按钮文本为 “start”
2. 延迟调用 `_stop()`

---

### `async _stop()`
真正执行停止操作：
1. 暂停 VAD 实例
2. 清理 `this.vad` 和 `bricks.vad`
3. 如果已有识别文本，派发 `'changed'` 事件通知外部值变更

---

### `async handle_audio(audio)`
处理由 VAD 捕获的音频数据（`Float32Array` 单通道音频）。

#### 步骤
1. 调用 `audioBufferToWav([audio], 16000)` 生成 WAV 二进制
2. 使用 `arrayBufferToBase64()` 转为 Base64 字符串
3. 设置 `this.audio` 播放源为 Data URL（`data:audio/wav;base64,...`）
4. 发送 HTTP 请求到 ASR 接口：
   - 方法：POST
   - 参数：
     - `model`: 使用的模型名（来自 `this.model`）
     - `audio`: Base64 编码的音频
5. 成功响应：
   - 追加 `rj.content` 到 `this.text`
   - 更新文本显示
6. 失败响应：
   - 弹出错误窗口（`bricks.Error`）

---

### `arrayBufferToBase64(buffer)`
将 `ArrayBuffer` 转换为 Base64 字符串。

#### 实现原理
1. 使用 `Uint8Array` 遍历字节
2. 转换为字符串（`String.fromCharCode`）
3. 调用 `btoa()` 进行 Base64 编码

> ❗ 性能提示：大音频文件下可能影响性能，建议改用 `FileReader` 或 `Buffer.from(buffer).toString('base64')`（Node.js 环境）

---

### `getValue()`
获取当前表单值，供外部收集数据使用。

#### 返回格式
```js
{
  [this.name]: "累积识别文本"
}
```

> ⚠️ 当前实现有缺陷：未返回对象！应修改为：
```js
getValue(){
  let d = {};
  d[this.name] = this.text;
  return d; // 缺少 return
}
```

---

## 4. 注册组件
```js
bricks.Factory.register('VadText', bricks.VadText);
```
允许通过工厂模式动态创建该组件，例如：
```js
bricks.Factory.create('VadText', { model: 'whisper-small', url: '/asr' })
```

---

## 5. 依赖与配置要求

### 外部依赖
- `vad.MicVAD`：语音活动检测模块（需提前加载）
- `bricks.Button`, `bricks.AudioPlayer`, `bricks.HBox`, `bricks.VBox`, `bricks.Filler`, `bricks.Text`, `bricks.HttpJson`, `bricks.Error`：UI 组件库
- `bricks_resource()`：资源路径解析函数（如 SVG 图标）
- `schedule_once(fn, delay)`：延迟执行工具函数

### 配置项（实例属性）
| 属性 | 类型 | 说明 |
|------|------|------|
| `url` | string | ASR 服务接口地址 |
| `model` | string | 指定使用的语音识别模型 |

> 示例初始化：
> ```js
> new bricks.VadText({
>   name: 'user_speech',
>   url: '/api/asr',
>   model: 'deepseek-asr'
> })
> ```

---

## 6. 事件系统

| 事件名 | 触发时机 | 携带数据 |
|--------|----------|---------|
| `audio_ready` | VAD 检测到语音结束 | `Float32Array` 音频数据 |
| `changed` | 录音停止且存在识别文本 | `getValue()` 结果对象（需修复返回问题） |

---

## 7. 已知问题与改进建议

| 问题 | 描述 | 建议修复 |
|------|------|----------|
| `getValue()` 缺失返回值 | 当前方法无 `return` 语句 | 添加 `return d;` |
| Base64 编码效率低 | 大音频下循环拼接字符串性能差 | 改用 `Blob` + `FileReader` 或现代编码方式 |
| 固定采样率 16000 | 不灵活 | 可从配置或 VAD 获取真实采样率 |
| 错误处理仅弹窗 | 缺少重试机制 | 增加重试按钮或自动重连 |
| 全局状态污染 | `bricks.vad` 为共享状态 | 可考虑设计为单例管理器 |

---

## 8. 使用示例

```js
var vadWidget = new bricks.VadText({
  name: 'transcript',
  url: '/api/speech-to-text',
  model: 'base'
});

vadWidget.bind('changed', function(data) {
  console.log("识别结果:", data.transcript);
});

document.body.appendChild(vadWidget.dom);
```

---

## 9. 许可与版权
© 2025 Bricks Framework. All rights reserved.
```

---

✅ **文档版本**：1.0  
📌 **最后更新**：2025年4月5日