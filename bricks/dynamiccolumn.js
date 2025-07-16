var bricks = window.bricks || {};

bricks.DynamicColumn = class extends bricks.Layout {
	/*
	{
		mobile_cols:
		col_cwidth:
		col_cgap:
		col_width:
	}
	*/
	constructor(opts){
		if (! opts.col_cwidth){
			if(! opts.col_width){
				opts.col_cwidth = 20;
			}
		}
		opts.col_cgap = opts.col_cgap || 0.5;
		opts.mobile_cols = opts.mobile_cols|| 1;
		super(opts);
		this.set_style('display', 'grid');
		// this.set_column_width();
		this.bind('on_parent', this.set_column_width.bind(this));
		this.bind('resize', this.set_column_width.bind(this));
		if (this.cwidth){
			bricks.app.bind('charsize', this.set_column_width.bind(this));
		}
	}
	set_column_width(){
		var cw;
		var cols;
		var gap;
		gap = bricks.app.charsize * (this.col_cgap || 0.1);
		var width = bricks.app.screenWidth();
		var height = bricks.app.screenHeight();
		if (bricks.is_mobile() && width < height){
			cols = this.mobile_cols;
			cw = (width - (cols - 1) * gap) / cols;
			console.log('====mobile==cols=', cols, '====');
		} else {
			if (this.col_cwidth){
				cw = bricks.app.charsize * this.col_cwidth;
			} else {
				cw = this.col_width;
			}
		}
		this.dom_element.style.gridTemplateColumns = "repeat(auto-fill, minmax(" + cw + "px, 1fr))";
		this.set_style('gap', gap + 'px');
	}
}

bricks.Factory.register('DynamicColumn', bricks.DynamicColumn);
