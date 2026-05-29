# VideoPlayer

**Widget Functionality**: A video player widget that supports multiple video formats (MP4, HLS `.m3u8`, DASH `.mpd`), with a built-in control bar supporting play/pause, volume adjustment, playback speed control, audio track switching, and fullscreen functionality.  
**Type**: Regular Widget  
**Parent Widget**: `bricks.VBox`

## Initialization Parameters

| Parameter | Type    | Description |
|---------|--------|-------------|
| `url`     | String | URL of the video resource; supports `.mp4`, `.m3u8` (HLS), and `.mpd` (DASH) formats |
| `autoplay`| Boolean | Whether to autoplay the video; default is `false` |

> Example:
> ```js
> new bricks.VideoPlayer({
>   url: 'https://example.com/video.m3u8',
>   autoplay: true
> });
> ```

## Main Events

| Event Name     | Trigger Condition |
|---------------|-------------------|
| `domon`       | Triggered when the widget is mounted to the DOM; used to initialize the player |
| `domoff`      | Triggered when the widget is removed from the DOM; used to release player resources |
| `click`       | Clicking the playback area shows the control bar and starts a hide countdown timer |
| `play_ok`     | (Used by `Iptv`) Externally monitored event indicating successful video playback start |
| `play_failed` | (Used by `Iptv`) Triggered when video fails to load or cannot play |

> Note: `play_ok` and `play_failed` are not directly dispatched by `VideoPlayer`. Instead, they are manually triggered by its subclasses or composite widgets (e.g., `Iptv`) after state evaluation.

---

# Iptv

**Widget Functionality**: A playback widget designed specifically for IPTV scenarios. It dynamically fetches channel information and automatically loads the `VideoPlayer` for playback. It also supports reporting playback success/failure status to the server.  
**Type**: Container Widget  
**Parent Widget**: `bricks.VBox`

## Initialization Parameters

| Parameter         | Type    | Description |
|------------------|--------|-------------|
| `iptv_data_url`   | String | API URL for fetching channel data; returns JSON containing fields such as `url`, `tv_name`, and `id` |
| `playok_url`      | String | Optional endpoint URL to report successful playback via GET request |
| `playfailed_url`  | String | Optional endpoint URL to report failed playback via GET request |

> Example:
> ```js
> new bricks.Iptv({
>   iptv_data_url: '/api/iptv/channel',
>   playok_url: '/api/report/playok',
>   playfailed_url: '/api/report/playfailed'
> });
> ```

## Main Events

| Event Name     | Trigger Condition |
|---------------|-------------------|
| `play_ok`     | When the internal `VideoPlayer` successfully starts playing, sends a GET request to `playok_url` to report |
| `play_failed` | When the `VideoPlayer` fails to play, sends a GET request to `playfailed_url` to report |

> Note: These events are indirectly triggered by listening to low-level behaviors of `VideoPlayer` (e.g., metadata loaded successfully without errors). Currently relies on business logic for judgment.

### Method Description

- `setValue(data)`: Updates the current channel data (e.g., switching channels), synchronously updating the title and video source.
  - Parameter `data`: An object containing `url`, `tv_name`, and `id`
  - Example:
    ```js
    iptvWidget.setValue({
      id: "cctv1",
      tv_name: "CCTV-1 Comprehensive",
      url: "https://live.example.com/cctv1.m3u8"
    });
    ```