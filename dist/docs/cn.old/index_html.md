# index.html文件内容

一个例子
```

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="stylesheet" href="http://localhost:9080/bricks/3parties/xterm.css" />
<link href="http://localhost:9080/bricks/3parties/video-js.css" rel="stylesheet" />
<link rel="stylesheet" href="http://localhost:9080/bricks/css/bricks.css">
<!--
在这里插入项目的css文件
-->
<!-- support IE8 (for Video.js versions prior to v7) -->

<script src="http://localhost:9080/bricks/3parties/videojs-ie8.min.js"></script>
</head>
  <body>
<!--
在这里添加项目的script脚本
--->
  <script src="http://localhost:9080/bricks/3parties/marked.min.js"></script>
  <script src="http://localhost:9080/bricks/3parties/xterm.js"></script>
  <script src="http://localhost:9080/bricks/3parties/video.min.js"></script>
  <script src="http://localhost:9080/bricks/3parties/recorder.wav.min.js"></script>
<!---  <script src="http://localhost:9080/bricks/3parties/videojs-contrib-hls.min.js"></script> --->
  <script src="http://localhost:9080/bricks/bricks.js"></script>
	<script>
		/*
		if (bricks.is_mobile()){
			alert('wh=' + window.innerWidth + ':' + window.innerHeight);
		}
		*/
		const opts = {
/*

*/
			"widget": 
/*
以下是root控件的内容
*/
{
	"widgettype":"MarkdownViewer",
	"options":{
		"width":"100%",
		"height":"100%",
		"navigator":true,
		"md_url":"http://localhost:9080/bricks/docs/cn/README.md"
	}
}
/*
root控件内容结束
*/
	};
	const app = new bricks.App(opts);
	app.run();
</script>
</body>
</html>
```
说明

