# Draggable

**Control Functionality:** A drag-only container widget. Child widgets can be dragged out into Droppable or Sortable containers, but it does not accept items dragged in from outside.
**Type:** Basic Control
**Parent Control:** `bricks.Layout`
**Dependency:** SortableJS (`Sortable.min.js`)

## Initialization Parameters

| Parameter | Type | Description |
|-------|------|------|
| `group` | string | Group name. Only containers sharing the same group can exchange items. Default: `"default"`. |
| `type` | string | (Optional) Drag item type identifier, used for `accepts` matching on Droppable. |
| `animation` | number | Animation duration in ms. Default: `150`. |

## Subwidget Structure

Each subwidget is a draggable item:

```json
{
  "widgettype": "Draggable",
  "options": {"group": "mygroup"},
  "subwidgets": [
    {"widgettype": "Text", "options": {"text": "可拖拽项 1"}},
    {"widgettype": "Text", "options": {"text": "可拖拽项 2"}}
  ]
}
```

## Main Events

| Event | Description |
|-------|------|
| `dragstart` | Drag started |
| `dragend` | Drag ended |

Event params: `{item: DOM元素}`

## Example — 与 Droppable 配合

```json
{
  "widgettype": "Draggable",
  "options": {"group": "demo", "type": "task"},
  "subwidgets": [
    {"widgettype": "VBox", "options": {"css": "task-card", "data-type": "task"},
     "subwidgets": [{"widgettype": "Text", "options": {"text": "任务 A"}}]}
  ],
  "binds": [{"event": "dragend", "actiontype": "script", "script": "console.log('Drag ended')"}]
}
```
