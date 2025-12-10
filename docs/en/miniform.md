# MiniForm

**Control Functionality**: MiniForm is a lightweight form control designed to dynamically display and switch among multiple field input items. Users can select different fields via a dropdown selector, and the control will dynamically render the corresponding input components based on the selection. It also supports listening for real-time input events and merging data.

**Type**: Ordinary Control  
**Parent Control**: `bricks.HBox`

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `defaultname` | String | The name of the field selected by default. If not set, the `name` of the first field in the `fields` array will be used as default. |
| `label_width` | String | (Optional) Width of the label column, e.g., `'80px'`. Actual behavior depends on whether the internal implementation uses this parameter. |
| `input_width` | String | (Optional) Width of the input area, e.g., `'150px'`. Usage is determined by the actual implementation of child controls. |
| `params` | Object | (Optional) Additional default parameters that will be merged into the output value when `getValue()` is called. |
| `fields` | Array\<Object\> | An array of field definitions. Each object describes an optional field with the following properties:<br>- `name`: Unique identifier of the field (String)<br>- `label`: Display name (String)<br>- `icon`: (Optional) Icon class name or path<br>- `uitype`: Type of input control (e.g., `"text"`, `"code"`, `"select"`, etc.)<br>- `uiparams`: Additional configuration parameters passed to the corresponding input control |

> Example:
> ```js
> {
>   defaultname: "username",
>   label_width: "100px",
>   input_width: "200px",
>   params: { appId: "123" },
>   fields: [
>     {
>       name: "username",
>       label: "Username",
>       uitype: "text",
>       uiparams: { placeholder: "Please enter username" }
>     },
>     {
>       name: "password",
>       label: "Password",
>       uitype: "password",
>       uiparams: { placeholder: "Please enter password" }
>     }
>   ]
> }
> ```

## Main Events

| Event Name | Trigger Condition | Payload Data |
|-----------|-------------------|--------------|
| `input` | Triggered when the currently active input control has a change in input | Returns an object containing data from `params` and the current value of the input control (obtained via `getValue()`) |

> Usage Example:
> ```js
> miniFormInstance.bind('input', function(data) {
>   console.log('Current form value:', data);
> });
> ```