# editabletree

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
		"widgettype":"urlwidget",
		"options":{
			"url":"editabletree.json"
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

![](F:\mh\bricks\docs\images\editabletree.png)

## widget参数说明

| 参数       | 参数说明   | 类型   | 是否必填 | 可选值    | 默认值 |
| ---------- | ---------- | ------ | -------- | --------- | ------ |
| widgettype | 控件类型   | String | 是       | urlwidget | ---    |
| options    | 控件配置项 | Object | 是       | ---       | ---    |

### options参数说明

| 参数 | 参数说明 | 类型   | 是否必填 | 可选值 | 默认值 |
| ---- | -------- | ------ | -------- | ------ | ------ |
| url  | 数据来源 | String | 是       | ---    | ---    |

**注意:url可以是个json文件**
