# widgetBuild
函数用于创建bricks框架的控件实例。

## 语法
var w = widgetBuild(desc, widget)

## 参数说明
### desc
desc是一个对象类型数据，创建控件参数，必须有"widgettype", "options"属性, 可选属性有"subwidegets"，"binds"

### widget是一个控件实例，用于解析desc中出现的url
## 返回值， null 或新创建的控件实体

## 例子
```
	{
		"widgettype":"Tree",
		"options":{
			"idField":"id",
			"textField":"text",
			"data":[
				{
					"id":1,
					"text":"node1",
					"is_leaf":false,
					"children":[
						{
							"id":11,
							"text":"node11",
							"is_leaf":false,
							"children":[
								{
									"id":112,
									"text":"node.12",
									"is_leaf":false,
									"children":[
										{
											"id":1112,
											"text":"node1112",
											"is_leaf":true
										},
										{
											"id":1113,
											"text":"node113",
											"is_leaf":true
										}
									]
								},
								{
									"id":113,
									"text":"node113",
									"is_leaf":true
								}
							]
						},
						{
							"id":12,
							"text":"node12",
							"is_leaf":true
						},
						{
							"id":13,
							"text":"node13",
							"is_leaf":true
						}
					]
				},
				{
					"id":2,
					"text":"node2",
					"is_leaf":false,
					"children":[
						{
							"id":21,
							"text":"node21",
							"is_leaf":true
						},
						{
							"id":22,
							"text":"node22",
							"is_leaf":true
						},
						{
							"id":23,
							"text":"node23",
							"is_leaf":true
						}
					]
				},
				{
					"id":3,
					"text":"node3",
					"is_leaf":true
				}
			]
		}
	}
```
这是一个树形控件， 运行[这里](https://github.com/bricks/examples/tree.html)
更多的例子请看
[bricks控件例子](https://github.com/yumoqing/bricks/examples)


## widgettype说明
Bricks中的所有控件类型或"urlwidget"
Bricks实现的控件类型在[控件类型清单](widgettypes.md)

## options
对象类型，每个控件有特定的options属性，清参看每个控件的说明

## subwidgets
数组类型，数组中的每个元素必须是一个对象类型数据，与desc作用一样。
参见widgetBuild函数的desc说明

## binds
一个数组，在控件上定义一到多个事件绑定，数组中的每一个元素定义一个绑定，
Bricks支持5种数据绑定
每种绑定类型都支持下述属性
### wid
字符串类型或控件类型，绑定事件的控件，缺省是binds坐在的构造控件。
### event
字符串类型，事件名称， 绑定针对的事件字符串名称

### actiontype
绑定类型，支持“urlwidget", "method", "script", "registerfunction", "event"

### conform
对象类型，确认控件的options，如存在，则此绑定需要用户确认后再执行

### 获取实时数据作为参数
绑定任务获取实时数据作为参数，需要给定以下属性：
* datawidget：字符串或控件类型，获取实时数据的控件
* datamethod：字符串类型，控件的方法，使用params作为参数调用，
获取实时数据的方法
* datascript：字符串类型， js脚本，使用return返回数据
* dataparams：参数
datamethod 优先datascript，从datawidget控件中通过datamethod

### target
字符串或控件类型，目标控件实例，如果是字符串，使用”getWidgetById“函数获得

### urlwidget绑定

urlwidget绑定需要一个options属性和一个mode属性，在此属性中需要
* url：字符串类型， 获取desc数据的url
* mehtod：字符串类型，url调用的方法，缺省”GET“
* params：对象类型，调用的参数
绑定创建的控件添加到target控件中
### method
需要指定target参数和method参数，
* target：类型为字符串或控件类型，
如果是字符串，使用“getWidgetById”函数获取控件实例。
* method：字符串，target实例的方法，
* params：传递给方法的参数
method绑定方法，将事件绑定到target控件的一个方法，并用params传递参数

### script
绑定脚本，此方法将事件绑定到一个脚本，支持以下属性
* script：字符串，脚本正文
* params：对象类型，脚本可以访问params变量来获取参数。

### registerfunction
事件绑定一个注册函数， 参看[RegisterFunction](registerfunction.md)
支持以下属性：
rfname：字符串，已注册的函数名称
params：对象类型，调用注册函数时作为参数传递给注册函数。

### event
绑定事件，需指定target，触发target对象的一个事件
支持以下属性
dispatch_event：需触发的事件名
params：传递给事件的参数，处理函数可以使用evemt.params获得此参数

作为参数调用target实例的方法

