class MultipleStateImage extends JsWidget {
	/* 
	{
		state:
		sources:{
			state1:url1,
			state2:url2,
			...
		}
		width:
		height:
	}
	*/
	constructor(opts){
		super(opts);
		this.state = this.opts.state
		this.create('div');
		var desc = {
			source : this.opts.sources[this.state],
			width:this.opts.width,
			height:this.opts.height
		}
		this.img = new Image(desc);
		this.add_widget(this.img);
		this.img.bind('click', this.change_state.bind(this));
	}
	set_state(state){
		this.state = state;
		this.img.set_source(this.opts.sources[state]);
	}

	change_state(event){
		event.preventPropagation();
		var states = Object.keys(this.opts.sources);
		for (var i=0;i<states.length;i++){
			if (states[i] == this.state){
				k = i + 1;
				if (k >= states.length) k = 0;
				this.state = states[k];
				this.img.set_source(this.opts.sources[this.state]);
				this.dispatch('state_changed', this.state);
			}
		}
	}
}
