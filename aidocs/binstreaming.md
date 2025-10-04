# Bricks 流媒体传输模块技术文档

---

## 概述

`bricks.UpStreaming` 和 `bricks.down_streaming` 是用于实现浏览器端流式数据上传与下载的 JavaScript 工具类，基于现代 Web API（如 `ReadableStream` 和 `fetch`）构建。该模块适用于需要实时上传二进制数据（如音频、视频流）或处理响应流的场景。

主要功能包括：

- **上行流（UpStreaming）**：通过 `POST` 请求将数据以 `application/octet-stream` 格式分块发送至指定 URL。
- **下行流解析器（down_streaming）**：异步生成器函数，用于消费 `Response.body` 的流式内容，并将其转换为字符串输出。

---

## 依赖说明

本模块依赖以下现代浏览器特性：

- `ReadableStream`
- `Headers`
- `fetch()` API（支持 `duplex: 'full'`）
- `async/await` 与 `async generator` 函数
- `TextDecoder`（隐含在 `String.fromCharCode` 使用中）

> ⚠️ 注意：`duplex: 'full'` 是处理流式请求所必需的，目前仅在部分现代浏览器（如 Chrome 105+）中支持。

---

## 命名空间初始化

```js
bricks = window.bricks || {};
```

确保 `bricks` 全局命名空间存在，避免覆盖已有定义。

---

## 类：`bricks.UpStreaming`

继承自 `bricks.JsWidget`，提供流式上传能力。

### 继承关系

```js
class UpStreaming extends bricks.JsWidget
```

> 需确保 `bricks.JsWidget` 已正确定义并可用。

---

### 构造函数

```js
constructor(opts)
```

#### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `opts` | Object | 配置对象，必须包含 `url` 字段 |

示例配置：
```js
{
  url: "https://example.com/upload"
}
```

#### 实现逻辑

调用父类构造函数 `super(opts)`，初始化组件基础属性。

---

### 方法

#### `async go()`

启动流式上传请求。

##### 返回值

- `{Promise<Response>}`：返回一个 resolve 为 `Response` 对象的 Promise。

##### 实现细节

1. 创建一个可读流 `this.body`，使用当前实例作为其源（source）。
2. 设置请求头：
   - `Content-Type: application/octet-stream`
3. 使用 `fetch` 发起 POST 请求：
   ```js
   fetch(this.url, {
     method: 'POST',
     headers: this.headers,
     duplex: 'full',
     body: this.body
   })
   ```
4. 返回响应 `Response` 对象。

> 💡 `duplex: 'full'` 表示客户端可以同时写入请求体并读取响应，常用于流式接口。

---

#### `send(data)`

向流中写入一段数据。

##### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `data` | ArrayBuffer / Uint8Array 等 | 要发送的二进制数据块 |

##### 实现

调用内部控制器的 `enqueue` 方法将数据推入流队列：

```js
this.stream_ctlr.enqueue(data);
```

> 必须在调用 `start()` 后才能使用此方法。

---

#### `finish()`

关闭写入流，表示所有数据已发送完毕。

##### 实现

```js
this.stream_ctlr.close();
```

通知流结束，触发底层请求完成。

---

#### `start(controller)`

流控制器初始化钩子（由 `ReadableStream` 调用）。

##### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `controller` | ReadableStreamController | 浏览器提供的流控制对象 |

##### 实现

保存控制器引用以便后续调用：

```js
this.stream_ctlr = controller;
```

> 此方法是 `ReadableStream` 构造时自动调用的标准接口。

---

## 函数：`bricks.down_streaming`

异步生成器函数，用于逐段读取响应流并解码为字符串。

```js
bricks.down_streaming = async function*(response)
```

### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `response` | Response | 来自 `fetch` 的响应对象 |

### 返回值

- `{AsyncGenerator<string>}`：异步生成器，每次 `yield` 一个字符串片段。

### 实现逻辑

1. 若 `response` 为空，则直接返回。
2. 获取响应体的读取器：`response.body.getReader()`
3. 循环调用 `reader.read()` 直到流结束（`done === true`）。
4. 将每一块 `Uint8Array` 数据转换为字符串：
   ```js
   String.fromCharCode(...value.value)
   ```
   > ❌ 注意：这种方式对非 ASCII 字符（如中文）可能出错，推荐使用 `TextDecoder`。
5. 输出日志并 `yield` 结果。

### 示例用法

```js
for await (const chunk of bricks.down_streaming(resp)) {
  console.log('Received:', chunk);
}
```

---

## 使用示例

### 上行流发送数据

```js
const uploader = new bricks.UpStreaming({
  url: '/api/stream-upload'
});

// 启动上传
const respPromise = uploader.go();

// 发送若干数据块
uploader.send(new TextEncoder().encode("Hello"));
uploader.send(new TextEncoder().encode("World"));

// 完成上传
uploader.finish();

// 获取响应
const resp = await respPromise;
console.log('Upload complete:', resp.status);
```

### 下行流接收数据

```js
const response = await fetch('/api/stream-download');
for await (const textChunk of bricks.down_streaming(response)) {
  console.log('Chunk:', textChunk);
}
```

---

## 注意事项与优化建议

1. ✅ **兼容性警告**  
   `duplex: 'full'` 并非所有浏览器都支持，请在使用前检测环境支持情况。

2. ⚠️ **字符编码问题**  
   当前行内使用 `String.fromCharCode` 解码字节数组，**不支持 UTF-8 多字节字符**。  
   建议改进为使用 `TextDecoder`：

   ```js
   const decoder = new TextDecoder('utf-8');
   let result = decoder.decode(value.value);
   ```

3. 🔒 **错误处理缺失**  
   当前代码未捕获 `fetch` 或 `reader.read()` 中可能出现的异常，建议添加 `try-catch`。

4. 📦 **内存管理**  
   大量频繁调用 `send()` 可能导致内存堆积，建议结合背压机制（backpressure）进行流控。

---

## 总结

| 功能 | 类/函数 | 用途 |
|------|--------|------|
| 流式上传 | `bricks.UpStreaming` | 实现双向流上传数据 |
| 流式下载解析 | `bricks.down_streaming` | 异步解析响应流为字符串 |

该模块适用于实时音视频通信、大文件分片上传、AI 流式推理等场景，具备良好的扩展潜力。

--- 

> 文档版本：v1.0  
> 最后更新：2025-04-05