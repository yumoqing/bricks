# Bricks UI Framework - Popup 组件技术文档

---

## 概述

`bricks.Popup` 是基于 `bricks.VBox` 的弹窗组件，用于创建可浮动、可移动、可调整大小的模态或非模态对话框。它支持自动打开/关闭、点击外部区域自动关闭、内容动态加载等功能。

此外，框架还提供了两个扩展类：
- `bricks.PopupWindow`：带标题栏和控制按钮（最小化、全屏、关闭）的窗口式弹窗。
- `bricks.WindowsPanel`：用于管理多个最小化的窗口列表面板。

该组件适用于构建现代化 Web 应用中的对话框、提示框、应用窗口等交互界面。

---

## 全局命名空间初始化

```js
var bricks = window.bricks || {};
```

确保 `bricks` 命名空间存在，避免覆盖已有对象。

---

## 默认配置方法

### `bricks.get_popup_default_options()`

返回一个包含默认选项的对象，供 `Popup` 使用。

#### 返回值
```js
{
  timeout: 0,
  archor: 'cc',
  auto_open: true,
  auto_dismiss: true,
  auto_destroy: true,
  movable: true,
  resizable: false,
  modal: true
}
```

| 参数 | 类型 | 描述 |
|------|------|------|
| `timeout` | Number | 自动关闭延迟时间（秒），设为 0 表示不自动关闭 |
| `archor` | String | 定位锚点，取值见下表 |
| `auto_open` | Boolean | 是否在实例化后自动打开弹窗 |
| `auto_dismiss` | Boolean | 是否允许点击外部区域关闭弹窗 |
| `auto_destroy` | Boolean | 关闭后是否自动销毁组件 |
| `movable` | Boolean | 是否可拖动 |
| `resizable` | Boolean | 是否可调整大小 |
| `modal` | Boolean | 是否为模态（遮罩其他控件） |

> **`archor` 取值说明**  
> 支持九宫格定位：  
> `'tl'`, `'tc'`, `'tr'`, `'cl'`, `'cc'`, `'cr'`, `'bl'`, `'bc'`, `'br'`  
> 分别表示：左上、中上、右上、左中、居中、右中、左下、中下、右下

---

## 核心类：`bricks.Popup`

继承自 `bricks.VBox`，提供完整的弹窗功能。

### 构造函数：`constructor(opts)`

#### 参数
- `opts` (Object): 配置选项，合并默认配置使用。

#### 内部属性初始化
| 属性 | 类型 | 初始值 | 说明 |
|------|------|--------|------|
| `no_opened` | Boolean | `true` | 是否首次打开 |
| `auto_task` | Task | `null` | 超时任务句柄 |
| `issub` | Boolean | `false` | 是否依附于某个控件显示 |
| `opened` | Boolean | `false` | 当前是否已打开 |
| `content_box` | VBox | 实例 | 内容容器 |
| `content_w` | Widget | `content_box` | 内容承载部件 |
| `moving_w` | Widget | `this` | 可拖动目标（默认整个弹窗） |
| `target_w` | Widget | `bricks.Body` | 目标绑定控件 |
| `moving_status` | Boolean | `false` | 拖拽状态标志 |
| `resize_status` | Boolean | `false` | 缩放状态标志 |

#### 初始化流程
1. 设置 CSS 类名为 `popup`
2. 将自身置于顶层（z-index）
3. 创建内容容器并添加到内部
4. 绑定点击外部关闭事件（若启用 `auto_dismiss`）
5. 启用拖动（`movable`）与缩放（`resizable`）
6. 默认隐藏（`display: none`）
7. 添加至 `Body` 容器
8. 绑定点击以提升层级
9. 若 `auto_open === true`，调用 `open()`
10. 若有 `content`，监听 `opened` 事件加载内容

---

### 方法详解

#### `load_content() → Promise<void>`
异步加载配置中的 `content` 并渲染到内容区。

```js
async load_content(){
  var w = await bricks.widgetBuild(this.content, this);
  if (w){
    this.set_dismiss_events(w);
    this.content_w.clear_widgets();
    this.content_w.add_widget(w);
  }
}
```

> ⚠️ 依赖 `bricks.widgetBuild()` 动态构建子控件树。

---

#### `set_dismiss_events(widget)`
为指定控件绑定关闭事件。

```js
this.dismiss_events.forEach(ename => {
  w.bind(ename, this.destroy.bind(this));
});
```

> 示例：`dismiss_events: ['ok', 'cancel']` 会绑定这些事件触发销毁。

---

#### `bring_to_top()`
将当前弹窗置顶（最高 z-index），更新全局 `toppopup` 引用。

```js
this.zindex = bricks.app.new_zindex();
this.set_style('zIndex', this.zindex);
bricks.app.toppopup = this;
```

---

#### `popup_from_widget(from_w)`
从指定控件位置智能定位弹窗（避开屏幕边缘）。

##### 算法逻辑
- 计算源控件中心坐标 `(ox, oy)`
- 若源在左侧，则弹窗出现在右侧；否则出现在左侧
- 若源在上方，则弹窗出现在下方；否则出现在上方
- 边界检测防止溢出屏幕

> 适用于 Tooltip 或 Context Menu 场景。

---

#### `setup_resizable()`
启用可缩放功能，在右下角添加 SVG 缩放手柄。

##### 子组件
- `resizable_w`: SVG 图标（右下三角）

##### 事件绑定
- `mousedown` → `resize_start_pos`
- `mousemove` → `resizing`
- `mouseup` → `stop_resizing`

---

#### `resize_start_pos(e)`
记录初始尺寸和鼠标位置，开始缩放。

```js
this.s_width = rect.width;
this.s_height = rect.height;
this.s_offsetX = e.clientX;
this.s_offsetY = e.clientY;
```

---

#### `resizing(e)`
实时调整宽度和高度。

```js
cx = this.s_width + e.clientX - this.s_offsetX;
cy = this.s_height + e.clientY - this.s_offsetY;
this.set_style('width', cx + 'px');
this.set_style('height', cy + 'px');
```

---

#### `stop_resizing(e)`
结束缩放操作，解绑全局事件。

```js
this.resize_status = false;
bricks.Body.unbind('mousemove', this.resizing.bind(this));
bricks.Body.unbind('mouseup', this.stop_resizing.bind(this));
```

---

#### `positify_tl()`
根据 `archor` 和屏幕尺寸计算并设置弹窗位置。

##### 尺寸解析优先级
1. `cwidth` / `cheight`（字符单位 × 字符大小）
2. `width` / `height`（百分比或 px）
3. 默认占屏 80%

##### 锚点布局规则
| 第一位（垂直） | 第二位（水平） |
|----------------|----------------|
| `t`: 顶部对齐   | `l`: 左对齐     |
| `c`: 居中       | `c`: 居中       |
| `b`: 底部对齐   | `r`: 右对齐     |

> 返回 `{ top, left }` 像素坐标。

---

#### `setup_movable()`
启用拖动功能，绑定 `mousedown` 和 `touchstart`。

---

#### `rec_start_pos(e)`
记录拖动起点偏移量，并绑定移动与释放事件。

```js
this.offsetX = e.clientX - rect.left;
this.offsetY = e.clientY - rect.top;
```

---

#### `moving(e)`
实时更新位置。

```js
cx = e.clientX - this.offsetX;
cy = e.clientY - this.offsetY;
this.set_style('left', cx + 'px');
this.set_style('top', cy + 'px');
```

---

#### `stop_moving(e)`
停止拖动，解绑所有相关事件。

---

#### `click_outside(event)`
点击弹窗外区域时关闭弹窗（仅当 `auto_dismiss` 为 `true` 时生效）。

```js
if (event.target != this.dom_element) this.dismiss();
```

---

#### `open()`
打开弹窗。

##### 流程
1. 若无父节点，加入 `app` 根容器
2. 若是首次打开：
   - 设置目标控件（`widget` 参数）
   - 执行定位 `positify_tl()`
3. 显示元素（`display: block`）
4. 触发 `opened` 事件
5. 设置超时关闭任务（如需）
6. 若为模态，则禁用目标控件
7. 提升至顶层

---

#### `dismiss()`
关闭弹窗。

##### 流程
1. 若为模态，恢复目标控件可用状态
2. 清除超时任务
3. 隐藏元素（`display: none`）
4. 触发 `dismissed` 事件
5. 若 `auto_destroy === true`，执行 `destroy()`

---

#### `destroy()`
彻底销毁组件。

```js
if (this.opened) this.dismiss();
if (this.parent) {
  this.parent.remove_widget(this);
  this.parent = null;
}
```

---

#### `add_widget(w, i)`
向内容区域添加控件，并自动绑定关闭事件。

> 若 `auto_open` 为 `true`，则立即打开弹窗。

---

#### `remove_widget(w)` / `clear_widgets()`
代理调用 `content_w` 的对应方法。

---

## 扩展类：`bricks.PopupWindow`

继承自 `Popup`，模拟操作系统窗口，带有标题栏和控制按钮。

### 构造函数特点
```js
opts.movable = true;
opts.resizable = true;
opts.auto_open = false; // 手动控制打开时机
```

#### 特有属性
| 属性 | 说明 |
|------|------|
| `title_bar` | 标题栏容器（HBox） |
| `tb_w` | 控制按钮栏（IconBar） |
| `content_w` | 主内容区（Layout） |
| `title_w` | 标题文本显示控件 |

#### 内部结构
1. **标题栏 (`titlebar`)**
   - 图标（SVG）
   - 控制按钮组（删除、最小化、全屏）
   - 标题文本
2. **填充层 (`Filler`)**
   - 包含主内容区
3. **内容区 (`Layout`)**
   - 支持 Flex 布局

#### 控制按钮功能
| 按钮 | 功能 |
|------|------|
| `delete` | 调用 `destroy()` 销毁窗口 |
| `minimize` | 调用 `win_minimize()` 最小化 |
| `fullscreen` | 进入全屏模式 |

---

#### `win_minimize()`
关闭窗口并将自身推入 `bricks.app.mwins` 数组，供后续恢复。

```js
this.dismiss();
if (!this.auto_destroy) {
  bricks.app.mwins.push(this);
}
```

---

#### `set_title(txt)`
动态修改窗口标题。

```js
this.title_w.set_text(txt);
```

---

## 工具类：`bricks.WindowsPanel`

用于展示所有最小化的窗口列表，点击可恢复。

### 构造函数行为
- 固定宽高为 `80%`
- 自动关闭、销毁
- 不自动打开

#### 数据绑定结构
使用 `Cols` 组件渲染表格：

```json
{
  "total": 3,
  "rows": [
    { "title": "Settings", "url": "...", "pos": 0 },
    ...
  ]
}
```

每行包含图标、标题，点击触发 `del_window()`。

---

#### `del_window(event)`
恢复指定位置的窗口并从列表中移除。

```js
var pos = event.params.pos;
var w = bricks.app.mwins[pos];
w.open(); // 恢复显示
bricks.app.mwins.splice(pos, 1); // 删除记录
this.dismiss(); // 关闭面板
```

---

## 工厂注册

```js
bricks.Factory.register('Popup', bricks.Popup);
bricks.Factory.register('PopupWindow', bricks.PopupWindow);
```

支持通过字符串类型动态创建组件实例。

---

## 静态辅助函数

### `bricks.get_popupwindow_default_options()`

返回专用于 `PopupWindow` 的默认配置，与普通 `Popup` 的区别在于：

```diff
+ resizable: true
```

其余同 `get_popup_default_options()`。

---

## 使用示例

### 创建简单弹窗
```js
let popup = new bricks.Popup({
  content: {
    widgettype: 'Text',
    options: { text: 'Hello World!' }
  },
  archor: 'cc',
  timeout: 3000
});
```

### 创建应用窗口
```js
let win = new bricks.PopupWindow({
  title: '用户设置',
  icon: '/icons/settings.svg',
  content: { ... },
  auto_open: true
});
```

### 显示窗口管理器
```js
let panel = new bricks.WindowsPanel();
panel.open();
```

---

## 注意事项

1. **事件作用域问题**：大量使用 `.bind(this)`，注意性能影响。
2. **内存泄漏风险**：未正确解绑事件可能导致残留监听器。
3. **触摸设备兼容性**：支持 `touchstart/move/end`，但需测试跨平台表现。
4. **z-index 管理**：依赖 `bricks.app.new_zindex()`，需保证唯一递增。
5. **异步内容加载**：`load_content()` 为异步，注意加载顺序。

---

## 总结

`bricks.Popup` 系列组件提供了强大而灵活的弹窗系统，具备以下核心能力：

✅ 模态/非模态切换  
✅ 自动定位与边界适配  
✅ 拖拽移动 & 缩放  
✅ 外部点击关闭  
✅ 超时自动关闭  
✅ 内容动态加载  
✅ 窗口最小化管理  

适合构建复杂的桌面风格 Web 应用界面。

--- 

> 文档版本：v1.0  
> 最后更新：2025-04-05