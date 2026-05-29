# `bricks.MiniForm` 技术文档

> **MiniForm** 是一个基于 `bricks.HBox` 的轻量级表单组件，用于动态切换和输入不同字段的数据。它支持通过下拉选择器快速切换输入项，并实时触发输入事件。

---

## 概述

`bricks.MiniForm` 类继承自 `bricks.HBox`，提供了一个紧凑的表单界面，适用于需要在多个输入字段之间快速切换的场景（如搜索框、参数配置等）。该组件包含：

- 一个下拉选择器（用于选择当前字段）
- 一个动态输入控件（根据所选字段类型自动创建）
- 支持自定义字段属性和默认值
- 可扩展的输入事件机制

---

## 继承关系

```
bricks.HBox
    └── bricks.MiniForm
```

---

## 构造函数

```js
new bricks.MiniForm(options)
```

### 参数

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| `options` | Object | ✅ | 配置对象，结构如下 |

#### `options` 结构

| 属性 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| `defaultname` | String | ❌ | 第一个字段的 `name` | 默认激活的字段名称 |
| `label_width` | String/Number | ❌ | - | 标签列宽度（可被字段级覆盖） |
| `input_width` | String/Number | ❌ | - | 输入框宽度（可被字段级覆盖） |
| `params` | Object | ❌ | `{}` | 固定附加参数，在 `getValue()` 中返回 |
| `fields` | Array&lt;Object&gt; | ✅ | - | 字段定义数组，每个字段包含以下子属性 |

##### `fields[i]` 字段定义

| 属性 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `name` | String | ✅ | 字段唯一标识符（如：`"username"`） |
| `label` | String | ✅ | 显示名称（出现在下拉列表中） |
| `icon` | String | ❌ | 图标类名（可选，用于视觉增强） |
| `uitype` | String | ✅ | 控件类型（如 `"text"`, `"number"`, `"code"` 等），需与 `Input.factory` 兼容 |
| `uiparams` | Object | ❌ | 传递给具体输入控件的额外配置参数 |

---

## 示例配置

```js
var miniForm = new bricks.MiniForm({
    defaultname: 'email',
    params: { action: 'search' },
    fields: [
        {
            name: 'username',
            label: '用户名',
            uitype: 'text',
            uiparams: { placeholder: '请输入用户名' }
        },
        {
            name: 'email',
            label: '邮箱',
            uitype: 'text',
            uiparams: { type: 'email', placeholder: '请输入邮箱' }
        },
        {
            name: 'count',
            label: '数量',
            uitype: 'number',
            uiparams: { min: 1, max: 100 }
        }
    ]
});
```

---

## 方法说明

### `constructor(opts)`

初始化 MiniForm 实例并调用 `build()`。

#### 行为：
- 设置容器宽高为 `'auto'`
- 调用父类构造函数
- 执行 `build()` 构建 UI

---

### `build()`

构建整个组件的 UI，包括选项选择器和初始输入控件。

#### 步骤：
1. 确定默认字段名（优先使用 `defaultname`，否则取第一个字段）
2. 调用 `build_options()` 创建下拉选择器
3. 调用 `build_widgets(name)` 初始化对应输入控件

---

### `build_options()`

创建一个下拉选择控件（`this.choose`），允许用户切换当前编辑的字段。

#### 使用 `Input.factory` 创建的选择器配置：
```js
{
    width: "90px",
    name: "name",
    uiType: "code", // 假设为下拉或代码选择器
    valueField: 'name',   // 绑定值为字段的 name
    textField: 'label',   // 显示文本为 label
    data: this.opts.fields
}
```

> ⚠️ 注：`uiType: "code"` 可能表示一种特殊下拉控件，实际应确保其行为符合预期（例如 ComboBox 或 Select）。

绑定事件：`changed` → `change_input(e)`

---

### `build_widgets(name)`

根据指定字段名动态创建对应的输入控件。

#### 参数：
- `name`: 字段名（必须存在于 `fields` 中）

#### 流程：
1. 若已有输入控件，则解绑 `input` 事件
2. 清空当前所有控件
3. 添加选择器控件 `this.choose`
4. 查找匹配字段定义 `f`
5. 复制字段描述并设置 `width: 'auto'`
6. 使用 `Input.factory(desc)` 创建输入控件 `i`
7. 绑定 `input` 事件到 `input_handle`
8. 将新控件加入布局
9. 保存引用至 `this.input`

---

### `change_input(e)`

当下拉选择器值改变时触发，重新构建输入控件。

#### 行为：
- 获取当前选择的字段名 `this.choose.value`
- 调用 `build_widgets(name)` 切换输入控件

---

### `input_handle(e)`

当输入内容发生变化时触发，用于广播事件。

#### 行为：
1. 调用 `getValue()` 获取完整数据
2. 输出调试信息（通过 `bricks.debug`）
3. 触发 `input` 事件，携带数据 `d`

```js
this.dispatch('input', d);
```

> 可通过 `.bind('input', handler)` 监听此事件

---

### `getValue() → Object`

获取当前表单的合并值。

#### 返回值结构：
```js
{
    // 来自 this.opts.params 的固定参数
    action: 'search',
    // 来自当前输入控件的动态值
    username: 'john_doe'
}
```

#### 逻辑：
- 初始化为 `params` 对象（若未设置则为空 `{}`）
- 合并当前输入控件的值（`this.input.getValue()`）
- 使用 `bricks.extend(d, v)` 进行浅合并

---

### `show_options(e)`

显示下拉选择器（调试用途或外部调用）。

#### 行为：
- 输出调试日志
- 调用 `this.choose.show()` 显示选择器

> 主要用于开发调试或定制交互逻辑

---

### `clear_widgets()`

> 📌 注意：此方法未在代码中定义，但被调用。

假设其来自父类 `HBox`，功能为清空所有子控件。

---

## 事件系统

### 支持监听的事件

| 事件名 | 触发时机 | 携带数据 |
|--------|----------|---------|
| `input` | 输入值变化时 | 合并后的表单数据对象 |

#### 示例监听：

```js
miniForm.bind('input', function(data) {
    console.log('Current form data:', data);
    // { action: 'search', username: 'testuser' }
});
```

---

## 工厂注册

```js
bricks.Factory.register('MiniForm', bricks.MiniForm);
```

允许通过工厂模式创建实例：

```js
var form = bricks.Factory.create('MiniForm', options);
```

---

## 设计特点

| 特性 | 说明 |
|------|------|
| ✅ 动态输入切换 | 支持运行时更换输入控件类型 |
| ✅ 模块化结构 | 基于 `Input.factory` 实现控件解耦 |
| ✅ 可扩展性 | 支持任意 `uitype` 和 `uiparams` |
| ✅ 事件驱动 | 提供标准 `input` 事件接口 |
| ⚠️ 宽度控制有限 | 当前 `label_width` / `input_width` 未完全实现（可能依赖样式或其他机制） |

---

## 注意事项

1. **`Input.factory` 依赖**  
   必须确保 `Input.factory` 支持所有声明的 `uitype` 类型。

2. **`objcopy()` 函数**  
   代码中使用了 `objcopy(f)`，应确保全局存在此工具函数（通常为对象深拷贝或浅拷贝）。

3. **`bricks.extend`**  
   用于合并对象，类似 jQuery 的 `$.extend` 或 Lodash 的 `_.assign`。

4. **UI 渲染顺序**  
   每次切换字段都会重建输入控件，适合字段较少的场景；高频切换可能影响性能。

5. **样式兼容性**  
   推荐配合 CSS 设置 `.bricks-miniform` 或相关类以优化布局。

---

## 调试支持

启用调试模式后，会输出以下信息：

- `show_options()` 调用记录
- `input_handle()` 中的实时数据

可通过 `bricks.debug = console.log` 启用。

---

## 总结

`bricks.MiniForm` 是一个简洁高效的动态表单组件，特别适用于：

- 多条件搜索栏
- 快捷参数输入
- 动态配置面板

结合 `bricks` 框架的输入控件体系，能够快速搭建灵活的用户界面。

--- 

✅ **推荐使用场景**：工具条、查询过滤器、快捷操作面板  
🔧 **可优化方向**：缓存输入控件实例、支持更多布局配置、增加验证机制