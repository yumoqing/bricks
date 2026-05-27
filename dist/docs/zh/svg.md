# Svg

控件功能：用于加载并显示 SVG 图标，支持颜色动态设置、闪烁效果和自适应尺寸。  
类型：普通控件  
父类控件：bricks.VBox

## 初始化参数

| 参数名      | 类型   | 说明 |
|-----------|--------|------|
| `rate`     | Number | 缩放比例，默认为 1，影响宽度和高度（cwidth 和 cheight） |
| `url`      | String | SVG 文件的 URL 地址，用于动态加载 SVG 内容 |
| `color`    | String | SVG 的填充颜色（可选），若未指定则从应用获取默认颜色 |
| `blinktime`| Number | 闪烁间隔时间（毫秒），若设置则开启周期性闪烁显示/隐藏 |

> **说明**：
> - `cwidth` 和 `cheight` 会被自动设为 `rate` 值。
> - `dynsize` 固定为 true，表示启用动态尺寸。
> - 若未提供 `color`，会调用 `bricks.app.get_color()` 获取默认颜色。

## 主要事件

无自定义事件，但可通过 DOM 事件绑定进行交互。

---

# StatedSvg

控件功能：继承自 `Svg`，支持多状态切换的 SVG 控件。每个状态对应一个 SVG 资源 URL，点击时按顺序循环切换状态，并触发状态变化事件。  
类型：普通控件  
父类控件：bricks.Svg

## 初始化参数

| 参数名    | 类型    | 说明 |
|---------|---------|------|
| `states` | Array<{state: String, url: String}> | 状态数组，每个元素包含状态标识和对应的 SVG URL |
| `state`  | String  | 初始状态值；若未设置，则默认使用 `states[0].state` |

> 示例格式：
> ```js
> states: [
>   { state: 'on', url: '/icons/light_on.svg' },
>   { state: 'off', url: '/icons/light_off.svg' }
> ]
> ```

## 主要事件

| 事件名         | 触发时机 |
|--------------|----------|
| `state_changed` | 当前状态发生改变时触发，携带新状态作为参数 |

> 使用方式示例：
> ```js
> widget.on('state_changed', function(newState) {
>   console.log('State changed to:', newState);
> });
> ```

---

# MultipleStateIcon

控件功能：一种多状态图标控件，基于键值对形式管理多个状态及其对应的 SVG URL，点击后循环切换状态并更新显示内容。  
类型：普通控件  
父类控件：bricks.Svg

## 初始化参数

| 参数名   | 类型             | 说明 |
|--------|------------------|------|
| `urls` | Object<String: String> | 键为状态名，值为对应 SVG 的 URL，例如 `{ normal: '...', active: '...' }` |
| `state`| String           | 当前初始状态，必须是 `urls` 中的一个键名 |

> 示例：
> ```js
> urls: {
>   play: '/icons/play.svg',
>   pause: '/icons/pause.svg',
>   stop: '/icons/stop.svg'
> },
> state: 'play'
> ```

## 主要事件

| 事件名         | 触发时机 |
|--------------|----------|
| `state_changed` | 每次调用 `change_state` 成功切换状态后触发，携带新的状态名称作为参数 |

> 支持通过 `.on('state_changed', ...)` 监听状态变更。
