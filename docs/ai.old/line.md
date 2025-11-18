# ChartLine

ChartLine 是一个基于 ECharts 的折线图控件，用于可视化展示一组或多组数值型数据随某一维度（如时间、类别）的变化趋势。它是 **普通控件**，继承自 `bricks.EchartsExt`，属于 bricks 框架中用于数据可视化的扩展组件。

---

## 主要方法

- **`values_from_data(data, name)`**  
  从数据数组中提取指定字段的值，返回值数组，用于生成折线的数据点。

- **`lineinfo_from_data(data, name)`**  
  根据字段名生成单条折线的配置对象（包含名称和数据），供 ECharts 使用。

- **`setup_options(data)`**  
  核心方法，根据传入的数据和控件配置项（如 `nameField`, `valueFields`）动态构建完整的 ECharts 配置项（`option`），并返回。

---

## 主要事件

该控件本身不派发自定义业务事件，但作为 ECharts 实例，支持以下原生事件绑定：

- `'click'`：当用户点击图表中的某个数据点时触发。
- `'mouseover'`：鼠标悬停在图表元素上时触发。
- 可通过 `binds` 绑定这些事件，并结合 `dispatch_event` 或 `script` 做进一步处理。

---

## 源码例子

```json
{
  "id": "chart_sales_trend",
  "widgettype": "ChartLine",
  "options": {
    // 数据来源 URL，将从服务器获取原始数据
    "data_url": "/api/sales/data",
    "data_params": {
      "period": "monthly",
      "category": "electronics"
    },
    "method": "GET",

    // 图表显示所需的关键字段配置
    "nameField": "month",           // X轴显示的维度字段（如月份）
    "valueFields": [                // 多个要绘制的指标字段
      "sales_amount",
      "profit"
    ],

    // 自定义 ECharts 选项扩展（可选）
    "line_options": {
      "tooltip": {
        "formatter": "{b}: {c}"
      },
      "series": {
        "smooth": true
      }
    },

    // 初始静态数据（可选，若无 data_url 可直接使用）
    "data": [
      { "month": "Jan", "sales_amount": 120, "profit": 30 },
      { "month": "Feb", "sales_amount": 140, "profit": 35 },
      { "month": "Mar", "sales_amount": 160, "profit": 40 },
      { "month": "Apr", "sales_amount": 150, "profit": 38 }
    ]
  },

  // 事件绑定：点击图表时弹出当前点击的数据信息
  "binds": [
    {
      "actiontype": "script",
      "wid": "chart_sales_trend",
      "event": "click",
      "target": "chart_sales_trend",
      "script": "async function({ params }) { console.log('点击了图表:', params); alert('你点击了: ' + params.name + '，数值: ' + params.value); }",
      "params": {
        "params": "=event.params"  // 获取 ECharts 事件参数
      }
    },
    {
      "actiontype": "method",
      "wid": "chart_sales_trend",
      "event": "refresh",
      "target": "chart_sales_trend",
      "method": "refreshData",
      "params": {
        "params": {
          "period": "quarterly"
        }
      }
    }
  ]
}
```

> ✅ **注释说明：**
>
> - `id`: 控件唯一标识符，在页面中必须唯一。
> - `widgettype`: 必须为已注册的控件类型，此处为 `"ChartLine"`。
> - `options.data_url`: 若提供，则控件会在初始化时自动发起请求获取数据。
> - `options.data_params`: 请求参数，与 `data_url` 配合使用。
> - `options.method`: HTTP 方法，默认为 GET。
> - `options.nameField`: 定义 X 轴使用的字段名（例如 “month”、“date”）。
> - `options.valueFields`: 定义需要绘制为折线的多个数值字段。
> - `options.data`: 可选的本地静态数据，优先级低于远程数据。
> - `binds[0]`: 监听图表的 click 事件，执行脚本打印或提示用户点击内容。
> - `binds[1]`: 支持调用控件自身的 `refreshData` 方法来刷新数据（例如切换时间段后重新加载）。

--- 

📌 **提示：**  
此控件适合用于仪表盘、报表系统等需要动态展示趋势图的场景。配合 `urlwidget` 可实现按需加载不同图表模块，提升应用性能。