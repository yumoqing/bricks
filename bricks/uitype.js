var bricks = window.bricks || {};
bricks.uiViewers = {};
bricks.add_ViewBuilder = function(uitype, handler){
	bricks.uiViewers[uitype] = handler;
}
bricks.get_ViewBuilder = function(uitype){
	return bricks.uiViewers[uitype];
}
bricks.add_ViewBuilder('str', function(opts){
	var options = bricks.extend({}, opts);
	options.otext = opts.value;
	options.i18n = true;
	return new bricks.Text(options);
});

bricks.add_ViewBuilder('icon', function(opts){
	var options = bricks.extend({}, opts);
	options.url = opts.value;
	return new bricks.Icon(options);
});
bricks.add_ViewBuilder('code', function(opts){
	var textField = opts.textField || 'text';
	var valueField = opts.name;
	var txt;
	if (opts.user_data) {
		txt = opts.user_data[textField] || opts.user_data[valueField]||'';
	} else {
		txt = opts.value || '';
	}
	var options = bricks.extend({}, opts);
	options.otext = txt;
	options.i18n = true;
	return new bricks.Text(options);
});
bricks.add_ViewBuilder('password', function(opts){
	var options = bricks.extend({}, opts);
	options.otext = '******';
	options.i18n = true;
	return new bricks.Text(options);
});
bricks.add_ViewBuilder('hide', function(opts){
	return new bricks.JsWidget({});
});
bricks.add_ViewBuilder('audio', function(opts){
	var options = bricks.extend({}, opts);
	var url = options.value;
	return new bricks.AudioPlayer({url:url,autoplay:false});
});
