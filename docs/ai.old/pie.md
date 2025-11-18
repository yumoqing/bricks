# ChartPie

ChartPie 是一个基于 ECharts 的饼图控件，用于可视化展示分类数据的占比情况。属于**普通控件**，继承自 `EchartsExt` 控件。

---

## 主要方法

- **`setup_options(data)`**  
  根据传入的数据 `data` 和控件配置项（如 `nameField`, `valueFields` 等）生成符合 ECharts 饼图格式的图表选项对象（options），供底层 ECharts 渲染使用。

- **`render()`**  
  （继承自 `EchartsExt`）调用 `setup_options` 生成配置，并初始化或更新 ECharts 实例进行图表渲染。

- **`loadData()`**  
  （继承自 `JsWidget` 基类）从 `data_url` 指定的接口加载数据，成功后触发 `render` 方法重新绘制图表。

---

## 主要事件

- **`element_click`**  
  当用户点击饼图中的某个扇形区域时触发，携带被点击项的数据信息（如 `name`, `value`）作为事件参数，可用于联动其他组件或弹窗提示。

> 示例：点击某分类扇形后，通过事件绑定刷新表格内容，显示该分类的详细数据。

---

## 源码例子

```json
{
  "id": "chart_pie_sales",
  "widgettype": "ChartPie",
  "options": {
    "title": "销售类别占比",                   // 图表标题
    "description": "各产品类别的销售额分布",     // 描述信息（可选）
    "legend": {                               // 图例配置
      "orient": "vertical",
      "left": "right"
    },
    "nameField": "category",                  // 数据中表示名称的字段
    "valueFields": ["sales"],                 // 数据中表示值的字段数组（饼图只支持一个）
    "pie_options": {                          // 自定义饼图系列配置
      "radius": "70%",
      "center": ["50%", "50%"],
      "label": {
        "show": true,
        "formatter": "{b}: {d}%"
      }
    },
    "data_url": "/api/report/sales-by-category",  // 获取数据的API地址
    "data_params": {                            // 请求参数
      "period": "Q3"
    },
    "width": "600px",
    "height": "400px"
  },
  "binds": [
    {
      "actiontype": "event",
      "wid": "chart_pie_sales",
      "event": "element_click",
      "target": "table_detail_panel",
      "dispatch_event": "refresh_data",
      "params": {
        "source": "chart_pie_sales"
      },
      "datawidget": "chart_pie_sales",
      "datamethod": "getValue",
      "dataparams": {},
      "rtdata": {
        "action": "filter_by_category"
      }
    },
    {
      "actiontype": "urlwidget",
      "wid": "chart_pie_sales",
      "event": "init",
      "target": "Popup",
      "options": {
        "url": "/views/popup/loading.ui",
        "method": "GET"
      },
      "mode": "replace",
      "rtdata": {
        "message": "正在加载饼图数据..."
      }
    }
  ]
}
```

> ✅ **注释说明：**
>
> - 此控件在初始化时会从 `/api/report/sales-by-category?period=Q3` 加载数据；
> - 使用 `nameField` 和 `valueFields` 映射数据字段，构建饼图数据结构；
> - 用户点击某个扇区时，派发 `refresh_data` 事件给 ID 为 `table_detail_panel` 的控件，实现联动；
> - 同时绑定了 `init` 事件，在初始化阶段弹出一个加载提示窗口（通过 `Popup` 目标）；
> - 支持国际化、动态参数和远程模板加载，体现 bricks 框架的模块化能力。