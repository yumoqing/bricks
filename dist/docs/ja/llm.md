# LlmMsgAudio

**コントロール機能**：音声メッセージストリームを処理し、中国語および非中国語の句読点による分節に対応。モデルから返された音声応答をオーディオプレーヤーで再生します。  
**タイプ**：通常コントロール  
**親コントロール**：`bricks.UpStreaming`

## 初期化パラメータ

| パラメータ名 | 型 | 説明 |
|--------|------|------|
| opts | Object | 親クラスに渡される設定オプション。`UpStreaming` が処理します。 |

> 注意：このコントロール内部では以下のプロパティが初期化されています。
> - `olddata` / `data`：テキストデータを蓄積するための変数
> - `cn_p` / `other_p`：中国語および英語でよく使われる句読点の配列
> - `audio`：`AudioPlayer({})` で作成されたオーディオ再生インスタンス

## 主なイベント

明示的なイベントバインドはありませんが、以下のメソッドがデータストリーム処理のために上書きされています：
- `send(data)`：増分テキストを受け取り、言語ごとの句読点に基づいて分割し、再生可能なセグメントを送信
- `go()`：リクエストを発行し、応答内容に基づいてオーディオソースを設定して音声を再生

---

# ModelOutput

**コントロール機能**：大規模モデルの出力内容を表示。動的更新、実行状態の表示、ユーザー評価（「いいね」／「よくないね」）、およびTTS音声再生機能をサポートしています。  
**タイプ**：コンテナコントロール  
**親コントロール**：`bricks.VBox`

## 初期化パラメータ

| パラメータ名 | 型 | 必須 | 説明 |
|--------|------|------|------|
| opts.modelname | String | 否 | 表示するモデル名 |
| opts.icon | String | 否 | モデルアイコンのURL。省略時はデフォルトのLLMアイコンを使用 |
| opts.response_mode | String | 否 | 応答モード：`stream`, `sync`, `async` |
| opts.estimate_url | String | 否 | ユーザー評価（いいね／よくないね）を送信するAPIアドレス |
| opts.textvoice | Boolean | 否 | 音声読み上げ機能を有効にするかどうか |
| opts.tts_url | String | 否 | 音声生成に使用するTTSサービスのAPIアドレス |

## 主なイベント

| イベント名 | 発火条件 | コールバック関数 |
|--------|---------|--------|
| click (on like icon) | ユーザーが「いいね」アイコンをクリック | `estimate_llm(icon, 1)` |
| click (on unlike icon) | ユーザーが「よくないね」アイコンをクリック | `estimate_llm(icon, -1)` |

> その他の動作：
> - `update_data(data)`：モデル出力データを受け取り、表示内容を更新
> - `finish()`：ストリーム終了時に呼び出され、現時点ではログ出力のみ

---

# LlmModel

**コントロール機能**：単一の大規模モデルの呼び出しロジックをカプセル化。入力前処理、リクエスト送信、応答ストリーム処理、結果レンダリングを含みます。同期／ストリーム／非同期など複数のインタラクションモードをサポート。  
**タイプ**：通常コントロール  
**親コントロール**：`bricks.JsWidget`

## 初期化パラメータ

| パラメータ名 | 型 | 必須 | 説明 |
|--------|------|------|------|
| llmio | Object | はい | 所属する `LlmIO` インスタンス。設定の共有に使用 |
| opts.model | String | はい | モデル識別子 |
| opts.modelname | String | はい | 表示用名称 |
| opts.url | String | はい | モデルAPIアドレス |
| opts.icon | String | 否 | カスタムアイコンパス |
| opts.params | Object | 否 | 追加のリクエストパラメータ |
| opts.user_message_format | String | 否 | ユーザーメッセージテンプレート形式 |
| opts.system_message_format | String | 否 | システムメッセージテンプレート形式 |
| opts.llm_message_format | Object | 否 | アシスタントメッセージの構造定義 |
| opts.use_session | Boolean | 否 | 会話コンテキストを保持するかどうか |
| opts.input_from | String | 否 | 入力元の識別子 |
| opts.textvoice | Boolean | 否 | 音声出力を有効にするかどうか |
| opts.tts_url | String | 否 | TTSインターフェースアドレス |
| opts.response_mode | String | はい | リクエストモード：`stream`, `sync`, `async` |

## 主なイベント

| イベント名 | 発火条件 | コールバック関数 |
|--------|----------|--------|
| click (on title) | モデルタイトル領域をクリック | `show_setup_panel(event)` —— サブクラスで拡張可能 |

> 内部主要メソッド：
> - `model_inputed(data)`：入力データ受信後にモデルリクエストをトリガー
> - `chunk_response(mout, line)`：ストリーム応答内の各データチャンクを処理
> - `is_accept_source(source)`：特定のソースからのデータを受け入れるかどうかを判定

---

# LlmIO

**コントロール機能**：全体のLLM対話インターフェースの中心となるコンテナ。複数のモデルインスタンス、入力ポップアップ、知識ベース設定、ユーザー入力および出力表示を管理。複数モデルの協調動作を統一的に制御する入口を提供。  
**タイプ**：コンテナコントロール  
**親コントロール**：`bricks.VBox`

## 初期化パラメータ

| パラメータ名 | 型 | 必須 | 説明 |
|--------|------|------|------|
| opts.user_icon | String | 否 | ユーザーアイコンのURL |
| opts.list_models_url | String | 否 | 使用可能なモデル一覧を取得するAPIアドレス |
| opts.input_fields | Array | はい | フォームフィールド定義（例：prompt、temperatureなど） |
| opts.models | Array | はい | 初期ロードするモデル設定の配列 |
| opts.tts_url | String | 否 | グローバルTTSサービスアドレス |
| opts.get_kdb_url | String | 否 | 知識ベース一覧を取得するAPIアドレス |
| opts.estimate_url | String | 否 | ユーザーフィードバック送信アドレス |
| opts.enabled_kdb | Boolean | 否 | 知識ベース強化機能を有効にするかどうか |

> `models` の例：
> ```js
> {
>   model: "qwen",
>   modelname: "通義千問",
>   url: "/api/llm/qwen",
>   response_mode: "stream"
> }
> ```

## 主なイベント

| イベント名 | 発火条件 | コールバック関数 |
|--------|----------|--------|
| click (i_w) | 入力ボタンをクリック | `open_input_widget(event)` —— 入力フォームをポップアップ |
| click (nm_w) | モデル追加ボタンをクリック | `open_search_models(event)` —— モデル選択パネルをポップアップ |
| click (kdb_w) | 知識ベース設定ボタンをクリック | `setup_kdb(event)` —— KDB設定フォームを開く |
| submit (in form) | ユーザーが入力フォームを送信 | `handle_input(event)` —— 入力を各モデルに配布 |
| record_click (in Cols) | モデルレコードを選択 | `add_new_model(event)` —— 新しいモデルインスタンスを追加 |
| submit (in kdb form) | 知識ベース設定を送信 | `handle_kdb_setup(event)` —— 設定を保存して適用 |

> その他の主な動作：
> - `show_input(params)`：チャットエリアにユーザー入力を表示
> - `show_added_model(m)`：新しいモデルインスタンスを登録・表示