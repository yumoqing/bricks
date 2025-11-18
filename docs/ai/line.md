# ChartLine

控件功能：用于展示折线图，基于 ECharts 扩展实现，支持通过配置数据源、字段映射和图表选项动态生成多条折线的数据可视化。  
类型：普通控件  
父类控件：`bricks.EchartsExt`

## 初始化参数

| 参数名        | 类型     | 说明 |
|-------------|--------|----|
| `data_url`   | string |（可选）获取图表数据的接口 URL，若提供则自动请求数据 |
| `data_params`| object |（可选）发送请求时携带的参数，配合 `data_url` 使用 |
| `method`     | string |（可选）请求数据时使用的 HTTP 方法，默认为 'GET' |
| `data`       | array  |（可选）直接传入的静态数据数组，格式为对象数组，如 `[{ name: 'A', value1: 10, value2: 20 }]` |
| `line_options`| object|（可选）额外的 ECharts 系列配置项，用于自定义线条样式、动画等 |
| `nameField`  | string | 指定数据中作为 X 轴显示的字段名称，例如时间或类别字段 |
| `valueFields`| array  | 指定一个或多个数值字段，每个字段将生成一条折线，如 `['sales', 'profit']` |

> 注：`data` 和 `data_url` 可二选一；若两者都存在，优先使用 `data_url` 获取数据。

## 主要事件

- **`load`**  
  触发时机：控件初始化并成功加载/渲染数据后触发。  
  回调参数：`{ chart: ECharts 实例, data: 当前渲染的数据 }`  
  用途：可用于在图表渲染完成后执行自定义逻辑，如添加标记点、绑定外部交互。

- **`click`**  
  触发时机：用户点击图表中的某一点时触发。  
  回调参数：ECharts 原生 click 事件对象，包含 `seriesName`, `name`, `value`, `data` 等信息。  
  用途：实现数据点详情查看、联动其他组件等功能。

- **`datafetch`**  
  触发时机：从 `data_url` 成功获取数据后，但在渲染之前触发。  
  回调参数：`{ data: 服务器返回的原始数据 }`  
  用途：可在数据处理前进行拦截和修改。