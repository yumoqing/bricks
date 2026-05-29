# ChartBar

**Widget Functionality**: Used to display a bar chart. Implemented based on ECharts extension, supporting data retrieval from a specified source and dynamically rendering multi-series bar charts.  
**Type**: Standard widget  
**Parent Widget**: `bricks.EchartsExt`

## Initialization Parameters

| Parameter     | Type   | Description |
|---------------|--------|-------------|
| `data_url`     | string | Optional. The URL for requesting data, used to asynchronously load chart data. |
| `data_params`  | object | Additional parameters sent with the data request; used in conjunction with `data_url`. |
| `method`       | string | HTTP method for data request, such as `'GET'` or `'POST'`. Defaults to `'GET'`. |
| `data`         | array  | Optional. Directly pass a local data array. Must be an array of objects, each representing one data record. |
| `nameField`    | string | Specifies which field to use as the X-axis category name (e.g., category, time, etc.). |
| `valueFields`  | array  | An array of strings specifying one or more fields as Y-axis values, used to generate multiple data series. |

> Example data structure:
> ```json
> [
>   { "category": "A", "value1": 10, "value2": 20 },
>   { "category": "B", "value1": 15, "value2": 25 }
> ]
> ```
> If `nameField = "category"` and `valueFields = ["value1", "value2"]`, two bar series will be generated.

## Main Events

| Event Name       | Trigger Condition | Callback Parameter Details |
|------------------|-------------------|----------------------------|
| `chart:loaded`   | Triggered after data is successfully loaded and the chart has been rendered | `event.detail` contains the original data and the final generated ECharts configuration (`options`) |
| `chart:error`    | Triggered when data loading fails or parsing errors occur | `event.detail` contains error information such as `message`, `url`, `status`, etc. |

> Note: Events are dispatched via a custom event mechanism. Use `addEventListener('chart:loaded', handler)` to listen for events.