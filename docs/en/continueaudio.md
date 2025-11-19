# ContinueAudioPlayer

**Control Functionality**:  
`ContinueAudioPlayer` is a Web Audio API control designed for continuous audio playback. It supports receiving audio data (such as Base64-encoded audio chunks) via WebSocket and enables seamless, uninterrupted playback. It provides functionalities including play, pause, resume, restart, volume adjustment, and mute toggle.

**Type**: Standard Control  
**Parent Control**: `bricks.VBox`

## Initialization Parameters

| Parameter Name     | Type     | Description |
|-------------------|----------|-------------|
| `ws_url`          | string   | (Optional) The WebSocket server URL used to receive audio stream data. (Note: This control does not directly implement WebSocket connection logic; external integration is required.) |
| `onStart`         | function | Callback function triggered when audio playback starts. |
| `onEnd`           | function | Callback function triggered when the current audio track finishes playing. |
| `onPause`         | function | Callback function triggered when playback is paused. |
| `onResume`        | function | Callback function triggered when playback resumes. |
| `onVolumeChange`  | function | Callback function triggered when volume changes or mute state toggles; receives the current output volume value (0 when muted, otherwise the actual volume level). |

> Example:
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

## Main Events

| Event Name         | Trigger Condition |
|--------------------|-------------------|
| `onStart`          | Triggered when `handleAudioTrack` successfully decodes and begins playing audio. |
| `onEnd`            | Triggered when the current audio source finishes playback (`source.onended`). |
| `onPause`          | Triggered after calling `pauseAudio` and successfully pausing the audio context. |
| `onResume`         | Triggered after calling `resumeAudio` and successfully resuming the audio context. |
| `onVolumeChange`   | Triggered when calling `setVolume` or `toggleMute` results in a change in output volume; passes the current effective volume value (0 when muted). |