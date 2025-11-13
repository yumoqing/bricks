# Button

按钮控件，用于触发用户交互操作。类型：普通控件，继承自 `JsWidget`

## 主要方法

- `setValue(text: string)`  
  设置按钮显示的文本内容。

- `getValue(): string`  
  获取按钮当前显示的文本。

- `enable()`  
  启用按钮，允许用户点击。

- `disable()`  
  禁用按钮，禁止用户点击并呈现灰化状态。

- `show()`  
  显示按钮。

- `hide()`  
  隐藏按钮。

## 主要事件

- `click`  
  用户点击按钮时触发。

- `focus`  
  按钮获得焦点时触发。

- `blur`  
  按钮失去焦点时触发。

## 源码例子

```json
{
  "id": "btn_submit",                    // 控件唯一ID
  "widgettype": "Button",                // 控件类型：Button
  "options": {
    "value": "提交",                     // 初始按钮文本
    "disabled": false,                   // 是否禁用，默认为false
    "style": "primary",                  // 可选样式：primary, secondary, danger等
    "tooltip": "点击提交表单"             // 鼠标悬停提示
  },
  "binds": [
    {
      "actiontype": "method",            // 动作类型：调用方法
      "wid": "btn_submit",               // 触发组件ID
      "event": "click",                  // 监听点击事件
      "target": "form_data",             // 目标组件ID
      "method": "submit",                // 调用目标的方法名
      "params": {}                       // 方法参数
    },
    {
      "actiontype": "script",            // 执行脚本动作
      "wid": "btn_submit",
      "event": "click",
      "target": "btn_submit",
      "script": "console.log('按钮被点击:', data); return true;",
      "params": {
        "data": "提交日志记录"
      }
    }
  ]
}
```

---

# Panel

面板控件，用于布局容器，可包含多个子控件。类型：容器控件，继承自 `JsWidget`

## 主要方法

- `addSubwidget(widgetJson)`  
  动态添加一个子控件（JSON 描述）到面板中。

- `removeSubwidget(widgetId: string)`  
  移除指定 ID 的子控件。

- `clear()`  
  清空所有子控件。

- `show()`  
  显示整个面板。

- `hide()`  
  隐藏面板。

- `setTitle(title: string)`  
  设置面板标题（如果支持标题栏）。

## 主要事件

- `init`  
  面板初始化完成后触发。

- `rendered`  
  所有子控件渲染完成时触发。

- `childadded`  
  添加子控件后触发，携带新控件信息。

## 源码例子

```json
{
  "id": "panel_user_info",               // 容器ID
  "widgettype": "Panel",                 // 控件类型：Panel
  "options": {
    "title": "用户信息",                 // 面板标题
    "collapsible": true,                 // 是否可折叠
    "collapsed": false,                  // 初始是否折叠
    "border": true,                      // 是否显示边框
    "layout": "vertical"                 // 布局方式：vertical / horizontal
  },
  "subwidgets": [                        // 子控件数组
    {
      "id": "label_name",
      "widgettype": "Label",
      "options": {
        "value": "姓名：张三"
      }
    },
    {
      "id": "label_age",
      "widgettype": "Label",
      "options": {
        "value": "年龄：28"
      }
    },
    {
      "id": "btn_edit",
      "widgettype": "Button",
      "options": {
        "value": "编辑"
      },
      "binds": [
        {
          "actiontype": "event",
          "wid": "btn_edit",
          "event": "click",
          "target": "panel_user_info",
          "dispatch_event": "editmode_enter",
          "params": {
            "user_id": 1001
          }
        }
      ]
    }
  ],
  "binds": [
    {
      "actiontype": "bricks",            // 在本地创建新的Bricks组件
      "wid": "panel_user_info",
      "event": "init",
      "target": "Popup",                 // 特殊目标：弹窗管理器
      "mode": "append",
      "options": {
        "widgettype": "Toast",
        "options": {
          "text": "用户面板已加载",
          "duration": 2000
        }
      }
    }
  ]
}
```

---

# UrlWidget

远程组件加载控件，用于动态从服务器加载界面模块。类型：普通控件或容器控件（取决于加载内容），继承自 `JsWidget`

## 主要方法

- `reload(params?: Object)`  
  使用新的参数重新请求远程URL，刷新组件。

- `getLoadedWidget(): JsWidget | null`  
  获取已加载的实际控件实例，若未加载完成则返回 null。

- `isLoading(): boolean`  
  判断是否正在加载远程资源。

## 主要事件

- `loadstart`  
  开始加载远程组件时触发。

- `loadsuccess`  
  成功加载并渲染完成远程组件后触发。

- `loaderror`  
  加载失败时触发，携带错误信息。

## 源码例子

```json
{
  "id": "dynamic_content",
  "widgettype": "UrlWidget",              // 特殊控件类型，用于远程加载
  "options": {
    "url": "/api/widgets/profile.ui",     // 远程 .ui 文件地址
    "method": "GET",                      // HTTP 方法
    "params": {                           // 请求参数
      "userid": "{% userid %}",          // 支持模板变量注入
      "lang": "zh-CN"
    }
  },
  "binds": [
    {
      "actiontype": "urlwidget",
      "wid": "dynamic_content",
      "event": "click",                  // 示例：通过点击重新加载
      "target": "dynamic_content",
      "mode": "replace",
      "options": {
        "url": "/api/widgets/profile.ui",
        "method": "POST",
        "params": {
          "userid": "12345",
          "refresh": true
        }
      }
    },
    {
      "actiontype": "registerfunction",
      "wid": "dynamic_content",
      "event": "loadsuccess",
      "target": "_t_",                   // 全局上下文
      "rfname": "trackPageView",         // 调用注册过的全局函数
      "params": {
        "page": "UserProfile"
      }
    },
    {
      "actiontype": "conform",           // 错误处理示例
      "wid": "dynamic_content",
      "event": "loaderror",
      "target": "Popup",
      "rtdata": {
        "title": "加载失败",
        "content": "无法获取用户资料，请稍后再试。"
      },
      "conform": {
        "title": "网络错误",
        "content": "加载用户数据失败，是否重试？",
        "buttons": ["Cancel", "Retry"],
        "onConfirm": {
          "actiontype": "method",
          "target": "dynamic_content",
          "method": "reload"
        }
      }
    }
  ]
}
```

> 注：`UrlWidget` 是实现模块化开发的核心控件，支持按需加载 `.ui` 文件，提升首屏性能和代码分割能力。

---

# Label

标签控件，用于展示静态文本信息。类型：普通控件，继承自 `JsWidget`

## 主要方法

- `setValue(text: string)`  
  设置标签显示的文本内容。

- `getValue(): string`  
  获取当前显示的文本。

- `setHtml(html: string)`  
  设置 HTML 内容（注意 XSS 防护）。

## 主要事件

- `click`  
  用户点击标签时触发（可用于可交互标签）。

- `dblclick`  
  双击事件。

## 源码例子

```json
{
  "id": "lbl_instructions",
  "widgettype": "Label",
  "options": {
    "value": "请填写以下必填字段 *",       // 显示文本
    "cssClass": "instruction-text",        // 自定义CSS类
    "align": "left",                      // 对齐方式：left/center/right
    "html": false                         // 是否解析HTML
  },
  "binds": [
    {
      "actiontype": "event",
      "wid": "lbl_instructions",
      "event": "click",
      "target": "help_dialog",
      "dispatch_event": "open"
    }
  ]
}
```

--- 

> **说明**：以上控件文档遵循 Bricks.js 框架的 JSON 结构规范，适用于 `.ui` 文件编写与可视化工具生成。每个控件均以 `id` 唯一标识，并通过 `binds` 实现事件驱动逻辑，支持动态加载、脚本执行、方法调用等多种交互模式。