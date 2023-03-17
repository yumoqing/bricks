/* 
reply on "https://github.com/markedjs/marked"
add following lines before 'bricks.js'
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
*/

class MdText extends JsWidget {
	/* options
	{
		"md_url":
		"method":"GET"
		"params":{}
	}
	*/

	constructor(options){
		super(options);
		var f = this.build.bind(this);
		this.load_event = new Event('loaded');
		this.dom_element.style.overFlow='auto';
		window.addEventListener('scroll', this.show_scroll.bind(this));
		schedule_once(f, 0.01);
	}
	show_scroll(event){
		console.log('scrollY=', window.scrollY);
	}
	build = async function(){
		this._build(this.opts.md_url);
	}
	_build = async function(md_url){
		var md_content = await tget(md_url);
		this.dom_element.innerHTML = marked.parse(md_content);
		
		/* change links in markdown to a bricks action */
		var links = this.dom_element.getElementsByTagName('a');
		for (var i=0; i<links.length; i ++){
			var url = links[i].href;
			links[i].href = '#';
			links[i].onclick=this._build.bind(this, url);
		}
		this.dispatch('loaded', {'url':md_url});
	}
}
class MarkdownViewer extends VBox {
	/* options 
	{
		navigator:true
		recommentable:false
		md_url:
		method:"GET",
		params:{}
	}
	*/
	constructor(options){
		super(options);
		this.back_stack = [];
		this.md_url = this.absurl(this.opts.md_url);
		if (this.opts.navigator){
			this.createBackButton();
		}
		this.mdtext = new MdText({
			md_url:this.md_url
		});
		this.add_widget(this.mdtext);
		this.mdtext.bind('loaded', this.add_back_stack.bind(this));
		this.dom_element.style.overflow='auto';
		this.dom_element.style.height='100%';
		this.bind('scroll', this.show_scroll.bind(this));
	}
	show_scroll(event){
		console.log('scrollY=', window.scrollY);
	}
	createBackButton = async function(){
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
		var w = await widgetBuild(desc);
		console.log('createBackButton():error, desc=', desc, 'w=', w);
		var t = w.children[0];
		console.log('createBackButton():text=',t);
		t.bind('click',this.go_back.bind(this));
		this.add_widget(w);
		console.log('createBackButton():desc=',desc, 'w=', w);
	}
	add_back_stack(event){
		console.log('go_back_stack():event=', event);
		var url = event.params.url;
		this.back_stack.push(url);
	}
	go_back = async function(event){
		if (this.back_stack.length < 2){
			return;
		}
		// ignore the current text url
		this.back_stack.pop();
		// get the back url
		var url = this.back_stack.pop();
		await this.mdtext._build(url);
	}

	build = async function(){
		this._build(this.opts.md_url);
	}
	_build = async function(md_url){
		var md_content = await tget(md_url);
		this.md_el.innerHTML = marked.parse(md_content);
		// this.md_el.baseURI = md_url;
		
		/* change links in markdown to a bricks action */
		var links = this.md_el.getElementsByTagName('a');
		for (var i=0; i<links.length; i ++){
			var url = links[i].href;
			links[i].href = '#';
			links[i].onclick=this._build.bind(this, url);
		}
	}
}

Factory.register('MarkdownViewer', MarkdownViewer);
