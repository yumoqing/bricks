# accordion

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
		"widgettype":"Accordion",
		"options":{
			"item_size":'28px',
			"items":[
				{
					"name":"test1",
					"icon":"/imgs/t.png",
					"text":"accordion 1 test",
					"content":{
						"widgettype":"Text",
						"options":{
							"text":"text content 1",
							"i81n":true
						}
					}
				},
				{
					"name":"test2",
					"icon":"/imgs/t.png",
					"text":"accordion 2 test",
					"content":{
						"widgettype":"Text",
						"options":{
							"text":"text content 2",
							"i81n":true
						}
					}
				}
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

![](F:\mh\bricks\docs\images\accordion.png)

## widget参数说明

| 参数       | 参数说明     | 类型   | 是否必填 | 可选值    | 默认值 |
| ---------- | ------------ | ------ | -------- | --------- | ------ |
| widgettype | 控件类型     | String | 是       | Accordion | ---    |
| options    | 控件的配置项 | Object | 是       | ---       | ---    |

### widget.options参数说明

| 参数      | 参数说明     | 类型   | 是否必填 | 可选值 | 默认值 |
| --------- | ------------ | ------ | -------- | ------ | ------ |
| item_size | 控件的高度   | String | 是       | ---    | ---    |
| items     | 控件的配置项 | Array  | 是       | ---    | ---    |

#### widget.options.items参数说明

| 参数    | 参数说明         | 类型   | 是否必填 | 可选值 | 默认值 |
| ------- | ---------------- | ------ | -------- | ------ | ------ |
| name    | 原生name属性     | String | 是       | ---    | ---    |
| icon    | 图标             | String | 否       | ---    | ---    |
| text    | 默认显示的文字值 | String | 否       | ---    | ---    |
| content | 控件内容的配置项 | Objet  | 是       | ---    | ---    |

##### widget.options.items参数内content参数说明(当content.widgettype值为Text时)

| 参数 | 参数说明         | 类型    | 是否必填 | 可选值     | 默认值 |
| ---- | ---------------- | ------- | -------- | ---------- | ------ |
| text | 默认显示的文字值 | String  | 否       | ---        | ---    |
| i81n | 是否国际化       | Boolean | 否       | true/false | ---    |

