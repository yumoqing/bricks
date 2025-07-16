var bricks = window.bricks || {}

bricks.GobangPoint = class extends bricks.Image {
	/*
		p_status: 0:empty, 1:black, 2:white
		p_x: horontical position from 1 to 15
		p_y: verical position, from 1 to 15
	*/
	constructor(opts){
		super(opts);
		var url = this.calc_url();
		this.set_url(url);
		this.bind('mouseover', this.set_current_position.bind(this, true));
		this.bind('mouseout', this.set_current_position.bind(this, false));
	}
	set_current_position(flg, event){
		this.set_css('curpos', !flg);
	}

	calc_url(){
		var one, two, st;
		switch(this.p_status){
			case 0:
				st = 'empty';
				break;
			case 1:
				st = 'black';
				break;
			case 2:
				st = 'white';
				break;
		}
		switch(this.p_y){
			case 1:
				one = "t";
				break;
			case 15:
				one = "b";
				break;
			default:
				one = "c"
		}
		switch(this.p_x){
			case 1:
				two = "l";
				break;
			case 15:
				two = "r";
				break;
			default:
				two = "c"
		}
		var name = 'imgs/' + one + two + '_' + st + '.png';
		// console.log(name, this.p_x, this.p_y, one, two);
		return bricks_resource(name);
	}
	getValue(){
		return {
			status:this.p_status,
			x:this.p_x,
			y:this.p_y
		}
	}
	str(){
		return '(' + this.p_status + ',' + this.p_x + ',' + this.p_y + ')';
	}
}
bricks.Gobang = class extends bricks.VBox {
	/*
	player:{
		"name":"ttt",
		"type":"user", "llm"
		"url":
		"delay":seconds
		"params":
	}
	{
		black_player:{}
		white_player:{}
	}
	*/
	constructor(opts){
		super(opts);
		this.filler = new bricks.Filler({});
		this.add_widget(this.filler);
		this.render_empty_area()
		this.inform_go('black')
		this.filler.bind('element_resize', this.resize_area.bind(this));
	}
	resize_area(){
		var ele = this.filler.dom_element;
		var siz = Math.min(ele.clientWidth, 
					ele.clientHeight)/ 15;
		console.log(siz, ele.clientWidth, ele.clientHeight);
		for(var i=0;i<15;i++){
			for(var j=0;j<15;j++){
				var w = this.area[i][j];
				w.set_style('width', siz+'px');
				w.set_style('height', siz+'px');
			}
		}
	}
	inform_go(party){
	}
	render_empty_area(){
		this.area = [];
		var vbox = new bricks.VBox({});
		vbox.h_center();
		for (var i=1; i<=15; i++){
			var hbox = new bricks.HBox({})
			vbox.add_widget(hbox);
			var l = [];
			for (var j=1; j<=15; j++){
				var w = new bricks.GobangPoint({
					p_status:0,
					tip: '(' + i + ',' + j + ')',
					p_x: j,
					p_y: i
				});
				hbox.add_widget(w);
				l.push(w);
			}
			this.area.push(l);
		}
		this.filler.add_widget(vbox);
	}
}

bricks.Factory.register('Gobang', bricks.Gobang);
