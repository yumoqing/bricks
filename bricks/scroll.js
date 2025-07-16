var bricks = window.bricks || {};

var low_handle = function(widget, dim, last_pos, cur_pos, maxlen, winsize){
	var max_rate = cur_pos / (maxlen - winsize);
	if (Math.abs(cur_pos + winsize - maxlen) < 5){
		bricks.debug('fire max_threshold ......');
		widget.dispatch('max_threshold');
		return
	}
	if (cur_pos < 1) {
		bricks.debug('fire min_threshold ......');
		widget.dispatch('min_threshold');
		return
	}
}

bricks.HScrollPanel = class extends bricks.HBox {
	/*
	{
		min_threshold:
		max_threshold:
	}
	*/
	constructor(opts){
		opts.width = '100%';
		opts.height = '100%';
		opts.css = 'scrollpanel';
		opts.overflow = 'auto';
		super(opts);
		this.min_threshold = opts.min_threshold || 0.01;
		this.max_threshold = opts.max_threshold || 0.99;
		this.bind('scroll', this.scroll_handle.bind(this))
		this.last_scrollLeft = this.dom_element.scrollLeft;
		this.threshold = false;
	}
	scroll_handle(event){
		if (event.target != this.dom_element){
			// bricks.debug('HScroll():scroll on other', event.target);
			return;
		}
		var e = this.dom_element;
		if ( e.scrollWidth - e.clientWidth < 1) {
			// bricks.debug('HScroll():same size');
			return;
		}
		low_handle(this, 'x', this.last_scrollLeft, 
						e.scrollLeft,
						e.scrollWidth,
						e.clientWidth);
		this.scroll_info = {
			left:e.scrollLeft,
			scroll_width:e.scrollWidth,
			client_width:e.clientWidth
		}
		this.last_scrollLeft = e.scrollLeft;
	}
}

bricks.VScrollPanel = class extends bricks.VBox {
	/*
	{
		min_threshold:
		max_threshold:
	}
	*/
	constructor(opts){
		opts.width = '100%';
		opts.height = '100%';
		opts.css = 'scrollpanel';
		opts.overflow = 'auto';
		super(opts);
		this.min_threshold = opts.min_threshold || 0.02;
		this.max_threshold = opts.max_threshold || 0.95;
		this.bind('scroll', this.scroll_handle.bind(this))
		this.last_scrollY = this.dom_element.scrollY;
	}
	scroll_handle(event){
		if (event.target != this.dom_element){
			// bricks.debug('scroll on other', event.target);
			return;
		}
		var e = this.dom_element;
		if ( e.scrollHeight - e.clientHeight < 2) {
			// bricks.debug('same size');
			return;
		}
		low_handle(this, 'y', this.last_scrollTop, 
						e.scrollTop,
						e.scrollHeight,
						e.clientHeight);
		this.last_scrollTop = e.scrollTop;
		this.scroll_info = {
			top:e.scrollTop,
			scroll_height:e.scrollHeight,
			client_height:e.clientHeight
		}
	}
}

bricks.Factory.register('VScrollPanel', bricks.VScrollPanel);
bricks.Factory.register('HScrollPanel', bricks.HScrollPanel);

