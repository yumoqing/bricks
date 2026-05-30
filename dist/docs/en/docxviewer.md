# DOCXviewer

**Control Functionality**: Embeds and displays `.docx` document content within a web page by converting Word documents to HTML using Mammoth.js and rendering the result.  
**Type**: Regular control (inherited from container control VBox)  
**Parent Control**: `bricks.VBox`

## Initialization Parameters

| Parameter | Type   | Description |
|---------|--------|-------------|
| `url`   | String | URL pointing to the `.docx` file; will be loaded when the `on_parent` event is triggered |

> ⚠️ Note: The Mammoth.js library must be included in advance (e.g., via CDN) for this control to function properly.

## Main Events

| Event Name  | Trigger Timing                    | Callback Parameters | Description |
|-------------|-----------------------------------|---------------------|-------------|
| `on_parent` | Triggered after the control is added to its parent container | - | Automatically calls `set_url(this.url)` to begin loading and rendering the document |

---

# EXCELviewer

**Control Functionality**: Used to view Excel files (`.xlsx` or `.xls`), supporting switching between multiple worksheets to display tabular data.  
**Type**: Container control  
**Parent Control**: `bricks.VBox`

## Initialization Parameters

| Parameter | Type   | Description |
|----------|--------|-------------|
| `url`    | String | URL pointing to the Excel file; loaded during the `on_parent` event |
| `height` | String | Defaults to `"100%"`, ensuring the control fills the height of its parent container |

## Main Events

| Event Name       | Trigger Timing                         | Callback Parameters | Description |
|------------------|----------------------------------------|----------------------|-------------|
| `on_parent`      | After the control is mounted into its parent node | - | Triggers `set_url(url)` to load Excel data |
| `click` (child Text control) | When clicking on a sheet tab | sheetname, widget | Switches and displays the content of the corresponding worksheet |

> ✅ Supported Features:
> - Dynamically generates worksheet tab bar (HBox + Text)
> - Scrollable area for displaying table HTML content (VScrollPanel)
> - Highlights currently selected tab (CSS class `selected`)

---

# PDFviewer

**Control Functionality**: Embeds and displays PDF files within the page, rendering each page as a Canvas image.  
**Type**: Container control  
**Parent Control**: `bricks.VBox`

## Initialization Parameters

| Parameter | Type   | Description |
|----------|--------|-------------|
| `url`    | String | URL of the PDF file, used by `set_url` |
| `width`  | String | Forced to `'100%'` to fit the parent container's width |

## Main Events

| Event Name            | Trigger Timing                     | Callback Parameters | Description |
|-----------------------|------------------------------------|----------------------|-------------|
| `on_parent`           | After the control is mounted       | - | Calls `set_url()` to start loading and rendering the PDF |
| (Internal Promise)    | After PDF is successfully loaded   | pdf object | Iterates through all pages and calls `add_page_content(page)` |
| (Error Handling)      | When loading fails                 | error | Outputs `'error'` to the console |

> ✅ Rendering Details:
> - Uses `pdfjsLib` (Mozilla PDF.js) to parse and render the PDF
> - Each page is rendered using a `<canvas>` element with a fixed zoom scale of `1.5`
> - Pages are separated by `Splitter` dividers (for visual or layout purposes)

> ⚠️ Note: Ensure that `pdfjsLib` is globally defined and properly configured.