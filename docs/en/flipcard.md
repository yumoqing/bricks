# FlipCard

**Control Functionality:** A 3D flip card widget. Shows title and subtitle on the front face, and flips to reveal detailed content on the back face on mouse hover. Commonly used for product displays, feature cards, and similar scenarios.
**Type:** Basic Control
**Parent Control:** `bricks.JsWidget`

## Initialization Parameters

| Parameter | Type | Description |
|-------|------|------|
| `width` | string | Card width in px. Default: `280px`. |
| `height` | string | Card height in px. Default: `360px`. |
| `css` | string/object | Custom CSS class name. |

## Subwidget Structure

FlipCard accepts 2 subwidgets for front and back content respectively:

```json
{
  "widgettype": "FlipCard",
  "subwidgets": [
    {"widgettype": "VBox", "subwidgets": [...]},  // 正面
    {"widgettype": "VBox", "subwidgets": [...]}   // 背面
  ]
}
```

## Main Events

- **`click`**
  Fires when the card is clicked.

## Example

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

## Dependencies

Requires flip animation CSS (perspective, rotateY, backface-visibility) defined in the page stylesheet, or use built-in bricks CSS class `.bricks-flipcard`.
