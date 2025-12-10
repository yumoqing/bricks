# Html

Control Function: Used to insert custom HTML content into a page.  
Type: Ordinary control  
Parent Control: `bricks.JsWidget`

## Initialization Parameters

- `html` (String)  
  The HTML string content to be inserted into the control. This content will be set as the `innerHTML` of the control's DOM element.

Example:
```js
new bricks.Html({
  html: '<div style="color: red;">This is red text</div>'
});
```

## Main Events

No specific events (inherits general events from the parent class, such as `init`, `render`, etc., but this control does not define any specific events).