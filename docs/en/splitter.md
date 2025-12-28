# Splitter

Control Function: Used to create a horizontal rule (divider line) on the page, commonly for visually separating different content sections.  
Type: Standard Control  
Parent Control: `bricks.JsWidget`

## Initialization Parameters

No special initialization parameters; inherits default parameters from `bricks.JsWidget`. The constructor calls `super({})`, initializing the parent class with an empty configuration object.

## Main Events

- **create**: Triggered when the control is created. Internally invokes the `_create('hr')` method to generate an `<hr>` DOM element and assigns it to `this.dom_element`, serving as the root element of this control.