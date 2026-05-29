# ProgressBar

**Control Function**: Displays a progress bar to visually represent the percentage completion of a task.  
**Type**: Standard control (extension based on the container control HBox)  
**Parent Control**: `bricks.HBox`

## Initialization Parameters

| Parameter Name | Type   | Description |
|----------------|--------|-------------|
| `total_value`  | Number | (Optional) The total value of the task, used to calculate the progress percentage. Defaults to 100. |
| `bar_cwidth`   | Number | (Optional) The height of the progress bar in units of line height. Defaults to 2. |

> **Note**: In the actual code, `this.bar_cwidth || 2` is used, but `total_value` is not utilized within the constructor. It should likely be used in the `set_value` method together with `current` and `total`. There appears to be an issue with undefined variables (`current` and `total`) in the current implementation.

## Main Events

* **No explicitly defined events**: The source code does not bind or trigger any custom events.  
* The control may inherit basic layout events from `HBox`, but no additional events are registered.

> ⚠️ **Code Issue Notice**:
> - In the `set_value` method, the variables `current` and `total` are used but not defined. They should be replaced with `v` and `this.total_value`.
> - There is inconsistency in variable naming within the percentage calculation logic: `pzt = (current / total) * 100` is calculated first, then `percentage` is used later. This should be unified using `v / this.total_value`.
>
> **Recommended Fix**:
> ```js
> set_value(v) {
>     var percentage = this.total_value ? (v / this.total_value) * 100 : 0;
>     percentage = Math.max(0, Math.min(100, percentage));
>     this.text_w.set_style('width', percentage + '%');
> }
> ```