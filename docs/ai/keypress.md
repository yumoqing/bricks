# KeyPress

KeyPress 是一个用于监听全局键盘按键事件的容器控件，能够在用户按下任意键时动态显示按下的键名。该控件继承自 `VBox`，属于**容器控件**，可容纳子控件（如文本提示控件），适用于需要键盘交互反馈的场景，例如调试工具、快捷键提示等。

---

## 主要方法

- **`key_handler(event)`**  
  键盘事件处理函数，接收 `keydown` 事件对象，提取 `event.key` 值，并更新界面显示当前按键。

- **`clear_widgets()`**  
  继承自 `VBox`，用于清空当前容器内的所有子控件，确保每次只显示最新的按键信息。

- **`add_widget(widget)`**  
  向容器中添加新的控件（如 `Text` 控件），用于展示按键内容。

---

## 主要事件

- **`keydown`**  
  全局键盘按下事件，由 `bricks.app.bind` 绑定在应用级别，触发 `key_handler` 方法。

> 注意：此事件为全局监听，不依赖于焦点元素，适合实现全局快捷键功能。

---

## 源码例子

```json
{
  "id": "keypress_demo",                 // 控件唯一标识
  "widgettype": "KeyPress",               // 控件类型，必须为已注册的 'KeyPress'
  "options": {},                          // 构造参数，此处无特殊配置
  "subwidgets": []                        // 容器控件，初始无子控件，运行时动态添加
}
```

### 注释说明：

- `"id"`: 设置控件实例的唯一 ID，便于后续通过 ID 查找或绑定事件。
- `"widgettype"`: 必须与工厂注册名称一致（`bricks.Factory.register('KeyPress', ...)`）。
- `"options"`: 当前控件无需额外参数，保持空对象即可。
- `"subwidgets"`: 虽然是容器控件，但初始不预设子控件，实际子控件在 `key_handler` 中动态创建和插入。

---

### 补充：如何使用此控件结合 binds 实现扩展行为？

假设你想在按下某个特定键（如 'Enter'）时弹出确认窗口，可以通过外部绑定增强其行为。示例如下：

```json
{
  "id": "keypress_with_bind",
  "widgettype": "KeyPress",
  "options": {},
  "subwidgets": [],
  "binds": [
    {
      "actiontype": "script",
      "wid": "keypress_with_bind",
      "event": "key_pressed",               // 自定义事件，需在 KeyPress 中派发
      "script": "async function({key}) { if (key === 'Enter') { alert('回车键被按下！'); } }",
      "datawidget": "keypress_with_bind",
      "datamethod": "getLastKey",           // 需要在 KeyPress 中实现 getLastKey 方法获取最后按键
      "rtdata": {}
    }
  ]
}
```

> ⚠️ 提示：若需支持上述 bind 用法，建议扩展 `KeyPress` 类并添加 `getLastKey()` 方法及 `dispatchEvent` 派发自定义事件能力。