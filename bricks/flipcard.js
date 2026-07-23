// FlipCard — hover to flip, front/back as flat DOM templates
var bricks = window.bricks || {};

bricks.FlipCard = class extends bricks.JsWidget {
  /* options: { width, height } — front/back styled via CSS child selectors */
  constructor(opts) {
    super(opts);
    this.set_css('bricks-flipcard');
    var w = this.opts.width || '280px';
    var h = this.opts.height || '360px';
    this.set_style('width', w);
    this.set_style('height', h);
    this._dom_inner = null;
    this._dom_front = null;
    this._dom_back = null;
  }
  create() {
    this.dom_element = document.createElement('div');
    this._dom_inner = document.createElement('div');
    this._dom_inner.className = 'bricks-flipcard-inner';
    this._dom_front = document.createElement('div');
    this._dom_front.className = 'bricks-flipcard-front';
    this._dom_back = document.createElement('div');
    this._dom_back.className = 'bricks-flipcard-back';
    this._dom_inner.appendChild(this._dom_front);
    this._dom_inner.appendChild(this._dom_back);
    this.dom_element.appendChild(this._dom_inner);
  }
  // Caller builds front/back content into these containers
  get front() { return this._dom_front; }
  get back()  { return this._dom_back; }
};

bricks.Factory.register('FlipCard', bricks.FlipCard);
