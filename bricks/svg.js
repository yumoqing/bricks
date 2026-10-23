var bricks = window.bricks || {};
bricks.Svg = class extends bricks.VBox {
	/*
	options:{
		rate:
		url:
		color:*
		blinktime:*
	}
	*/
	constructor(opts){
		opts.rate = opts.rate || 1;
		if (!opts.cwidth && !opts.cheight) {
			opts.cwidth = opts.rate;
			opts.cheight = opts.rate;
		}
		opts.blinktime = opts.blinktime? opts.blinktime : 0;
		opts.dynsize = true;
		super(opts);
		if (! this.color) {
			this.color = bricks.app.get_color();
		}
		if (opts.url){
			this.set_url(opts.url);
		}
	}
	set_url(url){
		this._url_token = (this._url_token || 0) + 1;
		var token = this._url_token;
		if (!url){
			this.dom_element.innerHTML = '';
			return;
		}
		this.url = url;
		fetch(url)
			.then(response => response.text())
			.then(svgText => {
				if (token !== this._url_token) return;
				if (svgText.startsWith("<svg ")){
					this.svgText = svgText;
					this.set_colored_svg(this.color);
					if (this.blinktime) this.start_blink();
				}
			});
	}
	set_ancent_color(e){
		var pstyle = getComputedStyle(this.parent);
		this.set_color(pstyle.color);
	}
	set_color(color){
		this.color = color;
		this.set_colored_svg(color);
	}
	set_colored_svg(color){
		this.cur_color = color;
		this.svg_text = bricks.obj_fmtstr({color: color}, this.svgText);
		this.dom_element.innerHTML = this.svg_text;
	}
	_blink(){
		if (this.blinktime) {
			if (this.dom_element.innerHTML == '')
				this.dom_element.innerHTML = this.svg_text;
			else
				this.dom_element.innerHTML = ''
		}
	}
	start_blink(){
		if (!this.blink_task){
			this.blink_task = schedule_interval(this._blink.bind(this), 
				this.blinktime);
		}
	}
	end_blink(){
		if (this.blink_task)
			clearInterval(this.blink_task);
		this.blink_task = null;
	}
}

bricks.StatedSvg = class extends bricks.Svg {
	/* {
		states:[{state:aaa,url:} ,,],
		state:
	} */
	constructor(opts){
		super(opts);	
		this.curstate = null;
		if (this.states){
			if (! this.state){
				this.state = this.states[0].state;
			}
			this.set_state(this.state);
		}
		this.bind('click', this.trigger.bind(this));
	}
	trigger(event){
		event.stopPropagation();
		event.preventDefault();
		for (var i=0;i<this.states.length;i++){
			var g = this.states[i];
			if (this.curstate == g.state) {
				var k = 0;
				if (i < this.states.length - 1){
					k = i + 1;
				}
				this.set_state(this.states[k].state);
				return;
			}
		}
	}
	set_state(state){
		if (state == this.curstate){
			return;
		}
		this.curstate = state;
		var done = false;
		this.states.forEach(s => {
			if (s.state == state){
				this.set_url(s.url);
				this.dispatch('state_changed', state);
				done = true;
				return;
			}
		});
		if (! done) this.set_url(null);
	}
}
bricks.MultipleStateIcon = class extends bricks.Svg {
	constructor(opts){
		opts.url = opts.urls[opts.state];
		super(opts);
		this.state = opts.state;
		this.urls = opts.urls;
		this.bind('click', this.change_state.bind(this));
	}
	change_state(event){
		event.stopPropagation();
		var states = Object.keys(this.urls);
		for (var i=0;i<states.length;i++){
			if (states[i] == this.state){
				var k = i + 1;
				if (k >= states.length) k = 0;
				this.set_state(states[k]);
				this.dispatch('state_changed', this.state);
				break;
			}
		}
	}
	set_state(state){
		this.state = state;
		this.set_url(this.urls[state]);
	}

}
bricks.Factory.register('Svg', bricks.Svg);
bricks.Factory.register('StatedSvg', bricks.StatedSvg);
bricks.Factory.register('MultipleStateIcon', bricks.MultipleStateIcon);

