class ScrollPanel extends VBox {
	/*
	{
		overflowX:hidden,
		overflowY:hidden,
		min_threshold:
		max_htreshold:
	}
	*/
	constructor(opts){
		if (!opts.overflowX) opts.overflowX = 'scroll';
		if (!opts.overflowY) opts.overflowY = 'scroll';
		opts.width = '100%',
		opts.height = '100%'
		super(opts);
		this.overflowX = opts.overflowX;
		this.overflowY = opts.overflowY;
		this.scrollpanel = new Layout(opts);
		VBox.prototype.add_widget.bind(this)(this.scrollpanel);
		this.min_threshold = this.opts.min_threshold|| 0.01;
		this.max_threshold = this.opts.max_threshold|| 0.99;
		this.scrollpanel.bind('scroll', this.scroll_handle.bind(this))
		this.last_scrollLeft = this.scrollpanel.dom_element.scrollLeft;
		this.last_scrollTop = this.scrollpanel.dom_element.scrollTop;
		this.threshold = false;
	}
	add_widget(w, idx){
		this.scrollpanel.add_widget(w, idx);
	}
	remove_widgets_at_begin(cnt){
		this.scrollpanel.remove_widgets_at_begin(cnt);
	}
	remove_widgets_at_end(cnt){
		this.scrollpanel.remove_widgets_at_end(cnt);
	}
	remove_widget(w){
		this.scrollpanel.remove_widget(w);
	}
	clear_widgets(){
		this.scrollpanel.clear_widgets();
	}
	remove_widgets(cnt, x){
		this.scrollpanel.remove_widgets(cnt, x);
	}
	scroll_handle(event){
		console.log(event.target, 'scrolled ..., this=', this);
		var e = this.dom_element;
		this.x_scroll_handle(event);
		this.y_scroll_handle(event);
	}
	x_scroll_handle(event){
		if (this.overflowX!='scroll'){
			return;
		}
		e = this.scrollpanel;
		this.low_handle('x', this.last_scrollLeft, 
						e.dom_element.scrollLeft,
						e.dom_element.scrollWidth,
						e.dom_element.clientWidth);
		this.last_scrollLeft = e.dom_element.scrollLeft;
	}
	y_scroll_handle(event){
		if (this.overflowY!='scroll'){
			return;
		}
		e = this.scrollpanel;
		this.low_handle('y', this.last_scrollTop, 
						e.dom_element.scrollTop,
						e.dom_element.scrollHeight,
						e.dom_element.clientHeight);
		this.last_scrollTop = e.dom_element.scrollTop;
	}
	low_handle(dim, last_pos, cur_pos, maxlen, winsize){
		var dir = cur_pos - last_pos;
		var max_rate = cur_pos / (maxlen - winsize);
		var min_rate = cur_pos / maxlen;
		if (!this.threshold && dir > 0 && max_rate >= this.max_threshold){
			this.thresgold = true;
			this.dispatch(dim + '_max_threshold');
			return
		}
		if (!this.threshold && dir < 0 && min_rate <= this.min_threshold){
			this.thresgold = true;
			this.dispatch(dim + '_min_threshold');
			return
		}
	}
}

class HScrollPanel extends ScrollPanel {
	constructor(opts){
		opts.overflowX='scroll';
		opts.overflowY='hidden';
		super(opts);
	}
}

class VScrollPanel extends ScrollPanel {
	constructor(opts){
		opts.overflowX='hidden';
		opts.overflowY='scroll';
		super(opts);
	}
}

Factory.register('ScrollPanel', ScrollPanel);
Factory.register('VScrollPanel', VScrollPanel);
Factory.register('HScrollPanel', HScrollPanel);

