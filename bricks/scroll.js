class HScrollPanel extends HBox {
	/*
	{
		min_threshold:
		max_htreshold:
		width:
		height:
		css
	}
	*/
	constructor(opts){
		super(opts);
		var style = {
			width:opts.width || "100%",
			overflowX:"scroll"
		}
		this.set_cssObject(style);
		this.bind('scroll', this.scroll_handle.bind(this))
		this.last_scrollLeft = this.dom_element.scrollLeft;
		this.threshold = false;
	}
	scroll_handle(event){
		event.stopPropagation();
		console.log('scroll happend...');
		var e = this.dom_element;
		var maxv = e.scrollWidth - e.clientWidth;
		var rate = e.scrollLeft / maxv;
		var dir = e.scrollLeft - this.last_scrollLeft;
		this.last_scrollLeft = e.scrollLeft;
		if (!this.threshold && dir < 0 && rate <= this.opts.min_threshold){
			this.thresgold = true;
			this.dispatch('min_threshold');
			return
		}
		if (!this.threshold && dir > 1 && rate >= this.opts.max_threshold){
			this.thresgold = true;
			this.dispatch('max_threshold');
			return
		}
		this.threshold = false;
	}
}

class VScrollPanel extends VBox {
	/*
	{
		min_threshold:
		max_htreshold:
		width:
		height:
		css
	}
	*/
	constructor(opts){
		super(opts);
		var style = {
			height:opts.height || "100%",
			overflowY:"scroll"
		}
		this.set_cssObject(style);
		this.bind('scroll', this.scroll_handle.bind(this))
		this.last_scrollTop = this.dom_element.scrollTop;
		this.threshold = false;
	}
	scroll_handle(event){
		event.stopPropagation()
		console.log('scroll happend...');
		var e = this.dom_element;
		var maxv = e.scrollHeight - e.clientHeight;
		var rate = e.scrollTop / maxv;
		var dir = e.scrollTop - this.last_scrollTop;
		this.last_scrollTop = e.scrollTop;
		if (!this.threshold && dir < 0 && rate <= this.opts.min_threshold){
			this.thresgold = true;
			this.dispatch('min_threshold');
			return
		}
		if (!this.threshold && dir > 1 && rate >= this.opts.max_threshold){
			this.thresgold = true;
			this.dispatch('max_threshold');
			return
		}
		this.threshold = false;
	}
}
