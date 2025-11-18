# MultipleStateImage

用于展示一个具有多个状态的图片控件，点击图片时可在不同状态间循环切换。该控件属于**普通控件**，继承自 `bricks.Layout`。

## 主要方法

- **`set_state(state)`**  
  切换到指定的状态（state），并更新显示的图片。  
  参数：  
  - `state` (String) — 目标状态名称，必须是 `urls` 配置中存在的键。

- **`change_state(event)`**  
  内部方法，响应图片的点击事件，自动切换到下一个状态，支持循环切换。触发 `state_changed` 自定义事件。

## 主要事件

- **`state_changed`**  
  当图片状态发生改变时触发。  
  携带数据：当前状态名（String）。

## 源码例子

```json
{
  "id": "msi_example",                    // 控件唯一标识
  "widgettype": "MultipleStateImage",     // 控件类型，必须为已注册的控件名
  "options": {
    "state": "normal",                    // 初始化状态
    "urls": {                             // 各状态对应的图片URL
      "normal": "/images/button_normal.png",
      "hover": "/images/button_hover.png",
      "pressed": "/images/button_pressed.png"
    },
    "width": 100,                         // 图片宽度
    "height": 80                          // 图片高度
  },
  "binds": [
    {
      "actiontype": "event",              // 绑定一个自定义事件派发
      "wid": "msi_example",               // 触发组件ID
      "event": "click",                   // 监听点击事件
      "target": "some_other_widget",      // 目标控件ID
      "dispatch_event": "image_clicked",  // 派发事件名称
      "params": {
        "source": "MultipleStateImage"    // 传递额外参数
      }
    },
    {
      "actiontype": "script",             // 执行脚本，记录当前状态
      "wid": "msi_example",
      "event": "state_changed",           // 监听状态变化事件
      "target": "ConsoleLogger",
      "script": "console.log('Image state changed to:', data);",
      "params": {
        "data": "{event_data}"           // 使用运行时事件数据
      }
    }
  ]
}
```

> 💡 **说明与注释：**
> - `MultipleStateImage` 将一组图片 URL 映射到不同的“状态”，通过调用 `set_state()` 或点击实现切换。
> - 每次状态变更会触发 `state_changed` 事件，可用于联动其他控件或日志记录。
> - 此控件利用了 `bricks.Image` 作为内部子控件进行渲染，并封装其行为。
> - 在 JSON 中使用时，需确保所有状态在 `urls` 对象中都有对应图片地址。
> - 支持通过 `binds` 绑定交互逻辑，例如点击后通知其他模块或执行脚本。