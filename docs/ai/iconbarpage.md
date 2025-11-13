# IconbarPage

**用途**：`IconbarPage` 是一个容器控件，用于构建具有图标工具栏（IconTextBar）和内容区域的页面布局。工具栏可放置在页面顶部或底部，点击工具栏中的图标按钮会动态加载并显示对应的内容模块。常用于导航式界面设计，如管理后台、多标签页应用等。

**类型**：容器控件，继承自 `bricks.VBox`

---

## 主要方法

- `constructor(opts)`  
  构造函数，初始化布局结构。根据 `opts.bar_at` 决定工具栏位置（top/bottom），创建 `IconTextBar` 工具栏和 `Filler` 内容容器，并绑定命令事件。

- `command_handle(event)`  
  工具栏触发 `'command'` 事件时的处理函数，接收选中工具项信息，并调用 `show_content` 切换内容。

- `show_content(tool)`  
  异步方法，根据传入的 `tool` 配置动态构建其 `content` 对应的控件，并替换当前内容区域的子控件。

---

## 主要事件

- `'command'`  
  当用户点击工具栏上的某个工具项时，由 `IconTextBar` 触发此事件，携带 `tool` 数据作为参数，被 `command_handle` 捕获用于切换内容。

---

## 源码例子

```json
{
  "id": "main_iconbar_page",
  "widgettype": "IconbarPage",
  "options": {
    "bar_at": "top", // 可选 'top' 或 'bottom'，指定工具栏位置
    "bar_opts": {
      "margin": "5px",           // 工具栏外边距
      "rate": 1,                 // 布局比例
      "tools": [
        {
          "name": "dashboard",
          "icon": "fa fa-tachometer",         // 图标类名（如 Font Awesome）
          "label": "仪表盘",                  // 显示文本（可选）
          "tip": "进入系统仪表盘",            // 提示文字
          "dynsize": false,                   // 是否动态调整大小
          "rate": 1,
          "content": {
            "widgettype": "Label",
            "options": {
              "text": "欢迎来到仪表盘页面！"
            }
          }
        },
        {
          "name": "users",
          "icon": "fa fa-users",
          "label": "用户管理",
          "tip": "管理所有用户信息",
          "content": {
            "widgettype": "urlwidget",
            "options": {
              "url": "/widgets/users.ui",     // 远程加载用户管理界面
              "method": "GET",
              "params": {}
            }
          }
        },
        {
          "name": "settings",
          "icon": "fa fa-cog",
          "label": "系统设置",
          "tip": "配置系统参数",
          "content": {
            "widgettype": "VBox",
            "options": {},
            "subwidgets": [
              {
                "widgettype": "Label",
                "options": {
                  "text": "这里是系统设置页面"
                }
              },
              {
                "widgettype": "Button",
                "options": {
                  "text": "保存设置"
                },
                "binds": [
                  {
                    "actiontype": "script",
                    "wid": "main_iconbar_page",
                    "event": "click",
                    "target": "main_iconbar_page",
                    "script": "alert('设置已保存')",
                    "conform": {
                      "title": "确认保存",
                      "message": "您确定要保存这些设置吗？"
                    }
                  }
                ]
              }
            ]
          }
        }
      ]
    }
  },
  "subwidgets": [],  // 此控件自身不在此处定义子控件，而是通过 bar_opts.tools 动态加载
  "binds": [
    {
      "actiontype": "method",
      "wid": "main_iconbar_page",
      "event": "init",
      "target": "main_iconbar_page",
      "method": "show_content",
      "params": {
        "tool": {
          "content": {
            "widgettype": "Label",
            "options": {
              "text": "初始化默认内容"
            }
          }
        }
      }
    }
  ]
}
```

> **注释说明**：
> - `IconbarPage` 使用 `bar_opts.tools` 数组定义多个功能入口，每个 `tool` 包含一个 `content` 字段，描述要加载的子界面。
> - `urlwidget` 类型可用于懒加载远程 `.ui` 文件，实现按需加载模块。
> - 通过 `binds` 绑定初始化行为，可在页面加载后自动显示默认内容。
> - `conform` 提供操作前的确认弹窗，增强用户体验与安全性。