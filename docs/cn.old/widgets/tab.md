# tab

此函数用于创建tab组件

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
				"widgettype": "TabPanel",
				"options": {
					"tab_wide": "auto",
					"height": "100%",
					"tab_long": "70%",
					"tab_pos": "top",
					"items": [
						{
							"name": "c",
							"label": "C",
							"content": {
								"widgettype": "Text",
								"options": {
									"text": "This is a C language documents"
								}
							},
							"icon": null
						},
						{
							"name": "javascript",
							"removable": true,
							"label": "JavaScript",
							"content": {
								"widgettype": "Text",
								"options": {
									"text": "This is JavaScript language documents"
								}
							},
							"icon": null
						},
						{
							"name": "php",
							"label": "PHP",
							"content": {
								"widgettype": "Text",
								"options": {
									"text": "This is PHP language documents"
								}
							},
							"icon": null
						},
						{
							"name": "python",
							"label": "Python",
							"content": {
								"widgettype": "Text",
								"options": {
									"text": "This is Python language documents"
								}
							},
							"icon": null
						},
					]
				}
			}
		};
		const app = new BricksApp(opts);
		app.run();
	</script>
</body>

</html>
```



## 示例

![本地png图片](F:\mh\bricks\docs\images\tab.png)

## widget.options参数说明

| 参数     | 说明 | 类型   | 可选值                | 默认值 |
| -------- | ---- | ------ | --------------------- | ------ |
| tab_wide | 尺寸 | string | auto                  | auto   |
| height   | 高   | string | ----                  | ----   |
| tab_long | 宽   | string | ----                  | ----   |
| tab_pos  | 位置 | string | top/bottom/left/right | -----  |

### options.items参数说明

一个items为一个tab项

| 参数      | 说明                                              | 类型    | 可选值 | 默认值 |
| --------- | ------------------------------------------------- | ------- | ------ | ------ |
| name      | 与选项卡绑定值 value 对应的标识符，表示选项卡别名 | string  | ----   | ----   |
| label     | 选项卡标题                                        | string  | ----   | ----   |
| removable | 是否移除选项卡                                    | boolean | ----   | false  |
| content   | 选项卡的内容                                      |         |        |        |

## 事件

none

