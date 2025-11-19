# Bricks 时间组件技术文档

本模块提供两个基于 `bricks` 框架的时间显示类组件：`TimePassed`（计时器）和 `Countdown`（倒计时器），并包含一个通用的时间格式化工具函数。这些组件可用于构建需要时间展示功能的 UI 界面。

---

## 目录

- [1. 核心工具函数](#1-核心工具函数)
  - [`bricks.formatTime(seconds)`](#bricksformattimeseconds)
- [2. TimePassed 类（正向计时器）](#2-timepassed-类正向计时器)
  - [继承关系](#继承关系)
  - [构造函数](#构造函数)
  - [方法](#方法)
- [3. Countdown 类（倒计时器）](#3-countdown-类倒计时器)
  - [继承关系](#继承关系-1)
  - [配置选项 (`opts`)](#配置选项-opts)
  - [事件](#事件)
  - [构造函数](#构造函数-1)
  - [方法](#方法-1)
- [4. 工厂注册](#4-工厂注册)
- [5. 使用示例](#5-使用示例)

---

## 1. 核心工具函数

### `bricks.formatTime(seconds)`

将秒数转换为 `HH:MM:SS` 格式的字符串，不足两位用前导零填充。

#### 参数

| 参数名    | 类型   | 描述         |
|---------|--------|--------------|
| seconds | number | 时间（以秒为单位） |

#### 返回值

- `{string}`：格式化后的时间字符串，格式为 `HH:MM:SS`。

#### 示例

```js
bricks.formatTime(3661); // 输出 "01:01:01"
bricks.formatTime(59);   // 输出 "00:00:59"
```

#### 实现说明

- 小时 = `Math.floor(seconds / 3600)`
- 分钟 = `Math.floor((seconds % 3600) / 60)`
- 秒 = `seconds % 60`
- 每部分使用 `.padStart(2, '0')` 补齐至两位数字。

---

## 2. TimePassed 类（正向计时器）

用于从 0 开始递增显示已过去的时间（如“00:00:05”表示运行了 5 秒）。

### 继承关系

```js
class TimePassed extends bricks.VBox
```

> 继承自 `bricks.VBox`，作为容器可包含子控件。

---

### 构造函数

```js
new bricks.TimePassed(opts)
```

#### 参数

| 参数名     | 类型   | 是否必需 | 描述                     |
|----------|--------|----------|--------------------------|
| opts     | object | 是       | 配置对象                 |
| opts.text_rate | any  | 否       | 文本渲染速率或样式参数，传递给内部 Text 组件 |

> ⚠️ 注意：当前代码中存在潜在 bug —— 使用了未定义变量 `this.t` 和 `this.text_rate`，应为 `opts.text_rate` 并初始化文本内容为 `formatTime(this.seconds)`。

✅ **建议修复后的构造函数片段：**

```js
this.seconds = 0;
this.text_w = new bricks.Text({
    text: bricks.formatTime(this.seconds),
    rate: opts.text_rate
});
this.add_widget(this.text_w);
```

---

### 方法

| 方法名       | 描述                                                         |
|------------|--------------------------------------------------------------|
| `start()`  | 启动计时器，每秒调用一次 `add_one_second()`，开始递增时间。       |
| `stop()`   | 停止计时器，取消当前调度任务。                                   |

#### `add_one_second()`

私有方法，由 `schedule_once` 调度执行：

- 每次使 `this.seconds += 1`
- 更新显示文本
- 自动重新调度下一次调用（形成循环）

> 使用 `bind(this)` 确保上下文正确。

⚠️ 若不停止，将持续运行。

---

## 3. Countdown 类（倒计时器）

实现一个可配置的倒计时组件，在时间归零时触发事件。

### 继承关系

```js
class Countdown extends bricks.VBox
```

> 同样继承自 `VBox` 容器组件。

---

### 配置选项 (`opts`)

| 参数名        | 类型   | 是否必需 | 描述                                                                 |
|-------------|--------|----------|----------------------------------------------------------------------|
| limit_time  | string | 是       | 初始倒计时时间，格式支持 `"SS"`、`"MM:SS"` 或 `"HH:MM:SS"`               |
| text_rate   | any    | 否       | 传入 Text 组件的渲染参数                                               |

---

### 事件

| 事件名      | 触发条件                         | 数据参数 |
|-----------|----------------------------------|--------|
| `timeout` | 当倒计时结束（`this.seconds < 1`）时触发 | 无     |

可通过 `this.dispatch('timeout')` 触发事件，供外部监听。

---

### 构造函数

```js
new bricks.Countdown(opts)
```

#### 功能说明

1. 解析 `opts.limit_time` 字符串为小时、分钟、秒。
2. 支持以下格式：
   - `"30"` → 30 秒
   - `"5:30"` → 5 分 30 秒
   - `"1:30:45"` → 1 小时 30 分 45 秒
3. 转换为总秒数存储在 `this.seconds`。
4. 创建并添加 `Text` 组件用于显示时间。

> ✅ 支持任意长度分割，但仅处理 1~3 段，其余情况默认按三段解析。

---

### 方法

| 方法名              | 描述                                                                 |
|-------------------|----------------------------------------------------------------------|
| `start()`         | 启动倒计时，延迟 1 秒后调用 `time_down_second()` 开始递减。             |
| `time_down_second()` | 私有方法：每次减少 1 秒，更新显示；若时间为 0，则触发 `timeout` 事件并终止。 |

> 使用 `schedule_once(fn, delay)` 实现定时回调，形成递归倒计时。

---

## 4. 工厂注册

为了支持动态创建组件实例，通过工厂模式注册两个类：

```js
bricks.Factory.register('Countdown', bricks.Countdown);
bricks.Factory.register('TimePassed', bricks.TimePassed);
```

### 用途

允许通过字符串名称动态创建组件，例如：

```js
let timer = bricks.Factory.create('TimePassed', { text_rate: 'high' });
let cd = bricks.Factory.create('Countdown', { limit_time: '00:01:00' });
```

---

## 5. 使用示例

### 示例 1：创建并启动正向计时器

```js
let timePassed = new bricks.TimePassed({
    text_rate: 'normal'
});

// 添加到页面或其他容器
someContainer.add_widget(timePassed);

// 开始计时
timePassed.start();

// 停止计时
// timePassed.stop();
```

### 示例 2：创建倒计时器并监听超时事件

```js
let countdown = new bricks.Countdown({
    limit_time: '00:00:10',  // 10 秒倒计时
    text_rate: 'large'
});

countdown.on('timeout', function() {
    console.log('倒计时结束！');
    alert('时间到！');
});

someContainer.add_widget(countdown);
countdown.start();  // 启动倒计时
```

### 示例 3：使用工厂创建组件

```js
let widget = bricks.Factory.create('Countdown', {
    limit_time: '01:30:00'
});

widget.on('timeout', () => {
    console.log('倒计时完成');
});

container.add_widget(widget);
widget.start();
```

---

## 注意事项与改进建议

1. **Bug 修复建议**
   - 在 `TimePassed` 构造函数中，`text: this.t` 应改为 `text: bricks.formatTime(this.seconds)`
   - `rate: this.text_rate` 应为 `rate: opts.text_rate`

2. **性能优化**
   - 可考虑使用 `setInterval` 替代递归 `schedule_once`，但当前方式更灵活且兼容异步调度系统。

3. **扩展性建议**
   - 可增加 `pause()` 方法支持暂停/恢复。
   - 提供 `getFormattedTime()` 公共方法获取当前时间字符串。

4. **输入验证**
   - 对 `limit_time` 的解析可加入非法值检测（如非数字）。

---

## 版本信息

- 模块名：`bricks.time`
- 作者：Bricks Framework Team
- 最后更新：2025-04-05

--- 

📌 *本文档适用于 Bricks UI 框架 v1.x+*