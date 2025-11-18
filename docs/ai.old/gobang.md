# GobangPoint

用于表示围棋棋盘上的一个交叉点，根据状态（空、黑子、白子）动态加载对应图片资源。继承自 `bricks.Image`，属于**普通控件**。

## 主要方法

- `calc_url()`  
  根据当前点的坐标 `(p_x, p_y)` 和状态 `p_status` 计算应显示的图片路径。规则如下：
  - 坐标边缘情况：上下左右用 `'t'`, `'b'`, `'l'`, `'r'` 表示，中间为 `'c'`
  - 状态映射：0 → `'empty'`，1 → `'black'`，2 → `'white'`
  - 图片命名格式：`imgs/[vpos][hpos]_[status].png`，例如 `imgs/cl_black.png`

- `getValue()`  
  返回该点的状态对象，包含：
  ```js
  {
    status: this.p_status,
    x: this.p_x,
    y: this.p_y
  }
  ```
  可用于获取棋子位置和颜色信息。

- `str()`  
  返回该点的字符串表示，格式为 `(status,x,y)`，主要用于调试输出。

- `set_current_position(flg)`  
  鼠标移入时设置 CSS 类 `curpos` 为 false（实际是通过 `!flg` 控制），可用于高亮当前悬停位置（需配合样式定义）。

## 主要事件

- `mouseover`  
  触发时调用 `set_current_position(true)`，可用来实现悬停视觉反馈。

- `mouseout`  
  触发时调用 `set_current_position(false)`，取消悬停效果。

## 源码例子

```json
{
  "id": "point_3_4",
  "widgettype": "GobangPoint",
  "options": {
    "p_status": 0,        // 当前状态：0=空，1=黑，2=白
    "p_x": 3,             // 横向坐标，范围 1-15
    "p_y": 4,             // 纵向坐标，范围 1-15
    "tip": "(3,4)"        // 提示文本，鼠标悬停时显示
  },
  "binds": [
    {
      "actiontype": "method",
      "wid": "point_3_4",
      "event": "click",
      "target": "game_controller",  // 假设存在游戏控制器组件
      "method": "makeMove",
      "params": {
        "datawidget": "point_3_4",
        "datamethod": "getValue"   // 调用 getValue 获取坐标与状态
      }
    }
  ]
}
```

> ✅ **注释说明**：
> - 此控件通过 `p_status`, `p_x`, `p_y` 构造参数决定其外观。
> - 使用 `binds` 在点击时将自身数据传递给主控制器进行落子逻辑处理。
> - 图片资源路径由 `calc_url()` 自动生成，依赖于项目中 `/imgs/` 目录下的切图资源。

---

# Gobang

代表一个完整的围棋对弈界面控件，管理15×15的棋盘点阵，并支持响应式布局调整。继承自 `bricks.VBox`，属于**容器控件**。

## 主要方法

- `render_empty_area()`  
  创建15×15的 `GobangPoint` 网格并填充到内部的 `VBox` 中，初始状态均为“空”。使用嵌套循环生成行列结构，并保存引用至 `this.area[i][j]` 数组以便后续操作。

- `resize_area()`  
  根据父容器尺寸自动缩放每个棋盘点的大小。取 `filler` 容器宽高中较小值除以15作为单个格子尺寸，确保棋盘等比适应窗口变化。

- `inform_go(party)`  
  （目前为空实现）预留方法，用于通知轮到哪一方下棋（如 `'black'` 或 `'white'`），可用于AI触发或状态提示。

## 主要事件

- `element_resize`（来自 `Filler` 子控件）  
  当填充区域尺寸改变时触发，自动调用 `resize_area()` 方法重绘棋盘格子大小，实现自适应布局。

## 源码例子

```json
{
  "id": "gobang_game",
  "widgettype": "Gobang",
  "options": {},
  "subwidgets": [],  // 实际上在构造函数中动态创建，无需在 JSON 中显式列出
  "binds": [
    {
      "actiontype": "script",
      "wid": "gobang_game",
      "event": "load",  // 假设框架支持 load 事件
      "script": "console.log('围棋游戏已加载完成');"
    },
    {
      "actiontype": "method",
      "wid": "some_button",
      "event": "click",
      "target": "gobang_game",
      "method": "inform_go",
      "params": {
        "party": "black"
      }
    }
  ]
}
```

> ✅ **注释说明**：
> - `Gobang` 是一个复合容器控件，在初始化时通过代码动态构建子控件网格（`GobangPoint`），因此 `subwidgets` 在 JSON 中留空。
> - 使用 `Filler` 占位并监听其 `element_resize` 事件，实现响应式设计。
> - 可扩展绑定外部按钮来控制回合切换，未来可集成 AI 对手或网络对战功能。
> - 若需远程加载此游戏模块，可用 `urlwidget` 方式按需加载。

--- 

📌 **总结建议**：  
以上两个控件共同构成一个可交互、可扩展的围棋界面基础。`GobangPoint` 封装视觉与状态逻辑，`Gobang` 负责整体布局与协调。结合 bricks 的模块化能力（如 `urlwidget` 动态加载），非常适合开发复杂交互类 Web 应用。