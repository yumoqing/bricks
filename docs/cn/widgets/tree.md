# Tree	

## 用法

```html
<html>

<head>
	<link rel="stylesheet" href="/bricks/css/bricks.css" />
</head>

<body>
	<script src="/bricks/bricks.js"></script>
	<script>
		const opts =
		{
			"widget": {
				"widgettype": "urlwidget",
				"options": {
					"url": "tree.json"
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

![](F:\mh\bricks\docs\images\tree.png)

## widget参数说明

| 参数       | 参数说明   | 类型   | 是否必填 | 可选值    | 默认值 |
| ---------- | ---------- | ------ | -------- | --------- | ------ |
| widgettype | 控件类型   | String | 是       | urlwidget | ---    |
| options    | 控件配置项 | Object | 是       | ---       | ---    |

**options为树形结构的数据来源**

### options

| 参数 | 参数说明     | 类型   | 是否必填 | 可选值 | 默认值 |
| ---- | ------------ | ------ | -------- | ------ | ------ |
| url  | 控件数据来源 | String | 是       | ---    | ---    |

