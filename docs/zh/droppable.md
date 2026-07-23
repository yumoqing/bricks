# Droppable

控件功能：可接收拖入的容器控件。支持接收从 Draggable/Sortable 拖出的内部元素，以及从操作系统拖入的**外部文件**。自身子控件不可拖出。
类型：普通控件
父类控件：`bricks.Layout`
依赖：SortableJS（`Sortable.min.js`）

## 初始化参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `group` | string | 分组名称，只接收同 group 的拖拽源。默认 `"default"`。 |
| `accepts` | string[] | 接受的类型列表。对内部元素匹配 `data-type` 属性；对外部文件匹配 MIME 类型或扩展名。如 `["card", "image/*", ".pdf"]`。 |
| `animation` | number | 拖拽动画时间（毫秒）。 |

## 外部文件拖入

设置 `accepts` 后自动启用文件拖入。支持：
- MIME 通配：`"image/*"` 匹配所有图片
- 扩展名：`".pdf"`、`".docx"`
- 自定义类型：`"card"`、`"task"`（匹配内部元素）

## 主要事件

| 事件名 | 说明 |
|-------|------|
| `dropadd` | 有内部元素拖入本容器 |
| `dropremove` | 有内部元素被拖出（不会发生，因 Droppable 不可拖出） |
| `filedrop` | 有外部文件拖入。`event.params.files` 为文件数组，每项含 `{name, size, type, file}` |

## 示例 — 接收文件

```json
{
  "widgettype": "Droppable",
  "options": {"group": "upload", "accepts": ["image/*", ".pdf"]},
  "subwidgets": [
    {"widgettype": "Text", "options": {"text": "拖入图片或PDF文件"}}
  ],
  "binds": [{"event": "filedrop", "actiontype": "script",
    "script": "var fs=event.params.files;alert('收到 '+fs.length+' 个文件');"}]
}
```

## 示例 — 接收内部元素

```json
{
  "widgettype": "Droppable",
  "options": {"group": "demo", "accepts": ["task"]},
  "subwidgets": [],
  "binds": [{"event": "dropadd", "actiontype": "script",
    "script": "console.log('有任务拖入')"}]
}
```
