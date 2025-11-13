# TimePassed

用于显示从开始计时起经过的时间（格式为 `hh:mm:ss`），是一个容器控件，继承自 `bricks.VBox`。该控件每秒自动更新一次时间显示，适用于需要展示运行时长的场景，如计时器、任务耗时统计等。

**类型**：容器控件（继承自 `bricks.VBox`）

## 主要方法

- **start()**  
  开始计时，启动一个周期性任务，每秒调用一次 `add_one_second()` 方法以递增时间并更新界面。

- **stop()**  
  停止计时，取消当前正在执行的周期性任务，防止继续更新时间。

- **add_one_second()**  
  内部私有方法，用于将内部秒数加1，并格式化后更新到子控件 `Text` 中；之后再次调度自身，实现循环计时。

## 主要事件

无自定义事件派发。仅依赖父类 `VBox` 的基础事件能力。

## 源码例子

```json
{
  "id": "time_passed_widget",
  "widgettype": "TimePassed",
  "options": {
    // 可选参数，例如可以扩展 text_rate 控制文本刷新频率
    // "text_rate": 1000  // 示例：表示文本更新速率（毫秒）
  },
  "subwidgets": [],
  "binds": [
    {
      "actiontype": "method",
      "wid": "btn_start_timer",
      "event": "click",
      "target": "time_passed_widget",
      "method": "start",
      "rtdata": {},
      "conform": null,
      "description": "当点击“开始”按钮时，启动计时器"
    },
    {
      "actiontype": "method",
      "wid": "btn_stop_timer",
      "event": "click",
      "target": "time_passed_widget",
      "method": "stop",
      "rtdata": {},
      "conform": null,
      "description": "当点击“停止”按钮时，停止计时器"
    }
  ]
}
```

> ✅ **说明**：
> - `TimePassed` 是一个简单的计时显示器，初始化时时间为 `00:00:00`。
> - 使用 `start()` 启动后，会持续递增时间直到被 `stop()` 停止。
> - 子控件中包含一个 `Text` 控件用于显示时间字符串。
> - 时间格式通过全局函数 `bricks.formatTime(seconds)` 统一处理，确保格式一致。

---

# Countdown

倒计时控件，用于从指定时间开始倒数至零，结束后触发 `timeout` 事件。它是一个容器控件，继承自 `bricks.VBox`，内部使用一个 `Text` 控件显示剩余时间。

**类型**：容器控件（继承自 `bricks.VBox`）

## 主要方法

- **start()**  
  启动倒计时，首次调用 `time_down_second()` 并设置1秒延迟执行，开始递减过程。

- **time_down_second()**  
  内部私有方法：每次被调用时将剩余秒数减1，重新格式化时间并更新显示；若时间归零，则派发 `timeout` 事件并终止倒计时。

## 主要事件

- **timeout**  
  当倒计时结束（即时间到达 `00:00:00`）时自动触发。可用于绑定后续操作，如弹窗提醒、跳转页面或播放提示音。

## 源码例子

```json
{
  "id": "countdown_timer",
  "widgettype": "Countdown",
  "options": {
    "limit_time": "00:05:00",  // 倒计时总时长：5分钟
    "text_rate": 1000          // 文本更新频率（可选，默认1秒刷新一次）
  },
  "subwidgets": [],
  "binds": [
    {
      "actiontype": "method",
      "wid": "btn_start_countdown",
      "event": "click",
      "target": "countdown_timer",
      "method": "start",
      "rtdata": {},
      "description": "用户点击‘开始倒计时’按钮时启动倒计时"
    },
    {
      "actiontype": "event",
      "wid": "countdown_timer",
      "event": "timeout",
      "target": "Popup",
      "dispatch_event": "showMessage",
      "params": {
        "title": "倒计时结束",
        "content": "您的5分钟倒计时已结束！",
        "level": "info"
      },
      "description": "倒计时结束后弹出提示框通知用户"
    }
  ]
}
```

> ✅ **说明**：
> - `limit_time` 必须是 `"hh:mm:ss"` 格式的字符串，支持部分格式如 `"30"`（表示30秒）、`"2:30"`（表示2分30秒）等。
> - 倒计时精度为1秒，使用 `schedule_once(..., 1)` 实现定时。
> - 当时间耗尽时，通过 `this.dispatch('timeout')` 触发事件，外部可通过 `binds` 监听此事件进行响应。
> - 此控件适合用于限时答题、会议提醒、休息倒计等功能模块。

--- 

📌 **备注**：两个控件均已通过 `bricks.Factory.register()` 注册，可在 `.ui` 文件中直接作为 `widgettype` 使用。