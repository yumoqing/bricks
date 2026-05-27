# PeriodDays

**Widget Functionality**: Displays a clickable date range (start date and end date). Users can adjust the time period by clicking on the dates to move forward or backward. Supports stepping forward or backward in units of days, months, or years. Commonly used in time range selection scenarios.  
**Type**: Container widget  
**Parent Widget**: `bricks.HBox`

## Initialization Parameters

| Parameter   | Type   | Description |
|------------|--------|-------------|
| start_date | string | Initial start date, formatted as "YYYY-MM-DD" |
| end_date   | string | Initial end date, formatted as "YYYY-MM-DD" |
| step_type  | string | Step unit type. Possible values: `'days'`, `'months'`, `'years'`. Default is `'days'` |
| step_cnt   | number | Step size for each change. Default is `1` |
| title      | string | Optional title text displayed before the widget |
| splitter   | string | Separator between the start and end dates. Default is `' to '` |

> Note: If `splitter` or `step_cnt` is not provided, default values will be used.

## Main Event

### changed
- **Trigger Condition**: Triggered when the user clicks the start or end date, causing the date range to change.
- **Event Data**:
  ```js
  {
    start_date: "YYYY-MM-DD", // Updated start date
    end_date: "YYYY-MM-DD"   // Updated end date
  }
  ```
- **Description**: You can listen to this event using `bind('changed', callback)` to obtain the updated date range.