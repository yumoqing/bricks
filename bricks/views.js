/*
uitype:
str
password
int
float
tel
email
file
'check
checkbox
date
text
code
video
audio

*/

var ViewStr = function(desc){
	var w = Text({
		'text':desc.value,
		'halign':'left'
	})
	if (desc.row_data)
		w.desc_object = desc;
	return w;
}

uitypesdef.setViewKlass('str', ViewStr);

var ViewPassword = function(desc){
	var w = Text({
		'text':"****",
		'halign':'left'
	})
	if (desc.row_data)
		w.data = desc.row_data;
	return w;
}
class ViewType extends JsWidget {
	constructor(opts){
		super(opts)
	}
}

class ViewStr extends ViewType {
	
}
