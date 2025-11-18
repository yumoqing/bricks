# Bricks控件示例

## 控件名称
**Button**

按钮控件，用于触发用户交互事件。它是一个普通控件，继承自`JsWidget`。

### 主要方法
* `setText(text: string)`: 设置按钮上显示的文本。
* `getText()`: 获取按钮当前显示的文本。
* `setEnabled(enabled: boolean)`: 启用或禁用按钮。
* `isEnabled()`: 检查按钮是否处于启用状态。
* `click()`: 模拟点击按钮，触发其绑定的事件。

### 主要事件
* `click`: 当用户点击按钮时触发。

### 源码例子
```json
{
  "id": "submitBtn", // 按钮控件的唯一ID
  "widgettype": "button", // 控件类型为"button"
  "options": {
    "text": "提交", // 初始化时按钮上显示的文本
    "enabled": true, // 按钮初始为启用状态
    "width": 100,
    "height": 30
  },
  "binds": [
    {
      "actiontype": "method", // 绑定一个方法调用动作
      "wid": "submitBtn", // 触发事件的组件ID是此按钮自身
      "event": "click", // 监听'click'事件
      "target": "formPanel", // 执行目标是ID为'formPanel'的表单控件
      "method": "validateAndSubmit", // 调用的方法名
      "params": {} // 调用该方法时传递的参数（此处为空）
    },
    {
      "actiontype": "script", // 绑定一个脚本执行动作
      "wid": "submitBtn",
      "event": "click",
      "script": "console.log('提交按钮被点击了'); return true;", // 执行的内联JS代码
      "params": {}
    }
  ]
}
```

---

# Bricks控件示例

## 控件名称
**Container**

容器控件，用于容纳和布局其他子控件。它是一个容器控件，继承自`JsWidget`。

### 主要方法
* `addSubwidget(widgetJson: object)`: 动态向容器中添加一个新的子控件。
* `removeSubwidget(widgetId: string)`: 根据ID从容器中移除一个子控件。
* `getSubwidgets()`: 获取容器内所有子控件的列表。
* `setLayout(layoutType: string)`: 设置容器的布局方式，例如"vertical"或"horizontal"。

### 主要事件
* `onSubwidgetAdded`: 当有新的子控件被添加到容器时触发。
* `onSubwidgetRemoved`: 当有子控件从容器中被移除时触发。

### 源码例子
```json
{
  "id": "mainPanel", // 容器控件的唯一ID
  "widgettype": "container", // 控件类型为"container"
  "options": {
    "layout": "vertical", // 布局方式为垂直排列
    "width": 400,
    "height": 300,
    "border": "1px solid #ccc"
  },
  "subwidgets": [ // 包含两个子控件
    {
      "id": "titleLabel",
      "widgettype": "label",
      "options": {
        "text": "用户信息",
        "fontSize": 16,
        "fontWeight": "bold"
      }
    },
    {
      "id": "inputForm",
      "widgettype": "container",
      "options": {
        "layout": "horizontal"
      },
      "subwidgets": [ // 子容器包含更多子控件
        {
          "id": "nameLabel",
          "widgettype": "label",
          "options": { "text": "姓名:" }
        },
        {
          "id": "nameInput",
          "widgettype": "textfield",
          "options": { "placeholder": "请输入姓名" }
        }
      ],
      "binds": [
        {
          "actiontype": "urlwidget", // 绑定一个远程加载动作
          "wid": "nameInput",
          "event": "blur", // 当输入框失去焦点时触发
          "target": "validationPopup", // 将加载的控件渲染到ID为'validationPopup'的弹窗中
          "mode": "replace", // 替换模式
          "options": {
            "url": "/api/validateName", // 远程API地址
            "method": "POST", // HTTP方法
            "params": { // 请求参数
              "name": "$$getValue(nameInput)" // 使用datamethod获取nameInput控件的值
            }
          }
        }
      ]
    }
  ],
  "binds": [
    {
      "actiontype": "registerfunction", // 绑定一个已注册的全局函数
      "wid": "mainPanel",
      "event": "onSubwidgetAdded",
      "rfname": "logWidgetAddition", // 全局函数名称
      "params": {
        "panelId": "mainPanel" // 传递给函数的参数
      }
    }
  ]
}
```