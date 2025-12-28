# DynamicAccordion

**コントロール機能**: 動的かつ折りたたみ可能なリストコントロール。ページネーションによる読み込み、リモートデータの取得、コンテンツの遅延読み込み（ラジーロード）、および追加・編集・削除・照会操作やツールバーのカスタマイズをサポートしています。大量の折りたたみ式構造化データを表示するのに適しています。  
**タイプ**: コンテナーコントロール  
**親クラスコントロール**: bricks.VScrollPanel

## 初期化パラメータ

| パラメータ名 | 型 | 説明 |
|--------------|----|------|
| `data_url` | String | リストデータを読み込むためのデータリクエストURL |
| `data_method` | String | リクエストメソッド（GET/POSTなど）。デフォルトは GET |
| `cache_limit` | Number | キャッシュされるページ数の制限。メモリ上に保持されるデータページの数を制御します |
| `page_rows` | Number | 1ページあたりにリクエストするデータ行数 |
| `row_cheight` | Number | 各行の高さ係数。デフォルト値は `1.5` |
| `record_view` | Object/String | 各レコードのタイトル領域におけるレンダリングテンプレート（ウィジェットの記述または名称） |
| `content_rely_on` | String | コンテンツの展開可否を判断するフィールド名 |
| `content_rely_value` | Any | `content_rely_on` フィールドの値がこの値と等しい場合にのみコンテンツを読み込みます |
| `editable` | Object | 編集設定オブジェクト。新規追加、更新、削除に関する設定を含みます |
| &nbsp;&nbsp;`.add_icon` | String | 新規追加ボタンのアイコンパス |
| &nbsp;&nbsp;`.update_icon` | String | 更新ボタンのアイコンパス |
| &nbsp;&nbsp;`.delete_icon` | String | 削除ボタンのアイコンパス |
| &nbsp;&nbsp;`.form_cheight` | Number | フォームの高さ係数 |
| &nbsp;&nbsp;`.new_data_url` | String | 新規レコード追加時の送信先URL |
| &nbsp;&nbsp;`.update_data_url` | String | レコード更新時の送信先URL |
| &nbsp;&nbsp;`.delete_data_url` | String | レコード削除時の送信先URL |
| `fields` | Array | フィールド定義の配列。フォームおよびデータ表示に使用されます |
| `record_toolbar` | Object | 各行右側のツールバー設定（アイコンボタングループ） |
| `record_toolbar_collapsable` | Boolean | ツールバーが折りたたみ可能かどうか（現時点では詳細未実装） |
| `header` | Object | 表ヘッダーの設定（予約済み） |
| `content_view` | Object/String | 展開後のコンテンツ領域のレンダリングテンプレート |
| `title` | String | コントロール上部のタイトルテキスト（任意） |
| `description` | String | コントロールの説明テキスト（任意） |
| `toolbar` | Object | 上部ツールバーの設定（`IconTextBar` に渡されます） |

## 主なイベント

| イベント名 | 発生条件 | パラメータ |
|------------|----------|-----------|
| `row_selected` | ユーザーが特定の行をクリックしたときに発生 | `info`: クリックされた `AccordionInfo` インスタンス |
| カスタムイベント（`record_toolbar.tools[i].name` で定義） | 行内のカスタムツールボタンがクリックされたときに発生 | `record`: その行のデータオブジェクト |
| `conformed`（内部使用） | 削除確認ポップアップでユーザーが「確認」をクリックした後に発生 | `delete_record_act` メソッドに引き渡して処理 |
| `submited`（ネストされたフォーム） | 新規追加／編集フォームの送信が成功した後に発生 | 応答データ `event.params` |
| `cancel`（ネストされたフォーム） | フォームのキャンセル操作時に発生 | 現在の編集領域を閉じる |

> 注：一部のイベントはサブコンポーネントによって発火され、`DynamicAccordion` が監視して処理を行います。例：`submited`、`cancel`、`click` など。