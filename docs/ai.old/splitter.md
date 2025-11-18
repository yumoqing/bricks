# Splitter

Splitter 是一个用于在界面中插入水平分隔线的**普通控件**，继承自 `bricks.JsWidget`。它不包含任何子控件，主要用于视觉上分割不同区域的内容，提升界面可读性。

---

## 主要方法

- **`create()`**  
  创建 DOM 元素（`<hr>` 标签），作为分隔线渲染到页面中。

- **`_create(tagName)`** *(继承自 JsWidget)*  
  辅助方法，用于创建指定标签的 DOM 元素，并设置基础属性。

---

## 主要事件

Splitter 控件本身不触发或监听任何用户交互事件（如 click、hover 等），仅作为静态展示元素使用。

---

## 源码例子

```json
{
  "id": "splitter_01",                    // 控件唯一标识
  "widgettype": "Splitter",               // 控件类型：必须为注册过的控件名
  "options": {},                          // 构造参数，Splitter无需特殊配置
  "binds": []                             // 无事件绑定需求，保持空数组
}
```

> ✅ **说明：**  
> 上述 JSON 可以直接嵌入 `.ui` 文件中，在容器内使用以添加一条水平分隔线。由于 Splitter 是普通控件，不能包含 `subwidgets` 字段。

### 实际应用场景示例

```json
{
  "id": "container_main",
  "widgettype": "VBox",                   // 容器控件，垂直布局
  "options": {
    "style": "padding: 10px;"
  },
  "subwidgets": [
    {
      "id": "label_title",
      "widgettype": "Label",
      "options": {
        "text": "基本信息"
      }
    },
    {
      "id": "splitter_section1",
      "widgettype": "Splitter",
      "options": {}
    },
    {
      "id": "form_basic",
      "widgettype": "Form",
      "options": {
        "fields": [
          { "name": "name", "label": "姓名" },
          { "name": "age", "label": "年龄" }
        ]
      }
    },
    {
      "id": "splitter_section2",
      "widgettype": "Splitter",
      "options": {}
    },
    {
      "id": "label_other",
      "widgettype": "Label",
      "options": {
        "text": "其他信息"
      }
    }
  ]
}
```

> 📌 **注释说明：**  
> 在 VBox 垂直布局中，通过插入多个 `Splitter` 控件来分隔“基本信息”与“其他信息”区块，增强界面结构清晰度。每个 `Splitter` 都是一个轻量级的视觉装饰控件，不影响逻辑功能。

--- 

💡 **提示：**  
若需自定义样式（如虚线、颜色、边距等），可通过扩展 Splitter 类或在后续版本中支持 `options.style` 传入 CSS 样式字符串实现。当前基础版仅生成默认 `<hr>` 元素。