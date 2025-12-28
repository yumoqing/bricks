# Bricks HTTP 模块技术文档

本模块为 `bricks` 前端框架提供了一套完整的 HTTP 请求处理工具集，支持多种响应类型（文本、JSON、二进制流等），并封装了自动参数注入、错误处理、会话管理与登录重定向等功能。

---

## 目录

- [概述](#概述)
- [核心功能](#核心功能)
- [公共函数](#公共函数)
- [基类：`HttpText`](#基类httptext)
- [派生类](#派生类)
  - [`HttpArrayBuffer`](#httparraybuffer)
  - [`HttpBin`](#httpbin)
  - [`HttpResponse`](#httpresponse)
  - [`HttpResponseStream`](#httpresponsestream)
  - [`HttpRaw`](#httpraw)
  - [`HttpJson`](#httpjson)
- [快捷方法](#快捷方法)
- [使用示例](#使用示例)

---

## 概述

`bricks.Http*` 系列类基于 `fetch` API 构建，旨在统一前端网络请求行为。主要特性包括：

- 自动附加设备信息和会话参数
- 支持 GET/POST 请求及 FormData 或 JSON 数据格式
- 统一的错误提示机制（401、403、其他错误）
- 可扩展的响应处理器（文本、JSON、流式解析等）
- 登录拦截与跳转支持（待完善）

该模块适用于 Web 应用中需要与后端服务交互的所有场景。

---

## 核心功能

| 功能 | 描述 |
|------|------|
| 参数合并 | 自动注入 `_webbricks_`, 屏幕宽高, 移动端标识等参数 |
| 会话管理 | 从响应头读取 `Set-Cookie` 并保存会话；发送时自动携带 |
| 错误处理 | 对 401、403 和非 OK 状态码进行统一 UI 提示 |
| 登录重定向 | 当返回 401 且存在 `login_url` 时触发登录流程（目前未完全实现） |
| 流式响应处理 | 支持逐行处理 chunked 响应数据（如 Server-Sent Events） |

---

## 公共函数

### `url_params(data)`

将对象转换为 URL 查询字符串。

#### 参数
- `data`: `{[key: string]: any}` — 要编码的对象

#### 返回值
- `string` — 格式化后的查询字符串（例如 `"a=1&b=2"`）

#### 示例
```js
url_params({a: 1, b: 'hello'}) // → "a=1&b=hello"
```

> ⚠️ 所有值都会通过 `encodeURIComponent` 编码。

---

## 基类：`HttpText`

所有 HTTP 客户端类的基类。

### 构造函数 `constructor(headers?)`

#### 参数
- `headers?`: `{[key: string]: string}` — 自定义请求头，默认为 `{ Accept: "text/html" }`

#### 行为说明
- 若未传入 `headers`，默认使用：
  ```js
  { "Accept": "text/html" }
  ```
- 使用 `bricks.extend()` 合并默认头与用户头。
- 自动收集以下上下文参数作为请求参数：
  - `_webbricks_`: 固定值 `1`
  - `width`: 屏幕宽度（来自 `bricks.app.screenWidth()`）
  - `height`: 屏幕高度（来自 `bricks.app.screenHeight()`）
  - `_is_mobile`: 是否为移动端（`'1'` 或 `'0'`）

> ✅ 这些参数会在每次请求中自动附加。

### 方法

#### `url_parse(url)`

解析 URL 中的查询参数，并将其合并到内部 `this.params` 中。

##### 参数
- `url`: `string` — 原始 URL（含 query）

##### 返回值
- `string` — 清除 query 的基础 URL

##### 示例
```js
const client = new bricks.HttpText();
client.url_parse("/api/data?a=1&b=2");
// 结果：client.params 包含 a=1, b=2
// 返回 "/api/data"
```

#### `add_own_params(params)`

合并用户参数与内部参数（包括 session）。

##### 参数
- `params`: `Object | FormData | null`

##### 返回值
- `Object | FormData` — 合并后的参数对象

##### 行为逻辑
- 如果是 `FormData`，直接追加键值对
- 否则创建新对象，合并 `this.params` 和 `params`
- 若存在 `bricks.app.get_session()`，额外添加 `session` 字段

#### `add_own_headers(headers)`

合并自定义请求头与实例默认头。

##### 参数
- `headers`: `{[key: string]: string} | null`

##### 返回值
- `Object` — 合并后的 headers

> 使用 `Object.assign(this.headers, headers)` 实现浅合并。

#### `async bricks_fetch(url, {method, headers, params})`

底层 `fetch` 封装，负责构建最终请求选项。

##### 参数
- `url`: `string` — 请求地址
- `method`: `'GET'|'POST'|'HEAD'|...` — HTTP 方法（默认 `'GET'`）
- `headers`: `Object` — 请求头
- `params`: `Object|FormData` — 请求参数

##### 处理逻辑
| 条件 | 行为 |
|------|------|
| `params instanceof FormData` | 强制设为 POST，`body = params` |
| `GET/HEAD` 请求 | 将 `params` 转为 query string 拼接到 URL |
| 其他方法（如 POST） | `body = JSON.stringify(params)` |

##### 返回值
- `Response` — fetch 返回的原生响应对象

#### `async httpcall(url, opts)`

高层封装，包含状态码判断与错误处理。

##### 参数
- `url`: `string`
- `opts`: `{method, headers, params}`

##### 流程
1. 调用 `bricks_fetch` 发起请求
2. 检查响应状态：
   - **401** 且配置了 `bricks.app.login_url` → 触发 `withLoginInfo`
   - **403** → 显示“禁止访问”弹窗
   - 非 `ok` → 显示通用错误弹窗
3. 成功则调用 `get_result_data()` 获取结果
4. 解析 `Set-Cookie` 并调用 `bricks.app.save_session(session)` 保存会话

##### 返回值
- `string | null` — 成功返回响应内容，失败返回 `null`

#### `async withLoginInfo(url, params)`

处理 401 时尝试重新登录（当前仅为占位实现）。

> ❗ 当前仅创建一个 `urlwidget` 加载登录页，未完成回调或重试逻辑。

#### `async get_result_data(resp)`

提取响应体数据的方法（可被子类覆盖）。

##### 默认实现（`HttpText`）
```js
return await resp.text();
```

---

## 派生类

### `HttpArrayBuffer`

继承自 `HttpText`，用于下载二进制文件（如字体、模型等）。

#### 重写方法
```js
async get_result_data(resp) {
  return await resp.arrayBuffer();
}
```

---

### `HttpBin`

继承自 `HttpText`，以 Blob 形式获取响应（适合图片、音频等）。

#### 重写方法
```js
async get_result_data(resp) {
  return await resp.blob();
}
```

---

### `HttpResponse`

继承自 `HttpText`，直接返回原始 `Response` 对象。

#### 重写方法
```js
async get_result_data(resp) {
  return resp;
}
```

> ✅ 适用于需手动处理 header 或 stream 的高级场景。

---

### `HttpResponseStream`

继承自 `HttpResponse`，专用于处理流式响应（如 SSE）。

#### 方法：`async handle_chunk(resp, handler)`

逐行解析 chunked 文本流，并调用 `handler(line)`。

##### 参数
- `resp`: `Response` — fetch 返回的响应对象
- `handler`: `(line: string) => void` — 每一行数据的处理器

##### 实现细节
- 使用 `ReadableStream.getReader()` + `TextDecoder`
- 按 `\n` 分割缓冲区，确保跨 chunk 边界正确切分
- 最终剩余内容也会传递给 `handler`

##### 示例用法
```js
const streamClient = new bricks.HttpResponseStream();
const resp = await streamClient.get('/stream-endpoint');
await streamClient.handle_chunk(resp, (line) => {
  console.log('Received:', line);
});
```

---

### `HttpRaw`

与 `HttpBin` 相同，返回 `Blob`。

> ⚠️ 注释中可能表示未来用途不同，但当前实现与 `HttpBin` 完全一致。

---

### `HttpJson`

专用于 JSON 接口通信，设置默认 Accept 头并解析 JSON 响应。

#### 构造函数增强
```js
this.headers = { "Accept": "application/json" };
bricks.extend(this.headers, headers); // 用户头可覆盖
```

#### 重写方法
```js
async get_result_data(resp) {
  return await resp.json();
}
```

> ✅ 推荐用于 RESTful API 调用。

---

## 快捷方法

模块末尾导出多个常用快捷函数，绑定到全局命名空间：

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `bricks.hc` | `new HttpText()` | 文本客户端实例 |
| `bricks.tget` | `Function` | `hc.get` 的绑定方法（GET 文本） |
| `bricks.tpost` | `Function` | `hc.post` 的绑定方法（POST 文本） |
| `bricks.jc` | `new HttpJson()` | JSON 客户端实例 |
| `bricks.jcall` | `Function` | `jc.httpcall` 的绑定方法（调用 JSON 接口） |
| `bricks.jget` | `Function` | `jc.get` 的绑定方法（GET JSON） |
| `bricks.jpost` | `Function` | `jc.post` 的绑定方法（POST JSON） |

### 示例
```js
// 获取 HTML 内容
const html = await bricks.tget('/page', { params: { id: 123 } });

// 调用 JSON 接口
const data = await bricks.jpost('/api/user', {
  headers: { 'X-Token': 'abc' },
  params: { name: 'Alice' }
});
```

---

## 使用示例

### 1. 发送普通 GET 请求
```js
const client = new bricks.HttpText();
const result = await client.get('/api/hello', {
  params: { q: 'test' }
});
console.log(result); // 输出服务器返回的文本
```

### 2. 发送 JSON POST 请求
```js
const jsonClient = new bricks.HttpJson();
const user = await jsonClient.post('/api/users', {
  params: { name: 'Bob', age: 30 }
});
// 自动设置 Content-Type 和 Accept，并解析 JSON
```

### 3. 下载文件为 ArrayBuffer
```js
const bufferClient = new bricks.HttpArrayBuffer();
const resp = await bufferClient.get('/model.bin');
const arrayBuf = await resp; // 已是 arrayBuffer
```

### 4. 处理实时日志流
```js
const streamClient = new bricks.HttpResponseStream();
const resp = await streamClient.get('/logs/stream');
await streamClient.handle_chunk(resp, (line) => {
  console.log('[LOG]', line);
});
```

---

## 注意事项

- 依赖 `bricks.app` 提供 `screenWidth()`, `screenHeight()`, `get_session()`, `save_session()` 等方法
- 依赖 `bricks.extend(obj, src)` 实现对象合并（类似 jQuery.extend）
- `objget(headers, 'Set-Cookie')` 用于安全获取响应头（需外部定义）
- 登录流程尚未完整实现，`withLoginInfo` 仅为原型

---

## 待优化建议

| 问题 | 建议改进 |
|------|---------|
| `bufffer` 拼写错误 | 修复 `if (buffer != ''){ yield bufffer; }` 中的拼写 |
| `withLoginInfo` 无实际登录能力 | 应支持模态框输入并回调重试请求 |
| `handle_chunk` 正则 `/\\r?\\n/gm` 不必要 | 可简化为 `.split('\n')` |
| `bricks_fetch` 中 `method = 'POST'` 修改外层变量风险 | 应使用局部变量 |

---

## 版本信息

- 创建时间：未知
- 框架版本：Bricks Framework v1.x+
- 作者：Bricks Team

> 文档最后更新：2025年4月5日