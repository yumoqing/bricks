# Bricks.js 表单模块技术文档

> 本文档描述了 `bricks` 框架中表单相关组件的实现逻辑、结构与使用方式。该模块提供了灵活的表单构建能力，支持动态字段渲染、数据校验、提交处理及工具栏集成。

---

## 目录

- [概述](#概述)
- [核心变量](#核心变量)
- [核心方法](#核心方法)
- [类说明](#类说明)
  - [`FieldGroup`](#fieldgroup)
  - [`FormBody`](#formbody)
  - [`FormBase`](#formbase)
  - [`InlineForm`](#inlineform)
  - [`Form`](#form)
- [工厂注册](#工厂注册)
- [使用示例](#使用示例)

---

## 概述

本模块为 `bricks.js` 提供了一套完整的表单系统，包含以下功能：

- 动态生成表单字段（支持嵌套分组）
- 支持文件上传（需使用 `FormData`）
- 自动化工具栏（提交、重置、取消按钮）
- 数据获取与验证
- 提交前后事件分发
- 多布局支持（水平/垂直输入框）

主要适用于 Web 端复杂表单场景，如配置页、编辑器、数据录入等。

---

## 核心变量

### `bricks.need_formdata_fields`

```js
bricks.need_formdata_fields = ['file', 'video', 'audio'];
```

**说明：**  
指定哪些字段类型需要通过 `FormData` 提交（例如文件上传类字段）。这些字段将触发表单启用 `multipart/form-data` 编码模式。

---

## 核心方法

### `show_resp_message_or_error(resp)`

```js
bricks.show_resp_message_or_error = async function(resp){...}
```

**参数：**
- `resp`: `Response` 对象（来自 `fetch` 请求）

**功能：**
1. 解析响应体为 JSON。
2. 调用 `widgetBuild` 将返回的 UI 描述渲染到页面主体中。

**用途：**  
用于处理服务端返回的动态 UI 或错误信息并展示。

---

## 类说明

### `FieldGroup`

负责根据字段定义递归构建表单控件。

#### 构造函数
```js
new FieldGroup(opts)
```
- `opts`: 配置对象（目前未实际使用）

#### 方法：`build_fields(form, parent, fields)`

| 参数     | 类型       | 说明 |
|----------|------------|------|
| `form`   | Form 实例  | 当前所属表单对象 |
| `parent` | Widget     | 容器组件（如 VBox/HBox） |
| `fields` | Array      | 字段数组 |

**行为说明：**

- 使用 `DynamicColumn` 实现响应式列布局（移动端默认两列）。
- 若遇到 `uitype: 'group'` 的字段，则递归构建其内部字段，并插入新列。
- 非隐藏字段创建 `VBox` 或 `HBox` 包裹标签和输入控件。
- 所有输入控件由 `Input.factory(field)` 创建，并存入 `form.name_inputs`。
- 若字段类型在 `need_formdata_fields` 中，设置 `form.need_formdata = true`。

---

### `FormBody`

继承自 `VScrollPanel`，是表单内容区域的核心容器。

#### 构造函数
```js
new FormBody(form, opts)
```

**初始化操作：**
- 设置宽高为 100%
- 初始化 `name_inputs` 映射
- 创建 `FieldGroup` 渲染非文本字段
- 调用 `build_text_fields()` 渲染文本字段

#### 方法：`build_text_fields()`

遍历 `form.textfields`，对每个字段：
- 创建标签文字 (`Text`)
- 创建只读文本控件 (`UiText`)
- 包装成 `VBox` 并添加至容器
- 注册到 `form.name_inputs` 中以便后续取值

> **注意：** `text` 类型字段不参与编辑，仅用于显示。

---

### `FormBase`

表单基类，提供通用功能（继承自 `Layout`）。

#### 属性

| 属性名            | 类型    | 说明 |
|-------------------|--------|------|
| `name_inputs`     | Object | 存储字段名 → 控件实例映射 |
| `submit_changed`  | Boolean| 是否仅提交变更字段 |
| `origin_data`     | Object | 初始数据快照（用于比对变化） |
| `submit_url`      | String | 提交地址 |
| `method`          | String | HTTP 方法，默认 `'POST'` |
| `toolbar`         | Object | 工具栏配置扩展 |

#### 方法

##### `build_toolbar(widget)`
动态构建顶部工具栏（含“提交”、“重置”、“取消”按钮），支持自定义扩展。

- 默认图标路径由 `bricks_resource()` 加载。
- 使用 `IconTextBar` 组件呈现按钮条。
- 绑定 `command` 事件到 `command_handle`。

##### `command_handle(event)`
处理工具栏命令事件：

| 命令名     | 行为 |
|-----------|------|
| `submit`  | 触发 `validation()` |
| `reset`   | 调用 `reset_data()` |
| `cancel`  | 触发 `dispatch('cancel')` |
| 其他      | 若有 `action` 则执行事件处理器；否则直接 `dispatch(name)` |

##### `reset_data()`
重置所有输入控件为其初始值（调用各控件的 `reset()` 方法）。

##### `_getValue()`
收集所有字段值，进行必填校验：

- 忽略无权访问的属性（`hasOwnProperty`）
- 调用 `getValue()` 获取控件值
- 必填项为空时弹出错误提示并聚焦
- 返回合并后的数据对象

> ⚠️ 若校验失败则中断并返回 `undefined`

##### `getValue()`
优先返回缓存的 `this.data`，否则调用 `get_formdata()`。

##### `get_formdata()`
构建 `FormData` 实例：

- 遍历所有控件，调用 `set_formdata(data)` 写入数据
- 若启用了 `submit_changed`，跳过未修改字段
- 忽略值为 `null` 的字段
- 返回 `FormData` 或 `null`（无变更）

##### `validation()`
异步提交流程控制：

1. 显示加载动画（`Running` 组件）
2. 获取 `FormData`
3. 分发 `submit` 事件
4. 若设置了 `submit_url`，发起 HTTP 请求
5. 成功后分发 `submited` 事件，传入响应对象
6. 出错时捕获异常并输出日志
7. 隐藏加载动画

##### `save_origin_data()`
保存当前所有字段值作为原始状态，用于后续变更判断。

---

### `InlineForm`

轻量级内联表单，适合嵌入其他组件内部。

#### 特性：
- 不包含标题或描述
- 直接渲染字段 + 工具栏
- 自动保存初始数据

#### 构造函数
```js
new InlineForm(opts)
```

**行为：**
- 设置宽高 100%，开启滚动
- 调用 `FieldGroup.build_fields()` 渲染 `opts.fields`
- 添加工具栏到第一个子容器
- 保存初始数据

---

### `Form`

完整表单组件，具备标题、描述、分栏、工具栏等功能。

#### 配置选项（`opts`）

| 参数           | 类型      | 说明 |
|----------------|----------|------|
| `title`        | String   | 表单标题（可国际化） |
| `description`  | String   | 表单描述文本 |
| `notoolbar`    | Boolean  | 是否隐藏工具栏，默认 `false` |
| `input_layout` | String   | 输入框布局 `"VBox"`（默认）或 `"HBox"` |
| `fields`       | Array    | 字段定义数组 |
| `submit_url`   | String   | 提交 URL |
| `method`       | String   | HTTP 方法（GET/POST） |
| `toolbar`      | Object   | 自定义工具栏配置 |

#### 构造流程

1. 设置尺寸与滚动
2. 添加标题（若有）
3. 添加描述（若有）
4. 添加填充容器 `Filler`
5. 分离 `text` 与其他字段
6. 创建 `FormBody` 渲染主体内容
7. 条件性构建工具栏
8. 保存初始数据

---

## 工厂注册

```js
bricks.Factory.register('InlineForm', bricks.InlineForm);
bricks.Factory.register('Form', bricks.Form);
```

允许通过字符串名称动态创建组件实例，便于模板化渲染。

---

## 使用示例

### 定义一个简单表单

```js
var form = new bricks.Form({
  title: "User Profile",
  description: "Please fill in your information.",
  submit_url: "/api/user/update",
  method: "POST",
  input_layout: "VBox",
  fields: [
    { name: "username", label: "Username", uitype: "text_input", required: true },
    { name: "email", label: "Email", uitype: "email", required: true },
    { name: "avatar", label: "Avatar", uitype: "file" },
    { name: "bio", label: "Bio", uitype: "textarea" },
    {
      uitype: "group",
      fields: [
        { name: "phone", label: "Phone", uitype: "tel" },
        { name: "age", label: "Age", uitype: "number" }
      ]
    }
  ]
});

// 监听提交事件
form.bind('submit', function(data){
  console.log("Submitting:", data);
});

form.bind('submited', function(resp){
  alert("Saved successfully!");
});
```

### 内联表单示例

```js
var inline = new bricks.InlineForm({
  fields: [
    { name: "name", label: "Name", uitype: "text_input" },
    { name: "status", label: "Status", uitype: "select", options: [...] }
  ],
  toolbar: {
    tools: [
      { icon: "...", name: "custom", label: "Custom Action", action: "doSomething" }
    ]
  }
});

inline.bind('command:custom', function(){ ... });
```

---

## 附录：字段定义格式

```json
[
  {
    "name": "field_name",
    "label": "Display Label",
    "uitype": "text_input|email|file|group|hide|...",
    "required": true,
    "value": "default_value",
    "removable": false,
    "icon": "optional_icon_path"
  }
]
```

其中：
- `group`: 可嵌套子字段
- `text`: 仅展示，不可编辑
- `hide`: 隐藏字段（但仍会渲染占位）

---

## 注意事项

- 文件上传字段必须使用 `FormData`，确保 `submit_url` 接口支持 `multipart/form-data`。
- 所有文本标签建议启用 `i18n: true` 实现多语言支持。
- 自定义控件需实现 `getValue()` 和 `set_formdata(formData)` 接口。
- 错误提示依赖 `bricks.Error` 组件，请确保已加载。

---

> 📚 更多组件参考请查阅 [Bricks.js 官方文档](https://github.com/your-bricks-project)。