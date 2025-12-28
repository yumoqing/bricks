# `bricks.Accordion` 技术文档

```markdown
# bricks.Accordion

`bricks.Accordion` 是一个基于 `bricks.VBox` 的可折叠面板组件，允许用户通过点击标题按钮切换显示不同的内容区域。常用于需要节省垂直空间、分组展示信息的界面设计中。

---

## 继承关系

- **继承自**: `bricks.VBox`
- **注册名称**: `'Accordion'`（通过 `bricks.Factory.register` 注册）

---

## 构造函数

### `new bricks.Accordion(opts)`

#### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `opts` | Object | 配置选项对象 |

#### `opts` 配置项

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `item_size` | String | `'25px'` | 每个标题项的高度（CSS 尺寸字符串） |
| `item_css` | String | `'accordion-button'` | 标题按钮使用的 CSS 类名 |
| `content_css` | String | `'accordion-content'` | 内容区域使用的 CSS 类名 |
| `items` | Array\<Object\> | 必填 | 要显示的面板项列表 |

##### `items` 数组元素结构

每个 `item` 是一个对象，包含以下字段：

| 字段 | 类型 | 是否必需 | 说明 |
|------|------|----------|------|
| `name` | String | 是 | 唯一标识符，用于定位和缓存内容 |
| `icon` | String | 否 | 显示在按钮前的图标类名（如 Font Awesome 类） |
| `label` | String | 是 | 按钮上显示的文本标签 |
| `content` | Object | 是 | 描述子组件的配置对象（符合 `widgetBuild` 结构） |
| `refresh` | Boolean | 否 | 若为 `true`，每次点击都会重新构建内容（不使用缓存） |

---

## 成员属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `w_items` | Array\<bricks.Button\> | 存储所有标题按钮实例的数组 |
| `subcontents` | Object | 缓存已创建的内容组件，键为 `name`，值为对应的 widget 实例 |
| `content` | bricks.Filler | 包裹内容区域的容器 |
| `sub_container` | bricks.VScrollPanel | 实际承载内容的可滚动面板 |
| `key_select_items` | Array | 支持键盘导航的选择项集合（用于上下键选择） |
| `keyselectable` | Boolean | `true`，表示该组件支持键盘选择操作 |

---

## 方法

### `constructor(opts)`

初始化 Accordion 组件：

1. 调用父类构造函数。
2. 设置整体高度为 `100%`。
3. 创建多个 `bricks.Button` 实例作为标题栏，并绑定 `click` 事件到 `change_content`。
4. 初始化内容显示区域（`VScrollPanel`）并插入第一个项目的内容。

> ⚠️ 注意：第一个按钮会自动触发一次 `click` 事件以加载默认内容。

---

### `async change_content(event)`

处理标题按钮点击事件，动态切换显示内容。

#### 参数

- `event`: DOM 事件对象，`event.target.bricks_widget` 应指向被点击的 `bricks.Button` 实例。

#### 行为逻辑

1. 获取被点击按钮的 `name`。
2. 在 `this.opts.items` 中查找对应项的位置与配置。
3. 判断是否需要刷新：
   - 如果设置了 `refresh: true`
   - 或者该内容尚未被缓存
4. 若需刷新或未缓存，则调用 `bricks.widgetBuild()` 异步生成新内容并缓存。
5. 清空当前内容区，并将新内容添加进 `sub_container`。
6. 更新布局：移除旧的 `content` widget 并重新插入（确保位于正确位置）。

#### 错误处理

- 若找不到匹配的 `name`，会在控制台输出警告日志。
- 若 `item.content` 不存在，则打印错误信息并返回。

---

## 事件绑定

- 所有标题按钮均监听 `click` 事件，触发 `change_content` 回调。
- 使用 `.bind(this)` 确保回调中的 `this` 指向正确的 Accordion 实例。

---

## 示例配置

```javascript
var accordion = new bricks.Accordion({
  item_size: '30px',
  item_css: 'my-accordion-button',
  content_css: 'my-accordion-content',
  items: [
    {
      name: 'general',
      icon: 'fa fa-home',
      label: '通用设置',
      content: {
        widgettype: 'TextBlock',
        text: '这里是通用设置内容...'
      }
    },
    {
      name: 'advanced',
      icon: 'fa fa-cog',
      label: '高级选项',
      refresh: true,
      content: {
        widgettype: 'FormPanel',
        fields: [ ... ]
      }
    }
  ]
});
```

---

## 样式建议（CSS）

```css
.accordion-button {
  padding: 8px 12px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  font-weight: bold;
}

.accordion-button:hover {
  background-color: #e0e0e0;
}

.accordion-content {
  padding: 10px;
  background-color: #fff;
  border: 1px solid #ddd;
  min-height: 100px;
}
```

> 可根据实际需求覆盖默认类名或通过 `item_css` / `content_css` 自定义。

---

## 工厂注册

```javascript
bricks.Factory.register('Accordion', bricks.Accordion);
```

允许通过工厂方法创建实例：

```javascript
bricks.widgetBuild({ widgettype: 'Accordion', ... });
```

---

## 注意事项

- 内容组件是**懒加载**的，仅在首次点击时创建。
- 支持**缓存机制**，避免重复渲染提升性能；可通过 `refresh: true` 强制重载。
- 支持键盘导航（上下箭头选择按钮），前提是容器环境支持焦点管理。
- `widgetBuild` 返回的是 `Promise`，因此 `change_content` 定义为 `async` 函数。

---

## 调试信息

启用调试模式后，点击按钮时会输出类似日志：

```text
accordion: button= [Button Instance] name= general
```

可通过 `bricks.debug()` 控制开关。

---
```