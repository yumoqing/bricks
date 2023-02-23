# Image
Image widget show image
## use case
```
  <html>
  <head>
  <link rel="stylesheet" href="../css/bricks.css">
  </head>
  <body>
  <script src="../bricks.js"></script>

	<script>
		const opts = 
{
	"widget": {
		"widgettype":"Image",
		"options":{
			"source":"https://cdn.pixabay.com/photo/2018/04/26/16/31/marine-3352341_960_720.jpg",
			"height":"100%",
			"width":"100%"
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
the result is <br>
![image](image.png)

## inheritance
Image inherited from JsWidget

## options
```
{
	"source":
	"width":
	"height":
}
```
### source
source is url to the image
### width
optional, default is 100%, specified the image's width
### height
optional, default is 100%, specified the image's height

## method
none
## event
none
