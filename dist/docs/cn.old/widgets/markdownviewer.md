# MarkdownView

**此控件可以完成一个指向md文件的操作**

# 用法

```html
<html>

<head>
</head>

<body>
	<div>
		<script src="/marked.min.js"></script>
		<script src="http://kimird.com/bricks/bricks.js"></script>
		<script>
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
							"widgettype": "MarkdownViewer",
							"options": {
								"md_url": "test1.md"
							}
						}
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



# options

## md_url

此属性是指向要打开的md文件,是md文件的路径

