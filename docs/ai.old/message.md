# Message

用于在页面中弹出一个包含文本消息的对话框，常用于提示用户信息。类型为**容器控件**，继承自 `PopupWindow` 控件。

## 主要方法

- **constructor(opts)**  
  构造函数，接收配置项 `opts` 并初始化弹窗。自动设置 `auto_open = true`，创建完成后立即打开弹窗。

- **create_message_widget()**  
  创建内部显示结构：使用 `Filler` 布局填充 → 添加垂直滚动面板 `VScrollPanel` → 插入可换行、居中文本控件 `Text` 显示消息内容。

- **set_css(cssClass)**  
  设置弹窗整体的 CSS 类名（如 `'message'` 或 `'error'`），用于样式定制。

---

## 主要事件

无自定义事件。依赖父类 `PopupWindow` 提供的窗口生命周期事件（如 `onOpen`, `onClose`）。

---

## 源码例子

```json
{
  "id": "msg_info",
  "widgettype": "Message",
  "options": {
    "title": "系统提示",           // 弹窗标题
    "message": "操作已成功提交！",   // 要显示的消息文本
    "cheight": 9,                 // 内容高度（单位：rem）
    "cwidth": 16,                 // 内容宽度（单位：rem）
    "i18n": true                  // 支持国际化文本
  }
}
```

> ✅ 注释说明：
> - `widgettype` 为 `"Message"`，表示使用注册的 `Message` 类。
> - `options.message` 是核心字段，用于传入要展示的文本。
> - `cheight` 和 `cwidth` 控制弹窗尺寸，默认值由 `bricks.show_message` 函数提供。
> - 实际开发中通常不直接写此 JSON，而是调用封装函数 `bricks.show_message()`。

---

# Error

用于弹出错误提示信息，视觉上与 `Message` 不同（通常是红色主题）。类型为**容器控件**，继承自 `Message`。

## 主要方法

- **constructor(opts)**  
  继承父类 `Message` 的构造逻辑，并调用 `set_css('error')` 更改外观为主题色“错误红”。

---

## 主要事件

无额外事件，沿用 `Message` 及其父类事件体系。

---

## 源码例子

```json
{
  "id": "err_network",
  "widgettype": "Error",
  "options": {
    "title": "网络错误",
    "message": "无法连接到服务器，请检查网络设置。",
    "cheight": 10,
    "cwidth": 20,
    "i18n": true
  }
}
```

> ✅ 注释说明：
> - 使用 `widgettype: "Error"` 即可快速生成带错误样式的弹窗。
> - 外观差异通过 `set_css('error')` 实现，开发者无需重复构建 UI 结构。
> - 推荐使用封装函数 `bricks.show_error(opts)` 替代手动编写 JSON。

---

# bricks.show_message / bricks.show_error（辅助函数）

虽然不是控件本身，但这两个全局函数是实际项目中最常用的接口。

## 示例：调用封装函数（推荐方式）

```js
// 显示普通消息
bricks.show_message({
  title: "欢迎",
  message: "您好，欢迎使用 Bricks.js 框架！",
  cheight: 8,
  cwidth: 15
});

// 显示错误消息
bricks.show_error({
  title: "保存失败",
  message: "数据校验未通过，请检查输入字段。",
  cwidth: 20
});
```

> 💡 提示：这些函数会自动补全默认宽高，并实例化对应的 `Message` 或 `Error` 控件并调用 `.open()` 方法显示弹窗。

--- 

🔚 总结：  
`Message` 和 `Error` 都是基于 `PopupWindow` 的语义化弹窗控件，适用于轻量级信息反馈场景。通过 JSON 可以完全控制其行为，但更建议使用 `bricks.show_message()` 和 `bricks.show_error()` 快捷方法提高开发效率。