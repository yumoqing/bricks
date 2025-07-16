# Message

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
				"widgettype": "Tree",
				"options": {
					"idField": "id",
					"textField": "text",
					"data": [
						{
							"id": 1,
							"text": "node1",
							"is_leaf": false,
							"children": [
								{
									"id": 11,
									"text": "node11",
									"is_leaf": false,
									"children": [
										{
											"id": 112,
											"text": "node.12",
											"is_leaf": false,
											"children": [
												{
													"id": 1112,
													"text": "node1112",
													"is_leaf": true
												},
												{
													"id": 1113,
													"text": "node113",
													"is_leaf": true
												}
											]
										},
										{
											"id": 113,
											"text": "node113",
											"is_leaf": true
										}
									]
								},
								{
									"id": 12,
									"text": "node12",
									"is_leaf": true
								},
								{
									"id": 13,
									"text": "node13",
									"is_leaf": true
								}
							]
						},
						{
							"id": 2,
							"text": "node2",
							"is_leaf": false,
							"children": [
								{
									"id": 21,
									"text": "node21",
									"is_leaf": true
								},
								{
									"id": 22,
									"text": "node22",
									"is_leaf": true
								},
								{
									"id": 23,
									"text": "node23",
									"is_leaf": true
								}
							]
						},
						{
							"id": 3,
							"text": "node3",
							"is_leaf": true
						}
					]
				}
			}
		}

			;
		const app = new BricksApp(opts);
		app.run();
		var m = new Message({
			"title": "TEst Message",
			"message": "This is a test message",
			"auto_open": true,
			"timeout": 3
		})
	</script>
</body>

</html>
```

## 示例

![](F:\mh\bricks\docs\images\message.png)

## 参数说明

### widget.type

控件的类型.(控件有多种类型,如:Form,Image...等等)

### widget.options参数说明

| 参数      | 说明                 | 类型    | 是否必填 | 可选值     | 默认值 |
| --------- | -------------------- | ------- | -------- | ---------- | ------ |
| idField   | 当前节点的唯一标识   | String  | 是       | ---        | ---    |
| textField | 当前节点的label      | String  | 是       | ---        | ---    |
| is_leaf   | 是否可以展开         | Boolean | 否       | true/false | ---    |
| data      | 文件夹具体信息的集合 | Array   | 否       | ---        | ---    |

#### options.data参数说明

options.data参数的key必须和widget.options参数的value一致,比如widget.options.idField="id",那么options.data参数的key就是"options.data.id" .另外多了一个children参数,是对象形式,参数与options.data的参数保持一致.

注意:**如果想下写一级目录,就添加children参数对象**

## 事件

none
