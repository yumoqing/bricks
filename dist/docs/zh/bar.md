# ChartBar

**控件功能**：用于展示柱状图（Bar Chart），基于 ECharts 扩展实现，支持从指定数据源获取数据并动态渲染多系列柱状图。  
**类型**：普通控件  
**父类控件**：`bricks.EchartsExt`

## 初始化参数

| 参数名       | 类型     | 说明 |
|------------|--------|----|
| `data_url`   | string | 可选，数据请求的 URL 地址，用于异步加载图表数据。 |
| `data_params`| object | 请求数据时携带的额外参数，配合 `data_url` 使用。 |
| `method`     | string | 数据请求方式，如 `'GET'` 或 `'POST'`，默认为 `'GET'`。 |
| `data`       | array  | 可选，直接传入本地数据数组，格式为对象数组，每个对象表示一条记录。 |
| `nameField`  | string | 指定哪一字段作为 X 轴分类名称（如类别、时间等）。 |
| `valueFields`| array  | 字符串数组，指定一个或多个字段作为 Y 轴数值，用于生成多个数据系列（series）。 |

> 示例数据结构：
> ```json
> [
>   { "category": "A", "value1": 10, "value2": 20 },
>   { "category": "B", "value1": 15, "value2": 25 }
> ]
> ```
> 若 `nameField = "category"`，`valueFields = ["value1", "value2"]`，则会生成两个柱状系列。

## 主要事件

| 事件名       | 触发时机 | 回调参数说明 |
|------------|--------|------------|
| `chart:loaded` | 图表数据加载完成并成功渲染后触发 | `event.detail` 包含原始数据和最终生成的 ECharts 配置项（options） |
| `chart:error`  | 数据加载失败或解析异常时触发 | `event.detail` 包含错误信息，如 `message`, `url`, `status` 等 |

> 注：事件通过自定义事件机制派发，可通过 `addEventListener('chart:loaded', handler)` 监听。