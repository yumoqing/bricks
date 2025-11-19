# QAFrame

**コントロール機能**：質問と回答のインタラクティブなフレームワークを実装。WebSocketを通じて授業コンテンツ（音声・動画、画像、Markdownなど）、問題情報および結果フィードバックを受信可能。テキストまたは音声による回答の提出も可能。オンライン授業やクイズ等のシーンに適用。

**タイプ**：コンテナーコントロール  
**親クラス**：`bricks.VBox`

## 初期化パラメータ

| パラメータ名 | 型 | 説明 |
|--------------|----|------|
| `ws_url` | String | WebSocket接続アドレス。バックエンドとの通信に使用 |
| `ws_params` | Object (オプション) | `ws_url`に付加するクエリパラメータオブジェクト。URLクエリ文字列に変換される |
| `title` | String (オプション) | ページタイトル（コード内で直接使用されていない可能性あり。外部から渡される） |
| `description` | String (オプション) | 説明文 |
| `courseware` | Object (オプション) | 初期の教材リソース設定。以下の内容を含む：<br>- `type`: `\"audio\"`, `\"video\"`, `\"image\"`, `\"markdown\"`<br>- `url`: リソースのURL<br>- `timeout`: 再生タイムアウト時間（秒）。0はタイムアウトなしを意味 |
| `timeout` | Number | 全体のタイムアウト制御（秒単位）。0はタイムアウトなし |

> 注：初期化時に内部サブコントロールとして `top_w`（HBox）、`main_w`（Filler）、`bottom_w`（HBox）が作成され、WebSocket接続が確立される。

## 主なイベント

| イベント名 | 発火条件 | データ形式の説明 |
|-----------|---------|------------------|
| `onopen` | WebSocket接続がオープンしたとき | 自動的に `start_question_answer()` メソッドが呼び出され、起動メッセージ `{ type: 'qa_start', data: { d: 'test data', v: 100 } }` を送信 |
| `onquestion` | 問題データを受信したとき | データ構造：<br>`{ q_desc: 問題の説明, total_q: 総問題数, cur_q: 現在の問題番号 }`<br>`show_question(d)` を呼び出して問題を表示 |
| `oncourseware` | 教材リソースデータを受信したとき | データ構造：<br>`{ type: \"audio\"/\"video\"/\"image\"/\"markdown\", url: リソースリンク }`<br>`show_courseware(d)` を呼び出して対応するメディアコンテンツを表示 |
| `onaskstart` | サーバー側が開始確認を要求したとき | 「Start ?」ボタンを表示。クリックすると `start_question_answer()` を呼び出し、起動信号を送信 |
| `click`（カスタムボタン） | ユーザーが「press to start」または「Start ?」ボタンをクリックしたとき | `conform_start()` を呼び出し、サーバーに `{ type: 'conform_start', data: null }` メッセージを送信 |

### 受信するデータ型（サーバー側から）

1. **courseware**：指定されたタイプの教材コンテンツを再生
   ```json
   {
     "type": "courseware",
     "data": {
       "type": "audio|video|image|markdown",
       "url": "リソースURL"
     }
   }
   ```

2. **askready**：準備完了の確認を求める
   ```json
   {
     "type": "askready",
     "data": {
       "total_q": 5,
       "cur_q": 1
     }
   }
   ```

3. **question**：問題を配信
   ```json
   {
     "type": "question",
     "data": {
       "q_desc": "問題のHTMLまたはMDテキスト",
       "total_q": 5,
       "cur_q": 1
     }
   }
   ```

4. **result**：回答結果の統計を返す
   ```json
   {
     "type": "result",
     "data": {
       "total_q": 5,
       "correct_cnt": 3,
       "error_cnt": 2
     }
   }
   ```

5. **error_list**：エラー詳細リスト
   ```json
   {
     "type": "error_list",
     "data": {
       "error_cnt": 2,
       "rows": [
         {
           "pos": 1,
           "q_desc": "第1問の問題文",
           "your_a": "あなたの回答",
           "corrent_a": "正しい回答",
           "error_desc": "エラー理由の説明"
         }
       ]
     }
   }
   ```

### 送信するメッセージ型（クライアント → サーバー）

1. **qa_start**：接続成功後に自動送信。処理開始可能であることを示す
   ```json
   { "type": "qa_start", "data": { "d": "test data", "v": 100 } }
   ```

2. **conform_start**：ユーザーが開始ボタンをクリック後に送信
   ```json
   { "type": "conform_start", "data": null }
   ```

3. **text_answer**：テキスト回答を提出
   ```json
   { "type": "text_answer", "data": "ユーザー入力内容" }
   ```

4. **audio_answer**：録音回答を提出（Base64エンコード）
   ```json
   { "type": "audio_answer", "data": "base64音声文字列" }
   ```

> すべてのメッセージは内部の `WebSocket` インスタンスを通じて送信され、`this.ws.send(message)` を使用。