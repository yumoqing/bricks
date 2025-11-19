# `MultipleStateImage` 技术文档

> **命名空间**: `bricks.MultipleStateImage`  
> **继承自**: `bricks.Layout`  
> **注册名称**: `'MultipleStateImage'`（可通过 `bricks.Factory` 创建）

---

## 概述

`MultipleStateImage` 是一个可交互的图像组件，支持在多个预定义状态之间切换。每个状态对应一张不同的图片 URL。用户点击图像时，组件会自动切换到下一个状态，并更新显示的图片。

该组件适用于需要通过点击切换不同视觉状态的场景，例如：开关按钮、多状态图标、轮播式图片控件等。

---

## 构造函数

```js
new bricks.MultipleStateImage(options)
```

### 参数

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| `opts` | `Object` | ✅ | 配置选项对象 |

#### `opts` 配置项

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `state` | `String` | ✅ | 初始状态名称，必须是 `urls` 中的一个键 |
| `urls` | `Object<String, String>` | ✅ | 状态与图片 URL 的映射表，格式为 `{ stateName: imageUrl }` |
| `width` | `Number` \| `String` | ❌ | 图像宽度（可选，传递给内部 `bricks.Image` 组件） |
| `height` | `Number` \| `String` | ❌ | 图像高度（可选，传递给内部 `bricks.Image` 组件） |

---

## 示例用法

```js
var image = new bricks.MultipleStateImage({
    state: 'off',
    urls: {
        off: 'images/light_off.png',
        on: 'images/light_on.png'
    },
    width: 100,
    height: 100
});

// 添加到父容器
parent.add_widget(image);

// 监听状态变化
image.bind('state_changed', function(newState) {
    console.log('当前状态:', newState);
});
```

---

## 方法

### `set_state(state)`

手动设置当前状态并更新图像。

- **参数**:
  - `state` (`String`) - 要切换到的状态名，必须存在于 `opts.urls` 中。
- **行为**:
  - 更新内部状态 `this.state`
  - 调用内部图像的 `set_url()` 方法加载新图片

```js
image.set_state('on');
```

---

### `change_state(event)`

**私有方法 / 事件处理器** — 响应图像点击事件，自动切换到下一个状态。

- **触发方式**: 用户点击图像时自动调用
- **行为**:
  - 阻止事件冒泡（`stopPropagation`）
  - 在 `urls` 的状态列表中循环切换至下一个状态
  - 若已是最后一个状态，则回到第一个状态（循环切换）
  - 触发 `state_changed` 事件

> ⚠️ 通常无需直接调用此方法，已绑定在图像的 `'click'` 事件上。

---

## 事件

### `state_changed`

当图像状态发生改变时触发。

- **回调参数**:
  - `newState` (`String`) - 当前切换后的状态名

```js
image.bind('state_changed', function(state) {
    console.log('状态已切换为:', state);
});
```

---

## 内部结构

- 使用 `bricks.Image` 实例作为核心图像渲染组件
- 将自身作为布局容器，通过 `add_widget(this.img)` 管理子组件
- 状态切换逻辑基于 `Object.keys(this.opts.urls)` 的顺序进行循环

---

## 注意事项

1. **状态顺序依赖对象键的枚举顺序**  
   JavaScript 中对象属性的遍历顺序在现代引擎中通常是插入顺序，建议确保 `urls` 对象的键按预期顺序定义。

2. **URL 合法性需提前校验**  
   组件不检查图片 URL 是否有效，错误需由外部处理。

3. **事件绑定自动完成**  
   构造函数中已自动绑定 `'click'` 事件，无需重复绑定。

4. **工厂注册**  
   已通过 `bricks.Factory.register('MultipleStateImage', ...)` 注册，可在声明式模板中使用类型名创建。

---

## 工厂注册

```js
bricks.Factory.register('MultipleStateImage', bricks.MultipleStateImage);
```

允许通过配置方式创建实例：

```js
bricks.Factory.create({
    type: 'MultipleStateImage',
    state: 'off',
    urls: {
        off: 'images/off.png',
        on: 'images/on.png'
    },
    width: 50,
    height: 50
});
```

---

## 版权与归属

- 所属模块: `bricks`
- 组件名: `MultipleStateImage`
- 作者: （根据项目上下文补充）
- 版本: 1.0.0

--- 

✅ *文档结束*