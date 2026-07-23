# Sortable

控件功能：双向拖拽排序容器控件。子控件可拖出到其他容器（Droppable/Sortable），也可接收外部拖入，同时支持本容器内拖拽排序。
类型：普通控件
父类控件：`bricks.Layout`
依赖：SortableJS（`Sortable.min.js`）

## 初始化参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `group` | string | 分组名称。相同 group 的控件之间可互相拖拽。默认 `"default"`。 |
| `animation` | number | 拖拽动画时间（毫秒），默认 `150`。 |
| `handle` | string | （可选）CSS 选择器，指定拖拽手柄，只有匹配的元素可触发拖拽。 |

## 主要事件

| 事件名 | 说明 |
|-------|------|
| `dragstart` | 开始拖拽 |
| `dragend` | 拖拽结束（含 `from`/`to` 容器信息） |
| `dropadd` | 有元素从外部拖入本容器 |
| `dropremove` | 有元素被拖出本容器 |
| `reorder` | 本容器内顺序发生变化 |

## 示例 — 任务看板列

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

## 对比

| 控件 | pull（拖出） | put（接收） | 文件拖入 | 内部排序 |
|------|------------|-----------|---------|---------|
| Draggable | ✅ | ❌ | ❌ | ❌ |
| Droppable | ❌ | ✅ | ✅ | ❌ |
| Sortable | ✅ | ✅ | ❌ | ✅ |
