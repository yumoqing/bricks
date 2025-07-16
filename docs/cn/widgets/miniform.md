# MiniForm 

## 用法

### 写法一:

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
				"widgettype": "urlwidget",
				"options": {
					"url": "miniform.json"
				}
			}
		};
		const app = new BricksApp(opts);
		app.run();
	</script>
</body>

</html>
```

miniform.json:

```json
{
	"widgettype":"MiniForm",
	"options":{
		"label_width":"100px",
		"fields":[
			{
				"name":"test1",
				"label":"姓名",
				"uitype":"str"
			},
			{
				"name":"test2",
				"label":"性别",
				"uitype":"str"
			},
			{
				"name":"test3",
				"label":"地址",
				"uitype":"str"
			}
		]
	}
}
```

### 写法二:

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
				"widgettype": "MiniForm",
				"options": {
					"label_width": "100px",
					"fields": [
						{
							"name": "test1",
							"label": "姓名",
							"uitype": "str"
						},
						{
							"name": "test2",
							"label": "性别",
							"uitype": "str"
						},
						{
							"name": "test3",
							"label": "地址",
							"uitype": "str"
						}
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



## 效果图

![](F:\mh\bricks\docs\images\miniform.png)

## options参数说明

| 参数        | 参数说明           | 类型   | 是否必填 | 可选值 | 默认值 |
| ----------- | ------------------ | ------ | -------- | ------ | ------ |
| label_width | 控件标签的宽度     | String | 是       | ---    | ---    |
| fields      | 控件子项的详细信息 | Array  | 是       | ---    | ---    |

#### options.fields参数说明

| 参数   | 参数说明       | 类型   | 是否必填 | 可选值      | 默认值 |
| ------ | -------------- | ------ | -------- | ----------- | ------ |
| name   | 控件的原生属性 | String | 是       | ---         | ---    |
| label  | 文本标签       | String | 否       | ---         | ---    |
| uitype | 控件类型       | String | 否       | str(字符串) | ---    |



