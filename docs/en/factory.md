# Factory_

## Control Functionality
`Factory_` is a factory class used for registering and retrieving controls (or components), providing a globally unique mechanism for control registration and management. Through this class, custom controls can be dynamically registered, and their corresponding constructor functions or classes can be obtained by name when needed.

- **Type**: Ordinary control (utility class / manager)  
- **Parent Control**: None (native JavaScript class)

## Initialization Parameters
- The constructor does not accept explicit external parameters.
- During internal initialization, a `widgets_kv` object is created to store the registered control mapping table:
  - Initialized with a reserved key `_t_` whose value is `1`, possibly used for version identification or existence checking.

## Main Events
- This control does not trigger any UI events.
- Provides the following methods as core behavioral interfaces:
  - `register(name: string, widget: function/class)`  
    Binds and registers the specified name `name` with the control class/function `widget`.
  - `get(name: string): function/class | null`  
    Retrieves the registered control by name; returns `null` if not found.

> Note: This control is typically used as underlying infrastructure within the `bricks` framework, serving as a unified manager for the lifecycle and access points of all visual controls or business components.