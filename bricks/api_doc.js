var bricks = window.bricks || {};
/*
 * ApiDoc widget - renders API documentation from markdown
 * Depends on: marked (/bricks/3parties/marked.js, loaded by header.tmpl)
 * Options:
 *   md_url: string - URL to fetch markdown from
 *   title: string (optional) - page title
 *   base_url: string (optional) - API base URL for display
 */

bricks.ApiDoc = class extends bricks.VBox {
	constructor(options) {
		if (!options) options = {};
		super(options);
		this.md_url = bricks.absurl(this.opts.md_url, this);
		this.api_title = this.opts.title || 'API Documentation';
		this.api_base_url = this.opts.base_url || '';
		this.sections = [];
		this.active_section = null;
		this._build_layout();
		var self = this;
		schedule_once(function() { self._load(); }, 0.1);
	}

	_build_layout() {
		var d = this.dom_element;
		d.classList.add('bricks-apidoc');
		d.innerHTML = '';

		// Header
		var header = document.createElement('div');
		header.className = 'bricks-apidoc-header';
		header.innerHTML = '<div class="bricks-apidoc-title">' +
			this.api_title + '</div>' +
			(this.api_base_url ? '<div class="bricks-apidoc-baseurl">' +
			this.api_base_url + '</div>' : '');
		d.appendChild(header);

		// Body: sidebar + content
		var body = document.createElement('div');
		body.className = 'bricks-apidoc-body';
		d.appendChild(body);

		// Sidebar
		var sidebar = document.createElement('div');
		sidebar.className = 'bricks-apidoc-sidebar';
		body.appendChild(sidebar);
		this.sidebar_el = sidebar;

		// Content
		var content = document.createElement('div');
		content.className = 'bricks-apidoc-content';
		body.appendChild(content);
		this.content_el = content;

		// Scroll spy
		var self = this;
		content.addEventListener('scroll', function() {
			self._scroll_spy();
		});
	}

	async _load() {
		if (!this.md_url) return;
		try {
			var md_text = await bricks.tget(this.md_url);
			this._render(md_text);
		} catch(e) {
			this.content_el.innerHTML =
				'<div class="bricks-apidoc-error">Failed to load: ' +
				this.md_url + '</div>';
			console.error('ApiDoc load error:', e);
		}
	}

	_render(md_text) {
		// Use marked to parse the full markdown
		var html = marked.parse(md_text);

		// Create a temporary container to parse the DOM
		var tmp = document.createElement('div');
		tmp.innerHTML = html;

		// Extract structure: H1 = category groups, H2 = API endpoint sections
		var categories = [];
		var current_cat = null;
		var current_sec = null;
		var preamble = [];
		var children = tmp.children;

		for (var i = 0; i < children.length; i++) {
			var el = children[i];
			if (el.tagName === 'H1') {
				// Finalize previous section into category
				if (current_sec) {
					if (!current_cat) {
						current_cat = { heading: '', id: 'api-cat-uncat', sections: [] };
						categories.push(current_cat);
					}
					current_cat.sections.push(current_sec);
					current_sec = null;
				}
				current_cat = {
					heading: el.textContent.trim(),
					id: 'api-cat-' + categories.length,
					sections: []
				};
				categories.push(current_cat);
			} else if (el.tagName === 'H2') {
				// Finalize previous section
				if (current_sec) {
					if (!current_cat) {
						current_cat = { heading: '', id: 'api-cat-uncat', sections: [] };
						categories.push(current_cat);
					}
					current_cat.sections.push(current_sec);
				}
				var all_secs = categories.reduce(function(a, c) { return a.concat(c.sections); }, []);
				current_sec = {
					heading: el.textContent.trim(),
					id: 'api-sec-' + all_secs.length,
					elements: []
				};
			} else if (current_sec) {
				current_sec.elements.push(el);
			} else {
				// Elements before any H1/H2 go to preamble
				preamble.push(el);
			}
		}
		// Finalize last section
		if (current_sec) {
			if (!current_cat) {
				current_cat = { heading: '', id: 'api-cat-uncat', sections: [] };
				categories.push(current_cat);
			}
			current_cat.sections.push(current_sec);
		}

		this.categories = categories;
		// Flatten sections for content rendering
		var all_sections = [];
		for (var i = 0; i < categories.length; i++) {
			for (var j = 0; j < categories[i].sections.length; j++) {
				all_sections.push(categories[i].sections[j]);
			}
		}
		this.sections = all_sections;
		this._build_sidebar();
		this._build_content(all_sections);

		// Highlight code blocks
		if (typeof hljs !== 'undefined') {
			var blocks = this.content_el.querySelectorAll('pre code');
			blocks.forEach(function(block) {
				hljs.highlightElement(block);
			});
		}

		// Add copy buttons to code blocks
		this._add_copy_buttons();

		// Activate first section
		if (all_sections.length > 0) {
			this._activate_section(all_sections[0].id);
		}
	}

	_build_sidebar() {
		var sidebar = this.sidebar_el;
		sidebar.innerHTML = '';

		var self = this;
		for (var c = 0; c < this.categories.length; c++) {
			var cat = this.categories[c];

			// Category header (H1)
			if (cat.heading) {
				var cat_label = document.createElement('div');
				cat_label.className = 'bricks-apidoc-nav-category';
				cat_label.textContent = cat.heading;
				sidebar.appendChild(cat_label);
			}

			// Sections under this category
			for (var s = 0; s < cat.sections.length; s++) {
				var sec = cat.sections[s];
				var item = document.createElement('div');
				item.className = 'bricks-apidoc-nav-item';
				item.setAttribute('data-section', sec.id);

				// Parse method from heading (e.g. "POST /v1/chat/completions")
				var parts = sec.heading.split(' ');
				if (parts.length >= 2) {
					var method = parts[0].toUpperCase();
					var path = parts.slice(1).join(' ');
					var badge = document.createElement('span');
					badge.className = 'bricks-apidoc-method-badge';
					badge.className += ' bricks-apidoc-method-' + method.toLowerCase();
					badge.textContent = method;
					item.appendChild(badge);

					var pathEl = document.createElement('span');
					pathEl.className = 'bricks-apidoc-nav-path';
					pathEl.textContent = path.replace('/v1/', '/');
					item.appendChild(pathEl);
				} else {
					item.textContent = sec.heading;
				}

				item.onclick = (function(sid) {
					return function() { self._scroll_to(sid); };
				})(sec.id);

				sidebar.appendChild(item);
			}
		}
	}

	_build_content(sections) {
		var content = this.content_el;
		content.innerHTML = '';

		for (var i = 0; i < sections.length; i++) {
			var sec = sections[i];

			// Section container
			var section_el = document.createElement('div');
			section_el.className = 'bricks-apidoc-section';
			section_el.id = sec.id;
			content.appendChild(section_el);

			// Section heading with method badge
			var heading = document.createElement('h2');
			heading.className = 'bricks-apidoc-section-title';

			var parts = sec.heading.split(' ');
			if (parts.length >= 2) {
				var method = parts[0].toUpperCase();
				var path = parts.slice(1).join(' ');
				heading.innerHTML = '<span class="bricks-apidoc-method-badge bricks-apidoc-method-' +
					method.toLowerCase() + '">' + method +
					'</span><span class="bricks-apidoc-path">' + path + '</span>';
			} else {
				heading.textContent = sec.heading;
			}
			section_el.appendChild(heading);

			// Section content elements
			for (var j = 0; j < sec.elements.length; j++) {
				var el = sec.elements[j].cloneNode(true);
				this._enhance_element(el);
				section_el.appendChild(el);
			}
		}
	}

	_enhance_element(el) {
		// Add classes to tables
		if (el.tagName === 'TABLE') {
			el.className = 'bricks-apidoc-table';
		}

		// Add classes to h3 subsections
		if (el.tagName === 'H3') {
			el.className = 'bricks-apidoc-subsection';
		}

		// Add classes to pre/code blocks
		if (el.tagName === 'PRE') {
			var wrapper = document.createElement('div');
			wrapper.className = 'bricks-apidoc-code-wrapper';
			el.parentNode && el.parentNode.insertBefore(wrapper, el);
			wrapper.appendChild(el);
		}

		// Add classes to inline tables in parent divs
		if (el.tagName === 'DIV') {
			var tables = el.querySelectorAll('table');
			tables.forEach(function(t) { t.className = 'bricks-apidoc-table'; });
		}
	}

	_add_copy_buttons() {
		var wrappers = this.content_el.querySelectorAll('.bricks-apidoc-code-wrapper');
		wrappers.forEach(function(wrapper) {
			var pre = wrapper.querySelector('pre');
			if (!pre) return;

			var btn = document.createElement('button');
			btn.className = 'bricks-apidoc-copy-btn';
			btn.textContent = 'Copy';
			btn.onclick = function() {
				var code = pre.querySelector('code');
				var text = code ? code.textContent : pre.textContent;
				navigator.clipboard.writeText(text).then(function() {
					btn.textContent = 'Copied!';
					setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
				});
			};
			wrapper.insertBefore(btn, pre);
		});
	}

	_scroll_to(section_id) {
		var el = document.getElementById(section_id);
		if (!el) return;
		el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		this._activate_section(section_id);
	}

	_activate_section(section_id) {
		if (this.active_section === section_id) return;
		this.active_section = section_id;

		// Update sidebar active state
		var items = this.sidebar_el.querySelectorAll('.bricks-apidoc-nav-item');
		items.forEach(function(item) {
			item.classList.remove('active');
			if (item.getAttribute('data-section') === section_id) {
				item.classList.add('active');
			}
		});
	}

	_scroll_spy() {
		var content = this.content_el;
		var sections = content.querySelectorAll('.bricks-apidoc-section');
		var scrollTop = content.scrollTop;
		var found = null;

		for (var i = 0; i < sections.length; i++) {
			var sec = sections[i];
			if (sec.offsetTop - content.offsetTop <= scrollTop + 60) {
				found = sec.id;
			}
		}

		if (found) {
			this._activate_section(found);
		}
	}

	setValue(v) {
		if (typeof v === 'string') {
			this._render(v);
		}
	}

	getValue() {
		return this.md_url;
	}

	render(params) {
		if (params && params.md_url) {
			this.md_url = bricks.absurl(params.md_url, this);
			this._load();
		}
	}
}

bricks.Factory.register('ApiDoc', bricks.ApiDoc);
