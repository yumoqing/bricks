# PeriodDays

控件功能：用于显示一个可点击的日期区间（开始日期和结束日期），用户可以通过点击日期来前后调整时间段，支持按天、月、年为单位进行步进或回退。常用于时间范围选择场景。  
类型：容器控件  
父类控件：bricks.HBox

## 初始化参数

| 参数名      | 类型   | 说明 |
|-----------|--------|------|
| start_date | string | 初始开始日期，格式为 "YYYY-MM-DD" |
| end_date   | string | 初始结束日期，格式为 "YYYY-MM-DD" |
| step_type  | string | 步长类型，可选值为 `'days'`、`'months'`、`'years'`，默认为 `'days'` |
| step_cnt   | number | 每次变化的步长数量，默认为 `1` |
| title      | string | 可选标题文本，会显示在控件前 |
| splitter   | string | 分隔符，用于分隔开始日期和结束日期，默认为 `' 至 '` |

> 注：`splitter` 和 `step_cnt` 若未传入则使用默认值。

## 主要事件

### changed
- **触发时机**：当用户点击开始日期或结束日期，导致时间区间发生变化时触发。
- **事件数据**：
  ```js
  {
    start_date: "YYYY-MM-DD", // 变化后的开始日期
    end_date: "YYYY-MM-DD"   // 变化后的结束日期
  }
  ```
- **说明**：可通过 `bind('changed', callback)` 监听该事件，获取更新后的日期范围。
