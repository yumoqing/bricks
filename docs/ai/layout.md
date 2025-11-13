# Layout

Layout 是 Bricks.js 框架中的基础容器控件，用于组织和管理子控件（subwidgets）。它是所有布局类控件的基类，支持键盘导航、动态添加/删除子控件、标题与描述渲染等功能。  
**类型**：容器控件，继承自 `bricks.JsWidget`

## 主要方法

| 方法名 | 说明 |
|--------|------|
| `add_widget(w, index)` | 向容器中添加一个控件，可指定插入位置；若未指定，则追加到末尾 |
| `remove_widget(w)` | 从容器中移除指定控件 |
| `clear_widgets()` | 清空容器内所有子控件 |
| `enable_key_select()` | 启用键盘选择功能，将该容器推入全局选择栈 |
| `disable_key_select()` | 禁用键盘选择，并从选择栈中弹出 |
| `select_next_item()` | 选中下一个可选控件（支持循环） |
| `select_previous_item()` | 选中上一个可选控件（支持循环） |
| `up_level()` | 键盘“返回”操作：退出当前层级 |
| `down_level()` | 键盘“进入”操作：进入下一层级的可选控件 |
| `enter_handler()` | 回车键处理：触发当前选中控件的 `click` 事件 |
| `key_handler(event)` | 键盘事件处理器，响应方向键与回车 |
| `build_title()` | 构建并添加标题控件（Title3） |
| `build_description()` | 构建并添加描述文本控件（Text） |
| `find_first_keyselectable_child()` | 查找第一个支持键盘选择的子控件 |

## 主要事件

| 事件名 | 触发时机 | 参数 |
|-------|--------|------|
| `on_parent` | 当控件被添加或从父容器中移除时触发 | parent: 当前父容器对象 |
| `element_resize` | 元素尺寸变化时触发（由 ResponsableBox 绑定使用） | params: 包含尺寸信息的对象 |
| `click` | 被 dispatch 触发时模拟点击行为 | - |

## 源码例子

```json
{
  "id": "main_layout",
  "widgettype": "Layout",
  "options": {
    "title": "主界面布局",           // 显示标题（i18n 支持）
    "description": "这是一个示例布局容器",  // 描述文本
    "keyselectable": true            // 启用键盘导航
  },
  "subwidgets": [
    {
      "id": "title_widget",
      "widgettype": "Title3",
      "options": {
        "otext": "欢迎使用系统",
        "i18n": true,
        "dynsize": true
      }
    },
    {
      "id": "menu_container",
      "widgettype": "VBox",
      "options": {
        "keyselectable": true
      },
      "subwidgets": [
        {
          "id": "btn_home",
          "widgettype": "Button",
          "options": {
            "otext": "首页",
            "i18n": true
          }
        },
        {
          "id": "btn_settings",
          "widgettype": "Button",
          "options": {
            "otext": "设置",
            "i18n": true
          }
        }
      ],
      "binds": [
        {
          "actiontype": "method",
          "wid": "btn_home",
          "event": "click",
          "target": "content_area",
          "method": "loadPage",
          "params": {
            "page": "home"
          },
          "conform": {
            "title": "确认跳转？",
            "message": "是否要跳转到首页？",
            "i18n": true
          }
        },
        {
          "actiontype": "method",
          "wid": "btn_settings",
          "event": "click",
          "target": "content_area",
          "method": "loadPage",
          "params": {
            "page": "settings"
          }
        }
      ]
    }
  ],
  "binds": [
    {
      "actiontype": "event",
      "wid": "main_layout",
      "event": "element_resize",
      "target": "main_layout",
      "dispatch_event": "reset_type"
    }
  ]
}
```

> **注释说明**：
> - 使用 `Layout` 作为根容器，启用键盘选择 (`keyselectable`)。
> - 内部包含标题和一个垂直菜单 VBox，菜单项为按钮。
> - 通过 `binds` 实现按钮点击后调用目标控件的方法。
> - `conform` 字段用于在执行前弹出确认对话框。
> - `element_resize` 事件可用于响应式布局调整（如在 ResponsableBox 中使用）。

---

# VBox

垂直布局容器，子控件按垂直方向排列。  
**类型**：容器控件，继承自 `Layout`

## 主要方法

继承自 `Layout`，无额外独有方法。

## 主要事件

同 `Layout`

## 源码例子

```json
{
  "id": "vertical_box",
  "widgettype": "VBox",
  "options": {
    "keyselectable": true
  },
  "subwidgets": [
    {
      "id": "label_welcome",
      "widgettype": "Text",
      "options": {
        "otext": "欢迎登录系统",
        "i18n": true,
        "css": "welcome-text"
      }
    },
    {
      "id": "input_username",
      "widgettype": "TextInput",
      "options": {
        "placeholder": "请输入用户名",
        "i18n": true
      }
    },
    {
      "id": "input_password",
      "widgettype": "PasswordInput",
      "options": {
        "placeholder": "请输入密码",
        "i18n": true
      }
    },
    {
      "id": "btn_login",
      "widgettype": "Button",
      "options": {
        "otext": "登录",
        "i18n": true
      }
    }
  ],
  "binds": [
    {
      "actiontype": "method",
      "wid": "btn_login",
      "event": "click",
      "target": "login_form_handler",
      "method": "submit",
      "datawidget": "input_username",
      "datamethod": "getValue",
      "dataparams": {},
      "rtdata": {
        "action": "/api/login"
      }
    }
  ]
}
```

> **注释说明**：
> - `VBox` 自动应用 CSS 类 `vcontainer` 实现垂直布局。
> - 表单元素依次垂直排列。
> - 登录按钮绑定提交动作，获取输入框值并携带运行时数据发送请求。

---

# HBox

水平布局容器，子控件按水平方向排列。  
**类型**：容器控件，继承自 `Layout`

## 主要方法

继承自 `Layout`

## 主要事件

同 `Layout`

## 源码例子

```json
{
  "id": "toolbar",
  "widgettype": "HBox",
  "options": {},
  "subwidgets": [
    {
      "id": "icon_home",
      "widgettype": "Icon",
      "options": {
        "name": "home",
        "size": "24px"
      }
    },
    {
      "id": "text_title",
      "widgettype": "Text",
      "options": {
        "otext": "主页",
        "i18n": true,
        "css": "toolbar-title"
      }
    },
    {
      "id": "spacer",
      "widgettype": "Filler"
    },
    {
      "id": "btn_refresh",
      "widgettype": "IconButton",
      "options": {
        "icon": "refresh",
        "tooltip": "刷新数据",
        "i18n": true
      }
    },
    {
      "id": "btn_more",
      "widgettype": "MenuButton",
      "options": {
        "icon": "more_vert",
        "menu": [
          { "text": "设置", "id": "settings", "i18n": true },
          { "text": "退出", "id": "logout", "i18n": true }
        ]
      }
    }
  ]
}
```

> **注释说明**：
> - `HBox` 应用 `hcontainer` 样式实现水平排布。
> - 使用 `Filler` 占位实现右侧按钮靠右对齐。
> - 工具栏包含图标、文字、填充和操作按钮。

---

# Filler

弹性填充控件，用于在布局中占据剩余空间，常用于对齐目的。  
**类型**：容器控件（但通常不放置子控件），继承自 `Layout`

## 主要方法

无特殊方法，主要用于样式布局

## 主要事件

无

## 源码例子

```json
{
  "id": "footer_bar",
  "widgettype": "HBox",
  "subwidgets": [
    {
      "id": "status",
      "widgettype": "Text",
      "options": {
        "otext": "就绪",
        "i18n": true
      }
    },
    {
      "id": "flex_spacer",
      "widgettype": "Filler"
      // 占据中间空白区域
    },
    {
      "id": "btn_close",
      "widgettype": "Button",
      "options": {
        "otext": "关闭",
        "i18n": true
      }
    }
  ]
}
```

> **注释说明**：
> - `Filler` 控件自动获得 `flex: 1` 特性（通过 CSS 类 `filler` 实现），撑开中间区域。
> - 实现左-中-右布局结构。

---

# ResponsableBox

响应式布局容器，能根据宽高比自动切换横竖排布模式。  
**类型**：容器控件，继承自 `Layout`

## 主要方法

| 方法名 | 说明 |
|-------|------|
| `reset_type(event)` | 响应尺寸变化事件，根据宽高比切换 CSS 类实现布局反转 |

## 主要事件

| 事件名 | 触发时机 |
|-------|---------|
| `element_resize` | 尺寸改变时触发，由自身监听 |

## 源码例子

```json
{
  "id": "responsive_panel",
  "widgettype": "ResponsableBox",
  "subwidgets": [
    {
      "id": "sidebar",
      "widgettype": "VBox",
      "options": {
        "css": "sidebar"
      },
      "subwidgets": [
        {
          "id": "nav_item_1",
          "widgettype": "Button",
          "options": {
            "otext": "仪表盘",
            "i18n": true
          }
        },
        {
          "id": "nav_item_2",
          "widgettype": "Button",
          "options": {
            "otext": "报表",
            "i18n": true
          }
        }
      ]
    },
    {
      "id": "main_content",
      "widgettype": "Filler",
      "subwidgets": [
        {
          "id": "dynamic_view",
          "widgettype": "urlwidget",
          "options": {
            "url": "/views/home.json",
            "method": "GET"
          }
        }
      ]
    }
  ]
}
```

> **注释说明**：
> - 当宽度大于高度时，设为横向布局（`.hcontainer`）；
> - 否则设为纵向布局（`.vcontainer`），实现移动端友好适配。
> - 结合 `urlwidget` 实现内容区动态加载。

--- 

# FHBox / FVBox

带 `flexWrap: nowrap` 的固定行/列布局容器。  
- **FHBox**：水平不可换行容器  
- **FVBox**：垂直不可换行容器  
**类型**：容器控件，分别继承自 `HBox` 和 `VBox`

## 主要方法

无独有方法

## 主要事件

同 `Layout`

## 源码例子（FHBox）

```json
{
  "id": "fixed_toolbar",
  "widgettype": "FHBox",
  "options": {
    "css": "no-wrap-toolbar"
  },
  "subwidgets": [
    { "id": "btn_1", "widgettype": "Button", "options": { "otext": "新建" } },
    { "id": "btn_2", "widgettype": "Button", "options": { "otext": "编辑" } },
    { "id": "btn_3", "widgettype": "Button", "options": { "otext": "删除" } },
    { "id": "btn_4", "widgettype": "Button", "options": { "otext": "导出" } },
    { "id": "btn_5", "widgettype": "Button", "options": { "otext": "打印" } }
  ]
}
```

> **注释说明**：
> - 使用 `FHBox` 防止工具栏按钮换行，超出部分可通过滚动查看。
> - 适用于需要保持一行显示的操作栏场景。