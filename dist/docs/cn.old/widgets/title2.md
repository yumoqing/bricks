# title2

此控件是标题控件,标题也有大小

# 用法

```html
<html>

<head>
	<link href="/bricks/css/bricks.css" rel="stylesheet" type="text/css" />
</head>

<body>

	<script src="/bricks/bricks.js"></script>
	<script type="text/javascript">
		const opts =
		{
			"widget": {
				"widgettype": "VBox",
				"options": {
				},
				"subwidgets": [
					{
						"widgettype": "Title1",
						"options": {
							"text": "Pic Viewer",
							"i18n": true
						}
					},
					{
						"widgettype": "Title2",
						"options": {
							"text": "Pic Viewer",
							"i18n": true
						}
					},
					{
						"widgettype": "Title3",
						"options": {
							"text": "Pic Viewer",
							"i18n": true
						}
					},
					{
						"widgettype": "Title4",
						"options": {
							"text": "Pic Viewer",
							"i18n": true
						}
					},
					{
						"widgettype": "Title5",
						"options": {
							"text": "Pic Viewer",
							"i18n": true
						}
					},
					{
						"widgettype": "Title6",
						"options": {
							"text": "Pic Viewer",
							"i18n": true
						}
					},
				]
			}
		}

			;
		const app = new BricksApp(opts);
		app.run();


	</script>
</body>

</html>
```

# 效果图

![](F:\mh\bricks\docs\images\title.png)

# options

| 参数 | 参数说明       | 类型    | 是否必填 | 可选值     | 默认值 |
| ---- | -------------- | ------- | -------- | ---------- | ------ |
| text | 标题的文本内容 | String  | 是       | ---        | ---    |
| i18n | 是否国际化     | Boolean | 是       | true/false | ---    |

