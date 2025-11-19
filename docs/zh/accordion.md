# Accordion

**控件功能**：Accordion 是一个可折叠的面板控件，允许用户通过点击标题按钮切换显示不同内容区域。常用于组织多个内容块，节省界面空间。

**类型**：容器控件  
**父类控件**：`bricks.VBox`

## 初始化参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `item_size` | String (可选) | 每个折叠项标题的高度，默认为 `'25px'`。 |
| `items` | Array\<Object\> | 折叠项列表，每个对象包含以下属性：<br>- `name`: 该项唯一标识符<br>- `icon`: 显示在按钮前的图标（可选）<br>- `label`: 按钮上显示的文字<br>- `content`: 子控件配置对象（widgettype 等），用于动态构建内容<br>- `refresh` (Boolean, 可选): 是否每次点击都重新加载内容 |
| `item_css` | String (可选) | 标题按钮的 CSS 类名，默认为 `'accordion-button'`。 |
| `content_css` | String (可选) | 内容区域的 CSS 类名，默认为 `'accordion-content'`。 |

示例：
```js
{
  item_size: '30px',
  items: [
    {
      name: 'panel1',
      label: '基本信息',
      icon: 'info',
      content: { widgettype: 'Label', text: '这里是基本信息' }
    },
    {
      name: 'panel2',
      label: '设置',
      refresh: true,
      content: { widgettype: 'Form', fields: [...] }
    }
  ]
}
```

## 主要事件

| 事件名 | 触发时机 | 回调参数 | 说明 |
|--------|---------|----------|------|
| `click` (内部绑定) | 用户点击某个折叠项标题按钮时触发 | `event.target.bricks_widget` 指向被点击的 `Button` 实例 | 控制内容切换的核心事件，由内部自动绑定并处理内容加载与展示 |

> 注意：该控件自身不对外暴露自定义事件 API，但其行为依赖于 `Button` 的 `click` 事件来驱动内容切换逻辑。开发者可通过监听子控件事件实现扩展功能。