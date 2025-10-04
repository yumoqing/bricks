# `bricks.Menu` 技术文档

> 本文档为 `bricks.Menu` 类的详细说明，基于其继承自 `bricks.VBox` 的结构和功能设计。

---

## 概述

`bricks.Menu` 是一个用于构建可交互菜单界面组件的类，继承自 `bricks.VBox`。它支持嵌套子菜单、动态加载远程子菜单内容，并能响应菜单项点击事件以打开新窗口或更新目标组件内容。

该组件适用于构建侧边栏菜单、导航菜单或任何树形结构的交互式 UI。

---

## 继承关系

- **父类**: `bricks.VBox`
- **类型**: 自定义 UI 组件类（Class-based）

---

## 构造函数

```js
constructor(options)
```

### 参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `options` | Object | 配置选项对象，继承自 `VBox` 并扩展以下属性 |

#### `options` 支持字段：

| 字段 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `items` | Array | ✅ | - | 菜单项数组，每个元素是一个菜单项配置对象（见下文） |
| `bgcolor` | String | ❌ | `"white"` | 背景颜色 |
| `target` | String | ❌ | - | 点击菜单项后内容加载的目标组件 ID 或特殊值 `'PopupWindow'` / `'Popup'` |
| `popup_options` | Object | ❌ | `{}` | 当目标为 PopupWindow 或 Popup 时使用的弹窗配置 |

> ⚠️ 注意：`target` 和 `popup_options` 可在单个菜单项中覆盖。

### 示例

```js
new bricks.Menu({
  items: [
    { label: "首页", url: "/home" },
    { label: "用户管理", submenu: "/api/users" }
  ],
  target: "main_content",
  bgcolor: "#f5f5f5"
});
```

---

## 核心方法

### `create_submenu_container()`

创建一个用于容纳子菜单的容器（`VBox`），默认隐藏并带有缩进样式。

#### 返回值

- `{bricks.VBox}` —— 已配置好样式的子菜单容器

#### 样式设置

- `marginLeft: "15px"`
- `display: "none"`

---

### `async menu_clicked(event)`

处理菜单项被点击后的逻辑，根据配置打开页面、弹窗或注入到指定组件。

#### 参数

- `event`: DOM 事件对象，包含 `params` 字段，即菜单项数据。

#### 行为逻辑

1. 解析目标类型：
   - 若 `target === 'PopupWindow'`：创建 `PopupWindow` 实例
   - 若 `target === 'Popup'`：创建 `Popup` 实例
   - 否则：查找对应 ID 的组件 (`bricks.getWidgetById`)
2. 使用 `widgetBuild` 动态生成 URL Widget 并插入目标组件
3. 触发全局 `command` 事件，携带原始菜单项参数

#### 触发事件

- `command`：携带菜单项信息，可用于外部监听执行命令

#### 日志输出

- 失败时打印错误日志：
  - 目标组件未找到
  - widget 构建失败

---

### `create_children(w, items)`

递归创建菜单项及其子菜单。

#### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `w` | `bricks.Container` | 容器组件，用于添加生成的菜单项 |
| `items` | Array | 菜单项列表 |

#### 子菜单类型判断

| 条件 | 类型 | 说明 |
|------|------|------|
| `item.items` 存在 | 静态子菜单 | 直接递归创建 |
| `item.submenu` 存在 | 动态子菜单 | 点击时通过 URL 加载 |
| 其他 | 叶节点菜单项 | 绑定点击事件触发 `item_click` |

#### 内部行为

- 创建 `HBox` 表示菜单项
- 添加图标与文本
- 绑定点击/展开事件
- 支持国际化（i18n）、换行、左对齐等文本特性

---

### `async get_submenu_items(url)`

从远程 URL 获取子菜单数据（JSON 格式）。

#### 参数

- `url` (String): 请求地址

#### 返回值

- `Promise<Array>`: 菜单项数组（`data.options.items`）

#### 示例响应格式

```json
{
  "options": {
    "items": [
      { "label": "子项1", "url": "/sub1" },
      { "label": "子项2", "url": "/sub2" }
    ]
  }
}
```

---

### `async load_submenu(container, event)`

懒加载动态子菜单内容。

#### 参数

- `container`: 子菜单容器（`VBox`）
- `event`: 点击事件

#### 流程

1. 阻止事件冒泡
2. 若未加载过，则调用 `get_submenu_items()` 获取数据
3. 调用 `create_children()` 填充内容
4. 切换显示/隐藏状态

> ✅ 实现“点击展开 → 首次加载 → 缓存”机制

---

### `items_toggle_hide(w, event)`

切换静态子菜单的可见性。

#### 参数

- `w`: 子菜单容器
- `event`: 事件对象

#### 行为

- 执行 `toggle_hide()` 显示或隐藏
- 阻止事件冒泡

---

### `create_menuitem(item)`

创建单个菜单项 UI 组件（`HBox`）。

#### 参数

- `item`: 菜单项配置对象

| 属性 | 类型 | 说明 |
|------|------|------|
| `label` | String | 显示文本（支持 i18n） |
| `icon` | String | 图标 URL |
| `url` | String | 导航链接 |
| `name` | String | 名称（备用标题） |
| 其他字段 | Any | 将直接挂载到返回的 widget 上 |

#### 返回值

- `{bricks.HBox}` 包含图标和文本的水平布局组件

#### 子组件

| 组件 | 类型 | 说明 |
|------|------|------|
| `iw` | `Icon` 或 `BlankIcon` | 图标区域，若无图标则占位 |
| `tw` | `Text` | 文本标签，启用自动换行、左对齐、填充样式 |

#### 样式类

- 应用 CSS 类名：`menuitem_css` 或默认 `'menuitem'`

---

### `regen_menuitem_event(item, event)`

菜单项点击事件处理器，用于非容器型菜单项。

#### 行为

- 记录日志
- 触发 `item_click` 事件并传递 `item`
- 阻止事件冒泡

---

## 事件系统

### 监听的事件

- `item_click`: 当菜单项被点击时触发，由 `regen_menuitem_event` 发出

### 分发的事件

| 事件名 | 数据 | 说明 |
|--------|------|------|
| `item_click` | `item` 对象 | 内部使用，通知上级处理点击 |
| `command` | `item` 对象 | 外部可监听，表示一个命令被执行 |

---

## 配置与扩展

### 默认弹窗选项获取

- `bricks.get_popupwindow_default_options()`
- `bricks.get_popup_default_options()`

可通过 `popup_options` 合并自定义配置（使用 `bricks.extend`）

### 国际化支持

- `Text` 组件启用 `i18n: true`，支持多语言翻译

### 样式定制

- 可通过 `menuitem_css` 自定义菜单项样式类
- 使用 `set_css()` 和 `set_style()` 进行细粒度控制

---

## 注册与工厂模式

```js
bricks.Factory.register('Menu', bricks.Menu);
```

允许通过字符串标识符创建实例：

```js
bricks.createWidget("Menu", options);
```

---

## 使用场景示例

### 场景 1：静态树形菜单

```js
const menu = new bricks.Menu({
  items: [
    {
      label: "仪表盘",
      icon: "/icons/dashboard.png",
      url: "/dashboard"
    },
    {
      label: "设置",
      items: [
        { label: "账户", url: "/settings/account" },
        { label: "安全", url: "/settings/security" }
      ]
    }
  ],
  target: "main_panel"
});
```

### 场景 2：动态加载子菜单

```js
const menu = new bricks.Menu({
  items: [
    {
      label: "产品分类",
      submenu: "/api/categories",
      icon: "/icons/folder.png"
    }
  ],
  target: "PopupWindow",
  popup_options: {
    width: 800,
    height: 600
  }
});
```

---

## 注意事项

1. **性能优化**：动态子菜单仅在首次展开时请求数据，后续展开直接显示缓存内容。
2. **事件隔离**：所有点击事件均调用 `stopPropagation()` 防止意外冒泡。
3. **URL Widget 构建**：依赖 `bricks.widgetBuild()` 异步构建，需确保环境已初始化。
4. **目标组件存在性**：应确保 `target` 所指组件已注册且可用。

---

## 依赖模块

| 模块 | 用途 |
|------|------|
| `bricks.VBox`, `bricks.HBox` | 布局容器 |
| `bricks.Icon`, `bricks.BlankIcon` | 图标显示 |
| `bricks.Text` | 文本渲染与 i18n |
| `bricks.PopupWindow`, `bricks.Popup` | 弹窗组件 |
| `bricks.HttpJson` | JSON 数据请求 |
| `bricks.Factory`, `bricks.widgetBuild` | 组件工厂与异步构建 |
| `bricks.extend` | 对象合并工具函数 |

---

## 版本信息

- **作者**: Bricks Framework Team
- **版本**: v1.0（基础功能稳定）
- **最后更新**: 2025年4月5日

--- 

✅ *本组件适用于构建灵活、可扩展的菜单系统，推荐结合路由系统或 CMS 后台使用。*