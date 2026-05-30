# VideoPlayer

**機能**：複数の動画フォーマット（MP4、HLS `.m3u8`、DASH `.mpd`）をサポートする動画プレーヤーコントロール。再生コントロールバーを内蔵しており、再生/一時停止、音量調整、再生速度変更、音声トラック切替、全画面表示などの機能に対応しています。  
**タイプ**：通常コントロール  
**親クラス**：`bricks.VBox`

## 初期化パラメータ

| パラメータ名 | 型     | 説明 |
|------------|--------|------|
| `url`       | String | 動画リソースのURL。`.mp4`、`.m3u8`（HLS）、`.mpd`（DASH）形式をサポート |
| `autoplay`  | Boolean | 自動再生を行うかどうか。デフォルトは `false` |

> 例：
> ```js
> new bricks.VideoPlayer({
>   url: 'https://example.com/video.m3u8',
>   autoplay: true
> });
> ```

## 主なイベント

| イベント名      | 発生条件 |
|---------------|--------|
| `domon`        | コントロールがDOMにマウントされたときに発生。プレーヤーの初期化に使用されます。 |
| `domoff`       | コントロールがDOMから削除されたときに発生。プレーヤーのリソース解放に使用されます。 |
| `click`        | 再生領域がクリックされたときにコントロールバーを表示し、非表示タイマーを開始します。 |
| `play_ok`      | （`Iptv`で使用）外部から監視可能で、動画が正常に再生開始した際に報告されます。 |
| `play_failed`  | （`Iptv`で使用）動画の読み込みに失敗または再生できない場合に発生し、報告されます。 |

> 注意：`play_ok` および `play_failed` は `VideoPlayer` から直接ディスパッチされるわけではなく、サブクラスまたは組み合わせコントロール（例：`Iptv`）が状態を判定した後に手動で呼び出されます。

---

# Iptv

**機能**：IPTV用途に特化した再生コントロール。チャンネル情報を動的に取得し、自動的に `VideoPlayer` を読み込んで再生します。また、再生成功／失敗時にサーバーへステータスを報告する機能も備えています。  
**タイプ**：コンテナコントロール  
**親クラス**：`bricks.VBox`

## 初期化パラメータ

| パラメータ名         | 型     | 説明 |
|--------------------|--------|------|
| `iptv_data_url`     | String | チャンネルデータを取得するAPIのURL。`url`、`tv_name`、`id` などを含むJSONデータを返す必要があります。 |
| `playok_url`        | String | 再生成功時に報告を行うAPIのアドレス（任意） |
| `playfailed_url`    | String | 再生失敗時に報告を行うAPIのアドレス（任意） |

> 例：
> ```js
> new bricks.Iptv({
>   iptv_data_url: '/api/iptv/channel',
>   playok_url: '/api/report/playok',
>   playfailed_url: '/api/report/playfailed'
> });
> ```

## 主なイベント

| イベント名      | 発生条件 |
|---------------|--------|
| `play_ok`      | 内部の `VideoPlayer` が正常に再生を開始したとき、`playok_url` に対してGETリクエストを送信して報告を行います。 |
| `play_failed`  | `VideoPlayer` の再生に失敗したとき、`playfailed_url` に対してGETリクエストを送信して報告を行います。 |

> 説明：これらのイベントは、`VideoPlayer` の低レベルな動作（メタデータの正常読み込みなど）を監視することで間接的にトリガーされます。現在は業務ロジックによる判断に依存しています。

### メソッド説明

- `setValue(data)`：現在再生中のチャンネルデータを更新します（例：チャンネル切り替え）。タイトルと動画ソースも同時に更新されます。
  - パラメータ `data`：`url`、`tv_name`、`id` を含むオブジェクト
  - 例：
    ```js
    iptvWidget.setValue({
      id: "cctv1",
      tv_name: "CCTV-1 総合",
      url: "https://live.example.com/cctv1.m3u8"
    });
    ```