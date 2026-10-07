#!/usr/bin/env node
/*
 * check_apply_data.js —— bricks.apply_data 的 JSON 转义自检（node 直跑，非「看起来对」）。
 *
 * 背景：apply_data(desc, data) = JSON.stringify(desc) → obj_fmtstr(纯文本 ${key} 替换) → JSON.parse。
 * 替换值未做 JSON 转义 → 值里含 " / \ / 换行 / 控制符时 JSON.parse 抛错，抛点在
 * TreeNode.create_node_content（构造器未 await）→ 节点标题静默消失（只剩三角+图标，无日志）。
 *
 * 本脚本在 node 里以桩环境真实加载 bricks/utils.js + bricks/bricks.js，
 * 直接调用【真实的】bricks.apply_data / bricks.obj_fmtstr，并额外从 git HEAD 取出
 * 改前的 apply_data 做差分对照：
 *   - 无 JSON 特殊字符的普通值：改前不抛 → 改后必须逐字节相同（零回归）。
 *   - 含特殊字符的值(special)：改前必抛或静默损坏(往返失败) → 改后必须正确往返。
 *
 * 运行：node scripts/check_apply_data.js   （在仓库根，或任意 cwd）
 * 通过时打印 APPLY_DATA_OK=<通过>/<总数>；有失败则打印 FAIL 并以退出码 1 结束。
 */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const { execSync } = require('child_process');

// 用显式字符码构造含特殊字符的测试值，避免源码转义歧义。
const BS = String.fromCharCode(92);   // 反斜杠
const LF = String.fromCharCode(10);   // 换行
const CR = String.fromCharCode(13);   // 回车
const TAB = String.fromCharCode(9);   // 制表
const SOH = String.fromCharCode(1);   // 控制符

const REPO = path.resolve(__dirname, '..');

// ── 桩环境：把 bricks 的两个源文件加载进 node（浏览器 API 用最小桩顶住） ──
function make_el() {
	return {
		style: {}, classList: { add() {}, remove() {}, toggle() {} },
		appendChild() {}, removeChild() {}, insertBefore() {},
		setAttribute() {}, getAttribute() { return null; },
		addEventListener() {}, removeEventListener() {}, remove() {},
		querySelectorAll() { return []; }, querySelector() { return null; },
		getElementsByTagName() { return []; }, children: [], childNodes: [],
		contains() { return false; }, cloneNode() { return make_el(); },
	};
}
function make_ctx() {
	const sb = {
		console, setTimeout, clearTimeout, setInterval, clearInterval,
		JSON, Math, Date, Promise, Object, Array, WeakSet, WeakMap, Map, Set,
		RegExp, Error, TypeError, RangeError, Number, String, Boolean, Symbol,
		parseInt, parseFloat, isNaN, encodeURIComponent, decodeURIComponent,
		encodeURI, decodeURI, atob, btoa, structuredClone,
		fetch: async () => ({ ok: false, status: 0, json: async () => null, text: async () => '' }),
	};
	sb.window = sb; sb.globalThis = sb; sb.self = sb; sb.bricks = {};
	sb.document = {
		body: make_el(), documentElement: make_el(), head: make_el(), currentScript: null,
		createElement: () => make_el(), createTextNode: () => ({}), createDocumentFragment: () => make_el(),
		addEventListener() {}, removeEventListener() {},
		querySelectorAll: () => [], querySelector: () => null, getElementById: () => null,
		getElementsByTagName: () => [make_el()], getElementsByClassName: () => [],
		cookie: '', adoptedStyleSheets: [],
	};
	sb.navigator = { userAgent: 'node', languages: ['en'], language: 'en', clipboard: {} };
	sb.location = { href: 'http://localhost/', origin: 'http://localhost', protocol: 'http:', host: 'localhost', pathname: '/', search: '' };
	sb.localStorage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
	sb.sessionStorage = { getItem: () => null, setItem() {}, removeItem() {} };
	sb.history = { pushState() {}, replaceState() {}, go() {} };
	sb.screen = { width: 1200, height: 800 };
	sb.XMLHttpRequest = class { open() {} send() {} setRequestHeader() {} };
	sb.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
	sb.MutationObserver = class { observe() {} disconnect() {} takeRecords() { return []; } };
	sb.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
	sb.getComputedStyle = () => ({ getPropertyValue: () => '' });
	sb.requestAnimationFrame = (f) => setTimeout(f, 0); sb.cancelAnimationFrame = (i) => clearTimeout(i);
	sb.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
	sb.HTMLElement = class {}; sb.Element = class {}; sb.Node = class {};
	sb.Event = class { constructor(t) { this.type = t; } }; sb.CustomEvent = class extends sb.Event {};
	sb.FormData = class {}; sb.Blob = class {}; sb.FileReader = class {}; sb.Image = class {}; sb.Audio = class {};
	sb.performance = { now: () => Date.now() }; sb.Notification = class { static requestPermission() {} };
	// bricks.js 顶层 `class App extends bricks.Layout` 需要基类存在
	sb.bricks.Layout = class {}; sb.bricks.JsWidget = class {}; sb.bricks.VBox = class {}; sb.bricks.HBox = class {};
	return sb;
}
// 用给定的 utils.js / bricks.js 源码装载出一个 bricks 命名空间
function load(utils_src, bricks_src) {
	const sb = make_ctx();
	vm.createContext(sb);
	vm.runInContext(utils_src, sb, { filename: 'utils.js' });
	vm.runInContext(bricks_src, sb, { filename: 'bricks.js' });
	return sb.bricks;
}

const cur_utils = fs.readFileSync(path.join(REPO, 'bricks/utils.js'), 'utf8');
const cur_bricks = fs.readFileSync(path.join(REPO, 'bricks/bricks.js'), 'utf8');
const newB = load(cur_utils, cur_bricks);

// 改前的源码做差分对照；取不到、或基线其实已含修复（HEAD 已提交本修复）→ 跳过差分（不 fail）
// 基线可用 BASELINE_REF=<ref> 指定（默认 HEAD）。**注意**：本修复一旦提交，HEAD 就变成"改后"，
// 差分门禁会退化 —— 故此处显式检测「基线的 apply_data 与当前逐字节相同」并跳过，
// 否则差分用例会把"改后"当"改前"，把真实用例误判为失败（曾发生：提交后跑出 10/16）。
const BASELINE_REF = process.env.BASELINE_REF || 'HEAD';
function grab_apply_data(src) {
	const m = src.match(/bricks\.apply_data = function[\s\S]*?\n\}\n/);
	return m ? m[0] : null;
}
let oldB = null, old_ok = true, old_skip_reason = '';
try {
	const old_utils = execSync('git show ' + BASELINE_REF + ':bricks/utils.js', { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 24 });
	const old_bricks = execSync('git show ' + BASELINE_REF + ':bricks/bricks.js', { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 24 });
	if (grab_apply_data(old_bricks) === grab_apply_data(cur_bricks)) {
		old_ok = false;
		old_skip_reason = '基线 ' + BASELINE_REF + ' 的 apply_data 与当前逐字节相同（已含修复）→ 跳过差分门禁';
	} else {
		oldB = load(old_utils, old_bricks);
	}
} catch (e) {
	old_ok = false;
	old_skip_reason = '取不到基线 ' + BASELINE_REF + ' 的源码';
}

// ── 断言框架 ──
const results = [];
function check(name, fn) {
	try { const r = fn(); results.push({ name, ok: r === true, detail: r === true ? '' : String(r) }); }
	catch (e) { results.push({ name, ok: false, detail: e && e.message ? e.message : String(e) }); }
}
function deep_eq(a, b) { try { return JSON.stringify(a) === JSON.stringify(b); } catch (e) { return a === b; } }
// 跑一次 apply_data（不抛，返回 {threw, val|err}）
function run_apply(B, desc, data) {
	try { return { threw: false, val: B.apply_data(desc, data) }; }
	catch (e) { return { threw: true, err: e && e.message }; }
}

// 用例：desc 为 JS 对象（apply_data 内部会 JSON.stringify），data 为替换字典。
// special=true → 值里含 JSON 特殊字符（本次修复目标），不做「与改前一致」对照，
//                改为断言「改前确实坏了（抛 或 往返 ≠ 正确值）」。
const cases = [
	{ name: 'QUOTE 引号', special: true, desc: { text: '${title}' }, data: { title: '修复 "登录" 按钮' },
	  expect: (p) => p.text === '修复 "登录" 按钮' || 'text=' + JSON.stringify(p.text) },
	{ name: 'BACKSLASH 反斜杠', special: true, desc: { text: '${title}' }, data: { title: '路径 C:' + BS + 'tmp' + BS + 'x' },
	  expect: (p) => p.text === '路径 C:' + BS + 'tmp' + BS + 'x' || 'text=' + JSON.stringify(p.text) },
	{ name: 'MIXED 反斜杠+引号', special: true, desc: { text: '${title}' }, data: { title: 'a' + BS + '"b' },
	  expect: (p) => p.text === 'a' + BS + '"b' || 'text=' + JSON.stringify(p.text) },
	{ name: 'NEWLINE 换行', special: true, desc: { text: '${title}' }, data: { title: '第一行' + LF + '第二行' },
	  expect: (p) => p.text === '第一行' + LF + '第二行' || 'text=' + JSON.stringify(p.text) },
	{ name: 'CONTROL 制表/回车/ctrl-1', special: true, desc: { text: '${t}' }, data: { t: 'a' + TAB + 'b' + CR + 'c' + SOH + 'd' },
	  expect: (p) => p.text === 'a' + TAB + 'b' + CR + 'c' + SOH + 'd' || 'text=' + JSON.stringify(p.text) },
	{ name: 'VALUE 含 ${amount} 单趟安全', desc: { text: '${title}' }, data: { title: '费用 ${amount} 元' },
	  expect: (p) => p.text === '费用 ${amount} 元' || 'text=' + JSON.stringify(p.text) },
	{ name: 'EMPTY 空串', desc: { text: '${title}' }, data: { title: '' },
	  expect: (p) => p.text === '' || 'text=' + JSON.stringify(p.text) },
	{ name: 'MISSING_KEY 缺 color', desc: { text: '${text}', color: '${color}' }, data: { text: 'x' },
	  expect: (p) => (p.text === 'x' && p.color === '') || JSON.stringify(p) },
	{ name: 'NONSTRING 数字在引号内→"5"', desc: { n: '${n}' }, data: { n: 5 },
	  expect: (p) => (p.n === '5' && typeof p.n === 'string') || ('n=' + JSON.stringify(p.n)) },
	{ name: 'NONSTRING bool在引号内→"true"', desc: { b: '${b}' }, data: { b: true },
	  expect: (p) => p.b === 'true' || ('b=' + JSON.stringify(p.b)) },
];

for (const c of cases) {
	check('apply_data ' + c.name, () => {
		const nw = run_apply(newB, c.desc, c.data);                      // 改后
		if (nw.threw) return '改后仍抛: ' + nw.err;
		const ok = c.expect(nw.val);
		if (ok !== true) return '改后结果不符: ' + ok;
		if (!(old_ok && oldB)) return true;                              // 无旧版可对照 → 跳过差分
		const od = run_apply(oldB, c.desc, c.data);                      // 改前
		if (c.special) {
			// 修复目标：改前必须确实坏了（抛 或 往返结果 ≠ 正确值），否则该用例不构成修复证据
			if (!od.threw && deep_eq(od.val, nw.val)) return '该用例改前已正确——不构成修复用例';
			return true;
		}
		// 无特殊字符的普通值：改前不抛 → 必须逐字节相同（零回归）
		if (!od.threw && !deep_eq(od.val, nw.val)) {
			return '回归! 改前=' + JSON.stringify(od.val) + ' 改后=' + JSON.stringify(nw.val);
		}
		return true;
	});
}

// 非字符串值「在引号外」：由 obj_fmtstr 直接验证（apply_data 依赖它原样传值）。
// desc 是对象 → JSON.stringify 必给字符串值加引号，故「引号外」只出现在 obj_fmtstr 直调场景。
const TMPL_N = '{"n": ${n}}';
check('obj_fmtstr 非字符串值引号外→数字 5', () => {
	const s = newB.obj_fmtstr({ n: 5 }, TMPL_N);
	const p = JSON.parse(s);
	return (p.n === 5 && typeof p.n === 'number') || ('s=' + s);
});
check('obj_fmtstr 非字符串值引号外 改前改后一致', () => {
	const s = newB.obj_fmtstr({ n: 5 }, TMPL_N);
	if (!(old_ok && oldB)) return true;
	return deep_eq(oldB.obj_fmtstr({ n: 5 }, TMPL_N), s) || 'diff';
});

// ── 回归：obj_fmtstr 对【纯文本】模板（非 JSON）行为一字不变 ──
check('obj_fmtstr 纯文本回归: 换行仍是换行', () => {
	const out = newB.obj_fmtstr({ v: 'line1' + LF + 'line2' }, 'x=${v}');
	if (out.indexOf(BS + 'n') !== -1) return '出现了字面反斜杠n: ' + JSON.stringify(out);
	return out === 'x=line1' + LF + 'line2' || JSON.stringify(out);
});
check('obj_fmtstr 纯文本回归: 引号不被转义', () => {
	const out = newB.obj_fmtstr({ v: 'a"b' }, 'x=${v}');
	if (out.indexOf(BS + '"') !== -1) return '引号被转义了: ' + JSON.stringify(out);
	return out === 'x=a"b' || JSON.stringify(out);
});
check('obj_fmtstr 纯文本 改前改后逐字节一致', () => {
	if (!(old_ok && oldB)) return true;
	const v = 'l1' + LF + 'l2', q = 'a"b' + BS + 'c';
	const a = newB.obj_fmtstr({ v, q }, 'A=${v};B=${q}');
	const b = oldB.obj_fmtstr({ v, q }, 'A=${v};B=${q}');
	return deep_eq(a, b) || ('new=' + JSON.stringify(a) + ' old=' + JSON.stringify(b));
});

// ── 证据：改前 apply_data 遇引号必抛（证明这次修的是真问题） ──
check('复现: 改前 apply_data 遇引号会抛(证明修复必要)', () => {
	if (!(old_ok && oldB)) return true;
	const desc = { text: '${title}' }, data = { title: '修复 "登录" 按钮' };
	if (!run_apply(oldB, desc, data).threw) return '改前竟然没抛——用例设计有误';
	if (run_apply(newB, desc, data).threw) return '改后仍抛';
	return true;
});

// ── 输出 ──
let passed = 0;
for (const r of results) {
	if (r.ok) { passed++; console.log('  ok   ' + r.name); }
	else { console.log('  FAIL ' + r.name + '  →  ' + r.detail); }
}
if (!old_ok) console.log('  (note) ' + (old_skip_reason || '差分对照已跳过'));
console.log('');
console.log('APPLY_DATA_OK=' + passed + '/' + results.length);
process.exit(passed === results.length ? 0 : 1);
