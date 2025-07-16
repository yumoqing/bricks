# Image
Image widget show image
# 用法
```html
<html>

<head>
	<link rel="stylesheet" href="/bricks/css/bricks.css">
</head>

<body>
	<script src="/bricks/bricks.js"></script>

	<script>
		const opts =
		{
			"widget": {
				"widgettype": "Image",
				"options": {
					"url": "https://cdn.pixabay.com/photo/2018/04/26/16/31/marine-3352341_960_720.jpg",
					"height": "100%",
					"width": "100%"
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
the result is <br>
![image](F:\mh\bricks\docs\images\image.png)

## inheritance
Image inherited from JsWidget

## options
```
{
	"url":
	"width":
	"height":
}
```
| 参数   | 参数说明 | 类型   | 是否必填 | 可选值     | 默认值 |
| ------ | -------- | ------ | -------- | ---------- | ------ |
| url    | 照片路径 | String | 是       | ---        | ---    |
| width  | 宽度     | String | 是       | 百分比数值 | ---    |
| height | 高度     | String | 是       | 百分比数值 | ---    |

