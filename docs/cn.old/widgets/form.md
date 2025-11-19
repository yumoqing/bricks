# form

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
				"widgettype": "VBox",
				"options": { "height": "100%" },
				"subwidgets": [
					{
						"widgettype": "HBox",
						"options": { "height": "auto" },
						"subwidgets": [
							{
								"widgettype": "Text",
								"options": {
									"otext": "Please change Font size",
									"i18n": true
								}
							},
							{
								"widgettype": "Button",
								"options": {
									"label": "A",
									"width": "auto",
									"item_rate": 1.4
								},
								"binds": [
									{
										"wid": "self",
										"event": "click",
										"actiontype": "script",
										"target": "app",
										"script": "bricks_app.textsize_bigger()"
									}
								]
							},
							{
								"widgettype": "Button",
								"options": {
									"label": "A",
									"width": "auto",
									"item_rate": 0.8
								},
								"binds": [
									{
										"wid": "self",
										"event": "click",
										"actiontype": "script",
										"target": "app",
										"script": "bricks_app.textsize_smaller()"
									}
								]
							}
						]
					},
					{
						"widgettype": "Form",
						"options": {
							"submit_url": "/ttt/ttt.dspy",
							"title": "Test hahah  Form",
							"description": "test input implemented",
							"fields": [
								{
									"uitype": "email",
									"name": "email",
									"label": "Email",
									'required': true
								},
								{
									"uitype": "tel",
									"name": "tel",
									"pattern": "{\d}3-{\d}4-{\d}4",
									"label": "Tel",
									'required': true
								},
								{
									"uitype": "file",
									"name": "file",
									"label": "File",
									'required': true
								},
								{
									"uitype": "str",
									"minlength": 3,
									"length": 30,
									"value": "tlegre",
									"name": "name",
									"label": "Name",
									'required': true
								},
								{
									"uitype": "int",
									"minlength": 3,
									"length": 30,
									"value": 12432,
									"name": "integer",
									"label": "Integer",
									'required': true
								},
								{
									"uitype": "float",
									"dec_length": 3,
									"length": 25,
									"name": "float",
									"label": "Float"
								},
								{
									"uitype": "date",
									"name": "date",
									"label": "Date",
									'required': true
								},
								{
									"uitype": "password",
									"minlength": 3,
									"length": 30,
									"name": "password",
									"label": "Password",
									'required': true
								},
								{
									"uitype": "checkbox",
									"name": "checkbox",
									"label": "CheckBox",
									"value": 2,
									"dataurl": "test_code.json",
									'required': true
								},
								{
									"uitype": "audio",
									"name": "audio",
									"label": "Audio",
									'required': true
								},
								{
									"uitype": "code",
									"name": "code",
									"label": "Code",
									"value": 2,
									"dataurl": "test_code.json",
									'required': true
								},
								{
									"uitype": "text",
									"name": "text",
									"value": "This is a test",
									"label": "Text",
									'required': true
								}
							]
						}
					}
				]
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

![](F:\mh\bricks\docs\images\form.png)

## widget参数说明

| 参数       | 参数说明                      | 类型   | 是否必填 | 可选值    | 默认值           |
| ---------- | ----------------------------- | ------ | -------- | --------- | ---------------- |
| widgettype | 控件类型                      | String | 是       | Vbox/Hbox | ---              |
| options    | 当前控件的配置项              | Object | 是       | height    | 100%/auto/scroll |
| id         | 控件的唯一标识                | String | 否       | ---       | ----             |
| subwidgets | 表单里的内容,比如表单里的子项 | Object | 否       | ---       | ---              |
| binds      | 绑定的事件                    | Object | 否       | ---       | ---              |

**注意:**

**如果没有widget.subwidgets参数的话,表单是一个框架,没有子级,但是还可已继续添加事件**

### widgent.subeidgets参数说明

| 参数       | 参数说明                              | 类型   | 是否必填 | 可选值    | 默认值           |
| ---------- | ------------------------------------- | ------ | -------- | --------- | ---------------- |
| widgettype | 控件类型                              | String | 是       | Vbox/Hbox | ---              |
| options    | 当前控件的配置项                      | Object | 是       | height    | 100%/auto/scroll |
| subwidgets | 表单里的内容的配置项,比如表单里的子项 | Object | 否       | ----      | ---              |

**注意:此处widgettype的值不一样,options的配置项也不相同**

#### widgettype值为Hbox时,相关配置项的参数说明

##### options参数说明

| 参数    | 参数说明         | 类型   | 是否必填 | 可选值           | 默认值 |
| ------- | ---------------- | ------ | -------- | ---------------- | ------ |
| options | 表单子项的配置项 | object | 是       | {"heigt":"auto"} | ---    |

##### subwidgets配置项参数说明

**注意:subwidgets.widgettype的值不一样,相对的options的参数也不相同**

* widgettype值为"Text"时,options参数说明

  | 参数  | 参数说明       | 类型    | 是否必填 | 可选值     | 默认值 |
  | ----- | -------------- | ------- | -------- | ---------- | ------ |
  | otext | 默认显示的文字 | String  | 否       | ---        | ---    |
  | i18n  | 是否国家化     | Boolean | 否       | true/false | ---    |

* widgettype值为"Button"时,options参数说明

  | 参数      | 参数说明       | 类型   | 是否必填 | 可选值    | 默认值 |
  | --------- | -------------- | ------ | -------- | --------- | ------ |
  | label     | 表单子项的标题 | String | 否       | ---       | ---    |
  | width     | 表单子项的宽度 | String | 否       | auto/100% | ---    |
  | item_rate | 字体的大小     | number | 否       | ---       | ---    |

* binds事件参数说明

  | 参数       | 参数说明             | 类型   | 是否必填 | 可选值 | 默认值 |
  | ---------- | -------------------- | ------ | -------- | ------ | ------ |
  | wid        | 当前节点的唯一标识   | String | 是       | self   | ---    |
  | event      | 事件的类型           | String | 是       | click  | ---    |
  | actiontype | 事件的执行方式       | String | 是       | script | ---    |
  | target     | 事件在哪个载体执行   | String | 是       | ---    | ---    |
  | script     | 事件通过哪个方法执行 | String | 是       | ---    | ---    |

  

#### widgettype值为Form时,相关配置项的参数说明

##### options参数说明

| 参数        | 参数说明                 | 类型   | 是否必填 | 可选值 | 默认值 |
| ----------- | ------------------------ | ------ | -------- | ------ | ------ |
| submit_url  | 接口地址                 | String | 是       | ---    | ---    |
| title       | 标题                     | String | 否       | ---    | ---    |
| description | 描述                     | String | 否       | ---    | ---    |
| fields      | 表单的子项的具体配置内容 | Array  | 否       | ---    | ---    |

###### options.fieds参数说明

**注意:options.fieds内,每一项的uitype值不一样,其配置项也不同**

* uitype为email时的参数配置(**注意:email为邮件格式**)

  | 参数     | 参数说明               | 类型    | 是否必填 | 可选值     | 默认值 |
  | -------- | ---------------------- | ------- | -------- | ---------- | ------ |
  | uitype   | 表单子项的类型         | String  | 是       | ---        | ---    |
  | name     | 表单子项的原生name属性 | String  | 是       | ---        | ---    |
  | label    | 当前子项的标签文本     | String  | 否       | ---        | ---    |
  | required | 是否必须               | Boolean | 是       | true/false | ---    |

* uitype为tel时的参数配置(**注意:tel为手机号格式**)

  | 参数     | 参数说明               | 类型    | 是否必填 | 可选值     | 默认值 |
  | -------- | ---------------------- | ------- | -------- | ---------- | ------ |
  | uitype   | 表单子项的类型         | String  | 是       | ---        | ---    |
  | name     | 表单子项的原生name属性 | String  | 是       | ---        | ---    |
  | pattern  | 当前项的正则校验       | String  | 否       | ---        | ---    |
  | label    | 当前子项的标签文本     | String  | 否       | ---        | ---    |
  | required | 是否必须               | Boolean | 是       | true/false | ---    |

* uitype为file时的参数配置(**注意:file为上传文件格式**)

  | 参数     | 参数说明               | 类型    | 是否必填 | 可选值     | 默认值 |
  | -------- | ---------------------- | ------- | -------- | ---------- | ------ |
  | uitype   | 表单子项的类型         | String  | 是       | ---        | ---    |
  | name     | 表单子项的原生name属性 | String  | 是       | ---        | ---    |
  | label    | 当前子项的标签文本     | String  | 否       | ---        | ---    |
  | required | 是否必须               | Boolean | 是       | true/false | ---    |

* uitype为str时的参数配置(**注意:str为文字格式**)

  | 参数      | 参数说明               | 类型    | 是否必填 | 可选值     | 默认值 |
  | --------- | ---------------------- | ------- | -------- | ---------- | ------ |
  | uitype    | 表单子项的类型         | String  | 是       | ---        | ---    |
  | minlength | 当前值的最少字符数量   | number  | 否       | ---        | ---    |
  | length    | 当前值的最大字符数量   | number  | 否       | ---        | ---    |
  | value     | 当前子项默认显示的值   | String  | 否       | ---        | ---    |
  | name      | 表单子项的原生name属性 | String  | 是       | ---        | ---    |
  | label     | 当前子项的标签文本     | String  | 否       | ---        | ---    |
  | required  | 是否必须               | Boolean | 是       | true/false | ---    |

+ uitype为int时的参数配置(**注意:int为数字格式**)

  **注意:uitype为int时,数值可以点击增加或者减少,且只能填入数字)**

  | 参数      | 参数说明               | 类型    | 是否必填 | 可选值     | 默认值 |
  | --------- | ---------------------- | ------- | -------- | ---------- | ------ |
  | uitype    | 表单子项的类型         | String  | 是       | ---        | ---    |
  | minlength | 当前值的最少字符数量   | number  | 否       | ---        | ---    |
  | length    | 当前值的最大字符数量   | number  | 否       | ---        | ---    |
  | value     | 当前子项默认显示的值   | String  | 否       | ---        | ---    |
  | name      | 表单子项的原生name属性 | String  | 是       | ---        | ---    |
  | label     | 当前子项的标签文本     | String  | 否       | ---        | ---    |
  | required  | 是否必须               | Boolean | 是       | true/false | ---    |

+ uitype为float时的参数配置(**注意:float为浮点数字格式**)

  | 参数       | 参数说明                   | 类型    | 是否必填 | 可选值     | 默认值 |
  | ---------- | -------------------------- | ------- | -------- | ---------- | ------ |
  | uitype     | 表单子项的类型             | String  | 是       | ---        | ---    |
  | dec_length | 当前值能显示的最少浮点位数 | number  | 否       | ---        | ---    |
  | length     | 当前值能显示的最多浮点位数 | number  | 否       | ---        | ---    |
  | name       | 表单子项的原生name属性     | String  | 是       | ---        | ---    |
  | label      | 当前子项的标签文本         | String  | 否       | ---        | ---    |
  | required   | 是否必须                   | Boolean | 是       | true/false | ---    |

+ uitype为date时的参数配置(**注意:data为时间格式**)

  **注意:此项可以填写时间,也可以选择时间**

  | 参数     | 参数说明               | 类型    | 是否必填 | 可选值     | 默认值 |
  | -------- | ---------------------- | ------- | -------- | ---------- | ------ |
  | uitype   | 表单子项的类型         | String  | 是       | ---        | ---    |
  | name     | 表单子项的原生name属性 | String  | 是       | ---        | ---    |
  | label    | 当前子项的标签文本     | String  | 否       | ---        | ---    |
  | required | 是否必须               | Boolean | 是       | true/false | ---    |

* uitype为password时的参数配置(**注意:password为密码格式**)

  | 参数      | 参数说明               | 类型    | 是否必填 | 可选值     | 默认值 |
  | --------- | ---------------------- | ------- | -------- | ---------- | ------ |
  | uitype    | 表单子项的类型         | String  | 是       | ---        | ---    |
  | minlength | 当前值的最少字符数量   | number  | 否       | ---        | ---    |
  | length    | 当前值的最大字符数量   | number  | 否       | ---        | ---    |
  | name      | 表单子项的原生name属性 | String  | 是       | ---        | ---    |
  | label     | 当前子项的标签文本     | String  | 否       | ---        | ---    |
  | required  | 是否必须               | Boolean | 是       | true/false | ---    |

* uitype为chexkbox时的参数配置(**注意:chexkbox为复选格式**)

  | 参数     | 参数说明                                    | 类型    | 是否必填 | 可选值     | 默认值 |
  | -------- | ------------------------------------------- | ------- | -------- | ---------- | ------ |
  | uitype   | 表单子项的类型                              | String  | 是       | ---        | ---    |
  | name     | 表单子项的原生name属性                      | String  | 是       | ---        | ---    |
  | label    | 当前子项的标签文本                          | String  | 否       | ---        | ---    |
  | required | 是否必须                                    | Boolean | 是       | true/false | ---    |
  | value    | 当前子项默认显示的值                        | number  | 否       | ---        | ---    |
  | dataurl  | 当前项的值的来源,接口地址或者是JSON文件地址 | String  | 是       | ---        | ---    |

* uitype为code时的参数配置(**注意:code为下拉选择格式**)

  | 参数     | 参数说明                                    | 类型    | 是否必填 | 可选值     | 默认值 |
  | -------- | ------------------------------------------- | ------- | -------- | ---------- | ------ |
  | uitype   | 表单子项的类型                              | String  | 是       | ---        | ---    |
  | name     | 表单子项的原生name属性                      | String  | 是       | ---        | ---    |
  | label    | 当前子项的标签文本                          | String  | 否       | ---        | ---    |
  | required | 是否必须                                    | Boolean | 是       | true/false | ---    |
  | value    | 当前子项默认显示的值                        | number  | 否       | ---        | ---    |
  | dataurl  | 当前项的值的来源,接口地址或者是JSON文件地址 | String  | 是       | ---        | ---    |

* uitype为text时的参数配置(**注意:text为文本框格式**)

  | 参数     | 参数说明               | 类型    | 是否必填 | 可选值     | 默认值 |
  | -------- | ---------------------- | ------- | -------- | ---------- | ------ |
  | uitype   | 表单子项的类型         | String  | 是       | ---        | ---    |
  | value    | 当前子项默认显示的值   | String  | 否       | ---        | ---    |
  | name     | 表单子项的原生name属性 | String  | 是       | ---        | ---    |
  | label    | 当前子项的标签文本     | String  | 否       | ---        | ---    |
  | required | 是否必须               | Boolean | 是       | true/false | ---    |
