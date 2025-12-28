# Bricks Markdown 组件技术文档

> **项目依赖说明**：本组件基于 [marked.js](https://github.com/markedjs/marked) 实现 Markdown 渲染功能。在使用 `bricks.js` 前，需确保已引入 `marked.min.js`。

```html
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
```

---

## 模块概述

`bricks.MdWidget` 与 `bricks.MarkdownViewer` 是 Bricks 框架中用于渲染和交互式浏览 Markdown 内容的两个核心组件：

- `MdWidget`：基础 Markdown 显示控件，支持本地文本或远程 URL 加载。
- `MarkdownViewer`：增强型 Markdown 浏览器，内置导航栈（前进/后退）功能，适合构建文档阅读器类应用。

---

## 1. `bricks.MdWidget`

### 类定义
```js
class MdWidget extends bricks.JsWidget
```

### 功能描述
一个轻量级的 Markdown 渲染控件，可从字符串 (`mdtext`) 或远程 URL (`md_url`) 加载内容，并使用 `marked.js` 进行解析渲染。支持动态更新内容和链接拦截处理。

### 构造函数参数：`options`

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `mdtext` | String | 否 | 要渲染的 Markdown 文本内容 |
| `md_url` | String | 否 | 远程 Markdown 文件 URL |
| `method` | String | 否（默认 `"GET"`） | 请求方式（目前仅支持 GET） |
| `params` | Object | 否 | 请求参数（暂未实际用于 GET 请求） |

> ⚠️ 注意：若同时提供 `mdtext` 和 `md_url`，优先使用 `mdtext` 并立即渲染。

### 方法列表

#### `constructor(options)`
初始化组件：
- 若提供了 `mdtext`，则直接调用 `_build1()` 渲染。
- 否则延迟加载 `md_url` 内容，并绑定滚动监听。

#### `set_content(content)`
动态设置 Markdown 内容并重新渲染。

- **参数**：
  - `content`: (String) 新的 Markdown 字符串

#### `show_scroll(event)`
滚动事件回调，输出当前 `window.scrollY` 到调试日志（通过 `bricks.debug`）。

#### `async build()`
异步加载并渲染来自 `opts.md_url` 的 Markdown 内容。若未指定 URL，则不执行任何操作。

#### `async _build(md_url)`
私有方法：通过 `bricks.tget(md_url)` 获取远程 Markdown 内容并渲染。

- 触发事件：`loaded`，携带 `{ url: md_url }`
- 自动重写页面内所有 `<a>` 标签为内部跳转行为

#### `_build1()`
将当前 `this.md_content` 使用 `marked.parse()` 解析为 HTML，并插入 DOM。
同时劫持所有链接点击事件，实现内部导航。

> 所有 `<a href="...">` 被改为 `href="#"`，并绑定 `onclick` 调用 `_build(原URL)`。

#### `getname()`
返回控件名称：
- 若设置了 `this.name`，返回该值；
- 否则返回 `'mdtext'`

#### `getValue()`
获取当前控件的值，格式为对象：
```js
{ [name]: md_content }
```
常用于表单数据收集。

#### `setValue(v)`
设置 Markdown 内容（仅赋值，不触发渲染）。通常配合其他逻辑调用。

---

## 2. `bricks.MarkdownViewer`

### 类定义
```js
class MarkdownViewer extends bricks.VBox
```

### 功能描述
一个容器式 Markdown 浏览器，继承自 `VBox`，支持以下特性：
- 可选的“返回”按钮（导航栈）
- 支持点击 Markdown 中的链接进行页面跳转
- 记录访问历史（back_stack），支持回退至上一页

### 构造函数参数：`options`

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `navigator` | Boolean | 否（默认 `true`） | 是否显示返回按钮 |
| `recommentable` | Boolean | 否 | （预留字段，当前未使用） |
| `md_url` | String | 否 | 初始加载的远程 Markdown URL |
| `mdtext` | String | 否 | 初始本地 Markdown 文本 |
| `method` | String | 否（默认 `"GET"`） | HTTP 方法 |
| `params` | Object | 否 | 请求参数对象 |

> ✅ 提示：使用 `absurl()` 处理相对路径，确保 URL 正确解析。

### 方法列表

#### `constructor(options)`
初始化组件：
- 创建内部 `MdWidget` 实例负责渲染
- 注册 `loaded` 事件以维护导航栈
- 设置样式：自动滚动、占满父容器高度

#### `show_scroll(event)`
同 `MdWidget`，打印当前滚动位置。

#### `async createBackButton()`
动态创建顶部返回按钮（HBox + Text 组合）：
- 显示文本 `"<<<<<<<"`
- 点击触发 `go_back()`
- 使用 `widgetBuild` 异步生成 UI 元素（调试信息较多）

> 🛠️ 当前 UI 较原始，未来可替换为图标或更美观样式。

#### `add_back_stack(event)`
当新页面加载完成时，将当前 URL 推入 `back_stack` 数组。

- **事件参数**：`event.params.url` 表示刚加载的 URL

#### `async go_back(event)`
实现“返回上一页”逻辑：
1. 弹出当前页 URL
2. 再弹出上一页 URL
3. 使用 `mdtext._build(url)` 加载上一页内容

> 🔒 若栈长度小于 2，则禁止返回。

#### `async build()` / `async _build(md_url)`
> ❗注意：此处存在代码冗余 —— `_build` 方法在 `MarkdownViewer` 中重复定义但未被调用（应调用的是 `mdtext._build`）。

建议移除该方法或修正逻辑，避免混淆。

---

## 事件系统

### 自定义事件

| 事件名 | 触发时机 | 携带参数 |
|--------|----------|---------|
| `loaded` | Markdown 内容成功加载并渲染后 | `{ url: string }` |
| `scroll` | 容器发生滚动时（绑定到 DOM） | 原生 Event 对象 |

可通过 `.bind('event', handler)` 监听。

---

## 工厂注册

```js
bricks.Factory.register('MarkdownViewer', bricks.MarkdownViewer);
bricks.Factory.register('MdWidget', bricks.MdWidget);
```

允许通过 JSON 描述符动态创建组件：

### 示例 JSON 配置

```json
{
  "widgettype": "MarkdownViewer",
  "options": {
    "md_url": "/docs/intro.md",
    "navigator": true
  }
}
```

---

## 使用示例

### 示例 1：直接渲染本地 Markdown

```js
const mdWidget = new bricks.MdWidget({
  mdtext: "# Hello\nWelcome to Bricks Markdown Viewer!"
});
document.body.appendChild(mdWidget.dom_element);
```

### 示例 2：加载远程 Markdown 并启用导航

```js
const viewer = new bricks.MarkdownViewer({
  md_url: 'https://example.com/README.md',
  navigator: true
});
document.body.appendChild(viewer.dom_element);
```

### 示例 3：动态更新内容

```js
mdWidget.set_content("## New Content\nUpdated at " + new Date().toLocaleString());
```

---

## 注意事项 & 建议

1. **依赖必须提前加载**
   ```html
   <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
   ```

2. **安全性提示**
   - `innerHTML = marked.parse(...)` 存在 XSS 风险
   - 如需展示用户输入，请先对 HTML 输出做净化处理（如使用 DOMPurify）

3. **性能优化建议**
   - 避免频繁调用 `set_content` 或 `_build`
   - 对大型文档考虑分页或懒加载

4. **代码改进建议**
   - `MarkdownViewer._build` 方法冗余且可能错误，建议删除或重构
   - `createBackButton` 应支持国际化或自定义文本
   - 链接拦截逻辑可抽象成独立方法便于复用

---

## 版本信息

- **作者**：Bricks Framework 团队
- **依赖库**：[marked@latest](https://marked.js.org/)
- **兼容性**：现代浏览器（ES6+ 支持）

--- 

📌 **文档版本**：v1.0  
📅 **最后更新**：2025年4月5日