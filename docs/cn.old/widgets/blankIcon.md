# Blankicon

此控件是显示图标控件

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
				"widgettype": "BlankIcon",
				"options": {
					"url": "/bricks/imgs/edit.png",
					"height": "100%",
					"width": "100%"
				}

			}
		};
		const app = new BricksApp(opts);
		app.run();
	</script>
</body>

</html>
```

## options参数说明

| 参数   | 参数说明 | 类型   | 是否必填 | 可选值 | 默认值 |
| ------ | -------- | ------ | -------- | ------ | ------ |
| url    | 图标来源 | String | 是       | ---    | ---    |
| height | 高度     | String | 是       | 百分比 | ---    |
| width  | 宽度     | String | 是       | 百分比 | ---    |



