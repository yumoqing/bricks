# `bricks.BufferedDataLoader` 技术文档

> 一个用于分页加载数据并支持缓冲机制的前端数据加载器。

---

## 概述

`bricks.BufferedDataLoader` 是一个 JavaScript 类，旨在为需要高效处理大量分页数据的 UI 组件（如表格、列表等）提供**带缓冲的数据加载能力**。它通过限制内存中缓存的页面数量来优化性能，并支持向前/向后翻页操作。

该类适用于与支持分页接口的后端服务配合使用，典型场景包括大数据量表格滚动加载、虚拟滚动列表等。

---

## 命名空间

```js
bricks.BufferedDataLoader
```

依赖于全局对象 `window.bricks`，若不存在则自动创建。

---

## 构造函数

### `new bricks.BufferedDataLoader(widget, options)`

#### 参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `widget` | Object | ✅ | 数据展示组件实例，必须实现 `.clear_data()`, `.add_rows(rows, direction)`, `.del_old_rows(count, direction)` 方法。 |
| `opts` | Object | ✅ | 配置选项对象，详见下表。 |

#### `opts` 配置项

| 属性 | 类型 | 可选 | 默认值 | 说明 |
|------|------|------|--------|------|
| `url` | String | ❌ | - | 请求数据的 API 地址。 |
| `method` | String | ✅ | `'GET'` | HTTP 请求方法，如 `'GET'` 或 `'POST'`。 |
| `params` | Object | ✅ | `{}` | 固定请求参数（例如过滤条件、排序字段等）。 |
| `buffer_pages` | Number | ✅ | `5` | 最大缓存页数，超出时将移除最旧或最新的一页以释放内存。 |
| `pagerows` | Number | ✅ | `60` | 每页返回的数据行数。 |

---

## 实例属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `cur_page` | Number | 当前正在加载/显示的页码（从 1 开始）。 |
| `total_records` | Number | 总记录数（由服务器返回填充）。 |
| `total_page` | Number | 总页数（根据 `total_records / pagerows` 计算得出）。 |
| `buffer` | Object | （预留扩展）当前用于存储已加载页面数据的缓存对象（本版本未实际使用）。 |
| `buffered_pages` | Number | 当前缓冲中的页面数量（影响是否触发旧数据清理）。 |
| `loading` | Boolean | 标志位，表示是否正在进行网络请求。 |
| `direction` | String | 上下方向标识：`'up'` 表示上一页，`'down'` 表示下一页，用于通知 widget 渲染策略。 |
| `cur_params` | Object | 合并后的当前请求参数（包含固定参数和动态传参）。 |

---

## 方法

### `initial()`
重置加载器状态，通常在初始化或重新加载前调用。

#### 功能：
- 重置当前页为 `-1`
- 清空缓冲计数
- 重置总记录数
- 清空当前参数副本

---

### `async loadData(params)`
初始化并加载第一页数据，清空现有数据。

#### 参数：
- `params` *(Object, 可选)*: 动态附加的请求参数（会与 `opts.params` 合并）

#### 返回值：
- `Promise<Object>`: 解析为服务器返回的数据结构，包含：
  ```js
  {
    total: 1000,
    page: 1,
    total_page: 17,
    rows: [...]
  }
  ```

#### 流程：
1. 调用 `initial()` 重置状态
2. 清空 widget 显示数据
3. 合并默认参数与传入参数
4. 设置每页行数 (`rows`) 和初始页码 (`page=1`)
5. 调用 `loadPage()` 加载第一页

#### 示例：
```js
const loader = new bricks.BufferedDataLoader(myWidget, {
  url: '/api/data',
  params: { category: 'A' },
  pagerows: 50
});

await loader.loadData({ search: 'keyword' }); // 发送 {category:'A', search:'keyword', rows:50, page:1}
```

---

### `async loadPage(page)`
加载指定页码的数据（内部方法，也可手动调用）。

#### 参数：
- `page` *(Number, 可选)*: 指定要加载的页码，默认为当前 `this.cur_page + 1`（如果未设置）

> ⚠️ 注意：此方法内部管理 `cur_page`，外部应优先使用 `nextPage()` / `previousPage()`。

#### 行为逻辑：
1. 若正在加载，则直接返回（防重复提交）
2. 若缓冲页数达到上限（`buffer_pages`），则调用 `widget.del_old_rows()` 删除旧行
3. 构造完整请求参数（含 `page`, `rows` 等）
4. 使用 `bricks.HttpJson` 发起异步请求
5. 更新总记录数和总页数
6. 调用 `widget.add_rows()` 添加新数据
7. 增加缓冲页计数，释放加载锁

#### 返回值：
- `Promise<Object>`: 服务器响应数据

---

### `async nextPage()`
加载下一页数据。

#### 条件判断：
- 如果已在最后一页或正在加载，则不执行任何操作。

#### 行为：
- 设置 `direction = 'down'`
- `cur_page += 1`
- 调用 `loadPage()`

#### 示例：
```js
await loader.nextPage(); // 加载第 2 页
```

---

### `async previousPage()`
加载上一页数据。

#### 条件判断：
- 如果已是第一页或正在加载，则不执行。

#### 行为：
- 设置 `direction = 'up'`
- `cur_page -= 1`
- 调用 `loadPage()`

#### 示例：
```js
await loader.previousPage(); // 回退到前一页
```

---

## widget 接口要求

`BufferedDataLoader` 依赖传入的 `widget` 实现以下三个方法：

| 方法 | 签名 | 用途 |
|------|------|------|
| `.clear_data()` | `function(): void` | 清空当前所有数据显示 |
| `.add_rows(rows, direction)` | `function(Array, String): void` | 添加一批数据行，`direction` 为 `'up'` 或 `'down'`，可用于决定插入位置 |
| `.del_old_rows(count, direction)` | `function(Number, String): void` | 删除旧数据行（例如顶部或底部若干行），用于维持缓冲大小 |

> 💡 提示：这些方法可结合虚拟滚动、DOM 复用等技术实现高性能渲染。

---

## 使用示例

```js
// 定义 widget 对象（模拟组件）
const myWidget = {
  data: [],
  clear_data() {
    this.data = [];
    console.log("数据已清空");
  },
  add_rows(rows, direction) {
    if (direction === 'up') {
      this.data.unshift(...rows);
    } else {
      this.data.push(...rows);
    }
    console.log(`添加了 ${rows.length} 行数据，方向: ${direction}`);
  },
  del_old_rows(count, direction) {
    if (direction === 'up') {
      this.data.splice(-count); // 删除末尾
    } else {
      this.data.splice(0, count); // 删除开头
    }
    console.log(`删除了 ${count} 行旧数据`);
  }
};

// 创建 BufferedDataLoader 实例
const loader = new bricks.BufferedDataLoader(myWidget, {
  url: '/api/list',
  method: 'POST',
  params: { type: 'report' },
  buffer_pages: 3,
  pagerows: 20
});

// 初始加载第一页
await loader.loadData({ keyword: 'test' });

// 下一页
await loader.nextPage();

// 上一页
await loader.previousPage();
```

---

## 注意事项

1. **线程安全**：通过 `this.loading` 实现简单的并发控制，防止重复请求。
2. **内存控制**：通过 `buffer_pages` 控制最大缓存页数，避免内存溢出。
3. **方向感知**：`direction` 字段帮助 widget 区分上下滑动行为，便于优化 UI 渲染。
4. **总页数计算修正**：
   ```js
   if (d.total_page * this.pagerows < this.total_record) {
     d.total_page += 1;
   }
   ```
   此处逻辑存在潜在错误（应使用向上取整），建议改为：
   ```js
   d.total_page = Math.ceil(d.total / this.pagerows);
   ```

---

## 改进建议

| 问题 | 建议修复 |
|------|---------|
| `total_page` 计算错误 | 改为 `Math.ceil(total / pagerows)` |
| `buffer` 成员未实际使用 | 应实现真正的页面数据缓存以支持快速回退 |
| 缺少错误处理 | 在 `httpcall` 外包裹 `try-catch` 并抛出异常 |
| 不支持取消请求 | 可引入 `AbortController` 实现请求中断 |

---

## 版本信息

- 所属库：`bricks.js`
- 类名：`BufferedDataLoader`
- 创建时间：未知
- 作者：未知

--- 

📖 **文档生成于：2025年4月5日**