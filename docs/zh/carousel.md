# Carousel

控件功能：自动轮播卡片走马灯控件，多个卡片以弧形排列，居中的卡片最大最清晰，两侧渐小渐淡。自动定时旋转，支持鼠标悬停翻牌（需配合 FlipCard 使用）。
类型：普通控件
父类控件：`bricks.Layout`

## 初始化参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `cardWidth` | number | 居中卡片宽度（px），默认 `280`。 |
| `cardHeight` | number | 居中卡片高度（px），默认 `360`。 |
| `interval` | number | 自动旋转间隔（毫秒），默认 `3000`。 |
| `css` | string/object | 自定义 CSS 样式类名。 |

## 子控件结构

Carousel 接受多个子控件，每个子控件作为一张走马灯卡片：

```json
{
  "widgettype": "Carousel",
  "subwidgets": [
    {"widgettype": "FlipCard", ...},
    {"widgettype": "FlipCard", ...},
    ...
  ]
}
```

推荐使用 7-8 张卡片以获得最佳视觉效果。

## 主要事件

- **`rotate`**
  每次完成一次旋转时触发。可用于同步外部指示器。

## 示例

```json
{
  "widgettype": "Carousel",
  "options": {"cardWidth": 280, "cardHeight": 360, "interval": 3000},
  "subwidgets": [
    {
      "widgettype": "FlipCard",
      "subwidgets": [
        {"widgettype": "VBox", "subwidgets": [
          {"widgettype": "Text", "options": {"text": "洞察入微"}},
          {"widgettype": "Text", "options": {"text": "机器视觉检测"}}
        ]},
        {"widgettype": "VBox", "subwidgets": [
          {"widgettype": "Text", "options": {"text": "毫秒级检测速度"}},
          {"widgettype": "Text", "options": {"text": "95% 漏检率降低"}}
        ]}
      ]
    }
  ]
}
```

## 依赖

需引入 `carousel.js`（提供自动旋转和定位逻辑），以及对应的 CSS 样式。
