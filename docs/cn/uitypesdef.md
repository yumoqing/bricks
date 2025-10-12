# Bricks UI 类型定义与构建系统技术文档

本文档描述了 `bricks.UiTypesDef` 类及其相关工厂函数和构建器，用于实现基于 `uitype` 的视图（View）和输入控件（Input）的动态创建机制。该系统支持灵活扩展不同数据类型的 UI 表现形式。

---

## 目录

- [1. 概述](#1-概述)
- [2. 核心类：UiTypesDef](#2-核心类uitypesdef)
  - [构造函数](#constructoropts)
  - [set(uitype, viewBuilder, inputBuilder)](#setuitype-viewbuilder-inputbuilder)
  - [get(uitype)](#getuitype)
  - [getViewBuilder(uitype)](#getviewbuilderviewbuilder)
  - [getInputBuilder(uitype)](#getinputbuilderinputbuilder)
  - [setViewBuilder(uitype, Builder)](#setviewbuilderviewbuilder)
  - [setInputBuilder(uitype, Builder)](#setinputbuilderinputbuilder)
- [3. 工厂函数](#3-工厂函数)
  - [bricks.viewFactory(desc, rec)](#bricksviewfactorydesc-rec)
  - [bricks.inputFactory(desc, rec)](#bricksinputfactorydesc-rec)
- [4. 内置构建器](#4-内置构建器)
  - [通用辅助函数](#通用辅助函数)
    - [buildText(text, halign)](#buildtexttext-halign)
  - [字符串类型 (`str`)](#字符串类型-str)
    - [strViewBuilder](#strviewbuilder)
    - [strInputBuilder](#strinputbuilder)
  - [密码类型 (`password`)](#密码类型-password)
    - [passwordViewBuilder](#passwordviewbuilder)
    - [passwordInputBuilder](#passwordinputbuilder)
  - [整数类型 (`int`)](#整数类型-int)
    - [intViewBuilder](#intviewbuilder)
  - [浮点数类型 (`float`)](#浮点数类型-float)
    - [floatViewBuilder](#floatviewbuilder)
  - [编码/字典类型 (`code`)](#编码字典类型-code)
    - [codeViewBuilder](#codeviewbuilder)

---

## 1. 概述

`bricks.UiTypesDef` 是一个管理 **UI 类型映射** 的核心类，它将特定的数据类型（如 `str`, `int`, `password` 等）与对应的 **视图构建器（viewBuilder）** 和 **输入构建器（inputBuilder）** 关联起来。

通过注册不同的构建器函数，可以实现对字段描述（`desc`）和记录数据（`rec`）自动生成 UI 控件的能力。

系统提供两个主要工厂函数：
- `viewFactory`: 创建只读文本显示控件
- `inputFactory`: 创建可编辑输入控件

默认情况下，所有未匹配的类型会尝试回退到 `'str'` 类型处理。

---

## 2. 核心类：`UiTypesDef`

```javascript
bricks.UiTypesDef = class {
  constructor(opts)
}
```

### `constructor(opts)`

初始化 `UiTypesDef` 实例。

#### 参数
| 参数名 | 类型 | 说明 |
|-------|------|------|
| `opts` | Object | 可选配置对象（当前未使用） |

#### 属性
- `this.uitypes`: 存储每种 `uitype` 对应的构建器对象，结构如下：
  ```js
  {
    uitype: {
      viewBuilder: Function,
      inputBuilder: Function
    }
  }
  ```

---

### `set(uitype, viewBuilder, inputBuilder)`

注册一个 UI 类型的视图和输入构建器。

#### 参数
| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| `uitype` | String | 是 | UI 类型名称，例如 `'str'`, `'int'` |
| `viewBuilder` | Function | 否 | 用于生成只读视图的函数 |
| `inputBuilder` | Function | 否 | 用于生成可编辑输入控件的函数 |

> 若对应 `uitype` 尚未存在，则自动创建容器对象。

---

### `get(uitype)`

获取指定 `uitype` 的 `[viewBuilder, inputBuilder]` 数组。

#### 返回值
- 成功时返回 `[viewBuilder, inputBuilder]`
- 失败时返回 `(null, null)`（注意：原代码有误，实际返回 `[null, null]` 更合理）

#### 示例
```js
const [viewFn, inputFn] = bricks.uitypesdef.get('str');
```

---

### `getViewBuilder(uitype)`

获取指定类型的视图构建器函数。

#### 参数
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `uitype` | String | 要查询的 UI 类型 |

#### 返回值
- `Function`：视图构建器
- 若不存在则返回 `undefined`

> ⚠️ 注意：原代码中若找不到返回的是 `this.uitypes[uitype].viewBuilder`，即可能为 `undefined`，但注释写成返回 `Null`，可能是笔误。

---

### `getInputBuilder(uitype)`

获取指定类型的输入构建器函数。

#### 参数
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `uitype` | String | 要查询的 UI 类型 |

#### 返回值
- `Function`：输入构建器
- 若不存在则返回 `Null`（注意：JavaScript 中应为 `null`，而非首字母大写的 `Null` —— 原代码此处可能存在错误）

---

### `setViewBuilder(uitype, Builder)`

仅设置某个 `uitype` 的视图构建器。

#### 参数
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `uitype` | String | UI 类型 |
| `Builder` | Function | 视图构建函数 |

> 如果该 `uitype` 无条目，则先初始化空对象。

---

### `setInputBuilder(uitype, Builder)`

仅设置某个 `uitype` 的输入构建器。

#### 参数
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `uitype` | String | UI 类型 |
| `Builder` | Function | 输入构建函数 |

> 同上，若不存在则先创建占位对象。

---

## 3. 工厂函数

### `bricks.viewFactory(desc, rec)`

根据字段描述和数据记录生成对应的只读视图组件。

#### 参数
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `desc` | Object | 字段描述对象，必须包含 `.uitype` 和 `.name` |
| `rec` | Object | 数据记录对象，字段值从中提取 |

#### 流程
1. 提取 `desc.uitype`
2. 查找注册的 `viewBuilder`
3. 若未找到，尝试使用 `'str'` 类型作为默认 fallback
4. 若仍无 builder，返回 `Null`（⚠️ 应为 `null`）
5. 调用 builder 生成控件并返回

#### 返回值
- UI 控件实例（如 `Text` 组件），或 `null`

#### 示例
```js
const widget = bricks.viewFactory({ uitype: 'int', name: 'age' }, { age: 25 });
// 返回右对齐的文本 "25"
```

---

### `bricks.inputFactory(desc, rec)`

生成可编辑的输入控件。

#### 参数
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `desc` | Object | 字段描述 |
| `rec` | Object | 当前数据记录 |

#### 流程
1. 获取 `uitype`
2. 查找 `inputBuilder`，失败则 fallback 到 `'str'`
3. 若无 builder，返回 `Null`（⚠️ 同样应为 `null`）
4. 调用 builder 并返回结果

#### 返回值
- 输入控件实例（如 `UiStr`, `UiPassword`），或 `null`

#### 示例
```js
const input = bricks.inputFactory({ uitype: 'password', name: 'pwd' }, {});
// 返回 UiPassword 控件
```

---

## 4. 内置构建器

### 通用辅助函数

#### `buildText(text, halign)`

创建一个标准化的文本控件。

##### 参数
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `text` | String | 显示文本内容 |
| `halign` | String | 水平对齐方式，仅支持 `'left'` 或 `'right'`，其他值默认为 `'left'` |

##### 返回值
- `Text` 实例，具有以下属性：
  ```js
  {
    text: text || '',
    overflow: 'hidden',
    wrap: true,
    halign: 'left' // 固定左对齐？注意这里硬编码了 left！
  }
  ```
> ❗ 注意：尽管参数允许传入 `halign`，但在构造 `Text` 时却固定写死为 `'left'`，这可能导致逻辑不一致！

建议修正为：
```js
halign: halign // 而非 'left'
```

---

### 字符串类型 (`str`)

#### `strViewBuilder(desc, rec)`

生成字符串类型的只读视图。

##### 实现
- 从 `rec[desc.name]` 取值
- 使用 `buildText(v, 'left')` 显示，左对齐

##### 注册
```js
bricks.uitypesdef.setViewBuilder('str', strViewBuilder);
```

#### `strInputBuilder(desc, rec)`

生成字符串输入控件。

##### 实现
- 设置 `desc.value` 为当前字段值（⚠️ 原代码中 `desc[value]` 存在语法错误！应为 `desc.value`）
- 返回 `new UiStr(desc)`

##### 错误提示
```js
desc[value] = v; // ❌ 语法错误！value 未定义
```
✅ 正确应为：
```js
desc.value = v;
```

##### 注册
```js
bricks.uitypesdef.setInputBuilder('str', strInputBuilder);
```

---

### 密码类型 (`password`)

#### `passwordViewBuilder(desc, rec)`

显示掩码文本 `******`，保护隐私。

##### 实现
- 忽略真实值，始终显示六个星号
- 调用 `buildText('******')`

##### 注册
```js
bricks.uitypesdef.setViewBuilder('password', passwordViewBuilder);
```

#### `passwordInputBuilder(desc, rec)`

生成密码输入框。

##### 实现
- 直接返回 `new UiPassword(desc)`
- 不依赖 `rec` 值（由组件自身管理）

##### 注册
```js
bricks.uitypesdef.setInputBuilder('password', passwordInputBuilder);
```

---

### 整数类型 (`int`)

#### `intViewBuilder(desc, rec)`

将数值转为字符串，并右对齐显示。

##### 实现
- `v = rec[desc.name] + ''`（强制转字符串）
- 调用 `buildText(v, 'right')`

##### 注册
```js
bricks.uitypesdef.setViewBuilder('int', intViewBuilder);
```

---

### 浮点数类型 (`float`)

#### `floatViewBuilder(desc, rec)`

格式化浮点数，保留小数位后显示。

##### 参数扩展
- `desc.dec_len`：指定小数位数，默认为 `2`

##### 实现
```js
v = rec[desc.name];
v = v.toFixed(desc.dec_len || 2); // 格式化
v = v + ''; // 转字符串
return buildText(v, 'right'); // 右对齐
```

##### 注册
```js
bricks.uitypesdef.setViewBuilder('float', floatViewBuilder);
```

---

### 编码/字典类型 (`code`)

适用于下拉选择、字典项等场景的只读显示。

#### `codeViewBuilder(desc, rec)`

##### 参数处理
- 克隆 `desc` 为 `opts`
- 若存在 `uiparams`，将其属性合并到 `opts`
- 支持两个字段名优先级：
  1. `textFeild`（拼写疑似错误，应为 `textField`）
  2. `valueField`

##### 查找逻辑
```js
v = rec[desc.textFeild || 'text']
if (!v) v = rec[desc.valueField || 'value']
```

> ⚠️ 注意：`textFeild` 很可能是拼写错误，应为 `textField`

##### 显示
- 左对齐文本控件

##### 注册
```js
bricks.uitypesdef.setViewBuilder('code', codeViewBuilder);
```

---

## 已知问题与改进建议

| 问题 | 说明 | 建议修复 |
|------|------|---------|
| `desc[value] = v` | JavaScript 语法错误 | 改为 `desc.value = v` |
| `return Null` | 非法标识符（应为 `null`） | 所有 `Null` → `null` |
| `halign:'left'` in `buildText` | 忽略参数，始终左对齐 | 改为 `halign: halign` |
| `textFeild` 拼写错误 | 可能导致字段无法正确识别 | 改为 `textField` |
| 默认 fallback 使用 `'str'` | 合理但需确保 `'str'` 已注册 | 初始化时必须保证基础类型存在 |

---

## 总结

本模块实现了基于 `uitype` 的 UI 构建策略模式，具备良好的扩展性：

- 新增类型只需调用 `setViewBuilder` / `setInputBuilder`
- 工厂函数统一接口调用
- 支持 fallback 机制增强健壮性

适合用于表单渲染、列表展示等需要动态 UI 生成的场景。

--- 

> ✅ **维护建议**：增加类型校验、异常捕获、单元测试以提升稳定性。