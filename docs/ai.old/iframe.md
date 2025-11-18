# Iframe

Iframe 是一个容器控件，继承自 `bricks.Layout`，属于普通控件（虽然继承自容器类 Layout，但通常不用于放置子控件，而是嵌入外部网页内容）。该控件用于在当前页面中嵌入一个 `<iframe>` 元素，加载并显示指定 URL 的网页内容。适用于需要集成第三方页面、展示帮助文档或嵌入管理系统子模块的场景。

**类型：** 普通控件（继承自 `Layout`）

---

## 主要方法

- `create()`  
  创建底层 DOM 元素（`<iframe>`），并在构造函数中设置其 `src` 属性为传入的 `url` 参数。

- `setValue(url)`  
  动态更新 iframe 的 `src`，实现页面内容切换。

- `getValue()`  
  返回当前 iframe 的 `src` 地址。

---

## 主要事件

Iframe 控件本身不定义自定义事件，但可监听原生 iframe 的事件，如：

- `'load'`：当 iframe 内容加载完成时触发。
- 自定义事件可通过 `binds` 机制绑定和派发。

---

## 源码例子

```json
{
  "id": "helpFrame",                    // 控件唯一标识
  "widgettype": "Iframe",               // 控件类型，必须为注册过的名称
  "options": {
    "url": "/docs/intro.html",          // 要嵌入的网页地址
    "height": "600px",                  // 可选：设置高度，默认为 '100%'
    "width": "100%"                     // 可选：宽度，默认为父容器宽度
  },
  "binds": [
    {
      "actiontype": "method",           // 执行目标控件的方法
      "wid": "refreshBtn",              // 触发组件 ID（例如一个按钮）
      "event": "click",                 // 监听点击事件
      "target": "helpFrame",            // 目标是当前 iframe
      "method": "setValue",             // 调用 setValue 方法
      "params": {
        "value": "/docs/latest.html"    // 新的 URL 值
      }
    },
    {
      "actiontype": "script",           // 执行脚本
      "wid": "logLoad",
      "event": "load",                  // 当 iframe 加载完成后
      "target": "helpFrame",
      "script": "console.log('Iframe content loaded:', wid);",
      "params": {}
    }
  ]
}
```

> ✅ **注释说明：**
> - `widgettype` 必须与 Bricks 注册表中的名称一致（如 `Iframe`）。
> - `options.url` 是必需参数，决定 iframe 显示的内容。
> - 使用 `binds` 可实现动态控制 iframe 内容更新或响应加载状态。
> - 若需传递参数给远程页面，可在 `url` 中附加查询字符串。

---

# NewWindow

NewWindow 是一个普通控件，继承自 `bricks.JsWidget`，用于在用户交互时打开一个新的浏览器窗口或标签页。常用于跳转到外部系统、弹出帮助页面或导出报表等场景。

**类型：** 普通控件（非容器，无子控件）

---

## 主要方法

- 构造函数自动调用 `window.open()` 打开新窗口。
- 不提供额外方法，行为完全由初始化参数决定。

---

## 主要事件

NewWindow 控件不支持事件绑定（因为它不渲染任何可见 DOM 元素），其行为是一次性执行打开窗口操作。

---

## 源码例子

```json
{
  "id": "openHelpWindow",
  "widgettype": "NewWindow",             // 控件类型
  "options": {
    "url": "https://example.com/help",  // 要打开的 URL
    "name": "help_window",              // 窗口名称（可选）
    "features": "width=800,height=600"  // 窗口特性（可选，传给 window.open）
  },
  "binds": [
    {
      "actiontype": "bricks",           // 使用 bricks 动作创建控件
      "wid": "helpBtn",                 // 绑定到某个按钮的点击
      "event": "click",
      "target": "Popup",                // 特殊目标：弹出层（此处实际是新开窗口）
      "mode": "replace",
      "options": {
        "widgettype": "NewWindow",
        "options": {
          "url": "https://example.com/tutorial",
          "name": "_blank"
        }
      }
    }
  ]
}
```

> ✅ **注释说明：**
> - `NewWindow` 不会在当前页面渲染任何元素，仅在触发时打开新窗口。
> - 通常通过其他控件（如按钮）的事件来触发。
> - `target: "Popup"` 配合 `actiontype: "bricks"` 实现动态打开新窗口的行为。
> - 更常见的是直接使用 `actiontype: "newwindow"`（如果框架支持），但此处通过控件方式实现兼容逻辑。

---

💡 **补充建议：**

尽管 `NewWindow` 被实现为一个控件，但在实际使用中更推荐使用 `actiontype: "newwindow"` 类型的绑定来简化开发，例如：

```json
{
  "actiontype": "newwindow",
  "wid": "btnTutorial",
  "event": "click",
  "url": "https://example.com/tutorial",
  "name": "tutorial"
}
```

这比注册控件更轻量，除非你需要将其作为组件复用或进行复杂封装。