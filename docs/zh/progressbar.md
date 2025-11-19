# ProgressBar

控件功能：显示进度条，用于可视化任务完成的百分比进度。  
类型：普通控件（基于容器控件 HBox 的扩展）  
父类控件：`bricks.HBox`

## 初始化参数

| 参数名        | 类型   | 说明 |
|-------------|--------|------|
| `total_value` | Number | （可选）总任务值，用于计算进度百分比，默认为 100 |
| `bar_cwidth`  | Number | （可选）进度条高度（以行高为单位），默认为 2 |

> 注意：实际代码中使用了 `this.bar_cwidth||2`，但 `total_value` 在构造函数中未被使用，可能需在 `set_value` 方法中配合 `current` 和 `total` 使用，当前代码存在变量名错误（`current` 和 `total` 未定义）。

## 主要事件

* **无显式定义事件**：当前源码中未绑定或触发任何自定义事件。  
* 可能通过继承 `HBox` 拥有基础布局事件，但无额外事件注册。

> ⚠️ 代码问题提示：
> - `set_value` 方法中使用了未定义的变量 `current` 和 `total`，应为 `v` 和 `this.total_value`。
> - 百分比计算逻辑中的变量名不一致：先计算 `pzt = (current / total) * 100`，后又使用 `percentage`，应统一为 `v / this.total_value`。  
> 建议修正为：
> ```js
> set_value(v) {
>     var percentage = this.total_value ? (v / this.total_value) * 100 : 0;
>     percentage = Math.max(0, Math.min(100, percentage));
>     this.text_w.set_style('width', percentage + '%');
> }
> ```