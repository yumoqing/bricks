# Text
用处：用于在界面上显示静态文本内容，支持国际化、文本对齐和样式配置  
类型：普通控件，继承自`TextBase`

## 主要方法
| 方法名         | 描述                                                                 |
|----------------|----------------------------------------------------------------------|
| `set_text(text)` | 设置控件显示的文本内容                                               |
| `set_otext(otxt)` | 设置国际化文本键，自动根据当前语言翻译并显示                          |
| `set_style(k, v)` | 设置控件的CSS样式属性                                               |
| `set_css(css)`   | 为控件添加CSS类                                                     |

## 主要事件
无自定义事件（继承自`JsWidget`的基础事件如`click`、`mousemove`等可用）

## 源码例子
```json
{
  "id": "text_demo",
  "widgettype": "Text",
  "options": {
    "text": "Hello, Bricks!", // 直接设置显示文本
    "halign": "center", // 水平居中对齐
    "valign": "middle", // 垂直居中对齐
    "css": "my-text-style", // 自定义CSS类
    "bgcolor": "#f0f0f0" // 背景颜色
  },
  "binds": [
    {
      "actiontype": "script",
      "wid": "text_demo",
      "event": "click",
      "script": "console.log('Text clicked!')" // 点击时执行脚本
    }
  ]
}
```


# KeyinText
用处：允许用户通过键盘输入和编辑文本内容，并在文本变化时触发事件通知  
类型：普通控件，继承自`Text`

## 主要方法
| 方法名               | 描述                                                                 |
|----------------------|----------------------------------------------------------------------|
| `key_down_action(event)` | 处理键盘输入事件，支持删除、退格和字符输入                          |
| `dispatch_changed()`   | 当文本内容变化时触发`changed`事件                                   |
| `set_text(text)`       | 设置控件显示的文本内容                                               |

## 主要事件
| 事件名   | 描述                                                                 |
|----------|----------------------------------------------------------------------|
| `changed` | 当文本内容发生变化时触发，携带当前文本数据                          |

## 源码例子
```json
{
  "id": "keyin_demo",
  "widgettype": "KeyinText",
  "options": {
    "text": "Enter text here...", // 初始文本
    "name": "input_data", // 事件数据中的键名
    "halign": "left", // 左对齐
    "width": "200px" // 宽度
  },
  "binds": [
    {
      "actiontype": "script",
      "wid": "keyin_demo",
      "event": "changed",
      "script": "console.log('Input changed:', params)" // 文本变化时打印数据
    }
  ]
}
```


# Title1
用处：用于显示一级标题文本，字体较大且加粗  
类型：普通控件，继承自`TextBase`

## 主要方法
同`Text`控件

## 主要事件
无自定义事件

## 源码例子
```json
{
  "id": "title1_demo",
  "widgettype": "Title1",
  "options": {
    "text": "Main Title", // 标题文本
    "halign": "center" // 居中对齐
  }
}
```


# Title2
用处：用于显示二级标题文本，字体大小略小于Title1且加粗  
类型：普通控件，继承自`TextBase`

## 主要方法
同`Text`控件

## 主要事件
无自定义事件

## 源码例子
```json
{
  "id": "title2_demo",
  "widgettype": "Title2",
  "options": {
    "text": "Section Title", // 标题文本
    "halign": "left" // 左对齐
  }
}
```


# Title3
用处：用于显示三级标题文本，字体大小略小于Title2且加粗  
类型：普通控件，继承自`TextBase`

## 主要方法
同`Text`控件

## 主要事件
无自定义事件

## 源码例子
```json
{
  "id": "title3_demo",
  "widgettype": "Title3",
  "options": {
    "text": "Subsection Title", // 标题文本
    "css": "custom-title" // 自定义样式
  }
}
```


# Title4
用处：用于显示四级标题文本，字体大小略小于Title3且加粗  
类型：普通控件，继承自`TextBase`

## 主要方法
同`Text`控件

## 主要事件
无自定义事件

## 源码例子
```json
{
  "id": "title4_demo",
  "widgettype": "Title4",
  "options": {
    "otext": "i18n_title", // 国际化文本键
    "i18n": true // 启用国际化
  }
}
```


# Title5
用处：用于显示五级标题文本，字体大小略小于Title4且加粗  
类型：普通控件，继承自`TextBase`

## 主要方法
同`Text`控件

## 主要事件
无自定义事件

## 源码例子
```json
{
  "id": "title5_demo",
  "widgettype": "Title5",
  "options": {
    "text": "Small Title", // 标题文本
    "color": "#333333" // 文本颜色
  }
}
```


# Title6
用处：用于显示六级标题文本，字体大小略小于Title5且加粗  
类型：普通控件，继承自`TextBase`

## 主要方法
同`Text`控件

## 主要事件
无自定义事件

## 源码例子
```json
{
  "id": "title6_demo",
  "widgettype": "Title6",
  "options": {
    "text": "Caption", // 标题文本
    "bgcolor": "#ffffff" // 背景颜色
  }
}
```


# Tooltip
用处：用于在用户与目标控件交互时显示提示信息，支持自动隐藏和位置调整  
类型：普通控件，继承自`Text`

## 主要方法
| 方法名           | 描述                                                                 |
|------------------|----------------------------------------------------------------------|
| `show(otext, event)` | 显示提示信息，接收国际化文本键和触发事件以定位                          |
| `hide()`           | 隐藏提示信息                                                         |

## 主要事件
无自定义事件（通常与目标控件的鼠标事件联动使用）

## 源码例子
```json
{
  "id": "tooltip_target",
  "widgettype": "Button", // 假设存在Button控件
  "options": {
    "text": "Hover me", // 按钮文本
    "tip": "This is a button" // Tooltip提示文本
  },
  "subwidgets": [
    {
      "id": "tooltip_demo",
      "widgettype": "Tooltip",
      "options": {
        "rate": 0.8, // 文本缩放比例
        "text": "Default tooltip" // 默认提示文本
      }
    }
  ]
}
```

> 注意：Tooltip通常通过目标控件的`tip`属性自动关联，无需单独定义。上述例子展示了手动创建Tooltip的方式。