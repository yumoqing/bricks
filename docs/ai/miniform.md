# MiniForm

MiniForm 是一个轻量级表单控件，用于在水平布局中动态切换输入字段。它继承自 `HBox`，属于**容器控件**，允许用户从多个预定义字段中选择一个进行输入，并实时触发值变化事件。

---

## 主要方法

- **`build()`**  
  初始化控件结构，调用 `build_options` 和 `build_widgets` 构建下拉选择与输入区域。

- **`build_options()`**  
  创建一个下拉选择控件（基于 Input 的 code 类型），用于展示所有可选字段的标签列表，支持通过 `valueField` 和 `textField` 配置数据映射。

- **`build_widgets(name)`**  
  根据传入的字段名 `name` 动态创建对应的输入控件（如文本框、数字框等），并替换当前输入区域的内容。

- **`change_input(e)`**  
  下拉选择改变时的回调函数，获取新选中的字段名称并重新构建输入控件。

- **`input_handle(e)`**  
  输入内容发生变化时触发，合并当前输入值到参数对象中，并派发 `input` 事件通知外部。

- **`getValue()`**  
  获取当前完整的表单数据：包括预设的 `params` 和当前输入控件的值。

- **`show_options(e)`**  
  调试用方法，手动显示下拉选项（实际由 Input 控件自动管理）。

---

## 主要事件

- **`input`**  
  当输入值发生变更时触发，携带合并后的数据对象作为参数。可用于绑定上级组件的数据更新或验证逻辑。

- **`changed`（内部绑定）**  
  绑定在下拉选择控件上，当用户切换字段类型时触发，驱动界面重新渲染对应输入控件。

---

## 源码例子

```json
{
  "id": "mini_form_example",
  "widgettype": "MiniForm",
  "options": {
    "defaultname": "username",         // 默认选中的字段名
    "label_width": "80px",             // 字段标签宽度（若适用）
    "input_width": "200px",            // 输入框宽度
    "params": {                        // 额外附加的静态参数
      "formId": "user_create"
    },
    "fields": [                        // 可选字段配置数组
      {
        "name": "username",
        "label": "用户名",
        "icon": "user",
        "uitype": "text",              // 使用文本输入框
        "uiparams": {
          "placeholder": "请输入用户名"
        }
      },
      {
        "name": "age",
        "label": "年龄",
        "icon": "number",
        "uitype": "number",            // 使用数字输入框
        "uiparams": {
          "min": 1,
          "max": 120
        }
      },
      {
        "name": "email",
        "label": "邮箱",
        "icon": "envelope",
        "uitype": "text",
        "uiparams": {
          "type": "email",
          "placeholder": "请输入邮箱地址"
        }
      }
    ]
  },
  "binds": [
    {
      "actiontype": "event",
      "wid": "mini_form_example",
      "event": "input",
      "target": "data_collector",
      "dispatch_event": "form_value_updated",
      "params": {
        "source": "mini_form"
      },
      "rtdata": {
        "timestamp": "${now}"
      }
    },
    {
      "actiontype": "script",
      "wid": "mini_form_example",
      "event": "input",
      "target": "",
      "script": "console.log('当前表单值:', data);",
      "params": {
        "data": "${@wid.getValue()}"
      }
    }
  ],
  "subwidgets": []
}
```

> ✅ **注释说明：**
> - `fields` 中每个字段定义了唯一 `name`、显示 `label`、图标 `icon` 以及具体的 UI 类型和参数。
> - `defaultname` 设置默认激活的字段；若未设置，则使用第一个字段。
> - `binds` 示例展示了如何监听 `input` 事件：
>   - 第一条：将数据转发给 ID 为 `data_collector` 的控件，触发自定义事件 `form_value_updated`，并附带时间戳。
>   - 第二条：执行脚本输出当前值到控制台，`${@wid.getValue()}` 表示调用该控件的 `getValue()` 方法获取运行时数据。
> - `subwidgets` 为空，因为 MiniForm 自行管理子控件（通过 add_widget），不依赖 JSON 子节点描述。