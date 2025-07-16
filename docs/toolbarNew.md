# Toolbar

## 用法

```html
<html>

<head>
	<link rel="stylesheet" href="http://kimird.com/bricks/css/bricks.css">
</head>

<body>
	<script src="http://kimird.com/bricks/bricks.js"></script>

	<script>
		const opts =
		{
			"widget": {
				"widgettype": "Toolbar",
				"options": {
					"target": null,
					"orientation": "horizontal",
					"tool_margin": "15px",
					"tools": [
						{
							"name": "c",
							"Label": "C",
							"icon": null
						},
						{
							"name": "javascript",
							"Label": "JavaScript",
							"icon": null
						},
						{
							"name": "php",
							"Label": "PHP",
							"icon": null
						},
						{
							"name": "python",
							"Label": "Python",
							"icon": null
						},
					]
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

![](F:\mh\bricks\docs\images\toolbar.png)

## widget参数说明

| 参数       | 参数说明     | 类型   | 是否必填 | 可选值  | 默认值 |
| ---------- | ------------ | ------ | -------- | ------- | ------ |
| widgettype | 控件类型     | String | 是       | Toolbar | ---    |
| options    | 控件的配置项 | Object | 是       | ---     | ---    |

### widget.options参数说明

| 参数        | 参数说明           | 类型   | 是否必填 | 可选值              | 默认值 |
| ----------- | ------------------ | ------ | -------- | ------------------- | ------ |
| target      | 参数返回值         | String | 否       | ---                 | ---    |
| orientation | 控件的方向         | Object | 是       | horizontal/vertical | ---    |
| tool_margin | 控件子项间的距离   | String | 否       | ---                 | ---    |
| tools       | 控件子项的具体信息 | Array  | 否       | ---                 | ---    |

#### tools参数说明

| 参数  | 参数说明 | 类型   | 是否必填 | 可选值  | 默认值 |
| ----- | -------- | ------ | -------- | ------- | ------ |
| name  | 原生属性 | String | 是       | Toolbar | ---    |
| Label | 标签文本 | String | 是       | ---     | ---    |
| icon  | 图标     | String | 是       | ---     | ---    |

**icon可以指向一个相对路径或者绝对路径的图标,若引入图标,则会显示在tools的前面.若没有label属性,则显示的文本是name属性的值**

