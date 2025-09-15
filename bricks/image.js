var bricks = window.bricks || {};
bricks.Image = class extends bricks.JsWidget {
	/* 
	{
		url:
		height:
		width:
	}
	*/
	constructor(opts){
		super(opts);
		this.opts = opts;
		if (this.opts.url){
			this.set_url(this.opts.url);
		}
	}
	create(){
		this.dom_element = document.createElement('img');
	}
	removeBase64Header(base64String) {
		return base64String.replace(/^data:[^;]*;base64,/, '');
	}
	base64(){
		const image = this.dom_element;
		// 创建一个画布来绘制图像
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		// 设置画布大小与图像相同
		canvas.width = image.width;
		canvas.height = image.height;

		// 将图像绘制到画布上
		ctx.drawImage(image, 0, 0);

		// 获取画布数据并转换为 base64
		var dataURL = canvas.toDataURL('image/png'); // 可以根据需要修改图像格式
		// dataURL = this.removeBase64Header(dataURL);
		return dataURL;
	}
	set_url(url){
		this.url = url;
		if (this.opts.default_url) {
			this.dom_element.onerror = this.set_default_url.bind(this)
		}
		this.dom_element.src = url;
	}
	set_default_url(){
		console.log('default_url', this.opts.default_url);
		this.dom_element.onerror = null;
		this.dom_element.src = this.opts.default_url;
	}
}

bricks.Icon = class extends bricks.Image {
	constructor(opts){
		super(opts);
	}
	options_parse(){
		this.rate = this.rate || 1;
		var siz = bricks.app.charsize * this.rate + 'px';
		this.set_url(this.url)
		this.cwidth = this.opts.cwidth || 1;
		this.cheight = this.opts.cheight || 1;
		this.dynsize = this.opts.dynsize || true;
		this.charsize_sizing();
	}
}

bricks.StatedIcon = class extends bricks.Icon {
	/*
		states:[{state:aaa,url:} ,,]
		state:aaa,
	*/
	constructor(opts){
		super(opts);
	}
	options_parse(){
		if (! this.states){
			return;
		}
		if (! this.state){
			this.state = this.states[0].state;
		}
		this.set_state(this.state);
	}
	set_state(state){
		this.state = state;
		this.states.forEach(s => {
			if(s.state == this.state){
				this.url = s.url
				super.options_parse();
			}
		});
	}
}

bricks.BlankIcon = class extends bricks.JsWidget {
	constructor(opts){
		super(opts);
		this.rate = opts.rate || 1;
		this.cwidth = this.opts.cwidth || 1;
		this.cheight = this.opts.cheight || 1;
		this.dynsize = this.opts.dynsize || true;
		this.charsize_sizing();
	}
}

bricks.Factory.register('Image', bricks.Image);
bricks.Factory.register('StatedIcon', bricks.StatedIcon);
bricks.Factory.register('Icon', bricks.Icon);
bricks.Factory.register('BlankIcon', bricks.BlankIcon);
