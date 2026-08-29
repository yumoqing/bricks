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
