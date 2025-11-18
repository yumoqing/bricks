# TabPanel

**用处**：`TabPanel` 是一个容器控件，用于实现多标签页界面布局，允许用户在多个子界面之间切换。常用于管理多个独立内容区域（如配置页面、数据面板等），提升界面空间利用率。

**类型**：容器控件，继承自 `bricks.Layout`

---

## 主要方法

| 方法名 | 参数 | 说明 |
|--------|------|------|
| `show_first_tab()` | 无 | 显示第一个标签页的内容，通常在初始化完成后调用 |
| `createToolbar()` | 无 | 创建顶部或侧边的标签工具栏（基于 `bricks.Toolbar`） |
| `show_tabcontent(event)` | event: 事件对象 | 异步加载并显示指定标签页的内容，支持缓存和动态构建 |
| `switch_content(w)` | w: widget 实例 | 切换当前显示的内容为指定控件，并触发相关事件 |
| `add_tab(desc)` | desc: 标签描述对象 | 动态添加一个新的标签页 |
| `tab_removed(event)` | event: 移除事件对象 | 处理标签被关闭后的清理逻辑，包括内存缓存和自动切换 |

---

## 主要事件

| 事件名 | 触发时机 | 携带数据 |
|--------|--------|---------|
| `switch` | 当标签页切换完成时触发 | 当前激活的内容控件实例（widget） |
| `active`（子控件事件） | 子控件被切换到可见状态时，在其自身上派发 | 无参数，表示该内容已激活 |

---

## 源码例子

```json
{
  "id": "main_tab_panel",
  "widgettype": "TabPanel",
  "options": {
    "tab_pos": "top",        // 标签位置：可选 'top', 'bottom', 'left', 'right'
    "tab_long": "100%",      // 标签栏宽度/高度设置
    "css": "custom-tab-style", // 自定义CSS类名
    "items": [               // 标签页列表
      {
        "name": "home",
        "label": "首页",
        "icon": "home-icon",
        "removable": false,
        "refresh": true,
        "content": {         // 内容部分是一个控件描述JSON
          "widgettype": "VBox",
          "options": {
            "css": "home-container"
          },
          "subwidgets": [
            {
              "widgettype": "Label",
              "options": {
                "text": "欢迎使用Bricks框架！"
              }
            },
            {
              "widgettype": "Button",
              "options": {
                "text": "点击测试"
              },
              "binds": [
                {
                  "actiontype": "script",
                  "wid": "main_tab_panel",
                  "event": "click",
                  "target": "",
                  "script": "console.log('按钮被点击了');",
                  "params": {}
                }
              ]
            }
          ]
        }
      },
      {
        "name": "settings",
        "label": "设置",
        "icon": "setting-icon",
        "removable": true,   // 可关闭标签
        "refresh": false,    // 不刷新，使用缓存
        "content": {
          "widgettype": "urlwidget",
          "options": {
            "url": "/ui/settings.ui",  // 从服务器异步加载设置页面
            "method": "GET",
            "params": {}
          }
        }
      }
    ]
  },
  "binds": [
    {
      "actiontype": "event",
      "wid": "main_tab_panel",
      "event": "switch",
      "target": "status_bar",
      "rtdata": {
        "message": "标签已切换"
      },
      "dispatch_event": "update_status"
    }
  ]
}
```

> **注释说明**：
- `tab_pos`: 控制标签栏的位置，影响布局方向（水平或垂直）
- `items[].content`: 支持直接嵌套控件 JSON 或使用 `urlwidget` 异步加载模块化页面
- `removable`: 若为 `true`，标签显示关闭按钮，用户可手动关闭
- `refresh`: 若为 `false`，切换时复用已创建的控件实例，提高性能
- 使用 `binds` 监听 `switch` 事件，可用于更新状态栏、日志记录等操作

--- 

✅ **最佳实践建议**：
- 对于复杂子页面推荐使用 `urlwidget` 实现按需加载，减少初始渲染负担
- 频繁切换的标签建议设置 `refresh: false` 以启用缓存机制
- 利用 `switch` 事件做全局状态同步，例如菜单高亮、权限控制等