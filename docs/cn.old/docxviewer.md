# Bricks 文档查看器组件技术文档

本技术文档介绍了基于 `bricks.js` 框架的三种文档文件在线预览组件：`DOCXviewer`、`EXCELviewer` 和 `PDFviewer`。这些组件支持通过 URL 加载并渲染 `.docx`、`.xlsx/.xls` 和 `.pdf` 文件，适用于网页端轻量级文档展示场景。

---

## 🔧 依赖说明

以下第三方库必须在页面中提前加载：

```html
<!-- 必需：Mammoth.js - 用于 DOCX 转 HTML -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.2/mammoth.browser.min.js"></script>

<!-- 必需：SheetJS (xlsx) - 用于 Excel 解析 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>

<!-- 必需：PDF.js - 用于 PDF 渲染 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"></script>
```

> ⚠️ 注意：确保 `pdfjsLib` 已全局可用（通常由 PDF.js 提供）。

---

## 📦 组件概览

| 组件名         | 功能描述                     | 支持格式     |
|----------------|------------------------------|--------------|
| `DOCXviewer`   | 预览 Word 文档 (.docx)       | `.docx`      |
| `EXCELviewer`  | 预览 Excel 表格文件          | `.xlsx`, `.xls` |
| `PDFviewer`    | 预览 PDF 文档                | `.pdf`       |

所有组件均继承自 `bricks.VBox`，可通过 `bricks.Factory.register()` 注册使用。

---

## 1. ✅ DOCXviewer

将 `.docx` 文件转换为 HTML 并嵌入页面显示。

### 类定义
```javascript
bricks.DOCXviewer = class extends bricks.VBox
```

### 构造函数
```javascript
constructor(opts)
```

#### 参数
- `opts` `{Object}`: 配置选项对象。
  - `url` `{String}`: 指向 `.docx` 文件的远程或本地 URL。

#### 示例
```javascript
const docViewer = new bricks.DOCXviewer({
  url: 'https://example.com/document.docx'
});
```

### 方法

#### `async set_url(url)`
从指定 URL 获取 `.docx` 文件，并使用 Mammoth.js 转换为 HTML 显示。

##### 流程
1. 使用 `HttpArrayBuffer` 异步获取文件二进制数据。
2. 调用 `mammoth.convertToHtml()` 将 ArrayBuffer 转为 HTML 字符串。
3. 插入到组件 DOM 容器内。

##### 参数
- `url` `{String}`: 可选，若未传则使用实例的 `this.url`。

---

## 2. ✅ EXCELviewer

支持多工作表 Excel 文件的交互式浏览。

### 类定义
```javascript
bricks.EXCELviewer = class extends bricks.VBox
```

### 构造函数
```javascript
constructor(opts)
```

#### 参数
- `opts` `{Object}`:
  - `url` `{String}`: Excel 文件地址。
  - （自动设置）`height: "100%"`

#### UI 结构
- 上部：横向滚动条式工作表标签栏 (`HBox`)
- 下部：内容区域 (`Filler`) 显示当前选中的 sheet

#### 示例
```javascript
const excelViewer = new bricks.EXCELviewer({
  url: 'https://example.com/data.xlsx'
});
```

### 方法

#### `async set_url(url)`
加载 Excel 文件并解析所有工作表名称，生成可点击标签。

##### 步骤
1. 获取文件 ArrayBuffer。
2. 使用 `XLSX.read(data, {type: 'array'})` 解析 workbook。
3. 遍历 `SheetNames` 创建文本按钮，绑定点击事件。

#### `show_sheet_by_name(sheetname, widget)`
切换显示指定工作表的内容。

##### 功能
- 更新选中状态样式（添加 `selected` CSS 类）
- 使用 `XLSX.utils.sheet_to_html()` 生成表格 HTML
- 嵌入 `VScrollPanel` 实现垂直滚动
- 替换内容容器中的子组件

##### 内部变量
- `this.cur_sheetname`: 当前显示的工作表名
- `this.workbook`: 缓存 workbook 对象以供后续访问

---

## 3. ✅ PDFviewer

逐页渲染 PDF 文件为 Canvas 图像。

### 类定义
```javascript
bricks.PDFviewer = class extends bricks.VBox
```

### 构造函数
```javascript
constructor(opts)
```

#### 参数
- `opts` `{Object}`:
  - `url` `{String}`: PDF 文件路径
  - （自动设置）`width: '100%'`

#### 示例
```javascript
const pdfViewer = new bricks.PDFviewer({
  url: 'https://example.com/report.pdf'
});
```

### 方法

#### `async set_url(url)`
加载 PDF 并启动渲染流程。

##### 步骤
1. 使用 `HttpArrayBuffer` 获取二进制数据。
2. 调用 `pdfjsLib.getDocument({ data: ab })` 初始化文档。
3. 遍历每一页，调用 `getPage(i)` 并异步渲染。

#### `add_page_content(page)`
将单个 PDF 页面渲染为 `<canvas>` 元素并插入组件。

##### 渲染参数
- 缩放比例：`scale = 1.5`
- 使用 `page.getViewport()` 计算视口尺寸
- 创建 canvas，设置宽高，调用 `page.render()` 绘制

##### UI 布局
- 每页后插入一个 `Splitter` 分隔符（逻辑待修复）
- 使用 `JsWidget` 包裹 canvas 实现集成

> ❗注意：原代码中 `i < this.pdf.numPages` 的 `i` 未定义，应改为索引判断或移除条件。

##### 修复建议：
```js
// 修改 add_page_content 中的判断逻辑
if (page.pageNumber < this.pdf.numPages) {
  const splitter = new bricks.Splitter();
  this.add_widget(splitter);
}
```

---

## 🔗 工具函数

### `extractBodyContent(htmlString)`
提取 HTML 字符串中 `<body>...</body>` 标签之间的内容。

#### 参数
- `htmlString` `{String}`: 完整 HTML 字符串

#### 返回值
- `{String|null}`: 匹配到的 body 内容，否则返回 `null`

#### 正则表达式
```js
/<body[^>]*>([\s\S]*?)<\/body>/i
```

> 💡 当前代码中该函数被注释掉，可用于清理 XLSX 输出中的多余头尾信息。

---

## 🧱 组件注册

最后，三个组件通过 `bricks.Factory` 注册，可在模板或动态创建时使用字符串标识符：

```javascript
bricks.Factory.register('DOCXviewer', bricks.DOCXviewer);
bricks.Factory.register('EXCELviewer', bricks.EXCELviewer);
bricks.Factory.register('PDFviewer', bricks.PDFviewer);
```

### 使用示例（工厂模式）
```javascript
const viewer = bricks.Factory.create('PDFviewer', {
  url: 'manual.pdf'
});
parentContainer.add_widget(viewer);
```

---

## 🛠️ 已知问题与改进建议

| 问题 | 描述 | 建议 |
|------|------|-------|
| `i` 未定义 | `add_page_content` 中 `i < numPages` 报错 | 改用 `page.pageNumber` 判断 |
| 性能问题 | 多页 PDF 同时请求可能导致卡顿 | 添加顺序加载或懒加载机制 |
| 样式控制弱 | 输出 HTML 缺乏定制化样式 | 提供 `customStyle` 回调或封装容器类 |
| 错误处理不足 | `pdfjsLib` catch 仅打印日志 | 提供错误 UI 反馈机制 |

---

## 📎 总结

这三个组件构成了一个轻量级、模块化的文档预览系统，适合集成于 Web 应用前端，实现无需下载即可查看常见办公文档的功能。

### 特性亮点
- 基于标准浏览器 API 与流行解析库
- 支持异步加载和动态渲染
- 组件化设计，易于扩展和复用
- 与 `bricks.js` UI 框架无缝集成

### 推荐用途
- 在线帮助手册预览
- 后台管理系统文档查看
- 教学平台课件展示

---

> 📚 **提示**：请确保服务器允许跨域访问文档资源（CORS），否则 `HttpArrayBuffer.get()` 请求将失败。