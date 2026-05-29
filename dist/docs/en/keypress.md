# KeyPress

**Widget Functionality**: Listens for keyboard key events. When the user presses any key, it clears the current content and displays the name of the pressed key.  
**Type**: Container widget  
**Parent Widget**: VBox  

## Initialization Parameters

- No special initialization parameters; inherits general parameters from `bricks.VBox` (such as layout-related options).

## Main Events

- `keydown`: Binds a global keyboard press event, triggering the `key_handler` method to process key logic.  
  This event retrieves the `event.key` value and dynamically creates a text widget to display the key information.