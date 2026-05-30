# AudioPlayer
音频播放器
## 父类
[JsWidget](jswidget.md)
## 构建参数
options = {
	* url:音频源的url
	* autoplay：自动播放，如果是true，音频在导入后自动播放
}
## 方法
### set_url（url）
此方法设置新的音频源，如果autoplay为真，新设置的资源会立即播放

### toggle_play（）
如果当前资源正在播放，则停止播放，否则开始播放

### play（）
播放资源

## 事件
无

## 使用例子
```
{
	"id":"audioplayer",
	"widgettype":"AudioPlayer",
	"options":{
		"autoplay":true,
		"url":"http://kimird.com/songs/sample-mp3-file.mp3"
	}
}
```
