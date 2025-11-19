# video

## 用法

```html
  <html>
  <head>
  </head>
  <body>
  <script src="/bricks/bricks.js"></script>
	<script>
		const opts = 
{
	"widget": {
		"id":"videoplayer",
		"widgettype":"VideoPlayer",
		"options":{
			"autoplay":true,
			"url":"http://kimird.com/video/sample-mp4-file.mp4",
			"type":"mp4"
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

![](F:\mh\bricks\docs\images\video.png)

## widget参数说明

| 参数       | 参数说明       | 类型   | 是否必填 | 可选值      | 默认值 |
| ---------- | -------------- | ------ | -------- | ----------- | ------ |
| id         | 控件的唯一标识 | String | 是       | ---         | ---    |
| widgettype | 控件的类型     | String | 是       | VideoPlayer | ---    |
| options    | 详细配置项     | Object | 是       | ---         | ---    |

### options参数说明

| 参数     | 参数说明         | 类型    | 是否必填 | 可选值     | 默认值 |
| -------- | ---------------- | ------- | -------- | ---------- | ------ |
| autoplay | 视频是否可以暂停 | Boolean | 是       | true/false | ---    |
| url      | 视频来源地址     | String  | 是       | ---        | ---    |
| type     | 视频类型         | String  | 是       | mp4        | ---    |
