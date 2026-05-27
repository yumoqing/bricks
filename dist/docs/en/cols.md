# Cols

**Widget Functionality**: Displays a paginated, scrollable multi-column data list, supporting dynamic loading of previous and next page data. Commonly used in scenarios such as content walls and card-based layouts.  
**Type**: Container Widget  
**Parent Widget**: `bricks.VBox`

## Initialization Parameters

| Parameter Name   | Type   | Description |
|------------------|--------|-------------|
| `data_url`       | String | The URL for fetching data asynchronously. |
| `data_params`    | Object | Initial parameter object sent with data requests. |
| `data_method`    | String | HTTP method for the request (e.g., GET, POST); defaults to GET. |
| `page_rows`      | Number | Number of data rows requested per page. |
| `cache_limit`    | Number | Maximum number of pages to cache; controls how many historical data pages are kept in memory. |
| `col_cwidth`     | Number | Fixed width (in pixels) for each column, used in dynamic column layout calculations. |
| `mobile_cols`    | Number | Number of columns displayed on mobile devices; defaults to 2. |
| `title`          | String | Optional title text; if provided, a title component will be displayed. |
| `description`    | String | Optional description text (supports Markdown format), rendered as explanatory content. |
| `toolbar`        | Object | Toolbar configuration object defining top action buttons. |
| `record_view`    | Object | View template definition for individual records, describing how each data item should be rendered. |

> **Note**: `record_view` is a widget configuration object that will be used by `bricks.widgetBuild` to generate child widgets for each data item.

## Main Events

| Event Name       | Trigger Condition | Payload |
|------------------|-------------------|---------|
| `record_click`   | Triggered when a user clicks on a record | The data object (`user_data`) corresponding to the clicked record |
| `command`        | Command event passed up from `toolbar_w` when a toolbar button is clicked, forwarded via `command_handle` as `dispatch(name)` | Command name (from `params.name` in the toolbar) |

> **Note**: `dispatch('record_click', data)` broadcasts this event outward so it can be listened to and handled externally.