# Bricks 框架：Iframe 与 NewWindow 组件技术文档

> **版本**：1.0  
> **作者**：Bricks 团队  
> **适用框架**：Bricks.js（基于类的前端组件架构）

---

## 概述

本文档描述 `bricks` 命名空间下的两个核心组件：

- `bricks.Iframe`：用于在当前页面嵌入外部网页内容的 `<iframe>` 组件。
- `bricks.NewWindow`：用于打开新浏览器窗口并加载指定 URL 的组件。

这两个组件均继承自 `bricks` 框架的基础类，并通过 `bricks.Factory` 注册，支持动态实例化。

---

## 依赖说明

- 需确保全局存在 `window.bricks` 对象（或自动初始化）。
- 依赖基础类：
  - `bricks.Layout`：用于 `Iframe`
  - `bricks.JsWidget`：用于 `NewWindow`
- 工厂模式注册依赖：`bricks.Factory.register`

---

## 1. `bricks.Iframe` 类

### 继承关系
```js
class Iframe extends bricks.Layout
```

### 功能说明
创建一个内联框架（`<iframe>`），将指定 URL 的内容嵌入当前页面。默认高度为 `100%`，可自定义。

### 构造函数
```js
constructor(opts)
```

#### 参数
| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `opts.url` | `String` | ✅ | 要嵌入的网页 URL |
| `opts.height` | `String` | ❌ | iframe 高度（默认 `'100%'`） |
| `opts` 中其他属性 | — | — | 将传递给父类 `bricks.Layout` |

#### 示例
```js
const iframe = new bricks.Iframe({
  url: 'https://example.com',
  height: '500px'
});
```

### 方法

#### `create()`
创建 DOM 元素 `<iframe>` 并赋值给 `this.dom_element`。

```js
create()
```

- **行为**：
  - 创建一个新的 `HTMLIFrameElement`。
  - 不自动添加到 DOM，需由父类或外部逻辑处理挂载。

---

## 2. `bricks.NewWindow` 类

### 继承关系
```js
class NewWindow extends bricks.JsWidget
```

### 功能说明
调用浏览器原生 `window.open()` 方法，在新窗口或标签页中打开指定 URL。

### 构造函数
```js
constructor(opts)
```

#### 参数
| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `opts.url` | `String` | ✅ | 要打开的网页地址 |
| `opts.name` | `String` | ❌ | 新窗口名称（参见 `window.open` 第二参数），默认 `'_blank'` |
| `opts` 中其他属性 | — | — | 传递给父类 `bricks.JsWidget` |

#### 示例
```js
new bricks.NewWindow({
  url: 'https://example.com',
  name: 'myWindow'
});
// 打开新窗口，名称为 'myWindow'

new bricks.NewWindow({
  url: 'https://help.com'
});
// 使用默认设置打开新标签页
```

> ⚠️ 注意：现代浏览器可能阻止未用户触发的 `window.open()` 调用（如非点击事件中执行）。

---

## 3. 工厂注册

为支持动态创建组件，两个类均已注册到 `bricks.Factory`。

```js
bricks.Factory.register('NewWindow', bricks.NewWindow);
bricks.Factory.register('Iframe', bricks.Iframe);
```

### 使用工厂创建实例（示例）
```js
const widget = bricks.Factory.create('Iframe', {
  url: 'https://dashboard.example.com',
  height: '600px'
});
document.body.appendChild(widget.getElement()); // 假设方法存在
```

---

## 使用场景建议

| 组件 | 推荐场景 |
|------|----------|
| `Iframe` | 嵌入第三方仪表盘、帮助文档、跨域内容等需要隔离但显示在当前页的内容 |
| `NewWindow` | 跳转外部链接、打开帮助中心、弹出独立操作界面等无需嵌入当前页面的操作 |

---

## 注意事项

1. **安全性**：
   - 使用 `<iframe>` 时注意 XSS 和点击劫持风险，建议对源站点设置 CSP 策略。
   - 避免在 `iframe` 中加载不可信来源。

2. **兼容性**：
   - `window.open()` 受浏览器弹窗拦截机制影响，请确保在用户交互上下文中调用。

3. **响应式设计**：
   - `Iframe` 默认高度为 `100%`，请确保其容器具有明确高度，否则可能无法正确渲染。

4. **SEO 与可访问性**：
   - `<iframe>` 内容不被搜索引擎直接索引，重要信息应避免仅通过 iframe 展示。
   - 添加 `title` 属性以提升可访问性（当前代码未实现，建议扩展）。

---

## 扩展建议

```js
// 示例：增强 Iframe 支持 title 和 sandbox 属性
class EnhancedIframe extends bricks.Iframe {
  constructor(opts) {
    super(opts);
    const { title, sandbox } = opts;
    if (title) this.dom_element.title = title;
    if (sandbox) this.dom_element.sandbox = sandbox;
  }
}
```

---

## 版本历史

- **v1.0**：初始版本，包含 `Iframe` 和 `NewWindow` 基础实现及工厂注册。

---

> 📌 提示：更多关于 `bricks.Layout`、`bricks.JsWidget` 和 `bricks.Factory` 的细节，请参考主框架文档。