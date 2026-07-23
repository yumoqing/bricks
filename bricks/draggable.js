// SortableJS-backed Draggable / Droppable / Sortable bricks widgets
// Sortable.min.js must be loaded first (in 3parties/)
var bricks = window.bricks || {};

// ============ BASE ============
bricks._SortableBase = class extends bricks.Layout {
  constructor(opts) {
    super(opts);
    this._sortable = null;
    this._fileAccepts = [];
    this._initDnD();
  }
  get sortableOps() { return {}; }
  get fileAccept() { return this.opts.accepts || null; }
  get acceptStr() { return this.fileAccept ? this.fileAccept.join(',') : null; }
  
  _initDnD() {
    var el = this.dom_element, self = this;
    if (!el) return setTimeout(() => this._initDnD(), 100);
    
    // SortableJS
    if (typeof Sortable !== 'undefined') {
      this._sortable = Sortable.create(el, Object.assign({
        draggable: '.vcontainer',
        onStart: function(e) { self.dispatch('dragstart', {item: e.item}); },
        onEnd: function(e) { self.dispatch('dragend', {item: e.item, from: e.from, to: e.to}); },
        onAdd: function(e) { self.dispatch('dropadd', {item: e.item, from: e.from, to: e.to}); },
        onRemove: function(e) { self.dispatch('dropremove', {item: e.item, from: e.from, to: e.to}); },
        onUpdate: function(e) { self.dispatch('reorder', {item: e.item, from: e.from, to: e.to}); },
        onMove: function(e) {
          var acc = self.fileAccept || [];
          if (!acc.length) return true;
          var t = e.dragged.dataset.type || e.dragged.getAttribute('data-type') || '';
          return acc.indexOf(t) >= 0;
        }
      }, this.sortableOps));
    }
    
    // External file drop
    if (this.fileAccept) {
      el.addEventListener('dragover', function(e) { e.preventDefault(); e.stopPropagation(); });
      el.addEventListener('dragenter', function(e) { e.preventDefault(); e.stopPropagation(); el.classList.add('drag-over'); });
      el.addEventListener('dragleave', function(e) { el.classList.remove('drag-over'); });
      el.addEventListener('drop', function(e) {
        e.preventDefault(); e.stopPropagation(); el.classList.remove('drag-over');
        var files = Array.from(e.dataTransfer.files || []);
        if (!files.length) return;
        var acc = self.fileAccept, matched = [];
        files.forEach(function(f) {
          for (var i = 0; i < acc.length; i++) {
            if (f.type.match(acc[i].replace('*','.*')) || f.name.endsWith(acc[i].replace('*.','')))
              { matched.push({name: f.name, size: f.size, type: f.type, file: f}); break; }
          }
        });
        if (matched.length) self.dispatch('filedrop', {files: matched});
      });
    }
  }
};

// ============ Sortable (bidirectional) ============
bricks.SortableWidget = class extends bricks._SortableBase {
  get sortableOps() { return { group: this.opts.group || 'default' }; }
};
bricks.Factory.register('Sortable', bricks.SortableWidget);

// ============ Draggable (pull only, no put) ============
bricks.Draggable = class extends bricks._SortableBase {
  get sortableOps() { return { group: { name: this.opts.group || 'default', pull: 'true', put: false } }; }
};
bricks.Factory.register('Draggable', bricks.Draggable);

// ============ Droppable (put only, no pull, accepts files) ============
bricks.Droppable = class extends bricks._SortableBase {
  get sortableOps() { return { group: { name: this.opts.group || 'default', pull: false, put: true } }; }
};
bricks.Factory.register('Droppable', bricks.Droppable);
