# Popup

**控件功能**：弹出层控件，用于在页面上显示模态或非模态的浮动窗口，支持自动打开/关闭、点击外部关闭、拖拽移动、调整大小、定时关闭等功能。  
**类型**：容器控件  
**父类控件**：`bricks.VBox`

## 初始化参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `timeout` | number | `0` | 自动关闭延迟时间（毫秒），0 表示不自动关闭 |
| `archor` | string | `'cc'` | 弹窗定位锚点，取值为 `tl`, `tc`, `tr`, `cl`, `cc`, `cr`, `bl`, `bc`, `br` 中的一种，表示相对于屏幕的位置 |
| `widget` | string / Widget / null | `null` | 关联的目标控件（ID 或对象），用于定位或禁用 |
| `auto_open` | boolean | `true` | 是否在创建后自动打开弹窗 |
| `auto_dismiss` | boolean | `true` | 是否点击弹窗外区域时自动关闭 |
| `auto_destroy` | boolean | `true` | 关闭后是否自动销毁控件 |
| `movable` | boolean | `true` | 是否允许拖拽移动 |
| `resizable` | boolean | `false` | 是否允许调整大小 |
| `modal` | boolean | `true` | 是否为模态窗口（遮罩并禁用目标控件） |
| `content` | object | `undefined` | 弹窗内容配置对象，将在打开时异步加载 |
| `dismiss_events` | array | `undefined` | 指定事件名称数组，触发时自动关闭弹窗 |

> 注：移动端下默认宽高为 `100%`，桌面端为 `70%`。

## 主要事件

| 事件名 | 触发时机 | 说明 |
|--------|----------|------|
| `opened` | 弹窗显示并完成布局后触发 | 通常用于加载动态内容 |
| `dismissed` | 弹窗隐藏时触发 | 可用于清理资源 |
| `destroy` | 控件被销毁时触发 | 仅当 `auto_destroy` 为 true 时触发 |

---

# PopupWindow

**控件功能**：可拖动、可缩放、带标题栏的应用级窗口控件，常用于模拟桌面应用程序窗口，支持最小化、全屏、关闭等操作。  
**类型**：容器控件  
**父类控件**：`bricks.Popup`

## 初始化参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `title` | string | `"[Untitle window]"` | 窗口标题文本 |
| `icon` | string | 内置图标路径 | 窗口左上角显示的图标 URL |
| `rate` | number | `1.5` | 图标缩放比率 |
| `auto_open` | boolean | `true` | 创建后是否自动打开窗口 |
| 其他参数 | —— | 继承自 `Popup` | 包括 `width`, `height`, `modal`, `movable`, `resizable` 等，均继承并默认启用可移动和可调整大小 |

> 注意：`PopupWindow` 强制设置 `movable=true`, `resizable=true`，且默认 `auto_dismiss=false`, `auto_destroy=false`。

## 主要事件

| 事件名 | 触发时机 | 说明 |
|--------|----------|------|
| `opened` | 窗口打开并渲染完成后触发 | 继承自 `Popup` |
| `dismissed` | 窗口关闭（最小化也视为 dismiss）时触发 | 可用于状态同步 |
| `destroy` | 调用 `destroy()` 方法或点击关闭按钮时触发 | 实际销毁前执行清理逻辑 |

### 内置工具栏事件绑定

- `delete`：点击关闭按钮时触发，调用 `destroy()` 销毁窗口。
- `minimize`：点击最小化按钮时触发，调用 `win_minimize()` 隐藏窗口并加入 `app.mwins` 列表。
- `fullscreen`：点击全屏按钮时触发，进入全屏模式。

> 最小化的窗口可通过 `WindowsPanel` 重新打开。

