# Bricks RegisterFunction 模块技术文档

---

## 概述

`RegisterFunction` 是 `bricks` 命名空间下的一个轻量级函数注册与管理类，用于在全局环境中注册、存储和获取函数。它提供了一种集中式的方式来管理可复用或动态调用的函数，适用于插件系统、事件处理器注册、模块化功能扩展等场景。

该模块通过 `bricks.RF` 实例暴露给全局使用，确保函数注册的统一访问接口。

---

## 代码结构

```javascript
var bricks = window.bricks || {};

class RegisterFunction {
    constructor() {
        this.rfs = {};
    }

    register(n, f) {
        this.rfs[n] = f;
    }

    get(n) {
        try {
            return this.rfs[n];
        } catch (e) {
            return null;
        }
    }
}

bricks.RF = new RegisterFunction();
```

---

## 核心类：`RegisterFunction`

### 构造函数 `constructor()`

初始化一个空的对象 `this.rfs`，用于存储注册的函数。

#### 示例：
```js
const rf = new RegisterFunction(); // this.rfs = {}
```

---

### 方法：`register(n, f)`

将一个函数 `f` 注册到名称 `n` 下。

#### 参数：
- `n` (string | number): 函数的唯一标识名称（键名）。
- `f` (Function): 要注册的函数。

#### 行为：
- 将 `f` 存储在 `this.rfs` 对象中，以 `n` 作为键。
- 若已存在同名键，则覆盖原值。

#### 示例：
```js
function greet() {
    console.log("Hello!");
}

bricks.RF.register('greet', greet);
```

---

### 方法：`get(n)`

根据名称 `n` 获取已注册的函数。

#### 参数：
- `n` (string | number): 要获取的函数的名称。

#### 返回值：
- 如果存在对应的函数，返回该函数；
- 如果不存在或发生异常，返回 `null`。

> ⚠️ 注意：尽管 `try-catch` 被使用，但在 JavaScript 中直接访问对象属性不会抛出异常（除非对象被冻结或有 getter 抛错）。因此这里的 `try-catch` 属于防御性编程，实际多数情况下非必需。

#### 示例：
```js
const greetFn = bricks.RF.get('greet');
if (greetFn) {
    greetFn(); // 输出: Hello!
}
```

---

## 全局实例：`bricks.RF`

通过以下语句创建并暴露全局唯一的 `RegisterFunction` 实例：

```js
bricks.RF = new RegisterFunction();
```

此实例可在全局范围内通过 `bricks.RF` 访问，实现跨模块的函数注册与调用。

---

## 使用示例

### 注册多个函数
```js
bricks.RF.register('log', msg => console.log(msg));
bricks.RF.register('add', (a, b) => a + b);
```

### 调用已注册函数
```js
const log = bricks.RF.get('log');
log('This is a test message.');

const add = bricks.RF.get('add');
console.log(add(2, 3)); // 输出: 5
```

### 处理未注册函数
```js
const unknown = bricks.RF.get('unknown');
console.log(unknown); // 输出: null
```

---

## 设计特点

| 特性 | 说明 |
|------|------|
| **轻量** | 仅包含两个核心方法，无外部依赖。 |
| **易用** | 接口简洁，便于集成到现有项目中。 |
| **容错处理** | `get()` 方法包含异常捕获，增强健壮性。 |
| **可扩展** | 可基于此类构建更复杂的注册中心（如带命名空间、生命周期管理等）。 |

---

## 注意事项

1. **命名冲突**：注册时使用唯一名称，避免覆盖重要函数。
2. **类型检查缺失**：当前未对传入的 `f` 是否为函数进行校验，建议调用前自行验证。
3. **性能考虑**：底层基于普通对象存储，适合中小型注册场景；高频读写可考虑 `Map` 结构优化。

---

## 改进建议（可选）

```js
// 增强版 register：增加函数类型校验
register(n, f) {
    if (typeof f !== 'function') {
        throw new Error(`Expected a function, but got ${typeof f}`);
    }
    this.rfs[n] = f;
}

// 或使用 Map 提升性能（尤其在大量条目时）
this.rfs = new Map();
register(n, f) { this.rfs.set(n, f); }
get(n) { return this.rfs.get(n) || null; }
```

---

## 版本信息

- 初始版本：1.0
- 作者：Bricks Framework Team
- 兼容环境：现代浏览器（支持 ES6 Class）

--- 

> 📌 提示：本模块是 `bricks` 工具库的基础组件之一，推荐与其他模块配合使用以发挥最大效能。