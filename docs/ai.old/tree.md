以下是根据你提供的源码和文档规范，为 `Tree` 控件编写的符合 **bricks 控件 JSON 规范** 的控件文档（Markdown 格式）：

---

# Tree

树形结构控件，用于展示层级数据（如文件目录、组织架构等）。支持异步加载子节点、节点选择、自定义节点视图等功能。属于**容器控件**，继承自 `VScrollPanel`。

## 主要方法

| 方法名 | 说明 |
|--------|------|
| `getValue()` | 获取整个树的数据结构，包含所有节点及其子节点的用户数据。 |
| `get_children_data(node)` | 异步从服务器获取指定节点的子节点数据（当配置了 `dataurl` 时调用）。 |
| `create_node_children(node, data)` | 根据传入的数据数组创建子节点并添加到指定父节点下。 |
| `build_subnode(node, data)` | 创建单个 `TreeNode` 实例并加入容器中。 |
| `node_click_handle(node, event)` | 处理节点点击事件，更新选中状态并派发 `node_selected` 事件。 |
| `node_selected(node, flag)` | 设置节点的选中样式，并派发 `node_selected` 自定义事件。 |
| `append_new_subnode(parentNode, data)` | 向指定父节点追加新子节点，并自动构建 UI。 |

## 主要事件

| 事件名 | 触发条件 | 携带参数 |
|-------|---------|--------|
| `node_selected` | 节点被点击选中或取消选中时触发 | 包含节点原始数据及 `selected: true/false` 的对象 |
| `check_changed` | 当节点带有复选框且状态改变时触发（需启用 `checkField`） | 节点的用户数据对象 |
| `command` | 工具栏按钮点击后触发（如果启用了工具栏） | 工具项的配置信息（name, label 等） |

## 源码例子

```json
{
  "id": "my_tree",
  "widgettype": "Tree",
  "options": {
    // 控件基本属性
    "width": "100%",
    "height": "500px",

    // 数据字段映射
    "idField": "id",               // 唯一标识字段
    "textField": "name",           // 显示文本字段
    "is_leafField": "is_leaf",     // 判断是否为叶子节点
    "typeField": "nodetype",       // 节点类型字段（用于图标区分）

    // 行高设置
    "row_height": "36px",

    // 图标配置（可选）
    "node_typeicons": {
      "folder": {
        "open": "/static/imgs/open-folder.svg",
        "close": "/static/imgs/close-folder.svg",
        "leaf": "/static/imgs/file.svg"
      },
      "default_type": "folder"
    },

    // 是否启用复选框功能
    "checkField": "checked",

    // 静态数据或远程数据 URL（二选一）
    "data": [
      {
        "id": "1",
        "name": "项目根目录",
        "is_leaf": false,
        "nodetype": "folder",
        "children": [
          {
            "id": "2",
            "name": "子模块A",
            "is_leaf": true,
            "nodetype": "file"
          }
        ]
      }
    ]
    /*
    或者使用远程数据：
    "dataurl": "/api/tree/nodes",
    "method": "GET",
    "params": {
      "appid": "123"
    }
    */
  },

  // 子控件（无，因为 Tree 自主管理子节点）
  "subwidgets": [],

  // 事件绑定
  "binds": [
    {
      "actiontype": "event",
      "wid": "my_tree",
      "event": "node_selected",
      "target": "output_panel",
      "rtdata": {
        "action": "show_node_info"
      },
      "datawidget": "my_tree",
      "datamethod": "getValue",
      "dataparams": {}
    },
    {
      "actiontype": "script",
      "wid": "my_tree",
      "event": "check_changed",
      "target": "Popup",
      "script": "console.log('节点勾选变化:', params); notifyUser(params.name + ' 状态已更新');",
      "params": {
        "source": "tree_check"
      }
    }
  ]
}
```

> ✅ **注释说明：**
>
> - `widgettype`: 必须是已在 `bricks.Factory.register` 中注册的名称，此处为 `"Tree"`。
> - `options.data`: 提供初始静态数据；若使用 `dataurl`，则会在运行时动态加载。
> - `checkField`: 开启复选框功能，每个节点数据中应包含该字段（如 `"checked": true`）。
> - `binds` 示例展示了如何监听节点选中与复选变化，并执行脚本或传递数据给其他组件。
> - 所有图标路径建议通过 `bricks_resource()` 函数处理以确保资源定位正确。

--- 

> 📌 **提示**：若需编辑功能（增删改），请使用继承自 `Tree` 的 `EditableTree` 或在 `options` 中提供 `editable` 配置及对应的 `add_url`, `delete_url`, `update_url` 接口地址。