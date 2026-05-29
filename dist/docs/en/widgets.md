# Bricks Widgets

Bricks includes a wide range of built-in display widgets. All display widgets inherit from `JsWidget`. The container widget `Layout` inherits from `JsWidget`, and other containers such as `HBox` and `VBox` inherit from `Layout`.

## Basic Widgets

* **[Form](form.md)**: Input form widget  
  Automatically generates form input fields based on the `uitype` values of fields defined in `options`. Currently supported `uitype` data types include:
  * `'str'` → Widget: `bricks.UiStr`
  * `'hide'` → Widget: `bricks.UiHide`
  * `'tel'` → Widget: `bricks.UiTel`
  * `'date'` → Widget: `bricks.UiDate`
  * `'int'` → Widget: `bricks.UiInt`
  * `'float'` → Widget: `bricks.UiFloat`
  * `'check'` → Widget: `bricks.UiCheck`
  * `'checkbox'` → Widget: `bricks.UiCheckBox`
  * `'email'` → Widget: `bricks.UiEmail`
  * `'file'` → Widget: `bricks.UiFile`
  * `'image'` → Widget: `bricks.UiImage`
  * `'code'` → Widget: `bricks.UiCode`
  * `'text'` → Widget: `bricks.UiText`
  * `'password'` → Widget: `bricks.UiPassword`
  * `'audio'` → Widget: `bricks.UiAudio`
  * `'video'` → Widget: `bricks.UiVideo`

These widgets are registered as input field components in the [input definition](inout.js).

* **[Accordion](accordion.md)** `bricks.Accordion`  
  Accordion widget supporting multiple title-content sections with expand/collapse functionality.

* **[AudioPlayer](audio.md)** `bricks.AudioPlayer`  
  Audio playback widget.

* **[ChartBar](bar.md)** `bricks.ChartBar`  
  Displays backend data as bar charts.

* **[Button](button.md)** `bricks.Button`  
  Button widget.

* **[Cols](cols.md)** `bricks.Cols`  
  Column layout widget that dynamically fills the parent's width.

* **[Conform](conform.md)** `bricks.Conform`  
  Confirmation widget; displays content in a pop-up window and requires user confirmation.

* **[Countdown](countdown.md)** `bricks.Countdown`  
  Countdown timer widget showing remaining time.

* **[TimePassed](countdown.md)** `bricks.TimePassed`  
  Elapsed time widget showing time consumed since starting the timer.

* **[DataGrid](datagrid.md)** `bricks.DataGrid`  
  Data table widget.

* **[DataRow](datarow.md)** `bricks.DataRow`  
  Data row widget.

* **[DataViewer](dataviewer.md)** `bricks.DataViewer`  
  Data display widget, descendant of the `DynamicColumn` widget.

* **[DOCXviewer](docxviewer.md)** `bricks.DOCXviewer`  
  DOCX file viewer widget.

* **[EXCELviewer](docxviewer.md)** `bricks.EXCELviewer`  
  Excel file viewer widget.

* **[PDFviewer](accordion.md)** `bricks.PDFviewer`  
  PDF viewer widget.

* **[DynamicAccordion](dynamicaccordion.md)** `bricks.DynamicAccordion`  
  Dynamic accordion widget.

* **[IconBar](floaticonbar.md)** `bricks.IconBar`  
  Icon bar widget.

* **[IconTextBar](floaticonbar.md)** `bricks.IconTextBar`  
  Icon-text bar widget.

* **[FloatIconBar](floaticonbar.md)** `bricks.FloatIconBar`  
  Floating icon bar; normally shows a marker icon, which when clicked expands into a full icon bar.

* **[FloatIconTextBar](floaticonbar.md)** `bricks.FloatIconTextBar`  
  Floating icon-text bar; normally shows a marker icon, which when clicked expands into a full icon-text bar.

* **[Html](html.md)** `bricks.Html`  
  HTML widget for directly displaying HTML content.

* **[IconbarPage](iconbarpage.md)** `bricks.IconbarPage`  
  Icon-bar page widget; displays an icon bar where clicking different icons shows corresponding content.

* **[NewWindow](iframe.md)** `bricks.NewWindow`  
  New browser tab or window widget; opens a new browser window or tab to display URL content.

* **[Iframe](iframe.md)** `bricks.Iframe`  
  Iframe widget used to display external website content.

* **[Image](image.md)** `bricks.Image`  
  Image widget.

* **[StatedIcon](image.md)** `bricks.StatedIcon`  
  Multi-state icon; changes state upon click, supports multiple states, and emits state-change events.

* **[Icon](image.md)** `bricks.Icon`  
  Icon widget supporting various image format URLs.

* **[BlankIcon](image.md)** `bricks.BlankIcon`  
  Blank placeholder icon widget.

* **[ChartLine](line.md)** `bricks.ChartLine`  
  Line chart widget.

* **[LlmIO](llm.md)** `bricks.LlmIO`  
  LLM input/output interface widget.

* **[LlmOut](llm.md)** `bricks.LlmOut`  
  LLM output-only widget.

* **[MarkdownViewer](markdownviewer.md)** `bricks.MarkdownViewer`  
  Markdown file viewer widget.

* **[MdWidget](markdownviewer.md)** `bricks.MdWidget`  
  Markdown rendering widget.

* **[Menu](menu.md)** `bricks.Menu`  
  Menu widget.

* **[Message](message.md)** `bricks.Message`  
  Message notification widget.

* **[Error](message.md)** `bricks.Error`  
  Error message widget.

* **[MultipleStateImage](multiple_state_image.md)** `bricks.MultipleStateImage`  
  Multi-state image widget.

* **[PeriodDays](period.md)** `bricks.PeriodDays`  
  Date period widget; automatically calculates start and end dates of a time span.

* **[ChartPie](pie.md)** `bricks.ChartPie`  
  Pie chart widget based on ECharts.

* **[ProgressBar](progressbar.md)** `bricks.ProgressBar`  
  Progress bar widget.

* **[SysCamera](recorder.md)** `bricks.SysCamera`  
  Camera widget for taking photos.

* **[WidgetRecorder](recorder.md)** `bricks.WidgetRecorder`  
  Widget video recorder; records videos played within the browser.

* **[SysAudioRecorder](recorder.md)** `bricks.SysAudioRecorder`  
  Browser audio recorder for capturing audio.

* **[SysVideoRecorder](recorder.md)** `bricks.SysVideoRecorder`  
  Browser video recorder for capturing video.

* **[Running](running.md)** `bricks.Running`  
  Running indicator widget; displayed modally to indicate ongoing processes, disabling interaction with other widgets until dismissed after task completion.

* **[Splitter](splitter.md)** `bricks.Splitter`  
  Splitter widget for rendering horizontal or vertical divider lines.

* **[Svg](svg.md)** `bricks.Svg`  
  SVG icon widget.

* **[StatedSvg](svg.md)** `bricks.StatedSvg`  
  Stateful SVG icon widget; displays different icons based on current state.

* **[MultipleStateIcon](svg.md)** `bricks.MultipleStateIcon`  
  Multi-state icon widget.

* **[TabPanel](tab.md)** `bricks.TabPanel`  
  Tabbed panel widget.

* **[Tabular](tabular.md)** `bricks.Tabular`  
  Data list widget for data management, supporting display, addition, modification, and deletion of data entries.

The **[xls2ddl](https://git.opencomputing.cn/yumoqing/xls2ddl)** tool can automatically generate `Tabular` data widgets and related data maintenance DSPy code from database table structures.

* **[Toolbar](toolbar.md)** `bricks.Toolbar`  
  Toolbar widget.

* **[Tree](tree.md)** `bricks.Tree`  
  Tree structure widget.

* **[VadText](vadtext.md)** `bricks.VadText`  
  Automatically captures speech and sends it to the server.

* **[VideoPlayer](videoplayer.md)** `bricks.VideoPlayer`  
  Video player widget supporting all standard browser-supported formats, plus M3U8 and Dash streaming protocols.  
  Bricks includes required HLS and Dash libraries in the `3parties` directory.

* **[Video](videoplayer.md)** `bricks.VideoPlayer`  
  Video playback widget (same as VideoPlayer).

* **[WebSocket](websocket.md)** `bricks.WebSocket`  
  Supports WebSocket communication.

* **[WebTTS](webspeech.js.md)** `bricks.WebTTS`  
  Incomplete widget; provides browser-native text-to-speech capability.

* **[WebASR](webspeech.js.md)** `bricks.WebASR`  
  Incomplete widget; uses browser-native speech recognition capability.

* **[Tooltip](widget.md)** `bricks.Tooltip`  
  Tooltip widget; not created directly. Added by including the attribute `"tip": "tooltip text"` on any widget to attach a tooltip.

* **[Text](widget.md)** `bricks.Text`  
  Text widget.

* **[Title1](widget.md)** `bricks.Title1`  
  Heading level 1.

* **[Title2](widget.md)** `bricks.Title2`  
  Heading level 2.

* **[Title3](widget.md)** `bricks.Title3`  
  Heading level 3.

* **[Title4](widget.md)** `bricks.Title4`  
  Heading level 4.

* **[Title5](widget.md)** `bricks.Title5`  
  Heading level 5.

* **[Title6](widget.md)** `bricks.Title6`  
  Heading level 6.

* **[Wterm](wterm.md)** `bricks.Wterm`  
  Implementation of xterm.js within bricks.

## Container Widgets

* **[VScrollPanel](accordion.md)** `bricks.VScrollPanel`  
  Vertical scrollable container; requires fixed height or must fill the entire height of its parent container.

* **[HScrollPanel](accordion.md)** `bricks.HScrollPanel`  
  Horizontal scrollable container; requires fixed width or must fill the entire width of its parent container.

* **[Popup](accordion.md)** `bricks.Popup`  
  Popup container positioned above all other widgets.

* **[PopupWindow](accordion.md)** `bricks.PopupWindow`  
  Popup window positioned above all other widgets.

* **[HBox](accordion.md)** `bricks.HBox`  
  Horizontal layout container; arranges all child widgets horizontally.

* **[VBox](accordion.md)** `bricks.VBox`  
  Vertical layout container; arranges all child widgets vertically.

* **[Filler](accordion.md)** `bricks.Filler`  
  Fills the remaining space in the parent container. If multiple `Filler` widgets exist, they equally share the leftover space. Child widgets can be added inside a `Filler`.

* **[DynamicColumn](dynamiccolumn.md)** `bricks.DynamicColumn`  
  Child widgets require fixed widths; arranged dynamically from left to right, top to bottom.

* **[ResponsableBox](layout.md)** `bricks.ResponsableBox`  
  Responsive container; lays out child widgets horizontally when width is sufficient, vertically when height dominates, adapting automatically to size changes.

* **[Modal](modal.md)** `bricks.Modal`  
  Modal container.