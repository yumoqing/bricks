var bricks = window.bricks || {};
bricks.UiTypesDef = class {
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

bricks.uitypesdef = new bricks.UiTypesDef();

bricks.viewFactory = function(desc, rec){
	var uitype = desc.uitype;
	var builder = bricks.uitypesdef.getViewBuilder(uitype) || 
					bricks.uitypesdef.getViewBuilder('str');
	if (! builder) return Null;
	var w = builder(desc, rec);
	return w;
}

bricks.inputFactory = function(desc, rec){
	var uitype = desc.uitype;
	var builder = bricks.uitypesdef.getInputBuilder(uitype) || 
				bricks.uitypesdef.getInputBuilder('str');
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
bricks.uitypesdef.setViewBuilder('str', strViewBuilder);

var strInputBuilder = function(desc, rec) {
	var v = rec[desc.name];
	desc[value] = v;
	return new UiStr(desc);
}
bricks.uitypesdef.setInputBuilder('str', strInputBuilder);

var passwordViewBuilder = function(desc, rec){
	return new buildText('******');
}
bricks.uitypesdef.setViewBuilder('password', passwordViewBuilder);

var intViewBuilder = function(desc, rec){
	var v = rec[desc.name] + '';
	return buildText(v, 'right');
}
bricks.uitypesdef.setViewBuilder('int', intViewBuilder);

var floatViewBuilder = function(desc, rec){
	var v = rec[desc.name];
	v = v.toFixed(desc.dec_len||2)
	v = v + '';
	return buildText(v, 'right');
}
bricks.uitypesdef.setViewBuilder('float', floatViewBuilder);

var codeViewBuilder = function(desc, rec){
	var opts = objcopy(desc)
	if (opts.uiparams) bricks.extend(opts, opts.uiparams);
	// rec may be undefined when called from DataRow, use desc.user_data instead
	var record = rec || desc.user_data || {};
	// Try textField (correct spelling) first, then textFeild (legacy typo), then default 'text'
	var tf = desc.textField || desc.textFeild || 'text';
	var v = record[tf];
	if (! v) {
		// Try field_name + '_text' convention
		v = record[desc.name + '_text'];
	}
	if (! v) {
		// Fall back to valueField or 'value'
		var vf = desc.valueField || 'value';
		v = record[vf];
	}
	if (! v) {
		// Last resort: use the raw field value
		v = record[desc.name];
	}
	return buildText(v, 'left')
}
bricks.uitypesdef.setViewBuilder('code', codeViewBuilder);

var passwordInputBuilder = function(desc, rec){
	return new UiPassword(desc);
}
bricks.uitypesdef.setInputBuilder('password', passwordInputBuilder);
