# Image

用于在页面中显示图片，支持网络图片、Base64 编码图片以及错误时的默认图片回退机制。  
**类型：普通控件（继承自 `JsWidget`）**

## 主要方法

- `create()`  
  创建 `<img>` 元素并赋值给 `this.dom_element`。

- `set_url(url)`  
  设置图片的 `src` 属性，并绑定 `onerror` 事件以支持默认图回退。

- `set_default_url()`  
  当图片加载失败时，切换为默认图片（需配置 `default_url` 选项）。

- `base64()`  
  将当前图像绘制到 Canvas 并返回 PNG 格式的 Base64 数据 URL。

- `removeBase64Header(base64String)`  
  移除 Base64 字符串中的 MIME 头信息（如 `data:image/png;base64,`）。

## 主要事件

无自定义事件。原生 `load` 和 `error` 事件可通过 DOM 监听。

## 源码例子

```json
{
  "id": "img_user_avatar",
  "widgettype": "Image",
  "options": {
    "url": "https://example.com/avatar.png",           // 图片地址
    "default_url": "images/default-avatar.png"         // 加载失败时显示的默认图
  },
  "binds": [
    {
      "actiontype": "script",
      "wid": "img_user_avatar",
      "event": "click",
      "script": "console.log('Image clicked:', data);",
      "params": {},
      "rtdata": {
        "imageId": "img_user_avatar"
      }
    },
    {
      "actiontype": "method",
      "wid": "img_user_avatar",
      "event": "load",
      "target": "img_user_avatar",
      "method": "base64",
      "rtdata": {
        "info": "Image loaded and converted to base64"
      }
    }
  ]
}
```

> ✅ 注释说明：
> - `widgettype: "Image"` 表示使用注册的 Image 控件。
> - `options.url` 是必须项，指定图片源。
> - `default_url` 可选，用于容错处理。
> - 点击图片会执行一段脚本输出日志。
> - 图片成功加载后调用 `base64()` 方法获取其 Base64 编码数据。

---

# Icon

图标控件，扩展自 `Image`，支持基于字符单位（charsize）动态调整尺寸，常用于界面小图标展示。  
**类型：普通控件（继承自 `Image`）**

## 主要方法

- `options_parse()`  
  解析图标大小相关参数，根据 `rate`、`cwidth`、`cheight` 和 `dynsize` 调整样式尺寸。

- `charsize_sizing()`  
  （继承自父类或 JsWidget 工具方法）根据 `bricks.app.charsize` 计算实际像素大小并设置宽高。

## 主要事件

无自定义事件，可监听原生事件如 `click`。

## 源码例子

```json
{
  "id": "icon_home",
  "widgettype": "Icon",
  "options": {
    "url": "icons/home.svg",          // 图标资源路径
    "rate": 1.5,                      // 相对于基础字符尺寸的比例
    "cwidth": 1,                      // 占据字符宽度数
    "cheight": 1,                     // 占据字符高度数
    "dynsize": true                   // 是否启用动态尺寸适配
  },
  "binds": [
    {
      "actiontype": "event",
      "wid": "icon_home",
      "event": "click",
      "target": "SidebarMenu",
      "dispatch_event": "navigate",
      "params": {
        "page": "home"
      },
      "conform": {
        "title": "Confirm Navigation",
        "message": "Go to home page?",
        "confirm_text": "Yes",
        "cancel_text": "No"
      }
    }
  ]
}
```

> ✅ 注释说明：
> - `rate: 1.5` 表示图标为标准字符大小的 1.5 倍。
> - `dynsize: true` 启用响应式尺寸计算。
> - 点击图标将向目标控件 `SidebarMenu` 派发名为 `navigate` 的自定义事件，并携带参数 `{page: 'home'}`。
> - `conform` 提供用户确认弹窗，防止误操作。

---

# StatedIcon

状态图标控件，扩展自 `Icon`，支持多个状态（state）对应不同图标，适用于开关、模式切换等场景。  
**类型：普通控件（继承自 `Icon`）**

## 主要方法

- `options_parse()`  
  初始化状态系统，若未设置初始状态，则取第一个状态作为默认。

- `set_state(state)`  
  切换图标状态，查找匹配的状态对象并更新 `url`，重新渲染图标。

## 主要事件

无自定义事件，可通过 `binds` 触发状态变更。

## 源码例子

```json
{
  "id": "icon_power",
  "widgettype": "StatedIcon",
  "options": {
    "state": "off",                                   // 当前状态
    "states": [                                     // 状态列表
      {
        "state": "on",
        "url": "icons/power-on.svg"
      },
      {
        "state": "off",
        "url": "icons/power-off.svg"
      }
    ],
    "rate": 2,
    "cwidth": 1,
    "cheight": 1
  },
  "binds": [
    {
      "actiontype": "method",
      "wid": "icon_power",
      "event": "click",
      "target": "icon_power",
      "method": "set_state",
      "params": {
        "state": "=this.state === 'on' ? 'off' : 'on'"  // 动态翻转状态
      }
    },
    {
      "actiontype": "registerfunction",
      "wid": "icon_power",
      "event": "click",
      "rfname": "logUserAction",
      "params": {
        "action": "toggle_power",
        "targetId": "icon_power",
        "fromState": "=this.state",
        "toState": "=this.state === 'on' ? 'off' : 'on'"
      }
    }
  ]
}
```

> ✅ 注释说明：
> - `states` 定义了两个状态 `"on"` 和 `"off"`，分别对应不同的图标。
> - 初始状态为 `"off"`。
> - 点击时通过 `method` 调用自身 `set_state` 方法实现状态翻转。
> - 使用 `registerfunction` 调用全局函数 `logUserAction` 记录用户行为。
> - `=` 开头的字符串表示表达式求值（运行时计算），是 bricks 支持的动态语法扩展。

---

# BlankIcon

空白占位图标，不显示任何图像，仅用于布局占位，但支持与 `Icon` 一致的尺寸控制逻辑。  
**类型：普通控件（继承自 `JsWidget`）**

## 主要方法

- 构造函数中调用 `charsize_sizing()` 实现基于字符单位的尺寸控制。

## 主要事件

无

## 源码例子

```json
{
  "id": "placeholder_icon",
  "widgettype": "BlankIcon",
  "options": {
    "cwidth": 2,                       // 占据 2 个字符宽度
    "cheight": 1,                      // 占据 1 个字符高度
    "rate": 1,                         // 尺寸比例
    "dynsize": true                    // 启用动态尺寸
  }
}
```

> ✅ 注释说明：
> - `BlankIcon` 不创建图像元素，仅作为空白容器参与布局。
> - 常用于对齐或响应式布局中保持视觉一致性。
> - 支持与其他图标相同的 `cwidth`/`cheight`/`rate` 参数体系，便于统一管理 UI 尺寸规范。

--- 

> 📌 **总结提示**：  
> 所有控件均通过 `bricks.Factory.register()` 注册后方可使用；  
> 在 `.ui` 文件中编写 JSON 结构即可声明式构建界面；  
> `binds` 提供强大的交互能力，结合 `script`、`method`、`event` 等动作类型可灵活控制应用逻辑。