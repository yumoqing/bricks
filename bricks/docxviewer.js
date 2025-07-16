/* need mammoth module
<script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.2/mammoth.browser.min.js"></script>
*/
var bricks = window.bricks || {};

bricks.DOCXviewer = class extends bricks.VBox {
	/*
	url:
	*/
	constructor(opts){
		super(opts);
		this.bind('on_parent', this.set_url.bind(this));
		// schedule_once(this.set_url.bind(this, this.url), 0.2);
	}
	async set_url(url){
		var container = this.dom_element
		var hab = new bricks.HttpArrayBuffer();
		var ab = await hab.get(this.url);
		var result = await mammoth.convertToHtml({ arrayBuffer: ab });
		container.innerHTML = result.value;
	}
}

function extractBodyContent(htmlString) {
  // 正则表达式匹配<body>和</body>之间的内容
  const regex = /<body[^>]*>([\s\S]*?)<\/body>/i;
  const matches = htmlString.match(regex);
  return matches ? matches[1] : null; // 如果匹配到，返回匹配的内容，否则返回null
}

bricks.EXCELviewer = class extends bricks.VBox {
	constructor(opts){
		opts.height = "100%",
		super(opts);
		this.sheets_w = new bricks.HBox({cheight:3, width:'100%'});
		this.sheets_w.set_css('scroll');
		this.cur_sheetname = null;
		this.container = new bricks.Filler({});
		this.add_widget(this.container);
		this.add_widget(this.sheets_w);
		this.bind('on_parent', this.set_url.bind(this));
	}
	async set_url(url){
		this.sheets_w.clear_widgets();
		var hab = new bricks.HttpArrayBuffer();
		var ab = await hab.get(this.url);
		const data = new Uint8Array(ab);
		this.workbook = XLSX.read(data, {type: 'array'});
		this.workbook.SheetNames.forEach((sheetname, index) => {
			var w = new bricks.Text({text:sheetname, wrap:false});
			w.set_css('clickable');
			w.set_style('padding', '10px');
			w.bind('click', this.show_sheet_by_name.bind(this, sheetname, w));
			this.sheets_w.add_widget(w);
			if (index==0){
				this.show_sheet_by_name(this.workbook.SheetNames[0], w);
			}
		});
	}
	show_sheet_by_name(sheetname, tw){
		if (this.cur_sheetname == sheetname) return;
		this.sheets_w.children.forEach(c => c.set_css('selected', true));
		tw.set_css('selected');
		const x = new bricks.VScrollPanel({width: '100%', height: '100%'});
		const sheet = this.workbook.Sheets[sheetname];
		// const html = extractBodyContent(XLSX.utils.sheet_to_html(sheet));
		const html = XLSX.utils.sheet_to_html(sheet);
		x.dom_element.innerHTML = html;
		this.container.clear_widgets();
		this.container.add_widget(x);
		this.cur_sheetname = sheetname;
	}
}

bricks.PDFviewer = class extends bricks.VBox {
	/*
	url:
	*/
	constructor(opts){
		opts.width = '100%';
		super(opts);
		this.bind('on_parent', this.set_url.bind(this));
	}
	async set_url(url){
		var container = this.dom_element
		var hab = new bricks.HttpArrayBuffer();
		var ab = await hab.get(this.url);
		const task = pdfjsLib.getDocument({ data: ab });
		task.promise.then((pdf) => {
			this.pdf = pdf;
			for (let i = 1; i <= this.pdf.numPages; i++) {
				this.pdf.getPage(i).then((page) => {
					this.add_page_content(page);
				});
			}
		}).catch((err) => {
			console.log('error');
		})
	}
	add_page_content(page){
		const scale = 1.5;
		const viewport = page.getViewport({ scale });
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		canvas.height = viewport.height;
		canvas.width = viewport.width;
		page.render({ canvasContext: context, viewport });
		var w = new bricks.JsWidget();
		w.dom_element.appendChild(canvas);
		this.add_widget(w);
		if (i < this.pdf.numPages){
			w = new bricks.Splitter();
			this.add_widget(w)
		} 
	}
}
bricks.Factory.register('DOCXviewer', bricks.DOCXviewer);
bricks.Factory.register('EXCELviewer', bricks.EXCELviewer);
bricks.Factory.register('PDFviewer', bricks.PDFviewer);
