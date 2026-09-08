var bricks = window.bricks || {};
bricks.TabPanel = class extends bricks.Layout {
	/*
	options
	{
		css:
		tab_long: 100%
		tab_pos:"top"
		items:[
			{
				name:
				label:"tab1",
				icon:
				removable:
				refresh:false,
				content:{
					"widgettype":...
				}
			}
		]
	}
	css:
		tab
		tab-button
		tab-button-active
		tab-button-hover
		tab-content
	
	events:
		switch: fired when switch content
		event data: actived content widget

	content wedget event:
		active: fired when the content event is switch to show
	*/
	constructor(options){
		super(options);
		this.content_buffer = {};
		this.cur_tab_name = '';
		this.content_container = new bricks.Filler({});
		if (this.opts.tab_pos == 'top' ||  this.opts.tab_pos == 'bottom'){
			this.set_css('vbox');
			this.tab_container = new bricks.VBox({
					height:'auto',
					width:'auto'
			});
		} else {
			this.set_css('hbox');
			this.tab_container = new bricks.VBox({
					width:'auto',
					height:'auto'
			});
		}
		if (this.opts.tab_pos == 'top' || this.opts.tab_pos == 'left'){
			this.add_widget(this.tab_container);
			this.add_widget(this.content_container);
		} else {
			this.add_widget(this.content_container);
			this.add_widget(this.tab_container);
		}
		this.createToolbar();
		this.set_css('tabpanel');
		this.content_container.set_css('tabpanel-content');
		// 移动端底部标签栏模式（2026-09-07）：options.mobile_bar = {items:[{name,label,micon,url}]}
		// 手机视口隐藏顶部 tab 条，改用固定底部 TabBar；点击 → open_tab（框架原生动态 tab）。
		// 桌面视口 TabBar 隐藏，行为与原来完全一致（侧边栏菜单驱动 open_tab）。
		if (this.opts.mobile_bar){
			this.createMobileBar();
		}
		this.show_first_tab();
	}
	createMobileBar(){
		var mb = this.opts.mobile_bar;
		var items = ((mb && mb.items) || []).map(function(it){
			return {name: it.name, label: it.label || it.name, icon: it.micon || '',
					badge_url: it.badge_url || ''};
		});
		this.mobile_bar = new bricks.TabBar({items: items, badge_interval: mb.badge_interval || 60});
		this._mobile_bar_descs = (mb && mb.items) || [];
		this.mobile_bar.bind('command', this._mobile_bar_clicked.bind(this));
		bricks.Body.add_widget(this.mobile_bar);
		var self = this;
		this._mobile_bar_apply = function(m){
			var show = m && !!self.mobile_bar;
			self.mobile_bar.dom_element.style.display = show ? 'flex' : 'none';
			self.tab_container.dom_element.style.display = show ? 'none' : '';
			if (show) self.set_css('tabpanel-mobilebar');
			else self.set_css('tabpanel-mobilebar', true);
			if (show){
				// 手机首屏：当前 tab 不在底部栏（如桌面默认的 home/商店页）时
				// 自动切到第一项（产线工作界面，1 次都不用点）
				var known = false;
				for (var i=0;i<self._mobile_bar_descs.length;i++){
					if (self._mobile_bar_descs[i].name === self.cur_tab_name){ known = true; break; }
				}
				if (!known && self._mobile_bar_descs.length){
					self._mobile_bar_clicked({name: self._mobile_bar_descs[0].name});
				} else {
					self.mobile_bar.set_active(self.cur_tab_name);
				}
			}
		};
		bricks.on_mobile_mode(this._mobile_bar_apply);
		this._mobile_bar_apply(bricks.is_mobile());
	}
	_mobile_bar_clicked(item){
		// bind 事件经 dispatch 包装为 {params: 数据}（Toolbar/Menu 同约定）；
		// 框架内部直调传裸对象 —— 两种形态都兼容（2026-09-08 实测：不解包则
		// 用户点底部 Tab 静默无响应）
		if (item && item.params) item = item.params;
		var desc = null;
		for (var i=0;i<this._mobile_bar_descs.length;i++){
			if (this._mobile_bar_descs[i].name === item.name){ desc = this._mobile_bar_descs[i]; break; }
		}
		if (!desc) return;
		// refresh:false —— 手机底部 Tab 切换保留各页状态（会话/滚动位置），
		// 符合手机操作习惯（微信式）；桌面侧边栏 open_tab 的"点击即刷新"语义不受影响
		this.open_tab({name: desc.name, label: desc.label, url: desc.url,
				removable: false, refresh: false});
		this.mobile_bar.set_active(desc.name);
	}
	show_first_tab(){
		// 手机视口 + 配了 mobile_bar：首屏由底部栏第一项决定（如「产线」工作界面），
		// 不能再 dispatch items[0]（桌面默认 tab，如商店页）—— 否则后者异步构建完成
		// 会把手机首屏覆盖掉。
		// 注意去重：constructor 里 createMobileBar→_mobile_bar_apply 已同步执行过
		// _mobile_bar_clicked（cur_tab_name 已置为第一项），此处只需兜底（如
		// _mobile_bar_apply 未触发点击的场景），避免 open_tab 二次刷新重复拉取。
		if (this.opts.mobile_bar && bricks.is_mobile()){
			var descs = this._mobile_bar_descs || [];
			var cur_known = false;
			for (var i=0;i<descs.length;i++){
				if (descs[i].name === this.cur_tab_name){ cur_known = true; break; }
			}
			if (cur_known) return;
			if (descs.length){
				this._mobile_bar_clicked({name: descs[0].name});
				return;
			}
		}
		var first = this.opts.items[0];
		if (!first) return;
		// 按钮已建好（Toolbar createTools 完成后的 ready 再入）→ click 走 do_handle：
		// 内容切换 + active 高亮一起更新；按钮还没建好（constructor 首次同步调用）→
		// dispatch command 先加载内容，高亮由 ready 后的 click 补上
		for (var i=0;i<this.toolbar.toolList.length;i++){
			if (this.toolbar.toolList[i].tool_opts.name === first.name){
				this.toolbar.click(first.name);
				return;
			}
		}
		this.toolbar.dispatch('command', first);
	}
	createToolbar(){
		var desc = {
			tools:this.opts.items
		};
		var orient;
		if (this.opts.tab_pos == 'top' || this.opts.tab_pos == 'bottom'){
			orient = 'horizontal';
		} else {
			orient = 'vertical';
		}
		desc.orientation = orient;
		this.toolbar = new bricks.Toolbar(desc);
		this.toolbar.bind('command', this.show_tabcontent.bind(this));
		this.toolbar.bind('remove', this.tab_removed.bind(this));
		this.toolbar.bind('ready', this.show_first_tab.bind(this));
		this.tab_container.add_widget(this.toolbar);
	}
	async show_tabcontent(event){
		var tdesc = event.params;
		var items = this.opts.items;
		if (tdesc.name == this.cur_tab_name){
			bricks.debug('TabPanel(): click duplication click on same tab', tdesc)
			return;
		}
		for (var i=0;i<items.length;i++){
			if (tdesc.name == items[i].name){
				var w = this.content_buffer[tdesc.name];
				// refresh:true 的 tab 每次切换都重建（原语义保留）
				if (w && items[i].refresh){
					delete this.content_buffer[tdesc.name];
					w = null;
				}
				if (!w){
					var c = items[i].content || {"widgettype":"urlwidget","options":{"url":items[i].url}};
					try {
						if (c instanceof bricks.JsWidget){
							w = c;
						} else {
							w = await bricks.widgetBuild(c, this, {});
						}
					}
					catch (e) {
						console.log('except ', e)
					}
					if (! w){
						bricks.debug('TabPanel():create content error', c);
						return;
					}
					this.content_buffer[tdesc.name] = w;
				}
				this._push_tab_history(tdesc.name);
				this.cur_tab_name = tdesc.name;
				this.switch_content(w);
				return;
			}
		}
		bricks.debug('TabPanel(): click event handled but noting to do', tdesc)
	}
	switch_content(w){
		this.content_container.clear_widgets();
		this.content_container.add_widget(w);
		this.dispatch('switch', w);
		w.dispatch('active');
	}
	// 动态 tab 支持（原 pipeline-app index_tab.js 补丁，2026-09-07 收编入框架）：
	// 异步加载 tab content —— 不阻塞 open_tab；401 触发登录框，登录后重试。
	async _load_tab_content(desc){
		if (this.content_buffer[desc.name]){
			if (this.cur_tab_name === desc.name) this.switch_content(this.content_buffer[desc.name]);
			return;
		}
		var c = desc.content || {"widgettype":"urlwidget","options":{"url":desc.url}};
		var w = await bricks.widgetBuild(c, this, {});
		this.content_buffer[desc.name] = w;
		if (w && this.cur_tab_name === desc.name) this.switch_content(w);
	}
	// 动态打开 tab：已存在则切换（默认刷新内容，desc.refresh===false 用缓存），
	// 不存在则新增。content 异步加载不阻塞；新增时等 createTool 真正建出按钮
	// 再 toolbar.click —— createTool 是 async（await widgetBuild），若同步 click，
	// 新按钮还没进 toolList，click 空转 → active 高亮不切换（2026-09-08 bugfix）。
	async open_tab(desc){
		var existing = null;
		for (var i=0;i<this.opts.items.length;i++){
			if (this.opts.items[i].name === desc.name){ existing = this.opts.items[i]; break; }
		}
		if (existing){
			var need_refresh = desc.refresh !== false;
			if (desc.name !== this.cur_tab_name){
				this._push_tab_history(desc.name);
				this.cur_tab_name = desc.name;
				if (this.toolbar && this.toolbar.click) this.toolbar.click(desc.name);
			}
			if (need_refresh){
				delete this.content_buffer[desc.name];
				this._load_tab_content(existing);
			} else {
				var w = this.content_buffer[desc.name];
				if (w) this.switch_content(w);
				else this._load_tab_content(existing);
			}
			return;
		}
		// 新增
		desc.content = desc.content || {"widgettype":"urlwidget","options":{"url":desc.url}};
		this.opts.items.push(desc);
		this._push_tab_history(desc.name);
		this.cur_tab_name = desc.name;
		await this.add_tab(desc);
		// cur_tab_name 已提前置位：click → do_handle 更新按钮高亮，
		// 派发的 command 到 show_tabcontent 时同名早退，不会重复加载 content
		if (this.toolbar && this.toolbar.click) this.toolbar.click(desc.name);
		this._load_tab_content(desc);
	}
	add_tab(desc){
		// createTool 内部已按 desc.removable 调 Toolbar.add_removable 挂删除按钮；
		// TabPanel 自身无 add_removeable 方法（旧实现调它会 TypeError，
		// 2026-09-07 收编 index_tab.js 修复时一并纠正）
		return this.toolbar.createTool(desc);
	}
	// tab 访问历史（删 tab 后切回「上一个当前页」用）
	_push_tab_history(name){
		if (!this.tab_history) this.tab_history = [];
		this.tab_history.remove(name);
		this.tab_history.push(name);
	}
	// 删除 tab 后的下一个 tab：历史里最近访问且仍在 items 的；无则第一个
	_next_tab_after_remove(){
		var items = this.opts.items;
		var hist = this.tab_history || [];
		for (var i=hist.length-1;i>=0;i--){
			for (var j=0;j<items.length;j++){
				if (items[j].name === hist[i]) return items[j].name;
			}
		}
		return items.length ? items[0].name : null;
	}
	tab_removed(event){
		var desc = event.params;
		var name = desc.name;
		if (this.content_buffer.hasOwnProperty(name)){
			var w = this.content_buffer[name];
			delete this.content_buffer[name];
			// 释放被删 tab 的内容 widget（含定时器/事件，防泄漏）
			if (w && w.destroy) { try { w.destroy(); } catch(e){} }
		}
		// items 同步移除：否则 open_tab/show_tabcontent 仍把它当存在的 tab
		for (var i=0;i<this.opts.items.length;i++){
			if (this.opts.items[i].name === name){ this.opts.items.splice(i,1); break; }
		}
		if (this.tab_history) this.tab_history.remove(name);
		if (name == this.cur_tab_name){
			// 清空 cur_tab_name：让 toolbar.click → show_tabcontent 不早退，
			// 且 do_handle 真正切换内容 + 更新按钮高亮
			this.cur_tab_name = '';
			var next = this._next_tab_after_remove();
			if (next){
				if (this.toolbar && this.toolbar.click) this.toolbar.click(next);
			} else {
				// 没有剩余 tab：内容区一并清空（原实现漏掉 → 内容残留）
				this.content_container.clear_widgets();
			}
		}
	}
}

bricks.Factory.register('TabPanel', bricks.TabPanel);
