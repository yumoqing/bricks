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
| `max_size` | number | （可选）单个文件最大字节数，超出则忽略。 |
| `multiple` | boolean | （可选）是否允许多文件拖入，默认 `true`。 |
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

## 示例 — 文件拖入并上传

```json
{
  "widgettype": "Droppable",
  "options": {"accepts": ["image/*", ".pdf", ".docx"], "max_size": 10485760},
  "subwidgets": [
    {"widgettype": "Text", "options": {"text": "拖入文件到这里上传", "css": "drop-zone-text"}}
  ],
  "binds": [{"wid": "self", "event": "filedrop", "actiontype": "script",
    "script": "(function(){\n  var fs = event.params.files;\n  if (!fs.length) return;\n  var dz = this;\n  fs.forEach(function(f) {\n    var fd = new FormData();\n    fd.append('file', f.file, f.name);\n    fetch('{{entire_url('/api/upload.dspy')}}', {method:'POST', body:fd})\n      .then(function(r) { return r.json(); })\n      .then(function(d) {\n        if (d.status) {\n          var c = dz.querySelector('.drop-zone-text');\n          if (c) c.textContent = f.name + ' 上传成功 ✓';\n        }\n      })\n      .catch(function(e) {\n        var c = dz.querySelector('.drop-zone-text');\n        if (c) c.textContent = f.name + ' 上传失败: ' + e.message;\n      });\n  });\n}).call(this);"}]
}
```

**上传脚本关键部分拆解：**

```javascript
// 1. 从 event.params 获取文件
var files = event.params.files;  // [{name, size, type, file}]

// 2. 构建 FormData
var fd = new FormData();
fd.append('file', files[0].file, files[0].name);  // file 是原生 File 对象

// 3. 发送到后端
fetch('/api/upload.dspy', {method: 'POST', body: fd})
  .then(r => r.json())
  .then(d => { /* d.status 为 true 表示成功 */ });
```

> **注意：** `event.params.files[].file` 是浏览器原生 `File` 对象，可直接用于 `FormData.append()` 或 `FileReader.readAsDataURL()`。

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
