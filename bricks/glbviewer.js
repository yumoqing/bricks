bricks = window.bricks || {};

bricks.GlbViewer = class extends class bricks.VBox {
	constructor(opts){
		super(opts);
		this.dom_element.innerHTML=`<model-viewer
  src="${this.opts.url}"
  auto-rotate
  camera-controls
  style="width: 100%; height: 100vh;">
</model-viewer>`
	}
}
bricks.Factory.register('GlbViewer', bricks.GlbViewer);
