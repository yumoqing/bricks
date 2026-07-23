# Carousel

**Control Functionality:** An auto-rotating carousel widget. Cards are arranged in an arc with the center card being the largest and clearest, while side cards progressively shrink and fade. Auto-rotates on a timer, and supports hover-to-flip when used with FlipCard.
**Type:** Basic Control
**Parent Control:** `bricks.Layout`

## Initialization Parameters

| Parameter | Type | Description |
|-------|------|------|
| `cardWidth` | number | Width of center card in px. Default: `280`. |
| `cardHeight` | number | Height of center card in px. Default: `360`. |
| `interval` | number | Auto-rotation interval in ms. Default: `3000`. |
| `css` | string/object | Custom CSS class name. |

## Subwidget Structure

Carousel 接受多个子控件，Each subwidget becomes a carousel card:

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

Recommended to use 7-8 cards for the best visual effect.

## Main Events

- **`rotate`**
  Fires after each rotation completes. Can be used to sync external indicators.

## Example

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

## Dependencies

Requires `carousel.js` (provides auto-rotation and positioning logic) and corresponding CSS styles.
