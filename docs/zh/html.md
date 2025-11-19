# Html

控件功能：用于在页面中插入自定义的 HTML 内容。  
类型：普通控件  
父类控件：`bricks.JsWidget`

## 初始化参数

- `html` (String)  
  要插入到控件中的 HTML 字符串内容。该内容将被设置为控件 DOM 元素的 `innerHTML`。

示例：
```js
new bricks.Html({
  html: '<div style="color: red;">这是一个红色的文本</div>'
});
```

## 主要事件

无主要事件（继承自父类的通用事件，如 `init`, `render` 等，但本控件未定义特定事件）。