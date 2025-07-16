var bricks = window.bricks || {};
bricks.str2date = function(sdate){
	let [year, month, day] = sdate.split("-");
	var dateObj = new Date(year, month - 1, day);
	return dateObj;
}
bricks.date2str = function(date){
	let year = date.getFullYear();
	let month = String(date.getMonth() + 1).padStart(2, '0');
	let day = String(date.getDate()).padStart(2, '0');
	let formattedDate = `${year}-${month}-${day}`;
	return formattedDate;
}
bricks.addMonths = function(dateObj, months){
    var newDate = new Date(dateObj);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
}
bricks.addYears = function(dateObj, years){
	const newDate = new Date(dateObj);
    newDate.setYear(newDate.getYear() + years);
    return newDate;
}
bricks.addDays = function(dateObj, days){
	var newdate = new Date(dateObj);
	newdate.setDate(newdate.getDate() + days);
	return newdate;
}

bricks.PeriodDays = class extends bricks.HBox {
	/*
	{
		start_date:
		end_date:
		step_type: 'days', 'months', 'years'
		step_cnt:
		title:'',
		splitter:' -- ' 
	}
	event: 'changed';
	*/
	constructor(opts){
		opts.splitter = opts.splitter || ' 至 ';
		opts.step_cnt = opts.step_cnt || 1;
		super(opts);
		this.start_w = new bricks.Text({
			text:opts.start_date
		});
		this.end_w = new bricks.Text({
			text:opts.end_date
		});
		this.start_w.set_css('clickable');
		this.end_w.set_css('clickable');
		this.start_w.bind('click', this.step_back.bind(this));
		this.end_w.bind('click', this.step_forward.bind(this));
		if (this.title){
			this.add_widget(new bricks.Text({otext:this.title, i18n:true}));
		}
		this.add_widget(this.start_w);
		this.add_widget(new bricks.Text({
			otext:this.splitter, 
			i18n:true
		}));
		this.add_widget(this.end_w);
	}
	date_add(strdate, step_cnt, step_type){
		var date = bricks.str2date(strdate);
		switch(step_type){
			case 'years':
				var nd = bricks.addYears(date, step_cnt);
				return bricks.date2str(nd);
				break;
			case 'months':
				var nd = bricks.addMonths(date, step_cnt);
				return bricks.date2str(nd);
				break;
			default:
				var nd = bricks.addDays(date, step_cnt);
				return bricks.date2str(nd);
				break;
		}
	}
	step_back(){
		this.start_date = this.date_add(this.start_date, -this.step_cnt, this.step_type);
		this.end_date = this.date_add(this.end_date, -this.step_cnt, this.step_type);
		this.start_w.set_text(this.start_date);
		this.end_w.set_text(this.end_date);
		this.dispatch('changed', {start_date:this.start_date, end_date:this.end_date});
	}
	step_forward(){
		this.start_date = this.date_add(this.start_date, this.step_cnt, this.step_type);
		this.end_date = this.date_add(this.end_date, this.step_cnt, this.step_type);
		this.start_w.set_text(this.start_date);
		this.end_w.set_text(this.end_date);
		this.dispatch('changed', {start_date:this.start_date, end_date:this.end_date});
	}
}

bricks.Factory.register('PeriodDays', bricks.PeriodDays);
