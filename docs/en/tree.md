# Tree

**Widget Functionality**: A tree structure control used to display hierarchical data (such as directories, organizational structures, etc.). It supports features including asynchronous loading, node addition/deletion/modification, checkbox selection, toolbar operations, and more. Can be used as either a static or editable tree.

**Type**: Container Widget  
**Parent Widget**: `bricks.VScrollPanel`

## Initialization Parameters

| Parameter | Type | Required | Description |
|---------|------|----------|-------------|
| `row_height` | `String` | No | Height of each node row; default is `'35px'` |
| `idField` | `String` | Yes | Field name in the data representing the unique identifier of a node |
| `textField` | `String` | Yes | Field name in the data representing the display text of a node |
| `is_leafField` | `String` | No | Field name indicating whether a node is a leaf node; default is `'is_leaf'` |
| `typeField` | `String` | No | Field name used to distinguish node types, typically for customizing icons |
| `data` | `Array` | No | Array of static tree data for direct initialization of nodes |
| `dataurl` | `String` | No | URL for asynchronously loading child node data |
| `method` | `String` | No | HTTP method for requesting data; default is `'GET'` |
| `params` | `Object` | No | Global parameters attached when making requests |
| `node_view` | `Widget Description` | No | Custom rendering template for nodes (a description object) |
| `checkField` | `String` | No | When checkbox support is enabled, this specifies the field in the data that stores the checked state |
| `node_typeicons` | `Object` | No | Icon mapping based on node type, format: `{ nodetype: { open, close, leaf }, default_type: "type" }` |
| `editable` | `Object` | No | Configuration for editing, containing fields like `fields`, `add_url`, `delete_url`, `update_url`, etc. |
| `newdata_params` | `Object` | No | Additional fixed parameters injected when adding new nodes |

## Key Events

| Event Name | Trigger Condition | Callback Parameter Description |
|-----------|--------------------|-------------------------------|
| `node_selected` | Fired when a node is clicked to become selected or deselected | Parameter is `node.user_data` extended with `{ selected: true/false }` |
| `check_changed` | Fired when the checkbox state of a node changes | Parameter is the node's `user_data`, reflecting the latest checked status |
| `command` (from `toolbar_w`) | Triggered when a toolbar button is clicked | Handled by `toolbar_command`, executes actions like add, delete, update, or other custom commands based on `event.params.name` |
| (Custom commands) e.g., `add`, `delete`, `update`, etc. | Dispatched via `dispatch(name, data)` after user performs an action and submission succeeds | `data` contains node data and metadata `meta_data` (source, title, icon, etc.), which can be used to open forms or notify other modules |

In addition, the `Tree` widget responds to the following user interactions and executes corresponding logic:
- Expand/collapse nodes (via `expand()` / `collapse()`)
- Dynamically load child node data (via `get_children_data`)
- Add, delete, or modify nodes (via HTTP requests or local operations)