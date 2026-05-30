# Text

Text is a widget to show text
## 用法

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
			"widgettype":"VBox",
			"options":{
			},
			"subwidgets":[
				{
					"widgettype":"Title1",
					"options":{
						"text":"Pic Viewer",
						"i18n":true
					}
				},
				{
					"widgettype":"Title2",
					"options":{
						"text":"Pic Viewer",
						"i18n":true
					}
				},
				{
					"widgettype":"Title3",
					"options":{
						"text":"Pic Viewer",
						"i18n":true
					}
				},
				{
					"widgettype":"Title4",
					"options":{
						"text":"Pic Viewer",
						"i18n":true
					}
				},
				{
					"widgettype":"Title5",
					"options":{
						"text":"Pic Viewer",
						"i18n":true
					}
				},
				{
					"widgettype":"Title6",
					"options":{
						"text":"Pic Viewer",
						"i18n":true
					}
				},
				{
					"widgettype":"Text",
					"options":{
						"text":"Pic Viewer",
						"i18n":true
					}
				},
				{
					"widgettype":"HBox",
					"options":{
					},
					"subwidgets":[
						{
							"widgettype":"Button",
							"options":{
								"label":"A",
								"item_rate":1.4
							},
							"binds":[
								{
									"wid":"self",
									"event":"click",
									"actiontype":"script",
									"target":"app",
									"script":"bricks_app.textsize_bigger()"
								}
							]
						},
						{
							"widgettype":"Button",
							"options":{
								"label":"A",
								"item_rate":0.7,
								"item_size":"20px"
							},
							"binds":[
								{
									"wid":"self",
									"event":"click",
									"actiontype":"script",
									"target":"app",
									"script":"bricks_app.textsize_smaller()"
								}
							]
						}
					]
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



## 效果图

![](F:\mh\bricks\docs\images\text.png)

## widget参数说明

| 参数       | 参数说明       | 类型   | 是否必填 | 可选值 | 默认值 |
| ---------- | -------------- | ------ | -------- | ------ | ------ |
| widgettype | 控件类型       | String | 是       | ---    | ---    |
| options    | 控件的配置项   | Object | 是       | ---    | ---    |
| subwidgets | 控件子项的配置 | Object | 否       | ---    | ---    |

### widget.subwidgets参数说明

| 参数       | 参数说明     | 类型   | 是否必填 | 可选值 | 默认值 |
| ---------- | ------------ | ------ | -------- | ------ | ------ |
| widgettype | 控件类型     | String | 是       | ---    | ---    |
| options    | 控件的配置项 | Object | 是       | ---    | ---    |

#### options参数说明

| 参数 | 参数说明     | 类型    | 是否必填 | 可选值     | 默认值 |
| ---- | ------------ | ------- | -------- | ---------- | ------ |
| text | 默认显示的值 | String  | 否       | ---        | ---    |
| i18n | 是否国际化   | Boolean | 否       | true/false | ---    |
