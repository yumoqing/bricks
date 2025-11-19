# bricksコントロールのイベント処理

bricksコントロールのイベント処理は、コントロール記述データの`binds`プロパティにイベント処理データを追加することで実現されます。

## bricksがサポートするイベント処理タイプ

* urlwidget
* method
* script
* registerfunction
* event

さらに、以下の複合型もサポートしています。

* actions

イベント処理の定義では、「actiontype」属性を使用してイベント処理のタイプを指定します。

## イベント処理定義のデータ要素

すべてのイベント処理タイプに共通するデータ要素：

### wid  
イベント発生元のコントロールID。「self」は`binds`属性を持つコントロール自身を指します。IDには「a.b.c」形式が使用可能で、現在位置からIDがaのコントロールを探し、次にaからIDがbのコントロールを探し、さらにbからIDがcのコントロールを探すという意味になります。

#### 特殊な約束されたコントロールID

* self -- `binds`属性を持つコントロール自身
* root -- `<body>`直下の最初のコントロール
* body/app -- bricks.app
* -x -- 現在位置から上位（祖先）にIDがxのコントロールを探す

### event  
コントロールのHTMLネイティブイベント、またはコントロールクラス内で定義されたイベント、あるいはeventイベント処理タイプの`dispatch_event`属性で定義されたイベントをサポートします。

### actiontype  
イベント処理のタイプを指定します。「urlwidget」「method」「script」「registerfunction」「event」、または複合型の「actions」をサポートしています。

### conform  
オブジェクト型。イベントバインディングの実行前にユーザー確認を必要とする場合に、`options`を含むことで確認ダイアログを表示できます。

### datawidget  
イベントに動的パラメータを追加する場合、その動的パラメータを取得するコントロールのIDを指定します。`datawidget`のルールについては[コントロールID](widgetid.md)をご覧ください。

動的パラメータを使用しない場合は、`datawidget`、`datamethod`、`datascript`、`dataparams`の各属性を設定しなくても構いません。

### datamethod  
動的パラメータを取得するためのメソッド

### datascript  
動的パラメータを取得するためのスクリプト

### dataparams  
動的パラメータ取得時に渡すパラメータ（オプション）。オブジェクト型で、キーと値のペアで指定します。

### popup_options  
`target`が「Popup」または「PopupWindow」の場合、PopupやPopupWindowの表示パラメータを定義します。

#### dismiss_events  
文字列の配列。各文字列はPopupまたはPopupWindow内の子コントロールのイベントを表し、これらのイベントが発生したときにPopupまたはPopupWindowを閉じます。

#### eventpos  
PopupまたはPopupWindowをマウスの位置に移動させます。

### 動的パラメータの取得について  
バインディングタスクがリアルタイムデータをパラメータとして取得するには、以下の属性を指定する必要があります：

* datawidget：文字列またはコントロール型。リアルタイムデータを取得するコントロール。
* datamethod：文字列型。コントロールのメソッド。`params`を引数として呼び出し、リアルタイムデータを取得する。
* datascript：文字列型。JavaScriptスクリプト。`return`を使ってデータを返す。
* dataparams：パラメータ（オプション）

`datamethod`は`datascript`よりも優先され、`datawidget`コントロールから`datamethod`を通じてデータを取得します。

### target  
イベント処理の対象となるコントロール。以下の形式の`target`定義をサポートします：

* 対象コントロールのインスタンスオブジェクト
* 文字列で、「Popup」と等しい場合
* 文字列で、「PopupWindow」と等しい場合
* その他（コントロールオブジェクトのID）

`actiontype`が「urlwidget」の場合は、`target`はコンテナコントロールである必要があります。生成されたコントロールは`target`で指定されたオブジェクトに挿入または置き換えられます。それ以外の`actiontype`の場合は、このオブジェクト上でメソッド、スクリプト、関数、イベントを実行します。

### conform  
イベント処理をユーザーの確認後に実行したい場合、イベント処理に`conform`属性を指定できます。イベント発生時に確認ウィンドウが表示され、ユーザーが確認した場合のみ処理が行われ、キャンセルされた場合は処理されません。

異なるイベント処理方法には一部異なる属性があります。以下にそれぞれ説明します。

---

### urlwidget メソッド  
urlwidgetイベント処理は、バックエンドからコントロール記述ファイルを取得し、動的にbricksコントロールを生成して、イベントの`target`で指定されたコントロール内に（挿入・置換・追加）するものです。

urlwidgetバインディングには`options`属性と`mode`属性が必要です。以下を含みます：

* url：文字列型。記述データを取得するURL
* method：文字列型。URL呼び出しのメソッド。省略時は「GET」
* params：オブジェクト型。呼び出し時のパラメータ。`datawidget`から取得したデータがこの属性に影響します。

生成されたコントロールは`target`コントロールに追加されます。

**例**

```json
{
	"widgettype":"VBox",
	"options":{
		"width":"100%",
		"height":"100%"
	},
	"subwidgets":[
		{
			"widgettype":"HBox",
			"options":{
				"height":"40px"
			},
			"subwidgets":[
				{
					"id":"replace",
					"widgettype":"Button",
					"options":{
						"width":"80px",
						"i18n":true,
						"label":"replace mode"
					}  
				},
				{
					"id":"insert",
					"widgettype":"Button",
					"options":{
						"width":"80px",
						"i18n":true,
						"label":"insert mode"
					}
				},
				{
					"id":"append",
					"widgettype":"Button",
					"options":{
						"width":"80px",
						"i18n":true,
						"label":"append mode"
					}
				}
			]
		},
		{
			"id":"main",
			"widgettype":"Filler"
		}
	],
	"binds":[
		{
			"wid":"replace",
			"event":"click",
			"actiontype":"urlwidget",
			"target":"main",
			"options":{
				"url":"{{entire_url('replace_text.ui')}}",
				"params":{
					"text":"Insert before"
				}
			}
		},
		{
			"wid":"insert",
			"event":"click",
			"actiontype":"urlwidget",
			"target":"main",
			"options":{
				"url":"{{entire_url('insert_text.ui')}}",
				"params":{
					"text":"Insert before"
				}
			},
			"mode":"insert"
		},
		{
			"wid":"append",
			"event":"click",
			"actiontype":"urlwidget",
			"target":"main",
			"options":{
				"url":"{{entire_url('subtext.ui')}}",
				"params":{
					"text":"Append After"
				}
			},
			"mode":"append"
		}
	]
}
```

上記の例では、縦方向に配置するコンテナ（VBox）を作成し、その中に横方向のコンテナ（HBox）とフィラー（Filler）を配置しています。HBox内には「replace」「insert」「append」というIDを持つ3つのボタンを配置しています。メインコントロール（VBox）の`binds`では、3つのボタンの`click`イベントに対応する3つのイベント処理を定義しており、`target`コントロールへの子コントロール挿入モード（全置換、既存の前へ挿入、既存の後ろに追加）をそれぞれ示しています。

---

### method メソッド  
`target`パラメータと`method`パラメータを指定する必要があります。

* target：文字列またはコントロール型。文字列の場合は`getWidgetById`関数でコントロールインスタンスを取得します。
* method：文字列。`target`インスタンスのメソッド名。
* params：メソッドに渡すパラメータ。

このバインディングにより、イベントが`target`コントロールの特定メソッドにバインドされ、`params`でパラメータを渡します。

**例**

```json
{
	"widgettype":"VBox",
	"options":{
		"width":"100%",
		"height":"100%"
	},
	"subwidgets":[
		{
			"widgettype":"HBox",
			"options":{
				"height":"40px"
			},
			"subwidgets":[
				{
					"id":"changetext",
					"widgettype":"Button",
					"options":{
						"dynsize":false,
						"width":"80px",
						"i18n":true,
						"label":"Change text"
					}  
				},
				{
					"id":"smaller",
					"widgettype":"Button",
					"options":{
						"dynsize":false,
						"width":"80px",
						"i18n":true,
						"label":"Small size"
					}  
				},
				{
					"id":"larger",
					"widgettype":"Button",
					"options":{
						"dynsize":false,
						"width":"80px",
						"i18n":true,
						"label":"larger size"
					}
				}
			]
		},
		{
			"widgettype":"Filler",
			"options":{},
			"subwidgets":[
				{
					"id":"text_1",
					"widgettype":"Text",
					"options":{
						"dynsize":true,
						"text":"original text"
					}
				}
			]
		}
	],
	"binds":[
		{
			"wid":"changetext",
			"event":"click",
			"actiontype":"method",
			"target":"text_1",
			"params":"new text",
			"method":"set_text"
		},
		{
			"wid":"smaller",
			"event":"click",
			"actiontype":"method",
			"target":"app",
			"method":"textsize_smaller"
		},
		{
			"wid":"larger",
			"event":"click",
			"actiontype":"method",
			"target":"app",
			"method":"textsize_bigger"
		}
	]
}
```

上記の例では、3つのボタンがそれぞれ`app`の`textsize_smaller()`と`textsize_bigger()`を呼び出して、bricks内の文字サイズを変更し、`text_1`コントロールの表示サイズに影響を与えています。

---

### script メソッド  
スクリプトにイベントをバインドします。以下の属性をサポートします。

* script：文字列。スクリプト本体。
* params：オブジェクト型。スクリプトは`params`変数を使ってパラメータを取得できます。

スクリプト内で使用可能な変数：

* this：イベント処理における`target`に対応するコントロールインスタンス
* params：パラメータオブジェクト。`datawidget`で取得したデータは`params`に追加されます。

**例**

```json
{
	"id":"insert",
	"widgettype":"Button",
	"options":{
		"width":"80px",
		"i18n":true,
		"label":"click me"
	},
	"binds":[
		{
			"wid":"self",
			"event":"click",
			"actiontype":"script",
			"target":"self",
			"script":"console.log(this, params, event);"
		}
	]
}
```

上記の例では、「script」イベント処理を使ってボタンの`click`イベントを処理し、クリック後にコンソールにイベントパラメータを出力しています。

---

### registerfunction メソッド  
イベントを登録済み関数にバインドします。詳細は[RegisterFunction](registerfunction.md)を参照してください。

以下の属性をサポートします：

* rfname：文字列。登録済みの関数名。
* params：オブジェクト型。登録関数呼び出し時に渡されるパラメータ。

```html
<link rel="stylesheet" href="http://localhost:80/bricks/css/bricks.css">

<!-- IE8対応（Video.js v7以前） -->
<script src="http://localhost:80/bricks/3parties/videojs-ie8.min.js"></script>
</head>
  <body>
  <script src="http://localhost:80/bricks/3parties/marked.min.js"></script>
  <script src="http://localhost:80/bricks/3parties/xterm.js"></script>
  <script src="http://localhost:80/bricks/3parties/video.min.js"></script>
  <script src="http://localhost:80/bricks/3parties/recorder.wav.min.js"></script>
<!---  <script src="http://localhost:80/bricks/3parties/videojs-contrib-hls.min.js"></script> --->
  <script src="http://localhost:80/bricks/bricks.js"></script>
	<script>
		/*
		if (bricks.is_mobile()){
			alert('wh=' + window.innerWidth + ':' + window.innerHeight);
		}
		*/
		var myfunc = function(params){
			this.set_text(params.text);
		}
		bricks.RF.register('setText', myfunc);
		const opts = {
			"widget": {
	"widgettype":"VBox",
	"options":{
		"width":"100%",
		"height":"100%"
	},
	"subwidgets":[
		{
			"widgettype":"HBox",
			"options":{
				"height":"40px"
			},
			"subwidgets":[
				{
					"id":"changetext",
					"widgettype":"Button",
					"options":{
						"dynsize":false,
						"width":"80px",
						"i18n":true,
						"label":"Change text"
					}  
				},
				{
					"id":"smaller",
					"widgettype":"Button",
					"options":{
						"dynsize":false,
						"width":"80px",
						"i18n":true,
						"label":"Small size"
					}  
				},
				{
					"id":"larger",
					"widgettype":"Button",
					"options":{
						"dynsize":false,
						"width":"80px",
						"i18n":true,
						"label":"larger size"
					}
				}
			]
		},
		{
			"widgettype":"Filler",
			"options":{},
			"subwidgets":[
				{
					"id":"text_1",
					"widgettype":"Text",
					"options":{
						"dynsize":true,
						"text":"original text"
					}
				}
			]
		}
	],
	"binds":[
		{
			"wid":"changetext",
			"event":"click",
			"actiontype":"registerfunction",
			"target":"text_1",
			"params":{
				"text":"new text"
			},
			"rfname":"setText"
		},
		{
			"wid":"smaller",
			"event":"click",
			"actiontype":"method",
			"target":"app",
			"method":"textsize_smaller"
		},
		{
			"wid":"larger",
			"event":"click",
			"actiontype":"method",
			"target":"app",
			"method":"textsize_bigger"
		}
	]
};	};
		const app = new bricks.App(opts);
		app.run();
</script>
</body>
</html>
```

上記の例では、`bricks.RF`を使って`setText`関数を登録し、メインコントロールの`binds`領域で`changetext`ボタンのクリック時に登録関数`setText`を呼び出すように定義しています。

---

### event メソッド  
イベントをバインドし、`target`オブジェクトのイベントをトリガーします。

以下の属性をサポートします：

* dispatch_event：トリガーするイベント名
* params：イベントに渡すパラメータ。イベントハンドラは`event.params`でこの値を取得できます。

**例**

```json
{
	"widgettype":"VBox",
	"options":{},
	"subwidgets":[
		{
			"id":"btn1",
			"widgettype":"Button",
			"options":{
				"label":"press me"
			}
		},
		{
			"id":"txt1",
			"widgettype":"Text",
			"options":{
				"otext":"I will dispatch a event when btn1 pressed",
				"i18n":true
			}
		}
	],
	"binds":[
		{
			"wid":"btn1",
			"event":"click",
			"actiontype":"event",
			"target":"txt1",
			"dispatch_event":"gpc"
		},
		{
			"wid":"txt1",
			"event":"gpc",
			"actiontype":"script",
			"target":"self",
			"script":"alert('yield');"
		}
	]
}
```

上記の例では、メインコントロールの`binds`領域で、`btn1`のクリックイベントを`event`タイプで処理し、`txt1`テキストコントロールの`gpc`イベントを発火させるように定義しています。また、`txt1`の`gpc`イベント発生時に`script`タイプでメッセージをアラート表示する処理も定義しています。

---

## 確認が必要なイベント処理の定義

場合によっては、ユーザーの確認を得てからイベントを処理したいことがあります。ユーザーがキャンセルした場合は処理を行わないようにします。たとえば、データ削除時などに確認を求めるケースです。

**例**

```json
{
	"id":"insert",
	"widgettype":"Button",
	"options":{
		"width":"80px",
		"i18n":true,
		"label":"click me"
	},
	"binds":[
		{
			"wid":"self",
			"event":"click",
			"actiontype":"script",
			"conform":{
				"title":"conformtest",
				"message":"テストイベント処理前のユーザー確認機能、確認コード？"
			},
			"target":"self",
			"script":"alert('確認過眼神!')"
		}
	]
}
```

上記の例では、ボタンの`click`イベントを`script`タイプで処理するように定義していますが、処理前に確認メッセージを表示し、ユーザーが承認した場合のみ処理を実行し、キャンセルした場合は何もしません。