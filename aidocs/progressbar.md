# `bricks.ProgressBar` 技术文档

```markdown
# bricks.ProgressBar

`bricks.ProgressBar` 是一个基于 `bricks.HBox` 的进度条组件，用于在用户界面中可视化显示任务的完成进度。它通过 CSS 样式控制外观，并支持动态设置当前进度值。

---

## 继承关系

- **继承自**: `bricks.HBox`
- **注册名称**: `'ProgressBar'`（通过 `bricks.Factory` 注册）

---

## 构造函数

### `new ProgressBar(opts)`

创建一个进度条实例。

#### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `opts` | Object | 配置选项对象 |

##### 可选配置项 (`opts`)

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `total_value` | Number | `100`（隐式） | 进度条的总值，用于计算百分比 |
| `bar_cwidth` | Number | `2` | 进度条的高度（以字符行为单位），影响内部文本控件的高度 |

> ⚠️ 注意：`total_value` 在当前代码中未被实际读取或存储，逻辑上应传入并在 `set_value` 中使用。

#### 实现细节

- 调用父类构造函数 `super(opts)`。
- 设置容器的 CSS 类名为 `progress-container`。
- 创建一个 `bricks.Text` 实例作为进度条填充部分：
  - 初始文本为 `'0%'`
  - 高度由 `bar_cwidth` 决定（默认为 2 行高）
  - 添加 CSS 类 `progress-bar`
- 将该文本控件添加到布局中。

---

## 方法

### `set_value(v)`

设置当前进度值并更新进度条的视觉表现。

#### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `v` | Number | 当前进度值（应小于等于 `total_value`） |

#### 实现逻辑

> ❗ 存在 Bug：以下变量未定义或命名错误！

```js
var pzt = (current / total) * 100;
pzt = Math.max(0, Math.min(100, percentage));
```

- `current` 和 `total` 未声明。
- `percentage` 变量不存在，应为 `pzt`。
- 正确逻辑应基于输入参数 `v` 和预设的 `total_value` 计算百分比。

✅ **建议修正版本**：

```js
set_value(v) {
    const total = this.total_value || 100;
    let percentage = (v / total) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    this.text_w.set_style('width', percentage + '%');
}
```

此外，应在构造函数中保存 `this.total_value = opts.total_value || 100;`。

---

## 事件

当前组件未定义任何自定义事件。

---

## 样式类

| CSS 类名 | 应用元素 | 用途 |
|---------|----------|------|
| `progress-container` | 容器（HBox） | 包裹整个进度条的外层样式 |
| `progress-bar` | 文本控件（填充条） | 控制进度条填充部分的样式，通常配合 `width` 动态调整 |

> 建议在 CSS 中定义 `.progress-bar` 为块级元素，具有背景色、过渡动画等效果。

---

## 使用示例

```js
const progressBar = new bricks.ProgressBar({
    total_value: 200,
    bar_cwidth: 3
});

// 添加到某个容器
someContainer.add_widget(progressBar);

// 更新进度
progressBar.set_value(50);  // 显示 25%
progressBar.set_value(100); // 显示 50%
```

---

## 已知问题与改进建议

1. ✅ **Bug**: `set_value` 方法中使用了未定义的变量 `current`, `total`, `percentage`。
2. ✅ **缺少属性初始化**：`total_value` 应在构造函数中保存。
3. 🔧 **功能扩展建议**：
   - 支持显示百分比数字文本。
   - 提供 `get_value()` 方法。
   - 支持事件通知（如 `onchange`）。
4. 🎨 **样式建议**：
   - 使用 Flexbox 布局确保进度条拉伸一致。
   - 添加边框和圆角提升视觉体验。

---

## 注册信息

通过工厂注册，可在模板或动态创建中使用字符串标识：

```js
bricks.Factory.register('ProgressBar', bricks.ProgressBar);
```

--- 

> **备注**：请修复 `set_value` 中的变量引用错误以确保组件正常工作。
```