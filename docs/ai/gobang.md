# GobangPoint

控件功能：表示五子棋棋盘中的一个棋位点，根据状态显示为空、黑子或白子，并支持鼠标悬停效果。  
类型：普通控件  
父类控件：`bricks.Image`

## 初始化参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `p_status` | Number | 棋位状态：0 表示空，1 表示黑子，2 表示白子 |
| `p_x` | Number | 水平位置，取值范围为 1 到 15 |
| `p_y` | Number | 垂直位置，取值范围为 1 到 15 |
| `tip` | String (可选) | 鼠标提示文本 |

> 注：构造函数会自动调用 `calc_url()` 根据位置和状态生成对应的图片路径，并通过 `set_url()` 设置图像源。

## 主要事件

- **`mouseover`**  
  当鼠标进入控件区域时触发，调用 `set_current_position(true)`，设置当前坐标高亮样式（添加 `curpos` CSS 类）。

- **`mouseout`**  
  当鼠标离开控件区域时触发，调用 `set_current_position(false)`，移除高亮样式。

---

# Gobang

控件功能：实现一个 15×15 的五子棋游戏界面容器，负责渲染棋盘、管理棋位状态、响应玩家回合逻辑。  
类型：容器控件  
父类控件：`bricks.VBox`

## 初始化参数

无显式外部传参，内部初始化如下：

- 自动创建一个 `Filler` 占位控件用于自适应布局
- 创建并渲染一个 15×15 的棋盘点阵（使用 `GobangPoint`）
- 绑定窗口尺寸变化响应，动态调整每个棋格大小以保持正方形且填满可用空间

## 主要事件

- **`element_resize`（绑定在 `filler` 上）**  
  当 `filler` 的 DOM 元素尺寸发生变化时触发，调用 `resize_area()` 方法重新计算每个棋格的宽高，确保棋盘等比缩放适配容器。

### 自定义方法说明

- `render_empty_area()`  
  初始化并渲染空白棋盘，创建嵌套的 `VBox` 和 `HBox` 结构来排列 15×15 的 `GobangPoint` 实例，并存储于 `this.area[i][j]` 中供后续操作。

- `resize_area()`  
  根据 `filler` 的实际尺寸动态计算每个棋格的大小（取最小边长除以 15），并对所有 `GobangPoint` 设置统一的宽高样式。

- `inform_go(party)`  
  （当前为空实现）用于通知指定方（如 `'black'` 或 `'white'`）进行下一步操作，可用于集成 AI 或网络对战逻辑。

> 注：该控件通过 `bricks.Factory.register('Gobang', bricks.Gobang);` 注册，可在模板中以 `<widget type="Gobang"/>` 形式使用。