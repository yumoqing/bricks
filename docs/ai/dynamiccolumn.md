# DynamicColumn

`DynamicColumn` 是一个**容器控件**，继承自 `bricks.Layout`。它用于实现响应式网格布局，能够根据屏幕宽度动态调整列数和列宽，特别适用于移动端与桌面端自适应的卡片式布局场景。

该控件通过 CSS Grid 实现布局，并在窗口尺寸变化或父容器更新时自动重新计算列宽与间隙，确保内容均匀分布且美观。

---

## 主要方法

- **`set_column_width()`**  
  核心方法，负责根据当前设备类型（移动端/桌面端）、字符单位大小（`charsize`）以及配置参数动态设置 `gridTemplateColumns` 和 `gap` 样式属性。
  
  - 在移动端竖屏下使用固定的列数（由 `mobile_cols` 控制）
  - 在桌面端根据 `col_cwidth`（以字符为单位的列宽）或直接指定的 `col_width`（像素值）来计算每列最小宽度
  - 使用 `minmax(cw + "px", 1fr)` 配合 `repeat(auto-fill, ...)` 实现自动换行和等分布局

- **构造函数 `constructor(opts)`**  
  初始化控件选项并绑定事件：
  - 自动补全默认值：`col_cwidth`, `col_cgap`, `mobile_cols`
  - 设置 `display: grid`
  - 绑定生命周期和窗口 resize 事件以触发布局重算

---

## 主要事件

- **`on_parent`**  
  当控件被添加到父容器后触发，用于首次设置列宽。

- **`resize`**  
  浏览器窗口大小改变时触发，动态调整网格列数和间距。

- **`charsize` (全局事件)**  
  字符尺寸变化时触发（通常因主题切换或缩放引起），重新计算基于字符单位的列宽。

---

## 源码例子

```json
{
  "id": "dynamicGrid",
  "widgettype": "DynamicColumn",
  "options": {
    "col_cwidth": 20,        // 每列最小宽度 = 20ch（字符单位），推荐方式
    "col_cgap": 0.5,         // 列间间隙 = 0.5ch
    "mobile_cols": 1,        // 移动端显示为单列
    "style": {
      "padding": "10px"
    }
  },
  "subwidgets": [
    {
      "id": "card1",
      "widgettype": "Div",
      "options": {
        "text": "卡片 1",
        "style": {
          "background": "#f0f0f0",
          "border": "1px solid #ccc",
          "padding": "20px",
          "textAlign": "center",
          "borderRadius": "8px"
        }
      }
    },
    {
      "id": "card2",
      "widgettype": "Div",
      "options": {
        "text": "卡片 2",
        "style": {
          "background": "#e0e0e0",
          "border": "1px solid #bbb",
          "padding": "20px",
          "textAlign": "center",
          "borderRadius": "8px"
        }
      }
    },
    {
      "id": "card3",
      "widgettype": "Div",
      "options": {
        "text": "卡片 3",
        "style": {
          "background": "#d0d0d0",
          "border": "1px solid #aaa",
          "padding": "20px",
          "textAlign": "center",
          "borderRadius": "8px"
        }
      }
    }
  ],
  "binds": [
    {
      "actiontype": "method",
      "wid": "dynamicGrid",
      "event": "resize",
      "target": "dynamicGrid",
      "method": "set_column_width",
      "params": {}
    },
    {
      "actiontype": "method",
      "wid": "dynamicGrid",
      "event": "on_parent",
      "target": "dynamicGrid",
      "method": "set_column_width",
      "params": {}
    }
  ]
}
```

> ✅ **注释说明：**
> - `col_cwidth`: 推荐使用字符单位（ch），可保证文字排版对齐一致性
> - `col_cgap`: 间隙也基于字符单位，随字体缩放而变化，提升可访问性
> - `mobile_cols`: 竖屏手机强制显示为单列，提升阅读体验
> - 所有子控件将自动填入网格中，浏览器自行处理换行与对齐
> - `binds` 中显式调用 `set_column_width` 确保初始和变更时正确渲染

---

💡 **使用建议：**

- 若希望固定列数，请结合 `minmax()` 和 `auto-fit` 使用其他布局策略
- 可配合 `urlwidget` 动态加载子项，实现无限滚动卡片墙
- 支持国际化文本变动引起的宽度变化，只要触发 `charsize` 更新即可自动适配