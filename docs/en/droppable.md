# Droppable

**Control Functionality:** A drop-only container widget. Accepts items dragged in from Draggable/Sortable containers, as well as **external files** dropped from the operating system. Its own children cannot be dragged out.
**Type:** Basic Control
**Parent Control:** `bricks.Layout`
**Dependency:** SortableJS (`Sortable.min.js`)

## Initialization Parameters

| Parameter | Type | Description |
|-------|------|------|
| `group` | string | Group name. Only accepts drag sources from the same group. Default: `"default"`. |
| `accepts` | string[] | Accepted type list. For internal elements, matches the `data-type` attribute; for external files, matches MIME type or extension. e.g. `["card", "image/*", ".pdf"]`. |
| `animation` | number | 拖拽动画时间（毫秒）。 |

## 外部文件拖入

File dropping is automatically enabled when `accepts` is set. Supports:
- MIME wildcard: `"image/*"` matches all images
- Extension: `".pdf"`, `".docx"`
- Custom types: `"card"`, `"task"` (matches internal elements)

## Main Events

| Event | Description |
|-------|------|
| `dropadd` | An item was dropped into this container |
| `dropremove` | An item was removed from this container (won't fire, as Droppable cannot drag out) |
| `filedrop` | External files were dropped. `event.params.files` is an array of `{name, size, type, file}` |

## Example — 接收文件

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

## Example — 接收内部元素

```json
{
  "widgettype": "Droppable",
  "options": {"group": "demo", "accepts": ["task"]},
  "subwidgets": [],
  "binds": [{"event": "dropadd", "actiontype": "script",
    "script": "console.log('有任务拖入')"}]
}
```
