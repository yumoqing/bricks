# HBox
Hbox是一个水平布局小部件，它按水平方向布局子小部件
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
                "widgettype": "HBox",
                "options":
                {
             
                }
            }
        };
        const app = new BricksApp(opts);
        app.run();
    </script>
</body>

</html>
```



**注意:hbox控件是水平排列的控件,相当于一个容器,可以容纳其他的控件,如button,form等**

