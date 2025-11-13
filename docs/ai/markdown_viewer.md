# MarkdownViewer

用于展示 Markdown 格式内容的容器控件，支持从本地文本或远程 URL 加载 Markdown 内容，并具备浏览历史回退功能。该控件继承自 `VBox`，属于**容器控件**。

## 主要方法

- `build()`  
  异步方法，用于初始化加载由 `opts.md_url` 指定的 Markdown 内容。
  
- `_build(md_url)`  
  异步私有方法，根据传入的 URL 请求并渲染 Markdown 内容到界面中。

- `createBackButton()`  
  创建一个返回按钮（“<<<<<<<”），点击后可返回上一个浏览过的 Markdown 页面。

- `add_back_stack(event)`  
  将当前页面的 URL 压入浏览历史栈（`back_stack`）中，用于实现“后退”功能。

- `go_back(event)`  
  异步方法，弹出当前和上一个 URL，然后加载再上一级的内容，实现浏览器式的“返回”操作。

- `show_scroll(event)`  
  滚动事件监听函数，调试用，输出当前窗口滚动位置。

## 主要事件

- `'loaded'`  
  当 Markdown 内容成功加载并解析完成后触发，携带参数 `{ url: 当前加载的URL }`。

- `'scroll'`  
  监听容器滚动行为，触发 `show_scroll` 函数进行调试输出。

## 源码例子

```json
{
  "id": "md_viewer_1",
  "widgettype": "MarkdownViewer",
  "options": {
    "navigator": true,           // 显示返回按钮
    "md_url": "/docs/intro.md",  // 从服务器加载 Markdown 文件
    "method": "GET",             // HTTP 方法
    "params": {}                 // 请求参数（无）
  },
  "subwidgets": [],              // 此控件内部管理子控件，无需手动定义
  "binds": [
    {
      "actiontype": "bricks",
      "wid": "md_viewer_1",
      "event": "loaded",
      "target": "Popup",
      "rtdata": {
        "msg": "文档已加载完成！"
      },
      "actiontype": "script",
      "script": "console.log('Markdown loaded:', params.url);",
      "params": {
        "url": "{event.params.url}"
      }
    }
  ]
}
```

> **注释说明：**
> - 使用 `MarkdownViewer` 控件时，只需提供 `md_url` 或 `mdtext` 即可自动渲染 Markdown。
> - 若启用 `navigator: true`，则会显示一个简单的返回按钮，支持浏览历史回退。
> - `binds` 中监听了 `loaded` 事件，在内容加载完成后执行脚本打印日志。
> - 支持 Markdown 中的链接跳转，点击链接会动态加载新页面并记录历史。

---

# MdWidget

基础 Markdown 渲染控件，用于将 Markdown 文本转换为 HTML 并显示在页面上。它是一个普通控件，继承自 `JsWidget`。

## 主要方法

- `set_content(content)`  
  设置新的 Markdown 内容并重新渲染。

- `_build(md_url)`  
  异步方法，通过 AJAX 获取指定 URL 的 Markdown 内容并渲染。

- `_build1()`  
  使用 `marked.parse()` 将 `this.md_content` 转换为 HTML 并插入 DOM。

- `getValue()`  
  返回当前控件的数据对象，格式为 `{ 控件名: markdown内容 }`，用于表单提交等场景。

- `setValue(v)`  
  设置 Markdown 内容值（可用于动态更新内容）。

- `getname()`  
  获取控件名称，若未设置则默认为 `'mdtext'`。

## 主要事件

- `'loaded'`  
  成功加载远程 Markdown 文件后触发，携带参数 `{ url: 加载的文件地址 }`。

## 源码例子

```json
{
  "id": "md_widget_simple",
  "widgettype": "MdWidget",
  "options": {
    "mdtext": "# 欢迎使用 Bricks\\n\\n这是一个内联 Markdown 示例。\\n\\n- 功能一\\n- 功能二"
  },
  "binds": [
    {
      "actiontype": "event",
      "wid": "md_widget_simple",
      "event": "click",
      "target": "md_widget_simple",
      "dispatch_event": "content_clicked",
      "params": {
        "info": "用户点击了 Markdown 区域"
      }
    }
  ]
}
```

> **注释说明：**
> - 此例使用内联字符串 `mdtext` 直接嵌入 Markdown 内容。
> - 绑定了 `click` 事件，当用户点击渲染后的 Markdown 区域时，派发自定义事件 `content_clicked`。
> - 可与其它控件通信，例如通知父组件用户交互行为。

---

> 💡 **提示：**  
> 使用这两个控件前，请确保已引入 `marked.js`：
>
> ```html
> <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
> ```
>
> 否则 `marked.parse is not a function` 错误将导致渲染失败。