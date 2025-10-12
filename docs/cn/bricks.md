# Bricks.js 技术文档

> **Bricks.js** 是一个基于 JavaScript 的前端组件化框架，用于构建可扩展、模块化的 Web 应用程序。它支持动态组件加载、事件绑定、数据实时获取、弹窗管理、国际化（i18n）、媒体流控制等功能。

---

## 目录

- [1. 概述](#1-概述)
- [2. 核心对象 `bricks`](#2-核心对象-bricks)
- [3. 绑定动作（Bind Actions）](#3-绑定动作bind-actions)
  - [通用属性](#通用属性)
  - [各类型绑定的特定属性](#各类型绑定的特定属性)
- [4. 工具函数](#4-工具函数)
  - [`uuid()`](#uuid)
  - [`deviceid(appname)`](#deviceidappname)
  - [`str2data(s, d)`](#str2datas-d)
  - [`apply_data(desc, data)`](#apply_datadesc-data)
- [5. 组件构建系统](#5-组件构建系统)
  - [`widgetBuild(desc, widget, data)`](#widgetbuilddesc-widget-data)
  - [`buildBind(w, desc)`](#buildbindw-desc)
  - [`buildEventBind(from_widget, widget, event, desc)`](#buildeventbindfrom_widget-widget-event-desc)
  - [`universal_handler(from_widget, widget, desc, event)`](#universal_handlerfrom_widget-widget-desc-event)
- [6. 事件处理器生成器](#6-事件处理器生成器)
  - [`buildEventHandler(w, desc, event)`](#buildeventhandlerw-desc-event)
  - [`getRealtimeData(w, desc)`](#getrealtimedataw-desc)
- [7. 各类 Handler 构造函数](#7-各类-handler-构造函数)
  - [`buildNewWindowHandler`](#buildnewwindowhandler)
  - [`buildUrlwidgetHandler`](#buildurlwidgethandler)
  - [`buildBricksHandler`](#buildbrickshandler)
  - [`buildRegisterFunctionHandler`](#buildregisterfunctionhandler)
  - [`buildMethodHandler`](#buildmethodhandler)
  - [`buildScriptHandler`](#buildscripthandler)
  - [`buildDispatchEventHandler`](#builddispatcheventhandler)
- [8. 辅助函数](#8-辅助函数)
  - [`getWidgetById(id, from_widget)`](#getwidgetbyidid-from_widget)
- [9. App 类 (`bricks.App`)](#9-app-类-bricksapp)
  - [构造函数参数 `opts`](#构造函数参数-opts)
  - [主要方法](#主要方法)

---

## 1. 概述

`bricks` 是一个全局命名空间对象，封装了整个应用的核心逻辑：

```js
var bricks = window.bricks || {};
bricks.app = null;
```

所有功能均挂载在 `bricks` 对象下，包括：
- 组件工厂（Factory）
- 弹窗管理（Popup / PopupWindow）
- HTTP 请求客户端（HttpJson）
- 国际化支持（I18n）
- 设备标识与会话管理
- 动态组件构建与事件绑定机制

---

## 2. 核心对象 `bricks`

| 属性/方法         | 类型       | 描述 |
|------------------|-----------|------|
| `app`            | App 实例  | 当前应用主实例 |
| `Body`           | DOM 元素包装 | 页面 body 封装 |
| `bug` / `debug`  | Boolean   | 是否开启调试模式 |
| `Factory`        | Class     | 组件注册与创建工厂 |
| `RF`             | RegisterFunction | 注册函数管理器 |

---

## 3. 绑定动作（Bind Actions）

通过 `desc.binds` 数组定义用户交互行为，每个绑定描述符包含以下结构。

### 通用属性

所有绑定动作都具备以下字段：

| 字段名           | 类型     | 必填 | 描述 |
|------------------|----------|------|------|
| `actiontype`     | String   | ✅   | 动作类型：`bricks`, `urlwidget`, `method`, `script`, `registerfunction`, `event`, `newwindow` |
| `wid`            | String   | ✅   | 触发事件的组件 ID |
| `event`          | String   | ✅   | 监听的事件名称，如 `'click'` |
| `target`         | String 或 Widget | ✅ | 执行目标组件或特殊值（如 `'Popup'`） |
| `datawidget`     | String   | ❌   | 获取运行时数据的源组件 ID |
| `datamethod`     | String   | ❌   | 数据获取方法，默认 `'getValue'` |
| `dataparams`     | Object   | ❌   | 调用 `datamethod` 的参数 |
| `datascript`     | String   | ❌   | 自定义脚本获取数据 |
| `rtdata`         | Object   | ❌   | 静态运行时数据 |
| `conform`        | Object   | ❌   | 确认对话框配置，在执行前弹出确认窗口 |

---

### 各类型绑定的特定属性

#### `urlwidget` action

从远程 URL 加载组件描述并渲染。

| 属性    | 类型     | 描述 |
|--------|---------|------|
| `mode` | String  | `'replace'`, `'insert'`, `'append'`，默认 `'replace'` |
| `options.method` | String | HTTP 方法，默认 `'GET'` |
| `options.params` | Object | 请求参数 |
| `options.url`    | String | 远程组件 JSON 地址 |

#### `bricks` action

本地创建 Bricks 组件。

| 属性    | 类型     | 描述 |
|--------|---------|------|
| `mode` | String  | 同上 |
| `options.widgettype` | String | 组件类型，必须已注册 |
| `options.*` | Any | 组件初始化选项 |

#### `method` action

调用目标组件的方法。

| 属性     | 类型     | 描述 |
|---------|----------|------|
| `method` | String   | 方法名 |
| `params` | Object   | 方法参数（kwargs） |

#### `script` action

执行内联脚本。

| 属性     | 类型     | 描述 |
|---------|----------|------|
| `script` | String   | 可执行 JS 代码字符串（异步函数体） |
| `params` | Object   | 传入脚本的参数 |

#### `registerfunction` action

调用已注册的全局函数。

| 属性      | 类型     | 描述 |
|----------|----------|------|
| `rfname` | String   | 注册函数名称 |
| `params` | Object   | 函数参数 |

#### `event` action

派发自定义事件。

| 属性             | 类型     | 描述 |
|------------------|----------|------|
| `dispatch_event` | String   | 要派发的事件名 |
| `params`         | Object   | 携带的数据 |

---

## 4. 工具函数

### `uuid()`

生成唯一标识符（UUID），优先使用 Web Crypto API，降级为随机字符串。

```js
bricks.uuid(); // 返回类似 "a1b2c3d4e5f6..."
```

- 使用 `crypto.randomUUID()`（现代浏览器）
- 若不支持，则生成 30 位随机字符（来自字母数字集）

> ⚠️ 注意：降级版本非标准 UUID，仅作唯一性参考。

---

### `deviceid(appname)`

为当前设备+应用组合生成持久化设备 ID，存储于 `localStorage`。

```js
bricks.deviceid('myapp'); // → myappdeviceid: abcdef...
```

- Key: `${appname}deviceid`
- 自动生成并缓存，避免重复访问时变化

---

### `str2data(s, d)`

模板字符串解析函数，支持变量插值和类型转换。

**语法格式：**

```
'my name is ${name}, age ${age:type}'
```

支持的类型：
- `int`: 转为整数
- `str`: 字符串（默认）
- `json`: JSON 序列化

**示例：**

```js
bricks.str2data('Hello ${user}', { user: 'Tom' }); 
// → "Hello Tom"

bricks.str2data('${data:json}', { data: { x: 1 } });
// → '{"x":1}'
```

返回 `null` 如果关键变量缺失。

---

### `apply_data(desc, data)`

将数据填充到任意对象结构中（递归模板替换）。

```js
const desc = { url: '/api/${id}' };
const filled = bricks.apply_data(desc, { id: 123 });
// → { url: '/api/123' }
```

内部使用 `str2data` 处理所有字符串字段。

---

## 5. 组件构建系统

### `widgetBuild(desc, widget, data)`

根据组件描述符异步构建组件树。

**参数：**
- `desc`: 组件描述对象（含 `widgettype`, `options`, `subwidgets`, `binds`）
- `widget`: 父组件（上下文）
- `data`: 初始数据，用于模板填充

**流程：**
1. 若 `widgettype === 'urlwidget'`，先发起 HTTP 请求获取真实组件描述
2. 应用 `data` 填充模板
3. 查找组件类（通过 `Factory.get(type)`）
4. 创建实例并设置 `id`
5. 递归构建子组件（`subwidgets`）
6. 绑定事件（`binds`）

**返回：** 构建完成的组件实例（Promise）

---

### `buildBind(w, desc)`

为指定组件建立事件绑定。

**步骤：**
1. 解析 `wid` 得到触发源组件
2. 调用 `buildEventBind(...)` 添加监听器

---

### `buildEventBind(from_widget, widget, event, desc)`

实际绑定事件处理器。

```js
widget.bind(event, handler);
```

处理器为 `bricks.universal_handler(from_widget, widget, desc)` 的柯里化函数。

---

### `universal_handler(from_widget, widget, desc, event)`

统一事件处理入口，支持前置确认（`conform`）。

**逻辑：**
- 若有 `conform` 配置，创建 `Conform` 弹窗，确认后再执行后续操作
- 否则直接调用 `buildEventHandler(...)`

若失败，输出调试信息。

---

## 6. 事件处理器生成器

### `buildEventHandler(w, desc, event)`

根据 `actiontype` 分发不同类型的处理器。

| actiontype         | 返回处理器函数 |
|--------------------|----------------|
| `newwindow`        | 新窗口打开链接 |
| `urlwidget`        | 加载远程组件 |
| `bricks`           | 创建本地组件 |
| `registerfunction` | 调用注册函数 |
| `method`           | 调用组件方法 |
| `script`           | 执行脚本 |
| `event`            | 派发事件 |

同时处理：
- 实时数据提取（`rtdata` 来源：`datawidget`, `datamethod`, `datascript`）
- 参数映射（`params_mapping`）
- 事件参数合并

---

### `getRealtimeData(w, desc)`

从指定组件获取实时数据。

**方式：**
- `desc.method`: 调用组件方法
- `desc.script`: 执行脚本获取结果

**返回：** Promise 包裹的结果数据

---

## 7. 各类 Handler 构造函数

这些函数返回一个“延迟执行”的函数（通常用 `.bind()` 封装），供事件触发时调用。

### `buildNewWindowHandler`

打开新浏览器窗口。

- 支持参数拼接（URL 查询参数）
- 使用 `_buildWidget` 渲染 `NewWindow` 组件

---

### `buildUrlwidgetHandler`

加载远程组件并在目标位置展示。

- 支持 `FormData` 特殊处理（POST 提交）
- 参数自动注入 URL 或请求体

---

### `buildBricksHandler`

在目标容器中渲染本地 Bricks 组件。

- 支持 `mode`: `replace`, `insert`, `append`
- 自动处理弹窗打开（Popup/PopupWindow）

---

### `buildRegisterFunctionHandler`

调用通过 `bricks.RF.register(name, func)` 注册的函数。

- 参数合并策略：`desc.params` + `rtdata` + `event_params`
- 支持模板填充

---

### `buildMethodHandler`

调用目标组件上的某个方法。

```js
target[desc.method].bind(target, params)
```

适用于 `setValue`, `show`, `hide` 等组件 API。

---

### `buildScriptHandler`

动态创建异步函数并绑定执行环境。

```js
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
new AsyncFunction('params', 'event', scriptBody);
```

可用于复杂逻辑脚本注入。

---

### `buildDispatchEventHandler`

向目标组件派发自定义事件。

```js
target.dispatch(desc.dispatch_event, mergedParams);
```

常用于跨组件通信。

---

## 8. 辅助函数

### `getWidgetById(id, from_widget)`

根据 ID 查找组件实例，支持路径表达式。

**ID 支持语法：**
- `'self'`: 当前组件
- `'root'`: 根组件
- `'app'` / `'body'`: 应用主体
- `'window'`: 浏览器窗口根元素
- `'#id'`: DOM ID 选择器
- `'-id'`: 使用 `closest()` 向上查找

**示例：**
```js
bricks.getWidgetById('loginForm.usernameInput');
```

返回匹配的 `bricks_widget` 实例或原生 DOM。

---

## 9. App 类 (`bricks.App`)

继承自 `bricks.Layout`，是整个应用的根容器。

### 构造函数参数 `opts`

| 参数 | 类型 | 描述 |
|------|------|------|
| `appname` | String | 应用名，用于设备 ID 存储 |
| `debug` | Boolean/String | 是否启用调试日志 |
| `login_url` | String | 登录页地址，默认 `/rbac/userpassword_login.ui` |
| `charsize` | Number | 字体基础大小 |
| `language` | String | 初始语言（如 `'zh-CN'`） |
| `i18n.url` | String | 国际化资源接口 |
| `i18n.default_lang` | String | 默认语言 |
| `widget` | Object | 根组件描述 |

### 主要方法

| 方法 | 描述 |
|------|------|
| `run()` | 启动应用：初始化语言、构建根组件、添加至 DOM |
| `build()` | 构建根组件树 |
| `change_language(lang)` | 切换语言并通知 i18n 系统 |
| `key_down_action(event)` | 全局键盘事件捕获 |
| `new_zindex()` | 获取新的 z-index 层级 |
| `screenWidth()` / `screenHeight()` | 获取视口尺寸 |
| `save_session(session)` / `get_session()` | 会话管理 |
| `start_camera(vpos)` | 打开指定摄像头 |
| `start_mic()` | 打开麦克风 |
| `getCameras()` | 获取可用视频输入设备列表 |
| `textsize_bigger()` / `textsize_smaller()` | 调整字体大小 |
| `show_windows_panel()` | 显示多窗口面板（实验性） |

---

## 附录 A：内置组件类型（常见 `widgettype`）

| 类型 | 说明 |
|------|------|
| `Text` | 文本显示 |
| `Button` | 按钮 |
| `Input` | 输入框 |
| `Layout` | 布局容器 |
| `Popup` | 模态弹窗 |
| `PopupWindow` | 独立窗口弹窗 |
| `Conform` | 确认对话框 |
| `NewWindow` | 新浏览器窗口包装器 |
| `WindowsPanel` | 窗口管理面板 |

---

## 附录 B：调试技巧

启用调试：
```js
bricks.bug = true;
```

查看日志：
```js
console.log(...args); // 内部使用 debug 输出
```

推荐配合 Chrome DevTools 使用。

---

## 许可证

MIT License（假设项目允许）

--- 

> 📝 文档版本：v1.0  
> ✍️ 最后更新：2025年4月5日