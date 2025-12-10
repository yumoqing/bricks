# TabPanel

**控件功能**：TabPanel 是一个容器控件，用于实现标签页切换功能。用户可以通过点击不同的标签页按钮来切换显示对应的内容区域。支持顶部、底部、左侧、右侧的标签布局，支持动态添加和移除标签页，并可缓存已创建的页面内容以提高性能。

**类型**：容器控件  
**父类控件**：`bricks.Layout`

## 初始化参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `tab_pos` | String | 标签位置，可选值为 `"top"`（默认）、`"bottom"`、`"left"`、`"right"`，决定标签栏的排列方向与位置。 |
| `tab_long` | String | 标签宽度或高度占比，默认为 `"100%"`，控制标签的整体伸展行为。 |
| `css` | Object/String | 自定义 CSS 类名，应用于根元素。可用类包括：`tab`, `tab-button`, `tab-button-active`, `tab-button-hover`, `tab-content`。 |
| `items` | Array | 标签项数组，每个对象包含以下属性：<br>- `name`: 标签唯一标识符（必填）<br>- `label`: 显示文本<br>- `icon`: 图标类名（可选）<br>- `removable`: 是否可关闭（布尔值）<br>- `refresh`: 是否每次切换时重新加载内容（布尔值）<br>- `content`: 内容组件描述对象或直接是 `bricks.JsWidget` 实例 |

示例：
```js
{
  tab_pos: "top",
  items: [
    {
      name: "tab1",
      label: "首页",
      icon: "fa fa-home",
      removable: false,
      refresh: false,
      content: { widgettype: "Text", text: "Welcome!" }
    }
  ]
}
```

## 主要事件

### `switch`
- **触发时机**：当标签页切换完成并展示新内容时触发。
- **事件数据**：当前激活的内容控件实例（即 `w`，类型为 `bricks.JsWidget`）。
- **用途**：可用于监听内容区域的变化，进行状态同步或日志记录。

示例监听：
```js
tabpanel.bind('switch', function(event) {
  console.log('当前显示的内容组件：', event.data);
});
```

### `active`（内容控件事件）
- **触发时机**：当某个内容控件被切换到前台显示时，该控件自身会触发 `active` 事件。
- **说明**：此事件由内容控件调用 `dispatch('active')` 触发，适用于需要在页面显示时执行初始化逻辑的场景（如刷新数据、聚焦输入框等）。

> 注意：此事件不是 TabPanel 直接发出，而是其内部内容控件在被激活时自行派发。

---

**备注**：
- TabPanel 使用 `bricks.Toolbar` 实现标签按钮栏，支持横向或纵向布局。
- 内容区使用 `bricks.Filler` 作为容器，通过 `switch_content()` 方法动态替换内容。
- 已加载的内容默认会被缓存于 `content_buffer` 中，除非设置 `refresh: true`，否则不会重复创建。
- 支持通过 `add_tab(desc)` 动态添加新标签页，以及通过事件绑定处理关闭操作。