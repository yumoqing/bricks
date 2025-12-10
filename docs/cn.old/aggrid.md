# `bricks.AG_Grid` 技术文档

> 基于 [ag-Grid](https://www.ag-grid.com/) 封装的可复用 JavaScript 网格组件，继承自 `bricks.JsWidget`。

---

## 概述

`bricks.AG_Grid` 是一个基于 `ag-Grid` 的封装类，用于在网页中快速创建功能丰富的数据表格。它支持从远程 URL 动态加载数据，并提供列定义、排序、过滤、多选、单元格点击事件等基础功能。

该类继承自 `bricks.JsWidget`，遵循统一的组件初始化和生命周期管理机制。

---

## 依赖

- `ag-Grid`（必须全局可用，即 `agGrid` 对象已加载）
- `bricks.js` 核心库（包含 `bricks.JsWidget` 基类）

---

## 构造函数

```js
new bricks.AG_Grid(options)
```

### 参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `options` | `Object` | ✅ | 配置选项对象 |

#### `options` 属性

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `dataurl` | `String` | ✅ | - | 数据接口 URL，返回 JSON 格式数组数据 |
| `fields` | `Array<Object>` | ✅ | - | 列字段配置列表，每个字段包含显示信息 |

##### `fields` 字段配置项

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `name` | `String` | ✅ | - | 字段名（对应数据中的 key） |
| `label` | `String` | ❌ | `name` | 表头显示名称 |
| `width` | `Number` | ❌ | `100` | 列宽度（像素） |

---

## 类定义

```js
var bricks = window.bricks || {};
bricks.AG_Grid = class extends bricks.JsWidget {
    /* 
        opts 示例：
        {
            dataurl: "/api/data",
            fields: [
                { name: "id", label: "ID", width: 80 },
                { name: "name", label: "姓名" },
                { name: "age", width: 60 }
            ]
        }
    */
    
    constructor(opts) {
        super(opts);
        this.ag_opts = {}; // ag-Grid 配置对象
    }

    init() {
        // 初始化数据源
        this.datasource = {
            getRows: this.getRows.bind(this),
            startRow: 0
        };

        // 设置 ag-Grid 配置项
        this.ag_opts.columnDefs = [];
        this.ag_opts.rowModelType = 'infinite';
        this.ag_opts.maxConcurrentDatasourceRequests = 1;
        this.ag_opts.datasource = this.datasource;
        
        // 生成列定义
        for (let i = 0; i < this.opts.fields.length; i++) {
            const field = this.opts.fields[i];
            const colDef = {
                field: field.name,
                headerName: field.label || field.name,
                width: field.width || 100
            };
            this.ag_opts.columnDefs.push(colDef);
        }

        // 默认列行为：可排序、可过滤
        this.ag_opts.defaultColDef = { sortable: true, filter: true };
        
        // 启用多行选择
        this.ag_opts.rowSelection = 'multiple';
        
        // 启用行动画效果
        this.ag_opts.animateRows = true;

        // 绑定单元格点击事件
        this.ag_opts.onCellClicked = this.cell_clicked.bind(this);

        // 初始化 ag-Grid 实例
        this.aggrid = new agGrid.Grid(this.dom_element, this.ag_opts);

        // 加载初始数据（一次性加载全部）
        fetch(this.opts.dataurl)
            .then(response => response.json())
            .then(data => {
                this.ag_opts.api.setRowData(data); // 注意：此处与 infinite model 不符，见下方说明
            })
            .catch(err => console.error('Failed to load data:', err));
    }

    cell_clicked(params) {
        bricks.debug('Cell clicked:', params);
    }
}
```

---

## 方法说明

### `constructor(opts)`

调用父类构造函数并初始化 `this.ag_opts` 为空对象，用于后续存储 ag-Grid 配置。

### `init()`

组件初始化主逻辑：

1. 定义 `datasource` 对象（为无限滚动做准备，但当前实现未完全使用）。
2. 遍历 `opts.fields` 构建 `columnDefs`。
3. 设置通用表格行为（排序、过滤、多选、动画）。
4. 创建 `ag-Grid` 实例并与 DOM 元素绑定。
5. 使用 `fetch` 请求 `dataurl` 获取初始数据，并通过 `setRowData` 填充表格。

> ⚠️ **注意**：虽然设置了 `rowModelType: 'infinite'`，但实际并未正确实现 `getRows` 方法，因此当前行为更像是“客户端模型”，而非真正的无限滚动。建议根据需求调整数据加载方式。

### `cell_clicked(params)`

单元格点击回调函数，输出调试信息到控制台（需 `bricks.debug` 存在）。

参数 `params` 包含：
- `value`: 当前单元格值
- `column`: 列对象
- `rowIndex`: 行索引
- `data`: 整行数据对象
- 更多详见 [ag-Grid 官方文档](https://www.ag-grid.com/javascript-data-grid/cell-events/)

---

## 使用示例

```html
<div id="myGrid" style="height: 400px;" class="ag-theme-alpine"></div>

<script>
new bricks.AG_Grid({
    dom_element: document.getElementById('myGrid'),
    dataurl: '/api/users',
    fields: [
        { name: 'id', label: '用户ID', width: 80 },
        { name: 'name', label: '姓名', width: 120 },
        { name: 'email', label: '邮箱' },
        { name: 'age', label: '年龄', width: 60 }
    ]
});
</script>
```

---

## 已知问题与改进建议

| 问题 | 说明 | 建议 |
|------|------|------|
| `getRows` 未实现 | `datasource.getRows` 未定义，却赋值给了 `this.datasource.getRows` | 若使用 `infinite` 模式，应实现分页加载逻辑 |
| `startRow` 未绑定上下文 | `startRow` 在 `datasource` 中未正确定义为属性 | 应作为闭包变量或实例属性维护 |
| `setRowData` 不适用于 Infinite Model | `setRowData` 仅适用于客户端模型 | 改为调用 `api.setDatasource()` 并完整实现 `getRows` |
| 错误语法 | `maxConcurrentDatasourceRequests: 1,` 使用了冒号而非赋值 | 应为 `=` |
| `width` 和 `label` 的默认值写法错误 | 使用了位运算符 `|` 而非逻辑默认值 | 应使用 `||` 或 `??` |

### 修正建议代码片段

```js
// 正确的字段处理
width: field.width ?? 100,
headerName: field.label ?? field.name,

// 正确的属性赋值
this.ag_opts.maxConcurrentDatasourceRequests = 1;

// 实现 getRows（若启用 infinite 模式）
getRows(params) {
    fetch(`${this.opts.dataurl}?start=${params.startRow}&end=${params.endRow}`)
        .then(res => res.json())
        .then(data => {
            params.successCallback(data, data.length === 100 ? 10000 : data.length);
        });
}
```

---

## 总结

`bricks.AG_Grid` 提供了一个简洁的 ag-Grid 封装，适合快速集成静态或小规模动态数据表格。但在大数据场景下需完善 `infinite` 模式的数据源实现以提升性能。

建议后续优化方向：
- 完整支持分页/无限滚动
- 支持列类型、渲染器扩展
- 添加加载状态提示
- 支持外部刷新方法

--- 

📌 **版本**: 1.0  
📅 **最后更新**: 2025-04