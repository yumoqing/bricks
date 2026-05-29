# Toolbar

控件功能：创建一个可包含多个工具按钮的工具栏，支持水平或垂直布局，每个按钮可触发命令事件，并支持动态添加/删除按钮。  
类型：容器控件  
父类控件：`bricks.Layout`

## 初始化参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `orientation` | String | 工具栏方向，可选 `'horizontal'`（默认）或 `'vertical'`。影响滚动面板类型及间隔方向。 |
| `target` | Any | 可选的目标对象，在触发命令事件时附加到事件数据中。 |
| `interval` | String 或 Number | 工具项之间的间隔大小，默认为 `'10px'`。根据方向设置宽度或高度。 |
| `tools` | Array\<Object\> | 工具按钮描述数组，每个对象包含以下子属性：<br>- `icon`: 按钮图标路径或类名<br>- `name`: 按钮唯一名称，用于事件分发和查找<br>- `label`: 按钮显示文本<br>- `css`: 自定义CSS类名<br>- `removable`: Boolean，是否可移除（若为 `true`，则显示删除图标） |

示例：
```js
{
  orientation: 'horizontal',
  interval: '10px',
  target: myTarget,
  tools: [
    { name: 'save', label: '保存', icon: 'save-icon.png', css: 'btn-save', removable: true },
    { name: 'undo', label: '撤销', icon: 'undo-icon.png' }
  ]
}
```

## 主要事件

| 事件名 | 触发条件 | 传递数据结构 |
|-------|----------|-------------|
| `command` | 当任意工具按钮被点击时触发 | `{ name, label, icon, css, [target] }` —— 包含该工具的所有配置信息，如果有设置 `target` 则也会包含 |
| `[tool.name]` | 动态事件，以工具的 `name` 命名的事件会被单独触发 | 同上，便于监听特定按钮操作 |
| `remove` | 当用户点击可移除按钮上的删除图标时触发 | 被移除工具的原始 `tool_opts` 对象 |

> 示例：若某工具 `name: 'export'`，则点击它会同时触发 `command` 和 `export` 两个事件。

### 补充说明
- 使用 `click(name)` 方法可通过编程方式模拟点击指定名称的按钮。
- 支持键盘选择（通过 `enable_key_select()`）。
- 所有工具按钮使用 `JsWidget` 构建，异步创建，确保组件树正确初始化。