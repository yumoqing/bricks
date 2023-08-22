
var low_handle = function(widget, dim, last_pos, cur_pos, maxlen, winsize){
	var dir = cur_pos - last_pos;
	var max_rate = cur_pos / (maxlen - winsize);
	var min_rate = cur_pos / maxlen;
	if (!widget.threshold && dir > 0 && max_rate >= widget.max_threshold){
		widget.thresgold = true;
		widget.dispatch('max_threshold');
		return
	}
	if (!widget.threshold && dir < 0 && min_rate <= widget.min_threshold){
		widget.thresgold = true;
		widget.dispatch('min_threshold');
		return
	}
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
		if (event.target != this.dom_element){
			// console.log('HScroll():scroll on other', event.target);
			return;
		}
		var e = this.dom_element;
		if ( e.scrollWidth - e.clientWidth < 1) {
			// console.log('HScroll():same size');
			return;
		}
		low_handle(this, 'x', this.last_scrollLeft, 
						e.scrollLeft,
						e.scrollWidth,
						e.clientWidth);

		this.last_scrollLeft = e.scrollLeft;
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
		if (event.target != this.dom_element){
			// console.log('scroll on other', event.target);
			return;
		}
		var e = this.dom_element;
		if ( e.scrollHeight - e.clientHeight < 2) {
			// console.log('same size');
			return;
		}
		low_handle(this, 'y', this.last_scrollTop, 
						e.scrollTop,
						e.scrollHeight,
						e.clientHeight);
		this.last_scrollTop = e.scrollTop;
	}
}

Factory.register('VScrollPanel', VScrollPanel);
Factory.register('HScrollPanel', HScrollPanel);

