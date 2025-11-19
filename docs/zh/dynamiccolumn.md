# DynamicColumn

控件功能：动态列布局容器，根据屏幕尺寸和配置自动调整网格列数与列宽，适用于响应式布局场景。  
类型：容器控件  
父类控件：Layout

## 初始化参数

| 参数名       | 类型   | 说明 |
|--------------|--------|------|
| `col_cwidth` | Number | （可选）每列的字符宽度单位（基于 `charsize`），用于计算列宽。若未设置且无 `col_width`，默认为 20。 |
| `col_width`  | Number | （可选）每列的固定像素宽度。优先级低于 `col_cwidth`。 |
| `col_cgap`   | Number | （可选）列之间的间隙大小（以 `charsize` 为单位），默认值为 `0.5`。 |
| `mobile_cols`| Number | （可选）在移动端竖屏模式下强制使用的列数，默认值为 `1`。 |

> 注意：如果 `col_cwidth` 和 `col_width` 都未提供，则 `col_cwidth` 默认设为 20。

## 主要事件

- **`on_parent`**  
  当控件被添加到父容器时触发，用于初始化或重新计算列宽。

- **`resize`**  
  浏览器窗口尺寸变化时触发，动态调整 `gridTemplateColumns` 和 `gap` 以适应新尺寸。

- **`charsize`**（来自 `bricks.app`）  
  字符尺寸发生变化时触发（通常因字体或缩放改变），用于重新计算基于字符单位的列宽和间隙。
