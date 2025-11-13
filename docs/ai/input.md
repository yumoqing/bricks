# UiStr

用于创建一个单行文本输入控件，用户可以输入或编辑字符串内容。该控件继承自 `UiType`，属于**普通控件**。

## 主要方法

- `getValue()`：返回包含当前输入值的对象，格式为 `{name: value}`。
- `setValue(v)`：设置输入框的值。
- `reset()`：重置输入框为初始值（`value` 或 `defaultValue`）。
- `focus()`：使输入框获得焦点。
- `set_disabled(f)`：启用/禁用输入框。
- `set_readonly(f)`：设置输入框是否只读。
- `set_required(f)`：设置是否为必填项。
- `resultValue()`：获取实际的字符串值。
- `set_formdata(formdata)`：将当前值添加到 `FormData` 对象中，用于表单提交。

## 主要事件

- `changed`：当输入内容发生变化时触发，携带数据为 `{name: value}`。
- `blur`：当输入框失去焦点时触发。
- `focus`：当输入框获得焦点时触发。
- `keydown`：当在输入框中按下键盘键时触发，若按 Enter 键会派发 `blur` 事件。

## 源码例子

```json
{
  "id": "username_input",
  "widgettype": "UiStr",
  "options": {
    "name": "username",                    // 表单字段名
    "value": "",                           // 初始值
    "defaultValue": "请输入用户名",         // 默认提示性值
    "align": "left",                       // 文本对齐方式：left, center, right
    "length": 50,                          // 最大字符数
    "minlength": 2,                        // 最小字符数
    "placeholder": "请输入用户名",          // 占位符文本（支持国际化）
    "width": "300px",                      // 控件宽度
    "readonly": false,                     // 是否只读
    "required": true,                      // 是否必填
    "css": "custom-input-class"            // 自定义CSS类名
  },
  "binds": [
    {
      "actiontype": "method",
      "wid": "username_input",
      "event": "changed",
      "target": "submit_button",
      "method": "set_disabled",
      "params": {
        "f": false
      },
      "conform": null
    },
    {
      "actiontype": "script",
      "wid": "username_input",
      "event": "blur",
      "target": "logger",
      "script": "console.log('用户输入了:', params);",
      "rtdata": {
        "params": "=getValue(username_input)"
      }
    }
  ]
}
```

> **注释说明：**
> - 此控件是一个基础文本输入框，常用于登录、注册等表单场景。
> - `binds` 中第一个绑定表示：当输入内容变化时，启用“提交按钮”。
> - 第二个绑定表示：当失去焦点时，通过脚本打印当前输入值。
> - `=getValue(widgetId)` 是 Bricks 支持的运行时数据表达式语法，用于动态获取其他控件的值。


---

# UiPassword

用于创建密码输入框，隐藏用户输入内容。该控件继承自 `UiStr`，属于**普通控件**。

## 主要方法

- 继承自 `UiStr` 的所有方法（如 `getValue`, `setValue`, `reset` 等）。
- `resultValue()`：返回明文密码字符串（注意安全处理）。

## 主要事件

- `changed`：输入内容变更时触发。
- `blur`：失去焦点时触发。
- `focus`：获得焦点时触发。

## 源码例子

```json
{
  "id": "password_input",
  "widgettype": "UiPassword",
  "options": {
    "name": "password",
    "value": "",
    "placeholder": "请输入密码",
    "required": true,
    "length": 20,
    "width": "100%"
  },
  "binds": [
    {
      "actiontype": "event",
      "wid": "password_input",
      "event": "changed",
      "target": "strength_checker",
      "dispatch_event": "check_strength",
      "rtdata": {
        "password": "=getValue(password_input)"
      }
    }
  ]
}
```

> **注释说明：**
> - 使用 `UiPassword` 可确保输入内容以掩码形式显示。
> - 绑定事件将密码值传递给“强度检测器”控件进行实时校验。
> - 安全建议：避免在日志中直接输出密码明文。

---

# UiInt

用于输入整数的控件，基于 `UiStr` 扩展，自动限制输入为数字。该控件继承自 `UiStr`，属于**普通控件**。

## 主要方法

- `resultValue()`：返回整数类型值（使用 `parseInt` 转换）。
- 其他方法均继承自 `UiStr`。

## 主要事件

- `changed`：数值改变时触发。
- `blur` / `focus`：焦点相关事件。

## 源码例子

```json
{
  "id": "age_input",
  "widgettype": "UiInt",
  "options": {
    "name": "age",
    "value": 18,
    "placeholder": "请输入年龄",
    "minlength": 1,
    "length": 3,
    "width": "100px"
  },
  "binds": [
    {
      "actiontype": "method",
      "wid": "age_input",
      "event": "changed",
      "target": "user_form",
      "method": "validateField",
      "params": {
        "field": "age"
      }
    }
  ]
}
```

> **注释说明：**
> - 输入仅允许数字字符。
> - `resultValue()` 返回 `Number` 类型，便于后续逻辑判断。
> - 常用于需要整数输入的表单字段（如年龄、数量等）。

---

# UiFloat

用于输入浮点数的控件，继承自 `UiInt`，支持小数输入和精度控制。该控件属于**普通控件**。

## 主要方法

- `resultValue()`：返回浮点数（使用 `parseFloat` 转换）。
- `setValue(v)`：设置值并更新 DOM 显示。

## 主要事件

- `changed`：浮点数更改后触发。
- `blur` / `focus`：同上。

## 源码例子

```json
{
  "id": "price_input",
  "widgettype": "UiFloat",
  "options": {
    "name": "price",
    "value": 0.00,
    "dec_len": 2,                         // 小数位数，默认为2
    "placeholder": "请输入价格",
    "width": "150px"
  },
  "binds": [
    {
      "actiontype": "bricks",
      "wid": "price_input",
      "event": "changed",
      "target": "total_calculator",
      "mode": "append",
      "options": {
        "widgettype": "Text",
        "options": {
          "text": "=getValue(price_input) * 1.1"
        }
      }
    }
  ]
}
```

> **注释说明：**
> - `dec_len` 控制小数点后位数，并影响 HTML `step` 属性。
> - 支持数学表达式绑定，例如计算含税总价。
> - 推荐与服务端双重验证结合使用，防止非法输入。

---

# UiDate

日期选择控件，提供原生日期选择器界面。继承自 `UiStr`，属于**普通控件**。

## 主要方法

- `opts_setup()`：初始化 `<input type="date">` 并设置最大最小日期。
- `resultValue()`：返回字符串格式的日期（如 `"2025-04-05"`），空值返回 `null`。

## 主要事件

- `changed`：日期变更时触发。
- `blur` / `focus`：焦点事件。

## 源码例子

```json
{
  "id": "birthday_input",
  "widgettype": "UiDate",
  "options": {
    "name": "birthday",
    "value": "1990-01-01",
    "min_date": "1900-01-01",
    "max_date": "2025-12-31",
    "required": true
  },
  "binds": [
    {
      "actiontype": "script",
      "wid": "birthday_input",
      "event": "changed",
      "target": "age_display",
      "script": "const birth = new Date(params.birthday); const age = new Date().getFullYear() - birth.getFullYear(); bricks.getWidget('age_label').setValue('年龄: ' + age + '岁');",
      "rtdata": {
        "params": "=getValue(birthday_input)"
      }
    }
  ]
}
```

> **注释说明：**
> - 浏览器原生日期选择器兼容性良好。
> - `min_date` 和 `max_date` 可限制选择范围。
> - 示例中通过脚本动态计算并显示年龄。

---

# UiCheck

复选框控件（单个），用于布尔状态切换（true/false）。该控件继承自 `UiType`，是**普通控件**。

## 主要方法

- `setValue(v)`：设置为选中（true）或未选中（false）。
- `resultValue()`：返回布尔值。
- `set_value_from_input(e)`：内部方法，响应图标状态变化。

## 主要事件

- `changed`：状态切换时触发，携带 `{name: true|false}` 数据。

## 源码例子

```json
{
  "id": "agree_check",
  "widgettype": "UiCheck",
  "options": {
    "name": "agree",
    "value": false
  },
  "binds": [
    {
      "actiontype": "method",
      "wid": "agree_check",
      "event": "changed",
      "target": "submit_button",
      "method": "set_disabled",
      "params": {
        "f": "=!getValue(agree_check).agree"
      }
    }
  ]
}
```

> **注释说明：**
> - 使用 SVG 图标实现美观的勾选效果。
> - 绑定逻辑：只有用户勾选“同意”后，“提交”按钮才可用。
> - `= !getValue(...)` 为 Bricks 支持的表达式语法。

---

# UiCheckBox

多选/单选框组控件，支持从本地数据或远程 URL 加载选项列表。继承自 `UiType`，属于**容器控件**（可包含多个子控件）。

## 主要方法

- `build_checkboxs()`：根据数据构建多个 `UiCheck` 子控件。
- `load_data_onfly()`：异步加载远程数据。
- `set_value_from_input(event)`：处理任一选项变化，更新 `this.value` 数组。
- `setValue(v)`：设置已选值（支持数组或单值）。

## 主要事件

- `changed`：任一选项变化时触发，返回 `{name: [values]}` 或 `{name: value}`。

## 源码例子

```json
{
  "id": "hobby_checkbox",
  "widgettype": "UiCheckBox",
  "options": {
    "name": "hobbies",
    "label": "兴趣爱好",
    "textField": "text",
    "valueField": "id",
    "data": [
      { "id": "reading", "text": "阅读" },
      { "id": "sports", "text": "运动" },
      { "id": "music", "text": "音乐" }
    ],
    "multicheck": true
  },
  "binds": [
    {
      "actiontype": "event",
      "wid": "hobby_checkbox",
      "event": "changed",
      "target": "preference_analyzer",
      "dispatch_event": "update_preferences",
      "rtdata": {
        "hobbies": "=getValue(hobby_checkbox)"
      }
    }
  ]
}
```

> **注释说明：**
> - 若 `multicheck: true`，则允许多选；否则为单选。
> - 支持静态 `data` 或动态 `dataurl` 加载选项。
> - 常用于表单中的多项选择题或偏好设置。

---

# UiCode

下拉选择控件（`<select>`），用于从预定义选项中选择一个值。继承自 `UiType`，属于**普通控件**。

## 主要方法

- `build_options(data)`：根据数据重建 `<option>` 列表。
- `load_data(params)`：从远程 URL 异步加载数据。
- `get_data(event)`：响应外部事件重新加载数据。
- `setValue(v)`：设置选中项的值。
- `resultValue()`：返回当前选中的值。

## 主要事件

- `changed`：选项变更时触发。

## 源码例子

```json
{
  "id": "country_select",
  "widgettype": "UiCode",
  "options": {
    "name": "country",
    "textField": "name_zh",
    "valueField": "code",
    "nullable": true,
    "dataurl": "/api/countries",
    "method": "GET",
    "params": {}
  },
  "binds": [
    {
      "actiontype": "urlwidget",
      "wid": "country_select",
      "event": "changed",
      "target": "province_container",
      "mode": "replace",
      "options": {
        "url": "/ui/province_list.ui",
        "params": {
          "country_code": "=getValue(country_select).country"
        }
      }
    }
  ]
}
```

> **注释说明：**
> - 支持从 `/api/countries` 动态加载国家列表。
> - `nullable: true` 表示允许空选项（第一项为空）。
> - 更改国家后，通过 `urlwidget` 加载对应省份 UI 片段，实现联动。

---

# UiText

多行文本输入控件（`<textarea>`），适用于长文本输入。继承自 `UiType`，属于**普通控件**。

## 主要方法

- `handle_enter()`：拦截回车键，插入换行符。
- `handle_tab_indent(erase)`：支持 Tab 缩进与 Shift+Tab 反缩进（每次4空格）。
- `key_handle(e)`：键盘事件处理器。
- `set_editor_focus(editor, pos)`：异步聚焦并定位光标。

## 主要事件

- `changed`：内容变更时触发。
- `keydown`：按键事件，支持自定义行为。

## 源码例子

```json
{
  "id": "note_textarea",
  "widgettype": "UiText",
  "options": {
    "name": "note",
    "value": "",
    "rows": 8,
    "cols": 60,
    "placeholder": "请输入备注信息...",
    "width": "100%",
    "height": "200px"
  },
  "binds": [
    {
      "actiontype": "script",
      "wid": "note_textarea",
      "event": "input",
      "target": "char_counter",
      "script": "bricks.getWidget('char_count_label').setValue('已输入 ' + params.note.length + ' 字');",
      "rtdata": {
        "params": "=getValue(note_textarea)"
      }
    }
  ]
}
```

> **注释说明：**
> - 支持 Tab 缩进功能，适合代码或结构化文本输入。
> - 实时统计字数并更新显示。
> - 高度可配置，适合各种富文本输入场景。

---

# UiSearch

搜索选择控件，点击图标弹出远程窗口选择数据。继承自 `HBox`，属于**容器控件**。

## 主要方法

- `open_search_window(event)`：打开弹窗并加载远程表格。
- `set_data(event)`：接收选中行数据并填充。
- `resultValue()`：返回选中的 `valueField` 值。

## 主要事件

- `changed`：选择完成后触发。

## 源码例子

```json
{
  "id": "customer_search",
  "widgettype": "UiSearch",
  "options": {
    "name": "customer_id",
    "text": "请选择客户",
    "search_url": "/ui/customer_picker.ui",
    "valueField": "id",
    "textField": "name",
    "search_event": "row_selected",
    "popup_options": {
      "title": "选择客户",
      "width": "80%",
      "height": "70%"
    }
  },
  "binds": [
    {
      "actiontype": "event",
      "wid": "customer_search",
      "event": "changed",
      "target": "order_form",
      "dispatch_event": "customer_selected",
      "rtdata": {
        "customer_id": "=getValue(customer_search)"
      }
    }
  ]
}
```

> **注释说明：**
> - 用户点击放大镜图标，弹出 `/ui/customer_picker.ui` 页面。
> - 表格组件监听 `row_selected` 事件并将结果传回。
> - 实现“所见即所得”的复杂数据选择模式，广泛用于 ERP、CRM 系统。

--- 

# UiFile

文件上传控件，支持拖拽上传和点击选择。继承自 `VBox`，属于**容器控件**。

## 主要方法

- `handleFileSelect(event)`：处理手动选择文件。
- `dropHandle(event)`：处理拖放文件。
- `set_input_file(files)`：程序化设置文件输入。
- `resultValue()`：返回 File 对象或 FileList。

## 主要事件

- `changed`：文件选择或拖入后触发。

## 源码例子

```json
{
  "id": "attachment_upload",
  "widgettype": "UiFile",
  "options": {
    "name": "file",
    "accept": "application/pdf",
    "multiple": false,
    "width": "100%"
  },
  "binds": [
    {
      "actiontype": "method",
      "wid": "attachment_upload",
      "event": "changed",
      "target": "upload_service",
      "method": "startUpload",
      "params": {
        "file": "=resultValue(attachment_upload)"
      }
    }
  ]
}
```

> **注释说明：**
> - `accept` 限制只能上传 PDF 文件。
> - 支持拖拽上传，提升用户体验。
> - 绑定调用上传服务开始传输文件。

---

# UiImage

图像上传控件，扩展自 `UiFile`，增加拍照按钮和预览功能。属于**容器控件**。

## 主要方法

- `take_photo()`：调起摄像头拍摄。
- `accept_photo(camera, event)`：接收拍摄图片并设置值。
- `show_image()` / `_show_image()`：显示图片预览（支持 File 或 URL）。

## 主要事件

- `changed`：图片选择或拍摄完成后触发。

## 源码例子

```json
{
  "id": "avatar_uploader",
  "widgettype": "UiImage",
  "options": {
    "name": "avatar",
    "width": "300px",
    "height": "auto"
  },
  "binds": [
    {
      "actiontype": "bricks",
      "wid": "avatar_uploader",
      "event": "changed",
      "target": "profile_preview",
      "mode": "replace",
      "options": {
        "widgettype": "Image",
        "options": {
          "url": "=resultValue(avatar_uploader)",
          "width": "100px",
          "height": "100px",
          "style": "border-radius: 50%;"
        }
      }
    }
  ]
}
```

> **注释说明：**
> - 用户可通过上传或拍照方式设置头像。
> - 实时预览上传的图像。
> - 结合 `bricks` action 实现动态图像替换。

---

# UiAudio

音频上传与录制控件，支持麦克风录音。继承自 `UiFile`，属于**容器控件**。

## 主要方法

- `open_recorder()`：打开音频录制器。
- `accept_audio(recorder, event)`：接收录音文件。
- `show_audio()` / `_show_audio()`：播放音频预览。

## 主要事件

- `changed`：音频文件上传或录制完成时触发。
- `record_end`：录音结束事件（来自 `SysAudioRecorder`）。

## 源码例子

```json
{
  "id": "voice_note",
  "widgettype": "UiAudio",
  "options": {
    "name": "audio_clip",
    "width": "100%"
  },
  "binds": [
    {
      "actiontype": "event",
      "wid": "voice_note",
      "event": "changed",
      "target": "transcription_engine",
      "dispatch_event": "start_transcribe",
      "rtdata": {
        "audio_file": "=resultValue(voice_note)"
      }
    }
  ]
}
```

> **注释说明：**
> - 提供“上传”和“录音”两种方式获取音频。
> - 录音完成后自动插入预览播放器。
> - 可与语音识别服务集成，实现语音转文字。

---

# UiVideo

视频上传与录制控件，支持摄像头录制视频。继承自 `UiFile`，属于**容器控件**。

## 主要方法

- `open_recorder()`：启动视频录制窗口。
- `accept_video()`：接收录制完成的视频文件。
- `show_video()` / `_show_video()`：显示视频预览。

## 主要事件

- `changed`：视频文件上传或录制完成时触发。

## 源码例子

```json
{
  "id": "video_introduction",
  "widgettype": "UiVideo",
  "options": {
    "name": "intro_video",
    "width": "100%"
  },
  "binds": [
    {
      "actiontype": "method",
      "wid": "video_introduction",
      "event": "changed",
      "target": "video_thumbnail_generator",
      "method": "extractThumbnail",
      "params": {
        "video": "=resultValue(video_introduction)"
      }
    }
  ]
}
```

> **注释说明：**
> - 支持上传 `.mp4` 等常见格式视频。
> - 内建录制功能，方便移动端使用。
> - 可配合后台服务提取封面图或进行转码。

--- 

> ✅ 所有控件均遵循 Bricks.js 的 JSON 规范，支持模块化开发、事件驱动、动态加载与国际化。  
> 💡 推荐结合 `.ui` 文件组织界面，利用 `urlwidget` 实现懒加载与微前端架构。