# IconBar

用于创建一个图标工具栏，支持多个可点击的图标按钮，常用于顶部或侧边导航工具条。属于**容器控件**，继承自 `bricks.HBox`。

## 主要方法

- `build_item(opts)`  
  根据传入的图标配置项创建单个图标控件（`Svg` 或 `BlankIcon`），并绑定点击事件。
  
- `regen_event(desc, event)`  
  处理图标点击后的逻辑：触发对应图标的命名事件和统一的 `'command'` 事件，并管理选中状态样式。

## 主要事件

- `dispatch(desc.name, desc)`  
  当某个图标被点击时，会派发以该图标 `name` 命名的自定义事件，携带图标描述对象作为参数。

- `dispatch('command', desc)`  
  所有图标点击都会统一触发 `'command'` 事件，可用于集中处理工具栏命令。

## 源码例子

```json
{
  "id": "icon_toolbar",
  "widgettype": "IconBar",
  "options": {
    "margin": "10px",           // 图标之间的左右外边距
    "rate": 1,                  // 缩放比率，影响图标大小
    "cheight": 2,               // 图标高度单位（基于字符高度）
    "tools": [                  // 工具图标列表
      {
        "name": "save",         // 图标唯一标识名称
        "icon": "/static/icons/save.svg",  // SVG 图标路径
        "tip": "保存文件",       // 提示文本（可选）
        "rate": 1               // 单独设置此图标的缩放比例
      },
      {
        "name": "print",
        "icon": "/static/icons/print.svg",
        "tip": "打印当前页面"
      },
      {
        "name": "blankicon"     // 特殊类型：空白占位图标
      }
    ]
  },
  "binds": [
    {
      "actiontype": "event",
      "wid": "icon_toolbar",
      "event": "save",          // 监听名为 'save' 的事件（由点击 save 图标触发）
      "target": "main_app",
      "dispatch_event": "onSave",
      "params": {
        "from": "toolbar"
      }
    },
    {
      "actiontype": "script",
      "wid": "icon_toolbar",
      "event": "command",       // 监听所有命令
      "target": "Popup",
      "script": "console.log('执行命令:', params.name); if(params.tip) showTip(params.tip);",
      "params": {
        "name": "{data.name}",  // 动态获取事件数据中的 name 字段
        "tip": "{data.tip}"
      }
    }
  ],
  "subwidgets": []  // IconBar 自身是容器，但通常不手动添加 subwidgets，由 tools 自动生成
}
```

> ✅ **注释说明：**
> - `tools` 数组中每个对象代表一个图标按钮；
> - `name` 是事件分发的关键标识；
> - `icon` 必须指向有效的 SVG 资源 URL；
> - 使用 `blankicon` 可插入空格占位符；
> - 通过 `binds` 可监听具体图标事件或统一的 `command` 事件进行响应；
> - `FloatIconBar` 和 `IconTextBar` 分别扩展了浮动显示与图文混合功能。