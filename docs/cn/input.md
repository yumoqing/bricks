# Bricks UI 组件技术文档

> **版本**: 1.0  
> **作者**: Bricks Framework Team  
> **描述**: `bricks.UiType` 及其子类构成了一套用于构建表单输入控件的组件体系，支持文本、密码、数字、日期、文件上传、选择框等多种输入类型。所有组件均继承自统一基类 `bricks.UiType`，并可通过工厂模式动态创建。

---

## 目录

- [概述](#概述)
- [核心基类](#核心基类)
  - [`bricks.UiType`](#bricksuitype)
  - [`bricks.UiHide`](#bricksuihide)
- [基础输入控件](#基础输入控件)
  - [`bricks.UiStr`](#bricksuistr)
  - [`bricks.UiPassword`](#bricksuipassword)
  - [`bricks.UiInt`](#bricksuiint)
  - [`bricks.UiFloat`](#bricksuifloat)
  - [`bricks.UiTel`](#bricksuitel)
  - [`bricks.UiEmail`](#bricksuiemail)
  - [`bricks.UiDate`](#bricksuidate)
  - [`bricks.UiText`](#bricksuitext)
  - [`bricks.UiCode`](#bricksuicode)
- [复合与特殊控件](#复合与特殊控件)
  - [`bricks.UiCheck`](#bricksuicheck)
  - [`bricks.UiCheckBox`](#bricksuicheckbox)
  - [`bricks.UiSearch`](#bricksuisearch)
- [多媒体输入控件](#多媒体输入控件)
  - [`bricks.UiFile`](#bricksuifile)
  - [`bricks.UiImage`](#bricksuiimage)
  - [`bricks.UiAudio`](#bricksuiaudio)
  - [`bricks.UiVideo`](#bricksuivideo)
- [工厂系统](#工厂系统)
  - [`bricks._Input`](#bricks_input)
  - [`Input` 工厂实例](#input-工厂实例)

---

## 概述

该模块提供了一个可扩展的 UI 输入组件框架，基于 JavaScript 类和 DOM 封装，实现以下特性：

- 统一接口：所有输入控件都实现了 `getValue()`, `setValue()`, `reset()`, `resultValue()` 等方法。
- 表单集成：支持通过 `set_formdata(formData)` 方法将值附加到 `FormData` 对象中。
- 值校验与格式化：通过正则表达式（`pattern`）进行输入过滤。
- 动态数据加载：如 `UiCode` 和 `UiCheckBox` 支持从 URL 异步加载选项数据。
- 用户交互事件：支持 `focus`, `blur`, `changed`, `keydown` 等事件绑定。
- 国际化支持：标签文本使用 `bricks.app.i18n._()` 进行翻译。
- 多媒体录制支持：图像、音频、视频可通过摄像头/麦克风直接采集。

---

## 核心基类

### `bricks.UiType`

**继承自**: `bricks.Layout`  
**用途**: 所有输入控件的抽象基类，定义通用行为。

#### 构造函数
```js
new bricks.UiType(opts)
```

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `opts.name` | String | 是 | 控件名称（对应表单字段名） |
| `opts.value` / `opts.defaultvalue` | Any | 否 | 初始值或默认值 |
| `opts.required` | Boolean | 否 | 是否为必填项 |

#### 属性
| 属性 | 类型 | 描述 |
|------|------|------|
| `name` | String | 字段名称 |
| `value` | Any | 当前值 |
| `required` | Boolean | 是否必填 |
| `ctype` | String | 内部类型标识，默认 `'text'` |
| `dom_element` | HTMLElement | 渲染后的 DOM 元素 |

#### 方法

| 方法 | 说明 |
|------|------|
| `getValue()` → Object | 返回 `{ name: value }`，若存在用户数据则合并返回 |
| `set_formdata(formData)` | 将当前值添加到 `FormData` 中 |
| `resultValue()` → Any | 获取实际提交值（子类重写） |
| `focus()` | 聚焦输入元素 |
| `reset()` | 重置为初始值 |
| `setValue(v)` | 设置值并更新 DOM |
| `set_disabled(f)` | 设置禁用状态 |
| `set_readonly(f)` | 设置只读状态 |
| `set_required(f)` | 设置是否必填 |

---

### `bricks.UiHide`

**继承自**: `bricks.UiType`  
**用途**: 隐藏字段，不显示但可携带数据。

#### 特性
- `uitype = 'hide'`
- 自动设置 `display: none` 样式

#### 示例
```js
new bricks.UiHide({ name: 'user_id', value: '12345' })
```

---

## 基础输入控件

### `bricks.UiStr`

**继承自**: `bricks.UiType`  
**用途**: 单行文本输入框。

#### 支持配置项 (`opts`)
| 属性 | 类型 | 说明 |
|------|------|------|
| `align` | String | 文本对齐方式：`left`, `center`, `right` |
| `length` | Number | 最大字符数（maxlength） |
| `minlength` | Number | 最小字符数 |
| `tip` | String | 提示信息（暂未使用） |
| `width` | String | 宽度（CSS 单位） |
| `readonly` | Boolean/String | 是否只读 |
| `required` | Boolean | 是否必填 |
| `placeholder` | String | 占位符文本（自动国际化） |
| `css` | String | 自定义 CSS 类名 |
| `dynsize` | Boolean | 是否启用动态字体适配 |
| `cfontsize` | Number | 字体缩放比例 |

#### 方法扩展
- `create()`：创建 `<input type="text">`
- `check_pattern(value)`：用正则校验输入
- `set_value_from_input(event)`：输入时触发值更新与事件派发
- `onfocus/onblur`：焦点处理，添加高亮样式

#### 示例
```js
new bricks.UiStr({
  name: 'username',
  placeholder: 'Enter your username',
  required: true,
  width: '200px'
})
```

---

### `bricks.UiPassword`

**继承自**: `bricks.UiStr`  
**用途**: 密码输入框。

#### 特性
- `type="password"`
- `uitype='password'`

#### 示例
```js
new bricks.UiPassword({ name: 'password', placeholder: '******' })
```

---

### `bricks.UiInt`

**继承自**: `bricks.UiStr`  
**用途**: 整数输入。

#### 特性
- `type="number"`
- `textAlign: right`
- 正则匹配：`\d*`
- `resultValue()` 返回 `parseInt(value)`

#### 示例
```js
new bricks.UiInt({ name: 'age', length: 3 })
```

---

### `bricks.UiFloat`

**继承自**: `bricks.UiInt`  
**用途**: 浮点数输入。

#### 特性
- 正则匹配：`\d*\.?\d+`
- 支持小数位控制（`dec_len`）
- 自动设置 `step` 属性以限制精度

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `dec_len` | 2 | 小数位数 |

#### 示例
```js
new bricks.UiFloat({ name: 'price', dec_len: 2 })
```

---

### `bricks.UiTel`

**继承自**: `bricks.UiStr`  
**用途**: 电话号码输入。

#### 特性
- `type="tel"`
- 默认正则：`[+]?\\d+`
- 支持自定义 `pattern`

#### 示例
```js
new bricks.UiTel({ name: 'phone', pattern: '[0-9]{11}' })
```

---

### `bricks.UiEmail`

**继承自**: `bricks.UiStr`  
**用途**: 邮箱地址输入。

#### 特性
- `type="email"`
- 可选自定义 `pattern`

#### 示例
```js
new bricks.UiEmail({ name: 'email', required: true })
```

---

### `bricks.UiDate`

**继承自**: `bricks.UiStr`  
**用途**: 日期选择器。

#### 支持配置
| 属性 | 说明 |
|------|------|
| `max_date` | 最大允许日期（字符串格式 YYYY-MM-DD） |
| `min_date` | 最小允许日期 |

#### 特性
- `type="date"`
- 若值为空，`resultValue()` 返回 `null`

#### 示例
```js
new bricks.UiDate({
  name: 'birth_date',
  min_date: '1900-01-01',
  max_date: '2024-12-31'
})
```

---

### `bricks.UiText`

**继承自**: `bricks.UiType`  
**用途**: 多行文本域（textarea）。

#### 支持配置
| 属性 | 类型 | 说明 |
|------|------|------|
| `rows` | Number | 行数 |
| `cols` | Number | 列数 |
| `height` | String | 高度（默认 `'200px'`） |

#### 特性
- 支持 Tab 缩进（每 4 空格）
- Shift+Tab 删除缩进
- Enter 换行（阻止默认行为）
- 支持代码编辑风格缩进逻辑

#### 方法
| 方法 | 说明 |
|------|------|
| `handle_tab_indent(erase)` | 处理 Tab 缩进或反向删除 |
| `handle_enter()` | 插入换行并保持光标位置 |

#### 示例
```js
new bricks.UiText({ name: 'description', rows: 6, cols: 50 })
```

---

### `bricks.UiCode`

**继承自**: `bricks.UiType`  
**用途**: 下拉选择框（类似 `<select>`），常用于枚举字段。

#### 支持配置
| 属性 | 说明 |
|------|------|
| `data` | 本地数据数组 `[ { value: '', text: '' } ]` |
| `dataurl` | 数据源 URL（异步加载） |
| `params` | 请求参数 |
| `method` | HTTP 方法（GET/POST） |
| `valueField` | 值字段名（默认 `'value'`） |
| `textField` | 显示文本字段名（默认 `'text'`） |
| `nullable` | 是否允许空选项 |

#### 特性
- 支持动态加载数据（`load_data()`）
- 支持级联刷新（通过 `get_data(event)` 接收上级事件参数）
- 自动生成 `<option>` 元素
- 支持国际化文本显示

#### 方法
| 方法 | 说明 |
|------|------|
| `build_options(data)` | 构建下拉选项 |
| `load_data(params)` | 异步获取数据 |
| `get_data(event?)` | 触发数据加载（可带参数） |

#### 示例
```js
new bricks.UiCode({
  name: 'status',
  dataurl: '/api/statuses',
  textField: 'label',
  valueField: 'id'
})
```

---

## 复合与特殊控件

### `bricks.UiCheck`

**继承自**: `bricks.UiType`  
**用途**: 单个复选图标（SVG 图标切换）。

#### 特性
- 使用 `MultipleStateIcon` 显示 checked/unchecked 状态
- 图标资源路径：
  - checked: `imgs/checkbox-checked.svg`
  - unchecked: `imgs/checkbox-unchecked.svg`
- 值为布尔类型

#### 方法
| 方法 | 说明 |
|------|------|
| `setValue(true/false)` | 设置状态 |
| `set_value_from_input()` | 响应图标点击，派发 `changed` 事件 |

#### 示例
```js
new bricks.UiCheck({ name: 'agree', value: false })
```

---

### `bricks.UiCheckBox`

**继承自**: `bricks.UiType`  
**用途**: 多选或单选组（fieldset + legend + 多个 UiCheck）。

#### 支持配置
| 属性 | 说明 |
|------|------|
| `data` | 选项列表 `[ { value: '', text: '' } ]` |
| `dataurl` | 异步数据源 |
| `textField` | 显示字段 |
| `valueField` | 值字段 |
| `label` | 分组标题（legend） |

#### 特性
- 支持多选（数组）和单选（字符串）
- 动态构建多个 `UiCheck` 实例
- 支持异步加载数据（`load_data_onfly()`）

#### 方法
| 方法 | 说明 |
|------|------|
| `build_checkboxs()` | 根据数据生成复选框列表 |
| `set_value_from_input()` | 更新选中值并广播 `changed` 事件 |
| `setValue(v)` | 设置选中项（支持数组或单值） |

#### 示例
```js
new bricks.UiCheckBox({
  name: 'hobbies',
  label: 'Your Hobbies',
  data: [
    { value: 'reading', text: 'Reading' },
    { value: 'music', text: 'Music' }
  ],
  multicheck: true
})
```

---

### `bricks.UiSearch`

**继承自**: `bricks.HBox`  
**用途**: 搜索选择器，点击图标弹出窗口选择数据。

#### 支持配置
| 属性 | 说明 |
|------|------|
| `search_url` | 弹窗内容页面 URL |
| `valueField` | 返回值字段 |
| `textField` | 显示字段 |
| `popup_options` | 弹窗配置 |
| `text` | 显示文本（非值） |

#### 特性
- 包含一个只读 `UiStr` 和一个搜索图标（SVG）
- 点击图标打开弹窗（`default_popupwindow`）
- 弹窗内查找 `Tabular` 组件并绑定事件
- 选择后调用 `set_data()` 更新值

#### 方法
| 方法 | 说明 |
|------|------|
| `open_search_window()` | 打开搜索弹窗 |
| `set_data(event)` | 接收选择结果并填充 |

#### 示例
```js
new bricks.UiSearch({
  name: 'customer_id',
  search_url: '/pages/customer_picker.html',
  valueField: 'id',
  textField: 'name'
})
```

---

## 多媒体输入控件

### `bricks.UiFile`

**继承自**: `bricks.VBox`  
**用途**: 文件上传控件，支持拖拽和点击选择。

#### 支持配置
| 属性 | 说明 |
|------|------|
| `accept` | MIME 类型过滤（如 `'image/'`, `'audio/'`） |
| `multiple` | 是否允许多选 |

#### 特性
- 支持拖拽上传
- 自动监听 `dragover`, `drop` 等事件
- 内部包含隐藏 `<input type="file">`
- 支持 `set_input_file(files)` 手动设置文件列表

#### 方法
| 方法 | 说明 |
|------|------|
| `handleFileSelect()` | 处理文件选择 |
| `dropHandle()` | 处理拖放事件 |
| `resultValue()` | 返回 File 或 FileList |

#### 示例
```js
new bricks.UiFile({ name: 'attachment', accept: 'application/pdf', multiple: true })
```

---

### `bricks.UiImage`

**继承自**: `bricks.UiFile`  
**用途**: 图像上传 + 拍照功能。

#### 特性
- `accept='image/'`
- 添加拍照按钮（调用 `SysCamera`）
- 支持预览上传或拍摄的图片（`show_image()`）

#### 方法
| 方法 | 说明 |
|------|------|
| `take_photo()` | 打开相机 |
| `accept_photo()` | 接收拍摄结果 |
| `_show_image(file)` | 显示图片预览（URL 或 Blob） |

#### 示例
```js
new bricks.UiImage({ name: 'avatar' })
```

---

### `bricks.UiAudio`

**继承自**: `bricks.UiFile`  
**用途**: 音频上传 + 录音功能。

#### 特性
- `accept='audio/'`
- 添加录音按钮（调用 `SysAudioRecorder`）
- 支持播放预览（`AudioPlayer`）

#### 方法
| 方法 | 说明 |
|------|------|
| `open_recorder()` | 打开录音器 |
| `accept_audio()` | 接收录音文件 |
| `_show_audio(file)` | 显示音频播放器 |

#### 示例
```js
new bricks.UiAudio({ name: 'voice_note' })
```

---

### `bricks.UiVideo`

**继承自**: `bricks.UiFile`  
**用途**: 视频上传 + 录制功能。

#### 特性
- `accept='video/'`
- 添加录像按钮（调用 `SysVideoRecorder`）
- 支持视频预览（`VideoPlayer`）

#### 方法
| 方法 | 说明 |
|------|------|
| `open_recorder()` | 打开录像器 |
| `accept_video()` | 接收录像文件 |
| `_show_video(file)` | 显示视频播放器 |

#### 示例
```js
new bricks.UiVideo({ name: 'demo_video' })
```

---

## 工厂系统

### `bricks._Input`

**用途**: 输入控件工厂类，用于注册和创建 UI 组件。

#### 方法

| 方法 | 说明 |
|------|------|
| `register(name, uitype, Klass)` | 注册组件类 |
| `factory(options)` | 根据 `uitype` 创建实例 |

#### 示例
```js
const factory = new bricks._Input();
factory.register('UiStr', 'str', bricks.UiStr);
const input = factory.factory({ uitype: 'str', name: 'title' });
```

---

### `Input` 工厂实例

全局已初始化的工厂对象，预注册了所有标准控件。

#### 已注册映射表

| 名称 (name) | uitype | 类 |
|------------|--------|-----|
| `UiStr` | `str` | `bricks.UiStr` |
| `UiPassword` | `password` | `bricks.UiPassword` |
| `UiInt` | `int` | `bricks.UiInt` |
| `UiFloat` | `float` | `bricks.UiFloat` |
| `UiTel` | `tel` | `bricks.UiTel` |
| `UiEmail` | `email` | `bricks.UiEmail` |
| `UiDate` | `date` | `bricks.UiDate` |
| `UiText` | `text` | `bricks.UiText` |
| `UiCode` | `code` | `bricks.UiCode` |
| `UiCheck` | `check` | `bricks.UiCheck` |
| `UiCheckBox` | `checkbox` | `bricks.UiCheckBox` |
| `UiFile` | `file` | `bricks.UiFile` |
| `UiImage` | `image` | `bricks.UiImage` |
| `UiAudio` | `audio`, `audiorecorder` | `bricks.UiAudio` |
| `UiVideo` | `video` | `bricks.UiVideo` |
| `UiSearch` | `search` | `bricks.UiSearch` |
| `UiHide` | `hide` | `bricks.UiHide` |

#### 使用方式
```js
const field = Input.factory({ uitype: 'email', name: 'contact_email' });
```

---

## 总结

本组件库提供了完整且可扩展的前端表单输入解决方案，具备以下优势：

✅ 统一 API 接口  
✅ 支持异步数据加载  
✅ 多媒体采集支持  
✅ 可定制样式与行为  
✅ 支持国际化  
✅ 事件驱动架构  

适用于构建复杂的表单页面、数据录入系统、移动端 Web 应用等场景。

--- 

> ✅ **提示**：建议结合 `bricks.Layout`、`bricks.HBox`/`VBox` 布局容器组织表单结构。  
> 📁 **资源路径**：图标资源位于 `imgs/` 目录下，需确保正确部署。