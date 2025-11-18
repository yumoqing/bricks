# Html

Html 是一个用于在页面中插入原始 HTML 内容的**普通控件**，继承自 `JsWidget`。它允许开发者通过配置 `html` 选项直接渲染任意 HTML 字符串，适用于展示富文本、静态内容或嵌入第三方 HTML 片段。

---

## 主要方法

- **`setValue(html: string)`**  
  更新控件内的 HTML 内容，等同于重新设置 `innerHTML`。

- **`getValue(): string`**  
  返回当前控件容器内的 HTML 字符串内容。

- **`clear()`**  
  清空控件中的所有 HTML 内容。

---

## 主要事件

Html 控件不触发任何默认交互事件（如点击、输入等），但可以通过绑定父级容器或其他控件来监听 DOM 事件。若需响应内部元素的事件，建议使用 `binds` 绑定到具体操作目标。

---

## 源码例子

```json
{
  "id": "html_welcome",                    // 控件唯一标识
  "widgettype": "Html",                   // 控件类型：Html
  "options": {
    "html": "<h1 style='color: blue;'>欢迎使用 Bricks.js</h1><p>这是一个使用 <strong>Html</strong> 控件插入的富文本内容。</p>"
    // html 字段指定要渲染的 HTML 字符串
  },
  "binds": [
    {
      "actiontype": "script",
      "wid": "html_welcome",
      "event": "click",
      "target": "html_welcome",
      "script": "console.log('用户点击了 Html 控件区域');",
      "conform": {
        "title": "确认操作",
        "message": "你确定要查看控制台吗？",
        "confirmText": "确定",
        "cancelText": "取消"
      }
    }
  ]
}
```

> ✅ **注释说明：**
> - 此例创建了一个 ID 为 `html_welcome` 的 Html 控件。
> - `options.html` 中定义了带样式的标题和段落文本。
> - 使用 `binds` 监听点击事件，当用户点击该控件时，弹出确认对话框并输出日志到浏览器控制台。
> - 注意：由于是普通控件，不能包含 `subwidgets` 子控件数组。