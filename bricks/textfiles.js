var bricks = window.bricks || {};

bricks.DeletableLabel = class extends bricks.HBox {
	/*
		rate:0.6
		label:
		i18n:false
	*/
	constructor(opts){
		opts.cheight = 1;
		opts.width = '100%';
		super(opts);
		this.rate = opts.rate || 0.6;
		var lopts = {
			rate: this.rate
		}
		if (opts.i18n){
			lopts.i18n = true;
			lopts.otext = opts.label;
		} else {
			lopts.text = opts.label;
		}
		this.labelw = new bricks.Text(lopts);
		this.deletew = new bricks.Svg({
			cwidth: this.rate,
			cheight: this.rate,
			url: bricks_resource('imgs/delete.svg')
		});
		this.deletew.bind('click', this.deletelabel.bind(this));
		this.add_widget(this.labelw);
		this.add_widget(this.deletew);
	}
	deletelabel(){
		this.parent.remove_widget(this);
		this.dispatch('deleted', {label:tihis.label});
	}
}
bricks.TextFiles = class extends bricks.VBox {
	/*
	输入长文本和一到多个文件，高度随着输入文本的多少以及添加的文件数量变化，添加的文件有一个删除按钮可以删除掉
	有一个按钮提交数据，点击后触发“inputed”事件
	{
		"inputed_icon":
	}
	*/
	constructor(opts){
		opts.height = 'auto';
		opts.width = '100%';
		super(opts);
		this.inputfilew = new bricks.UiFile({name:'add_file'});
		this.filesbar = new bricks.DynamicColumn({});
		this.add_files = [];
		this.textw = new bricks.UiText({name: 'prompt'});
		var addfilew = new bricks.Svg({
			cwidth: 1.5,
			cheight: 1.5,
			url: bricks_resource('imgs/add.svg')
		});
		addfilew.bind('click', this.add_file.bind(this));
		var inputw = new bricks.Svg({
			cwidth: 1.5,
            cheight: 1.5,
            url: opts.url || bricks_resource('imgs/submit.svg')
        });
		inputw.bind('click', this.input_finished.bind(this));
		var hbox = new bricks.HBox({cheight: 1.5});
		this.add_widget(this.inputfilew);
		this.add_widget(this.filesbar);
		this.add_widget(this.textw);
		this.add_widget(hbox);
		hbox.add_widget(addfilew);
		hbox.add_widget(new bricks.VBox({css:'filler'}));
		hbox.add_widget(inputw);
		this.filesbar.hide();
		this.inputfilew.hide();
		this.inputfilew.bind('changed', this.file_added.bind(this));
	}
	input_finished(){
		var txt = this.textw.getValue();
		if (! txt.prompt || txt.prompt.length<1){
			return;
		}
		var d = {
			add_files: this.add_files,
			prompt: txt.prompt
		}
		this.dispatch('inputed', d);
		this.textw.setValue('');
		this.add_files = [];
	}
	file_added(e){
		this.inputfilew.hide();
		var file = this.inputfilew.getValue().add_file;
		this.inputfilew.reset();
		this.add_files.push(file);
		var w = new bricks.DeletableLabel({label: file.name})
		this.filesbar.add_widget(w);
		this.filesbar.show();
		this.filesbar.clear_widgets();
		w.bind('deleted', this.deleted_file.bind(this, file));
	}
	deleted_file(file){
		files = this.add_files.filter(i => i !== file);
		this.add_files = files;
		if (this.add_files.length ==0){
			this.filesbar.hide();
		}
	}
	add_file(){
		this.inputfilew.show();
	}
}
bricks.Factory.register('TextFiles', bricks.TextFiles);
bricks.Factory.register('DeletableLabel', bricks.DeletableLabel);
