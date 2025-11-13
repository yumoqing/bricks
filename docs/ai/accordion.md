# Accordion
用于实现手风琴式折叠面板效果，允许用户通过点击选项卡切换显示对应的内容区域；类型为容器控件，继承自bricks.VBox。

## 主要方法
| 方法名 | 功能说明 | 参数/选项 |
|--------|----------|-----------|
| `constructor(opts)` | 初始化手风琴控件，创建选项卡按钮并默认展开第一个选项卡内容 | - `item_size`：选项卡高度，默认值为`25px` <br> - `items`：选项卡配置数组，每个项需包含`name`（唯一标识）、`icon`（图标类名）、`label`（选项卡文本）、`content`（选项卡对应的内容控件JSON）、`refresh`（是否每次切换都重新构建内容，默认`false`） <br> - `item_css`：选项卡按钮的CSS类，默认`accordion-button` <br> - `content_css`：内容区域的CSS类，默认`accordion-content` |
| `async change_content(event)` | 点击选项卡按钮时触发，切换显示对应的内容区域。若`refresh`为`true`或内容未构建过，则重新构建内容控件 | - `event`：事件对象，`target.bricks_widget`指向被点击的选项卡按钮 |

## 主要事件
| 事件名 | 触发时机 |
|--------|----------|
| `click`（选项卡按钮） | 用户点击手风琴的任意选项卡按钮时触发，进而执行内容切换逻辑 |

## 源码例子
```json
{
  "id": "demo_accordion",  // 手风琴控件唯一ID
  "widgettype": "Accordion",  // 控件类型为Accordion
  "options": {
    "item_size": "30px",  // 自定义选项卡高度为30px
    "items": [  // 选项卡配置数组
      {
        "name": "tab_home",  // 选项卡唯一标识
        "icon": "icon-home",  // 选项卡图标类名
        "label": "首页",  // 选项卡文本
        "content": {  // 首页对应的内容控件（Label）
          "widgettype": "Label",
          "options": {
            "text": "欢迎使用手风琴控件演示",
            "align": "center"
          }
        }
      },
      {
        "name": "tab_info",
        "icon": "icon-info",
        "label": "信息",
        "content": {  // 信息页对应的内容控件（VBox容器，包含Label和Button）
          "widgettype": "VBox",
          "options": {
            "align": "left"
          },
          "subwidgets": [
            {
              "widgettype": "Label",
              "options": {"text": "手风琴支持动态加载内容"}
            },
            {
              "widgettype": "Button",
              "options": {"label": "查看详情"},
              "binds": [  // 按钮事件绑定
                {
                  "actiontype": "script",
                  "wid": "infoBtn",  // 按钮ID
                  "event": "click",
                  "target": "demo_accordion",
                  "script": "console.log('点击了查看详情按钮');"  // 执行自定义脚本
                }
              ]
            }
          ]
        }
      }
    ]
  }
}
```