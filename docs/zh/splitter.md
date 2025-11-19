# Splitter

控件功能：用于在页面中创建一个分隔线（horizontal rule），常用于视觉上分割不同区域的内容。  
类型：普通控件  
父类控件：bricks.JsWidget

## 初始化参数

无特殊初始化参数，继承自 `bricks.JsWidget` 的默认参数。构造函数中调用 `super({})`，使用空配置对象初始化父类。

## 主要事件

- **create**：控件创建时触发，内部调用 `_create('hr')` 方法生成 `<hr>` DOM 元素并赋值给 `this.dom_element`，作为该控件的根元素。
