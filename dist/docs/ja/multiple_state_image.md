# MultipleStateImage

**コントロール機能**：状態を切り替えることができる画像コントロール。異なる状態に応じて異なる画像を表示し、画像をクリックすると自動的に次の状態に切り替わります。  
**タイプ**：通常コントロール  
**親クラス**：`bricks.Layout`

## 初期化パラメータ

| パラメータ名 | 型 | 説明 |
|--------------|----|------|
| `state` | String | 初期状態の名称。`urls` オブジェクト内に該当するキーが存在している必要があります。 |
| `urls` | Object | 状態と画像URLの対応マップ。形式は `{ state1: url1, state2: url2, ... }` です。 |
| `width` | Number (任意) | 画像の表示幅 |
| `height` | Number (任意) | 画像の表示高さ |

**例**：
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

## 主なイベント

| イベント名 | 発生タイミング | 付随データ |
|------------|----------------|-----------|
| `state_changed` | コントロールの状態がクリックまたは `set_state` の呼び出しによって変更された後に発生 | 新しい状態名（String） |

**説明**：  
- ユーザーが画像をクリックすると、`urls` で定義された状態の順序に従って状態が循環して切り替わり、`state_changed` イベントが発生します。  
- `set_state(state)` メソッドを呼び出すことで、状態を手動で設定し、画像を更新することもできます。