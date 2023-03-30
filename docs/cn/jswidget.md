# JsWidget
Bricks框架的最原始的控件，所有Bricks的控件均继承自JsWidget或其后代。

## 构建选项

## 属性

### dom_element
dom_element是控件对应的dom元素。

## 方法

### create()
创建dom元素的方法，并将新创建的元素保存在dom_element属性中，JsWidget创建一个”div“的元素， 子类通过提供自己的create（）函数创建自己特定的dom元素。
### set_css(css_name, delflg)

增加或删除一个css类， 当delflg为真时删除一个“css_name”css类，否则增加一个“css_name”类

### sizable（）
sizable函数让当前类有按照bricks_app.charsize的大小设置自身大小的能力，并在charsize变化时改变自身的大小

### change_fontsize（ts）
change_fontsize函数由bricks_app.textsize_bigger()，textsize_smaller（）函数调用，用来改变控件的大小
## 事件
无
