# DynamicAccordion

**Widget Functionality**: A dynamic collapsible list widget that supports pagination, remote data fetching, lazy loading of content, and CRUD operations (create, read, update, delete), along with customizable toolbars. Suitable for displaying large volumes of structured data in a collapsible layout.  
**Type**: Container Widget  
**Parent Widget**: bricks.VScrollPanel

## Initialization Parameters

| Parameter | Type | Description |
|----------|------|-------------|
| `data_url` | String | URL for requesting data to load the list |
| `data_method` | String | Request method (e.g., GET/POST); defaults to GET |
| `cache_limit` | Number | Maximum number of cached pages, controlling how many data pages are retained in memory |
| `page_rows` | Number | Number of rows to request per page |
| `row_cheight` | Number | Row height coefficient; default is `1.5` |
| `record_view` | Object/String | Rendering template for each record's header area (widget description or name) |
| `content_rely_on` | String | Field name that determines whether content should expand |
| `content_rely_value` | Any | Content will only be loaded when the value of the `content_rely_on` field equals this value |
| `editable` | Object | Configuration object for editing, including settings for add, update, and delete operations |
| &nbsp;&nbsp;`.add_icon` | String | Icon path for the add button |
| &nbsp;&nbsp;`.update_icon` | String | Icon path for the update button |
| &nbsp;&nbsp;`.delete_icon` | String | Icon path for the delete button |
| &nbsp;&nbsp;`.form_cheight` | Number | Form height coefficient |
| &nbsp;&nbsp;`.new_data_url` | String | Submission URL for adding a new record |
| &nbsp;&nbsp;`.update_data_url` | String | Submission URL for updating a record |
| &nbsp;&nbsp;`.delete_data_url` | String | Submission URL for deleting a record |
| `fields` | Array | Array of field definitions used for form and data display |
| `record_toolbar` | Object | Toolbar configuration (icon buttons) on the right side of each row |
| `record_toolbar_collapsable` | Boolean | Whether the toolbar can be collapsed (details not yet implemented) |
| `header` | Object | Header configuration (reserved for future use) |
| `content_view` | Object/String | Rendering template for the content area shown when expanded |
| `title` | String | Optional title text displayed at the top of the widget |
| `description` | String | Optional description text for the widget |
| `toolbar` | Object | Top toolbar configuration (passed to `IconTextBar`) |

## Main Events

| Event Name | Trigger Condition | Parameters |
|-----------|-------------------|----------|
| `row_selected` | Triggered when a user clicks a row | `info`: The clicked `AccordionInfo` instance |
| Custom events (defined via `record_toolbar.tools[i].name`) | Triggered when clicking custom toolbar buttons within a row | `record`: Data object of the current row |
| `conformed` (internal use) | Triggered after user confirms deletion in confirmation dialog | Passed to `delete_record_act` method for processing |
| `submited` (nested form) | Triggered after successful submission of an add/edit form | Response data in `event.params` |
| `cancel` (nested form) | Triggered when form cancellation occurs | Closes the current edit area |

> Note: Some events are triggered by child components and handled internally by `DynamicAccordion`, such as `submited`, `cancel`, and `click`.