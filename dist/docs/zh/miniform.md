# MiniForm

**控件功能**：MiniForm 是一个轻量级表单控件，用于动态展示和切换多个字段输入项。用户可以通过下拉选择器选择不同的字段，控件会根据选择动态渲染对应的输入组件，并支持实时输入事件的监听与数据合并。

**类型**：普通控件  
**父类控件**：`bricks.HBox`

## 初始化参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `defaultname` | String | 默认选中的字段名称。若未设置，则默认使用 `fields` 数组中第一个字段的 `name`。 |
| `label_width` | String | （可选）标签列的宽度，如 `'80px'`。具体行为取决于内部实现是否使用该参数。 |
| `input_width` | String | （可选）输入框区域的宽度，如 `'150px'`。同样由子控件实际使用决定。 |
| `params` | Object | （可选）附加的默认参数，在调用 `getValue()` 时会被合并到输出值中。 |
| `fields` | Array\<Object\> | 字段定义数组，每个对象描述一个可选字段，包含以下子属性：<br>- `name`: 字段唯一标识符（String）<br>- `label`: 显示名称（String）<br>- `icon`: （可选）图标类名或路径<br>- `uitype`: 输入控件类型（如 `"text"`, `"code"`, `"select"` 等）<br>- `uiparams`: 传递给该字段对应输入控件的额外配置参数 |

> 示例：
> ```js
> {
>   defaultname: "username",
>   label_width: "100px",
>   input_width: "200px",
>   params: { appId: "123" },
>   fields: [
>     {
>       name: "username",
>       label: "用户名",
>       uitype: "text",
>       uiparams: { placeholder: "请输入用户名" }
>     },
>     {
>       name: "password",
>       label: "密码",
>       uitype: "password",
>       uiparams: { placeholder: "请输入密码" }
>     }
>   ]
> }
> ```

## 主要事件

| 事件名 | 触发条件 | 携带数据 |
|--------|---------|--------|
| `input` | 当当前激活的输入控件发生输入变化时触发 | 返回一个对象，包含 `params` 中的数据以及当前输入控件的值（通过 `getValue()` 获取） |
> 使用示例：
> ```js
> miniFormInstance.bind('input', function(data) {
>   console.log('当前表单值:', data);
> });
> ```