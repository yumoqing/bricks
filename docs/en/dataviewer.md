# DataViewer

**Control Function**: A container control for displaying paged data. It supports scroll-based loading of previous and next pages, row operations (create, read, update, delete), toolbar command handling, and dynamic rendering of data rows. Commonly used in scenarios involving data lists or tabular displays.

**Type**: Container Control  
**Parent Control**: `bricks.VBox`

## Initialization Parameters

| Parameter Name | Type | Description |
|----------------|------|-------------|
| `data_url` | String | The API URL for loading data, used by `PageDataLoader` |
| `data_params` | Object | Additional parameters sent with every data request |
| `page_rows` | Number | Number of data items requested per page |
| `data_method` | String | HTTP method for requests (e.g., 'GET' or 'POST'), defaults to 'GET' |
| `cache_limit` | Number | Maximum number of cached pages, controlling how many historical pages are kept in memory |
| `editable` | Object | Optional configuration defining icons and URLs for add, update, clone, and delete operations |
| &nbsp;&nbsp;`.add_icon` | String | Icon path for the "Add" button |
| &nbsp;&nbsp;`.update_icon` | String | Icon path for the "Update" button |
| &nbsp;&nbsp;`.clone_icon` | String | Icon path for the "Clone" button |
| &nbsp;&nbsp;`.delete_icon` | String | Icon path for the "Delete" button |
| &nbsp;&nbsp;`.new_data_url` | String | Target URL for submitting new record data |
| &nbsp;&nbsp;`.update_data_url` | String | Target URL for submitting updated record data |
| &nbsp;&nbsp;`.delete_data_url` | String | Target URL for submitting delete requests |
| `toolbar` | Object | Custom toolbar definition object containing additional command buttons |
| `row_options` | Object | Options related to row rendering |
| &nbsp;&nbsp;`.fields` | Array | Array of field definitions, each containing information such as `name`, `uitype`, etc. |
| &nbsp;&nbsp;`.editexcluded` | Array | List of field names to be hidden during edit/clone operations |

> ⚠️ All initialization parameters are passed through `opts`. The constructor automatically sets width to `'100%'`, height to `'100%'`, and overflow to hidden.

## Main Events

| Event Name | Trigger Condition | Description of Passed Data (`event.params`) |
|-----------|-------------------|---------------------------------------------|
| `row_check_changed` | Triggered when the selection state of a row changes (called by subclass or internal mechanism) | Object containing user data of that row (`user_data`) |
| `<command>` | Fired when a non-built-in button in the toolbar is clicked, using the button's `name` as the event name | Contains `user_data` of the selected row if any; otherwise `null` |
| `command` | Internal use — raw command events from `IconTextBar` | Raw tool item descriptor `{ name, selected_row }` |

> 💡 Special Command Handling:
> - `add`: Opens a form dialog to create a new record
> - `update`: Opens a form dialog to edit the currently selected row
> - `clone`: Opens a new form dialog pre-filled with a copy of the current row
> - `delete`: Shows a confirmation dialog and executes deletion upon confirmation

---