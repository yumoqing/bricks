# Button

**Control Functionality:** A clickable button control that supports icons, text labels, and custom action responses. Commonly used to trigger events or perform operations.  
**Type:** Basic Control  
**Parent Control:** `bricks.Layout`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `orientation` | string | Layout direction; possible values are `'horizontal'` or vertical (default is vertical), affecting the arrangement of internal elements. |
| `height` | string | Height of the control; default is `100%`. |
| `width` | string | Width of the control; default is `100%`. |
| `item_rate` | number | Scaling ratio for icon and text size; default is `1`. |
| `tooltip` | string | Tooltip text displayed when the mouse hovers over the button. |
| `color` | string | Text color, using CSS color values. |
| `bgcolor` | string | Background color, using CSS color values. |
| `nonepack` | boolean | Whether to remove padding and border; if `true`, sets `padding: 0` and `border: 0`. |
| `name` | string | Unique identifier name for the control, used as the DOM element ID. |
| `icon` | string | Icon resource URL; if specified, creates and displays an `Icon` control within the button. |
| `label` | string | Text label content displayed on the button. |
| `css` | object | Custom CSS style object, which will be merged into the button's styles. |
| `action` | object | Configuration for actions triggered when the button is clicked, containing the following sub-properties:<br> - `target`: Target component/path<br> - `datawidget`: Data source control<br> - `datamethod`: Method name for retrieving data<br> - `datascript`: Custom script logic<br> - `dataparams`: Parameters passed to the action<br> - `rtdata`: Whether to fetch data in real-time<br> - `actiontype`: Type of action (e.g., navigation, submission, etc.) |

## Main Events

- **`click`**  
  Triggered when the button is clicked. The event callback receives the `opts` configuration object as a parameter.  
  **Trigger Timing:** Dispatched when the user clicks the button (including the icon or text portion), during the call to the `target_clicked` method.  
  **Example Listener:**
  ```js
  button.bind('click', function(opts) {
      console.log('Button clicked with options:', opts);
  });
  ```