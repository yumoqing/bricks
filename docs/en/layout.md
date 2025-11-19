# HBox

**Widget Functionality**: A horizontal layout container used to arrange child widgets in a horizontal direction.  
**Type**: Container widget  
**Parent Widget**: `bricks.Layout`

## Initialization Parameters

- `options` (Object, optional): Configuration options object, inheriting general options from `Layout`.  
  - No specific parameters; the constructor only calls the parent class and sets the CSS class `'hcontainer'`.

## Key Events

- No specific events.  
- Inherits keyboard navigation support from `Layout` (when `keyselectable` is enabled):  
  - `keydown`: Handles arrow keys (left/right to switch hierarchy levels, up/down to change selection, Enter to trigger click).

---

# FHBox

**Widget Functionality**: A fixed horizontal layout container that prevents child elements from wrapping, suitable for non-wrapping horizontal arrangements.  
**Type**: Container widget  
**Parent Widget**: `bricks.HBox` → `bricks.Layout`

## Initialization Parameters

- `options` (Object, optional): Configuration options object.  
  - No additional parameters; after calling the parent constructor, the style `flexWrap: 'nowrap'` is set.

## Key Events

- Same as `HBox`, relying on keyboard navigation logic provided by `Layout`.  
- Supports focus control via arrow keys and triggering clicks with the Enter key.

---

# VBox

**Widget Functionality**: A vertical layout container used to arrange child widgets in a vertical direction.  
**Type**: Container widget  
**Parent Widget**: `bricks.Layout`

## Initialization Parameters

- `options` (Object, optional): Configuration options object.  
  - No specific parameters; the constructor only sets the CSS class `'vcontainer'`.

## Key Events

- No specific events.  
- Supports the same keyboard navigation mechanism defined in `Layout` (up/down for selection, left/right to enter/exit hierarchy levels, etc.).

---

# FVBox

**Widget Functionality**: A fixed vertical layout container that prevents child elements from wrapping, suitable for non-wrapping vertical arrangements.  
**Type**: Container widget  
**Parent Widget**: `bricks.VBox` → `bricks.Layout`

## Initialization Parameters

- `options` (Object, optional): Configuration options object.  
  - No additional parameters; the constructor sets `flexWrap: 'nowrap'`.

## Key Events

- Same as `VBox`, supporting full keyboard navigation behavior.

---

# Filler

**Widget Functionality**: A flexible filler widget that occupies remaining space in a Flex layout, enabling dynamic layout balancing. Typically used to expand spacing between other components.  
**Type**: Container widget (but generally not intended to have child widgets)  
**Parent Widget**: `bricks.Layout`

## Initialization Parameters

- `options` (Object, optional): Configuration options object.  
  - No specific parameters; the constructor sets the CSS class `'filler'`.  
  - Commented code previously planned to set `flexGrow: 1` and `overflow: auto`, but these are currently disabled.

## Key Events

- No specific events.  
- Can be included in the keyboard navigation stack (if `keyselectable` is explicitly enabled), though practical usage is rare.

---

# ResponsableBox

> **Note**: The class name might be intended as "ResponsiveBox"—likely a typo.

**Widget Functionality**: A responsive layout container that automatically switches between horizontal and vertical layout modes based on its aspect ratio. Displays horizontally (`hcontainer`) when width > height, otherwise vertically (`vcontainer`).  
**Type**: Container widget  
**Parent Widget**: `bricks.Layout`

## Initialization Parameters

- `opts` (Object, optional): Configuration options object passed to the parent `Layout`.  
  - The constructor binds the `'element_resize'` event to monitor size changes.

## Key Events

- `element_resize`: Triggered when the container's dimensions change, invoking the `reset_type()` method to re-evaluate layout orientation.  
- Automatically adjusts CSS class and dimension styles:  
  - Width > Height: Applies `'hcontainer'`, height set to 100%, width adaptive.  
  - Height ≥ Width: Applies `'vcontainer'`, width set to 100%, height adaptive.  
- Supports nested keyboard navigation, managed uniformly by `Layout`.

---

# Layout

> Although not directly registered with a factory name (while its subclasses are), `Layout` serves as the base class for all the above containers, housing core functionality.

**Widget Functionality**: The foundational layout container class, providing common features such as child widget management, keyboard selection support, title/description construction, and toolbar integration. It is the common parent of all layout widgets.  
**Type**: Container widget  
**Parent Widget**: `bricks.JsWidget`

## Initialization Parameters

- `options` (Object, optional)  
  - `keyselectable` (Boolean): Whether to enable keyboard selection; default is `false`.  
  - `title` (String): Optional title text, which generates a `Title3` widget.  
  - `description` (String): Optional description text, which generates a `Text` widget.  
  - `toolbar` (Object): Toolbar configuration used to create a `FloatTextIconBar`.  
  - Other generic parameters inherited from `JsWidget`.

## Key Events

- `keydown`: Globally bound, activated via `enable_key_select()`, handles the following keys:  
  - `ArrowUp` / `ArrowDown`: Move selection up or down among child widgets.  
  - `ArrowLeft`: Calls `up_level()` to go back one level.  
  - `ArrowRight`: Calls `down_level()` to enter a deeper level.  
  - `Enter`: Triggers the `click` event on the currently selected widget.  
- `on_parent`: Dispatched when the widget is added to or removed from a parent container, notifying child widgets of parent changes.  
- `element_resize`: Used primarily by `ResponsableBox`, though `Layout` provides DOM element manipulation capabilities.  
- `click`: Can be manually dispatched to the selected child widget via `enter_handler()`.

Additionally, the following key methods (though not events) influence the event flow:

- `enable_key_select()` / `disable_key_select()`: Enables/disables keyboard navigation and manages the global stack `key_selectable_stack`.  
- `add_widget(w, index)`: Adds a child widget, automatically inserting it into the DOM and establishing parent-child relationships.  
- `remove_widget(w)` / `clear_widgets()`: Removes a widget or clears all, cleaning up DOM and event bindings.  
- `select_item(w)`: Highlights the specified child widget (requires support for the `.selected(bool)` method).