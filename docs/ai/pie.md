# ChartPie

控件功能：用于展示饼图数据可视化，支持通过配置数据源、字段映射和图表选项生成可交互的ECharts饼图。  
类型：普通控件  
父类控件：bricks.EchartsExt

## 初始化参数

| 参数名       | 类型     | 说明 |
|--------------|----------|------|
| title        | string   | 图表标题，显示在图表顶部 |
| description  | string   | 图表描述信息，可用于提示或辅助说明 |
| legend       | object   | 图例配置项，控制图例的显示方式（如位置、样式等） |
| pie_options  | object   | 饼图系列的自定义配置项，例如半径、标签格式等 |
| data_url     | string   | 数据请求地址，用于获取图表所需的数据 |
| nameField    | string   | 数据中作为饼图项目名称的字段名 |
| valueFields  | array    | 数据中作为饼图数值的字段名数组（通常使用第一个字段） |
| data_params  | object   | 请求数据时附加的参数，将与`data_url`一起发送请求 |
| data         | array    | 静态数据数组，若提供则优先使用此数据而非从`data_url`加载 |

## 主要事件

- **element_click**  
  当用户点击饼图中的某个数据项时触发。  
  回调参数包含被点击项的信息，如 `name` 和 `value`，可用于实现下钻或详情展示功能。
