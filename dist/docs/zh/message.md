# Message

## 控件功能，类型（普通控件或容器控件），父类控件
- **功能**：用于显示一条带有标题和消息内容的弹窗提示，支持自动打开、文本换行、居中对齐以及国际化（i18n）。
- **类型**：容器控件（可包含其他子控件如文本、滚动面板等）
- **父类控件**：`bricks.PopupWindow`

## 初始化参数
| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| title | string | 是 | 弹窗的标题文本 |
| message | string | 是 | 要显示的消息内容 |
| cheight | number | 否 | 内容区域高度（默认为9） |
| cwidth | number | 否 | 内容区域宽度（默认为16） |
| auto_open | boolean | 自动设置为 `true` | 构造时会自动设为 `true`，创建后立即打开窗口 |

> 注：`auto_open` 会在构造函数中被强制设为 `true`。

## 主要事件
暂无自定义事件定义。继承自 `PopupWindow` 的标准事件如 `onOpen`, `onClose` 可用。

---

# Error

## 控件功能，类型（普通控件或容器控件），父类控件
- **功能**：基于 `Message` 控件，专门用于显示错误信息，样式上添加了“error” CSS 类以突出显示错误状态。
- **类型**：容器控件
- **父类控件**：`bricks.Message`

## 初始化参数
继承自 `Message` 控件的所有参数：
| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| title | string | 是 | 错误弹窗的标题 |
| message | string | 是 | 错误的具体内容 |
| cheight | number | 否 | 窗口高度，默认为9 |
| cwidth | number | 否 | 窗口宽度，默认为16 |

> 注：在实例化时会自动应用 `'error'` 样式类。

## 主要事件
与 `Message` 相同，无新增事件。可使用继承的 `onOpen`, `onClose` 等事件。

> 实际使用通常通过 `bricks.show_error()` 函数调用。


---

### 附加工具方法说明（非控件，不单独列文档）

#### `bricks.show_error(opts)`
- **功能**：快速显示一个错误消息弹窗
- **参数**：
  - `opts`: 包含 `title` 和 `message` 的对象，可选 `cheight` / `cwidth`
- **行为**：
  - 若未指定尺寸，则默认使用 `cheight=9`, `cwidth=16`
  - 创建 `bricks.Error` 实例并调用 `.open()`

#### `bricks.show_message(opts)`
- **功能**：快速显示普通消息弹窗
- **参数**：
  - `opts`: 同上，包含 `title` 和 `message`
- **行为**：
  - 使用默认尺寸创建 `Message` 弹窗并打开

> 这两个函数提供便捷调用方式，适用于不需要手动管理组件生命周期的场景。