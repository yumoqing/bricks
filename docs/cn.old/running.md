# `bricks.Running` 模块技术文档

---

## 概述

`bricks.Running` 是一个用于显示运行中状态（如加载、处理中）的模态窗口组件，通常用于提示用户当前系统正在执行某项任务。它基于 `bricks.BaseModal` 和自定义的 `bricks.BaseRunning` 类构建，提供了一个动态更新的时间计时器和一个可配置的动画图标（默认为 `running.gif`）。

该模块适用于需要可视化反馈长时间操作进度的场景。

---

## 依赖说明

- `bricks.FHBox`：水平布局容器基类。
- `bricks.BaseModal`：模态窗口基类。
- `bricks.Icon`：图标显示组件。
- `bricks.Text`：文本显示组件。
- `bricks.formatMs()`：格式化毫秒时间的工具函数。
- `schedule_once()`：定时调度函数，用于周期性执行任务。
- `bricks_resource()`：资源路径解析函数，用于获取静态资源 URL。

> ⚠️ 注意：以上依赖需在运行环境中提前定义并可用。

---

## 类结构

### 1. `bricks.BaseRunning` 类

继承自 `bricks.FHBox`，用于构建包含图标与运行时间显示的横向控件。

#### 构造函数：`constructor(opts)`

##### 参数

| 参数名 | 类型   | 是否必填 | 描述 |
|--------|--------|----------|------|
| `opts.icon` | String | 否 | 图标图片的 URL 路径。若未提供，则使用默认资源路径下的 `running.gif`。 |

##### 功能说明

1. 调用父类构造函数。
2. 创建一个 `Icon` 组件用于展示运行动画。
3. 创建一个 `Text` 组件用于实时显示已运行时间。
4. 初始化起始时间戳（`this.time_start`）。
5. 将图标和文本控件添加到容器中。
6. 启动定时任务，每 50ms 更新一次时间显示。

##### 示例代码

```js
const runner = new bricks.BaseRunning({
  icon: '/custom/loading.svg'
});
```

#### 方法：`show_timepass()`

- **功能**：计算从开始到当前经过的时间，并格式化后更新到 `Text` 控件上。
- **触发机制**：通过 `schedule_once` 每 50ms 自调用一次，形成持续更新效果。
- **时间格式**：调用 `bricks.formatMs(t, 1)`，保留一位小数，单位为秒（例如：`3.2s`）。

#### 方法：`stop_timepass()`

- **功能**：停止时间更新任务。
- **行为**：
  - 如果存在正在进行的定时任务（`this.showtime_task`），则取消该任务。
  - 清空任务引用，防止内存泄漏。

---

### 2. `bricks.Running` 类

继承自 `bricks.BaseModal`，封装 `BaseRunning` 成一个自动弹出的模态框。

#### 构造函数：`constructor(opts)`

##### 参数

| 参数名     | 类型   | 是否必填 | 描述 |
|------------|--------|----------|------|
| `opts.target` | Element | 否 | 模态框挂载的目标 DOM 元素。默认为 body 或由 BaseModal 决定。 |
| `opts.icon`   | String  | 否 | 使用的图标路径，将传递给 `BaseRunning`。 |

##### 特性设置

- `auto_open: true`：实例化后自动打开模态框。
- `archor: 'cc'`：模态框居中对齐（center-center）。

##### 内部逻辑

- 创建 `bricks.BaseRunning` 实例作为内容主体。
- 将其加入模态框内容区域。

#### 方法：`dismiss()`

- **功能**：关闭模态框前，先停止计时器。
- **步骤**：
  1. 调用 `this.w.stop_timepass()` 停止时间更新。
  2. 调用父类 `BaseModal.dismiss()` 关闭模态框。

> ✅ 提示：此方法确保资源释放和定时器清理。

---

### 3. 工厂注册

```js
bricks.Factory.register('Running', bricks.Running);
```

- 将 `Running` 组件注册到 `bricks.Factory` 中，支持通过字符串名称动态创建实例：

```js
bricks.Factory.create('Running', { icon: 'imgs/custom.gif' });
```

---

## 使用示例

### 示例 1：基本使用（默认图标）

```js
new bricks.Running();
// 弹出居中模态框，显示默认 running.gif 与运行时间
```

### 示例 2：自定义图标

```js
new bricks.Running({
  icon: '/assets/icons/spinner.svg'
});
```

### 示例 3：手动关闭

```js
const runner = new bricks.Running();

// 在某个异步操作完成后关闭
setTimeout(() => {
  runner.dismiss(); // 自动停止计时器并关闭模态框
}, 3000);
```

---

## 样式与外观

| 组件       | 属性        | 值                     |
|------------|-------------|------------------------|
| 文本颜色   | color       | `#222`                 |
| 文本换行   | wrap        | `false`                |
| 国际化支持 | i18n        | `false`                |
| 容器布局   | FHBox       | 水平排列图标与时间文本 |
| 模态框锚点 | archor      | `'cc'`（居中）         |

> 可通过扩展 CSS 或子类进一步定制样式。

---

## 性能与注意事项

- **刷新频率**：每 50ms 更新一次时间，平衡流畅性与性能。
- **资源管理**：
  - 必须调用 `dismiss()` 正确关闭，避免定时器持续运行。
  - 不手动调用可能导致内存泄漏或界面卡顿。
- **跨浏览器兼容性**：依赖 `Date.now()` 和 `bind()`，建议配合 polyfill 在旧浏览器中使用。

---

## API 总结

| 类名              | 方法 / 属性           | 类型     | 描述 |
|-------------------|------------------------|----------|------|
| `bricks.BaseRunning` | `constructor(opts)`    | 构造函数 | 初始化带图标的运行状态条 |
|                   | `show_timepass()`      | 方法     | 定时更新运行时间 |
|                   | `stop_timepass()`      | 方法     | 停止时间更新任务 |
| `bricks.Running`     | `constructor(opts)`    | 构造函数 | 创建并自动打开模态框 |
|                   | `dismiss()`            | 方法     | 停止计时并关闭模态框 |
| `bricks.Factory`     | `.register(type, cls)` | 静态方法 | 注册组件以便工厂创建 |

---

## 版本信息

- **作者**：Bricks Framework Team
- **版本**：1.0
- **最后更新**：2025年4月5日

> 更多文档请参考 [Bricks UI 官方文档](https://bricks.example.com/docs)

--- 

📌 **建议用途**：数据加载、文件上传、后台处理等耗时操作的状态提示。