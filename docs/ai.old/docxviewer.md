# DOCXviewer

用于在前端界面中嵌入并渲染 `.docx`（Word 文档）文件的容器控件，继承自 `VBox`。通过 `mammoth.js` 将二进制 Word 文档转换为 HTML 并显示在页面中。

## 主要方法

- **`set_url(url)`**  
  异步方法，接收一个文档 URL，使用 `HttpArrayBuffer` 获取二进制数据，并通过 `mammoth.convertToHtml` 转换为 HTML 后插入到控件的 DOM 中。

## 主要事件

- **`on_parent`**  
  当控件被挂载到父级组件时触发，自动调用 `set_url(this.url)` 开始加载文档内容。

## 源码例子

```json
{
  "id": "docx_viewer_1",
  "widgettype": "DOCXviewer",
  "options": {
    "url": "/documents/report.docx" // 要加载的 .docx 文件路径
  },
  "binds": [
    {
      "actiontype": "bricks",
      "wid": "btn_refresh_docx",
      "event": "click",
      "target": "docx_viewer_1",
      "options": {
        "widgettype": "method",
        "method": "set_url",
        "params": {
          "url": "/documents/report_updated.docx"
        }
      },
      "rtdata": {},
      "conform": {
        "title": "刷新确认",
        "message": "确定要重新加载文档吗？",
        "confirm_text": "确定",
        "cancel_text": "取消"
      }
    }
  ]
}
```

> 注释：  
> - `widgettype: DOCXviewer` 表示这是一个基于 Mammoth.js 渲染 Word 文档的控件。  
> - `options.url` 指定远程 `.docx` 文件地址。  
> - 使用 `binds` 可以绑定按钮点击事件来动态更新文档源。  
> - 需提前引入 [mammoth.js](https://github.com/mwilliamson/mammoth.js) 库支持。

---

# EXCELviewer

用于在 Web 界面中展示 `.xlsx` 或 `.xls` Excel 文件内容的容器控件，继承自 `VBox`。支持多工作表切换查看，依赖 `SheetJS (xlsx)` 库解析 Excel 数据并渲染为 HTML 表格。

## 主要方法

- **`set_url(url)`**  
  异步方法，根据传入的 Excel 文件 URL 加载二进制数据，使用 `XLSX.read()` 解析工作簿，并生成页签栏供用户切换不同 sheet。

- **`show_sheet_by_name(sheetname, tw)`**  
  切换显示指定名称的工作表，高亮当前选中标签，并将对应表格内容渲染至滚动面板中。

## 主要事件

- **`on_parent`**  
  控件挂载后触发，自动调用 `set_url(this.url)` 初始化数据加载。

- **`click` on tab text widget**  
  点击某个工作表标签时，切换显示该工作表内容。

## 源码例子

```json
{
  "id": "excel_viewer_1",
  "widgettype": "EXCELviewer",
  "options": {
    "url": "/data/sales_report.xlsx", // Excel 文件地址
    "height": "600px"
  },
  "subwidgets": [],
  "binds": [
    {
      "actiontype": "method",
      "wid": "btn_load_another_excel",
      "event": "click",
      "target": "excel_viewer_1",
      "method": "set_url",
      "params": {
        "url": "/data/inventory.xlsx"
      },
      "conform": {
        "title": "加载新文件",
        "message": "是否加载新的库存表格？"
      }
    }
  ]
}
```

> 注释：  
> - `EXCELviewer` 自动创建顶部可滚动的 sheet 标签栏和下方内容区。  
> - 每个标签是一个 `Text` 控件，带有 `'clickable'` 和 `'selected'` CSS 类控制样式。  
> - 内容使用 `XLSX.utils.sheet_to_html` 直接生成表格 HTML 插入 `VScrollPanel` 实现滚动。  
> - 必须确保全局已加载 `xlsx.full.min.js`（如 SheetJS）。

---

# PDFviewer

用于在前端展示 `.pdf` 文件的容器控件，继承自 `VBox`。利用 `pdfjsLib`（Mozilla PDF.js）解析 PDF 二进制流，并逐页渲染为 `<canvas>` 元素进行显示。

## 主要方法

- **`set_url(url)`**  
  异步方法，从指定 URL 获取 PDF 二进制数据，初始化 `pdfjsLib.getDocument` 并遍历所有页面进行渲染。

- **`add_page_content(page)`**  
  接收一个 PDF 页面对象，创建 canvas 元素并调用 `page.render()` 绘制可视内容，添加到控件中。

## 主要事件

- **`on_parent`**  
  控件挂载完成后触发，启动 PDF 加载流程。

## 源码例子

```json
{
  "id": "pdf_viewer_1",
  "widgettype": "PDFviewer",
  "options": {
    "url": "/docs/manual.pdf", // PDF 文件路径
    "width": "100%",
    "height": "800px"
  },
  "binds": [
    {
      "actiontype": "script",
      "wid": "btn_print_pdf",
      "event": "click",
      "target": "Popup",
      "script": "window.open(target.options.url, '_blank', 'print=yes');",
      "params": {
        "target": "pdf_viewer_1"
      },
      "rtdata": {
        "msg": "正在打开打印窗口..."
      }
    },
    {
      "actiontype": "method",
      "wid": "btn_reload_pdf",
      "event": "click",
      "target": "pdf_viewer_1",
      "method": "set_url",
      "params": {
        "url": "{{last_pdf_url}}" // 动态参数，来自运行时数据或变量
      }
    }
  ]
}
```

> 注释：  
> - `PDFviewer` 使用 `pdfjsLib` 的标准 API 加载和渲染 PDF。  
> - 每页生成一个 `<canvas>` 并插入控件内部，页间可用 `Splitter` 分隔（代码中逻辑未完全闭合，需注意循环变量作用域）。  
> - 需引入 PDF.js 并设置 `pdfjsLib.GlobalWorkerOptions.workerSrc`。  
> - 示例中使用 `script` 动作实现“打印”功能，弹出新窗口预览 PDF。  
> - `{{last_pdf_url}}` 表示支持模板变量注入，可用于动态刷新最近访问的文档。

--- 

> ✅ 所有三个控件均为**容器控件**，均继承自 `VBox`，可通过 `add_widget` 动态添加子控件。  
> ⚠️ 使用前请确保相关第三方库已正确加载：
> - DOCXviewer → `mammoth`
> - EXCELviewer → `xlsx`
> - PDFviewer → `pdfjsLib`