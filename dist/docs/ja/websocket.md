# WebSocket

コンポーネント機能：バックエンドとのWebSocket接続を確立し、テキストおよびBase64エンコードされた音声・動画データの送受信をサポート。さまざまなイベントコールバックを提供します。  
タイプ：通常コンポーネント  
親コンポーネント：bricks.VBox

## 初期化パラメータ

| パラメータ名   | 型      | 説明 |
|----------------|--------|------|
| ws_url         | string | WebSocketサーバーの接続アドレス（例：`ws://example.com/socket`） |
| with_session   | boolean | 現在のセッション情報を付与するかどうか。`true`の場合、`bricks.app.get_session()`からセッションを取得し、WebSocketコンストラクタに渡す（注：ソースコード中の綴り誤り`sessopn`は正しくは`session`である） |

> 例：
> ```js
> new bricks.WebSocket({
>   ws_url: "ws://localhost:8080/ws",
>   with_session: true
> });
> ```

## 主なイベント

| イベント名           | 発生タイミング |
|----------------------|--------------|
| onopen               | WebSocket接続が正常に確立されたときに発生 |
| onmessage            | サーバーからメッセージを受信したときに発生（元のメッセージ） |
| onerror              | WebSocketでエラーが発生したときに発生 |
| onclose              | WebSocket接続が閉じられたときに発生 |
| ontext               | `text`型のメッセージを受信したときに発生（`on_message`で解析後に発行） |
| onbase64audio        | `base64audio`型のメッセージを受信したときに発生 |
| onbase64video        | `base64video`型のメッセージを受信したときに発生 |

> その他のカスタムタイプは、`ontypedata`方式で動的に発行可能。フォーマットは`on + type`。

### イベントデータの説明

- `onmessage`により解析され発行されるすべてのイベントデータは、JSON形式の`e.data`から得られます。構造は以下の通りです：
  ```json
  {
    "type": "text",
    "data": "Hello"
  }
  ```
  コンポーネントは`type`フィールドに基づいて対応するイベント（例：`ontext`）を自動的に発行し、`data`をイベントハンドラの引数として渡します。