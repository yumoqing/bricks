# Event Handling in bricks Widgets

Event handling in bricks widgets is implemented by adding event handler data to the `binds` property within the widget's description data.

## Supported Event Handling Types in bricks

* urlwidget
* method
* script
* registerfunction
* event

Additionally, a hybrid type is also supported:

* actions

The `"actiontype"` attribute is used in the event definition to specify the event handling type.

## Elements of an Event Handling Definition

The following elements are common to all event handling types:

### wid
The ID of the widget that triggers the event. `"self"` refers to the widget where the `binds` property is defined. The ID supports the format `"a.b.c"`, meaning: starting from the current position, locate the widget with ID `a`, then from that position find the widget with ID `b`, and finally from there locate the widget with ID `c`.

#### Special Reserved Widget IDs

* `self` — the widget containing the `binds` property  
* `root` — the first widget under `<body>`  
* `body/app` — `bricks.app`  
* `-x` — search upward from the current position for an ancestor widget with ID `x`

### event
Supports native HTML events of the widget, events defined in the widget class, or events defined in the `dispatch_event` attribute of an "event"-type handler.

### actiontype
Specifies the event handling type. Valid values: `"urlwidget"`, `"method"`, `"script"`, `"registerfunction"`, `"event"`, or the hybrid `"actions"`.

### conform
An object-type field. If present, this binding will prompt the user for confirmation before execution. It defines options for the confirmation dialog.

### datawidget
The ID of the widget from which dynamic parameters are retrieved when passing dynamic arguments to the event. For rules on `datawidget`, see [Widget ID](widgetid.md).

If dynamic parameters are not needed, the following attributes can be omitted: `datawidget`, `datamethod`, `datascript`, `dataparams`.

### datamethod
The method used to retrieve dynamic parameters.

### datascript
A script (JavaScript) used to retrieve dynamic parameters. Must use `return` to return the value.

### dataparams
Optional parameters passed when retrieving dynamic data. This is an object in key-value (k,v) format.

### popup_options
Defines options for Popup or PopupWindow when `target` is `"Popup"` or `"PopupWindow"`.

#### dismiss_events
An array of strings. Each string defines an event from a child widget of the Popup/PopupWindow. When any of these events occur, the Popup/PopupWindow will close.

#### eventpos
Moves the Popup/PopupWindow to the mouse cursor position.

### Dynamic Parameter Retrieval Explanation

To bind an action that uses real-time data as parameters, the following attributes must be provided:

* `datawidget`: string or widget type — the widget from which real-time data is obtained  
* `datamethod`: string — the method called on the widget (with `params` as input) to get real-time data  
* `datascript`: string — JavaScript code that returns data via `return`  
* `dataparams`: optional parameters  

`datamethod` takes precedence over `datascript`. Data is retrieved from the `datawidget` using `datamethod`.

### target
Specifies the target widget for the event handling. Supported formats:

* A widget instance object  
* String `"Popup"`  
* String `"PopupWindow"`  
* Any other string (interpreted as a widget ID)  

When `actiontype` is `"urlwidget"`, `target` should be a container widget. The dynamically generated widget will be inserted into or replace content within the target. For other `actiontype` values, the specified method, script, function, or event will be executed on the target object.

### conform
If an event requires user confirmation, a `conform` property can be specified in the event definition. When the event occurs, a confirmation dialog appears. The event proceeds only if the user confirms; otherwise, it is canceled.

Different event handling methods have additional specific properties, described below.

---

### urlwidget Method

The `urlwidget` method retrieves a widget description file from the backend, dynamically creates a bricks widget, and inserts or replaces it within the `target` widget specified in the event.

Required attributes:
* `url`: string — URL to fetch the widget description data  
* `method`: string — HTTP method (default is `"GET"`)  
* `params`: object — parameters passed during the request. Dynamic data from `datawidget` may affect this  

The newly created widget is added to the `target` widget.

**Example**
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

In this example, a vertical container (`VBox`) contains two sub-widgets: a horizontal container (`HBox`) and a filler (`Filler`). The `HBox` holds three buttons with IDs `replace`, `insert`, and `append`. In the main widget's `binds`, three event handlers are defined for the `click` events of these buttons, demonstrating three modes of inserting sub-widgets into the target (`replace` all children, `insert` before existing ones, `append` after existing ones).

---

### method Method

Requires `target` and `method` attributes:

* `target`: string or widget object. If a string, resolved via `getWidgetById()`  
* `method`: string — the method name to invoke on the target  
* `params`: parameters passed to the method  

This binds the event to a method call on the target widget with given parameters.

**Example**
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

In this example, the three buttons trigger `textsize_smaller()` and `textsize_bigger()` methods on the `app`, adjusting the global text size and affecting how `text_1` is displayed.

---

### script Method

Binds an event to a script. Supported attributes:

* `script`: string — the JavaScript code body  
* `params`: object — accessible within the script as the `params` variable  

Variables available in the script:
* `this` — the widget instance corresponding to `target`  
* `params` — the parameter object; data from `datawidget` is merged into it  

**Example**
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

This example uses the `script` handler to process the Button's `click` event, logging `this`, `params`, and `event` to the console.

---

### registerfunction Method

Binds an event to a registered function. See [RegisterFunction](registerfunction.md). Supported attributes:

* `rfname`: string — the name of the registered function  
* `params`: object — parameters passed when calling the registered function  

**Example**
```html
<link rel="stylesheet" href="http://localhost:80/bricks/css/bricks.css">

<!-- Support IE8 (for Video.js versions prior to v7) -->
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
	}
};
const app = new bricks.App(opts);
app.run();
</script>
</body>
</html>
```

In this example, a function named `setText` is registered using `bricks.RF.register()`. In the main widget’s `binds`, clicking the `changetext` button invokes this registered function.

---

### event Method

Binds an event to dispatch another event on a target widget.

Supported attributes:
* `dispatch_event`: string — the name of the event to trigger  
* `params`: object — parameters passed with the dispatched event (accessible via `event.params` in the handler)

**Example**
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

In this example, clicking `btn1` triggers the `gpc` event on the `txt1` widget. A second binding listens for the `gpc` event on `txt1` and executes a script to display an alert.

---

## Defining Event Handlers Requiring Confirmation

Sometimes, an action should only proceed after user confirmation (e.g., deleting data). If the user cancels, the event is not processed.

**Example**
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
				"message":"Test user confirmation before event handling. Confirm code?"
			},
			"target":"self",
			"script":"alert('Confirmed eye contact!')"
		}
	]
}
```

This example defines a `click` event on a Button handled by a script, but only after showing a confirmation dialog. If the user cancels, the script does not run; if confirmed, it proceeds normally.