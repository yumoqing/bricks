# Sortable

**Control Functionality:** A bidirectional sortable container widget. Child widgets can be dragged out to other containers (Droppable/Sortable), can accept items dragged from outside, and also supports internal reordering within the container.
**Type:** Basic Control
**Parent Control:** `bricks.Layout`
**Dependency:** SortableJS (`Sortable.min.js`)

## Initialization Parameters

| Parameter | Type | Description |
|-------|------|------|
| `group` | string | Group name. Only containers sharing the same group can exchange items. Default: `"default"`. |
| `animation` | number | Animation duration in ms. Default: `150`. |
| `handle` | string | (Optional) CSS selector for the drag handle. Only matching elements can initiate dragging. |

## Main Events

| Event | Description |
|-------|------|
| `dragstart` | Drag started |
| `dragend` | Drag ended（含 `from`/`to` 容器信息） |
| `dropadd` | An item was dropped into this container from outside |
| `dropremove` | An item was dragged out of this container |
| `reorder` | The order within this container changed |

## Example — 任务看板列

```json
{
  "widgettype": "Sortable",
  "options": {"group": "kanban", "animation": 150},
  "subwidgets": [
    {"widgettype": "VBox", "options": {"css": "task-card", "data-type": "task"},
     "subwidgets": [{"widgettype": "Text", "options": {"text": "待办 1"}}]},
    {"widgettype": "VBox", "options": {"css": "task-card", "data-type": "task"},
     "subwidgets": [{"widgettype": "Text", "options": {"text": "待办 2"}}]}
  ],
  "binds": [
    {"event": "reorder", "actiontype": "script",
     "script": "console.log('排序已改变')"},
    {"event": "dropadd", "actiontype": "script",
     "script": "console.log('新任务拖入')"}
  ]
}
```

## Comparison

| Widget | pull | put | file drop | internal sort |
|------|------------|-----------|---------|---------|
| Draggable | ✅ | ❌ | ❌ | ❌ |
| Droppable | ❌ | ✅ | ✅ | ❌ |
| Sortable | ✅ | ✅ | ❌ | ✅ |
