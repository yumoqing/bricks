class UiTypesDef {
	constructor(opts){
		this.opts = opts;
		this.uitypes = {
		}
	}
	set(uitype, viewBuilder, inputBuilder){
		if (! this.uitypes[uitype]){
			this.uitypes[uitype] = {};
		}
		this.uitypes[uitype].viewBuilder = viewBuilder;
		this.uitypes[uitype].inputBuilder = inputBuilder;
	}
	get(uitype){
		if (! this.uitypes[uitype]){
			return (null, null);
		}
		return [this.uitypes[uitype].viewBuilder, 
					this.uitypes[uitype].inputBuilder];
	}
	getInputBuilder(uitype){
		if (! this.uitypes[uitype]){
			return Null;
		}
		return this.uitypes[uitype].inputBuilder;
	}
	getViewBuilder(uitype){
		return this.uitypes[uitype].viewBuilder;
	}
	setViewBuilder(uitype, Builder){
		if (! this.uitypes[uitype]){
			this.uitypes[uitype] = {};
		}
		this.uitypes[uitype].viewBuilder = Builder;
	}
	setInputBuilder(uitype, Builder){
		if (! this.uitypes[uitype]){
			this.uitypes[uitype] = {};
		}
		this.uitypes[uitype].inputBuilder = Builder;
	}
}

var uitypesdef = new UiTypesDef();

var viewFactory = function(desc, rec){
	var uitype = desc.uitype;
	var builder = uitypesdef.getViewBuilder(uitype) || 
					uitypesdef.getViewBuilder('str');
	if (! builder) return Null;
	var w = builder(desc, rec);
	return w;
}

var intputFactory = function(desc, rec){
	var uitype = desc.uitype;
	var builder = uitypesdef.getInputBuilder(uitype) || 
				uitypesdef.getInputBuilder('str');
	if (! builder) return Null;
	return builder(desc, rec);
}

var buildText = function(text, halign){
	if (['left', 'right'].indexOf(halign)< 0){
		halign = 'left';
	}
	var w = new Text({
					text:text || '', 
					overflow:'hidden',
					wrap:true, 
					halign:'left'
				});
	return w;
}
var strViewBuilder = function(desc, rec){
	var v = rec[desc.name];
	return buildText(v, 'left');
}
uitypesdef.setViewBuilder('str', strViewBuilder);

var strInputBuilder = function(desc, rec) {
	var v = rec[desc.name];
	desc[value] = v;
	return new UiStr(desc);
}
uitypesdef.setInputBuilder('str', strInputBuilder);

var passwordViewBuilder = function(desc, rec){
	return new buildText('******');
}
uitypesdef.setViewBuilder('password', passwordViewBuilder);

var intViewBuilder = function(desc, rec){
	var v = rec[desc.name] + '';
	return buildText(v, 'right');
}
uitypesdef.setViewBuilder('int', intViewBuilder);

var floatViewBuilder = function(desc, rec){
	var v = rec[desc.name];
	v = v.toFixed(desc.dec_len||2)
	v = v + '';
	return buildText(v, 'right');
}
uitypesdef.setViewBuilder('float', floatViewBuilder);

var codeViewBuilder = function(desc, rec){
	var opts = objcopy(desc)
	if (opts.uiparams) extend(opts, opts.uiparams);
	var name = desc.textFeild || 'text';
	var v = rec[name];
	if (! v) {
		name = desc.valueField || 'value';
		v = rec[name];
	}
	return buildText(v, 'left')
}
uitypesdef.setViewBuilder('code', codeViewBuilder);


var passwordInputBuilder = function(desc, rec){
	return new UiPassword(desc);
}
uitypesdef.setInputBuilder('password', passwordInputBuilder);
