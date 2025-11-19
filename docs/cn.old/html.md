# `bricks.Html` 组件技术文档

## 概述

`bricks.Html` 是 Bricks 框架中的一个基础 UI 组件，用于将原始 HTML 内容动态插入到 DOM 中。它继承自 `bricks.JsWidget`，是构建更复杂组件或直接渲染静态/动态 HTML 内容的轻量级工具。

---

## 类定义

```javascript
bricks.Html = class extends bricks.JsWidget
```

- **继承自**: `bricks.JsWidget`
- **用途**: 渲染传入的 HTML 字符串到组件的根 DOM 元素中。
- **注册名称**: `'Html'`（通过 `bricks.Factory` 注册）

---

## 构造函数

### `constructor(opts)`

初始化 `Html` 组件实例。

#### 参数

| 参数名 | 类型   | 说明 |
|--------|--------|------|
| `opts` | Object | 配置选项对象，继承自 `JsWidget` 并扩展以下字段。 |

#### `opts` 属性

| 属性名 | 类型   | 必填 | 说明 |
|--------|--------|------|------|
| `html` | String | 是   | 要插入到组件内部的 HTML 字符串内容。该内容将直接设置为 `innerHTML`。 |

#### 示例

```javascript
const htmlWidget = new bricks.Html({
  html: '<div class="info">这是一段 <strong>HTML</strong> 内容</div>'
});
```

---

## 功能说明

- 在构造函数中调用 `super(opts)` 初始化父类 `JsWidget` 的基本功能（如 DOM 创建、事件绑定等）。
- 使用 `this.dom_element.innerHTML = opts.html` 将传入的 HTML 字符串注入组件的根元素。

> ⚠️ **安全提示**：由于使用了 `innerHTML`，若 `html` 字段包含用户输入，可能存在 XSS 安全风险。建议在使用前对 HTML 内容进行过滤或转义。

---

## 工厂注册

```javascript
bricks.Factory.register('Html', bricks.Html);
```

- 将 `Html` 组件注册到 Bricks 的工厂系统中，允许通过配置方式（如 JSON 描述）创建该组件。
- 注册名称为 `'Html'`，可在模板或布局定义中使用。

#### 工厂创建示例（假设支持 JSON 配置）

```json
{
  "type": "Html",
  "html": "<p>通过工厂创建的 HTML 组件</p>"
}
```

---

## 使用示例

### 基本用法

```javascript
// 创建一个包含 HTML 内容的组件
const myHtmlComponent = new bricks.Html({
  html: `
    <h3>欢迎使用 Bricks Html 组件</h3>
    <ul>
      <li>支持任意合法 HTML</li>
      <li>可嵌入富文本内容</li>
    </ul>
  `
});

// 将组件添加到页面某容器中
document.getElementById('container').appendChild(myHtmlComponent.dom_element);
```

---

## 注意事项

1. **安全性**：避免将不可信的用户输入直接赋值给 `html` 字段。
2. **脚本执行**：通过 `innerHTML` 插入的 `<script>` 标签默认不会执行，如需执行需额外处理。
3. **样式隔离**：插入的内容会继承父级样式，建议使用 CSS 类名控制样式作用域。

---

## 相关类

- [`bricks.JsWidget`](./JsWidget.md) —— 所有 JavaScript 组件的基类。
- [`bricks.Factory`](./Factory.md) —— 组件工厂，用于注册和实例化组件。

---

## 版本信息

- **框架**: Bricks UI Framework
- **模块**: `bricks.Html`
- **最后更新**: _可根据实际项目填写_

--- 

✅ 适用于快速渲染静态 HTML 内容场景，是构建富文本展示、帮助文档、动态提示等模块的理想选择。