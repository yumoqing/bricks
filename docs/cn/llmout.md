# Bricks 框架技术文档

## 概述

本文档描述了 `bricks` 框架中两个核心视图类的实现与使用：`UserInputView` 和 `LlmOut`。这两个类用于处理用户输入和大模型输出内容的可视化展示，支持 Markdown 文本、图像、音频、视频等多种媒体类型。

---

## 1. `bricks.UserInputView`

### 类定义
```javascript
bricks.UserInputView = class extends bricks.VBox
```

### 功能说明
将用户的输入字段（如文本、图片、音视频等）转换为结构化的 Markdown 内容进行展示，并独立嵌入音视频播放器组件。

- 所有非音视频字段以代码块形式显示。
- 图像字段以 Markdown 图像语法渲染。
- 视频和音频字段通过专用播放器组件独立展示。

---

### 构造函数
```javascript
constructor(opts)
```

#### 参数
| 参数 | 类型 | 说明 |
|------|------|------|
| `opts` | Object | 配置选项，继承自 `bricks.VBox` |

#### 初始化行为
- 调用父类构造函数 `super(opts)`
- 初始化内部变量：
  - `this.v_w`: 视频播放器实例（初始为 `null`）
  - `this.a_w`: 音频播放器实例（初始为 `null`）
- 调用 `show_input(this.data)` 显示数据

---

### 方法：`show_input(data)`

#### 参数
| 参数 | 类型 | 说明 |
|------|------|------|
| `data` | Object | 包含用户输入数据的对象 |

#### 处理逻辑
遍历 `this.input_fields` 中定义的字段配置，根据字段名前缀判断类型并生成相应内容：

| 字段前缀 | 处理方式 |
|---------|----------|
| `video*` | 创建 `VideoPlayer` 组件，自动播放，宽度 100% |
| `audio*` | 创建 `AudioPlayer` 组件，自动播放，宽度 100% |
| `image*` | 在 Markdown 中添加图片语法：`![label](url)` |
| 其他     | 使用代码块包裹内容：`\`\`\`\nvalue\n\`\`\`` |

> **注意**：字段标签优先使用 `f.label`，若无则使用 `f.name`

#### 流程步骤
1. 初始化空字符串 `mdtext`
2. 遍历所有输入字段，拼接 Markdown 内容或创建媒体组件
3. 清除当前所有子组件（`clear_widgets()`）
4. 创建新的 `MdWidget` 显示 Markdown 内容
5. 添加音视频组件（如有）

#### 示例输出 Markdown
```markdown
* 用户提问
```
这是用户的输入文本
```

* 示例图片
![示例图片](https://example.com/image.png)
```

---

### 属性
| 属性 | 类型 | 描述 |
|------|------|------|
| `v_w` | VideoPlayer 或 null | 当前绑定的视频播放器 |
| `a_w` | AudioPlayer 或 null | 当前绑定的音频播放器 |
| `input_fields` | Array | 字段定义数组，需在外部设置 |
| `data` | Object | 输入数据对象 |

---

## 2. `bricks.LlmOut`

### 类定义
```javascript
bricks.LlmOut = class extends bricks.VBox
```

### 功能说明
用于动态渲染大语言模型（LLM）返回的结果数据。支持以下内容类型：

- 推理过程文本（thinking / reasoning）
- 最终回答内容
- 错误信息
- 音频响应（URL 或 Base64）
- 视频响应（URL 或 Base64）
- 单张或多张图像

该组件具备增量更新能力，可通过多次调用 `update()` 累积内容。

---

### 构造函数
```javascript
constructor(opts)
```

#### 参数
| 参数 | 类型 | 说明 |
|------|------|------|
| `opts` | Object | 配置选项，继承自 `VBox` |

#### 初始化行为
- 调用父类构造函数
- 初始化各类媒体组件引用为 `null`
- 初始化数据缓存属性为空值或空数组

#### 初始状态
```js
this.rc_w = null;           // reasoning widget
this.c_w = null;            // content widget
this.v_w = null;            // video player
this.i_w = null;            // image widgets (not used directly)
this.a_w = null;            // audio player
this.images = [];           // 存储图片 URL 列表
this.reasoning_content = ''; // 缓存推理内容
this.content = '';          // 缓存应答内容
this.error = '';            // 缓存错误信息
```

---

### 方法：`update(data)`

#### 参数
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `data` | Object | 是 | LLM 返回的 JSON 数据 |

#### 支持字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| `reasoning_content` | String | 推理过程文本（可选） |
| `content` | String | 最终回复文本（可选） |
| `error` | String | 错误信息（可选） |
| `audio` | String | 音频资源路径或 Base64 编码（可选） |
| `video` | String | 视频资源路径或 Base64 编码（可选） |
| `image` | String 或 Array<String> | 图片资源地址（单个或多个） |

---

#### 处理逻辑详解

##### 🔊 音频处理
- 若 `audio` 不以 `http` 开头且不包含 `data:audio/` 前缀，则自动封装为 `data:audio/wav;base64,...`
- 第一次出现时创建 `AudioPlayer`
- 后续调用会追加新音频（`add_url`）

##### 🎥 视频处理
- 第一次出现创建 `VideoPlayer`
- 后续更新追加新视频源（`add_url`）

##### ❌ 错误处理
- 将 `data.error` 追加到本地缓存 `this.error`
- 展示时使用 `resp-error` CSS 类样式化

##### 💬 推理内容
- 追加至 `this.reasoning_content`
- 使用 `thinking-content` 样式及浅红色背景 (`#f0d0d0`) 区分显示

##### ✅ 正常响应内容
- 追加至 `this.content`
- 使用 `resp-content` 样式正常展示

##### 🖼️ 图像处理
- 支持单个 URL 或数组
- 所有图像 URL 被合并进 `this.images` 数组
- 每张图创建一个 `Image` 组件并添加到容器

---

#### 渲染顺序
组件按如下顺序依次添加到界面：

1. 错误信息（若有）
2. 推理内容（若有）
3. 正常响应内容（若有）
4. 视频播放器（若有）
5. 音频播放器（若有）
6. 所有图片（逐一添加）

> **注意**：每次 `update()` 都会先清除已有组件（`clear_widgets()`），再重新构建整个 UI。

---

### 注册信息
```js
bricks.Factory.register('LlmOut', bricks.LlmOut);
```
允许通过工厂模式以字符串 `'LlmOut'` 实例化此类。

---

## 使用示例

### 示例 1：初始化 UserInputView
```js
const userInput = new bricks.UserInputView({
  data: {
    question: "你好吗？",
    image_01: "https://example.com/photo.jpg"
  },
  input_fields: [
    { name: "question", label: "问题" },
    { name: "image_01", label: "上传图片" }
  ]
});
```

### 示例 2：更新 LLM 输出
```js
const llmView = new bricks.LlmOut();

llmView.update({
  reasoning_content: "正在分析用户的问题...",
  audio: "base64encodedstring==",
  image: ["img1.jpg", "img2.jpg"]
});

llmView.update({
  content: "我已经完成分析，这是结果。",
  video: "https://example.com/demo.mp4"
});
```

---

## 依赖说明

| 组件 | 用途 |
|------|------|
| `bricks.VBox` | 布局容器基类，垂直排列子组件 |
| `bricks.MdWidget` | 渲染 Markdown 内容 |
| `bricks.VideoPlayer` | 视频播放组件 |
| `bricks.AudioPlayer` | 音频播放组件 |
| `bricks.Image` | 图像显示组件 |
| `bricks.escapeSpecialChars()` | 工具函数，转义特殊字符防止 XSS |

---

## 注意事项

1. **Base64 音频格式假设**：默认非 HTTP 音频数据为 WAV 格式的 Base64 编码。
2. **图像数组合并问题**：当前 `concat()` 未正确赋值，应改为：
   ```js
   this.images = this.images.concat(data.image);
   ```
3. **增量更新限制**：虽然内容是累积的，但每次都会重绘全部组件，可能影响性能。
4. **样式依赖**：需要预定义 CSS 类：
   - `resp-error`
   - `thinking-content`
   - `resp-content`

---

## 待优化建议

| 项目 | 建议 |
|------|------|
| 图像去重 | 可增加 URL 去重机制 |
| 媒体并发 | 多个音视频同时播放可能干扰用户体验 |
| 安全性 | `escapeSpecialChars` 应确保防御 XSS 注入 |
| 性能 | 大量文本更新时避免频繁 DOM 重绘 |

---

## 版本信息

- 框架：Bricks UI Framework
- 模块：`UserInputView`, `LlmOut`
- 作者：系统自动生成文档
- 时间：2025年4月5日

--- 

✅ 文档结束