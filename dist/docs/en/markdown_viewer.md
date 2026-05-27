# MdWidget

**Functionality**: A widget for rendering Markdown content. It supports loading Markdown text either from a string or a remote URL, and uses `marked.js` to parse it into HTML. Supports clicking links to load new Markdown content.

**Type**: Ordinary Widget  
**Parent Widget**: `bricks.JsWidget`

## Initialization Parameters

| Parameter | Type   | Description |
|---------|--------|-------------|
| `mdtext`  | string | (Optional) Directly provided Markdown text content. Takes precedence over `md_url`. |
| `md_url`  | string | (Optional) URL of a remote Markdown file, used for asynchronous content loading. |
| `method`  | string | Request method, default is `"GET"`, suitable for fetching content via HTTP. |
| `params`  | object | Request parameters object; appended to the URL in GET requests. Currently only used in `tget`. |

> ⚠️ Note: If both `mdtext` and `md_url` are provided, `md_url` will be ignored and the local content will be rendered directly.

## Main Events

- `loaded`  
  Triggered when: After successfully loading and parsing the Markdown content.  
  Payload: `{ url: string }` — The current loaded URL (only valid when loaded via `_build(url)`).  
  Example usage:
  ```js
  mdwidget.bind('loaded', function(event) {
      console.log('Loaded markdown from:', event.params.url);
  });
  ```

---

# MarkdownViewer

**Functionality**: An enhanced Markdown viewer container with built-in navigation and back functionality. It maintains a browsing history stack, supporting link-based navigation and returning to the previous page. Typically used for displaying document-like content.

**Type**: Container Widget  
**Parent Widget**: `bricks.VBox`

## Initialization Parameters

| Parameter     | Type    | Description |
|---------------|---------|-------------|
| `md_url`       | string  | (Optional) Initial URL of the Markdown file to load. |
| `mdtext`       | string  | (Optional) Directly provided Markdown string content. |
| `method`       | string  | HTTP request method, default is `"GET"`. |
| `params`       | object  | Request parameters object, passed to the `tget` method. |
| `navigator`    | boolean | Whether to show the "Back" button, default is `true`. When enabled, allows navigation back through browsing history. |
| `recommentable`| boolean | (Not implemented) Reserved field, potentially for future comment/recommendation features. |

> 📌 Tip: Internally uses `MdWidget` to render content and adds it as a child widget.

## Main Events

- `loaded`  
  Forwarded from the internal `MdWidget`'s `loaded` event, indicating that a new page has finished loading.  
  Payload: `{ url: string }` — The URL of the currently loaded Markdown page.

- `scroll`  
  Bound to the container's scroll event, can be used to monitor scrolling behavior (currently outputs debug logs only).  
  Trigger condition: Fired when the user scrolls the viewport.  
  Example log output:
  ```
  scrollY= 200
  ```

> 💡 Note: You can listen to this event using `bind('scroll', ...)` for custom handling.