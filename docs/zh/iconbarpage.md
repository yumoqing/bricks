# IconbarPage

控件功能：一个带有图标工具栏的页面容器，支持在顶部或底部放置图标工具栏（IconTextBar），点击工具项可动态加载并显示对应的内容组件。  
类型：容器控件  
父类控件：bricks.VBox

## 初始化参数

- `opts`：配置对象，包含以下属性：
  - `bar_opts` *(Object)*：图标工具栏的配置选项，传递给 `bricks.IconTextBar`。
    - `margin` *(String | Number)*：工具栏的外边距。
    - `rate` *(Number)*：布局中所占比例。
    - `tools` *(Array)*：工具项数组，每个工具项为一个对象，结构如下：
      - `name` *(String)*：工具的名称，用于标识。
      - `icon` *(String)*：图标的类名或路径。
      - `label` *(String, 可选)*：工具的文本标签。
      - `tip` *(String)*：鼠标悬停时的提示信息。
      - `dynsize` *(Boolean)*：是否动态调整大小。
      - `rate` *(Number)*：该工具在布局中的占比。
      - `content` *(Object | String)*：描述要加载的子控件的配置或类型名，用于动态构建内容。
  - `bar_at` *(String)*：指定工具栏位置，可选值为 `'top'` 或 `'bottom'`，默认为 `'top'`。

> 注意：构造函数会自动设置 `height: '100%'`。

## 主要事件

- `command` 事件：
  - 来源：内部 `IconTextBar` 实例触发。
  - 回调参数：`event.params` 包含被点击的 `tool` 对象。
  - 行为：当用户点击某个工具图标时，`command_handle` 方法会被调用，并根据 `tool.content` 动态创建内容组件，替换当前显示区域的内容。

```javascript
bar.bind('command', this.command_handle.bind(this))
```
