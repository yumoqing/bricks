# Specification for .ui Suffix Files in Application Development Source Code

Bricks uses `.ui` files in JSON format on the server side to store widget description data. The frontend retrieves the JSON content from the `.ui` file, converts it into a JSON object, and then passes this object to the `widgetBuild` function to create Bricks widgets.

The `.ui` files support Jinja2 templates, enabling dynamic generation of frontend widget properties and data.

### Widget Description Data Specification
```json
{
  "id",              // Optional; if missing, a UUID-type ID will be generated dynamically
  "widgettype",      // String property; value is either a registered widget name in Bricks or "urlwidget"
  "options",         // Object type; initialization parameters for widget instantiation — refer to individual widget documentation
  "subwidgets",      // Array type; required only for container widgets; each element is a widget description for a child widget
  "binds"            // Defines event handling — see event handling specification below
}
```

A widget description JSON file must include the `"widgettype"` and `"options"` properties. The `"subwidgets"` property defines child widgets contained within this widget. The `"binds"` property defines event handlers for this widget or its child widgets.

## Explanation of `widgettype`

The `widgettype` value should be either the name of a registered widget in Bricks or the special string `"urlwidget"`. It specifies which Bricks widget this instance represents. When the value is `"urlwidget"`, the widget's data is fetched from the server, and the `options` field follows a specific format (described below).

## `options`

Initialization parameters for the widget. These may include parameters defined by the widget itself or inherited from ancestor classes. When `widgettype` is `"urlwidget"`, the `options` object must conform to the following structure:

```json
{
  "url",             // URL from which to fetch the widget data
  "method",          // HTTP method (e.g., "GET", "POST", etc.)
  "params"           // Dictionary containing parameters to send with the HTTP request
}
```

## `binds`

An array that defines event handlers. Each item in the array specifies one event handling rule. Bricks supports five types of event handling methods:
- `urlwidget`
- `method`
- `script`
- `registedfunction`
- `event`

All five types can be used within the `binds` array. Different event handling methods can be flexibly combined within the same widget to respond to various events from different controls.

Features supported:
* Define event handlers for the widget where `binds` is defined.
* Define event handlers for any child (or descendant) widget of the widget containing `binds`.
* Define event handlers for any widget in the application widget tree identified by its `'wid'`.
* For the same event on the same widget, multiple handlers can be defined and will be executed sequentially in the order they are listed.

For detailed information about event handling, please refer to [Bricks Event Handling](event.md).