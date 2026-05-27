# VideoBox

**Functionality**: Used to create and manage `<video>` elements within a page, supporting the setting of audio/video streams (MediaStream). Commonly used for rendering local or remote video.  
**Type**: Regular widget (UI component)  
**Parent Widget**: `bricks.JsWidget`

## Initialization Parameters

No explicit constructor; DOM element is automatically created and default attributes are set when calling the `create()` method:
- `autoplay: true`: Enables automatic playback
- `muted: true`: Mutes the audio by default

## Main Events

No custom events exposed, but internal logic uses native `<video>` element events (e.g., `play`, `pause`). The following methods are provided for external control:
- `set_stream(stream)`: Binds a MediaStream to the video element
- `get_stream()`: Retrieves the currently bound MediaStream

---

# Signaling

**Functionality**: Implements a WebSocket signaling channel for login, heartbeat, message transmission/reception, and session management. It serves as the core coordination module for multi-party WebRTC communication. Supports registering message handlers for different types of sessions.  
**Type**: Regular widget (non-UI module)  
**Parent Widget**: None (standalone class)

## Initialization Parameters

| Parameter | Type | Description |
|---------|------|-------------|
| `signaling_url` | String | WebSocket server URL |
| `info` | Object | Identity information of the current client (e.g., user ID), sent with every message |
| `connect_opts` | Object | Connection options passed to session handlers |
| `onclose` | Function | Callback triggered when WebSocket connection closes |
| `onlogin` | Function | Triggered upon successful login, returns list of currently online users |
| `onopen` | Function | Callback when WebSocket connection opens (optional) |
| `heartbeat_period` | Number | Heartbeat interval in seconds; 0 means disabled |

## Main Events

Incoming data is dispatched via `recvdata_handler`. Key message types include:
- `online`: Login response containing the list of currently online users
- `new_session`: Request to create a new session
- Custom sessiontype messages: Handled by processors registered via `add_sessionhandler()`

Supports dynamic registration of session handlers:
- `add_sessionhandler(sessiontype, handlerClass)`: Registers a handler class for a specific session type
- `add_handler(key, handler)`: Adds a message handler for a specific session ID

---

# RTCP2PConnect

**Functionality**: Encapsulates WebRTC peer-to-peer connection logic, including media stream handling, data channels, signaling interaction, and ICE negotiation. Enables audio/video calling and data transfer.  
**Type**: Regular widget (communication module)  
**Parent Widget**: None (standalone class)

## Initialization Parameters

| Parameter | Type | Description |
|----------|------|-------------|
| `signaling` | Signaling instance | Upper-layer signaling instance for sending and receiving signaling messages |
| `session` | Object | Current session object `{sessionid, sessiontype}` |
| `opts` | Object | Configuration options, structured as follows: |

```js
{
  ice_servers: [],           // STUN/TURN server configuration
  peer_info: {},             // Remote peer information (used in callrequest)
  auto_callaccept: true,     // Automatically accept incoming calls
  media_options: {           // Parameters for getUserMedia
    video: true,
    audio: true
  },
  data_connect: true,        // Whether to establish a data channel
  on_pc_connected: Function, // Callback when PeerConnection is successfully established
  on_pc_disconnected: Function, // Callback when PeerConnection disconnects
  on_dc_open: Function,      // Callback when DataChannel opens
  on_dc_close: Function,     // Callback when DataChannel closes
  on_dc_message: Function    // Callback when a message is received via DataChannel
}
```

## Main Events

Listens for and responds to the following signaling message types through built-in handlers:
- `sessioncreated`: Session successfully created; initiates connection process
- `callrequest`: Incoming call request; automatically responds if `auto_callaccept` is enabled
- `callaccepted`: Call accepted by remote party; begins SDP negotiation
- `offer`: Receives SDP Offer; replies with Answer
- `answer`: Receives SDP Answer; completes negotiation
- `icecandidate`: Receives ICE candidate; adds it to PeerConnection
- `sessionquit`: Session ends; closes connection

Other runtime events:
- `oniceconnectionstatechange`: ICE connection state changes
- `onconnectionstatechange`: Overall connection state changes (e.g., connected/disconnected)
- `ondatachannel` / `ontrack`: Fired when remote data channel or media track arrives

---

✅ **Summary**:
- `VideoBox` is a visual component used to display video streams.
- `Signaling` acts as the signaling hub, managing communication with the server.
- `RTCP2PConnect` is the WebRTC connection controller, handling the full lifecycle of peer-to-peer connections.

Together, these three components form a complete real-time communication system.