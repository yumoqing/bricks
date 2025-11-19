# Menu

控件功能：用于创建可交互的菜单组件，支持静态菜单项、嵌套子菜单以及动态加载远程子菜单。点击菜单项可触发页面跳转或弹出窗口等行为。  
类型：容器控件  
父类控件：`bricks.VBox`

## 初始化参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `options.bgcolor` | String | 菜单背景颜色，默认为 `"white"` |
| `options.items` | Array | 菜单项数组，每个项包含 label、url、icon、target 等属性（详见 `create_menuitem` 和 `create_children` 方法） |
| `options.item_cheight` | Number | 菜单项的高度单位（cheight），影响图标和文本布局 |
| `options.menuitem_css` | String | 自定义菜单项的 CSS 样式名称 |
| `options.target` | String | 点击菜单项后目标容器类型，如 `'PopupWindow'`, `'Popup'` 或其他 widget ID |
| `options.popup_options` | Object | 弹窗相关配置选项，用于定制 PopupWindow 或 Popup 的显示行为 |

> 注：`options` 还会传递给父类 `VBox`，继承其通用布局参数。

## 主要事件

- **`item_click`**  
  触发时机：用户点击某个菜单项时  
  回调参数：`item` 对象（包含 `label`, `url`, `icon`, `target` 等字段）  
  处理逻辑：根据 `item.target` 决定打开方式（新窗口、弹窗或替换指定控件内容），并通过 `widgetBuild` 加载对应 URL 内容。

- **`command`**  
  触发时机：在 `menu_clicked` 处理完导航逻辑后派发  
  回调参数：与 `item_click` 相同的 `opts` 对象  
  用途：通知外部系统执行附加命令或进行状态更新。

> 事件绑定通过 `this.bind('item_click', ...)` 在构造函数中设置，并由 `regen_menuitem_event` 触发。
