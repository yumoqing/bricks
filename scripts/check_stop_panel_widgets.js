#!/usr/bin/env node
/*
 * check_stop_panel_widgets.js —— RefreshWidget「stop_refresh 生效时同停本面板其它实时控件」自检。
 *
 * 背景：会话实时面板是 VBox[表头 RefreshWidget, 任务树 Tree]。表头端点返回 stop_refresh:true
 * 时旧实现只 this.stop() 停自己 → Tree 自带 refresh_seconds 仍每 5s 拉一次，
 * 「项目跑完不再刷新」不成立。本修复在同分支调 bricks.live_widgets.stop_all(面板根)，
 * 面板根 = this.dom_element.parentElement（表头与树同为面板 VBox 的子节点），
 * 按 root.contains(...) 作用域 → 只停本面板（同页多会话 tab 不互扰）。
 *
 * 本脚本在 node 里用桩环境【真实加载 bricks/layout.js】（桩只顶住 JsWidget/HttpJson/absurl/
 * widgetBuild/schedule_once 等外部依赖，RefreshWidget 与 live_widgets 都是仓库真实代码），并：
 *  1) 差分门禁：未返回 stop_refresh 的场景（包装体 stop_refresh:false / 裸 widget desc /
 *     未传 live_panel），必须与 git BASE_REF（默认 HEAD）的 layout.js 行为【逐事件一致】——
 *     即「未传新参数的既有用法行为一字不变」。
 *  2) 新行为：stop_refresh:true → 渲染完最终状态后，本面板内兄弟实时控件被停、自己也被停，
 *     且真的调用了 stops_all（作用域根 = parentElement）。
 *  3) 作用域：另一个面板里的实时控件【不】被停。
 *  4) 边界：dom_element/parentElement 缺失、live_widgets 或 stop_all 不存在、stop_all 自身抛错
 *     → stop_panel_widgets 一律不抛。
 *
 * 运行：node scripts/check_stop_panel_widgets.js
 * 通过打印 STOP_PANEL_WIDGETS_OK=<通过>/<总数>；有失败打印 FAIL 并以退出码 1 结束。
 */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const { execSync } = require('child_process');

const REPO = path.resolve(__dirname, '..');
const BASE_REF = process.env.BASE_REF || 'HEAD';

// ── 极简 DOM 桩：parentElement 链 + contains（与浏览器语义一致，供 stop_all 作用域判定） ──
function make_el(tag) {
	const el = {
		tag: tag || 'el', style: {}, children: [], childNodes: [], parentElement: null,
		classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
		appendChild(c) { if (c) { c.parentElement = el; el.children.push(c); } return c; },
		removeChild(c) { const i = el.children.indexOf(c); if (i >= 0) el.children.splice(i, 1); return c; },
		insertBefore(c) { return el.appendChild(c); },
		setAttribute() {}, getAttribute() { return null; },
		addEventListener() {}, removeEventListener() {}, remove() {},
		querySelectorAll() { return []; }, querySelector() { return null; },
		getElementsByTagName() { return []; }, getElementsByClassName() { return []; },
		cloneNode() { return make_el(el.tag); },
		contains(node) { let n = node; while (n) { if (n === el) return true; n = n.parentElement; } return false; },
	};
	return el;
}

// ── 桩环境：JsWidget 提供 layout.js 需要的全部成员；每个沙箱独立、可注入端点响应 ──
function make_ctx() {
	const sb = {
		console, setTimeout, clearTimeout, setInterval, clearInterval,
		JSON, Math, Date, Promise, Object, Array, RegExp, Error, TypeError,
		Number, String, Boolean, Symbol, parseInt, parseFloat, isNaN,
		encodeURIComponent, decodeURIComponent, encodeURI, decodeURI,
	};
	sb.window = sb; sb.globalThis = sb; sb.self = sb; sb.bricks = {};
	sb.__trace = [];          // 事件轨迹（纯字符串 → 可跨版本逐事件比对）
	sb.__stop_all_calls = 0;  // stop_all 被调次数（含防御性提前返回的场景）
	sb.__resp = null;         // 端点响应（每个场景注入）
	sb.__wbuild_result = undefined; // widgetBuild 返回值；undefined → 默认给一个可渲染 widget
	sb.__scheduled = [];      // schedule_once 记录

	sb.schedule_once = function (f, t) { sb.__trace.push('schedule:' + String(t)); sb.__scheduled.push({ f, t }); };

	sb.document = {
		body: make_el('body'), documentElement: make_el('html'), head: make_el('head'), currentScript: null,
		createElement: (t) => make_el(t), createTextNode: () => ({}), createDocumentFragment: () => make_el('frag'),
		addEventListener() {}, removeEventListener() {},
		querySelectorAll: () => [], querySelector: () => null, getElementById: () => null,
		getElementsByTagName: () => [], getElementsByClassName: () => [], cookie: '',
	};
	sb.navigator = { userAgent: 'node', languages: ['en'], language: 'en' };
	sb.location = { href: 'http://localhost/', origin: 'http://localhost', protocol: 'http:', host: 'localhost', pathname: '/', search: '' };
	sb.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
	sb.HTMLElement = class {}; sb.Element = class {}; sb.Node = class {};

	// layout.js 的基类：只实现被走到的方法（RefreshWidget/VBox/Layout 路径），并把渲染动作记进 trace
	sb.bricks.JsWidget = class {
		constructor(opts) {
			this.opts = opts || {};
			this.children = [];
			this.dom_element = make_el('widget');
		}
		add_widget(w) {
			sb.__trace.push('add_widget');
			this.children.push(w);
			if (w && w.dom_element) this.dom_element.appendChild(w.dom_element);
		}
		clear_widgets() {
			sb.__trace.push('clear_widgets');
			this.children.forEach((c) => { if (c && c.dom_element) this.dom_element.removeChild(c.dom_element); });
			this.children = [];
		}
		set_css() {} set_style() {} bind() {}
		is_in_dom() { return true; }
	};

	// 外部依赖桩（RefreshWidget.show_widget 用到的三个 + HttpJson + 末端 Factory.register）
	sb.bricks.Factory = { register() {}, create() { return null; } };
	sb.bricks.absurl = function (u) { return (u === undefined || u === null) ? '' : String(u); };
	sb.bricks.HttpJson = class { async httpcall(url) { sb.__trace.push('httpcall:' + url); return sb.__resp; } };
	sb.bricks.widgetBuild = async function (desc) {
		sb.__trace.push('widgetBuild');
		// layout.js 的真 add_widget/clear_widgets 会对子控件调 w.dispatch('on_parent', ...)，桩对象补上
		const r = (sb.__wbuild_result !== undefined)
			? sb.__wbuild_result
			: { widgettype: (desc && desc.widgettype) || 'Text', dom_element: make_el('rendered'), stop() {} };
		if (r && typeof r.dispatch !== 'function') r.dispatch = function () {};
		return r;
	};
	return sb;
}

// 用给定 layout.js 源码装载沙箱，并给 live_widgets.stop_all 加计数探针
function load_layout(layout_src) {
	const sb = make_ctx();
	vm.createContext(sb);
	vm.runInContext(layout_src, sb, { filename: 'layout.js' });
	const lw = sb.bricks.live_widgets;
	const orig = lw.stop_all;
	lw.stop_all = function (root) { sb.__stop_all_calls++; sb.__last_stop_all_root = root; return orig.call(this, root); };
	return sb;
}

// 建一个「面板根 VBox」+ 挂在其下的实时兄弟控件（模拟任务树 Tree）
function make_panel(sb, tag) {
	const root = make_el('panel-' + tag);
	const tree = {
		tag, stopped: false, stop_calls: 0, dom_element: make_el('tree-' + tag),
		stop() { this.stopped = true; this.stop_calls++; if (sb.bricks.live_widgets) sb.bricks.live_widgets.unregister(this); },
	};
	root.appendChild(tree.dom_element);
	sb.bricks.live_widgets.register(tree);
	return { root, tree };
}

const CUR_SRC = fs.readFileSync(path.join(REPO, 'bricks/layout.js'), 'utf8');
let BASE_SRC = null, BASE_NOTE = '';
try { BASE_SRC = execSync('git show ' + BASE_REF + ':bricks/layout.js', { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 24 }); }
catch (e) { BASE_NOTE = '取不到基线 ' + BASE_REF + ':bricks/layout.js → 跳过差分门禁'; }
// 基线已含本修复（本修复提交后 HEAD 即"改后"，源码逐字节相同）→ 差分/复现门禁退化，改为跳过，
// 否则会把"改后"当"改前"，把真实用例误判为失败（check_apply_data.js 曾踩同一坑）。
if (BASE_SRC && (BASE_SRC === CUR_SRC || BASE_SRC.indexOf('stop_panel_widgets') !== -1)) {
	BASE_NOTE = '基线 ' + BASE_REF + ' 已含本修复(或与当前逐字节相同) → 跳过差分/复现门禁';
	BASE_SRC = null;
}

// 场景：注入端点响应 + live_panel，构造表头 RefreshWidget 挂到面板根，跑一次 show_widget
async function run_scenario(layout_src, scen) {
	const sb = load_layout(layout_src);
	sb.__resp = scen.resp;
	const same = (scen.same_panel === false) ? null : make_panel(sb, 'same');
	const other = scen.other_panel ? make_panel(sb, 'other') : null;
	const header = new sb.bricks.RefreshWidget({
		url: scen.url || '/pipeline-sdlc/api/live_status.dspy?session_id=s1',
		live_panel: scen.live_panel, period_seconds: 5,
	});
	(same ? same.root : make_el('solo')).appendChild(header.dom_element);
	sb.__trace = [];   // 只保留 show_widget 期间的事件
	const out = {
		sb, header, same, other,
		threw: null, rendered_children: null, header_stopped: null,
		same_stopped: null, same_stop_calls: null, other_stopped: null,
		stop_all_calls: 0, registry_size: null, trace: null, scheduled_after: 0,
	};
	const before = sb.__scheduled.length;
	try { await header.show_widget(); } catch (e) { out.threw = (e && e.message) || String(e); }
	out.trace = sb.__trace.slice();
	out.rendered_children = header.children.length;
	out.header_stopped = !!header.stopped;
	out.same_stopped = same ? same.tree.stopped : null;
	out.same_stop_calls = same ? same.tree.stop_calls : null;
	out.other_stopped = other ? other.tree.stopped : null;
	out.stop_all_calls = sb.__stop_all_calls;
	out.registry_size = sb.bricks.live_widgets.registry.length;
	out.scheduled_after = sb.__scheduled.length - before;
	return out;
}

// ── 断言框架 ──
const results = [];
function check(name, fn) {
	try { const r = fn(); results.push({ name, ok: r === true, detail: r === true ? '' : String(r) }); }
	catch (e) { results.push({ name, ok: false, detail: (e && e.message) || String(e) }); }
}
function deep_eq(a, b) { try { return JSON.stringify(a) === JSON.stringify(b); } catch (e) { return a === b; } }

const WRAPPED_RUNNING = { widget: { widgettype: 'Text', options: { text: '进行中' } }, stop_refresh: false };
const WRAPPED_STOP = { widget: { widgettype: 'Text', options: { text: '已完成' } }, stop_refresh: true };
const PLAIN_DESC = { widgettype: 'Text', options: { text: '裸 desc（无 widget 键）' } };

(async function main() {
	// ── 1) 差分门禁：无 stop_refresh 的三类既有用法，新旧逐事件一致 ──
	const unchanged = [
		{ name: 'stop_refresh:false（包装体）+live_panel', resp: WRAPPED_RUNNING, live_panel: true, same_panel: true, other_panel: true },
		{ name: '裸 widget desc（无 widget 键）+live_panel', resp: PLAIN_DESC, live_panel: true, same_panel: true, other_panel: true },
		{ name: '包装体 stop_refresh:false，未传 live_panel', resp: WRAPPED_RUNNING, live_panel: false, same_panel: true, other_panel: true },
	];
	for (const scen of unchanged) {
		const nw = await run_scenario(CUR_SRC, scen);
		check('新行为: ' + scen.name + ' —— 不停任何控件、无 stop_all 调用', () => {
			if (nw.threw) return '抛异常: ' + nw.threw;
			if (nw.header_stopped) return '表头竟被停';
			if (nw.same_stopped) return '本面板兄弟控件被停（不该）';
			if (nw.other_stopped) return '另一面板控件被停（不该）';
			if (nw.stop_all_calls !== 0) return 'stop_all 被调用了 ' + nw.stop_all_calls + ' 次（不该）';
			if (nw.rendered_children !== 1) return '最终状态未渲染, children=' + nw.rendered_children;
			if (nw.scheduled_after !== 1) return '未续排下一次刷新, scheduled=' + nw.scheduled_after;
			return true;
		});
		if (BASE_SRC) {
			const od = await run_scenario(BASE_SRC, scen);
			check('差分(逐事件一致): ' + scen.name, () => {
				if (od.threw !== nw.threw) return '改前 threw=' + od.threw + ' 改后=' + nw.threw;
				if (!deep_eq(od.trace, nw.trace)) return '事件轨迹不同:\n    改前=' + JSON.stringify(od.trace) + '\n    改后=' + JSON.stringify(nw.trace);
				const keys = ['rendered_children', 'header_stopped', 'same_stopped', 'same_stop_calls', 'other_stopped', 'stop_all_calls', 'registry_size', 'scheduled_after'];
				for (const k of keys) { if (od[k] !== nw[k]) return k + ' 改前=' + od[k] + ' 改后=' + nw[k]; }
				return true;
			});
		}
	}

	// ── 2) 主行为：stop_refresh:true → 渲染完最终状态后停自己 + 停本面板其它实时控件 ──
	{
		const scen = { resp: WRAPPED_STOP, live_panel: true, same_panel: true, other_panel: true };
		const nw = await run_scenario(CUR_SRC, scen);
		check('主行为: stop_refresh:true —— 本面板兄弟控件被停(stop 已调)', () => {
			if (nw.threw) return '抛异常: ' + nw.threw;
			if (nw.same_stop_calls !== 1) return '兄弟控件 stop 调用次数=' + nw.same_stop_calls + '（应为 1）';
			if (!nw.same_stopped) return '兄弟控件 stopped 非真';
			return true;
		});
		check('主行为: stop_refresh:true —— 自己也被停且不停刷', () => {
			if (!nw.header_stopped) return '表头未停';
			if (nw.scheduled_after !== 0) return '又续排了下一次刷新（不该）';
			return true;
		});
		check('主行为: stop_refresh:true —— 最终状态已渲染后才停(children=1)', () => {
			return nw.rendered_children === 1 || ('children=' + nw.rendered_children);
		});
		check('主行为: stop_refresh:true —— 真的调了 stops_all(作用域根=parentElement)', () => {
			return nw.stop_all_calls === 1 || ('stop_all 调用次数=' + nw.stop_all_calls);
		});
		check('主行为: stop_refresh:true —— 作用域只限本面板(另一面板控件未被停)', () => {
			if (nw.other_stopped) return '另一面板控件被误停（跨会话互扰）';
			return true;
		});
		check('主行为: stop_refresh:true —— 作用域根 就是 this.dom_element.parentElement', () => {
			if (nw.sb.__last_stop_all_root !== nw.header.dom_element.parentElement) return '传入的 root 不是 parentElement';
			if (nw.sb.__last_stop_all_root !== nw.same.root) return '传入的 root 不是本面板根 VBox';
			return true;
		});
		check('主行为: stop_refresh:true —— 本面板两个都移出登记表(只剩另一面板)', () => {
			const reg = nw.sb.bricks.live_widgets.registry;
			if (reg.length !== 1) return 'registry=' + reg.length + '（应只剩另一面板的 1 个）';
			if (reg[0] !== nw.other.tree) return '登记表里剩的不是另一面板的控件';
			return true;
		});
		if (BASE_SRC) {
			const od = await run_scenario(BASE_SRC, scen);
			check('复现: 改前 stop_refresh:true 确实没停兄弟控件(证明修复必要)', () => {
				if (od.threw) return '改前抛异常(非本用例预期): ' + od.threw;
				if (od.same_stopped) return '改前竟然停了兄弟控件——用例设计有误';
				if (od.stop_all_calls !== 0) return '改前竟调了 stop_all';
				if (!od.header_stopped) return '改前表头应已停';
				return true;
			});
		}
	}

	// ── 3) 边界：一律不抛 ──
	async function edge(name, mutate, expect_stop_all) {
		const sb = load_layout(CUR_SRC);
		sb.__resp = WRAPPED_STOP;
		const root = make_el('panel-edge');
		const h = new sb.bricks.RefreshWidget({ url: '/x', live_panel: true, period_seconds: 5 });
		root.appendChild(h.dom_element);   // 默认前置条件完好：dom_element 与 parentElement 都在
		const before = sb.__stop_all_calls;
		mutate(sb, h);
		let threw = null;
		try { h.stop_panel_widgets(); } catch (e) { threw = (e && e.message) || String(e); }
		const calls = sb.__stop_all_calls - before;
		check('边界(不抛): ' + name, () => {
			if (threw) return '抛了: ' + threw;
			if (calls !== expect_stop_all) return 'stop_all 调用次数=' + calls + '（应为 ' + expect_stop_all + '）';
			return true;
		});
	}
	await edge('dom_element 缺失 → 静默跳过', (sb, h) => { h.dom_element = null; }, 0);
	await edge('dom_element.parentElement 为 null → 静默跳过', (sb, h) => { h.dom_element.parentElement = null; }, 0);
	await edge('bricks.live_widgets 不存在 → 静默跳过', (sb) => { sb.bricks.live_widgets = undefined; }, 0);
	await edge('live_widgets 无 stop_all 方法 → 静默跳过', (sb) => { sb.bricks.live_widgets.stop_all = undefined; }, 0);
	await edge('stop_all 自身抛错 → 被吞(不抛)，且确实被调到', (sb) => {
		sb.bricks.live_widgets.stop_all = function () { sb.__stop_all_calls++; throw new Error('stop_all boom'); };
	}, 1);
	// stop_all 抛错场景（走完整 show_widget）：最终状态仍须完好、表头已停。
	{
		const sb = load_layout(CUR_SRC);
		sb.__resp = WRAPPED_STOP;
		sb.__wbuild_result = { widgettype: 'Text', dom_element: make_el('rendered'), stop() {} };
		const root = make_el('panel'); 
		const h = new sb.bricks.RefreshWidget({ url: '/x', live_panel: true, period_seconds: 5 });
		root.appendChild(h.dom_element);
		sb.bricks.live_widgets.stop_all = function () { sb.__stop_all_calls++; throw new Error('stop_all boom'); };
		let threw = null;
		try { await h.show_widget(); } catch (e) { threw = (e && e.message) || String(e); }
		check('边界: stop_all 抛错时 show_widget 不抛且最终状态仍渲染', () => {
			if (threw) return 'show_widget 抛了: ' + threw;
			if (h.children.length !== 1) return '最终状态未保留, children=' + h.children.length;
			if (!h.stopped) return '表头未停';
			if (sb.__stop_all_calls !== 1) return 'stop_all 未被调用';
			return true;
		});
	}

	// ── 输出 ──
	let passed = 0;
	for (const r of results) {
		if (r.ok) { passed++; console.log('  ok   ' + r.name); }
		else { console.log('  FAIL ' + r.name + '  →  ' + r.detail); }
	}
	if (BASE_NOTE) console.log('  (note) ' + BASE_NOTE);
	console.log('');
	console.log('STOP_PANEL_WIDGETS_OK=' + passed + '/' + results.length);
	process.exit(passed === results.length ? 0 : 1);
})();
