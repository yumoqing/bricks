var bricks = window.bricks || {};

bricks.ContinueAudioPlayer = class extends bricks.VBox {
    constructor(options) {
	super(options);
        this.ws_url = options.ws_url;
        this.options = options || {};
        this.audioContext = null;
        this.gainNode = null;
        this.nextStartTime = 0;
        this.started = false;
        this.muted = false;
        this.volume = 1.0;

        this.initAudioContext();
    }

    initAudioContext() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.volume;
        this.gainNode.connect(this.audioContext.destination);

        this.nextStartTime = this.audioContext.currentTime;
        this.started = true;
    }

    base64ToArrayBuffer(base64) {
        const binaryStr = atob(base64);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }
        return bytes.buffer;
    }

    handleAudioTrack(arrayBuffer) {
        this.audioContext.decodeAudioData(arrayBuffer).then(decodedBuffer => {
            const source = this.audioContext.createBufferSource();
            source.buffer = decodedBuffer;
            source.connect(this.gainNode);

            const startTime = Math.max(this.audioContext.currentTime, this.nextStartTime);
            source.start(startTime);

            this.nextStartTime = startTime + decodedBuffer.duration;

            if (typeof this.options.onStart === 'function') {
                this.options.onStart();
            }

            source.onended = () => {
                if (typeof this.options.onEnd === 'function') {
                    this.options.onEnd();
                }
            };
        }).catch(err => {
            console.error("Error decoding audio data:", err);
        });
    }

    /**
     * ⏸ 暂停播放
     */
    pauseAudio() {
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend().then(() => {
                if (typeof this.options.onPause === 'function') {
                    this.options.onPause();
                }
            });
        }
    }

    /**
     * ▶️ 恢复播放
     */
    resumeAudio() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                if (typeof this.options.onResume === 'function') {
                    this.options.onResume();
                }
            });
        }
    }

    /**
     * 🔁 重新开始播放
     */
    restart() {
        console.log("Restarting audio playback...");
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close().then(() => {
                this.initAudioContext();
            });
        } else {
            this.initAudioContext();
        }
    }

    /**
     * 🔊 设置音量（0.0 - 1.0）
     */
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.gainNode) {
            this.gainNode.gain.value = this.muted ? 0 : this.volume;
        }
        this.emit('onVolumeChange', this.volume);
    }

    /**
     * 🔇 切换静音
     */
    toggleMute() {
        this.muted = !this.muted;
        this.gainNode.gain.value = this.muted ? 0 : this.volume;
        this.emit('onVolumeChange', this.muted ? 0 : this.volume);
    }

    /**
     * 🧩 触发事件回调
     */
    emit(eventName, ...args) {
        if (typeof this.options[eventName] === 'function') {
            this.options[eventName](...args);
        }
    }
}

bricks.Factory.register('ContinueAudioPlayer', bricks.ContinueAudioPlayer);
