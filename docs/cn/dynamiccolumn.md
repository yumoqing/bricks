# `DynamicColumn` 组件技术文档

> **模块路径**: `bricks.DynamicColumn`  
> **继承自**: `bricks.Layout`  
> **用途**: 一个响应式网格布局组件，根据屏幕尺寸动态调整列数和列宽，适用于桌面与移动端。

---

## 概述

`DynamicColumn` 是 Bricks UI 框架中的一个布局类，用于创建基于 CSS Grid 的**动态列布局**。它能够根据设备类型（移动端或桌面端）、字符单位（`charsize`）以及配置参数自动计算并设置网格的列宽与间距，实现响应式设计。

该组件特别适合用于卡片列表、内容流等需要自适应列数的场景。

---

## 构造函数

```js
new bricks.DynamicColumn(options)
```

### 参数

| 参数名         | 类型     | 必填 | 默认值 | 描述 |
|----------------|----------|------|--------|------|
| `col_cwidth`   | Number   | 否   | 根据 `col_width` 推导 | 列宽度（以字符单位 `charsize` 为基准）。例如：20 表示 20 个字符宽度。 |
| `col_width`    | Number   | 否   | —      | 固定列宽度（像素值）。若未提供 `col_cwidth`，则使用此值。 |
| `col_cgap`     | Number   | 否   | `0.5`  | 列之间的间隙（以 `charsize` 为单位）。 |
| `mobile_cols`  | Number   | 否   | `1`    | 在移动设备竖屏模式下强制显示的列数。 |

> ⚠️ 注意：
> - 若未传入 `col_cwidth` 且未传入 `col_width`，则默认 `col_cwidth = 20`。
> - 所有参数均可通过构造选项对象传入。

### 示例

```js
const layout = new bricks.DynamicColumn({
  col_cwidth: 25,     // 每列宽 25ch
  col_cgap: 0.8,      // 列间距 0.8ch
  mobile_cols: 1      // 移动端强制单列
});
```

---

## 方法说明

### `set_column_width()`

重新计算并设置当前容器的 `gridTemplateColumns` 和 `gap` 样式属性，实现动态列宽适配。

#### 逻辑流程

1. 获取当前应用的字符大小 `bricks.app.charsize`。
2. 计算列间间隙：`gap = charsize × col_cgap`。
3. 获取当前视口宽高：`screenWidth()` 与 `screenHeight()`。
4. 判断是否为移动端竖屏：
   - 如果是，则使用 `mobile_cols` 固定列数，并均分可用宽度；
   - 否则：
     - 优先使用 `col_cwidth` × `charsize` 作为最小列宽；
     - 其次回退到 `col_width` 像素值。
5. 设置 CSS Grid 属性：
   ```css
   grid-template-columns: repeat(auto-fill, minmax(cw + "px", 1fr));
   gap: gap + "px";
   ```

#### 触发时机

该方法会在以下事件中被自动调用：

- 组件绑定到父元素时 (`on_parent`)
- 窗口尺寸变化时 (`resize`)
- 字符单位发生变化时 (`charsize` 事件，前提是实例具有 `cwidth` 属性)

---

## 样式行为

| CSS 属性 | 值 | 说明 |
|---------|-----|------|
| `display` | `grid` | 强制启用 CSS Grid 布局 |
| `grid-template-columns` | `repeat(auto-fill, minmax(cw, 1fr))` | 自动填充列，每列至少 `cw` 宽度，最多扩展至 1fr |
| `gap` | 动态计算的像素值 | 列与行之间的间距（由 `col_cgap` × `charsize` 决定） |

> ✅ 提示：使用 `auto-fill` 能确保在空间足够时自动添加新列，无需手动管理断点。

---

## 响应式策略

| 设备环境       | 判断条件                        | 行为 |
|----------------|----------------------------------|------|
| 移动端竖屏     | `bricks.is_mobile() && width < height` | 使用 `mobile_cols` 固定列数，宽度均分 |
| 桌面/横屏设备 | 其他情况                         | 使用 `col_cwidth` 或 `col_width` 作为最小列宽，启用 `minmax` 自动换行 |

---

## 注册信息

```js
bricks.Factory.register('DynamicColumn', bricks.DynamicColumn);
```

可通过工厂方式创建实例：

```js
bricks.Factory.create('DynamicColumn', { ...options });
```

---

## 使用建议

### 推荐搭配
- 配合 `bricks.Container` 或其他 `Layout` 子类作为子项使用。
- 结合 `charsize` 变化监听，实现字体缩放下的布局同步更新。

### 性能提示
- 避免频繁触发 `set_column_width`，组件已对 `resize` 和 `charsize` 做了事件绑定优化。
- 如需禁用字符单位监听，可避免设置 `this.cwidth` 属性。

---

## 示例代码

```js
// 创建一个动态列布局，每列约 20 字符宽，间隔 1ch
const dynamicCol = new bricks.DynamicColumn({
  col_cwidth: 20,
  col_cgap: 1,
  mobile_cols: 1
});

// 添加一些内容
['Item 1', 'Item 2', 'Item 3'].forEach(text => {
  const item = new bricks.Label({ text });
  dynamicCol.append(item);
});

// 插入 DOM
document.body.appendChild(dynamicCol.dom_element);
```

---

## 浏览器兼容性

✅ 支持所有现代浏览器（Chrome, Firefox, Safari, Edge）  
⚠️ 需要支持 CSS Grid Layout Level 1

---

## 版本历史

| 版本 | 修改内容 |
|------|----------|
| 1.0  | 初始实现，支持字符单位驱动的动态列布局 |

---

## 相关类

- [`bricks.Layout`](./Layout.md) - 基础布局类
- [`bricks.app`](../core/app.md) - 应用上下文，提供 `charsize`, `screenWidth()` 等工具
- [`bricks.is_mobile()`](../utils/is_mobile.md) - 设备检测工具函数

--- 

📝 **维护者**: Bricks UI Team  
📅 **最后更新**: 2025-04-05