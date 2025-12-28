# 创建控件的Json文件格式说明
Bricks在服务器端使用Json文件格式存储控件描述文件，前端获得json文件后转化为json对象，并用此json对象调用widgetBuild函数创建Bricks控件。

控件描述json文件必须含有“widgettype” 和”options“两个属性。“subwidgets”属性用来定义此控件包含的子控件。“binds”用于定义此控件或其子控件的事件处理

## id
id是一个可选项，定义控件的id， 缺省不定义控件id， bricks提供根据控件id查找控件的机制，详情请看[控件id](widgetid.md)
## widgettype说明
widgettype是一个字符串属性。其值为Bricks中的所有控件类型或"urlwidget"
可用的控件类型可以在[控件类型清单](widgets.md)中查找

## options
对象类型，每个控件有特定的options属性，清参看每个控件的说明

## subwidgets
数组类型，数组中的每个元素必须是一个对象类型数据，与desc作用一样。
参见widgetBuild函数的desc说明

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

