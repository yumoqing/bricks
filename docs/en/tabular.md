# Tabular

**Widget Functionality**: Used to display data in a tabular format, supporting features such as row selection, checkbox state change events, dynamic content expansion, etc. Suitable for presenting and interacting with data lists.  
**Type**: Regular widget (container-type data display widget)  
**Parent Widget**: `bricks.DataViewer`

## Initialization Parameters

- `opts` {Object}: Initialization options object, inheriting parameters from `DataViewer`, with the following additional properties:
  - `row_options` {Object}: Defines rendering configurations for each data row, including fields (`fields`), height (`cheight`), etc.
  - `content_view` {Object|undefined}: Optional. Specifies the detailed content view description (JSON structure) to be expanded when a row is clicked. If provided, enables collapsible panel functionality.
  - `editexclouded` {Array}: Optional. An array of field names that should not be displayed in edit mode.
  - `data_params` {Object}: Data parameters used to generate hidden fields, typically used in scenarios like form submission.

## Main Events

- `row_selected`  
  **Trigger Timing**: Fired when a row is clicked and selected.  
  **Payload**: The data record (`record` object) corresponding to the currently selected row.  
  **Example Use**: Can be used to update a detail panel or the state of external widgets.

- `row_check_changed`  
  **Trigger Timing**: Fired when the checkbox state of a row changes.  
  **Payload**: The user data (`user_data`) associated with the row.  
  **Note**: Dispatched via binding the `check_changed` event of `DataRow`. Commonly used for handling multi-selection operations.

- Custom Event Forwarding (via `record_event_handle`)  
  Supports bubbling events from child components (e.g., toolbar buttons) to the parent, such as:  
  - Custom events wrapping DOM events like `click`, `dblclick`, etc.  
  - Carries the original record data, enabling business logic to respond appropriately.