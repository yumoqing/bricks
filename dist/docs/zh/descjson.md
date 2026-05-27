# 应用开发源码.ui后缀文件规格说明
Bricks在服务器端使用Json文件格式的.ui后缀文件存储控件描述文件，前端获得.ui文件的json后转化为json对象，并用此json对象调用widgetBuild函数创建Bricks控件。

.ui文件支持jinja2模版，所以可以动态生成前端控件属性和数据

控件描述数据规格要求
```
{
	"id"			# 可选，缺少动态生成一个uuid类型的id
	"widgettype" 	# widgettype是一个字符串属性。其值为Bricks中的注册的控件名称或"urlwidget" "options"		# 对象类型，给定控件实例化的初始化参数，参看每个控件的说明
	"subwidgets"	# 数组类型，只有容器控件需要，数组中的每个元素为子控件的控件描述数据
	"binds"			# 定义事件处理，参看后面的事件处理说明
}
```
控件描述json文件必须含有“widgettype” 和”options“两个属性。“subwidgets”属性用来定义此控件包含的子控件。“binds”用于定义此控件或其子控件的事件处理

## widgettype说明
其值为Bricks中的注册的控件名称或"urlwidget", widgettype定义此控件是bricks的哪个控件，值为“urlwidget”时，控件数据从服务器中获取，其options有特殊约定

## options
控件初始化参数，可以是控件本身定义初始化参数，也可以是祖先类的初始化参数，当widgettype等于urlwidget时，options要符合下列规格
{
	"url"					# 获得控件数据的url
	"method"				# http方法（如“GET”，“POST” 。。。）
	"params"				# 字典数据，http请求所带的参数
}

## binds
列表属性，定义控件的事件处理，在列表中的每一项，定义一个事件处理， Bricks支持5种事件处理方法，
分别是urlwidget, method, script, registedfunction和event

在binds中这五种事件处理方法都可以定义，在同一个控件中可以灵活的使用不同事件处理方法来响应不同控件的不同事件，
支持：
* 可定义bings所在控件的事件处理
* 可定义binds所在控件的子（孙）控件的事件处理
* 可定义应用控件树上任何‘wid’对应的控件的事件处理
* 同一个控件的同一个事件，使用多个处理方法按定义顺序依次处理
  
详细事件处理请参看[bricks的事件处理](event.md)

