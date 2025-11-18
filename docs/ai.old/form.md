# InlineForm

`InlineForm` 是一个轻量级的表单控件，用于在界面中嵌入行内表单输入区域。它继承自 `FormBase`，属于**普通控件**（虽然其内部结构可包含多个子控件，但本身不作为容器管理布局），主要用于快速构建无需独立弹窗或页面的表单操作场景。

---

## 主要方法

| 方法名 | 说明 |
|-------|------|
| `build_fields(form, parent, fields)` | 通过 `FieldGroup` 构建字段集合，根据字段类型生成对应的输入控件并添加到父容器中。 |
| `save_origin_data()` | 保存当前所有字段的初始值，用于后续比对是否发生更改（配合 `submit_changed` 使用）。 |
| `get_formdata()` | 获取表单数据，支持 `FormData` 格式输出，并可选择仅提交变更字段。若验证失败则返回 `null`。 |
| `validation()` | 验证表单必填项，触发提交事件并可向服务器发送请求（如果配置了 `submit_url`）。过程中会显示“正在提交”动画。 |
| `reset_data()` | 将所有输入控件重置为其初始值。 |
| `cancel()` | 派发 `cancel` 自定义事件，通常用于关闭表单或取消操作流程。 |

---

## 主要事件

| 事件名 | 触发时机 | 参数说明 |
|--------|---------|----------|
| `submit` | 用户点击“提交”按钮后，通过验证时触发 | 包含表单数据的对象（如 `{ name: "value" }`） |
| `submited` | 提交完成后，从服务器收到响应时触发 | `Response` 对象（来自 `fetch` 的响应） |
| `cancel` | 点击“取消”按钮时触发 | 无参数 |
| `command` | 工具栏按钮点击时由 `IconTextBar` 派发，被 `command_handle` 处理 | `{ name: 'submit' \| 'reset' \| 'cancel' }` |

---

## 源码例子

```json
{
  "id": "user_profile_inline",
  "widgettype": "InlineForm",
  "options": {
    // 表单整体宽度和高度自适应
    "width": "100%",
    "height": "auto",

    // 定义表单项列表
    "fields": [
      {
        "name": "username",
        "label": "用户名",
        "uitype": "textinput",
        "required": true,
        "placeholder": "请输入用户名"
      },
      {
        "name": "email",
        "label": "邮箱地址",
        "uitype": "email",
        "required": true,
        "placeholder": "example@domain.com"
      },
      {
        "name": "age",
        "label": "年龄",
        "uitype": "number",
        "min": 1,
        "max": 120
      },
      {
        "name": "gender",
        "label": "性别",
        "uitype": "select",
        "options": [
          { "label": "男", "value": "male" },
          { "label": "女", "value": "female" }
        ]
      }
    ],

    // 设置为 true 时只提交修改过的字段（默认 false）
    "submit_changed": false,

    // 提交目标 URL
    "submit_url": "/api/update_profile",

    // 使用 PUT 方法更新数据
    "method": "PUT"
  },

  // 绑定事件处理逻辑
  "binds": [
    {
      "actiontype": "bricks",
      "wid": "user_profile_inline",
      "event": "submit",
      "target": "Popup",
      "mode": "append",
      "options": {
        "widgettype": "Running",
        "message": "正在保存..."
      },
      "rtdata": {
        "form_id": "user_profile_inline"
      },
      "conform": null
    },
    {
      "actiontype": "urlwidget",
      "wid": "user_profile_inline",
      "event": "submited",
      "target": "content_area",
      "mode": "replace",
      "options": {
        "url": "/views/profile_summary.ui",
        "params": {},
        "method": "GET"
      },
      "rtdata": {
        "refresh": true
      }
    },
    {
      "actiontype": "event",
      "wid": "user_profile_inline",
      "event": "cancel",
      "target": "ModalDialog",
      "dispatch_event": "close"
    },
    {
      "actiontype": "script",
      "wid": "user_profile_inline",
      "event": "submit",
      "target": "",
      "script": "console.log('表单提交数据:', params.data);",
      "params": {
        "data": "{getDataFromWidget('user_profile_inline')}"
      }
    }
  ]
}
```

> **注释说明：**
>
> - `InlineForm` 不创建新页面或弹窗，适合嵌入现有布局。
> - `fields` 中每个字段使用 `uitype` 定义输入类型，框架自动调用 `Input.factory()` 创建对应控件。
> - `binds` 实现了完整的交互闭环：
>   - 提交前显示加载提示（`Running` 动画）；
>   - 提交成功后刷新内容区（通过 `urlwidget` 加载新视图）；
>   - 取消时通知模态框关闭；
>   - 同时记录日志脚本用于调试。
> - 支持国际化字段（`i18n: true` 在底层 Text 控件中已启用）。

--- 

✅ **适用场景：**  
- 内联编辑用户信息  
- 快速填写短表单（如搜索、筛选条件）  
- 在卡片或列表项中直接编辑数据  

🔧 **注意事项：**  
- 若涉及文件上传（`file`, `video`, `audio` 类型），需确保 `need_formdata = true`，框架将自动使用 `FormData` 提交。  
- 所有字段必须有唯一 `name`，否则无法正确收集数据。