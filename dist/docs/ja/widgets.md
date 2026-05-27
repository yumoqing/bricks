# bricks コンポーネント

bricks は多数の表示コンポーネントを内蔵しており、すべての表示コンポーネントは JsWidget を継承しています。コンテナコンポーネントである Layout も JsWidget を継承しており、その他のコンテナ HBox や VBox は Layout を継承しています。

## 基本コンポーネント

* [Form](form.md)：入力フォームコンポーネント  
options の fields 内の各フィールドの uitype 値に基づいて自動的にフォーム項目を生成します。現在サポートされている uitype 属性のデータ型は以下の通りです：

  - `'str'` → 対応するコンポーネント：`bricks.UiStr`
  - `'hide'` → 対応するコンポーネント：`bricks.UiHide`
  - `'tel'` → 対応するコンポーネント：`bricks.UiTel`
  - `'date'` → 対応するコンポーネント：`bricks.UiDate`
  - `'int'` → 対応するコンポーネント：`bricks.UiInt`
  - `'float'` → 対応するコンポーネント：`bricks.UiFloat`
  - `'check'` → 対応するコンポーネント：`bricks.UiCheck`
  - `'checkbox'` → 対応するコンポーネント：`bricks.UiCheckBox`
  - `'email'` → 対応するコンポーネント：`bricks.UiEmail`
  - `'file'` → 対応するコンポーネント：`bricks.UiFile`
  - `'image'` → 対応するコンポーネント：`bricks.UiImage`
  - `'code'` → 対応するコンポーネント：`bricks.UiCode`
  - `'text'` → 対応するコンポーネント：`bricks.UiText`
  - `'password'` → 対応するコンポーネント：`bricks.UiPassword`
  - `'audio'` → 対応するコンポーネント：`bricks.UiAudio`
  - `'video'` → 対応するコンポーネント：`bricks.UiVideo`

上記の各コンポーネントは、[入力定義](inout.js)に「入力項目コンポーネント」として登録されています。

* [Accordion](accordion.md) `bricks.Accordion`  
アコーディオンコンポーネント。複数のタイトルと内容を持つことができ、内容の展開・折りたたみが可能です。

* [AudioPlayer](audio.md) `bricks.AudioPlayer`  
音声再生コンポーネント。

* [ChartBar](bar.md) `bricks.ChartBar`  
バックエンドデータを棒グラフとして表示します。

* [Button](button.md) `bricks.Button`  
ボタンコンポーネント。

* [Cols](cols.md) `bricks.Cols`  
列方向に並べるコンポーネント。親コンポーネントの幅を動的に埋めます。

* [Conform](conform.md) `bricks.Conform`  
確認ダイアログコンポーネント。ポップアップウィンドウで内容を表示し、ユーザーの確認を求めます。

* [Countdown](countdown.md) `bricks.Countdown`  
カウントダウンタイマー。残り時間を表示します。

* [TimePassed](countdown.md) `bricks.TimePassed`  
経過時間計測コンポーネント。開始からの経過時間を表示します。

* [DataGrid](datagrid.md) `bricks.DataGrid`  
データテーブルコンポーネント。

* [DataRow](datarow.md) `bricks.DataRow`  
データ行コンポーネント。

* [DataViewer](dataviewer.md) `bricks.DataViewer`  
データ表示コンポーネント。DynamicColumn コンポーネントの派生クラスです。

* [DOCXviewer](docxviewer.md) `bricks.DOCXviewer`  
DOCX ファイル表示コンポーネント。

* [EXCELviewer](docxviewer.md) `bricks.EXCELviewer`  
Excel ファイル表示コンポーネント。

* [PDFviewer](accordion.md) `bricks.PDFviewer`  
PDF 表示コンポーネント。

* [DynamicAccordion](dynamicaccordion.md) `bricks.DynamicAccordion`  
動的アコーディオンコンポーネント。

* [IconBar](floaticonbar.md) `bricks.IconBar`  
アイコンバー（アイコンの横並び）コンポーネント。

* [IconTextBar](floaticonbar.md) `bricks.IconTextBar`  
アイコンとテキストを組み合わせたバー形式のコンポーネント。

* [FloatIconBar](floaticonbar.md) `bricks.FloatIconBar`  
フローティングアイコンバー。通常は識別アイコンのみ表示され、クリックするとアイコンバーを展開します。

* [FloatIconTextBar](floaticonbar.md) `bricks.FloatIconTextBar`  
フローティングアイコンテキストバー。通常は識別アイコンのみ表示され、クリックするとアイコンとテキストのバーを展開します。

* [Html](html.md) `bricks.Html`  
HTML コンテンツを直接表示するコンポーネント。

* [IconbarPage](iconbarpage.md) `bricks.IconbarPage`  
アイコンバー付きページコンポーネント。異なるアイコンをクリックすることで対応するコンテンツを表示します。

* [NewWindow](iframe.md) `bricks.NewWindow`  
新しいブラウザタブまたはウィンドウを開き、指定された URL の内容を表示します。

* [Iframe](iframe.md) `bricks.Iframe`  
外部サイトのコンテンツを表示するための Iframe コンポーネント。

* [Image](image.md) `bricks.Image`  
画像表示コンポーネント。

* [StatedIcon](image.md) `bricks.StatedIcon`  
複数の状態を持つアイコン。クリックで状態が切り替わり、状態変更イベントを発行します。

* [Icon](image.md) `bricks.Icon`  
複数の画像フォーマット（URL）に対応したアイコンコンポーネント。

* [BlankIcon](image.md) `bricks.BlankIcon`  
空白アイコンのプレースホルダーコンポーネント。

* [ChartLine](line.md) `bricks.ChartLine`  
折れ線グラフコンポーネント。

* [LlmIO](llm.md) `bricks.LlmIO`  
LLM 入出力統合コンポーネント。

* [LlmOut](llm.md) `bricks.LlmOut`  
LLM 出力専用コンポーネント。

* [MarkdownViewer](markdownviewer.md) `bricks.MarkdownViewer`  
Markdown ファイルを表示するコンポーネント。

* [MdWidget](markdownviewer.md) `bricks.MdWidget`  
Markdown 形式のコンテンツを表示するウィジェット。

* [Menu](menu.md) `bricks.Menu`  
メニュー構造を持つコンポーネント。

* [Message](message.md) `bricks.Message`  
メッセージ表示コンポーネント。

* [Error](message.md) `bricks.Error`  
エラーメッセージ表示コンポーネント。

* [MultipleStateImage](multiple_state_image.md) `bricks.MultipleStateImage`  
複数の状態を持つ画像コンポーネント。

* [PeriodDays](period.md) `bricks.PeriodDays`  
期間選択コンポーネント。期間の開始日を自動計算します。

* [ChartPie](pie.md) `bricks.ChartPie`  
円グラフコンポーネント（echarts 基盤）。

* [ProgressBar](progressbar.md) `bricks.ProgressBar`  
プログレスバー表示コンポーネント。

* [SysCamera](recorder.md) `bricks.SysCamera`  
写真撮影機能を持つカメラコンポーネント。

* [WidgetRecorder](recorder.md) `bricks.WidgetRecorder`  
ブラウザ上で再生される動画を録画するコンポーネント。

* [SysAudioRecorder](recorder.md) `bricks.SysAudioRecorder`  
ブラウザ内で音声を録音するコンポーネント。

* [SysVideoRecorder](recorder.md) `bricks.SysVideoRecorder`  
ブラウザ内で動画を録画するコンポーネント。

* [Running](running.md) `bricks.Running`  
実行中アイコンコンポーネント。モーダル形式で「処理中」を表示し、関連コンポーネントの操作を一時的に無効化します。処理完了後に dismiss する必要があります。

* [Splitter](splitter.md) `bricks.Splitter`  
分割ライン（水平または垂直）を表示するコンポーネント。

* [Svg](svg.md) `bricks.Svg`  
SVG アイコンコンポーネント。

* [StatedSvg](svg.md) `bricks.StatedSvg`  
状態付き SVG アイコン。状態に応じて異なるアイコンを表示します。

* [MultipleStateIcon](svg.md) `bricks.MultipleStateIcon`  
複数の状態を持つアイコンコンポーネント。

* [TabPanel](tab.md) `bricks.TabPanel`  
タブ形式のコンポーネント。

* [Tabular](tabular.md) `bricks.Tabular`  
データリスト形式のデータ管理コンポーネント。データの表示、追加、編集、削除をサポートします。

[xls2ddl](https://git.opencomputing.cn/yumoqing/xls2ddl) ツールを使用すると、データベースのテーブル構造から自動的に Tabular コンポーネントおよび関連するデータ操作 dspy を生成できます。

* [Toolbar](toolbar.md) `bricks.Toolbar`  
ツールバーコンポーネント。

* [Tree](tree.md) `bricks.Tree`  
ツリーコンポーネント。

* [VadText](vadtext.md) `bricks.VadText`  
音声を自動検出し、サーバーに送信するコンポーネント。

* [VideoPlayer](videoplayer.md) `bricks.VideoPlayer`  
動画再生コンポーネント。ブラウザ標準のフォーマットに加え、m3u8 ストリーミングおよび Dash ストリーミングもサポートします。bricks は `3parties` ディレクトリに必要な hls および dash パッケージを含んでいます。

* [Video](videoplayer.md) `bricks.VideoPlayer`  
VideoPlayer と同じ動画再生コンポーネント。

* [WebSocket](websocket.md) `bricks.WebSocket`  
WebSocket 接続をサポートします。

* [WebTTS](webspeech.js.md) `bricks.WebTTS`  
未完成コンポーネント。ブラウザ内蔵のテキスト読み上げ（TTS）機能を利用します。

* [WebASR](webspeech.js.md) `bricks.WebASR`  
未完成コンポーネント。ブラウザ内蔵の音声認識（ASR）機能を利用します。

* [Tooltip](widget.md) `bricks.Tooltip`  
ツールチップコンポーネント。直接作成せず、コンポーネントに `"tip": "ヒント文字列"` の属性を追加することで適用されます。

* [Text](widget.md) `bricks.Text`  
テキスト表示コンポーネント。

* [Title1](widget.md) `bricks.Title1`  
見出しレベル1。

* [Title2](widget.md) `bricks.Title2`  
見出しレベル2。

* [Title3](widget.md) `bricks.Title3`  
見出しレベル3。

* [Title4](widget.md) `bricks.Title4`  
見出しレベル4。

* [Title5](widget.md) `bricks.Title5`  
見出しレベル5。

* [Title6](widget.md) `bricks.Title6`  
見出しレベル6。

* [Wterm](wterm.md) `bricks.Wterm`  
xterm.js を bricks に組み込んだ実装。

## コンテナクラスコンポーネント

* [VScrollPanel](accordion.md) `bricks.VScrollPanel`  
垂直スクロールコンテナ。固定高さ、または親コンテナ全体を占める高さを設定する必要があります。

* [HScrollPanel](accordion.md) `bricks.HScrollPanel`  
水平スクロールコンテナ。固定幅、または親コンテナ全体を占める幅を設定する必要があります。

* [Popup](accordion.md) `bricks.Popup`  
ポップアップコンテナ。すべてのコンポーネントの最前面に表示されます。

* [PopupWindow](accordion.md) `bricks.PopupWindow`  
ポップアップウィンドウ。すべてのコンポーネントの最前面に表示されます。

* [HBox](accordion.md) `bricks.HBox`  
水平レイアウトコンテナ。すべての子コンポーネントを横方向に配置します。

* [VBox](accordion.md) `bricks.VBox`  
垂直レイアウトコンテナ。すべての子コンポーネントを縦方向に配置します。

* [Filler](accordion.md) `bricks.Filler`  
親コンテナ内の残りスペースを埋めるコンポーネント。複数の Filler がある場合、残りスペースを均等に分配します。Filler 内に子コンポーネントを追加することも可能です。

* [DynamicColumn](dynamiccolumn.md) `bricks.DynamicColumn`  
子コンポーネントに固定幅を設定し、左から右へ、上から下へと動的に配置します。

* [ResponsableBox](layout.md) `bricks.ResponsableBox`  
レスポンシブコンテナ。幅が大きいときは子コンポーネントを水平に並べ、高さが大きいときは垂直に並べます。サイズ変更に応じて自動的にレイアウトを調整します。

* [Modal](modal.md) `bricks.Modal`  
モーダルコンテナ。