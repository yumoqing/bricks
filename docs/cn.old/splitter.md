# `bricks.Splitter` 组件技术文档

## 概述

`bricks.Splitter` 是一个基于 `bricks.JsWidget` 的轻量级 UI 组件，用于在页面中创建分隔线（`<hr>` 元素）。它通常用于视觉上分隔不同内容区域，适用于构建模块化布局。

该组件通过 Bricks 框架的工厂模式注册，可通过 `bricks.Factory` 实例化并插入 DOM。

---

## 类定义

```javascript
bricks.Splitter = class extends bricks.JsWidget
```

- **继承自**: `bricks.JsWidget`
- **用途**: 创建水平分隔线（`<hr>`）
- **注册名称**: `'Splitter'`

---

## 构造函数

### `constructor(ops)`

初始化 `Splitter` 实例。

#### 参数

| 参数名 | 类型   | 说明 |
|--------|--------|------|
| `ops`  | Object | 可选配置对象（当前未使用，传递给父类） |

#### 实现细节

```js
constructor(ops) {
    super({});
}
```

- 调用父类 `bricks.JsWidget` 的构造函数。
- 当前不依赖任何配置项，传入空对象 `{}`。

---

## 方法

### `create()`

创建并初始化组件的 DOM 结构。

#### 实现

```js
create() {
    this.dom_element = this._create('hr');
}
```

#### 行为说明

- 使用父类提供的 `_create(tagName)` 工具方法创建一个 `<hr>` 元素。
- 将生成的 DOM 元素赋值给实例属性 `this.dom_element`，供后续操作使用。
- `<hr>` 是标准 HTML 水平分隔线元素，语义清晰，样式可通过 CSS 自定义。

---

## 注册与使用

### 注册组件

```js
bricks.Factory.register('Splitter', bricks.Splitter);
```

- 将 `Splitter` 类注册到 `bricks.Factory` 中，注册名为 `'Splitter'`。
- 注册后可通过工厂方法动态创建实例。

---

## 使用示例

### 1. 手动实例化

```js
const splitter = new bricks.Splitter();
splitter.create();
document.body.appendChild(splitter.getElement()); // 假设 getElement() 返回 dom_element
```

### 2. 通过工厂创建（推荐）

```js
const splitter = bricks.Factory.create('Splitter');
splitter.create();
container.appendChild(splitter.dom_element);
```

---

## DOM 结构

生成的 DOM 元素：

```html
<hr>
```

> 样式可由外部 CSS 控制，例如：
>
> ```css
> hr {
>   border: 1px solid #ccc;
>   margin: 16px 0;
> }
> ```

---

## 注意事项

- `create()` 方法必须被显式调用以生成 DOM 元素。
- `dom_element` 属性在 `create()` 调用后才可用。
- 当前版本不支持自定义标签或复杂配置，如需扩展可继承此类或添加参数支持。

---

## 版本兼容性

- 依赖 `bricks.JsWidget` 基类和 `bricks.Factory` 系统。
- 需确保 `window.bricks` 已初始化。

---

## 总结

`bricks.Splitter` 是一个简洁、语义化的分隔线组件，适合在组件化界面中快速插入视觉分隔。其设计遵循 Bricks 框架规范，易于集成与扩展。