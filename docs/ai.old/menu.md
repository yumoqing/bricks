# Menu

**用途**：`Menu` 是一个用于构建树形结构菜单的容器控件，支持多级子菜单、动态加载子菜单内容（通过 URL 异步加载）、点击触发页面跳转或弹窗等功能。常用于侧边栏导航、系统功能入口等场景。

**类型**：容器控件，继承自 `bricks.VBox`

---

## 主要方法

- `create_menuitem(item)`  
  根据菜单项配置创建一个 HBox 形式的菜单项，包含图标和文本，并绑定数据。

- `create_submenu_container()`  
  创建一个用于包裹子菜单的 VBox 容器，默认隐藏（`display: none`），并设置左外边距以实现缩进效果。

- `create_children(w, items)`  
  递归创建菜单项及其子菜单。支持静态嵌套菜单（`items`）和动态加载菜单（`submenu` 属性指定 URL）。

- `menu_clicked(event)`  
  菜单项被点击时的回调函数。根据目标类型（如 `PopupWindow`、`Popup` 或普通控件）加载远程 UI 并渲染到目标容器中，同时派发 `command` 事件。

- `load_submenu(container, event)`  
  动态加载子菜单内容（通过 `submenu_url` 指定的 URL 获取 JSON 数据），仅在首次展开时加载一次，提升性能。

- `items_toggle_hide(w, event)`  
  切换子菜单的显示/隐藏状态，阻止事件冒泡。

- `regen_menuitem_event(item, event)`  
  当普通菜单项被点击时，重新派发 `item_click` 事件，携带该菜单项的数据。

- `get_submenu_items(url)`  
  异步从服务器获取子菜单数据（返回 JSON 中的 `items` 数组），用于动态加载。

---

## 主要事件

- `item_click`  
  当任意菜单项被点击时触发，参数为当前菜单项的配置对象（如 `label`, `url`, `target` 等）。通常由 `regen_menuitem_event` 触发。

- `command`  
  在 `menu_clicked` 方法中派发，表示已执行某个命令（例如跳转、打开弹窗等），携带原始菜单项参数，可用于外部监听处理业务逻辑。

---

## 源码例子

```json
{
  "id": "main_menu",
  "widgettype": "Menu",
  "options": {
    "bgcolor": "#f5f5f5",
    "item_cheight": 2.5,
    "menuitem_css": "custom-menu-item"
  },
  "subwidgets": [],
  "binds": [
    {
      "actiontype": "bricks",
      "wid": "main_menu",
      "event": "command",
      "target": "status_bar",
      "datawidget": "main_menu",
      "datamethod": "getValue",
      "rtdata": {
        "message": "菜单命令已执行"
      }
    }
  ],
  "options": {
    "items": [
      {
        "label": "仪表盘",
        "icon": "/icons/dashboard.png",
        "url": "/ui/dashboard.ui",
        "target": "content_area"
      },
      {
        "label": "用户管理",
        "icon": "/icons/users.png",
        "items": [
          {
            "label": "用户列表",
            "url": "/ui/user/list.ui",
            "target": "content_area"
          },
          {
            "label": "角色权限",
            "url": "/ui/user/roles.ui",
            "target": "Popup"
          }
        ]
      },
      {
        "label": "报表中心",
        "icon": "/icons/reports.png",
        "submenu": "/api/menu/reports", // 动态加载子菜单
        "target": "content_area"
      },
      {
        "label": "系统设置",
        "icon": "/icons/settings.png",
        "url": "/ui/settings.ui",
        "target": "PopupWindow",
        "popup_options": {
          "width": 800,
          "height": 600,
          "title": "系统设置"
        }
      }
    ]
  }
}
```

### 注释说明：

- `"widgettype": "Menu"`：使用注册的 `Menu` 控件。
- `options.items`：定义菜单结构数组，每个元素是一个菜单项。
  - `label`：显示文本，支持 i18n。
  - `icon`：左侧图标路径。
  - `url`：点击后要加载的 `.ui` 文件地址。
  - `target`：目标容器 ID 或特殊值：
    - `"content_area"`：普通容器控件 ID。
    - `"Popup"`：在浮层中打开。
    - `"PopupWindow"`：在新窗口中打开。
  - `items`：静态嵌套子菜单。
  - `submenu`：字符串 URL，表示此菜单项的子菜单需异步加载（首次点击展开时请求）。
- `binds` 示例：监听 `command` 事件，在状态栏提示操作成功。
- `options.bgcolor`：设置菜单背景色。
- `item_cheight`：控制菜单项高度。
- `menuitem_css`：自定义菜单项样式类名。

> 💡 **提示**：若某菜单项有 `submenu` 字段，则其子菜单将在第一次展开时通过 AJAX 请求获取，适用于大型系统中按需加载菜单结构，减少初始资源消耗。