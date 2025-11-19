# UserInputView

控件功能：将用户输入的数据（包括文本、图像、音频、视频等）转换为 Markdown 格式展示，音视频媒体数据以独立播放器形式显示。  
类型：容器控件  
父类控件：bricks.VBox

## 初始化参数

- `opts` (Object) - 配置选项，继承自 VBox 的通用参数：
  - `data` (Object) - 用户输入的原始数据对象，键值对应字段名和值。
  - `input_fields` (Array) - 字段定义数组，每个字段包含：
    - `name` (String) - 字段名称（如 `video1`, `audio2`, `image3`, 普通文本等）
    - `label` (String, 可选) - 显示标签，用于 Markdown 中标题展示

> 注意：`data` 中的文件 Blob 对象会通过 `URL.createObjectURL()` 转换为可预览的 URL。

## 主要事件

无显式自定义事件。在 `show_input(data)` 被调用时自动刷新内容布局。

---

# LlmOut

控件功能：根据大模型返回的 JSON 数据动态构建响应内容界面，支持推理文本、应答内容、错误提示、音频、视频、图片等多种类型内容的渲染。  
类型：容器控件  
父类控件：bricks.VBox

## 初始化参数

- `opts` (Object) - 配置选项，继承自 VBox 的通用参数，无特殊构造参数。

内部状态属性（由 `update(data)` 方法维护）：
- `reasoning_content` (String) - 累积的推理过程文本。
- `content` (String) - 累积的最终回答内容。
- `error` (String) - 错误信息文本。
- `images` (Array) - 图片 URL 列表。
- 各媒体控件实例：`rc_w`, `c_w`, `v_w`, `a_w`, `i_w` 等。

## 主要事件

### update(data)

触发条件：当接收到新的大模型输出数据时手动调用此方法。

参数 `data` (Object) 支持以下可选属性：

| 属性 | 类型 | 描述 |
|------|------|------|
| `reasoning_content` | String | 推理过程文本，通常以 Markdown 渲染 |
| `content` | String | 最终回复内容，支持 Markdown |
| `error` | String | 错误信息，将以红色样式显示 |
| `audio` | String | 音频资源，可以是 URL 或 Base64 编码字符串，自动处理协议前缀 |
| `video` | String | 视频资源，支持 URL 或 Base64 |
| `image` | String 或 Array[String] | 单张或多个图片 URL |

行为说明：
- 自动合并新增内容到已有字段中（追加模式）。
- 媒体资源首次出现时创建对应播放器组件（AudioPlayer / VideoPlayer），后续更新则调用其 `add_url()` 方法。
- 所有内容按顺序添加到容器中：错误 → 推理内容 → 回答内容 → 视频 → 音频 → 图片。
- 使用 `clear_widgets()` 清除旧组件后重新渲染，确保视图一致性。

> 注册信息：该控件通过 `bricks.Factory.register('LlmOut', bricks.LlmOut)` 注册，可用于配置化创建。
