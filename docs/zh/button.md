# Button

控件功能：一个可点击的按钮控件，支持图标、文本标签和自定义动作响应，常用于触发事件或执行操作。  
类型：普通控件  
父类控件：`bricks.Layout`

## 初始化参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `orientation` | string | 布局方向，可选值为 `'horizontal'` 或垂直（默认为垂直），影响内部元素排列方式。 |
| `height` | string | 控件高度，默认为 `100%`。 |
| `width` | string | 控件宽度，默认为 `100%`。 |
| `item_rate` | number | 图标和文本的尺寸缩放比例，默认为 `1`。 |
| `tooltip` | string | 鼠标悬停时显示的提示文字。 |
| `color` | string | 文本颜色，CSS 颜色值。 |
| `bgcolor` | string | 背景颜色，CSS 颜色值。 |
| `nonepack` | boolean | 是否去除内边距和边框，若为 `true` 则设置 `padding: 0` 和 `border: 0`。 |
| `name` | string | 控件唯一标识名称，用于设置 DOM 元素 ID。 |
| `icon` | string | 图标资源 URL，如果指定，则在按钮中创建并显示一个 `Icon` 控件。 |
| `label` | string | 按钮上显示的文本标签内容。 |
| `css` | object | 自定义 CSS 样式对象，将被合并到按钮样式中。 |
| `action` | object | 点击按钮时触发的动作配置，包含以下子属性：<br> - `target`: 目标组件/路径<br> - `datawidget`: 数据源控件<br> - `datamethod`: 获取数据的方法名<br> - `datascript`: 自定义脚本逻辑<br> - `dataparams`: 传递给动作的参数<br> - `rtdata`: 是否实时获取数据<br> - `actiontype`: 动作类型（如跳转、提交等） |

## 主要事件

- **`click`**  
  当按钮被点击时触发。事件回调会接收到 `opts` 配置对象作为参数。  
  触发时机：用户点击按钮（包括图标或文本部分）后，调用 `target_clicked` 方法时派发。  
  示例监听：
  ```js
  button.bind('click', function(opts) {
      console.log('Button clicked with options:', opts);
  });
  ```
