# ChartPie

**Control Functionality**: Used to display pie chart data visualization. Supports generating interactive ECharts pie charts through configuration of data sources, field mapping, and chart options.  
**Type**: Standard control  
**Parent Control**: bricks.EchartsExt

## Initialization Parameters

| Parameter Name | Type   | Description |
|----------------|--------|-------------|
| title          | string | Chart title displayed at the top of the chart |
| description    | string | Description information for the chart, can be used for hints or supplementary explanations |
| legend         | object | Legend configuration options, controlling display properties such as position and style |
| pie_options    | object | Custom configuration options for the pie series, such as radius, label formatting, etc. |
| data_url       | string | Data request URL used to fetch the data required for the chart |
| nameField      | string | Field name in the data used as the name for pie chart items |
| valueFields    | array  | Array of field names in the data used as values for the pie chart (typically the first field is used) |
| data_params    | object | Additional parameters sent with the data request, combined with `data_url` |
| data           | array  | Static data array; if provided, this data will be used instead of loading from `data_url` |

## Main Events

- **element_click**  
  Triggered when a user clicks on a data item in the pie chart.  
  The callback includes information about the clicked item, such as `name` and `value`, which can be used to implement drill-down or detail display functionality.