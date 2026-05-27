# input

# 用法

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
                "widgettype": "UiStr",
                "options":
                {
                    "name": "email",
                    "label": "Email",
                    'required': true
                }
            }
        };
        const app = new BricksApp(opts);
        app.run();
    </script>
</body>

</html>
```

## 效果图

![](F:\mh\bricks\docs\images\input.png)

## options

| 参数     | 参数说明       | 类型   | 是否必填 | 可选值 | 默认值 |
| -------- | -------------- | ------ | -------- | ------ | ------ |
| name     | 控件的原生属性 | String | 是       | ---    | ---    |
| label    | 文本标签       | String | 是       | ---    | ---    |
| required | 是否必填       | String | 是       | ---    | ---    |

**注意:input内容不一样,widgettype的值也不一样.**

1.字符串:UiStr;

2.手机号:UiTel;

3.时间日期:UiDate;

4.整数:UiInt;

5.浮点数:UiFloat;

6.多选:UiCheckBox;

7.单选:UiCheck;

8.邮箱:UiEmail;

9.上传文件:UiFile;

10.下拉选择:Code;

11.文本框:UiText;

12.密码框:UiPassword;

13.音频:UiAudio;

14.视频:UiVideo;



