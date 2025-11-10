var bricks = window.bricks || {};
/* dependent
https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js
*/
bricks.3dViewer = class extends bricks.JsWidget {
	create(){
		var e = this._create('model-viewer');
		e.setAttribute('camera-controls', true);
		e.setAttribute('auto-rotate', true);
		e.setAttribute('exposure', '1');
		e.setAttribute('shadow-intensity',"0.5");
		e.setAttribute('ar', true);
		e.setAttribute("reveal","interaction");
		if (this.opts.url){
			e.url = this.opts.url;
		}
		this.dom_element = e;
	}
}
