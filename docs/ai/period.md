# PeriodDays

该控件用于展示一个可点击的日期区间（起始日期至结束日期），用户可以通过点击日期实现向前或向后翻动时间段。适用于报表周期选择、日志查看等需要动态切换时间范围的场景。  
**类型**：普通控件（但内部组合多个子控件）；继承自 `bricks.HBox`，属于布局容器的一种使用形式，但从功能上归类为**普通复合控件**

---

## 主要方法

- `date_add(strdate, step_cnt, step_type)`  
  根据指定的步长和单位（天/月/年）对输入的日期字符串进行增减，并返回格式化后的日期字符串。

- `step_back()`  
  将当前起始和结束日期同时向前移动一个步长时间段，并触发 `changed` 事件。

- `step_forward()`  
  将当前起始和结束日期同时向后移动一个步长时间段，并触发 `changed` 事件。

---

## 主要事件

- `changed`  
  当用户点击起始或结束日期导致时间区间变化时触发，携带新的 `{ start_date, end_date }` 数据对象。

---

## 源码例子

```json
{
  "id": "period_selector",
  "widgettype": "PeriodDays",
  "options": {
    "start_date": "2024-01-01",       // 初始开始日期
    "end_date": "2024-01-31",         // 初始结束日期
    "step_type": "months",            // 步进类型：支持 'days', 'months', 'years'
    "step_cnt": 1,                    // 每次翻动的步数（如每月前进/后退）
    "title": "统计周期",               // 可选标题，显示在日期前
    "splitter": " 至 ",                // 分隔符，默认是中文“至”，支持国际化
    "i18n": true                      // 启用国际化支持
  },
  "binds": [
    {
      "actiontype": "event",
      "wid": "period_selector",
      "event": "changed",
      "target": "data_report_panel",
      "dispatch_event": "refresh",
      "params": {
        "source": "period_selector"
      },
      "rtdata": {
        "msg": "日期已更新"
      }
    },
    {
      "actiontype": "script",
      "wid": "period_selector",
      "event": "changed",
      "target": "ConsoleLogger",
      "script": "console.log('Period changed:', params.start_date, 'to', params.end_date);",
      "params": {
        "start_date": "{%event_data.start_date%}",
        "end_date": "{%event_data.end_date%}"
      }
    }
  ]
}
```

> **注释说明：**
> - 此控件通过两个可点击的文本标签（`Text`）来显示起止日期。
> - 点击任意一个日期会触发前移或后移操作，自动计算新时间段并更新界面。
> - 使用了 `bricks.str2date` 和 `bricks.date2str` 工具函数处理日期格式转换。
> - 支持与其它控件通信，例如通过 `binds` 中的 `event` 动作通知数据面板刷新内容。
> - `script` 类型绑定可用于调试或执行自定义逻辑。
> - 所有文本均支持 i18n 国际化替换，适合多语言环境。