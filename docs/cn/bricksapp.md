# BricksApp
BricksApp是Bricks框架的应用类， BricksApp用来初始化Bricks环境，创建Bricks页面的根控件

并将生成的根控件插入的全局控件Body中，

Body对应的dom_element为页面的“body”元素。

后续可以通过bricks_app全局变量来引用BricksApp实例。

## 构建选项
```
    	opts = {
			login_url:
			"charsize:
			"language":
			"i18n":{
				"url":'rrr',
				"default_lang":'en'
			},
			"widget":{
				"widgettype":"Text",
				"options":{
				}
			}
		}
```
### login_url
 登录url，按照后台设置，当需要访问受控url时会从此URL返回的json数据创建登录窗体，用户登录

### chartsize
字符大小，缺省16px

### languange
页面使用的语言，两个字符的语言

### i18n
定义国际化数据获取路径，url按照GET方式，language作为参数，像后台获取改语言的json格式的翻译数据。
### widget
根控件描述对象

## 属性

### opts
保存创建选项

### login_url
用于构建登录控件的url

### charsize
字符大小，所有输入控件，Text， Icon，Title？都受此影响控件大小。
### lang
前端界面语言，选项指定或获取缺省语言
### textList

### i18n
### session_id
## 方法

## 事件

