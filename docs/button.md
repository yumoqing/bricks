# button

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
				"widgettype": "HBox",
				"options": {
					"height": "auto",
					"width": "100%"
				},
				"subwidgets": [
					{
						"widgettype": "Button",
						"options": {
							"name": "test",
							"icon": "/bricks/imgs/submit.png",
							"label": "test once",
							"tooltip": "This is a joke too",
							"nonepack": true,
							"orientation": "horizontal"
						}
					},
					{
						"widgettype": "Button",
						"options": {
							"name": "test",
							"icon": "/bricks/imgs/reset.png",
							"tooltip": "This is a joke",
							"label": "test twice",
							"nonepack": true,
							"orientation": "horizontal"
						}
					}
				],
				"binds": [
					{
						"wid": "self",
						"event": "click",
						"actiontype": "script",
						"script": "alert('HBox clicked');"
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

## 示例

![本地png图片](F:\mh\bricks\docs\images\button.png)

### widget 参数说明

控件实例

| 参数       | 参数说明       | 类型   | 是否必填 | 可选值 | 默认值 |
| ---------- | -------------- | ------ | -------- | ------ | ------ |
| widgettype | 控件类型       | String | 是       | Hbox   | ---    |
| options    | 控件样式       | Object | 否       | ---    | ---    |
| subwidgets | 控件           | Array  | 否       | ---    | ---    |
| binds      | 控件绑定的事件 | Array  | 否       | ---    | ---    |

#### widget .options

| 参数   | 参数说明 | 类型   | 是否必填 | 可选值    | 默认值 |
| ------ | -------- | ------ | -------- | --------- | ------ |
| height | 高度     | String | 是       | auto/100% | ---    |
| width  | 宽度     | String | 是       | auto/100% | ---    |

#### widget .subwidgets

| 参数       | 参数说明       | 类型   | 是否必填 | 可选值 | 默认值 |
| ---------- | -------------- | ------ | -------- | ------ | ------ |
| widgettype | 控件类型       | String | 是       | Button | ---    |
| options    | 控件详细配置项 | Object | 是       | ---    | ---    |

##### options

| 参数        | 参数说明       | 类型    | 是否必填 | 可选值     | 默认值     |
| ----------- | -------------- | ------- | -------- | ---------- | ---------- |
| name        | 控件的属性     | String  | 是       | text       | ---        |
| icon        | 图标           | String  | 是       | ---        | ---        |
| label       | 默认文本值     | String  | 否       | ---        | ---        |
| tooltip     | 提示文本       | String  | 否       | ---        | ---        |
| nonepack    | 是否自身有边框 | Boolean | 是       | true/false | ---        |
| orientation | 排列方向       | String  | 是       | horizontal | horizontal |

#### widget .binds

此项为绑定的事件

| 参数       | 参数说明           | 类型   | 是否必填 | 可选值 | 默认值 |
| ---------- | ------------------ | ------ | -------- | ------ | ------ |
| wid        | 事件执行的对象     | String | 是       | self   | ---    |
| event      | 事件执行类型       | String | 是       | click  | ---    |
| actiontype | 事件执行的程序类型 | String | 是       | ---    | ---    |
| script     | 事件执行的具体方法 | String | 是       | ---    | ---    |

