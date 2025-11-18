# VScrollPanel

用于创建垂直滚动容器控件，支持在滚动到接近顶部或底部时触发特定事件。该控件为**容器控件**，继承自 `VBox`，可包含子控件，并具备自动滚动行为与阈值检测功能。

## 主要方法

- `scroll_handle(event)`  
  内部滚动事件处理器，负责监控滚动位置并判断是否达到预设的上下阈值，若达到则派发对应事件。

- `bind(event, handler)`（继承自基类）  
  绑定 DOM 事件，此处用于监听 `'scroll'` 事件。

- `dispatch(event_name, data)`（继承自基类）  
  派发自定义事件，如 `min_threshold` 或 `max_threshold`。

## 主要事件

- `min_threshold`  
  当滚动条接近顶部（滚动位置小于最小阈值）时触发，常用于加载上一页数据。

- `max_threshold`  
  当滚动条接近底部（滚动位置超过最大阈值）时触发，常用于实现“滚动到底自动加载更多”功能。

## 源码例子

```json
{
  "id": "scroll_container",
  "widgettype": "VScrollPanel",
  "options": {
    "css": "my-scroll-area",           // 自定义样式类
    "min_threshold": 0.02,             // 滚动到顶部附近 2% 时触发 min_threshold
    "max_threshold": 0.95,             // 滚动到距离底部 5% 时触发 max_threshold
    "width": "100%",                   // 宽度占满父容器
    "height": "500px"                  // 固定高度以启用滚动
  },
  "subwidgets": [
    {
      "id": "item_1",
      "widgettype": "Label",
      "options": {
        "text": "这是第1项内容",
        "css": "list-item"
      }
    },
    {
      "id": "item_2",
      "widgettype": "Label",
      "options": {
        "text": "这是第2项内容",
        "css": "list-item"
      }
    },
    {
      "id": "item_3",
      "widgettype": "Label",
      "options": {
        "text": "这是第3项内容",
        "css": "list-item"
      }
    }
    // 更多项目可动态加载
  ],
  "binds": [
    {
      "actiontype": "event",
      "wid": "scroll_container",
      "event": "max_threshold",
      "target": "data_loader",
      "dispatch_event": "load_more",
      "params": {
        "page": "+1"
      },
      "conform": null,
      "rtdata": {
        "source": "user_list"
      }
    },
    {
      "actiontype": "script",
      "wid": "scroll_container",
      "event": "min_threshold",
      "target": "console_logger",
      "script": "console.log('用户已滚动到顶部，准备刷新列表')",
      "params": {}
    }
  ]
}
```

> **注释说明：**
> - `VScrollPanel` 设置了滚动阈值后，会在用户滚动接近顶部或底部时自动派发事件。
> - `binds` 中通过监听 `max_threshold` 实现“无限滚动”逻辑，调用其他组件加载更多数据。
> - 使用 `script` 类型绑定可在触底时执行调试脚本。
> - 子控件数组 `subwidgets` 可预先写入部分内容，后续可通过事件动态追加。


---

# HScrollPanel

用于创建水平滚动容器控件，支持在滚动到最左端或最右端附近时触发指定事件。该控件为**容器控件**，继承自 `HBox`，适用于横向滑动布局场景（如轮播图、标签栏等）。

## 主要方法

- `scroll_handle(event)`  
  处理水平方向的滚动事件，计算当前滚动比例并与阈值比较。

- `bind(event, handler)`  
  监听 `'scroll'` 事件以实现实时位置判断。

- `dispatch(event_name, data)`  
  触发 `min_threshold`（左侧极限）和 `max_threshold`（右侧极限）事件。

## 主要事件

- `min_threshold`  
  滚动条位于最左侧附近时触发，表示无法继续向左滚动。

- `max_threshold`  
  滚动条到达最右侧附近时触发，可用于加载更多横向内容。

## 源码例子

```json
{
  "id": "horizontal_scroller",
  "widgettype": "HScrollPanel",
  "options": {
    "css": "gallery-container",         // 添加自定义样式
    "min_threshold": 0.01,             // 接近起点 1% 触发
    "max_threshold": 0.99,             // 接近终点 1% 触发
    "width": "100%",
    "height": "200px",
    "overflow": "auto"
  },
  "subwidgets": [
    {
      "id": "img_1",
      "widgettype": "Image",
      "options": {
        "src": "/images/banner1.jpg",
        "width": "180px",
        "height": "180px",
        "css": "gallery-item"
      }
    },
    {
      "id": "img_2",
      "widgettype": "Image",
      "options": {
        "src": "/images/banner2.jpg",
        "width": "180px",
        "height": "180px",
        "css": "gallery-item"
      }
    },
    {
      "id": "img_3",
      "widgettype": "Image",
      "options": {
        "src": "/images/banner3.jpg",
        "width": "180px",
        "height": "180px",
        "css": "gallery-item"
      }
    }
  ],
  "binds": [
    {
      "actiontype": "bricks",
      "wid": "horizontal_scroller",
      "event": "max_threshold",
      "target": "Popup",
      "mode": "append",
      "options": {
        "widgettype": "Label",
        "options": {
          "text": "已经是最后一张图片了！",
          "css": "toast-message"
        }
      },
      "rtdata": {
        "duration": 2000
      }
    },
    {
      "actiontype": "method",
      "wid": "horizontal_scroller",
      "event": "min_threshold",
      "target": "analytics_tracker",
      "method": "trackEvent",
      "params": {
        "category": "Gallery",
        "action": "scroll_to_start"
      }
    }
  ]
}
```

> **注释说明：**
> - `HScrollPanel` 常用于图像画廊、水平菜单等需要横向滚动的界面。
> - 当滚动到最右边时，使用 `bricks` 动作弹出提示信息（追加到 Popup 容器中）。
> - 滚动回起始位置时，调用分析组件记录用户行为。
> - 所有子控件应设置固定宽度以便形成可滚动内容流。