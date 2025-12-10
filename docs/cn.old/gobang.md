# `bricks.Gobang` 技术文档

> **五子棋游戏组件** —— 基于 `bricks.js` 框架实现的可交互五子棋界面控件。

---

## 目录

- [概述](#概述)
- [类结构](#类结构)
  - [`bricks.GobangPoint`](#bricksgobangpoint)
  - [`bricks.Gobang`](#bricksgobang)
- [API 参考](#api-参考)
  - [`GobangPoint` 构造函数与方法](#gobangpoint-构造函数与方法)
  - [`Gobang` 构造函数与方法](#gobang-构造函数与方法)
- [事件绑定](#事件绑定)
- [图像资源管理](#图像资源管理)
- [布局与自适应](#布局与自适应)
- [使用示例](#使用示例)

---

## 概述

`bricks.Gobang` 是一个基于 `bricks.js` UI 框架开发的五子棋（Gomoku）游戏界面组件。它包含两个核心类：

- `bricks.GobangPoint`：表示棋盘上的单个格子，用于显示空、黑子或白子状态，并支持鼠标悬停反馈。
- `bricks.Gobang`：主控件，负责构建 15×15 的棋盘布局、管理棋子状态、响应尺寸变化并为后续 AI/玩家逻辑提供接口。

该组件具备良好的可扩展性，可用于人机对战、双人对战或多智能体博弈系统。

---

## 类结构

### `bricks.GobangPoint`

继承自 `bricks.Image`，代表棋盘上一个可交互的点位。

#### 属性说明

| 属性名      | 类型   | 描述 |
|-----------|--------|------|
| `p_status` | Number | 棋子状态：`0`=空, `1`=黑子, `2`=白子 |
| `p_x`      | Number | 横向坐标（列），取值范围 `1–15` |
| `p_y`      | Number | 纵向坐标（行），取值范围 `1–15` |

> 注：坐标系以左上角为 `(1,1)`，右下角为 `(15,15)`。

#### 构造函数

```js
new bricks.GobangPoint({
  p_status: 0,
  p_x: x,
  p_y: y,
  tip: '(x,y)'
})
```

##### 参数

| 参数       | 类型   | 必填 | 说明 |
|----------|--------|------|------|
| `p_status` | Number | 是   | 初始状态 |
| `p_x`      | Number | 是   | X 坐标 |
| `p_y`      | Number | 是   | Y 坐标 |
| `tip`      | String | 否   | 鼠标提示文本，默认为 `(x,y)` |

#### 方法

##### `.calc_url()`

根据当前 `p_status`, `p_x`, `p_y` 计算对应的图片路径。

- 边缘位置使用特定前缀：
  - 上边：`t`
  - 下边：`b`
  - 左边：`l`
  - 右边：`r`
  - 中间区域：`c`

- 状态后缀：
  - `empty`: 空格
  - `black`: 黑子
  - `white`: 白子

**输出格式：**

```
imgs/[one][two]_[state].png
```

例如：`imgs/tl_empty.png`, `imgs/cc_black.png`

> 使用 `bricks_resource(name)` 获取实际资源 URL。

##### `.set_current_position(flg, event)`

处理鼠标进入/离开事件，设置 CSS 类控制视觉高亮。

- `flg === true` → 移除 `curpos` 样式类（显示高亮）
- `flg === false` → 添加 `curpos` 类（取消高亮）

> 实际行为依赖于样式表中 `.curpos` 的定义。

##### `.getValue()`

返回当前点的状态对象。

```js
{
  status: this.p_status,
  x: this.p_x,
  y: this.p_y
}
```

##### `.str()`

调试用字符串输出，格式为 `(status,x,y)`。

---

### `bricks.Gobang`

主游戏容器，继承自 `bricks.VBox`，自动创建 15×15 棋盘。

#### 构造函数

```js
new bricks.Gobang(opts)
```

初始化棋盘，渲染空白格子，并开始第一轮回合（默认黑方先行）。

#### 内部属性

| 属性       | 类型     | 说明 |
|----------|----------|------|
| `filler` | Filler   | 占位容器，用于监听尺寸变化 |
| `area`   | Array[Array[GobangPoint]] | 二维数组，存储所有 `GobangPoint` 实例 |
| `player` | Object   | （预留）玩家配置信息 |

##### 玩家配置结构（未来扩展）

```js
{
  black_player: {
    name: "Player1",
    type: "user", // 或 "llm"
    url: "",      // AI 接口地址
    delay: 1,     // 响应延迟（秒）
    params: {}    // 自定义参数
  },
  white_player: { ... }
}
```

#### 方法

##### `.render_empty_area()`

创建 15×15 的棋盘网格：

- 创建外层垂直盒子 (`VBox`)
- 每行新建一个水平盒子 (`HBox`)
- 在每个格子中添加 `GobangPoint(p_status=0)`
- 将其组织成二维数组 `this.area[i][j]`，其中 `i = p_y - 1`, `j = p_x - 1`

最终将整个棋盘加入 `this.filler` 容器。

##### `.resize_area()`

响应容器大小变化，动态调整每个棋盘点的宽高，保持正方形且填满可用空间。

- 计算最小边长：`Math.min(clientWidth, clientHeight)`
- 单元格尺寸：`size = min_side / 15`
- 遍历 `this.area` 设置每个 `GobangPoint` 的样式宽高

> 绑定在 `filler` 的 `element_resize` 事件上。

##### `.inform_go(party)`

通知某一方落子（如 `'black'` 或 `'white'`）。此方法目前为空，作为钩子供子类或外部逻辑重写。

典型用途：
- 触发 AI 思考
- 更新 UI 提示
- 发送网络请求

---

## 事件绑定

| 元素 | 事件 | 回调 | 说明 |
|------|------|-------|------|
| `GobangPoint` | `mouseover` | `set_current_position(true)` | 显示悬停效果 |
| `GobangPoint` | `mouseout`  | `set_current_position(false)` | 隐藏悬停效果 |
| `filler` | `element_resize` | `resize_area()` | 自动适配棋盘尺寸 |

---

## 图像资源管理

通过 `bricks_resource(name)` 函数加载图像资源。建议准备以下命名规则的 PNG 图片：

```
imgs/
├── tl_empty.png    ── 左上角空格
├── tc_empty.png    ── 上边缘中间空格
├── tr_empty.png    ── 右上角空格
├── cl_empty.png    ── 左边缘中间空格
├── cc_empty.png    ── 中央空格
├── cr_empty.png    ── 右边缘中间空格
├── bl_empty.png    ── 左下角空格
├── bc_empty.png    ── 下边缘中间空格
├── br_empty.png    ── 右下角空格
│
├── **_black.png     ── 所有位置的黑子版本
└── **_white.png     ── 所有位置的白子版本
```

> 共需 9 种位置 × 3 种状态 = 27 张图（若四角合并可减少）。

---

## 布局与自适应

- 使用 `bricks.Filler` 包裹棋盘以监听 DOM 尺寸变化。
- `resize_area()` 方法确保棋盘始终居中并等比缩放。
- 所有点位统一设为正方形，避免拉伸失真。
- 支持响应式设计，在不同屏幕尺寸下正常显示。

---

## 使用示例

```js
// 创建五子棋组件并插入页面
var gobang = new bricks.Gobang({});
document.body.appendChild(gobang.dom_element);

// （可选）手动更改某个点状态
var point = gobang.area[7][7]; // 中心点
point.p_status = 1;
point.set_url(point.calc_url()); // 重新计算图像
```

> 若需集成 AI 对战，请扩展 `inform_go` 方法以调用远程服务或本地模型。

---

## 注册与框架集成

```js
bricks.Factory.register('Gobang', bricks.Gobang);
```

允许通过工厂模式动态创建实例：

```js
var game = bricks.Factory.create('Gobang', {});
```

---

## 待完善功能（TODO）

- ✅ 棋盘渲染与自适应
- ✅ 棋子状态切换
- ⬜ 落子逻辑检测（是否已占用）
- ⬜ 胜负判断（五连珠算法）
- ⬜ 回合控制与玩家切换
- ⬜ AI 对手集成（LLM 或规则引擎）
- ⬜ 悔棋、重新开始等功能按钮

---

## 版权与许可

© 2025 bricks.js 项目组  
本模块遵循 MIT 许可协议，欢迎自由使用与修改。