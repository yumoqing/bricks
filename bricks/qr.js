var bricks = window.bricks || {};
bricks.QRCodeScan = class extends bricks.VBox {
	/*
	event: 
		recognized
			识别到二维码
			参数为识别到的正文
		stopped
			扫码已停止
			无参数
	*/
	constructor(opts){
		opts.width = '300px';
		opts.height = '300px';
		super(opts);
		this.scan_config = {
		  fps: 10,               // 每秒尝试识别次数
		  qrbox: { width: 250, height: 250 }, // 扫描框大小
		  aspectRatio: 1.0,      // 保持正方形
		  disableFlip: false     // 是否禁用镜像（移动端前置摄像头会镜像）
		};
		this.bind('click', this.stop.bind(this))
		schedule_once(this.start.bind(this), 0.5)
	}
	get_qr_result(decodedText, decodedResult){
		this.dispatch('recognized', decodedText)
		console.log('decodeText=', decodedText)
		this.scanner.stop()
	}
	errorhandle(msg){
		console.log("识别失败:", msg);
	}
	start(){
		this.scanner = new Html5Qrcode(this.widget_id);
		this.scanner.start({ facingMode: "environment" },
			this.scan_config,
			this.get_qr_result.bind(this),
			this.errorhandle.bind(this)
		).catch(err => {
			console.error('启动摄像头失败')
		});

	}
	stop(){
		if this.scanner && this.scanner.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
			this.scanner.stop()
			this.dispatch('stopped', decodedText)
		}
	}
}
bricks.Factory.register('QRCodeScan', bricks.QRCodeScan);
