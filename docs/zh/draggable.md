# Draggable

控件功能：可拖拽容器控件。子控件可从中拖出到其他 Droppable 或 Sortable 容器中，但自身不接收外部拖入。
类型：普通控件
父类控件：`bricks.Layout`
依赖：SortableJS（`Sortable.min.js`）

## 初始化参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `group` | string | 分组名称，相同 group 的控件之间可互相拖拽。默认 `"default"`。 |
| `type` | string | （可选）拖拽项类型标识，用于 Droppable 的 `accepts` 类型匹配。 |
| `animation` | number | 拖拽动画时间（毫秒），默认 `150`。 |

## 子控件结构

每个子控件即为一个可拖拽项：

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

## 主要事件

| 事件名 | 说明 |
|-------|------|
| `dragstart` | 开始拖拽 |
| `dragend` | 拖拽结束 |

事件参数：`{item: DOM元素}`

## 示例 — 与 Droppable 配合

```json
{
  "widgettype": "Draggable",
  "options": {"group": "demo", "type": "task"},
  "subwidgets": [
    {"widgettype": "VBox", "options": {"css": "task-card", "data-type": "task"},
     "subwidgets": [{"widgettype": "Text", "options": {"text": "任务 A"}}]}
  ],
  "binds": [{"event": "dragend", "actiontype": "script", "script": "console.log('拖拽结束')"}]
}
```
