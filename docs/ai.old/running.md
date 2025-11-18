# Running

用于显示一个运行中的状态提示控件，通常在异步操作（如数据加载、文件上传等）期间展示给用户。该控件为**容器控件**，继承自 `bricks.BaseModal`，具备模态弹窗的基本行为，并内置了一个动态刷新的时间显示和动图图标。

---

## 主要方法

- **`dismiss()`**  
  重写自父类 `BaseModal`，用于关闭当前运行提示窗口。在关闭前会调用内部 `BaseRunning` 实例的 `stop_timepass()` 方法，停止定时器以释放资源。

---

## 主要事件

无自定义事件。但作为模态框，其打开与关闭受 `auto_open: true` 控制，在实例化时自动触发显示。

---

## 源码例子

```json
{
  "id": "running_indicator",
  "widgettype": "Running",
  "options": {
    "icon": "imgs/loading_custom.gif",  // 自定义加载图标路径，可选
    "target": "main_container"          // 指定渲染到哪个容器中（可由 bind 的 target 传递）
  }
}
```

> ✅ 注释说明：
> - `"id"`：控件唯一标识，便于后续通过 ID 引用或销毁。
> - `"widgettype": "Running"`：表示使用已注册的 `Running` 控件。
> - `"options.icon"`：可选参数，指定动效图标 URL；若不传则使用默认资源 `imgs/running.gif`。
> - `"options.target"`：虽然在此未直接生效，但在实际绑定中可通过 `binds` 的 `target` 字段指定插入位置。
> - `auto_open: true` 在源码中硬编码设置，意味着一旦创建即自动弹出显示。

---

### 使用场景示例（结合 binds）

```json
{
  "id": "btn_load_data",
  "widgettype": "Button",
  "options": {
    "text": "开始加载",
    "i18n": false
  },
  "binds": [
    {
      "actiontype": "bricks",
      "wid": "btn_load_data",
      "event": "click",
      "target": "Popup",
      "mode": "replace",
      "options": {
        "widgettype": "Running",
        "id": "run_task",
        "options": {
          "icon": "imgs/loading.gif"
        }
      }
    },
    {
      "actiontype": "urlwidget",
      "wid": "btn_load_data",
      "event": "click",
      "target": "content_area",
      "options": {
        "url": "/api/load_content.ui",
        "method": "GET"
      },
      "conform": {
        "title": "确认操作",
        "message": "即将加载新内容，是否继续？"
      }
    }
  ]
}
```

> 🔍 示例说明：
> - 点击按钮后：
>   1. 首先在 `Popup` 中显示 `Running` 加载动画；
>   2. 同时向服务器请求 `/api/load_content.ui`，加载完成后替换 `content_area` 内容；
>   3. 请求发起前弹出确认对话框（由 `conform` 触发）；
>   4. 当内容加载完毕后，开发者应在响应逻辑中手动关闭 `Running` 提示（例如通过 `bricks.get_widget('run_task').dismiss()`）。