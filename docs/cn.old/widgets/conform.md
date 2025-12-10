# 确认控件
弹出式用户确认控件，显示标题以及消息，并在下方提供确认和放弃两个按钮。点击确认后，关闭窗口，并触发“comformed”事件

## widgettype值
Conform

## 父类
[bricks.Message](message.md)

## 构建参数
同bircks.Message控件的参数

## 方法
无
## 事件
### conformed
用户点击确认按钮触发的事件
### cancelled
用户点击discard按钮触发的事件

## 使用例子
```
{
	"id":"uuuu",
	"widgettype":"Conform",
	"options":{
		"width":"40%",
		"height":"40%",
		"archor":"cc",
		"title":"Test Title",
		"message":"This is a test message"
	}
}
```
