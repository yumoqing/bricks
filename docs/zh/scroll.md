# VScrollPanel

控件功能：垂直滚动面板，用于在内容超出容器高度时提供垂直滚动能力，并支持在滚动接近顶部或底部时触发阈值事件。  
类型：容器控件  
父类控件：bricks.VBox

## 初始化参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `min_threshold` | Number (可选) | 滚动条到达顶部附近时触发 `min_threshold` 事件的阈值比例，默认为 `0.02`（即 2%） |
| `max_threshold` | Number (可选) | 滚动条到达底部附近时触发 `max_threshold` 事件的阈值比例，默认为 `0.95`（即 95%） |
| `width` | String | 默认设置为 `'100%'`，控件宽度占满父容器 |
| `height` | String | 默认设置为 `'100%'`，控件高度占满父容器 |
| `css` | String (可选) | 自定义 CSS 类名，会额外添加 `'scrollpanel'` 类 |
| `overflow` | String | 固定为 `'auto'`，启用滚动条自动显示 |

> 注意：以上 `width`、`height`、`css`、`overflow` 会在构造函数中自动设置。

## 主要事件

- **`min_threshold`**  
  当垂直滚动位置接近顶部（根据 `min_threshold` 判断）时触发，通常表示用户已滚动到最上方，可用于加载更多内容等操作。

- **`max_threshold`**  
  当垂直滚动位置接近底部（根据 `max_threshold` 判断）时触发，常用于实现“滚动到底自动加载”功能。

---

# HScrollPanel

控件功能：水平滚动面板，用于在内容超出容器宽度时提供水平滚动能力，并可在滚动接近最左或最右时触发阈值事件。  
类型：容器控件  
父类控件：bricks.HBox

## 初始化参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `min_threshold` | Number (可选) | 水平滚动条到达最左侧附近时触发 `min_threshold` 事件的比例阈值，默认为 `0.01`（即 1%） |
| `max_threshold` | Number (可选) | 水平滚动条到达最右侧附近时触发 `max_threshold` 事件的比例阈值，默认为 `0.99`（即 99%） |
| `width` | String | 默认设置为 `'100%'`，控件宽度占满父容器 |
| `height` | String | 默认设置为 `'100%'`，控件高度占满父容器 |
| `css` | String (可选) | 自定义 CSS 类名，会合并 `'scrollpanel'` 类 |
| `overflow` | String | 固定为 `'auto'`，允许出现水平滚动条 |

> 注意：`width`、`height`、`css`、`overflow` 由构造函数自动配置。

## 主要事件

- **`min_threshold`**  
  当水平滚动位置接近最左侧时触发，可用于加载左侧更多内容或执行其他逻辑。

- **`max_threshold`**  
  当水平滚动位置接近最右侧时触发，适用于实现“横向滚动加载更多”场景。