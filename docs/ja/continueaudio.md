# ContinueAudioPlayer

**コントロール機能**：  
`ContinueAudioPlayer` は、Web Audio API を使用して音声を連続再生するためのコントロールです。WebSocket 経由で音声データ（Base64 エンコードされた音声チャンクなど）を受信し、途切れることなく再生できます。再生、一時停止、再開、再起動、音量調整、ミュート切り替えなどの機能を備えています。

**タイプ**：通常コントロール  
**親クラスコントロール**：`bricks.VBox`

## 初期化パラメータ

| パラメータ名       | 型      | 説明 |
|------------------|--------|----|
| `ws_url`         | string | （任意）音声ストリームデータを受信するための WebSocket サービスアドレス。（現在のコントロールでは WebSocket 接続のロジックを直接実装しておらず、外部での使用が必要です。） |
| `onStart`        | function | 音声の再生が開始されたときに呼び出されるコールバック関数。 |
| `onEnd`          | function | 現在の音声トラックの再生が終了したときに呼び出されるコールバック関数。 |
| `onPause`        | function | 再生が一時停止されたときに呼び出されるコールバック関数。 |
| `onResume`       | function | 再生が再開されたときに呼び出されるコールバック関数。 |
| `onVolumeChange` | function | 音量が変更されたか、ミュート状態が切り替わったときに呼び出され、現在の出力音量値（0 または実際の音量）が渡されます。 |

> 例：
> ```js
> new bricks.ContinueAudioPlayer({
>   ws_url: 'wss://example.com/audio-stream',
>   onStart: () => console.log('Audio started'),
>   onEnd: () => console.log('Audio ended'),
>   onPause: () => console.log('Paused'),
>   onResume: () => console.log('Resumed'),
>   onVolumeChange: (vol) => console.log('Volume:', vol)
> });
> ```

## 主なイベント

| イベント名             | 発生条件 |
|----------------------|--------|
| `onStart`            | `handleAudioTrack` を呼び出し、音声のデコードに成功して再生を開始したときに発生します。 |
| `onEnd`              | 現在の音声ソースの再生が完了したとき（`source.onended`）に発生します。 |
| `onPause`            | `pauseAudio` を呼び出してオーディオコンテキストの中断に成功したときに発生します。 |
| `onResume`           | `resumeAudio` を呼び出してオーディオコンテキストの再開に成功したときに発生します。 |
| `onVolumeChange`     | `setVolume` または `toggleMute` を呼び出し、出力音量が変化したときに発生します。引数として現在の有効な音量値（ミュート時は0）が渡されます。 |