# bricks控件
bricks内置许多的显示控件，所有显示控件都继承自JsWidget，容器控件Layout就继承自JsWidget，其他的容器HBox， VBox继承自Layout



## 基础控件 
* [Form](form.md)：输入表单控件
自动根据options中的fields定义构造表单，目前支持的数据类型有：
** 'str' 对应的控件为： bricks.UiStr
** 'hide' 对应的控件为： bricks.UiHide
** 'tel' 对应的控件为： bricks.UiTel
** 'date' 对应的控件为： bricks.UiDate
** 'int' 对应的控件为： bricks.UiInt
** 'float' 对应的控件为： bricks.UiFloat
** 'check' 对应的控件为： bricks.UiCheck
** 'checkbox' 对应的控件为： bricks.UiCheckBox
** 'email' 对应的控件为： bricks.UiEmail
** 'file' 对应的控件为： bricks.UiFile
** 'image' 对应的控件为： bricks.UiImage
** 'code' 对应的控件为： bricks.UiCode
** 'text' 对应的控件为： bricks.UiText
** 'password' 对应的控件为： bricks.UiPassword
** 'audio' 对应的控件为： bricks.UiAudio
** 'video' 对应的控件为： bricks.UiVideo
上述控件都在[输入定义](inout.js)
* [Accordion](accordion.md) bricks.Accordion
手风琴控件，支持多个标题，内容组成的控件，内容和展开和折叠
* [AudioPlayer](audio.md) bricks.AudioPlayer
音频播放控件

* [ChartBar](bar.md) bricks.ChartBar
将后台数据显示为条形图表
* [Button](button.md) bricks.Button
按钮控件

* [Cols](cols.md) bricks.Cols
列式排列控件，可动态填满父控件的宽度
* [Conform](conform.md) bricks.Conform
确认控件，弹出窗口显示内容，并要求用户确认

* [Countdown](countdown.md) bricks.Countdown
时间倒计时控件，显示从还剩下的时间
* [TimePassed](countdown.md) bricks.TimePassed
时间消耗控件，显示从开始计时开始所消耗的时间
* [DataGrid](datagrid.md) bricks.DataGrid
数据表格控件
* [DataRow](datarow.md) bricks.DataRow
数据行控件
* [DataViewer](dataviewer.md) bricks.DataViewer
数据显示控件，DynamicColumn控件的后代控件
* [DOCXviewer](docxviewer.md) bricks.DOCXviewer
docx文件显示控件
* [EXCELviewer](docxviewer.md) bricks.EXCELviewer
excel文件显示控件
* [PDFviewer](accordion.md) bricks.PDFviewer
pdf显示控件
* [DynamicAccordion](dynamicaccordion.md) bricks.DynamicAccordion
动态手风琴控件
* [IconBar](floaticonbar.md) bricks.IconBar
图标条控件
* [IconTextBar](floaticonbar.md) bricks.IconTextBar
图标文本条控件
* [FloatIconBar](floaticonbar.md) bricks.FloatIconBar
浮动图标条，平时显示一个标识图标，点击此标识图标后显示图标条
* [FloatIconTextBar](floaticonbar.md) bricks.FloatIconTextBar
浮动图标正文条，平时显示一个标识图标，点击此图标后显示图标正文条

* [Html](html.md) bricks.Html
HTML控件，直接显示html内容
* [IconbarPage](iconbarpage.md) bricks.IconbarPage
图标条页控件，显示图标条，不同的图标点击后显示图标对应的内容

* [NewWindow](iframe.md) bricks.NewWindow
新浏览器页签或窗口控件，浏览器创建新的窗口或页签显示url的内容
* [Iframe](iframe.md) bricks.Iframe
Iframe控件，用于显示外部网站内容
* [Image](image.md) bricks.Image
图像控件
* [StatedIcon](image.md) bricks.StatedIcon
多站台图标，点击后状态改变，支持多个状态，并发出状态改变事件
* [Icon](image.md) bricks.Icon
图标控件，支持多种图像格式url
* [BlankIcon](image.md) bricks.BlankIcon
空白图标占位控件

* [ChartLine](line.md) bricks.ChartLine
* [LlmIO](llm.md) bricks.LlmIO
* [LlmOut](llm.md) bricks.LlmOut
* [MarkdownViewer](markdownviewer.md) bricks.MarkdownViewer
* [MdWidget](markdownviewer.md) bricks.MdWidget
* [Menu](menu.md) bricks.Menu
* [Message](message.md) bricks.Message
* [Error](message.md) bricks.Error

* [MultipleStateImage](multiple_state_image.md) bricks.MultipleStateImage
多状态图像控件
* [PeriodDays](period.md) bricks.PeriodDays
日期期间控件，自动计算时间段的起始日期
* [ChartPie](pie.md) bricks.ChartPie
饼图控件，基于echrts
* [ProgressBar](progressbar.md) bricks.ProgressBar
进度条控件
* [SysCamera](recorder.md) bricks.SysCamera
照相控件，可拍摄照片
* [WidgetRecorder](recorder.md) bricks.WidgetRecorder
控件视频录制控件，可录制浏览器播放的视频
* [SysAudioRecorder](recorder.md) bricks.SysAudioRecorder
浏览器音频录制控件，用来录制音频
* [SysVideoRecorder](recorder.md) bricks.SysVideoRecorder
浏览器视频录制控件，用来录制视频
* [Running](running.md) bricks.Running
运行图标控件，modal模式显示正在运行，相关控件不可操作，需要在完成 任务后dismiss它
* [Splitter](splitter.md) bricks.Splitter
分割器控件，显示水平或垂直分割线
* [Svg](svg.md) bricks.Svg
Svg图标控件
* [StatedSvg](svg.md) bricks.StatedSvg
带状态的svg图标控件，不同状态显示不同的图标
* [MultipleStateIcon](svg.md) bricks.MultipleStateIcon
多状态图标控件

* [TabPanel](tab.md) bricks.TabPanel
页签控件
* [Tabular](tabular.md) bricks.Tabular
数据列表形式的数据维护控件，支持数据的显示，增加，修改和删除

[xls2ddl](https://git.opencomputing.cn/yumoqing/xls2ddl)工具能根据数据表结构自动生成数据Tabular控件以及相关的数据维护dspy

* [Toolbar](toolbar.md) bricks.Toolbar
工具条控件
* [Tree](tree.md) bricks.Tree
树形控件
* [VadText](vadtext.md) bricks.VadText
自动捕获语音并将捕获的语音发送给服务器
* [VideoPlayer](videoplayer.md) bricks.VideoPlayer

视频播放控件，支持浏览器支持的视频格式外，还支持m3u8流媒体和Dash流媒体,
bricks已在3parties目录中包含了所依赖的hls和dash包

* [Video](videoplayer.md) bricks.VideoPlayer
视频播放控件同VideoPlayer
* [WebSocket](websocket.md) bricks.WebSocket

支持websocket

* [WebTTS](webspeech.js.md) bricks.WebTTS
为完成控件，浏览器内置文本转语音能力
* [WebASR](webspeech.js.md) bricks.WebASR
未完成控件，浏览器内部的语音识别能力
* [Tooltip](widget.md) bricks.Tooltip

Tooltip控件，不直接创建，而是在控件中添加“tip":"提示字符串“属性为控件添加Tooltip控件

* [Text](widget.md) bricks.Text

文本控件

* [Title1](widget.md) bricks.Title1

第一号标题

* [Title2](widget.md) bricks.Title2

第二号标题

* [Title3](widget.md) bricks.Title3

第三号标题

* [Title4](widget.md) bricks.Title4

第四号标题

* [Title5](widget.md) bricks.Title5

第五号标题

* [Title6](widget.md) bricks.Title6

第六号标题

* [Wterm](wterm.md) bricks.Wterm

xterm.js在bricks中的实现

## 容器类控件
* [VScrollPanel](accordion.md) bricks.VScrollPanel
垂直滚动容器，需要设置固定的高度或占满全部父容器高度
* [HScrollPanel](accordion.md) bricks.HScrollPanel
水平滚动容器，需要设置固定的宽度或占满全部父容器宽度
* [Popup](accordion.md) bricks.Popup
弹出容器，置于当前全部控件最上面
* [PopupWindow](accordion.md) bricks.PopupWindow
弹出窗口，置于当前全部控件最上面
* [HBox](accordion.md) bricks.HBox
水平扩展容器，全部子控件水平排放
* [VBox](accordion.md) bricks.VBox
垂直扩展容器，全部子控件垂直排放
* [Filler](accordion.md) bricks.Filler
占满父容器剩余控件，如果父容器有多个Filler控件，则平均分配剩余控件，Filler容器下可添加子控件

* [DynamicColumn](dynamiccolumn.md) bricks.DynamicColumn
子控件需要设置固定宽度，动态从左到右，从上到下排列子控件

* [ResponsableBox](layout.md) bricks.ResponsableBox
自适应容器，当宽度大则水平排列子控件，而高度大时则水平排列子控件, 并能根据宽高变化自动改变。

* [Modal](modal.md) bricks.Modal
modal容器
