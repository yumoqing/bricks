# bricks的事件处理
bricks的事件处理是在控件描述文件的binds区域中添加事件处理说明来实现的
## bricks支持的事件处理类型
* urlwidget
* method
* script
* registerfunction
* event

例外还支持一种混合型

* actions

在事件处理定义中使用"actiontype"属性来定义事件处理类型

## 事件处理定义数据要素

所有事件处理类型都有的数据要素有
### wid
事件发起方id，关于wid规则请查看[控件id](widgetid.md)
### event
支持控件的html原生事件以及控件类中定义的事件，或者是event事件处理类型中dispatch_event属性中定义的事件

### actiontype
指定事件处理类型，支持“urlwidget", "method", "script", "registerfunction", "event"， 或者“actions”混合型

### conform
对象类型，确认控件的options，如存在，则此绑定需要用户确认后再执行

### datawidget
给事件添加动态参数时定义获取动态参数的控件的id，关于datawidget规则请查看[控件id](widgetid.md)

如果不需要使用动态参数，那么datawidget, datamethod, datascript, dataparams这几个属性可以不设置。

### datamethod
获取动态参数的方法
### datascript
获取动态参数的脚本
### dataparams
获取动态参数时需给定的参数, 可选，对象类型，k,v形式给定参数

### popup_options
当target为“Popup“或“PopupWindow”时，定义Popup或PopupWindow的参数

#### dismiss_events
字符串数组，每个字符串定义一个Popup, PopupWindow的子控件的事件，这些事件发生时将导致Popup, PopupWindow关闭

#### eventpos
Popup, PopupWindow窗体移动到鼠标位置

### 获取动态参数说明
绑定任务获取实时数据作为参数，需要给定以下属性：
* datawidget：字符串或控件类型，获取实时数据的控件
* datamethod：字符串类型，控件的方法，使用params作为参数调用，
获取实时数据的方法
* datascript：字符串类型， js脚本，使用return返回数据
* dataparams：参数
datamethod 优先datascript，从datawidget控件中通过datamethod

### target
支持一下形式的target定义：
* 目标控件实例对象
* 字符串，且等于“Popup“
* 字符串，且等于”PopupWindow“
* 其他字符串（控件对象的id）
当actiontype为"urlwidget"时，target应该是一个容器控件，所生成的控件将插入或替代到“target”所代表的对象中，如果actiontype是其他类型,则在此对象中执行方法，脚本，定义函数，或定义事件




### conform
如果一个事件处理需要用户确认，可以在事件处理中指定一个conform属性来引发，当此事件发生时，会弹出一个确认窗口，用户确认后才会处理此事件，否则不处理

不同的事件处理方法也有部分不同的事件处理属性，一下分别说明：

### urlwidget方法
urlwidget事件处理方法是从后台获取一个控件描述文件，动态生成bricks控件，并将控件添加（添加，添加或替换）到事件处理指定的控件中。

urlwidget绑定需要一个options属性和一个mode属性，在此属性中需要
* url：字符串类型， 获取desc数据的url
* mehtod：字符串类型，url调用的方法，缺省”GET“
* params：对象类型，调用的参数, 从datawidget获取的数据影响此属性
绑定创建的控件添加到target控件中

例子
```
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
在上述例子中，我们使用了一个竖向排列的容器（VBox），并在此容器中添加了两个字控件，分别是一个横向排列的容器HBox，和一个填充器（Filler）
并在横向排列的子控件中添加了3个按钮控件, 每个Button定义了id， 分别是replace，insert，和append，在主控件（VBox）的binds中分别定义了三个事件处理，分别对应于3个Button的click事件，演示了三种子控件在target控件中插入的模式（替换所有子控件，插入在已有子控件之前，添加到已有子控件之后）

### method方法
需要指定target参数和method参数，
* target：类型为字符串或控件类型，
如果是字符串，使用“getWidgetById”函数获取控件实例。
* method：字符串，target实例的方法，
* params：传递给方法的参数
method绑定方法，将事件绑定到target控件的一个方法，并用params传递参数

例子
```
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
上述例子中，三个Button分别驱动app中textsize_smaller()，textsize_bigger()来改变bricks字符大小，从而影响到text_1控件的显示大小

### script方法
绑定脚本，此方法将事件绑定到一个脚本，支持以下属性
* script：字符串，脚本正文
* params：对象类型，脚本可以访问params变量来获取参数。
脚本中可以使用以下变量：
* this 事件处理中target对应的控件实例
* params：参数对象，datawidget获得的数据会添加到params中

例子
```
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
在上述例子中定义了使用“script”事件处理方法来处理Button的“click事件”， 在click后在控制台上把事件传过来的参数显示出来

### registerfunction方法
事件绑定一个注册函数， 参看[RegisterFunction](registerfunction.md)
支持以下属性：
* rfname：字符串，已注册的函数名称
* params：对象类型，调用注册函数时作为参数传递给注册函数。

```
<link rel="stylesheet" href="http://localhost:80/bricks/css/bricks.css">

<!-- support IE8 (for Video.js versions prior to v7) -->
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
}	};
	const app = new bricks.App(opts);
	app.run();
</script>
</body>
</html>
```
在上述例子中，使用bricks.RF注册了一个setText函数， 并在主控件的binds区域定义了当changetext按钮点击后调用注册函数“setText”来处理

### event方法
绑定事件，需指定target，触发target对象的一个事件
支持以下属性
dispatch_event：需触发的事件名
params：传递给事件的参数，处理函数可以使用evemt.params获得此参数

```
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
上述例子中，在主控件的binds区域定义了btn1的按钮点击后使用event处理类型来处理btn1的click事件，即转而触发“txt1”正文控件的“gpc”事件，并定义了当”txt1“正文控件在gpc事件发生后使用script事件处理方法alert一个消息

## 定义需要确认的事件处理
有时候我们需要客户确认后在处理事件，如果用户不确认，则放弃处理事件，比如在删除数据时我们通常需要用户确认一下
例子
```
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
				"message":"测试事件处理前的用户确认功能，确认码？"
			},
			"target":"self",
			"script":"alert('确认过眼神!')"
		}
	]
}
```
上述例子中定义了Button的click事件使用script事件处理方式来处理，但是在处理前需要显示信息，让用户确认是否继续，如果用户放弃则不处理事件，确认后正常的处理事件。

