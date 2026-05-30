# ChartLine

**Control Functionality**: Used to display line charts. Implemented as an extension of ECharts, it supports dynamically generating multi-line data visualizations through configuration of data sources, field mapping, and chart options.  
**Type**: Standard control  
**Parent Control**: `bricks.EchartsExt`

## Initialization Parameters

| Parameter Name | Type   | Description |
|----------------|--------|-------------|
| `data_url`     | string | (Optional) The URL of the API endpoint for fetching chart data. If provided, data will be automatically requested. |
| `data_params`  | object | (Optional) Parameters to send with the request; used together with `data_url`. |
| `method`       | string | (Optional) HTTP method used when requesting data. Defaults to 'GET'. |
| `data`         | array  | (Optional) Static data array passed directly, formatted as an array of objects, e.g., `[{ name: 'A', value1: 10, value2: 20 }]` |
| `line_options` | object | (Optional) Additional ECharts series configuration options for customizing line styles, animations, etc. |
| `nameField`    | string | Specifies the field in the data to be used as the X-axis label, such as a time or category field. |
| `valueFields`  | array  | Specifies one or more numeric fields; each field generates a separate line, e.g., `['sales', 'profit']`. |

> Note: Either `data` or `data_url` can be used — if both are present, `data_url` takes precedence for data retrieval.

## Main Events

- **`load`**  
  **Trigger Timing**: Fired after the control is initialized and data has been successfully loaded and rendered.  
  **Callback Parameters**: `{ chart: ECharts instance, data: current rendered data }`  
  **Usage**: Can be used to execute custom logic after chart rendering, such as adding markers or binding external interactions.

- **`click`**  
  **Trigger Timing**: Fired when the user clicks on a point in the chart.  
  **Callback Parameters**: Native ECharts click event object, containing information such as `seriesName`, `name`, `value`, `data`, etc.  
  **Usage**: Enables functionalities like viewing details of a data point or linking with other components.

- **`datafetch`**  
  **Trigger Timing**: Fired after successfully retrieving data from `data_url`, but before rendering.  
  **Callback Parameters**: `{ data: raw data returned by the server }`  
  **Usage**: Allows interception and modification of data before processing and rendering.