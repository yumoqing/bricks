# widgetBuild
函数用于创建bricks框架的控件实例。

## 语法
var w = widgetBuild(desc, widget)

## 参数说明
### desc
desc是一个对象类型数据，创建控件参数，必须有"widgettype", "options"属性, 可选属性有"subwidegets"，"binds"

### widget
widget是一个控件实例，用于解析desc中出现的url

## 返回值
* null 出错，可能1）widgettype类型未注册或不存在；2）json文件格式不对
* 新创建的控件实体

## 例子
tree.json
```
	{
		"widgettype":"Tree",
		"options":{
			"idField":"id",
			"textField":"text",
			"data":[
				{
					"id":1,
					"text":"node1",
					"is_leaf":false,
					"children":[
						{
							"id":11,
							"text":"node11",
							"is_leaf":false,
							"children":[
								{
									"id":112,
									"text":"node.12",
									"is_leaf":false,
									"children":[
										{
											"id":1112,
											"text":"node1112",
											"is_leaf":true
										},
										{
											"id":1113,
											"text":"node113",
											"is_leaf":true
										}
									]
								},
								{
									"id":113,
									"text":"node113",
									"is_leaf":true
								}
							]
						},
						{
							"id":12,
							"text":"node12",
							"is_leaf":true
						},
						{
							"id":13,
							"text":"node13",
							"is_leaf":true
						}
					]
				},
				{
					"id":2,
					"text":"node2",
					"is_leaf":false,
					"children":[
						{
							"id":21,
							"text":"node21",
							"is_leaf":true
						},
						{
							"id":22,
							"text":"node22",
							"is_leaf":true
						},
						{
							"id":23,
							"text":"node23",
							"is_leaf":true
						}
					]
				},
				{
					"id":3,
					"text":"node3",
					"is_leaf":true
				}
			]
		}
	}
```
tree.html
```
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
		"widgettype":"urlwidget",
		"options":{
			"url":"tree.json"
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
这是一个树形控件， 运行[这里](https://github.com/bricks/examples/tree.html)
更多的例子请看
[bricks控件例子](https://github.com/yumoqing/bricks/examples)


