```markdown
# ProgressBar

ProgressBar 是一个用于展示任务进度的普通控件，继承自 `bricks.HBox`，属于**容器类控件**（虽然它主要用于布局内部进度条元素，但其内部包含子控件），通过动态设置宽度来显示当前进度百分比。

---

## 主要方法

- `set_value(v)`  
  设置当前进度值，自动计算百分比并更新进度条视觉宽度。  
  参数：  
  - `v` (Number)：当前进度值  

- `set_css(className)`  
  继承自父类，用于设置控件的 CSS 类名，便于样式控制。

- `add_widget(widget)`  
  继承自 HBox，用于添加子控件（如内部的文本显示控件）。

- `set_style(property, value)`  
  设置内联样式，用于动态调整进度条宽度。

---

## 主要事件

该控件目前未定义自定义事件，依赖于父类 `HBox` 的基础事件机制（如渲染完成等）。可通过外部绑定监听用户交互行为（如 click 等）。

---

## 源码例子

```json
{
  "id": "progress1",
  "widgettype": "ProgressBar",
  "options": {
    "total_value": 100,        // 总进度值
    "bar_cwidth": 2            // 进度条高度（单位：行高）
  },
  "binds": [
    {
      "actiontype": "method",
      "wid": "btn_start",
      "event": "click",
      "target": "progress1",
      "method": "set_value",
      "params": {
        "v": 75
      },
      "conform": {
        "title": "确认操作",
        "message": "是否将进度设置为75%？",
        "confirm_text": "确定",
        "cancel_text": "取消"
      }
    }
  ]
}
```

> **注释说明：**
> - `id`: 控件唯一标识符。
> - `widgettype`: 使用已注册的 `"ProgressBar"` 控件类型。
> - `options.total_value`: 定义最大进度值，用于百分比计算（示例中未在构造函数使用，实际应完善逻辑）。
> - `options.bar_cwidth`: 控制进度条高度，默认为 2 行高度。
> - `binds`: 绑定按钮点击事件，调用 `set_value` 方法更新进度。
>   - `conform`: 在执行前弹出确认对话框，增强用户体验与安全性。

> ⚠️ 注意：原始源码中存在变量名错误（`current` 和 `total` 未定义），正确实现应为：
> ```js
> set_value(current, total = this.options.total_value) {
>   const percentage = (current / total) * 100;
>   const pzt = Math.max(0, Math.min(100, percentage));
>   this.text_w.set_style('width', pzt + '%');
> }
> ```
> 建议在实际使用时修复此问题，并确保传入合理的 `total_value` 参数。
```