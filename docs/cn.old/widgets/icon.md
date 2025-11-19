# Icon

## 用法

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
				"widgettype": "Icon",
				"options": {
					"url": "/bricks/imgs/edit.png",
					"height": "10%",
					"width": "10%"
				}

			}
		};
		const app = new BricksApp(opts);
		app.run();
	</script>
</body>

</html>
```

## 效果图

![](F:\mh\bricks\docs\images\icon.png)

## widget参数说明

| 参数       | 参数说明         | 类型   | 是否必填 | 可选值 | 默认值 |
| ---------- | ---------------- | ------ | -------- | ------ | ------ |
| widgettype | 控件类型         | String | 是       | Icon   | --     |
| options    | 控件的详细配置项 | Object | 是       | ---    | ---    |

### options

| 参数   | 参数说明 | 类型   | 是否必填 | 可选值   | 默认值 |
| ------ | -------- | ------ | -------- | -------- | ------ |
| url    | icon来源 | String | 是       | ---      | --     |
| height | 高度     | String | 否       | 百分比值 | ---    |
| width  | 宽度     | String | 否       | 百分比值 | ---    |

**注意:options参数的height和width参数不写,那么这两项的默认值是'100%'**