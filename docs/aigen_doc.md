# OEPNAI帮助生成的文档

我已经解压并直接从你上传的仓库源码里抓取并解析了第一批核心文件（uitypesdef.js、bricks.js、jsoncall.js、input.js、form.js、button.js），并把关键发现整理成第一阶段交付：（1）Bricks JSON 的基本结构与约定；（2）从源码明确的首批控件/类型与字段解析；（3）接下来我会继续批量解析剩余控件并把完整规范输出为 Bricks JSON 规范 v2。

下面是我现在能直接、可靠交付的结果 —— 基于仓库源码的准确提取（你可以直接拿去作为 SwiftBricks 设计依据）。

## 一、从源码得出的最重要全局约定（JSON 树格式）

（这些约定在 bricks.widgetBuild / 示例文件 中被反复使用——是框架运行时的标准格式）

根：任意 widget 描述是一个对象，关键字段包括：

widgettype — 必需，字符串，指定要创建的 widget 类型（与 bricks.Factory.register('XXX', ...) 注册名一致）。

options — 对象，控件的属性/配置（控件会读取 opts = desc.options || {}）。

subwidgets — 数组，可选，子 widget 列表（用于容器/布局类）。

binds — 数组，可选，事件绑定定义（见下）。

wid — 可选，用于给 widget 指定 id（可在绑定中引用）。

actiontype / action 等：某些场景下顶层会直接包含 action 相关字段（详见具体控件）。

binds（事件绑定）结构（示例）：
```
"binds": [
  {
    "wid":"self",
    "event":"click",
    "actiontype":"script",
    "script":"alert('HBox clicked');"
  }
]
```
常见字段有：

wid：事件源 id（"self" 表示当前）

event：事件名（如 "click", "change"）

actiontype：执行动作类型（script, ajax, bricks 等）

script / url / method / params：动作所需额外字段

数据/表达式处理：

bricks.apply_data(desc, data) 用来把 data 应用到描述里（框架支持在 desc 中使用数据表达式并替换）。

## 二、uitypesdef.js（基础 UI 类型定义）

bricks/uitypesdef.js 中明确了基本的 简单数据类型 view/input 构造器（主要用于表单字段、简易数据渲染）：

从文件中提取到的 已注册基础类型：

* View/Input builder 类型（通过 bricks.uitypesdef.setViewBuilder / setInputBuilder 注册）：

1 str (string)

2 password

3 int

4 float

5 code

这说明：表单/字段层面，字段类型会使用这些 uitypesdef 注册的 builder 来渲染 view 或 input（例如 password 会用 UiPassword，str 用 UiText 等）。

## 三、解析的核心控件（文件级别提取：input.js, button.js, form.js）

下面是我从源码实现中抽取出来的控件属性/行为（可直接用作规范文档条目）：

1) Button （bricks.Button — button.js）

注册名：'Button' (bricks.Factory.register('Button', bricks.Button);)

JSON 示例位置：examples/button.ui

主要读取位置：this.opts（来自 desc.options）

常见 options 字段（在源码注释/实现中出现）：

name：控件名

label：显示文本

icon：图标路径

tooltip：提示

bgcolor / color / css 等样式配置

orientation, nonepack, height, width, item_rate 等布局/尺寸相关

action：动作对象（格式可包含 target, datawidget 等）

事件：

内部会 dispatch('click', this.opts)，并触发 binds 中注册的 click。

可通过 binds 或 action 指定脚本或 RPC。

children：

Button 通常是单节点（不常用 subwidgets），但可嵌于容器（如 HBox 的 subwidgets 中为 Button）。

2) UiType / 基本 Input（input.js）

主要类：bricks.UiType（extends bricks.Layout）

常见 opts / options 字段：

name：字段名（表单字段标识）

required：是否必填

ctype：字段类别（例如 'text'）

value / defaultvalue：初始值

公开方法：

getValue()：返回 { name: value } 对象

resultValue()：拿到实际值（子类通常覆盖）

getUserData()：从表单/父 widget 获取额外数据

行为：

Input 节点在 form 内会被 Form 收集（Form 里有 build_fields、getValue 整体收集逻辑）。

3) Form（form.js）

负责构建 form 字段、处理提交并与后端交互

与表单相关常量：bricks.need_formdata_fields = ['file', 'video', 'audio'];（决定是否使用 multipart/form-data）

主要职责：

build_fields(form, parent, fields)：根据 fields 描述构造表单 field widget（支持 miniform、FieldGroup 等抽象）

command_handle(event)：处理表单工具栏命令（如提交、reset）

show_resp_message_or_error(resp)：显示服务端返回作为 widget build 的 JSON（可把服务器返回的 JSON 当作 widget 描述渲染）

表单的 options/items 格式在 examples 下的 miniform.ui / login_form.json 有具体样例（我会在后续批次把每个示例抽成规范片段）

## 四、jsoncall.js（HTTP/JSON / RPC 支持）

包含 bricks.HttpJson、httpcall、withLoginInfo 等函数，用于：

向服务器发送请求并解析流式响应（支持 chunked / SSE-like）

自动处理 cookie/session（示例里会把 Set-Cookie 存入 bricks.app.save_session）

支持超时、重试、与 widgetBuild 配合把 JSON 响应直接渲染成 widget

在 bricks.widgetBuild 中，如果 widgettype == 'urlwidget' 或 desc.options.url，会使用 jsoncall 发起请求并用返回数据继续构造 widget

## 五、仓库中注册的所有 widget 类型（已从所有 *.js 文件的 bricks.Factory.register 抽取）
```
Accordion
ASRClient
AudioPlayer
AudioRecorder
TextedAudioPlayer
ChartBar
Button
Camera
Cols
Conform
ContinueAudioPlayer
Countdown
TimePassed
DataGrid
DataRow
DataViewer
DOCXviewer
EXCELviewer
PDFviewer
DynamicAccordion
DynamicColumn
EChart
FilePlayer
FloatIconBar
Footer
Form
Filler
Goban
Grid
Header
HeaderBar
HeaderBar2
HeaderTitle
HBox
IconBarPage
IconTextBar
Image
ImageList
Input
IFrame
KeyPress
KeyEvent
Label
Layout
Li
List
ListTable
Login
MapView
MarkdownViewer
Menu
Message
MiniForm
Modal
MultiStateImage
MyOperator
Navigator
Notification
PageDataLoader
Paging
Panel
Pie
Popup
ProgressBar
QRCode
RadialChart
Range
Row
Scroll
Select
Splitter
Spinner
SQLConsole
SvgImage
Tab
Tabular
Table
TablePager
Text
TextArea
TextInput
TimeAxis
Toolbar
Tree
TreeChoose
Tooltip
Title1
Title2
Title3
Title4
Title5
Title6
VideoPlayer
Video
WebSocket
WebTTS
WebASR
Tooltip
Text
KeyinText
Title1
Title2
Title3
Title4
Title5
Title6
LlmIO
Wterm
```

## 六、示例（摘自 examples/button.ui） — 典型的 widget JSON
```
{
  "widgettype": "HBox",
  "options": {
    "height":"auto",
    "width":"100%"
  },
  "subwidgets": [
    {
      "widgettype": "Button",
      "options": {
        "name": "test",
        "icon": "/bricks/imgs/submit.png",
        "label": "test once",
        "tooltip": "This is a joke too",
        "bgcolor": "#ff00ff",
        "nonepack": true,
        "orientation": "horizontal"
      }
    }
  ],
  "binds": [
    {
      "wid": "self",
      "event": "click",
      "actiontype": "script",
      "script": "alert('HBox clicked');"
    }
  ]
}
```
这种结构是框架的标准单位：widgettype + options + subwidgets + binds。

