# Svg

用于显示可缩放矢量图形（SVG），支持颜色动态替换、远程加载 SVG 内容以及闪烁动画效果。该控件继承自 `VBox`，属于**普通控件**。

## 主要方法

- `set_url(url)`  
  从指定 URL 加载 SVG 内容并渲染到当前控件中。若 `url` 为空，则清空内容。

- `set_color(color)`  
  设置 SVG 的填充颜色，并重新渲染带颜色的 SVG。

- `set_colored_svg(color)`  
  使用模板替换 `{color}` 变量，将原始 SVG 文本染色后插入 DOM。

- `start_blink()`  
  启动周期性闪烁动画（根据 `blinktime` 毫秒间隔切换显示与隐藏）。

- `end_blink()`  
  停止闪烁动画。

- `_blink()`  
  私有方法，实现实际的闪烁逻辑，通过 `schedule_once` 循环调用自身。

## 主要事件

无内置公开事件，但可通过父类 `JsWidget` 继承的 `dispatch` 方法派发自定义事件。

## 源码例子

```json
{
  "id": "svg_icon",
  "widgettype": "Svg",
  "options": {
    "url": "/assets/icons/home.svg",     // 远程 SVG 文件地址
    "rate": 1.5,                         // 缩放比例
    "color": "#007BFF",                  // 图标颜色（可选，默认取自应用主题）
    "blinktime": 500                     // 闪烁间隔（毫秒），设置后自动开启闪烁
  },
  "binds": [
    {
      "actiontype": "method",
      "wid": "svg_icon",
      "event": "click",
      "target": "svg_icon",
      "method": "end_blink",
      "conform": {
        "title": "确认停止",
        "message": "是否停止闪烁？"
      }
    }
  ]
}
```

> 注释：此控件适合用于需要动态变色或交互反馈的图标展示场景。通过 `url` 动态加载 SVG，结合 `color` 实现主题适配；`blinktime` 提供视觉提示功能。

---

# StatedSvg

一个状态切换型 SVG 控件，允许在多个预定义状态之间循环切换，每个状态对应不同的 SVG 图标。点击控件时触发状态变更。继承自 `Svg`，属于**普通控件**。

## 主要方法

- `set_state(state)`  
  切换到指定名称的状态，加载对应状态的 SVG 资源，并派发 `state_changed` 事件。

- `trigger(event)`  
  点击事件处理器，用于循环切换下一个状态（循环式切换）。

## 主要事件

- `state_changed`  
  当状态发生变化时派发，携带新状态名作为参数。

## 源码例子

```json
{
  "id": "power_indicator",
  "widgettype": "StatedSvg",
  "options": {
    "states": [
      {
        "state": "off",
        "url": "/icons/power-off.svg"
      },
      {
        "state": "on",
        "url": "/icons/power-on.svg"
      },
      {
        "state": "standby",
        "url": "/icons/power-standby.svg"
      }
    ],
    "state": "off",                       // 初始状态
    "color": "#FFFFFF",
    "blinktime": 300                     // 在 on 状态下可配合闪烁使用
  },
  "binds": [
    {
      "actiontype": "event",
      "wid": "power_indicator",
      "event": "state_changed",
      "target": "status_label",
      "dispatch_event": "update_text",
      "params": {
        "text": "{data}"                  // data 为 state 值
      }
    },
    {
      "actiontype": "method",
      "wid": "power_indicator",
      "event": "state_changed",
      "target": "power_indicator",
      "method": "start_blink",
      "rtdata": {
        "condition": "data === 'standby'" // 若状态为 standby，则开始闪烁
      }
    }
  ]
}
```

> 注释：`StatedSvg` 适用于电源、模式、连接状态等具有明确状态阶段的图标控件。通过 `states` 数组配置各个状态及其对应的 SVG 路径，点击自动轮转。

---

# MultipleStateIcon

多状态图标控件，基于键值对形式管理多个状态和对应的 SVG URL。继承自 `Svg`，属于**普通控件**。

## 主要方法

- `set_state(state)`  
  根据传入的状态名，查找 `urls` 映射表中的 URL 并加载相应 SVG。

- `change_state(event)`  
  点击事件处理函数，按顺序切换到下一个状态（循环切换）。

## 主要事件

- `state_changed`  
  状态改变后派发，携带当前状态名。

## 源码例子

```json
{
  "id": "mode_selector",
  "widgettype": "MultipleStateIcon",
  "options": {
    "state": "day",                       // 初始状态
    "urls": {
      "day": "/icons/day-mode.svg",
      "night": "/icons/night-mode.svg",
      "auto": "/icons/auto-mode.svg"
    },
    "color": "#333333",
    "rate": 1.2
  },
  "binds": [
    {
      "actiontype": "script",
      "wid": "mode_selector",
      "event": "state_changed",
      "target": "Popup",
      "script": "console.log('切换到了', data.state); bricks.toast(`已切换至 ${data.state} 模式`);",
      "params": {
        "state": "{data}"
      }
    },
    {
      "actiontype": "bricks",
      "wid": "mode_selector",
      "event": "click",
      "target": "config_panel",
      "mode": "append",
      "options": {
        "widgettype": "Label",
        "id": "dynamic_label_{timestamp}",
        "options": {
          "text": "用户点击了模式图标"
        }
      }
    }
  ]
}
```

> 注释：`MultipleStateIcon` 更适合以对象字面量方式组织状态映射关系，结构清晰易维护。常用于主题切换、视图模式选择等 UI 控件。结合 `binds` 可实现丰富的交互响应。