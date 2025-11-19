# modal

# 用法

```html
<html>

<head>
</head>

<body>
	<script src="/bricks/bricks.js"></script>
	<script>
		const opts =
		{
			"widget": {
				"widgettype": "Modal",
				"options": {
					"auto_close": true,
					"auto_open": true,
					"width": "700px",
					"height": "400px",
					"archor": "cl"
				},
				"subwidgets": [
					{
						"widgettype": "Text",
						"options": {
							"text": "This is a test"
						}
					}
				]
			}
		};
		const app = new BricksApp(opts);
		app.run();
	</script>
</body>

</html>
```

# 效果图

![](F:\mh\bricks\docs\images\modal.png)

# options参数说明

| 参数       | 参数说明                       | 类型    | 是否必填 | 可选值     | 默认值 |
| ---------- | ------------------------------ | ------- | -------- | ---------- | ------ |
| auto_close | 点击弹窗以外的区域是否关闭弹窗 | Boolean | 是       | true/false | ---    |
| auto_close | 是否默认打开弹窗               | Boolean | 是       | true/false | ---    |
| width      | 宽度                           | String  | 是       | 百分比     | ---    |
| height     | 高度                           | String  | 是       | 百分比     | ---    |
| archor     | 控件的位置                     | String  | 是       | ---        | ---    |
| org_index  | 控件图层层级                   | String  | 是       | ---        | ---    |

**注意:archor的值所代表的位置**

* tl:在屏幕的左上角

* tc:在屏幕顶部的中间

* tr:在屏幕的右上角

* cl:在屏幕中间部分的左侧

* cc:在屏幕的中心位置

* cr:在屏幕中间部分的右侧

* bl:在屏幕的左下角

* bc:在屏幕底部的中间

* br:在屏幕的右下角

  
