# docs

## 用法

```html
  <html>
  <head>
  </head>
  <body>
  <script src="/marked.js"></script>
  <script src="http://kimird.com/bricks/bricks.js"></script>
	<script>
		const opts = 
{
	"widget": {
		"widgettype":"MarkdownViewer",
		"options":{
			"navigator":true,
			"md_url":"../docs/index.md"
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

## widget参数说明

| 参数       | 参数说明 | 类型   | 是否必填 | 可选值 | 默认值 |
| ---------- | -------- | ------ | -------- | ------ | ------ |
| widgettype | 控件类型 | String | 是       | ---    | ---    |

### widget.options参数说明

| 参数      | 参数说明         | 类型    | 是否必填 | 可选值     | 默认值 |
| --------- | ---------------- | ------- | -------- | ---------- | ------ |
| navigator | 是否可以导航指向 | Boolean | 是       | true/false | ---    |
| md_url    | 数据来源地址     | String  | 是       | ---        | ---    |