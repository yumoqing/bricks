var bricks = window.bricks || {};
/* 
reply on "https://github.com/markedjs/marked"
add following lines before 'bricks.js'
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
*/

bricks.MdWidget = class extends bricks.JsWidget {
	/* options
	{
		"mdtext":
		"md_url":
		"method":"GET"
		"params":{}
	}
	*/

	constructor(options){
		super(options);
		if (this.mdtext){
			this.md_content = this.mdtext;
			this._build1();
		} else {
			var f = this.build.bind(this);
			this.load_event = new Event('loaded');
			this.dom_element.style.overFlow='auto';
			window.addEventListener('scroll', this.show_scroll.bind(this));
			schedule_once(f, 0.01);
		}
	}
	set_content(content){
		this.md_content = content;
		this._build1();
	}
	show_scroll(event){
		bricks.debug('scrollY=', window.scrollY);
	}
	async build(){
		if (! this.opts.md_url){
			return;
		}
		this._build(this.opts.md_url);
	}
	async _build(md_url){
		var md_content = await (bricks.tget(md_url));
		this.md_content = md_content;
		this._build1();
		this.dispatch('loaded', {'url':md_url});
	}
	_build1(){
		this.dom_element.innerHTML = marked.parse(this.md_content);
		/* change links in markdown to a bricks action */
		var links = this.dom_element.getElementsByTagName('a');
		var host = location.origin;
		for (var i=0; i<links.length; i ++){
			var url = links[i].href;
			/* 外链（http/https 且非当前源）：新窗口打开，不拦截。
			   references 来源可查证（招标原文/政府网站等）。 */
			if (/^https?:\/\//i.test(url) && url.indexOf(host) !== 0){
				links[i].target = '_blank';
				links[i].rel = 'noopener noreferrer';
				links[i].onclick = null;
				continue;
			}
			links[i].href = '#';
			links[i].onclick=this._build.bind(this, url);
		}
		/* 媒体下载按钮：必须在上面的链接处理循环【之后】注入——否则同源 <a download>
		   会被循环改成 onclick=_build（把 mp4 当 markdown 加载，下载不了）。
		   marked 原生透传渲染 img/video/audio，这里只追加下载入口，不动渲染。 */
		this._add_media_download_buttons();
	}
	/* 给已渲染的 <img>/<video>/<audio> 各加一个下载按钮（2026-09-08 用户定夺：
	   会话 agent 生成的媒体必须提供下载按钮）。下载走 ?download=1 →
	   ahserver path_download 返回 Content-Disposition:attachment 触发浏览器下载。 */
	_add_media_download_buttons(){
		var host = location.origin;
		var nodes = this.dom_element.querySelectorAll('img, video, audio');
		for (var i=0; i<nodes.length; i++){
			var el = nodes[i];
			if (el.getAttribute('data-dl-bound')) continue;  // 幂等：已加过
			el.setAttribute('data-dl-bound', '1');
			/* 取媒体 URL：video/audio 可能用子 <source src> */
			var src = el.currentSrc || el.src || '';
			if (!src){
				var so = el.querySelector('source');
				if (so) src = so.src || so.getAttribute('src') || '';
			}
			if (!src) continue;
			var href, is_data = src.indexOf('data:') === 0;
			if (is_data){
				href = src;  /* 内联 base64：直接用 download 属性 */
			} else {
				/* 同源媒体（/idfile 落地文件）加 ?download=1 强制附件下载；
				   外链媒体保持原 URL（跨域 download 属性无效，靠浏览器行为） */
				var sep = src.indexOf('?') >= 0 ? '&' : '?';
				href = (src.indexOf(host) === 0 || src.charAt(0) === '/')
					? src + sep + 'download=1' : src;
			}
			/* 文件名：URL 末段（去 query），data URL 用媒体类型兜底 */
			var fname = '';
			if (!is_data){
				fname = decodeURIComponent(src.split('?')[0].split('/').pop() || '');
			}
			if (!fname){
				fname = 'download_' + Date.now() + '.' + (el.tagName === 'IMG' ? 'png'
					: el.tagName === 'VIDEO' ? 'mp4' : 'mp3');
			}
			var a = document.createElement('a');
			a.href = href;
			a.setAttribute('download', fname);
			a.textContent = '⬇ 下载';
			a.className = 'md-media-download';
			a.style.cssText = 'display:inline-block;margin:4px 0;padding:2px 10px;'
				+ 'font-size:12px;color:#fff;background:#2563eb;border-radius:6px;'
				+ 'cursor:pointer;text-decoration:none;';
			/* 同源链接已被上面循环处理过；本 <a> 是新建的，不会被再处理。
			   显式置空 onclick 防冒泡到父级链接拦截。 */
			a.onclick = function(e){ e.stopPropagation(); };
			if (is_data || href.indexOf(host) === 0 || href.charAt(0) === '/'){
				/* 同源/内联：a[download] 直接触发下载，不跳转 */
			} else {
				a.target = '_blank';
				a.rel = 'noopener noreferrer';
			}
			/* 插在媒体元素之后（同一父容器内） */
			if (el.nextSibling){
				el.parentNode.insertBefore(a, el.nextSibling);
			} else {
				el.parentNode.appendChild(a);
			}
		}
	}
	getname(){
		return this.name || 'mdtext';
	}
	getValue(){
		var name = this.getname();
		var d = {}
		d[name] = this.md_content
		return d;
	}
	setValue(v){
		this.md_content = v;
	}
}
bricks.MarkdownViewer = class extends bricks.VBox {
	/* options 
	{
		navigator:true
		recommentable:false
		md_url:
		mdtext:
		method:"GET",
		params:{}
	}
	*/
	constructor(options){
		super(options);
		this.back_stack = [];
		this.md_url = bricks.absurl(this.opts.md_url);
		if (this.opts.navigator){
			this.createBackButton();
		}
		this.mdtext = new bricks.MdWidget({
			mdtext:this.mdtext,
			method:this.method,
			params:this.params,
			md_url:this.md_url
		});
		this.add_widget(this.mdtext);
		this.mdtext.bind('loaded', this.add_back_stack.bind(this));
		this.dom_element.style.overflow='auto';
		this.dom_element.style.height='100%';
		this.bind('scroll', this.show_scroll.bind(this));
	}
	show_scroll(event){
		bricks.debug('scrollY=', window.scrollY);
	}
	async createBackButton(){
		var desc = {
			"widgettype":"HBox",
			"options":{},
			"subwidgets":[
				{
					"widgettype":"Text",
					"options":{
						"text":"<<<<<<<"
					}
				}
			]
		}
		var w = await bricks.widgetBuild(desc);
		bricks.debug('createBackButton():error, desc=', desc, 'w=', w);
		var t = w.children[0];
		bricks.debug('createBackButton():text=',t);
		t.bind('click',this.go_back.bind(this));
		this.add_widget(w);
		bricks.debug('createBackButton():desc=',desc, 'w=', w);
	}
	add_back_stack(event){
		bricks.debug('go_back_stack():event=', event);
		var url = event.params.url;
		this.back_stack.push(url);
	}
	async go_back(event){
		if (this.back_stack.length < 2){
			return;
		}
		// ignore the current text url
		this.back_stack.pop();
		// get the back url
		var url = this.back_stack.pop();
		await this.mdtext._build(url);
	}

	async build(){
		await this._build(this.opts.md_url);
	}
	async _build(md_url){
		var md_content = await (bricks.tget(md_url));
		this.md_el.innerHTML = marked.parse(md_content);
		// this.md_el.baseURI = md_url;
		
		/* change links in markdown to a bricks action */
		var links = this.md_el.getElementsByTagName('a');
		var host = location.origin;
		for (var i=0; i<links.length; i ++){
			var url = links[i].href;
			if (/^https?:\/\//i.test(url) && url.indexOf(host) !== 0){
				links[i].target = '_blank';
				links[i].rel = 'noopener noreferrer';
				links[i].onclick = null;
				continue;
			}
			links[i].href = '#';
			links[i].onclick=this._build.bind(this, url);
		}
	}
}

bricks.Factory.register('MarkdownViewer', bricks.MarkdownViewer);
bricks.Factory.register('MdWidget', bricks.MdWidget);
