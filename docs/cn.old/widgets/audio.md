# audio

## 用法

```html
  <html>
  <head>
  </head>
  <body>
  <script src="http://kimird.com/bricks/bricks.js"></script>
	<script>
	/*
	https://abc-iview-mediapackagestreams-2.akamaized.net/out/v1/6e1cc6d25ec0480ea099a5399d73bc4b/index.m3u8
	https://cbcnewshd-f.akamaihd.net/i/cbcnews_1@8981/index_2500_av-p.m3u8
	*/
		const opts = 
{
	"widget": {
		"id":"audioplayer",
		"widgettype":"AudioPlayer",
		"options":{
			"autoplay":true,
			"url":"http://kimird.com/songs/sample-mp3-file.mp3"
		}
	}
}

		;
		const app = new BricksApp(opts);
		app.run();
	</script>
</body>
</html>

```



## 效果图

![](F:\mh\bricks\docs\images\audio.png)

## widget参数说明

| 参数       | 参数说明       | 类型   | 是否必填 | 可选值 | 默认值 |
| ---------- | -------------- | ------ | -------- | ------ | ------ |
| id         | 控件的唯一标识 | String | 是       | ---    | ---    |
| widgettype | 控件类型       | String | 是       | ---    | ---    |

### widget.options参数说明

| 参数     | 参数说明     | 类型    | 是否必填 | 可选值     | 默认值 |
| -------- | ------------ | ------- | -------- | ---------- | ------ |
| autoplay | 是否可以暂停 | Boolean | 是t      | true/false | ---    |
| url      | 数据来源地址 | String  | 是       | ---        | ---    |