# Running

**Widget Functionality**: Displays an animation indicating ongoing activity (e.g., loading) and shows the elapsed time in real-time. Commonly used to inform users that an operation is in progress.  
**Type**: Standard widget  
**Parent Widget**: `bricks.BaseModal`

## Initialization Parameters

| Parameter | Type | Description |
|----------|------|-------------|
| target | Optional, any type | Specifies the target element or context (not directly used in current code, possibly handled by parent class) |
| icon   | String | URL of the running animation icon; if not provided, defaults to the built-in resource `running.gif` |
| auto_open | Boolean (automatically set to true) | Determines whether the modal opens automatically; this widget enforces it as `true` |
| anchor | String (fixed as 'cc') | Positioning anchor point, meaning center-center alignment |

> Note: `auto_open` and `anchor` are internally set within the constructor and should not be manually passed when instantiating.

## Main Events

No custom events are defined. However, it inherits behaviors from `bricks.BaseModal`:

- **dismiss()**: Closes the modal and cleans up scheduled tasks. Invoking this method stops the time counter and executes the parent class's closing logic.