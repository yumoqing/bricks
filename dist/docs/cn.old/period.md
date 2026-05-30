# `bricks` 日期工具与组件库技术文档

---

## 概述

`bricks` 是一个轻量级的 JavaScript 工具和 UI 组件库，提供常用的日期处理函数以及可交互的日期周期控件。本文档详细说明其核心功能模块：

- 日期字符串与 `Date` 对象之间的转换
- 日期增减操作（天、月、年）
- `PeriodDays` 可点击切换周期的 UI 控件

该库设计用于前端项目中快速构建时间范围选择器等交互式组件。

---

## 全局命名空间

```js
var bricks = window.bricks || {};
```

> 所有功能均挂载在全局 `bricks` 命名空间下，避免污染全局作用域。

---

## 1. `bricks.str2date(sdate)`

将格式为 `"YYYY-MM-DD"` 的字符串转换为 `Date` 对象。

### 参数

| 参数名   | 类型   | 描述                   |
|----------|--------|------------------------|
| `sdate`  | string | 格式为 `"YYYY-MM-DD"` 的日期字符串 |

### 返回值

- `{Date}`：对应的 `Date` 对象（注意：月份从 0 开始）

### 示例

```js
bricks.str2date("2025-04-05"); // 返回 Date 对象，表示 2025年4月5日
```

### 注意事项

- 输入字符串必须符合 `YYYY-MM-DD` 格式。
- `new Date(year, month - 1, day)` 中月份需减 1，因 JS 的 `Date` 对象月份从 0 起始。

---

## 2. `bricks.date2str(date)`

将 `Date` 对象格式化为 `"YYYY-MM-DD"` 字符串。

### 参数

| 参数名   | 类型   | 描述               |
|----------|--------|--------------------|
| `date`   | Date   | 要格式化的日期对象 |

### 返回值

- `{string}`：格式化后的 `"YYYY-MM-DD"` 字符串，不足两位自动补零。

### 示例

```js
const d = new Date(2025, 3, 5); // 2025-04-05
bricks.date2str(d); // "2025-04-05"
```

---

## 3. `bricks.addMonths(dateObj, months)`

在指定日期上增加若干个月。

### 参数

| 参数名     | 类型   | 描述                     |
|------------|--------|--------------------------|
| `dateObj`  | Date   | 原始日期对象             |
| `months`   | number | 要增加的月数（可为负）   |

### 返回值

- `{Date}`：新的 `Date` 对象，原对象不被修改

### 示例

```js
const d = new Date(2025, 0, 15); // 2025-01-15
bricks.addMonths(d, 3); // 2025-04-15
bricks.addMonths(d, -1); // 2024-12-15
```

---

## 4. `bricks.addYears(dateObj, years)`

在指定日期上增加若干年。

### 参数

| 参数名    | 类型   | 描述                     |
|-----------|--------|--------------------------|
| `dateObj` | Date   | 原始日期对象             |
| `years`   | number | 要增加的年数（可为负）   |

### 返回值

- `{Date}`：新的 `Date` 对象

### ⚠️ 注意

使用了 `setYear()` 方法，但请注意：
- `setYear()` 在现代 JS 中已被弃用，推荐使用 `setFullYear()` 替代。
- 当前实现可能存在问题：`getYear()` 返回的是相对于 1900 的偏移量，因此 `+ years` 实际上是错误逻辑！

### ✅ 修正建议

```js
bricks.addYears = function(dateObj, years){
    const newDate = new Date(dateObj);
    newDate.setFullYear(newDate.getFullYear() + years);
    return newDate;
}
```

> 建议尽快替换以确保跨世纪正确性（如 2099 → 2100 年等问题）。

---

## 5. `bricks.addDays(dateObj, days)`

在指定日期上增加若干天。

### 参数

| 参数名   | 类型   | 描述                     |
|----------|--------|--------------------------|
| `dateObj`| Date   | 原始日期对象             |
| `days`   | number | 要增加的天数（可为负）   |

### 返回值

- `{Date}`：新的 `Date` 对象

### 示例

```js
const d = new Date(2025, 0, 1);
bricks.addDays(d, 10);  // 2025-01-11
bricks.addDays(d, -1);  // 2024-12-31
```

---

## 6. `bricks.PeriodDays` —— 周期日期选择控件

一个继承自 `bricks.HBox` 的 UI 组件，允许用户通过点击前后文本切换时间区间。

### 继承关系

```js
class PeriodDays extends bricks.HBox
```

### 配置选项 (`opts`)

| 属性名       | 类型     | 默认值      | 描述 |
|--------------|----------|-------------|------|
| `start_date` | string   | 必填        | 起始日期 `"YYYY-MM-DD"` |
| `end_date`   | string   | 必填        | 结束日期 `"YYYY-MM-DD"` |
| `step_type`  | string   | `'days'`    | 步进类型：`'days'`, `'months'`, `'years'` |
| `step_cnt`   | number   | `1`         | 每次步进的数量 |
| `title`      | string   | `undefined` | 显示标题（支持国际化） |
| `splitter`   | string   | `' 至 '`    | 分隔符文本，显示在起止日期之间 |

### 支持事件

- **`changed`**：当日期范围发生变化时触发，携带新范围数据。

#### 事件参数结构

```json
{
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD"
}
```

### 成员方法

#### `date_add(strdate, step_cnt, step_type)`

内部方法：对字符串日期执行加法运算并返回新字符串。

##### 参数

| 参数名       | 类型     | 描述 |
|--------------|----------|------|
| `strdate`    | string   | 输入日期字符串 |
| `step_cnt`   | number   | 步进步数 |
| `step_type`  | string   | `'days'`, `'months'`, `'years'` |

##### 返回值

- `{string}`：结果日期字符串（格式 `"YYYY-MM-DD"`）

##### 示例

```js
this.date_add("2025-01-01", 1, "months"); // "2025-02-01"
```

---

#### `step_back()`

点击起始日期时触发，整体周期向前移动（减去步长）。

- 更新 `start_date` 和 `end_date`
- 刷新界面显示
- 触发 `changed` 事件

---

#### `step_forward()`

点击结束日期时触发，整体周期向后移动（加上步长）。

- 同上，方向相反

---

### 用户交互设计

| 元素           | 行为                         |
|----------------|------------------------------|
| 起始日期文本   | 点击 → 周期整体前移          |
| 结束日期文本   | 点击 → 周期整体后移          |

> 文本添加了 `clickable` CSS 类，并绑定点击事件。

---

### 使用示例

```js
const period = new bricks.PeriodDays({
    start_date: "2025-01-01",
    end_date: "2025-01-31",
    step_type: "months",
    step_cnt: 1,
    title: "统计周期",
    splitter: " 至 "
});

// 监听变化
period.bind('changed', function(e){
    console.log("新周期:", e.start_date, "到", e.end_date);
});
```

渲染效果类似：

```
统计周期  2025-01-01 至 2025-01-31
```

点击 “2025-01-01” → 变为 “2024-12-01 至 2024-12-31”  
点击 “2025-01-31” → 变为 “2025-02-01 至 2025-02-28”

---

## 注册组件

```js
bricks.Factory.register('PeriodDays', bricks.PeriodDays);
```

> 使得可通过工厂模式动态创建此组件。

---

## 总结

| 功能                 | 是否推荐使用 | 备注 |
|----------------------|--------------|------|
| `str2date` / `date2str` | ✅ 推荐       | 安全可靠 |
| `addDays` / `addMonths` | ✅ 推荐       | 正确封装 |
| `addYears`            | ⚠️ 需修复     | 应改用 `setFullYear` |
| `PeriodDays`          | ✅ 推荐       | 交互清晰，适合报表周期切换 |

---

## 附录：已知问题与改进建议

1. ❗ `addYears` 使用 `getYear/setYear` 存在兼容性和逻辑错误，应改为：

```js
bricks.addYears = function(dateObj, years) {
    const newDate = new Date(dateObj);
    newDate.setFullYear(newDate.getFullYear() + years);
    return newDate;
};
```

2. ✅ 所有日期操作均创建副本，保护原始对象，良好实践。

3. 🔹 `PeriodDays` 未做边界校验（如非法日期），建议增加输入验证。

4. 🔹 支持更多 `step_type` 如 `'weeks'` 可扩展性更强。

--- 

> 文档版本：v1.0  
> 最后更新：2025年4月5日