# ProgressBar

**コントロール機能**：プログレスバーを表示し、タスクの完了率（パーセンテージ）を視覚的に示す。  
**タイプ**：通常コントロール（コンテナコントロール HBox を拡張）  
**親クラスコントロール**：`bricks.HBox`

## 初期化パラメータ

| パラメータ名     | 型     | 説明 |
|----------------|--------|------|
| `total_value`  | Number | （任意）タスクの総量。進捗率計算に使用される。デフォルトは100 |
| `bar_cwidth`   | Number | （任意）プログレスバーの高さ（行の高さを単位とする）。デフォルトは2 |

> 注意：実際のコードでは `this.bar_cwidth||2` が使用されているが、`total_value` はコンストラクタで使われておらず、おそらく `set_value` メソッド内で `current` と `total` と組み合わせて使用される予定である。ただし、現在のコードには変数名の誤りがある（`current` および `total` が定義されていない）。

## 主なイベント

* **明示的なイベントなし**：現在のソースコードでは、カスタムイベントのバインドやトリガーは行われていない。  
* `HBox` を継承しているため基本的なレイアウトイベントは持つ可能性があるが、追加のイベント登録は存在しない。

> ⚠️ コードの問題点に関する注意：
> - `set_value` メソッド内で未定義の変数 `current` と `total` が使用されている。正しくは `v` と `this.total_value` であるべき。
> - パーセンテージ計算ロジックにおける変数名の不一致：最初に `pzt = (current / total) * 100` を計算しているが、その後 `percentage` という変数を使っている。一貫性を持たせるために、`v / this.total_value` を使用するよう修正すべき。
> 
> 以下のように修正することを推奨：
> ```js
> set_value(v) {
>     var percentage = this.total_value ? (v / this.total_value) * 100 : 0;
>     percentage = Math.max(0, Math.min(100, percentage));
>     this.text_w.set_style('width', percentage + '%');
> }
> ```