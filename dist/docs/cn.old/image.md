# `bricks.Image` 及相关图标组件技术文档

> 基于 `bricks.js` 框架的图像与图标类组件实现

---

## 概述

本模块定义了基于 `bricks.JsWidget` 的一系列图像与图标类组件，用于在网页中动态加载、显示和管理图像资源。主要包括：

- `bricks.Image`：基础图像组件
- `bricks.Icon`：可缩放的图标组件（继承自 `Image`）
- `bricks.StatedIcon`：支持状态切换的图标组件（继承自 `Icon`）
- `bricks.BlankIcon`：占位图标组件（无图像内容）

所有组件均通过 `bricks.Factory` 注册，可在配置系统中通过类型名实例化。

---

## 1. `bricks.Image`

### 类定义
```js
class extends bricks.JsWidget
```

### 构造函数
```js
constructor(opts)
```

#### 参数
| 参数 | 类型 | 描述 |
|------|------|------|
| `opts` | Object | 配置选项对象 |

##### `opts` 属性
| 属性 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `url` | String | 否 | 图像的 URL 地址 |
| `default_url` | String | 否 | 当主 `url` 加载失败时使用的备用图像地址 |

#### 行为
- 调用父类构造函数。
- 若传入 `url`，则自动调用 `set_url()` 设置图像源。

---

### 方法

#### `create()`
创建一个 `<img>` 元素作为组件的 DOM 根节点。

```js
create()
```

> **说明**：该方法由框架调用，在初始化时创建 DOM 结构。

---

#### `set_url(url)`
设置图像的 `src` 属性，并绑定错误处理以支持默认图像。

```js
set_url(url)
```

##### 参数
| 参数 | 类型 | 描述 |
|------|------|------|
| `url` | String | 图像资源 URL |

##### 行为
- 将 `this.url` 设为传入值。
- 如果配置了 `default_url`，则为 `<img>` 绑定 `onerror` 事件处理器，加载失败时自动切换到默认图。
- 设置 `dom_element.src = url`

---

#### `set_default_url()`
当图像加载失败时触发，切换至默认图像。

```js
set_default_url()
```

##### 行为
- 移除 `onerror` 监听器，防止重复触发。
- 将 `src` 设置为 `this.opts.default_url`
- 输出日志：`console.log('default_url', this.opts.default_url)`

---

#### `base64()`
将当前图像绘制到 Canvas 并导出为 Base64 编码的 PNG 数据 URL。

```js
base64()
```

##### 返回值
- `{String}` - 图像的 Data URL，格式如：`data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...`

##### 实现逻辑
1. 创建临时 `<canvas>` 元素。
2. 获取上下文并设置画布尺寸等于图像实际宽高。
3. 使用 `drawImage()` 将图像绘制到画布。
4. 调用 `toDataURL('image/png')` 生成 Base64 字符串。
5. 返回结果（未去除头部前缀）。

> ⚠️ 注意：此方法依赖图像已完全加载，否则可能绘制空白或异常内容。

---

#### `removeBase64Header(base64String)`
移除 Base64 字符串中的 MIME 头部信息（例如 `data:image/png;base64,`）。

```js
removeBase64Header(base64String)
```

##### 参数
| 参数 | 类型 | 描述 |
|------|------|------|
| `base64String` | String | 完整的 Data URL 字符串 |

##### 返回值
- `{String}` - 纯 Base64 编码内容

##### 示例
```js
const clean = removeBase64Header('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==');
// → 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
```

---

## 2. `bricks.Icon`

### 类定义
```js
class extends bricks.Image
```

扩展 `Image` 类，提供基于字符单位（`charsize`）的响应式尺寸控制。

---

### 构造函数
```js
constructor(opts)
```

#### 参数
同 `bricks.Image`，额外支持以下选项：

##### `opts` 扩展属性
| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `rate` | Number | `1` | 缩放倍率，相对于 `charsize` |
| `cwidth` | Number | `1` | 占据的字符宽度数 |
| `cheight` | Number | `1` | 占据的字符高度数 |
| `dynsize` | Boolean | `true` | 是否启用动态尺寸调整 |

#### 行为
- 调用父类构造函数。
- 自动执行 `options_parse()` 进行配置解析与尺寸设置。

---

### 方法

#### `options_parse()`
解析配置项并设置图标尺寸及图像源。

```js
options_parse()
```

##### 动作
1. 设置 `rate`（默认为 1）。
2. 计算样式尺寸：`siz = bricks.app.charsize * rate + 'px'`
3. 调用 `set_url(this.url)` 重新加载图像（确保尺寸生效后加载）
4. 设置 `cwidth`, `cheight`, `dynsize`
5. 调用 `charsize_sizing()` 应用尺寸策略

> ✅ 提示：`charsize_sizing()` 是 `JsWidget` 提供的方法，用于根据字符网格进行布局适配。

---

## 3. `bricks.StatedIcon`

### 类定义
```js
class extends bricks.Icon
```

支持多状态切换的图标组件，常用于表示不同 UI 状态（如开/关、在线/离线等）。

---

### 构造函数
```js
constructor(opts)
```

#### 参数
| 属性 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `states` | Array<{state: String, url: String}> | 是 | 状态列表，每个状态包含名称和对应图像 URL |
| `state` | String | 否 | 初始状态名；若未指定，则使用第一个状态 |

#### 示例配置
```js
{
  states: [
    { state: 'online', url: '/img/online.png' },
    { state: 'offline', url: '/img/offline.png' }
  ],
  state: 'online'
}
```

#### 行为
- 调用父类构造函数。
- 自动执行 `options_parse()` 初始化状态。

---

### 方法

#### `options_parse()`
初始化状态机逻辑。

```js
options_parse()
```

##### 行为
- 若未定义 `states` 数组，则直接返回。
- 若未设置初始 `state`，则设为 `states[0].state`
- 调用 `set_state(this.state)` 激活初始状态

---

#### `set_state(state)`
切换当前图标状态，并更新图像。

```js
set_state(state)
```

##### 参数
| 参数 | 类型 | 描述 |
|------|------|------|
| `state` | String | 要切换到的状态名称 |

##### 行为
- 更新 `this.state`
- 遍历 `this.states` 查找匹配项
- 找到后设置 `this.url = s.url`
- 调用 `super.options_parse()` 重新应用图像和尺寸

> 💡 支持链式调用与运行时状态变更。

---

## 4. `bricks.BlankIcon`

### 类定义
```js
class extends bricks.JsWidget
```

一个不渲染图像的“空白图标”，仅保留图标布局结构，用作占位符。

---

### 构造函数
```js
constructor(opts)
```

#### 参数
同 `Icon`，支持：
- `rate`: 缩放比例
- `cwidth`, `cheight`: 字符单元占用
- `dynsize`: 是否动态调整大小

#### 行为
- 不创建图像元素。
- 仅调用 `charsize_sizing()` 实现布局占位。

---

## 工厂注册

所有组件均已注册至 `bricks.Factory`，可在模板或配置中通过字符串类型名实例化：

```js
bricks.Factory.register('Image', bricks.Image);
bricks.Factory.register('StatedIcon', bricks.StatedIcon);
bricks.Factory.register('Icon', bricks.Icon);
bricks.Factory.register('BlankIcon', bricks.BlankIcon);
```

### 使用示例（假设模板语法）
```json
{
  "type": "Icon",
  "url": "/icons/save.png",
  "rate": 1.5,
  "cwidth": 2,
  "cheight": 2
}
```

---

## 总结

| 组件 | 用途 | 特性 |
|------|------|------|
| `Image` | 显示普通图像 | 支持错误 fallback、Base64 导出 |
| `Icon` | 可缩放图标 | 基于 `charsize` 自适应尺寸 |
| `StatedIcon` | 多状态图标 | 支持运行时状态切换 |
| `BlankIcon` | 布局占位符 | 无图像，仅占空间 |

---

## 注意事项

1. **图像跨域问题**：使用 `base64()` 方法时，若图像来自跨域服务器且未开启 CORS，Canvas 将被污染导致无法导出数据。
2. **异步加载**：`base64()` 应在图像 `load` 事件完成后调用，否则结果不可靠。
3. **内存泄漏风险**：频繁调用 `base64()` 会创建大量临时 Canvas，建议缓存或节流。
4. **默认图像防循环**：确保 `default_url` 图像本身有效，避免 `onerror` 死循环。

---

## 版本信息

- 框架：`bricks.js`
- 模块：`image.js`
- 最后更新：2025年4月5日

--- 

✅ **建议使用场景**：
- 图标按钮、状态指示器、用户头像、动态图像预览等需要灵活控制图像行为的 UI 元素。