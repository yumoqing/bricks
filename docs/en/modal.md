# Modal

## Widget Functionality, Type (Regular or Container Widget), and Parent Widget
- **Widget Functionality**: `Modal` is a modal dialog widget used to display a centered floating panel on the page. It is typically used to show content, forms, or prompt messages. It supports functionalities such as closing by clicking the backdrop, automatic opening/closing, and timed closing.
- **Type**: Container widget (can contain other child widgets)
- **Parent Widget**: `bricks.BaseModal`

### Initialization Parameters
| Parameter     | Type           | Description |
|--------------|----------------|-------------|
| `target`       | string or Layout | Specifies the target container to which the modal will be mounted; defaults to `bricks.Body` (i.e., body) |
| `auto_open`    | boolean        | Whether to automatically call the `open()` method to display the modal after creation; default is `false` |
| `auto_close`   | boolean        | Whether clicking the overlay layer closes the modal (currently this feature is not enabled) |
| `width`        | string/number  | Width of the inner panel of the modal, e.g., `'500px'` or `'80%'` |
| `height`       | string/number  | Height of the inner panel of the modal |
| `bgcolor`      | string         | Background color of the inner panel; default is `#e8e8e8` |
| `title`        | string         | Title of the modal, displayed in the top title bar |
| `archor`       | string         | Positioning anchor point; values include `tl`, `tc`, `tr`, `cl`, `cc`, `cr`, `bl`, `bc`, `br`; default is `'cc'` (centered) |

> Note: `org_index` and `timeout` are defined in `BaseModal` but not listed in the constructor comments of `Modal`, possibly deprecated or handled by the base class.

### Main Events
| Event Name     | Trigger Timing |
|---------------|----------------|
| `opened`       | Triggered after calling the `open()` method, indicating the modal has been displayed |
| `dismissed`    | Triggered after calling `dismiss()` and successfully removing the modal |
| `click`        | Triggered when the user clicks the modal's overlay layer (only bound when `auto_close` is enabled; currently commented out) |

---

# ModalForm

## Widget Functionality, Type (Container Widget), and Parent Widget
- **Widget Functionality**: `ModalForm` is a form-based modal dialog widget that enables quick creation and display of a modal window containing a dynamic form. Commonly used for data input, configuration settings, etc.
- **Type**: Container widget (internally contains a Form child widget)
- **Parent Widget**: `bricks.PopupWindow`

### Initialization Parameters
| Parameter       | Type           | Description |
|------------------|----------------|-------------|
| `auto_open`      | boolean        | Whether to automatically open the modal after construction (implemented via a delayed task) |
| `width`          | string/number  | Width of the form modal |
| `height`         | string/number  | Height of the form modal |
| `bgcolor`        | string         | Background color (passed to parent class for use) |
| `archor`         | string         | Positioning mode, same as `Modal`, controls form position |
| `title`          | string         | Title of the form, displayed at the top of the form |
| `description`    | string         | Description text shown below the title |
| `fields`         | array          | Array of form field configurations defining the structure of input fields |
| `binds`          | array          | Optional data binding configuration for associating models or state |
| `user_data`      | any            | Custom user data for extended usage (currently not directly used) |
| `submit_url`     | string (not a constructor parameter) | Submission URL (must be set externally, used for submission logic) |

> Note: `ModalForm` uses the asynchronous method `build_form` with a 0.2-second delay to create the form, ensuring the DOM environment is ready.

### Main Events
| Event Name     | Trigger Timing |
|----------------|----------------|
| `submit`        | Triggered when the form is submitted, carrying form data as parameter |
| `submited`      | Triggered after the form completes the submission process (forwarded from the `submited` event of the Form), carrying server response data |
| `cancel`        | Triggered when the user clicks the cancel button (bound to the `dismiss` method) |
| `dismissed`     | Triggered after the modal is closed (inherited from base class) |

> Note: This widget relies on the event mechanism of the `Form` widget and encapsulates and forwards its events.