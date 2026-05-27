/**
 * bricks.Router — SPA routing for bricks single-page applications
 *
 * Provides URL state management so that:
 * - Browser refresh lands on the current page
 * - Direct URL access (deep linking) works
 * - Browser back/forward buttons navigate between pages
 *
 * Usage — call after bricks app is created:
 *
 *   bricks.Router.init({
 *     targets: [
 *       { id: 'main_content', param: 'page' },
 *       { id: 'sidebar',      param: 'side' }   // optional extra targets
 *     ]
 *   });
 *
 * URL format:  /?page=/module/index.ui
 * Multiple:    /?page=/module/index.ui&side=/module/sidebar.ui
 *
 * What IS tracked:
 *   - urlwidget loads with mode:'replace' into registered target IDs
 *
 * What is NOT tracked (by design):
 *   - Popup / PopupWindow / NewWindow (modal overlays, transient)
 *   - urlwidgets into non-registered targets (header, login state, etc.)
 *     These re-render on refresh via server-side session state.
 *   - insert/append mode urlwidgets
 */
bricks.Router = (function(){

	var _enabled = false;
	var _targets = {};        // { targetId: { param: string, current: string|null } }
	var _isPopState = false;  // suppress pushState during popstate restore
	var _restoring = false;   // suppress _onReplace during _loadInto

	// ── URL helpers ──

	function _getURLParam(key){
		return new URLSearchParams(window.location.search).get(key);
	}

	function _pushState(){
		var url = new URL(window.location);
		for (var id in _targets){
			var cfg = _targets[id];
			if (cfg.current){
				url.searchParams.set(cfg.param, cfg.current);
			} else {
				url.searchParams.delete(cfg.param);
			}
		}
		history.pushState(_getState(), '', url.toString());
	}

	function _replaceState(){
		var url = new URL(window.location);
		for (var id in _targets){
			var cfg = _targets[id];
			if (cfg.current){
				url.searchParams.set(cfg.param, cfg.current);
			} else {
				url.searchParams.delete(cfg.param);
			}
		}
		history.replaceState(_getState(), '', url.toString());
	}

	function _getState(){
		var s = {};
		for (var id in _targets){ s[id] = _targets[id].current; }
		return s;
	}

	// ── Load content into a target ──

	async function _loadInto(targetId, url){
		if (!bricks.app){ return; }
		var target = bricks.getWidgetById(targetId, bricks.app);
		if (!target){
			console.log('[Router] target not found:', targetId);
			return;
		}
		var desc = { widgettype: 'urlwidget', options: { url: url } };
		try {
			_restoring = true;
			var w = await bricks.widgetBuild(desc, bricks.app);
			if (w && !(w instanceof bricks.Popup) && !(w instanceof bricks.NewWindow)){
				target.clear_widgets();
				target.add_widget(w);
			}
		} catch(e){
			console.error('[Router] load failed:', url, e);
		} finally {
			_restoring = false;
		}
	}

	// ── popstate handler (back/forward) ──

	async function _onPopState(event){
		if (!event.state){ return; }
		_isPopState = true;
		for (var id in _targets){
			var url = event.state[id];
			if (url !== undefined && url !== _targets[id].current){
				_targets[id].current = url || null;
				if (url){
					await _loadInto(id, url);
				}
			}
		}
		_isPopState = false;
	}

	// ── Restore from URL on page load ──

	async function _restore(){
		var anyRoute = false;
		for (var id in _targets){
			var cfg = _targets[id];
			var url = _getURLParam(cfg.param);
			if (url){
				cfg.current = url;
				anyRoute = true;
			}
		}
		if (!anyRoute){
			// No route in URL — set initial state
			_replaceState();
			return;
		}
		// Wait for app to fully initialize
		var attempts = 0;
		while (!bricks.app && attempts < 50){
			await new Promise(function(r){ setTimeout(r, 100); });
			attempts++;
		}
		if (!bricks.app){
			console.error('[Router] bricks.app not ready');
			return;
		}
		// Extra delay for shell layout to finish
		await new Promise(function(r){ setTimeout(r, 300); });

		console.log('[Router] restoring routes:', _getState());
		for (var id in _targets){
			var cfg = _targets[id];
			if (cfg.current){
				await _loadInto(id, cfg.current);
			}
		}
		// Set initial history entry
		_replaceState();
	}

	// ── Public API ──

	return {
		_enabled: false,

		/**
		 * Called by _buildWidget after a urlwidget replaces content in a target.
		 * Internal — do not call directly.
		 */
		_onReplace: function(target, url){
			if (!_enabled || _restoring || _isPopState){ return; }
			var cfg = _targets[target.id];
			if (!cfg){ return; }
			if (cfg.current === url){ return; }
			cfg.current = url;
			_pushState();
		},

		/**
		 * Initialize the router.
		 * @param {Object} config
		 * @param {Array}  config.targets - [{id: 'widget_id', param: 'url_param_name'}]
		 */
		init: function(config){
			if (!config || !config.targets || !config.targets.length){
				console.error('[Router] init requires config.targets array');
				return;
			}
			config.targets.forEach(function(t){
				_targets[t.id] = {
					param: t.param || t.id,
					current: null
				};
			});
			_enabled = true;
			this._enabled = true;

			window.addEventListener('popstate', _onPopState);
			_restore();

			console.log('[Router] init OK, targets:', Object.keys(_targets));
		},

		/**
		 * Programmatically navigate a target to a URL.
		 * @param {string} targetId - registered target widget ID
		 * @param {string} url      - .ui URL to load
		 */
		navigate: function(targetId, url){
			var cfg = _targets[targetId];
			if (!cfg){
				console.error('[Router] unknown target:', targetId);
				return;
			}
			_loadInto(targetId, url).then(function(){
				cfg.current = url;
				_pushState();
			});
		},

		/** Get current route for a target */
		current: function(targetId){
			var cfg = _targets[targetId];
			return cfg ? cfg.current : null;
		},

		/** Get all current routes */
		state: function(){
			return _getState();
		}
	};

})();
