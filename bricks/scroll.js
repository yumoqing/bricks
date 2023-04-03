
var low_handle = function(widget, dim, last_pos, cur_pos, maxlen, winsize){
	var dir = cur_pos - last_pos;
	var max_rate = cur_pos / (maxlen - winsize);
	var min_rate = cur_pos / maxlen;
	if (!widget.threshold && dir > 0 && max_rate >= widget.max_threshold){
		console.log('max_threshold reached ...');
		widget.thresgold = true;
		widget.dispatch('max_threshold');
		return
	}
	if (!widget.threshold && dir < 0 && min_rate <= widget.min_threshold){
		console.log('min_threshold reached ...');
		widget.thresgold = true;
		widget.dispatch('min_threshold');
		return
	}
	console.log('scroll_handle() called ...', max_rate, cur_pos, maxlen, winsize);
}

class HScrollPanel extends HFiller {
	/*
	{
		min_threshold:
		max_threshold:
	}
	*/
	constructor(opts){
		super(opts);
		this.min_threshold = opts.min_threshold || 0.02;
		this.max_threshold = opts.max_threshold || 0.95;
		this.bind('scroll', this.scroll_handle.bind(this))
		this.last_scrollLeft = this.dom_element.scrollLeft;
		this.threshold = false;
	}
	scroll_handle(event){
		var e = this;
		low_handle(this, 'x', e.last_scrollLeft, 
						e.dom_element.scrollLeft,
						e.dom_element.scrollWidth,
						e.dom_element.clientWidth);

		this.last_scrollLeft = e.dom_element.scrollLeft;
	}
}

class VScrollPanel extends VFiller {
	/*
	{
		min_threshold:
		max_threshold:
	}
	*/
	constructor(opts){
		super(opts);
		this.min_threshold = opts.min_threshold || 0.02;
		this.max_threshold = opts.max_threshold || 0.95;
		this.bind('scroll', this.scroll_handle.bind(this))
		this.last_scrollTop = this.dom_element.scrollTop;
	}
	scroll_handle(event){
		var e = this;
		low_handle(this, 'y', e.last_scrollTop, 
						e.dom_element.scrollTop,
						e.dom_element.scrollHeight,
						e.dom_element.clientHeight);
		this.last_scrollTop = e.dom_element.scrollTop;
	}
}

Factory.register('VScrollPanel', VScrollPanel);
Factory.register('HScrollPanel', HScrollPanel);

