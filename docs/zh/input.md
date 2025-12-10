# UiType

**控件功能**：所有输入控件的基础类，提供通用的值获取、设置、重置、禁用等方法。  
**类型**：普通控件  
**父类控件**：`bricks.Layout`

## 初始化参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `name` | string | 控件名称（必填） |
| `value` / `defaultvalue` | any | 默认值 |
| `required` | boolean | 是否为必填项，默认 `false` |

## 主要事件

- `changed`：当控件值发生变化时触发，携带当前控件的键值对数据。
- `blur`：失去焦点时可能被派发（由子类实现）。

---

# UiHide

**控件功能**：隐藏字段控件，用于存储不显示的数据，DOM 显示为 `display: none`。  
**类型**：普通控件  
**父类控件**：`UiType`

## 初始化参数

继承自 `UiType`，无额外参数。

## 主要事件

- `changed`：值变化时触发。

---

# UiStr

**控件功能**：单行文本输入框，支持对齐、长度限制、占位符等功能。  
**类型**：普通控件  
**父类控件**：`UiType`

## 初始化参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `align` | string | 文本对齐方式：`left`, `center`, `right` |
| `length` | number | 最大字符数（maxlength） |
| `minlength` | number | 最小字符数（minlength） |
| `tip` | string | 提示信息（暂未使用） |
| `width` | string | 输入框宽度（如 `'200px'`） |
| `readonly` | string/boolean | 是否只读 |
| `required` | boolean | 是否必填 |
| `placeholder` | string | 占位符文本（支持国际化） |
| `css` | string | 自定义 CSS 类名 |
| `dynsize` | boolean | 是否动态调整字体大小，默认 `true` |
| `cfontsize` | number | 字体缩放比例 |

## 主要事件

- `focus`：获得焦点时触发。
- `blur`：失去焦点时触发。
- `changed`：输入内容改变且通过正则校验后触发。
- `keydown`：按下 Enter 键时会触发 blur 事件。

---

# UiPassword

**控件功能**：密码输入框，继承 `UiStr`，输入内容掩码显示。  
**类型**：普通控件  
**父类控件**：`UiStr`

## 初始化参数

同 `UiStr`。

## 主要事件

同 `UiStr`。

---

# UiInt

**控件功能**：整数输入框，自动限制只能输入数字，右对齐显示。  
**类型**：普通控件  
**父类控件**：`UiStr`

## 初始化参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `length` | number | 输入最大位数（可选） |

## 主要事件

- `changed`：输入合法整数时触发。
- 值始终以整数形式返回（调用 `parseInt`）。

---

# UiFloat

**控件功能**：浮点数输入框，支持小数位控制和步长设置。  
**类型**：普通控件  
**父类控件**：`UiInt`

## 初始化参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `dec_len` | number | 小数点后保留位数，默认为 2 |

## 主要事件

- `changed`：输入合法浮点数时触发。
- 返回值为 `parseFloat(this.value)`。

---

# UiTel

**控件功能**：电话号码输入框，使用 `<input type="tel">`，支持自定义 pattern。  
**类型**：普通控件  
**父类控件**：`UiStr`

## 初始化参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `pattern` | string | 正则表达式字符串，用于验证输入格式 |

## 主要事件

- `changed`：输入符合 pattern 时触发。

---

# UiEmail

**控件功能**：邮箱输入框，使用 `<input type="email">`，可附加自定义 pattern。  
**类型**：普通控件  
**父类控件**：`UiStr`

## 初始化参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `pattern` | string | 可选的自定义正则验证规则 |

## 主要事件

- `changed`：输入合法邮箱格式时触发。

---

# UiFile

**控件功能**：文件上传控件，支持拖拽上传、点击选择文件，可限定文件类型和多选。  
**类型**：容器控件  
**父类控件**：`VBox`

## 初始化参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `accept` | string | 接受的 MIME 类型前缀，如 `'image/'`, `'audio/'` |
| `multiple` | boolean | 是否允许多文件上传 |
| `width` | string | 容器宽度，默认 `'100%'` |

## 主要事件

- `dragenter` / `dragover` / `dragleave` / `drop`：拖拽相关事件处理高亮与文件接收。
- `changed`：选择或拖入文件后触发，传递文件对象或数组。
- `input`：原生 input change 事件监听。

---

# UiImage

**控件功能**：图像上传控件，支持拖拽、点击上传及拍照按钮，上传后预览图片。  
**类型**：容器控件  
**父类控件**：`UiFile`

## 初始化参数

同 `UiFile`，默认 `accept='image/'`。

## 主要事件

- `changed`：文件选择或拍照完成后触发，附带 File 对象。
- `shot`：拍照完成事件由 `SysCamera` 派发并被捕获。

---

# UiAudio

**控件功能**：音频上传控件，支持录音功能（麦克风），上传后可播放预览。  
**类型**：容器控件  
**父类控件**：`UiFile`

## 初始化参数

同 `UiFile`，默认 `accept='audio/'`。

## 主要事件

- `changed`：文件选择或录音完成后触发。
- `record_end`：录音结束事件由 `SysAudioRecorder` 派发。

---

# UiVideo

**控件功能**：视频上传控件，支持录制视频功能（摄像头），上传后可播放预览。  
**类型**：容器控件  
**父类控件**：`UiFile`

## 初始化参数

同 `UiFile`，默认 `accept='video/'`。

## 主要事件

- `changed`：文件选择或录制完成后触发。
- `record_end`：录像结束事件由 `SysVideoRecorder` 派发。

---

# UiCheck

**控件功能**：复选框控件（视觉上是图标切换），表示布尔状态（true/false）。  
**类型**：普通控件  
**父类控件**：`UiType`

## 初始化参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `value` | boolean | 初始是否选中 |

## 主要事件

- `changed`：状态切换时触发，携带 `{name: true/false}` 数据。
- `state_changed`：图标状态变更事件（来自 `MultipleStateIcon`）。

---

# UiCheckBox

**控件功能**：多选/单选组控件，基于数据生成多个 `UiCheck` + 文本标签。支持静态数据或远程加载。  
**类型**：容器控件  
**父类控件**：`UiType`

## 初始化参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `label` | string | 分组标题 |
| `data` | array | 静态选项列表 `[ {text:'', value:''} ]` |
| `dataurl` | string | 远程数据 URL |
| `method` | string | 请求方式，默认 GET |
| `params` | object | 请求参数 |
| `textField` | string | 显示字段名，默认 `'text'` |
| `valueField` | string | 值字段名，默认 `'value'` |
| `value` / `defaultValue` | string/array | 默认选中值（单选为字符串，多选为数组） |

> 注：若 `multicheck` 属性存在且为真，则为多选模式。

## 主要事件

- `changed`：任一选项状态变化时触发，携带 `{name: selectedValue(s)}`。
- 内部绑定 `UiCheck` 的 `changed` 事件进行值更新。

---

# UiDate

**控件功能**：日期选择器，使用原生 `<input type="date">`，支持最小/最大日期限制。  
**类型**：普通控件  
**父类控件**：`UiStr`

## 初始化参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `max_date` | string | 最大允许日期（格式 YYYY-MM-DD） |
| `min_date` | string | 最小允许日期（格式 YYYY-MM-DD） |

## 主要事件

- `changed`：日期更改时触发。
- `blur` / `focus`：焦点事件由父类支持。

---

# UiText

**控件功能**：多行文本域（textarea），支持 Tab 缩进、回车换行、动态字体适配。  
**类型**：普通控件  
**父类控件**：`UiType`

## 初始化参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `rows` | number | 行数，默认 5 |
| `cols` | number | 列数，默认 40 |
| `readonly` | boolean | 是否只读 |
| `required` | boolean | 是否必填 |
| `value` / `defaultvalue` | string | 默认文本内容 |

## 主要事件

- `input`：内容变化时更新内部值。
- `keydown`：拦截 Tab 和 Enter 键实现智能缩进与换行。
- `changed`：内容变化时手动派发。

---

# UiCode

**控件功能**：下拉选择框（`<select>`），用于代码表选择，支持本地数据或异步加载。  
**类型**：普通控件  
**父类控件**：`UiType`

## 初始化参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `data` | array | 静态选项数据 `[ {text:'', value:''} ]` |
| `dataurl` | string | 异步获取选项的接口地址 |
| `method` | string | 请求方法，默认 GET |
| `params` | object | 请求参数 |
| `textField` | string | 显示字段，默认 `'text'` |
| `valueField` | string | 值字段，默认 `'value'` |
| `nullable` | boolean | 是否允许空选项（开头添加空项） |
| `value` / `defaultvalue` | string | 默认选中值 |

## 主要事件

- `input`：选择项改变时触发，更新值并派发 `changed`。
- `changed`：值变更后向外通知。
- 支持外部事件驱动重新加载数据（如联动筛选）。

---

# UiSearch

**控件功能**：搜索选择控件，点击图标弹出窗口展示表格供选择，常用于关联查询。  
**类型**：容器控件  
**父类控件**：`HBox`

## 初始化参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `search_url` | string | 弹窗中加载的页面 URL |
| `valueField` | string | 返回值对应的字段名 |
| `textField` | string | 显示文本对应的字段名 |
| `popup_options` | object | 弹窗配置参数 |
| `value` | string | 初始值 |
| `text` | string | 初始显示文本 |

## 主要事件

- `click` on icon：打开搜索弹窗。
- `changed`：从弹窗选择记录后触发，带回选中的值。
- `dismiss`：关闭弹窗事件。

