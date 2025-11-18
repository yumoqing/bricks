# ChartBar

ChartBar 是一个基于 ECharts 的柱状图控件，用于可视化展示分类数据的数值对比。该控件继承自 `bricks.EchartsExt`，属于**普通控件**（非容器控件），不支持包含子控件。

---

## 主要方法

- **`values_from_data(data, name)`**  
  从传入的数据数组中提取指定字段的值，返回值数组。常用于构建 ECharts 的 series 数据。

- **`lineinfo_from_data(data, name)`**  
  根据字段名生成单个柱状序列（series）的配置对象，类型为 `'bar'`。

- **`setup_options(data)`**  
  核心方法，接收原始数据并生成完整的 ECharts 配置项（options），包括：
  - tooltip：轴触发提示
  - legend：图例（基于 nameField 字段）
  - xAxis：类别轴（横轴）
  - yAxis：数值轴（纵轴）
  - series：多个柱状图序列

---

## 主要事件

该控件未定义自定义事件，但继承了 `EchartsExt` 基类所支持的标准事件，例如：

- `'click'`：用户点击图表时触发，可通过 binds 监听。
- `'legendselectchanged'`：图例选择变化时触发。

这些事件可用于与其他控件联动或执行脚本逻辑。

---

## 源码例子

```json
{
  "id": "chart_sales_bar",
  "widgettype": "ChartBar",
  "options": {
    "data_url": "/api/sales/data",        // 从后端接口获取数据
    "method": "GET",                      // 请求方式，默认可省略
    "params": {                           // 请求参数
      "year": 2024,
      "region": "north"
    },
    "nameField": "month",                 // 用作 X 轴显示的字段（如月份）
    "valueFields": ["sales", "target"]    // 多个指标字段，分别绘制为不同柱子
  },
  "binds": [
    {
      "actiontype": "bricks",
      "wid": "btn_refresh_chart",
      "event": "click",
      "target": "chart_sales_bar",
      "options": {
        "widgettype": "ChartBar",
        "options": {
          "data_url": "/api/sales/data",
          "params": {
            "year": "{{widget('input_year').getValue()}}",  // 动态取输入框年份
            "region": "north"
          },
          "nameField": "month",
          "valueFields": ["sales", "target"]
        }
      },
      "mode": "replace"
    },
    {
      "actiontype": "script",
      "wid": "chart_sales_bar",
      "event": "click",
      "script": "async function({ params }) { console.log('柱状图点击:', params); }",
      "params": {}
    }
  ]
}
```

> ✅ **注释说明：**
> - 此控件通过 `data_url` 和 `params` 自动加载远程数据并渲染柱状图。
> - `nameField` 定义 X 轴标签（如 “1月”, “2月”）。
> - `valueFields` 支持多个字段，每个字段对应一个柱状系列（如销售额、目标额）。
> - 使用 `binds` 实现按钮刷新图表和点击日志输出。
> - `{{widget(...)}}` 表达式可在运行时动态获取其他控件的值，实现交互过滤。