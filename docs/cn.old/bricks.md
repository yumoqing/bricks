# Bricks.js 技术文档

> **Bricks.js** 是一个基于 JavaScript 的开发的前端组件化框架，用于构建可扩展、模块化的 Web 应用程序。bricks提供开发者使用json数据开发前端界面的能力，它支持动态组件加载、事件绑定、数据实时获取、弹窗管理、国际化（i18n）、媒体流控制等功能。

bricks以控件为单位构建界面，所有控件都从一个JsWidget继承而来，bricks的控件分为普通控件和容器控件，容器控件可以有子控件，而普通控件没有子控件，在bricks的源码文件中，用”subwidgets“数组描述子控件

## bricks开发逻辑
使用json格式的原文件（以".ui“结尾）来开发前端界面，每个ui文件

bricks使用规范化的json来描述前端界面，json数据约束如下
{
	"id"			# 控件id
	"widgettype"	# 控件类型，请看考bricks控件清单
	"options"		# 控件构造参数，支持控件类继承的参数
	"subwidgets"	# 容器类控件需要，数组形式的一到多个控件json
	"binds"			# 事件处理数组， 参看bind数据规范
}

当widgettype值为"urlwidget“时，options必须为
{
	"url" 		# 从服务器中获取控件json
	“params"	# 参数
	"method"	# 缺省为“GET”
}
意思就是从服务器中用options中提供的数据从远程服务器中获取bricks控件源码，渲染到target定义的容器控件中，这种形式提供了bricks模块化编程能力，其他的widgettype值必须时bricks中注册过的控件名称，请参看bricks的控件清单

### binds数据规范
binds数组定义用户交互行为，每个绑定bind描述符包含以下结构。

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

各类型绑定的特定属性

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
| `options| 对象 | 符合控件源码要求的json数据，其属性widgettype的值必须时bricks已经注册的控件 |

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

在target控件上派发自定义事件。

| 属性             | 类型     | 描述 |
|------------------|----------|------|
| `dispatch_event` | String   | 要派发的事件名 |
| `params`         | Object   | 携带的数据 |

---
