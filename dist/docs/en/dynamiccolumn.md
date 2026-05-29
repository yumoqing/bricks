# DynamicColumn

**Control Function:** A dynamic column layout container that automatically adjusts the number of grid columns and column width based on screen size and configuration. Suitable for responsive layout scenarios.  
**Type:** Container Control  
**Parent Control:** Layout

## Initialization Parameters

| Parameter     | Type   | Description |
|---------------|--------|-------------|
| `col_cwidth`  | Number | (Optional) The character width unit per column (based on `charsize`), used to calculate column width. If neither `col_cwidth` nor `col_width` is set, defaults to 20. |
| `col_width`   | Number | (Optional) Fixed pixel width per column. Lower priority than `col_cwidth`. |
| `col_cgap`    | Number | (Optional) Gap size between columns, measured in `charsize` units. Defaults to `0.5`. |
| `mobile_cols` | Number | (Optional) Forced number of columns in mobile portrait mode. Defaults to `1`. |

> **Note:** If neither `col_cwidth` nor `col_width` is provided, `col_cwidth` defaults to 20.

## Main Events

- **`on_parent`**  
  Triggered when the control is added to a parent container. Used for initialization or recalculating column widths.

- **`resize`**  
  Triggered when the browser window size changes. Dynamically adjusts `gridTemplateColumns` and `gap` to fit the new dimensions.

- **`charsize`** (from `bricks.app`)  
  Triggered when the character size changes (usually due to font or zoom changes). Used to recalculate column widths and gaps based on character units.