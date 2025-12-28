# GobangPoint

**Control Functionality:** Represents a single point on a Gomoku (Five in a Row) board. Displays as empty, black stone, or white stone based on its state, and supports mouse hover effects.  
**Type:** Ordinary Control  
**Parent Control:** `bricks.Image`

## Initialization Parameters

| Parameter | Type   | Description |
|---------|--------|-------------|
| `p_status` | Number | Point status: 0 for empty, 1 for black stone, 2 for white stone |
| `p_x`      | Number | Horizontal position, ranging from 1 to 15 |
| `p_y`      | Number | Vertical position, ranging from 1 to 15 |
| `tip`      | String (optional) | Tooltip text displayed on mouse hover |

> **Note:** The constructor automatically calls `calc_url()` to generate the corresponding image path based on position and status, then sets the image source via `set_url()`.

## Main Events

- **`mouseover`**  
  Triggered when the mouse enters the control area. Calls `set_current_position(true)` to apply highlight styling for the current coordinate (adds the `curpos` CSS class).

- **`mouseout`**  
  Triggered when the mouse leaves the control area. Calls `set_current_position(false)` to remove the highlight style.

---

# Gobang

**Control Functionality:** Implements a 15×15 Gomoku game interface container responsible for rendering the game board, managing point states, and handling player turn logic.  
**Type:** Container Control  
**Parent Control:** `bricks.VBox`

## Initialization Parameters

No explicit external parameters. Internal initialization includes:

- Automatically creates a `Filler` placeholder control for adaptive layout
- Creates and renders a 15×15 grid of points using `GobangPoint`
- Binds window resize response to dynamically adjust each cell size, ensuring squares that fully occupy available space

## Main Events

- **`element_resize` (bound to `filler`)**  
  Triggered when the DOM element of `filler` changes size. Calls the `resize_area()` method to recalculate width and height of each cell, ensuring the board scales proportionally within the container.

### Custom Method Descriptions

- `render_empty_area()`  
  Initializes and renders an empty game board by creating a nested structure of `VBox` and `HBox` to arrange 15×15 `GobangPoint` instances, storing them in `this.area[i][j]` for future reference and manipulation.

- `resize_area()`  
  Dynamically calculates the size of each cell based on the actual dimensions of the `filler` (taking the smaller dimension divided by 15), then applies uniform width and height styles to all `GobangPoint` instances.

- `inform_go(party)`  
  (Currently an empty implementation) Intended to notify a specified party (e.g., `'black'` or `'white'`) to make their move; can be extended for AI integration or online multiplayer functionality.

> **Note:** This control is registered via `bricks.Factory.register('Gobang', bricks.Gobang);`, allowing it to be used in templates as `<widget type="Gobang"/>`.