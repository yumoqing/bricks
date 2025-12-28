# `bricks.PageDataLoader` 技术文档

`PageDataLoader` 是一个用于分页加载数据的 JavaScript 类，支持缓存控制、参数合并、前后翻页等功能。它适用于需要从后端 API 按页获取大量数据的场景，并通过缓存机制优化性能。

---

## 目录

- [概述](#概述)
- [依赖说明](#依赖说明)
- [构造函数与配置选项](#构造函数与配置选项)
- [实例方法](#实例方法)
  - [`loadData([params])`](#loaddataparams)
  - [`loadNextPage()`](#loadnextpage)
  - [`loadPreviousPage()`](#loadpreviouspage)
  - [`loadPage(page)`](#loadpagepage)
  - [`is_max_page(p)`](#is_max_pagep)
- [返回数据结构](#返回数据结构)
- [使用示例](#使用示例)
- [缓存策略](#缓存策略)
- [注意事项](#注意事项)

---

## 概述

`bricks.PageDataLoader` 提供了一个简洁的接口来管理分页数据的加载和缓存。其主要特性包括：

- 支持自定义请求 URL、分页大小、HTTP 方法等。
- 自动计算总页数。
- 内置页面缓存机制（可配置最大缓存页数）。
- 支持跳转到指定页、下一页、上一页。
- 可扩展的基础参数与动态参数合并。

---

## 依赖说明

该类依赖以下全局对象或模块：

| 依赖 | 说明 |
|------|------|
| `window.bricks` | 全局命名空间对象，提供工具函数 |
| `bricks.extend(obj1, obj2)` | 对象浅拷贝并合并属性（类似 jQuery 的 `$.extend`） |
| `bricks.HttpJson()` | 发起 HTTP 请求的封装类，支持 `.httpcall(url, options)` 方法 |
| `bricks.debug(...)` | 调试日志输出函数 |

> ⚠️ 确保这些依赖在运行环境中已正确加载。

---

## 构造函数与配置选项

```js
var loader = new bricks.PageDataLoader(options);
```

### 参数：`options` (Object)

| 属性名        | 类型     | 必填 | 默认值 | 说明 |
|---------------|----------|------|--------|------|
| `url`         | String   | ✅   | -      | 数据接口地址 |
| `pagerows`    | Number   | ❌   | 80     | 每页显示的数据条数 |
| `cache_pages` | Number   | ❌   | 5      | 最多缓存多少个页面（超出则移除最远页） |
| `method`      | String   | ❌   | `'GET'` | HTTP 请求方法（如 `'POST'`） |
| `params`      | Object   | ❌   | `{}`   | 基础请求参数（每次请求都会携带） |

### 示例

```js
var p = new bricks.PageDataLoader({
  url: '/api/data',
  pagerows: 50,
  cache_pages: 3,
  method: 'GET',
  params: {
    category: 'news'
  }
});
```

---

## 实例方法

### `loadData([params])`

初始化并加载第一页数据。

#### 参数

- `params` (Object, 可选)：本次请求附加的参数，会与 `base_params` 合并。

#### 返回值

- Promise：解析为第一页的响应数据（包含分页信息）。

#### 行为说明

- 清空当前所有缓存页。
- 合并基础参数与传入参数。
- 调用 `loadPage(1)` 加载第一页。

#### 示例

```js
p.loadData({ search: 'keyword' }).then(data => {
  console.log(data);
});
```

---

### `loadNextPage()`

加载下一页数据（即当前已加载页码的最大值 + 1）。

#### 返回值

- Promise：若存在下一页，则返回下一页数据；否则返回 `undefined`。

#### 条件判断

- 仅当目标页未加载且小于等于 `lastPage` 时才发起请求。

#### 示例

```js
p.loadNextPage().then(data => {
  if (data) {
    render(data.rows); // 渲染新页数据
  }
});
```

---

### `loadPreviousPage()`

加载上一页数据（即当前已加载页码的最小值 - 1）。

#### 返回值

- Promise：若存在上一页（页码 > 0），则返回对应数据；否则返回 `undefined`。

#### 示例

```js
p.loadPreviousPage().then(data => {
  if (data) {
    prependToView(data.rows); // 将数据插入视图开头
  }
});
```

---

### `loadPage(page)`

加载指定页码的数据（核心方法）。

#### 参数

- `page` (Number)：要加载的页码（从 1 开始）。

#### 返回值

- Promise：返回该页的完整响应数据。

#### 行为说明

1. 若该页已加载（存在于 `this.pages` 中），不重复请求。
2. 使用 `bricks.HttpJson().httpcall()` 发起请求：
   ```js
   {
     page: page,
     rows: this.rows
   }
   ```
3. 自动更新 `lastPage`（根据 `total / rows` 计算）。
4. 将当前页加入 `pages` 缓存数组。
5. 若缓存超过 `cache_pages` 数量，则删除“最远”的一页（相对于当前页是首或尾）。
6. 在返回数据中添加元字段（如 `add_page`, `delete_page`, `pos_rate`）。

#### 扩展字段说明

| 字段名       | 类型   | 说明 |
|--------------|--------|------|
| `add_page`   | Number | 当前新增的页码 |
| `delete_page`| Number | 因缓存溢出被删除的页码（如有） |
| `pos_rate`   | Number | 当前位置占比（用于 UI 定位提示） |
| `last_page`  | Number | 总页数（由后端 `total` 推导） |

---

### `is_max_page(p)`

判断某页是否为当前已知的最大页码。

#### 参数

- `p` (Number)：待检测的页码。

#### 返回值

- Boolean：如果是当前缓存中的最大页码，返回 `true`。

#### 示例

```js
if (p.is_max_page(5)) {
  console.log("这是当前最大的页码");
}
```

---

## 返回数据结构

假设后端返回格式如下：

```json
{
  "total": 230,
  "rows": [...]
}
```

`PageDataLoader` 会在基础上增加以下字段：

```json
{
  "total": 230,
  "rows": [...],
  "last_page": 3,
  "add_page": 1,
  "delete_page": 3,
  "pos_rate": 0.5
}
```

| 字段         | 说明 |
|--------------|------|
| `last_page`  | 根据 `Math.ceil(total / rows)` 得出的总页数 |
| `add_page`   | 本次成功加载的页码 |
| `delete_page`| 如果触发了缓存清理，表示被清除的页码 |
| `pos_rate`   | 当前页在已有页中的相对位置（0 ~ 1），便于 UI 定位 |

---

## 使用示例

```js
// 初始化加载器
var loader = new bricks.PageDataLoader({
  url: '/api/list',
  params: { type: 'article' },
  pagerows: 20,
  cache_pages: 4,
  method: 'GET'
});

// 加载第一页
loader.loadData().then(data => {
  displayData(data.rows);
  console.log(`共 ${data.last_page} 页`);
});

// 下一页
document.getElementById('next').onclick = () => {
  loader.loadNextPage().then(data => {
    if (data) appendData(data.rows);
  });
};

// 上一页
document.getElementById('prev').onclick = () => {
  loader.loadPreviousPage().then(data => {
    if (data) prependData(data.rows);
  });
};
```

---

## 缓存策略

- 所有已成功加载的页码记录在 `this.pages` 数组中。
- 当 `pages.length > cache_pages` 时，自动删除“最远”的一页：
  - 若当前加载的是最后一页 → 删除最早页（最小页码）
  - 若当前加载的是较早页 → 删除最后页（最大页码）

> 此策略有助于保持用户浏览路径附近的页数据在内存中。

---

## 注意事项

1. **异步调用**：所有 `loadXxx` 方法均为 `async`，需使用 `await` 或 `.then()` 处理结果。
2. **页码从 1 开始**：符合常规分页习惯。
3. **无重复加载**：已加载的页不会再次请求，需手动调用 `loadData()` 重置。
4. **错误处理**：请求失败时会通过 `bricks.debug()` 输出调试信息，但不会抛出异常。
5. **total 必须存在**：后端响应必须包含 `total` 字段，否则无法计算 `lastPage`。

---

## 版本信息

- 模块名称：`bricks.PageDataLoader`
- 创建时间：未知
- 维护者：`window.bricks` 团队

> 如需定制行为，建议继承此类或扩展原型方法。

--- 

✅ **推荐用途**：表格分页、无限滚动、左右滑动浏览历史记录等场景。