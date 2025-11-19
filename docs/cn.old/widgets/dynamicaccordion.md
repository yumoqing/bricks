# Tabular
表格形式的数据展现控件

## widgettype值
Tabular

## 父类
bricks.VScrollPanel

## 构建参数
* "data_url":数据获取url，用来获取条目数据，返回数据须符合[页数据要求](pagingdata.md)
* "data_method":数据获取的方法缺省是“GET”
* "data_params",获取数据需要带的参数
* "cache_limit",缓存数据页数
* "page_rows",每页数据条数
* "row_cheight":每条目显示按字符大小为单位的高度
* "row_options"：条目数据显示控件的构建参数，参数需要符合要求
* "content_view": 内容显示的控件描述，当用户点击条目后会在条目后面显示此控件描述生成的控件，在其中可以使用${name}的形式调用后台返回数据当前记录字段数据
### row_options格式
* toolbar: 格式要求参看[工具条](toolbar.md)
* fields:数组，数据字段说明，数组中每个数据要素请参看[字段规范](field_spec.md)
* browserfields：条目显示字段约束，是一个字典类型数据
* editexclouded: 数组编辑是蓄意排除的数据字段名

## 方法
无
## 事件
无
## 使用例子

