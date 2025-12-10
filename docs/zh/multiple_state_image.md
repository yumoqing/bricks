# MultipleStateImage

控件功能：一个可切换状态的图片控件，根据不同的状态显示不同的图片，点击图片时自动切换到下一个状态。  
类型：普通控件  
父类控件：`bricks.Layout`

## 初始化参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `state` | String | 当前初始状态名称，需在 `urls` 对象中存在对应的键 |
| `urls` | Object | 状态与图片 URL 的映射对象，格式为 `{ state1: url1, state2: url2, ... }` |
| `width` | Number (可选) | 图片的显示宽度 |
| `height` | Number (可选) | 图片的显示高度 |

示例：
```js
{
  state: "normal",
  urls: {
    normal: "image-normal.png",
    hover: "image-hover.png",
    disabled: "image-disabled.png"
  },
  width: 100,
  height: 50
}
```

## 主要事件

| 事件名 | 触发时机 | 携带数据 |
|--------|----------|---------|
| `state_changed` | 当控件的状态通过点击或调用 `set_state` 发生改变后触发 | 新的状态名称（String） |

说明：  
- 用户点击图片时，控件会按 `urls` 中定义的状态顺序循环切换，并触发 `state_changed` 事件。  
- 调用 `set_state(state)` 方法也可手动设置状态并更新图片。