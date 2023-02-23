# VideoPlayer

## Usage
### play a mp4 file
```
  <html>
  <head>
  </head>
  <body>
  <script src="../bricks.js"></script>
	<script>
		const opts = 
{
	"widget": {
		"id":"videoplayer",
		"widgettype":"VideoPlayer",
		"options":{
			"autoplay":true,
			"url":"http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
			"type":"mp4"
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
### play a m3u8 stream
```
  <html>
  <head>
  </head>
  <body>
  <script src="https://cdn.jsdelivr.net/npm/indigo-player@1/lib/indigo-player.js"></script>
  <script src="../bricks.js"></script>
	<script>
	/*
	https://abc-iview-mediapackagestreams-2.akamaized.net/out/v1/6e1cc6d25ec0480ea099a5399d73bc4b/index.m3u8
	https://cbcnewshd-f.akamaihd.net/i/cbcnews_1@8981/index_2500_av-p.m3u8
	*/
		const opts = 
{
	"widget": {
		"id":"videoplayer",
		"widgettype":"VideoPlayer",
		"options":{
			"autoplay":true,
			"source":"https://abc-iview-mediapackagestreams-2.akamaized.net/out/v1/6e1cc6d25ec0480ea099a5399d73bc4b/index.m3u8",
			"srctype":"hls"
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
you will see ti like this
![example video](m3u8.png "see it?")
## options
to be a VideoPlayer instance, you need to provide a options with contains 
following attributes
### source
the url of a video resouce, VideoPlayer can play mp4, m3u8 video
### srctype
specify the source type, should be 'mp4' or 'hls' for m3u8 'dash' for play a Dash manifest
## play avi file
!v[sample video](http://kimird.com/video/sample-avi-file.avi)
## play flv file
!v[sample video](http://kimird.com/video/sample-flv-file.flv)
## play mkv file
!v[sample video](http://kimird.com/video/sample-mkv-file.mkv)
## play mov file
!v[sample video](http://kimird.com/video/sample-mov-file.mov)
## play mp4 file
!v[sample video](http://kimird.com/video/sample-mp4-file.mp4)
## play webm file
!v[sample video](http://kimird.com/video/sample-webm-file.webm)
## play m3u8 file
!v[abc news TV](https://abc-iview-mediapackagestreams-2.akamaized.net/out/v1/6e1cc6d25ec0480ea099a5399d73bc4b/index.m3u8)
