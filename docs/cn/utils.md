# Bricks.js 技术文档

> **Bricks.js** 是一个轻量级的前端工具库，提供了一系列实用函数和类，用于处理 DOM 操作、事件监听、数据转换、网络请求、媒体流播放等常见任务。它支持响应式设计、动态组件构建，并兼容移动端与桌面端环境。

---

## 目录

- [初始化](#初始化)
- [核心配置](#核心配置)
- [时间与格式化](#时间与格式化)
- [DOM 与观察者](#dom-与观察者)
- [URL 与资源管理](#url-与资源管理)
- [数据处理与类型判断](#数据处理与类型判断)
- [颜色解析](#颜色解析)
- [异步与流式响应](#异步与流式响应)
- [Blob 与 Base64 转换](#blob-与-base64-转换)
- [表单与对象操作](#表单与对象操作)
- [调试系统](#调试系统)
- [设备检测](#设备检测)
- [UI 定位与布局](#ui-定位与布局)
- [扩展方法（Array）](#扩展方法array)
- [Cookie 操作](#cookie-操作)
- [高度同步](#高度同步)
- [深拷贝与对象操作](#深拷贝与对象操作)
- [媒体流播放](#媒体流播放)
- [模板渲染与组件构建](#模板渲染与组件构建)
- [可观察对象 Observable](#可观察对象-observable)
- [队列结构 Queue](#队列结构-queue)
- [DOM 创建工具](#dom-创建工具)

---

## 初始化

```js
var bricks = window.bricks || {};
```

确保 `bricks` 全局命名空间存在，避免覆盖已有变量。

---

## 核心配置

### `bricks.bug`
- **类型**: `boolean | string`
- **默认值**: `false`
- **说明**: 控制是否开启调试模式。
  - `false`: 不输出任何调试信息。
  - `true`: 在控制台打印调用栈和参数。
  - `'server'`: 将日志发送到服务器 `/debug` 接口。

---

## 时间与格式化

### `bricks.timeDiff(startTime)`
计算当前时间与指定时间之间的差值，并格式化为 `HH:mm:ss.SSS` 字符串。

#### 参数
| 参数名     | 类型             | 说明                     |
|----------|------------------|------------------------|
| startTime | `Date \| number` | 开始时间（毫秒或 Date 对象） |

#### 返回值
- **类型**: `string`
- **格式**: `"HH:mm:ss.SSS"`

#### 示例
```js
const start = new Date() - 3661000; // 1小时1分钟1秒前
console.log(bricks.timeDiff(start)); // "01:01:01.000"
```

---

## DOM 与观察者

### `bricks.resize_observer`
使用 `ResizeObserver` 监听元素尺寸变化。

#### 功能
- 自动触发绑定了 `bricks_widget` 的组件的 `element_resize` 事件。
- 传递 `contentRect` 作为事件参数。

#### 使用方式
```js
widget.dom_element.bricks_widget = widget;
bricks.resize_observer.observe(widget.dom_element);
```

---

### `bricks.dom_on_off_observer`
使用 `MutationObserver` 监听 DOM 添加/移除事件。

#### 触发事件
| 事件名    | 触发条件           |
|---------|------------------|
| `domon`  | 元素被添加到 DOM     |
| `domoff` | 元素从 DOM 移除（包括后代）|

#### 配置
- 监听 `document.body`
- 启用 `childList` 和 `subtree`，深度遍历所有子节点。

#### 注意事项
- 只处理元素节点（Node Type === 1）
- 支持嵌套组件自动解绑

---

## URL 与资源管理

### `addParamsToUrl(url, params, widget)`
向 URL 添加查询参数，支持相对路径。

#### 参数
| 参数     | 类型     | 说明                   |
|--------|--------|----------------------|
| url    | string | 原始 URL（相对或绝对）       |
| params | object | 要添加的键值对参数          |
| widget | any    | （未使用，保留字段）        |

#### 返回值
- **类型**: `string`
- 包含新参数的完整 URL

#### 示例
```js
addParamsToUrl('/api/data', { id: 123 }); 
// => "http://current-domain/api/data?id=123"
```

---

### `bricks.absurl(url, widget)`
生成绝对 URL，基于 `widget.baseURI` 或 `bricks.Body.baseURI`。

#### 规则
- 若 URL 已是 `http://` 或 `https://`，直接返回。
- 若以 `/` 开头，则基于根路径拼接。
- 否则基于当前脚本所在目录补全。

#### 示例
```js
bricks.absurl('style.css'); // => "https://example.com/path/to/style.css"
```

---

### `bricks.path`
- **类型**: `string`
- 当前执行脚本所在的目录路径（末尾不带 `/`）

由 `currentScriptPath()` 函数设置。

---

### `bricks_resource(name)`
根据 `bricks.path` 生成资源路径。

#### 示例
```js
bricks_resource('img/logo.png');
// => "https://example.com/scripts/img/logo.png"
```

---

## 数据处理与类型判断

### `isString(value)`
判断是否为字符串类型。

#### 返回值
- `true` if `typeof value === 'string'` or `value instanceof String`

---

### `formdata2object(formdata)`
将 `FormData` 转换为普通 JavaScript 对象。

#### 示例
```js
const fd = new FormData();
fd.append('name', 'Alice');
formdata2object(fd); // { name: "Alice" }
```

---

### `inputdata2dic(data)`
提取 `FormData` 所有字段，对 `prompt` 字段进行特殊字符转义。

#### 特性
- 自动调用 `bricks.escapeSpecialChars(x)` 处理 `prompt` 字段
- 异常捕获：若失败则原样返回输入数据

---

### `bricks.map(data_source, mapping, need_others)`
按映射规则重命名对象属性。

#### 参数
| 参数         | 说明                             |
|------------|----------------------------------|
| data_source | 源对象                            |
| mapping     | 键映射表 `{旧名: 新名}`            |
| need_others | 是否保留未映射的原始字段              |

#### 示例
```js
bricks.map({ a: 1, b: 2 }, { a: 'x' }, true); 
// => { x: 1, b: 2 }
```

---

### `bricks.delete_null_values(obj)`
删除对象中所有值为 `null` 的属性。

#### 示例
```js
bricks.delete_null_values({ a: null, b: 2 }); // { b: 2 }
```

---

### `bricks.is_empty(obj)`
判断对象是否为空（`null` 或 `{}`）。

#### 示例
```js
bricks.is_empty(null);      // true
bricks.is_empty({});        // true
bricks.is_empty({ a: 1 });  // false
```

---

## 颜色解析

### `parseRGB(colorStr)`
解析 `rgb(r, g, b)` 格式的颜色字符串。

#### 成功返回
```js
{ r: 255, g: 100, b: 50 }
```

#### 失败返回
- `null`

---

### `parseRGBA(colorStr)`
解析 `rgba(r, g, b, a?)` 格式颜色字符串，`a` 可选，默认 `1`。

#### 示例
```js
parseRGBA('rgba(255, 0, 0, 0.8)'); // { r: 255, g: 0, b: 0, a: 0.8 }
parseRGBA('rgb(255, 0, 0)');       // { r: 255, g: 0, b: 0, a: 1 }
```

---

## 异步与流式响应

### `streamResponseJson(response, onJson)`
逐行解析 NDJSON 流式响应并回调处理每个 JSON 对象。

#### 参数
| 参数       | 类型       | 说明                       |
|----------|----------|--------------------------|
| response | Response | fetch 返回的响应对象           |
| onJson   | Function | 每解析一行有效的 JSON 后调用该函数 |

#### 特性
- 支持 UTF-8 解码
- 缓冲未完成的行至下次读取
- 自动忽略空行和解析错误

#### 示例
```js
fetch('/stream').then(res => streamResponseJson(res, json => {
  console.log('Received:', json);
}));
```

---

## Blob 与 Base64 转换

### `base64_to_url(base64, mimeType)`
将 Base64 字符串转换为 Blob URL。

#### 参数
| 参数        | 默认值         | 说明               |
|-----------|--------------|------------------|
| base64    | required     | Base64 编码的数据    |
| mimeType  | `"audio/wav"` | MIME 类型           |

#### 返回值
- `string`: `blob:` URL

#### 示例
```js
const audioUrl = base64_to_url(base64Data);
new Audio(audioUrl).play();
```

---

### `blobToBase64(blob)`
异步将 Blob 转换为 Data URL（包含 Base64 编码）。

#### 返回值
- `Promise<string>`: 如 `"data:audio/wav;base64,..."`

#### 示例
```js
const dataUrl = await blobToBase64(blob);
```

---

## 表单与对象操作

### `bricks.formdata_copy(fd)`
克隆 `FormData` 实例。

#### 返回值
- 新的 `FormData` 实例，内容与原实例一致。

---

### `objcopy(obj)`
通过 `JSON.stringify + JSON.parse` 实现浅层深拷贝。

#### 局限性
- 不支持函数、undefined、Symbol、循环引用

---

### `objget(obj, key, defval)`
安全获取对象属性，类似 Python 的 `.get()` 方法。

#### 示例
```js
objget({ a: 1 }, 'b', 'default'); // "default"
```

---

### `bricks.obj_fmtstr(obj, fmt)`
模板字符串替换，支持 `${key}` 和 `${key:}` 语法。

#### 支持语法
| 语法           | 效果                          |
|--------------|-----------------------------|
| `${name}`     | 替换为 `obj.name`              |
| `${name:}`    | 替换为 `"name:value"` 形式       |
| `${name=}`    | 同上（兼容旧写法）                 |
| 不存在的 key    | 替换为空字符串                    |

#### 示例
```js
bricks.obj_fmtstr({ name: "Tom" }, "Hello ${name}!"); 
// => "Hello Tom!"
```

---

## 调试系统

### `bricks.debug(...args)`
统一调试输出接口。

#### 行为逻辑
- 如果 `bricks.bug === false` → 无输出
- 如果 `bricks.bug === true` → 输出到控制台 + 调用栈
- 如果 `bricks.bug === 'server'` → 延迟 0.1s 发送到 `/debug` 接口

#### 示例
```js
bricks.bug = true;
bricks.debug('Test message', { x: 1 });
// [调用位置] Test message {x: 1}
```

---

### `bricks.serverdebug(message)`
将消息 POST 到 `/debug` 接口（需配合后端接收）。

#### 内部使用
- 通过 `bricks.HttpJson().post()` 发送
- 仅当 `bricks.bug === 'server'` 时启用

---

## 设备检测

### `bricks.is_mobile()`
判断是否为移动设备。

#### 判断依据
1. UserAgent 包含常见移动设备关键词
2. 存在触摸事件支持（`ontouchstart`, `maxTouchPoints`）
3. 屏幕尺寸 ≤ 768×1024

#### 返回值
- `true` if mobile device

---

## UI 定位与布局

### `archor_at(archor)`
计算锚点坐标百分比。

#### 支持锚点
| 值  | 含义         |
|-----|------------|
| tl  | 左上         |
| tc  | 顶部居中      |
| tr  | 右上         |
| cl  | 中左         |
| cc  | 居中（默认）   |
| cr  | 中右         |
| bl  | 左下         |
| bc  | 底部居中      |
| br  | 右下         |

#### 返回值
```js
{ x: "50%", y: "50%", left: "50%", top: "50%" }
```

---

### `archorize(ele, archor)`
将元素定位到指定锚点，并应用 CSS transform 居中。

#### 效果
- 设置 `position: absolute`
- 设置 `top`, `left`
- 使用 `transform: translateY(-y) translateX(-x)` 精确居中

#### 示例
```js
archorize(menuEl, 'tr'); // 右上角弹出菜单
```

---

### `bricks.relocate_by_eventpos(event, widget)`
根据鼠标点击位置智能调整组件位置，避免溢出视口。

#### 策略
- X轴：左侧或右侧展开（避开边缘）
- Y轴：上方或下方展开
- 留出 `bricks.app.charsize` 边距

#### 应用场景
- 上下文菜单
- 提示框浮动定位

---

## 扩展方法（Array）

### `Array.prototype.insert(index, ...items)`
在指定索引插入多个元素。

#### 示例
```js
[1, 2].insert(1, 'a', 'b'); // [1, 'a', 'b', 2]
```

---

### `Array.prototype.remove(item)`
移除数组中第一个匹配项。

#### 示例
```js
[1, 2, 3].remove(2); // [1, 3]
```

---

### `removeArrayItems(array, itemsToRemove)`
返回过滤后的数组，排除指定元素。

#### 示例
```js
removeArrayItems([1,2,3], [2]); // [1,3]
```

---

## Cookie 操作

### `setCookie(name, value, days)`
设置 cookie，支持过期时间。

#### 参数
| 参数   | 说明                     |
|------|------------------------|
| name | 名称                     |
| value| 值                      |
| days | 过期天数（可选），null 表示会话 cookie |

---

### `getCookie(name)`
获取指定名称的 cookie 值。

#### 返回值
- 字符串或 `null`（未找到）

---

### `eraseCookie(name)`
清除指定 cookie。

---

## 高度同步

### `set_max_height(w1, w2)`
使两个组件的高度保持一致（取较大者）。

#### 用途
- 并排显示的面板保持视觉对齐

#### 调用方式
```js
w1.set_height(h); // 假设 set_height 是组件方法
```

---

## 深拷贝与对象操作

### `bricks.extend(d, s)`
递归合并源对象 `s` 到目标对象 `d`。

#### 特性
- 仅复制自有属性
- 遇到同名对象时递归合并
- 基础类型直接覆盖

#### 示例
```js
bricks.extend({ a: { x: 1 } }, { a: { y: 2 }, b: 3 });
// => { a: { x: 1, y: 2 }, b: 3 }
```

---

## 媒体流播放

### `bricks.playResponseAudio(response, target)`
播放 `fetch` 返回的音频响应。

#### 参数
| 参数      | 类型                | 说明                        |
|---------|---------------------|---------------------------|
| response | Response            | HTTP 响应对象                  |
| target   | string \| JsWidget  | 组件 ID 或描述对象               |

#### 流程
1. 检查状态码是否为 200
2. 转换为 Blob 并创建 Object URL
3. 设置 `widget.set_url(url)` 并调用 `.play()`

---

### `bricks.set_stream_source(target, url, params)`
流式加载音频（适用于大文件或实时流）。

#### 使用技术
- `MediaSource API`
- 分块加载 `audio/wav` 数据

#### 流程
1. 创建 `MediaSource`
2. 创建 `SourceBuffer`
3. 通过 `fetch` 流式读取并 `appendBuffer`

#### 限制
- 需浏览器支持 MSE（Media Source Extensions）

---

## 模板渲染与组件构建

### `bricks.widgetBuildWithData(desc_tmpl, from_widget, data)`
使用模板和数据动态创建组件。

#### 参数
| 参数         | 说明                         |
|------------|----------------------------|
| desc_tmpl  | 包含 `${}` 占位符的 JSON 模板字符串 |
| from_widget| 父组件（可选）                  |
| data       | 数据源对象                      |

#### 流程
1. 使用 `bricks.obj_fmtstr` 替换模板变量
2. `JSON.parse` 得到组件描述
3. 调用 `widgetBuild` 创建组件
4. 绑定 `row_data = data`

---

## 可观察对象 Observable

### `bricks.Observable`
简单的发布-订阅模型属性包装器。

#### 构造函数
```js
new bricks.Observable(owner, name, initialValue)
```

#### 方法
| 方法 | 说明                              |
|------|---------------------------------|
| `set(v)` | 设置值，若改变则触发 `owner.dispatch(name, v)` |
| `get()`  | 获取当前值（注意：内部应为 `this.value`）     |

> ⚠️ 注意：当前代码中 `get()` 返回的是 `this.v`，应修正为 `this.value`。

---

## 队列结构 Queue

### `bricks.Queue`
标准 FIFO 队列实现。

#### 方法
| 方法           | 说明                           |
|--------------|------------------------------|
| `enqueue(e)`  | 入队                            |
| `dequeue()`   | 出队（移除并返回首元素）              |
| `peek()`      | 查看首元素（不移除）                 |
| `isEmpty()`   | 判断是否为空                      |
| `size()`      | 获取长度                         |
| `clear()`     | 清空                            |
| `print()`     | 控制台输出数组内容                  |
| `done()`      | 标记队列结束（自定义状态）             |
| `is_done()`   | 查询是否已结束                     |

#### 示例
```js
const q = new bricks.Queue();
q.enqueue(1);
q.enqueue(2);
console.log(q.dequeue()); // 1
```

---

## DOM 创建工具

### `bricks.dom_create(tag, opts)`
创建带有类名和 ID 的 DOM 元素。

#### 参数
| 参数   | 说明                     |
|------|------------------------|
| tag  | 标签名（如 `'div'`）       |
| opts | 选项：`css`（字符串）、`id` |

#### 示例
```js
bricks.dom_create('div', { css: 'menu active', id: 'main-menu' });
```

> ❌ Bug: `css.split(' ')` 中 `css` 应为 `opts.css`

✅ 正确实现应为：
```js
if (opts.css) {
  const arr = opts.css.split(' ');
  arr.forEach(c => e.classList.add(c));
}
```

---

### `bricks.element_from_html(html)`
从 HTML 字符串创建 DOM 元素（仅根元素）。

#### 示例
```js
const el = bricks.element_from_html('<div class="box">Content</div>');
document.body.appendChild(el);
```

> ❌ 注意：`outerHTML` 不会修改自身标签，此方法可能无效。

✅ 推荐改用：
```js
const div = document.createElement('div');
div.innerHTML = html;
return div.firstElementChild;
```

---

## 工具函数

### `convert2int(s)`
从字符串中提取首个整数。

#### 示例
```js
convert2int("width: 100px"); // 100
```

---

### `schedule_once(f, t)`
延迟执行函数（单位：秒）。

#### 示例
```js
schedule_once(() => console.log('After 0.5s'), 0.5);
```

---

### `schedule_interval(f, t)`
模拟 `setInterval`，递归调用 `setTimeout`。

> ⚠️ 存在 bug：内部 `mf.bind(func, t)` 使用错误，会导致上下文丢失。

建议重构为更稳定的方式。

---

### `querySelectorAllShadows(selector, el)`
递归查找包括 Shadow DOM 内的所有匹配元素。

#### 用途
- 跨 Shadow Boundary 查询组件

#### 示例
```js
querySelectorAllShadows('.btn', document.body);
```

---

## 总结

**Bricks.js** 提供了一套完整的前端开发辅助工具集，涵盖：

✅ DOM 操作  
✅ 事件监听（Resize / Mutation）  
✅ 数据转换与校验  
✅ 模板引擎  
✅ 异步流处理  
✅ 音频播放  
✅ 调试与日志  
✅ 移动适配  
✅ 组件通信机制  

适合用于构建模块化、响应式的 Web 应用或微前端组件系统。

---

> ✅ **建议改进项**
> - 修复 `obj_fmtstr` 和 `Observable.get()` 中的变量名错误
> - 优化 `schedule_interval` 的递归绑定问题
> - 替换 `element_from_html` 的实现方式
> - 文档补充各组件依赖关系图

--- 

📄 *文档版本：v1.0*  
📅 *最后更新：2025年4月5日*