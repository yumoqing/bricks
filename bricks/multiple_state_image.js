class MultipleStateImage extends Layout {
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
		event.stopPropagation();
		var states = Object.keys(this.opts.sources);
		for (var i=0;i<states.length;i++){
			if (states[i] == this.state){
				var k = i + 1;
				if (k >= states.length) k = 0;
				this.state = states[k];
				this.img.set_source(this.opts.sources[this.state]);
				this.dispatch('state_changed', this.state);
				break;
			}
		}
	}
}

class MultipleStateIcon extends Icon {
	constructor(opts){
		opts.source = opts.sources[opts.state];
		super(opts);
		this.state = opts.state;
		this.sources = opts.sources;
		this.bind('click', this.change_state.bind(this));
	}
	change_state(event){
		event.stopPropagation();
		var states = Object.keys(this.sources);
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
		this.set_source(this.sources[state]);
	}

}
Factory.register('MultipleStateImage', MultipleStateImage);

