# Image

## 控件功能，类型（普通控件或容器控件），父类控件
用于显示图片的控件。支持设置图片 URL、默认错误备用图，以及将当前图像内容导出为 Base64 字符串。  
**类型：** 普通控件  
**父类控件：** `bricks.JsWidget`

### 初始化参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `url` | String | 图片的 URL 地址，构造时会自动设置到 `<img>` 元素的 `src` 属性 |
| `default_url` | String | 当图片加载失败时，自动切换为此 URL 显示备用图 |
| `height` | Number (可选) | 设置图片高度（可由 CSS 或 DOM 自动处理） |
| `width` | Number (可选) | 设置图片宽度（可由 CSS 或 DOM 自动处理） |

> 注：所有参数通过 `opts` 对象传入构造函数。

### 主要事件

无显式定义事件，但内部使用了原生 `<img>` 的 `onerror` 事件来处理加载失败情况：

- **`onerror` → 触发 `set_default_url()`**  
  当图片加载失败时，自动替换为 `default_url` 指定的备用图片，并清除错误监听以防止循环触发。

---

# Icon

## 控件功能，类型（普通控件或容器控件），父类控件
基于 `Image` 扩展的图标控件，支持字符单位尺寸缩放（`charsize` 基础）、动态大小调整和布局适配。常用于界面中与文字对齐的小图标。  
**类型：** 普通控件  
**父类控件：** `bricks.Image`

### 初始化参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `url` | String | 图标图片地址，继承自 `Image` |
| `rate` | Number | 缩放倍率，默认为 `1`，实际大小 = `charsize * rate` |
| `cwidth` | Number | 占据的字符宽度，默认为 `1` |
| `cheight` | Number | 占据的字符高度，默认为 `1` |
| `dynsize` | Boolean | 是否启用动态尺寸调整，默认为 `true`，根据 `charsize_sizing()` 调整尺寸 |

> 注：`charsize` 来源于 `bricks.app.charsize`，是应用级字体基准单位。

### 主要事件

无独立事件定义，行为主要在初始化和属性变更后通过 `options_parse()` 触发重绘。

- **`options_parse()`**  
  在控件初始化时调用，用于解析并应用尺寸相关选项，包括设置 URL 和调整大小。

---

# StatedIcon

## 控件功能，类型（普通控件或容器控件），父类控件
状态图标控件，可依据不同状态切换对应图标图像。适用于如开关状态、多态指示器等场景。  
**类型：** 普通控件  
**父类控件：** `bricks.Icon` （间接继承 `Image`）

### 初始化参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `states` | Array<{state: String, url: String}> | 状态数组，每个对象包含一个状态名和对应的图片 URL |
| `state` | String | 初始状态名称；若未指定，则默认使用 `states[0].state` |
| `rate`, `cwidth`, `cheight`, `dynsize` | 同上 | 继承自 `Icon` 的布局与样式参数 |

> 示例：
> ```js
> {
>   states: [
>     { state: 'normal', url: 'icon-normal.png' },
>     { state: 'active', url: 'icon-active.png' }
>   ],
>   state: 'normal'
> }
> ```

### 主要事件

- **`set_state(state)`**  
  方法：手动设置当前状态，控件会查找匹配的状态项并更新图片 URL，重新解析选项并渲染。
  - 参数：`state` —— 要切换到的状态字符串
  - 行为：遍历 `this.states`，找到对应项后调用 `super.options_parse()` 更新视图

---

# BlankIcon

## 控件功能，类型（普通控件或容器控件），父类控件
空白占位图标控件，不显示任何图像，仅作为具有固定字符尺寸的透明占位符，用于布局对齐或动态替换前的预留空间。  
**类型：** 普通控件  
**父类控件：** `bricks.JsWidget`

### 初始化参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `rate` | Number | 尺寸缩放比率，默认为 `1`，影响基于 `charsize` 的计算 |
| `cwidth` | Number | 占据的字符宽度，默认为 `1` |
| `cheight` | Number | 占据的字符高度，默认为 `1` |
| `dynsize` | Boolean | 是否启用动态尺寸调整，默认为 `true`，控制是否响应 `charsize_sizing()` |

### 主要事件

无公开事件或回调。其核心作用是在 UI 布局中保持与其他图标一致的尺寸行为，而不加载任何图像资源。