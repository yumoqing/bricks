# InlineForm

**Control Function**: Embeds a submittable form inline, supporting field input, validation, and toolbar operations (submit, reset, cancel). Suitable for lightweight form embedding scenarios.  
**Type**: Ordinary control  
**Parent Control**: `bricks.FormBase`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `fields` | Array | Array of form field configurations; each field object includes information such as name, label, and uitype. |
| `height` | String | Optional, default is `"100%"`, sets the height of the control. |
| `width` | String | Optional, default is `"100%"`, sets the width of the control. |
| `overflow` | String | Optional, default is `"auto"`, controls how overflow content is displayed. |

> Note: All options are passed into the constructor via `opts`.

## Main Events

| Event Name | Trigger Condition | Callback Parameters |
|-----------|-------------------|---------------------|
| `submit(data)` | Triggered when the user clicks the "Submit" button and data passes validation. | `data`: FormData object or plain object containing form data. |
| `submited(resp)` | Triggered after the submission request completes (regardless of success or failure). | `resp`: Response object; returned content can be obtained via `await resp.json()`. |
| `cancel` | Triggered when the user clicks the "Cancel" button. | No parameters. |
| `reset` | Triggered when the user clicks the "Reset" button. | No parameters. |
| Custom command event | Triggered when a custom button in the toolbar has an `action` or name defined. | `event.params` contains button information. |

---

# Form

**Control Function**: A complete form container control that supports title, description, multi-field layout, separation of text and non-text fields, automatic toolbar generation, and configurable submission URL and method. Ideal for full forms in standalone pages or popups.  
**Type**: Container control  
**Parent Control**: `bricks.FormBase`

## Initialization Parameters

| Parameter | Type | Description |
|----------|------|-------------|
| `title` | String | Optional, form title displayed as large text. |
| `description` | String | Optional, form description shown below the title. |
| `fields` | Array | Required, list of field configurations, same structure as InlineForm. |
| `submit_url` | String | Optional, target URL for form submission; if provided, automatically sends HTTP request. |
| `method` | String | Optional, HTTP method, default is `'POST'`. |
| `notoolbar` | Boolean | Optional, default `false`, whether to hide the default toolbar (submit/reset/cancel). |
| `toolbar` | Object | Optional, extends or replaces default toolbar configuration. Structure: `{ tools: [...] }`. |
| `input_layout` | String | Optional, input layout style, supports `"VBox"` (vertical) or `"HBox"` (horizontal), default `"VBox"`. |
| `dataurl` | String | (Reserved) May be used for loading initial data (currently not directly used). |

## Main Events

| Event Name | Trigger Condition | Callback Parameters |
|-----------|-------------------|---------------------|
| `submit(data)` | Triggered before form submission, after validation passes. Can be used to intercept or preprocess data. | `data`: Data object or FormData being submitted. |
| `submited(resp)` | Triggered after sending the request to `submit_url`. | `resp`: Response object, usable for handling response results. |
| `cancel` | Triggered when the user clicks the "Cancel" button. | No parameters. |
| `reset` | Triggered when the user clicks the "Reset" button. | No parameters. |
| Custom event | Triggered when a custom button in the toolbar is clicked and has `action` or event name defined. | `event.params` contains button metadata. |

---

# FormBody

**Control Function**: The main content area used internally by `Form`, responsible for rendering all non-text fields (via `FieldGroup`) and text fields (read-only display). Acts as the container for actual input areas.  
**Type**: Container control  
**Parent Control**: `bricks.VScrollPanel`

## Initialization Parameters

| Parameter | Type | Description |
|----------|------|-------------|
| `form` | Object | The parent form instance, used to access field definitions, name_inputs, and other states. |
| `opts` | Object | Configuration options; automatically sets `width: '100%'` and `height: '100%'`. |

> Note: This control is typically not created directly by developers, but instantiated internally during `Form` construction.

## Main Events

This control does not dispatch events externally, but as a container inherits scrolling capabilities from `VScrollPanel`, primarily used for visual presentation.

- Does not actively trigger business events.
- Changes in its child controls (e.g., input fields) affect the state of the parent `Form`.

---

# FieldGroup

**Control Function**: A helper class used to recursively build field groups within a form (supporting nested group structures), organizing fields into dynamic columns (`DynamicColumn`) and input containers (`VBox`/`HBox`) according to layout rules.  
**Type**: Ordinary control (logical component)  
**Parent Control**: None (base class)

## Initialization Parameters

| Parameter | Type | Description |
|----------|------|-------------|
| `opts` | Object | Currently unused, reserved for future extension. |

> Note: This class is not a UI control and does not directly render DOM elements—it exists solely as a logical building block.

## Main Events

This class has no event mechanism and serves only synchronous method calls:

- `build_fields(form, parent, fields)`: Core method that recursively generates field UI and mounts it to the specified parent container.

---

> ✅ **Summary Notes**:
>
> - `InlineForm` and `Form` are form controls directly usable by users;
> - `FormBody` and `FieldGroup` are internal implementation components, generally not intended for direct use or separate documentation;
> - All form controls share a unified data collection, validation, and submission workflow;
> - Supports file-type fields (file/audio/video), which require `FormData` for automatic recognition;
> - Toolbar supports highly customizable extensions.