# MdWidget

**控件功能**：用于渲染 Markdown 内容的控件，支持从字符串或远程 URL 加载 Markdown 文本，并使用 `marked.js` 解析为 HTML。支持点击链接加载新的 Markdown 内容。

**类型**：普通控件  
**父类控件**：`bricks.JsWidget`

## 初始化参数

| 参数名     | 类型   | 说明 |
|----------|--------|------|
| `mdtext`  | string | （可选）直接传入的 Markdown 文本内容，优先级高于 `md_url`。 |
| `md_url`  | string | （可选）远程 Markdown 文件的 URL 地址，用于异步加载内容。 |
| `method`  | string | 请求方式，默认为 `"GET"`，适用于通过网络请求获取内容。 |
| `params`  | object | 请求参数对象，在 GET 请求中会拼接到 URL 上；目前仅在 `tget` 中使用。 |

> ⚠️ 注意：若同时提供 `mdtext`，则忽略 `md_url`，直接本地渲染。

## 主要事件

- `loaded`  
  触发时机：成功加载并解析完 Markdown 内容后触发。  
  携带参数：`{ url: string }` —— 当前加载的 URL（仅当通过 `_build(url)` 加载时有效）。  
  使用示例：
  ```js
  mdwidget.bind('loaded', function(event) {
      console.log('Loaded markdown from:', event.params.url);
  });
  ```

---

# MarkdownViewer

**控件功能**：一个增强型 Markdown 查看器容器，内置导航回退功能，可记录浏览历史栈，支持通过链接跳转并返回上一页。通常用于展示文档类内容。

**类型**：容器控件  
**父类控件**：`bricks.VBox`

## 初始化参数

| 参数名         | 类型    | 说明 |
|--------------|---------|------|
| `md_url`      | string  | （可选）初始加载的 Markdown 文件 URL。 |
| `mdtext`      | string  | （可选）直接传入的 Markdown 字符串内容。 |
| `method`      | string  | HTTP 请求方法，默认为 `"GET"`。 |
| `params`      | object  | 请求参数对象，用于传递给 `tget` 方法。 |
| `navigator`   | boolean | 是否显示“返回”按钮，默认为 `true`。启用后可实现浏览历史回退。 |
| `recommentable`| boolean | （未实现）预留字段，未来可能用于评论推荐功能。 |

> 📌 提示：内部使用 `MdWidget` 实际渲染内容，并将其添加为子控件。

## 主要事件

- `loaded`  
  转发自内部 `MdWidget` 的 `loaded` 事件，表示新页面已加载完成。  
  携带参数：`{ url: string }` —— 当前加载的 Markdown 页面 URL。

- `scroll`  
  绑定到容器的滚动事件，可用于监听页面滚动行为（当前仅输出调试日志）。  
  触发条件：用户滚动视口时触发。  
  示例日志输出：
  ```
  scrollY= 200
  ```

> 💡 注：可通过 `bind('scroll', ...)` 监听此事件进行自定义处理。

