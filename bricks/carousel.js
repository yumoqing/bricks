// Carousel — auto-rotating FlipCard strip
var bricks = window.bricks || {};

bricks.Carousel = class extends bricks.Layout {
  /* options: { cards:[{front:{widgettype:...}, back:{widgettype:...}}], cardWidth, cardHeight, interval } */
  constructor(opts) {
    super(opts);
    this.set_css('bricks-carousel');
    this.set_style('position','relative');
    this.set_style('overflow','hidden');
    this._init();
  }
  async _init() {
    var cd = this.opts.cards || [];
    if (!cd.length) return;
    var cw = this.opts.cardWidth || 280;
    var ch = this.opts.cardHeight || 360;
    var iv = this.opts.interval || 3000;
    var sf = this.opts.scaleFactors || [1, 0.85, 0.7, 0.55, 0.4];
    var ox = this.opts.offsets || [0, 220, 390, 500, 600];
    var N = cd.length;
    var mid = Math.floor(N / 2);
    this._cards = [];

    for (var i = 0; i < N; i++) {
      var fc = new bricks.FlipCard({ width: cw + 'px', height: ch + 'px' });
      fc.set_style('position', 'absolute');
      fc.set_style('left', '50%');
      fc.set_style('top', '50%');
      fc.set_style('marginLeft', (-cw / 2) + 'px');
      fc.set_style('marginTop', (-ch / 2) + 'px');
      fc.set_style('transition', 'all .5s cubic-bezier(.4,0,.2,1)');
      fc.set_style('transformOrigin', 'center center');
      fc._pos = i - mid;

      // Build front/back content asynchronously
      if (cd[i].front) {
        var fw = await bricks.widgetBuild(cd[i].front);
        if (fw) fc.front.appendChild(fw.dom_element);
      }
      if (cd[i].back) {
        var bw = await bricks.widgetBuild(cd[i].back);
        if (bw) fc.back.appendChild(bw.dom_element);
      }

      this._cards.push(fc);
      this.dom_element.appendChild(fc.dom_element);
    }

    this._sf = sf; this._ox = ox;
    this._rotate(0);
    this._timer = setInterval(this._rotate.bind(this, 1), iv);
  }
  _rotate(dir) {
    var cards = this._cards, sf = this._sf, ox = this._ox;
    if (!cards) return;
    cards.forEach(function(c) {
      var np = c._pos - dir;
      if (np > 4) np = -4; if (np < -4) np = 4;
      c._pos = np;
      var a = Math.abs(np), idx = Math.min(a, sf.length - 1);
      var x = np >= 0 ? ox[idx] : -ox[idx];
      c.set_styles({
        transform: 'translateX(' + x + 'px) scale(' + sf[idx] + ')',
        zIndex: String(5 - idx),
        opacity: String(idx === 4 ? 0 : sf[idx]),
        pointerEvents: a > 3 ? 'none' : 'auto'
      });
    });
  }
  create() { this.dom_element = document.createElement('div'); }
  destroy() { if (this._timer) clearInterval(this._timer); super.destroy(); }
};

bricks.Factory.register('Carousel', bricks.Carousel);
