# MyButton

该控件是一个普通按钮控件，用于触发用户交互行为。类型为**普通控件**，继承自 `JsWidget`。

## 主要方法

- `setValue(text)`：设置按钮显示文本。
- `getValue()`：获取按钮当前显示的文本。
- `enable()`：启用按钮（可点击）。
- `disable()`：禁用按钮（不可点击）。
- `show()`：显示按钮。
- `hide()`：隐藏按钮。

## 主要事件

- `'click'`：当用户点击按钮时触发。
- `'mousedown'`：鼠标按下时触发。
- `'mouseup'`：鼠标释放时触发。

## 源码例子

```json
{
  "id": "btn_submit",                    // 控件唯一标识
  "widgettype": "button",                // 控件类型：button 是 bricks 中已注册的控件
  "options": {
    "text": "提交",                      // 按钮初始显示文本
    "disabled": false,                   // 是否禁用，默认不禁用
    "cssclass": "primary-btn"            // 自定义 CSS 类名
  },
  "binds": [
    {
      "actiontype": "method",             // 动作类型：调用方法
      "wid": "btn_submit",               // 触发组件 ID
      "event": "click",                  // 监听点击事件
      "target": "msg_box",               // 目标组件 ID
      "method": "setValue",              // 调用目标的方法
      "params": {
        "value": "数据已提交！"           // 方法参数
      }
    },
    {
      "actiontype": "script",             // 执行脚本动作
      "wid": "btn_submit",
      "event": "click",
      "target": "btn_submit",
      "script": "async function({ widget }) { console.log('按钮被点击:', widget.getValue()); }",
      "params": {
        "widget": "{self}"                // 特殊变量，指向当前控件实例
      }
    },
    {
      "actiontype": "event",              // 派发自定义事件
      "wid": "btn_submit",
      "event": "click",
      "target": "form_panel",
      "dispatch_event": "form.submitted", // 向 form_panel 派发 form.submitted 事件
      "params": {
        "submitTime": "{now}",            // 当前时间戳占位符
        "source": "btn_submit"
      }
    }
  ]
}
```

---

# ContainerPanel

该控件是一个容器控件，用于容纳其他子控件并进行布局管理。类型为**容器控件**，继承自 `JsWidget`。

## 主要方法

- `addSubwidget(widgetJson)`：动态添加一个子控件。
- `removeSubwidget(widgetId)`：根据 ID 移除子控件。
- `getSubwidget(id)`：获取指定 ID 的子控件实例。
- `show()`：显示整个容器。
- `hide()`：隐藏整个容器。
- `setLayout(layoutType)`：设置布局方式（如 'vertical', 'horizontal'）。

## 主要事件

- `'init'`：容器初始化完成后触发。
- `'widgetadded'`：当有新控件加入时触发。
- `'widgetremoved'`：当控件被移除时触发。

## 源码例子

```json
{
  "id": "form_panel",                     // 容器控件 ID
  "widgettype": "panel",                  // panel 是 bricks 中支持的容器控件
  "options": {
    "title": "用户信息表单",               // 面板标题
    "collapsible": true,                  // 可折叠
    "layout": "vertical",                 // 垂直布局排列子控件
    "cssstyle": {
      "padding": "15px",
      "border": "1px solid #ccc",
      "border-radius": "8px"
    }
  },
  "subwidgets": [                         // 子控件数组
    {
      "id": "input_name",
      "widgettype": "textfield",
      "options": {
        "label": "姓名",
        "placeholder": "请输入您的姓名",
        "required": true
      }
    },
    {
      "id": "input_email",
      "widgettype": "textfield",
      "options": {
        "label": "邮箱",
        "type": "email",
        "placeholder": "example@domain.com"
      }
    },
    {
      "id": "btn_save",
      "widgettype": "button",
      "options": {
        "text": "保存",
        "cssclass": "success"
      },
      "binds": [
        {
          "actiontype": "urlwidget",       // 加载远程组件作为弹窗
          "wid": "btn_save",
          "event": "click",
          "target": "Popup",               // 特殊目标：打开弹窗
          "mode": "append",
          "options": {
            "url": "/api/widgets/confirm-dialog.ui",  // 远程 UI 文件地址
            "method": "GET",
            "params": {
              "action": "save_user"
            }
          }
        }
      ]
    }
  ],
  "binds": [
    {
      "actiontype": "event",
      "wid": "form_panel",
      "event": "init",
      "target": "logger",
      "dispatch_event": "log.info",
      "params": {
        "message": "表单面板初始化完成",
        "component": "form_panel"
      }
    }
  ]
}
```

---

# DynamicLoader

该控件用于从服务器动态加载其他控件，实现模块化界面加载。类型为**普通控件（实际为逻辑控制器）**，继承自 `JsWidget`，常配合 `urlwidget` 使用。

## 主要方法

- `load(url, params, mode)`：加载远程 UI 组件。
- `refresh()`：重新加载当前资源。
- `clearTarget(targetId)`：清空目标容器内容。

## 主要事件

- `'loadstart'`：开始加载远程组件时触发。
- `'loadsuccess'`：加载成功后触发。
- `'loaderror'`：加载失败时触发。

## 源码例子

```json
{
  "id": "loader_dashboard",
  "widgettype": "urlwidget",              // 特殊控件类型：用于加载远程组件
  "options": {
    "url": "/ui/modules/dashboard.ui",    // 要加载的远程 .ui 文件路径
    "method": "POST",                     // 使用 POST 请求
    "params": {
      "userRole": "{session.user.role}",  // 动态参数：来自会话的角色信息
      "tab": "overview"
    }
  },
  "binds": [
    {
      "actiontype": "bricks",             // 在本地创建一个新的 bricks 组件
      "wid": "loader_dashboard",
      "event": "loadsuccess",             // 加载成功后执行
      "target": "status_bar",
      "mode": "replace",
      "options": {
        "widgettype": "label",
        "id": "lbl_status",
        "options": {
          "text": "仪表盘加载成功",
          "cssclass": "status-success"
        }
      }
    },
    {
      "actiontype": "method",
      "wid": "loader_dashboard",
      "event": "loaderror",
      "target": "status_bar",
      "method": "setValue",
      "params": {
        "value": "加载失败，请重试"
      }
    },
    {
      "actiontype": "registerfunction",
      "wid": "loader_dashboard",
      "event": "loadsuccess",
      "target": "loader_dashboard",
      "rfname": "trackPageView",          // 调用全局注册函数
      "params": {
        "page": "dashboard",
        "time": "{now}"
      }
    }
  ]
}
```

> **注释说明**：
> - `{session.user.role}` 和 `{now}` 是 bricks 支持的运行时变量占位符。
> - `urlwidget` 类型控件不渲染自身 UI，而是将远程返回的 JSON 渲染到目标容器中。
> - `registerfunction` 需提前通过 `bricks.RF.register('trackPageView', fn)` 注册函数。