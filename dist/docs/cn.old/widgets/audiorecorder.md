# 录制音频
音频录制器
## widgettype值
AudioRecorder

## 父类
[bricks.HBox](hbox.md)
## 构建参数
{
	"upload_url":音频上传url
	“icon_rate”：录音按钮比例，设置录音图标显示多少个字符大小。
}
## 方法
### start_recording()
### stop_recording()
### async upload()

## 事件
### uploaded
上传成功事件，事件参数是fetch返回的response
### record_started
录音开始事件，无参数
### record_ended
录音结束事件，参数为：

            var d = {

                data:blob,

                url:localURL,

                duration:duration

            }


## 使用例子
```
{
	"id":"recorder",
	"widgettype":"AudioRecorder",
	"options":{
		"height":"40px",
		"upload_url":"{{entire_url('stt.dspy')}}"
	},
	"binds":[
		{
			"wid":"self",
			"event":"uploaded",
			"actiontype":"script",
			"script":"alert(event.params)"
		}
	]
}
```

