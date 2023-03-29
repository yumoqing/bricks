# 创建控件的Json文件格式说明
Bricks在服务器端使用Json文件格式存储控件描述文件，前端获得json文件后转化为json对象，并用词json对象调用widgetBuild函数创建Bricks控件。

控件描述json文件必须含有“widgettype” 和”options“两个属性。“subwidgets”属性用来定义此控件包含的子控件。“binds”用于定义此控件或其子控件的事件处理


## widgettype说明
widgettype是一个字符串属性。其值为Bricks中的所有控件类型或"urlwidget"
可用的控件类型可以在[控件类型清单](widgettypes.md)中查找

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
字符串或控件实例，目标控件实例，如果是字符串，使用”getWidgetById“函数获得目标控件实例

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

