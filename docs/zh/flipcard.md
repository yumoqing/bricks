# FlipCard

控件功能：一个可翻转的卡片控件，正面显示标题和副标题，鼠标悬停时 3D 翻转为背面显示详细信息。常用于产品展示、功能卡片等场景。
类型：普通控件
父类控件：`bricks.JsWidget`

## 初始化参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `width` | string | 卡片宽度，默认 `280px`。 |
| `height` | string | 卡片高度，默认 `360px`。 |
| `css` | string/object | 自定义 CSS 样式类名。 |

## 子控件结构

FlipCard 接受 2 个子控件（subwidgets），分别为正面和背面内容：

```json
{
  "widgettype": "FlipCard",
  "subwidgets": [
    {"widgettype": "VBox", "subwidgets": [...]},  // 正面
    {"widgettype": "VBox", "subwidgets": [...]}   // 背面
  ]
}
```

## 主要事件

- **`click`**
  当卡片被点击时触发。

## 示例

```json
{
  "widgettype": "FlipCard",
  "options": {"css": "product-card"},
  "subwidgets": [
    {
      "widgettype": "VBox", "options": {"css": "card-front"},
      "subwidgets": [
        {"widgettype": "Text", "options": {"text": "产品名称"}},
        {"widgettype": "Text", "options": {"text": "简短描述"}}
      ]
    },
    {
      "widgettype": "VBox", "options": {"css": "card-back"},
      "subwidgets": [
        {"widgettype": "Text", "options": {"text": "详细说明"}}
      ]
    }
  ]
}
```

## 依赖

需要在页面 CSS 中定义翻转动画样式（perspective、rotateY、backface-visibility），或使用 bricks 内置 CSS 类 `.bricks-flipcard`。
