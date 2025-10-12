# `bricks.uiViewers` 模块技术文档

---

## 概述

`bricks.uiViewers` 是一个基于工厂模式的 UI 视图构建系统，用于根据不同的数据类型（`uitype`）动态创建对应的 UI 组件。该模块通过注册和获取视图构建器函数，实现对多种数据类型的可视化展示。

它适用于需要根据配置动态渲染字段内容的场景（如表单预览、数据展示等），支持字符串、图标、代码、密码、隐藏字段、音频等多种类型。

---

## 命名空间结构

```javascript
var bricks = window.bricks || {};
bricks.uiViewers = {};
```

- `bricks`：全局命名空间对象，防止污染全局作用域。
- `bricks.uiViewers`：存储所有已注册的视图构建器函数的对象，键为 `uitype`，值为构建函数。

---

## 核心方法

### `bricks.add_ViewBuilder(uitype, handler)`

注册一个新的视图构建器。

#### 参数

| 参数      | 类型     | 描述 |
|-----------|----------|------|
| `uitype`  | `String` | 数据/字段类型的标识符（如 `'str'`, `'icon'` 等）。 |
| `handler` | `Function` | 构建 UI 组件的处理函数，接收 `opts` 配置对象并返回一个组件实例。 |

#### 示例

```js
bricks.add_ViewBuilder('str', function(opts){
    return new bricks.Text({ otext: opts.value });
});
```

> 此方法将指定的 `handler` 存入 `bricks.uiViewers` 对象中，以 `uitype` 为键。

---

### `bricks.get_ViewBuilder(uitype)`

获取已注册的视图构建器函数。

#### 参数

| 参数      | 类型     | 描述 |
|-----------|----------|------|
| `uitype`  | `String` | 要获取的构建器对应的类型名称。 |

#### 返回值

- `{Function|null}`：如果存在对应 `uitype` 的构建器，则返回该函数；否则返回 `undefined`。

#### 示例

```js
var builder = bricks.get_ViewBuilder('str');
if (builder) {
    var widget = builder({ value: 'Hello' });
}
```

---

## 内置视图构建器

以下为默认注册的几种常见类型及其行为说明。

---

### `'str'` - 字符串显示

使用 `bricks.Text` 组件显示普通文本，并支持国际化（i18n）。

#### 构建逻辑

```js
bricks.add_ViewBuilder('str', function(opts){
    var options = bricks.extend({}, opts);
    options.otext = opts.value;
    options.i18n = true;
    return new bricks.Text(options);
});
```

#### 说明

- 复制原始 `opts` 配置。
- 设置显示文本为 `opts.value`。
- 启用国际化支持。

---

### `'icon'` - 图标显示

显示一个图标组件，通常基于 URL 或类名。

#### 构建逻辑

```js
bricks.add_ViewBuilder('icon', function(opts){
    var options = bricks.extend({}, opts);
    options.url = opts.value;
    return new bricks.Icon(options);
});
```

#### 说明

- 将 `value` 字段作为图标的资源地址（URL）传入 `bricks.Icon`。

---

### `'code'` - 代码/富文本显示

用于显示可配置字段的文本内容，优先从 `user_data` 中提取。

#### 构建逻辑

```js
bricks.add_ViewBuilder('code', function(opts){
    var textField = opts.textField || 'text';
    var valueField = opts.name;
    var txt;
    if (opts.user_data) {
        txt = opts.user_data[textField] || opts.user_data[valueField] || '';
    } else {
        txt = opts.value || '';
    }
    var options = bricks.extend({}, opts);
    options.otext = txt;
    options.i18n = true;
    return new bricks.Text(options);
});
```

#### 说明

- 支持从 `user_data` 对象中读取内容，优先级：`textField > valueField > fallback ''`。
- 若无 `user_data`，则使用 `opts.value`。
- 使用 `bricks.Text` 显示结果，并启用 i18n。

---

### `'password'` - 密码占位显示

安全地显示密码字段，仅展示掩码。

#### 构建逻辑

```js
bricks.add_ViewBuilder('password', function(opts){
    var options = bricks.extend({}, opts);
    options.otext = '******';
    options.i18n = true;
    return new bricks.Text(options);
});
```

#### 说明

- 实际值不暴露，统一显示为六个星号 `******`。
- 仍使用 `bricks.Text` 组件进行渲染。

---

### `'hide'` - 隐藏字段

创建一个空的占位组件，不显示任何内容。

#### 构建逻辑

```js
bricks.add_ViewBuilder('hide', function(opts){
    return new bricks.JsWidget({});
});
```

#### 说明

- 返回一个空的 `JsWidget` 实例，用于占位但不可见。
- 常用于逻辑控制或后台数据绑定。

---

### `'audio'` - 音频播放器

嵌入一个音频播放控件，支持自动播放开关。

#### 构建逻辑

```js
bricks.add_ViewBuilder('audio', function(opts){
    var options = bricks.extend({}, opts);
    var url = options.value;
    return new bricks.AudioPlayer({ url: url, autoplay: false });
});
```

#### 说明

- 从 `opts.value` 提取音频文件 URL。
- 创建 `AudioPlayer` 实例，默认禁用自动播放。

---

## 扩展性与自定义

开发者可通过 `bricks.add_ViewBuilder` 方法扩展新的字段类型支持。

### 自定义示例

```js
bricks.add_ViewBuilder('image', function(opts) {
    return new bricks.Image({
        src: opts.value,
        alt: opts.label || 'Image'
    });
});
```

> 只需确保 `uitype` 不冲突即可无缝集成。

---

## 依赖说明

本模块依赖以下 `bricks` 子模块：

| 模块             | 用途 |
|------------------|------|
| `bricks.extend`   | 对象浅拷贝工具函数（类似 jQuery.extend）。 |
| `bricks.Text`     | 文本显示组件。 |
| `bricks.Icon`     | 图标显示组件。 |
| `bricks.JsWidget` | 基础 UI 容器组件。 |
| `bricks.AudioPlayer` | 音频播放组件。 |

> 确保这些组件在运行时已加载。

---

## 使用示例

```js
// 获取构建器
var builder = bricks.get_ViewBuilder('str');
// 创建组件
var textWidget = builder({ value: 'Hello World' });
// 插入 DOM
textWidget.renderTo(document.body);
```

---

## 总结

| 特性         | 说明 |
|--------------|------|
| **设计模式** | 工厂模式 + 注册中心 |
| **可扩展性** | 高，支持动态添加新类型 |
| **安全性**   | 敏感信息（如密码）做了脱敏处理 |
| **灵活性**   | 支持从不同数据源提取内容（如 `user_data`） |

此模块是构建动态 UI 展示层的核心组件之一，适合用于低代码平台、表单引擎、CMS 内容预览等场景。