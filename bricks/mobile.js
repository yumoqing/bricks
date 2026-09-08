// bricks/mobile.js — 移动端适配核心（2026-09-07）
// 原则：移动适配逻辑全部收在 bricks 框架内，应用层（.ui/.dspy）只做声明。
// 提供：
//   bricks.is_mobile()            — 当前是否手机视口（<=768px，平板按桌面）
//   bricks.on_mobile_mode(fn)     — 视口模式变化监听（fn(is_mobile)）
//   bricks.TabBar                 — 底部标签栏控件（手机专用，TabPanel mobile_bar 模式使用）
//   bricks.ChipBar                — 横向胶囊切换条（dataurl 动态数据，select 事件带整条数据）

var bricks = window.bricks || {};

/* 注意：此处 is_mobile 覆盖 utils.js 的旧实现（UA+触摸点检测，会把 iPad 和
 * 触摸笔记本判为手机）。新口径（2026-09-07 用户定夺）：
 *   手机 = 手机 UA（iPhone/Android 手机/WinPhone，横屏也保持手机布局）
 *          或 视口宽 <=768px（桌面窗口缩窄 → 响应式进手机布局）
 *   平板（iPad/Android 平板，宽度 >768）= 桌面布局
 * 旧实现已被 popup.js/jsoncall.js/audio.js 等使用，覆盖后这些调用点自动
 * 获得新口径（popup 全屏化只发生在真手机/窄视口，平板恢复 70% 弹窗）。
 * 另外 jsoncall 每个请求自动带 _is_mobile=0/1 参数，dspy 服务端可感知端类型。
 */
(function(){
	var mq = window.matchMedia ? window.matchMedia('(max-width: 768px)') : null;
	var is_phone_ua = /iPhone|iPod|Windows Phone/i.test(navigator.userAgent)
		|| (/Android/i.test(navigator.userAgent) && /Mobile/i.test(navigator.userAgent));
	var listeners = [];

	bricks.is_mobile = function(){
		if (is_phone_ua) return true;
		return mq ? mq.matches : false;
	};

	bricks.on_mobile_mode = function(fn){
		if (typeof fn !== 'function') return;
		listeners.push(fn);
	};

	function _notify(){
		var m = bricks.is_mobile();
		for (var i=0;i<listeners.length;i++){
			try { listeners[i](m); } catch(e){ console.log('on_mobile_mode listener error', e); }
		}
		// 声明式端适配控件（JsWidget 注册的 mobile_hidden/desktop_hidden/mobile_opts）
		var ws = bricks._mobile_adapt_widgets || [];
		for (var j=ws.length-1;j>=0;j--){
			var w = ws[j];
			// 控件销毁后 dom_element 已脱离文档，顺手清理注册表防泄漏
			if (!w || !w.dom_element || !w.dom_element.isConnected){
				ws.splice(j, 1);
				continue;
			}
			try { w._apply_visibility_mobile(); } catch(e){ console.log('mobile adapt error', e); }
		}
		// 通知全体控件（文档级事件，供非 bricks 场景使用）
		try {
			document.documentElement.setAttribute('data-mobile', m ? '1' : '0');
		} catch(e){}
	}

	if (mq){
		if (mq.addEventListener) mq.addEventListener('change', _notify);
		else if (mq.addListener) mq.addListener(_notify);   // 旧 Safari
	}
	// 初始标记
	setTimeout(function(){
		document.documentElement.setAttribute('data-mobile', bricks.is_mobile() ? '1' : '0');
	}, 0);

	// 浏览器 tab 级会话 id（原 pipeline-app index_tab.js，2026-09-07 收编入框架）。
	// sessionStorage 隔离：每个浏览器 tab 一个 sid，用于多 tab 项目/会话上下文隔离。
	// agent_input.js 的模型下拉 session_id 注入依赖此函数。
	window._sid = function(){
		var sid = null;
		try { sid = sessionStorage.getItem('bricks_sid'); } catch(e){}
		if (!sid){
			sid = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2,10);
			try { sessionStorage.setItem('bricks_sid', sid); } catch(e){}
		}
		return sid;
	};
})();

/* ══════════════════════════ TabBar ══════════════════════════
   底部固定标签栏（手机专用）。
   options: {
       items: [{name, label, icon(emoji/文字), badge(数字), badge_url(轮询计数地址)}],
       badge_interval: 轮询秒数（默认 60）
   }
   badge_url 指向的 dspy 返回 {count: n}，count>0 显示红色角标。
   events: command → params = item 描述（与 Toolbar 一致，TabPanel 直接复用）
*/
bricks.TabBar = class extends bricks.HBox {
	constructor(opts){
		opts.width = '100%';
		opts.height = 'auto';
		super(opts);
		this.set_css('tabbar');
		this.bar_items = opts.items || [];
		this.bar_btns = {};
		this.active_name = '';
		for (var i=0;i<this.bar_items.length;i++){
			this._create_item(this.bar_items[i]);
		}
		this._start_badge_polling(opts.badge_interval || 60);
	}
	_create_item(item){
		var cell = new bricks.VBox({css:'filler tabbar-item', gap:'1px', alignItems:'center'});
		var icon = new bricks.Text({otext: item.icon || '•', i18n: true, css:'tabbar-icon', cfontsize:1.3});
		var label = new bricks.Text({otext: item.label || item.name || '', i18n: true, css:'tabbar-label'});
		cell.add_widget(icon);
		cell.add_widget(label);
		var badge = null;
		if (item.badge){
			badge = new bricks.Text({text: String(item.badge), css:'tabbar-badge'});
			cell.add_widget(badge);
		}
		cell.dom_element.style.cursor = 'pointer';
		cell.bind('click', this._clicked.bind(this, item));
		// 触控反馈
		cell.dom_element.addEventListener('touchstart', function(){ cell.set_css('tabbar-item-press'); }, {passive:true});
		cell.dom_element.addEventListener('touchend', function(){ cell.set_css('tabbar-item-press', true); }, {passive:true});
		this.add_widget(cell);
		this.bar_btns[item.name] = {cell: cell, icon: icon, label: label, badge: badge};
	}
	_clicked(item){
		this.set_active(item.name);
		this.dispatch('command', item);
	}
	set_active(name){
		this.active_name = name;
		for (var k in this.bar_btns){
			var b = this.bar_btns[k];
			if (k === name) b.cell.set_css('tabbar-item-active');
			else b.cell.set_css('tabbar-item-active', true);
		}
	}
	set_badge(name, n){
		var b = this.bar_btns[name];
		if (!b) return;
		if (n > 0){
			if (!b.badge){
				b.badge = new bricks.Text({text: String(n), css:'tabbar-badge'});
				b.cell.add_widget(b.badge);
			} else {
				b.badge.set_text(String(n));
				b.badge.dom_element.style.display = '';
			}
		} else if (b.badge){
			b.badge.dom_element.style.display = 'none';
		}
	}
	// 角标轮询：items 里声明 badge_url 的项定时拉取 {count:n} 刷新角标。
	// 用裸 fetch 而非 HttpJson —— 未登录时 401 静默跳过，不触发登录弹窗
	// （外壳允许 any 访问，登录前轮询不应打扰用户）。
	_start_badge_polling(interval_s){
		var todo = [];
		for (var i=0;i<this.bar_items.length;i++){
			if (this.bar_items[i].badge_url) todo.push(this.bar_items[i]);
		}
		if (!todo.length) return;
		var self = this;
		async function poll(){
			for (var i=0;i<todo.length;i++){
				var it = todo[i];
				try {
					var r = await fetch(it.badge_url, {method:'GET'});
					if (!r.ok) continue;
					var d = await r.json();
					if (d && typeof d.count !== 'undefined'){
						self.set_badge(it.name, parseInt(d.count, 10) || 0);
					}
				} catch(e){}
			}
		}
		poll();
		this._badge_timer = setInterval(poll, interval_s * 1000);
	}
}
bricks.Factory.register('TabBar', bricks.TabBar);

/* ══════════════════════════ ChipBar ══════════════════════════
   横向滚动胶囊切换条。数据来自 dataurl（dspy 返回 {items:[...], selected:...}
   或直接 [...]）。选中派发 select 事件，params = 整条 item 数据，
   可直接被 bind 的 urlwidget params 合并（如 pipeline_id 透传给目标 dspy）。
   options: {
       dataurl: 数据地址
       params: 请求参数
       valueField: 值字段名（默认 'id'）
       textField:  显示字段名（默认 'name'）
       selected:   初始选中值
       empty_text: 无数据提示（默认 '暂无数据'）
       select_on_load: false 可禁用初始 select 派发（默认派发，
                       供联动控件如 AgentIO.set_pipeline 初始化）
   }
   events: select → item 数据
*/
bricks.ChipBar = class extends bricks.HScrollPanel {
	constructor(opts){
		opts.css = (opts.css || '') + ' chipbar';
		super(opts);
		// HScrollPanel 构造强制 height:'100%'；胶囊条是内容高度（auto），恢复之
		this.set_style('height', 'auto');
		this.value_field = opts.valueField || 'id';
		this.text_field = opts.textField || 'name';
		this.chips = {};
		this.selected_value = opts.selected || '';
		if (this.opts.dataurl){
			this.load_data(this.opts.dataurl, this.opts.params || {});
		} else if (opts.items){
			this.apply_data_items(opts.items, opts.selected || '');
		}
	}
	async load_data(url, params){
		var jc = new bricks.HttpJson();
		var d = await jc.get(url, {params: params});
		if (!d) return;
		var items = d.items || d;
		if (!Array.isArray(items)) return;
		this.apply_data_items(items, d.selected || this.selected_value);
	}
	apply_data_items(items, selected){
		this.data_items = items;
		if (!items.length){
			var t = new bricks.Text({otext: this.opts.empty_text || '暂无数据', i18n: true, css:'chip-empty'});
			this.add_widget(t);
			return;
		}
		for (var i=0;i<items.length;i++){
			this._create_chip(items[i]);
		}
		if (!selected && items.length) selected = items[0][this.value_field];
		this.set_selected(selected);
		// 初始 select 派发：联动控件（AgentIO 等）据此完成初始化。
		if (this.opts.select_on_load !== false){
			for (var j=0;j<items.length;j++){
				if (items[j][this.value_field] == selected){
					this.dispatch('select', items[j]);
					break;
				}
			}
		}
	}
	_create_chip(item){
		var v = item[this.value_field];
		var txt = item[this.text_field] || v;
		var chip = new bricks.Text({otext: txt, i18n: true, css:'chip'});
		chip.dom_element.style.cursor = 'pointer';
		chip.bind('click', this._chip_clicked.bind(this, item));
		this.add_widget(chip);
		this.chips[String(v)] = chip;
	}
	_chip_clicked(item){
		this.set_selected(item[this.value_field]);
		this.dispatch('select', item);
	}
	set_selected(v){
		this.selected_value = v;
		for (var k in this.chips){
			if (k === String(v)) this.chips[k].set_css('chip-active');
			else this.chips[k].set_css('chip-active', true);
		}
	}
}
bricks.Factory.register('ChipBar', bricks.ChipBar);
