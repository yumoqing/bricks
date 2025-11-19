# VAD（语音活动检测）模块技术文档

> **基于 `@ricky0912/vad-web` 的 Web 端语音活动检测集成方案**

---

## 概述

本模块提供了一个轻量级的语音活动检测（Voice Activity Detection, VAD）功能封装，用于在浏览器环境中实时检测用户语音的开始与结束，并在语音结束后回调处理音频数据。该模块依赖于 [`vad-web`](https://www.npmjs.com/package/@ricky0123/vad-web) 库，底层使用 ONNX Runtime Web 实现高性能推理。

主要功能：
- 实时麦克风音频采集
- 自动检测语音段（Speech Segment）
- 在语音结束后触发回调，返回 `Float32Array` 格式的 16kHz 音频样本
- 支持动态启用/禁用 VAD

---

## 依赖引入

```html
<!-- 引入 ONNX Runtime Web（VAD 依赖） -->
<script src="https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.js"></script>

<!-- 引入 vad-web 库 -->
<script src="https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.7/dist/bundle.min.js"></script>
```

> ⚠️ 注意：必须按顺序加载 `ort.js` 后再加载 `vad-web`，否则会报错。

---

## API 接口

### `bricks.enable_vad(func)`

启动语音活动检测，并设置语音结束时的回调函数。

#### 参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `func` | `Function` | 回调函数，接收一个参数 `audio`，类型为 `Float32Array`，表示采样率为 16000Hz 的单声道音频数据 |

#### 示例

```javascript
bricks.enable_vad(function(audio) {
  console.log("语音结束，音频长度:", audio.length);
  // 可将 audio 发送到后端进行 ASR 识别等处理
});
```

#### 内部实现

```javascript
bricks.vad = await vad.MicVAD.new({
  onSpeechEnd: func
});
bricks.vad.start();
```

---

### `bricks.disable_vad()`

停止当前运行的 VAD 实例，并释放相关资源。

#### 行为说明
- 调用 `stop()` 方法停止麦克风监听和模型推理
- 将 `bricks.vad` 设置为 `null`，便于垃圾回收

#### 示例

```javascript
// 停止语音检测
bricks.disable_vad();
```

---

## 音频数据格式

- **采样率**：16000 Hz
- **位深**：32-bit float
- **声道**：单声道（Mono）
- **数据类型**：`Float32Array`
- **应用场景**：适用于大多数现代语音识别（ASR）模型输入要求

---

## 使用示例

```html
<!DOCTYPE html>
<html>
<head>
  <title>VAD Demo</title>
</head>
<body>
  <button onclick="startVAD()">开始语音检测</button>
  <button onclick="stopVAD()">停止语音检测</button>

  <script src="https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.7/dist/bundle.min.js"></script>
  <script>
    var bricks = window.bricks || {};
    
    bricks.enable_vad = async function(func){
      bricks.vad = await vad.MicVAD.new({
        onSpeechEnd: func
      });
      bricks.vad.start();
    };

    bricks.disable_vad = async function(){
      if (bricks.vad) {
        bricks.vad.stop();
        bricks.vad = null;
      }
    };

    function startVAD() {
      bricks.enable_vad((audio) => {
        console.log("捕获到语音片段，样本数:", audio.length);
        // 此处可上传至 ASR 服务或进行本地处理
      });
    }

    function stopVAD() {
      bricks.disable_vad();
    }
  </script>
</body>
</html>
```

---

## 注意事项

1. **浏览器权限**：首次运行时需请求麦克风权限，请确保页面在 HTTPS 环境下运行或本地调试（localhost）。
2. **性能优化**：`vad-web` 使用 WASM 和 ONNX 模型进行推理，首次加载可能需要几秒预热时间。
3. **内存管理**：务必在不需要时调用 `disable_vad()` 以释放麦克风资源，避免持续占用。
4. **版本锁定**：当前固定使用 `@ricky0123/vad-web@0.0.7`，建议生产环境保持版本稳定。

---

## 参考链接

- [vad-web GitHub 仓库](https://github.com/ricky0123/vad-web)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/intro.html)
- [Web Audio API 文档](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

## 版本信息

- **vad-web 版本**：`0.0.7`
- **兼容性**：支持现代主流浏览器（Chrome、Edge、Firefox、Safari）

--- 

📌 **提示**：此模块适合嵌入到低代码平台、语音助手、实时对话系统中，作为前端语音触发机制的核心组件。