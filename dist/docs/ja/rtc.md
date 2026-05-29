# VideoBox

**コントロール機能**：ページ内に `<video>` 要素を作成・管理するためのもので、音声・映像ストリーム（MediaStream）の設定をサポートしており、主にローカルまたはリモートのビデオレンダリングに使用されます。  
**タイプ**：通常コントロール（UI コントロール）  
**親クラス**：`bricks.JsWidget`

## 初期化パラメータ

明示的なコンストラクタはなく、`create()` メソッド呼び出し時に自動的にDOM要素が生成され、以下のデフォルト属性が設定されます：
- `autoplay: true`：自動再生
- `muted: true`：ミュート再生

## 主なイベント

カスタムイベントは公開されていませんが、内部ではネイティブの `<video>` 要素のイベント（例：`play`、`pause` など）を使用しています。外部からの制御用に以下のメソッドを提供します：
- `set_stream(stream)`：video 要素に MediaStream を設定
- `get_stream()`：現在バインドされている MediaStream を取得

---

# Signaling

**コントロール機能**：WebSocketによるシグナリングチャネルを実装し、ログイン、ハートビート、メッセージの送受信およびセッション管理を担当します。WebRTCにおけるマルチエンド通信の中心的な調整モジュールです。異なるタイプのセッションに対するメッセージハンドラー登録も可能です。  
**タイプ**：通常コントロール（非UIモジュール）  
**親クラス**：なし（独立クラス）

## 初期化パラメータ

| パラメータ | 型 | 説明 |
|----------|----|------|
| `signaling_url` | String | WebSocketサービスのアドレス |
| `info` | Object | 現在のクライアント識別情報（例：ユーザーIDなど）。各メッセージに付加して送信 |
| `connect_opts` | Object | 接続オプション。セッションハンドラーに渡される |
| `onclose` | Function | WebSocket切断時のコールバック |
| `onlogin` | Function | ログイン成功後、オンラインユーザー一覧を受け取ったときに発火 |
| `onopen` | Function | WebSocket接続確立時のコールバック（任意） |
| `heartbeat_period` | Number | ハートビート周期（秒単位）。0の場合は無効 |

## 主なイベント

`recvdata_handler` を通じて受信データを配信。主なメッセージタイプは以下の通り：
- `online`：ログイン応答。現在オンラインのユーザー一覧を含む
- `new_session`：新しいセッション作成要求
- カスタム sessiontype メッセージ：`add_sessionhandler()` で登録されたハンドラーによって処理

動的ハンドラー登録をサポート：
- `add_sessionhandler(sessiontype, handlerClass)`：特定のセッションタイプに対応するハンドラークラスを登録
- `add_handler(key, handler)`：指定した sessionid に対してメッセージハンドラーを追加

---

# RTCP2PConnect

**コントロール機能**：WebRTCのピアツーピア接続ロジックをカプセル化。メディアストリーム処理、データチャネル、シグナリング連携、ICEネゴシエーションなどを含み、音声・映像通話およびデータ転送を実現します。  
**タイプ**：通常コントロール（通信モジュール）  
**親クラス**：なし（独立クラス）

## 初期化パラメータ

| パラメータ | 型 | 説明 |
|----------|----|------|
| `signaling` | Signaling インスタンス | 上位層のシグナリングインスタンス。シグナリングメッセージの送受信に使用 |
| `session` | Object | 現在のセッションオブジェクト `{sessionid, sessiontype}` |
| `opts` | Object | 設定項目。以下のような構造： |

```js
{
  ice_servers: [],           // STUN/TURN サーバー設定
  peer_info: {},             // 相手側情報（callrequest 用）
  auto_callaccept: true,     // 呼び出しを自動承認するかどうか
  media_options: {            // getUserMedia のパラメータ
    video: true,
    audio: true
  },
  data_connect: true,        // データチャネルを確立するかどうか
  on_pc_connected: Function, // PeerConnection 接続成功時のコールバック
  on_pc_disconnected: Function, // PeerConnection 切断時のコールバック
  on_dc_open: Function,      // データチャネルオープン時のコールバック
  on_dc_close: Function,     // データチャネルクローズ時のコールバック
  on_dc_message: Function    // データチャネルからメッセージ受信時のコールバック
}
```

## 主なイベント

内部ハンドラーにより以下のシグナリングメッセージタイプを監視・応答：
- `sessioncreated`：セッション作成成功。接続プロセスを開始
- `callrequest`：着信要求を受信。auto_accept 設定時は自動応答
- `callaccepted`：相手が通話を承認。SDPネゴシエーション開始
- `offer`：SDP Offer 受信。Answer を返信
- `answer`：SDP Answer 受信。ネゴシエーション完了
- `icecandidate`：ICE候補を受信。PeerConnection に追加
- `sessionquit`：セッション終了。接続を閉じる

その他のランタイムイベント：
- `oniceconnectionstatechange`：ICE接続状態の変化
- `onconnectionstatechange`：接続状態の変化（connected/disconnected）
- `ondatachannel` / `ontrack`：リモートからのデータチャネルまたはメディアトラック到達

---

✅ **まとめ**：
- `VideoBox` は可視化コントロールであり、ビデオストリームの表示に使用されます。
- `Signaling` はシグナリングの中核で、サーバーとの通信を担当します。
- `RTCP2PConnect` は WebRTC 接続制御モジュールであり、ピアツーピア接続の全フローを処理します。

この3つが協調動作することで、完全なリアルタイム通信システムが構築されます。