/*
 * engine.js — 脚本引擎解释器原型
 * 实现《脚本引擎设计规范》v1.0 的类型系统 / 表达式求值 / 事件 / 动作 / 执行模型 / 错误语义。
 * 纯同步、确定性的离散事件仿真，无任何外部依赖，可用 node 直接运行。
 *
 * 渲染 / 音频 / 变换动画在原型中为桩（记录日志），但【逻辑语义】——事件顺序、属性变化检测、
 * wait 挂起、控制流、类型检查、终止性、错误码——全部真实实现。
 *
 * 实体继承：加载时按《实体继承设计规范》§3 求解有效定义（inherit.js），扁平化注入，
 * 脚本引擎运行时不感知继承。
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./inherit'));
  } else {
    root.bricks = root.bricks || {};
    root.bricks.ScriptEngine = factory(root.bricks.ScriptInherit);
  }
}(typeof self !== 'undefined' ? self : this, function (inherit) {
const resolveAll = inherit.resolveAll;

// ────────────────────────────── 类型系统（§1）──────────────────────────────

function typeOf(v) {
  if (v === null) return 'null';
  if (typeof v === 'number') return 'number';
  if (typeof v === 'boolean') return 'boolean';
  if (typeof v === 'string') return 'string';
  if (v && typeof v === 'object' && '$e' in v) return 'entity';
  return 'unknown';
}

// ────────────────────────────── 错误（§8）───────────────────────────────

class ScriptError extends Error {
  constructor(code, message, loc) {
    super(`[${code}] ${message}` + (loc ? ` (${loc})` : ''));
    this.code = code;
    this.loc = loc;
  }
}

const E_TYPE = 'E-TYPE', E_REF = 'E-REF', E_LOOP = 'E-LOOP',
      E_DEPTH = 'E-DEPTH', E_BUDGET = 'E-BUDGET', E_DIV0 = 'E-DIV0';

// ────────────────────────────── 表达式求值（§3）───────────────────────────

// 运行时上下文：求值表达式所需的作用域与运行时句柄
function makeCtx(rt, entity, message) {
  return { rt, entity, scene: rt.scene, global: rt.global, message };
}

function resolveVar(ctx, node) {
  const scope = node.scope;
  if (scope === 'global') return ctx.global.vars;
  if (scope === 'scene') return ctx.scene.vars;
  if (scope === 'entity') {
    if (!ctx.entity) throw new ScriptError(E_REF, '实体作用域变量在场景级脚本不可用', node.name);
    return ctx.entity.vars;
  }
  // auto：实体 → 场景 → 全局（遮蔽规则 §2.3）
  if (ctx.entity && node.name in ctx.entity.vars) return ctx.entity.vars;
  if (node.name in ctx.scene.vars) return ctx.scene.vars;
  return ctx.global.vars;
}

function getProp(ctx, target, name) {
  const holder = target === 'self' ? ctx.entity
    : target === 'scene' ? ctx.scene
    : ctx.rt.entities[target];
  if (!holder) throw new ScriptError(E_REF, `引用的实体不存在: ${target}`, name);
  const p = holder.properties[name];
  if (p === undefined) throw new ScriptError(E_REF, `属性不存在: ${name}`, name);
  return p.value;
}

function evalExpr(node, ctx, depth = 0) {
  if (depth > 64) throw new ScriptError(E_DEPTH, '表达式嵌套超限');
  const k = node.k;
  if (k === 'lit') return node.v;
  if (k === 'var') {
    const vars = resolveVar(ctx, node);
    if (!(node.name in vars)) throw new ScriptError(E_REF, `变量未定义: ${node.name}`, node.name);
    return vars[node.name];
  }
  if (k === 'prop') return getProp(ctx, node.target, node.name);
  if (k === 'unary') {
    const x = evalExpr(node.x, ctx, depth + 1);
    if (node.op === '-') { if (typeOf(x) !== 'number') throw new ScriptError(E_TYPE, '一元 - 要求 number'); return -x; }
    if (node.op === '!') { if (typeOf(x) !== 'boolean') throw new ScriptError(E_TYPE, '一元 ! 要求 boolean'); return !x; }
  }
  if (k === 'bin') return evalBin(node, ctx, depth);
  if (k === 'call') {
    const fn = BUILTINS[node.fn];
    if (!fn) throw new ScriptError(E_REF, `未知函数: ${node.fn}`);
    const args = (node.args || []).map(a => evalExpr(a, ctx, depth + 1));
    return fn(args, ctx);
  }
  throw new ScriptError(E_TYPE, `未知表达式节点: ${k}`);
}

function evalBin(node, ctx, depth) {
  const op = node.op;
  if (op === '&&' || op === '||') {
    const l = evalExpr(node.l, ctx, depth + 1);
    if (typeOf(l) !== 'boolean') throw new ScriptError(E_TYPE, `&&/|| 操作数须为 boolean，实为 ${typeOf(l)}`);
    if (op === '&&') return l === false ? false : (evalExpr(node.r, ctx, depth + 1) === true);
    return l === true ? true : (evalExpr(node.r, ctx, depth + 1) === true);
  }
  const l = evalExpr(node.l, ctx, depth + 1);
  const r = evalExpr(node.r, ctx, depth + 1);
  const tl = typeOf(l), tr = typeOf(r);
  if (op === '+') {
    if (tl === 'number' && tr === 'number') return l + r;
    if (tl === 'string' && tr === 'string') return l + r;
    throw new ScriptError(E_TYPE, `+ 要求两侧同为 number 或同为 string，实为 ${tl}/${tr}`);
  }
  if (['-', '*', '/', '%'].includes(op)) {
    if (tl !== 'number' || tr !== 'number') throw new ScriptError(E_TYPE, `${op} 要求两侧为 number`);
    if (op === '-' ) return l - r;
    if (op === '*' ) return l * r;
    if (op === '/' ) return l / r;
    if (r === 0) throw new ScriptError(E_DIV0, '取模除数为 0');
    return l % r;
  }
  if (['>', '<', '>=', '<='].includes(op)) {
    if (tl !== 'number' || tr !== 'number') throw new ScriptError(E_TYPE, `${op} 要求两侧为 number`);
    if (op === '>') return l > r;
    if (op === '<') return l < r;
    if (op === '>=') return l >= r;
    return l <= r;
  }
  if (op === '==' || op === '!=') {
    if (tl !== tr) throw new ScriptError(E_TYPE, `==/!= 要求两侧类型相同，实为 ${tl}/${tr}`);
    const eq = tl === 'entity' ? (l.$e === r.$e) : (l === r);
    return op === '==' ? eq : !eq;
  }
  throw new ScriptError(E_TYPE, `未知运算符: ${op}`);
}

// ────────────────────────────── 真值表（§1.3）─────────────────────────────

function truthy(v) {
  const t = typeOf(v);
  if (t === 'boolean') return v;
  if (t === 'number') return v !== 0;
  if (t === 'string') return v.length > 0;
  if (t === 'entity') return true; // 非 null 实体恒真
  if (t === 'null') return false;
  return false;
}

// ────────────────────────────── 内建函数（§3.5 封闭集合）───────────────────

const BUILTINS = {
  abs: ([x]) => { needNum(x); return Math.abs(x); },
  min: ([a, b]) => { needNum(a); needNum(b); return Math.min(a, b); },
  max: ([a, b]) => { needNum(a); needNum(b); return Math.max(a, b); },
  floor: ([x]) => { needNum(x); return Math.floor(x); },
  ceil: ([x]) => { needNum(x); return Math.ceil(x); },
  round: ([x]) => { needNum(x); return Math.round(x); },
  random: ([a, b]) => { needNum(a); needNum(b); return a + Math.random() * (b - a); },
  randomInt: ([a, b]) => { needNum(a); needNum(b); return Math.floor(a + Math.random() * (b - a + 1)); },
  toNumber: ([s]) => { if (typeOf(s) !== 'string') throw new ScriptError(E_TYPE, 'toNumber 要求 string'); const n = Number(s); if (Number.isNaN(n)) throw new ScriptError(E_TYPE, `无法解析为数字: ${s}`); return n; },
  toString: ([x]) => { const t = typeOf(x); return t === 'entity' ? x.$e : t === 'null' ? '' : String(x); },
  len: ([s]) => { if (typeOf(s) !== 'string') throw new ScriptError(E_TYPE, 'len 要求 string'); return [...s].length; },
  contains: ([s, sub]) => { if (typeOf(s) !== 'string' || typeOf(sub) !== 'string') throw new ScriptError(E_TYPE, 'contains 要求两个 string'); return s.includes(sub); },
  compare: ([a, b]) => { if (typeOf(a) !== 'string' || typeOf(b) !== 'string') throw new ScriptError(E_TYPE, 'compare 要求两个 string'); return a < b ? -1 : a > b ? 1 : 0; },
  now: (_args, ctx) => ctx.rt.now(),
  exists: ([e]) => { if (typeOf(e) !== 'entity') throw new ScriptError(E_TYPE, 'exists 要求 entity'); return !!e.$e; },
  getProp: ([e, name]) => { if (typeOf(e) !== 'entity') throw new ScriptError(E_TYPE, 'getProp 第一个参数须为 entity'); return getProp({ entity: null, rt: null }, e.$e, name); },
};
function needNum(x) { if (typeOf(x) !== 'number') throw new ScriptError(E_TYPE, `要求 number，实为 ${typeOf(x)}`); }

// ────────────────────────────── 运行时（§7）───────────────────────────────

class SceneRuntime {
  constructor(sceneDef, opts = {}) {
    this.opts = opts;
    this.T = 0;                          // 单调时钟（秒）
    this.log = [];                       // 日志（音频/消息/变换桩 + 事件触发）
    this.eventCount = 0;
    this.budget = opts.budget || 100000;
    this.frameDT = opts.frameDT || 0.1;   // 仿真帧步长（秒）
    this.halted = false;

    // 作用域容器
    this.global = { vars: {} };
    this.scene = { id: sceneDef.id, properties: buildProps(sceneDef.properties), vars: {}, events: sceneDef.events || [] };
    this.entities = {};                  // id -> entity
    this.entityOrder = [];               // 创建顺序（§7.2 确定性）

    // 事件索引
    this.watchers = new Map();           // "target::prop" -> [eventRef]
    this.intervals = [];                 // {event, nextFire, count, ref}
    this.pendingPC = new Set();          // onPropertyChange 合并入队（§7.5.4）

    // 队列与唤醒
    this.readyQueue = [];                // FIFO 任务
    this.wakeups = [];                   // {time, task, ref}

    // 继承求解（《实体继承设计规范》§5.1）：场景加载时对所有实体求解一次，
    // 模板实体过滤（不注册运行时），其余以扁平化定义注入
    const raw = sceneDef.entities || [];
    const resolved = resolveAll(raw);                 // 非法继承在此抛 InheritError（保存期校验）
    const resolvedList = raw
      .filter(e => !e.template)                       // §5.4 模板实体不注册
      .map(e => resolved[e.id]);
    this._buildEntities(resolvedList);
    this._indexEvents();
    this._fireInitEvents();
  }

  now() { return this.T; }

  _log(kind, msg) { this.log.push({ t: this.T, kind, msg }); }

  _buildEntities(list) {
    for (const e of list) {
      this.entities[e.id] = {
        id: e.id, name: e.name, type: e.type || 'model',
        asset_ref: e.asset_ref || null,   // 继承求解后的有效外观（§3.6）
        properties: buildProps(e.properties),
        vars: {},
        transform: e.transform ? {
          pos: (e.transform.pos || [0,0,0]).slice(),
          rot: (e.transform.rot || [0,0,0]).slice(),
          scale: (e.transform.scale || [1,1,1]).slice(),
        } : { pos: [0,0,0], rot: [0,0,0], scale: [1,1,1] },
        visible: true, events: e.events || [],
      };
      this.entityOrder.push(e.id);
    }
  }

  _indexEvents() {
    const reg = (holder, ev) => {
      const ref = { holder, ev };
      if (ev.type === 'onInterval') {
        this.intervals.push({ event: ev, holder, nextFire: (ev.params.startDelay || 0), count: 0, ref });
      }
      if (ev.type === 'onPropertyChange') {
        const p = ev.params;
        // 归一化 target："self" → 持有者实体 id / "scene"；否则用字面量实体 id
        const t = p.target === 'self' ? (holder === this.scene ? 'scene' : holder.id) : p.target;
        const key = `${t}::${p.property}`;
        if (!this.watchers.has(key)) this.watchers.set(key, []);
        this.watchers.get(key).push(ref);
      }
    };
    // 场景事件先注册（§7.2 顺序：scene 优先）
    for (const ev of this.scene.events) reg(this.scene, ev);
    for (const eid of this.entityOrder) for (const ev of this.entities[eid].events) reg(this.entities[eid], ev);
  }

  _fireInitEvents() {
    // onStart：scene 先，实体按创建顺序
    const starts = [];
    for (const ev of this.scene.events) if (ev.type === 'onStart') starts.push({ holder: this.scene, ev });
    for (const eid of this.entityOrder) for (const ev of this.entities[eid].events) if (ev.type === 'onStart') starts.push({ holder: this.entities[eid], ev });
    for (const s of starts) this._enqueue(s.holder, s.ev, null);

    for (const ev of this.scene.events) if (ev.type === 'onSceneLoad') this._enqueue(this.scene, ev, null);
  }

  // 目标解析：'self' | 'scene' | 实体ID
  _holder(target, curEntity) {
    if (target === 'self') { if (!curEntity) throw new ScriptError(E_REF, 'self 在场景级脚本不可用'); return curEntity; }
    if (target === 'scene') return this.scene;
    const h = this.entities[target];
    if (!h) throw new ScriptError(E_REF, `实体不存在: ${target}`);
    return h;
  }

  _enqueue(holder, ev, message) {
    const task = { holder, ev, message, gen: null, eventId: ev.id };
    this.readyQueue.push(task);
    if (ev.type === 'onPropertyChange') this.pendingPC.add(ev.id);
    this._log('enqueue', `event=${ev.type}#${ev.id} 入队 (holder=${holder === this.scene ? 'scene' : holder.id})`);
  }

  // ── 主循环 ──
  run(maxSeconds) {
    const end = maxSeconds;
    while (this.T < end - 1e-9 && !this.halted) {
      this.T += this.frameDT;
      this._tick();
    }
    return { log: this.log, scene: this.scene, entities: this.entities, global: this.global, eventCount: this.eventCount };
  }

  // 逐帧推进（浏览器实时模式）：推进 dt 秒并执行一次 tick。
  // 与 run 的区别：dt 为真实墙钟增量（非固定 frameDT），供 requestAnimationFrame 每帧调用。
  step(dt) {
    if (this.halted) return;
    this.T += dt;
    this._tick();
  }

  _tick() {
    // ① 到期定时器（确定性顺序已在 _indexEvents 保证：scene 先、实体按创建顺序、声明顺序）
    for (const it of this.intervals) {
      const p = it.event.params;
      if (this.T + 1e-9 >= it.nextFire) {
        const max = p.maxCount;
        if (max != null && it.count >= max) continue;
        let guardPass = true;
        if (p.guard) {
          const ctx = makeCtx(this, it.holder === this.scene ? null : it.holder, null);
          guardPass = truthy(evalExpr(p.guard, ctx));
        }
        if (guardPass) { this._enqueue(it.holder, it.event, null); it.count++; }
        if (p.loop) it.nextFire += p.interval; else it.nextFire = Infinity;
      }
    }
    // ② 到期 wait 唤醒
    const due = this.wakeups.filter(w => this.T + 1e-9 >= w.time);
    this.wakeups = this.wakeups.filter(w => this.T + 1e-9 < w.time);
    for (const w of due) this.readyQueue.push(w.task);
    // ③ 处理就绪队列
    this._processQueue();
  }

  _processQueue() {
    while (this.readyQueue.length && !this.halted) {
      const task = this.readyQueue.shift();
      if (task.ev.type === 'onPropertyChange') this.pendingPC.delete(task.eventId);
      if (!task.gen) {
        const holder = task.holder;
        const ctx = makeCtx(this, holder === this.scene ? null : holder, task.message);
        task.gen = runActions(task.ev.actions || [], ctx, this, task);
      }
      this.eventCount++;
      if (this.eventCount > this.budget) {
        this._log('error', `E-BUDGET 事件预算超限(${this.budget})`);
        this.halted = true;
        break;
      }
      // 驱动该任务直到挂起(wait)或结束
      let r;
      while (true) {
        try {
          r = task.gen.next();
        } catch (e) {
          if (e && e.$sceneSwitch) { this._log('scene', `场景切换: ${e.$sceneSwitch}`); this.halted = true; break; }
          if (e instanceof ScriptError) { this._log('error', `${e.code} ${e.message}`); }
          else this._log('error', `未捕获异常: ${e && e.message}`);
          break; // 任务终止（§8.3：仅终止当前任务）
        }
        if (r.done) break;
        if (r.value && r.value.wait !== undefined) {
          this.wakeups.push({ time: this.T + r.value.wait, task });
          this._log('wait', `任务挂起 ${r.value.wait}s，将在 T=${(this.T + r.value.wait).toFixed(3)} 恢复`);
          break; // 让出，处理下一就绪任务
        }
      }
    }
  }

  // ── 属性写入（含变化检测 §7.5）──
  _writeProp(holder, name, value, srcEventId) {
    const p = holder.properties[name];
    if (p === undefined) throw new ScriptError(E_REF, `属性不存在: ${name}`);
    if (typeOf(value) !== p.type) throw new ScriptError(E_TYPE, `属性 ${name} 类型应为 ${p.type}，实为 ${typeOf(value)}`);
    const v1 = p.value;
    if (p.type === 'entity' ? (v1 && v1.$e) === (value && value.$e) : v1 === value) return; // 值未变
    p.value = value;
    this._log('prop', `${holder.id}.${name} = ${fmtVal(value)}`);
    this._onPropChange(holder, name);
  }

  _onPropChange(holder, name) {
    const target = holder === this.scene ? 'scene' : holder.id;
    const key = `${target}::${name}`;
    const refs = this.watchers.get(key) || [];
    for (const ref of refs) {
      if (this.pendingPC.has(ref.ev.id)) continue;   // 合并：同一事件已有待处理任务（§7.5.4）
      let pass = true;
      if (ref.ev.params.condition) {
        const ctx = makeCtx(this, ref.holder === this.scene ? null : ref.holder, null);
        pass = truthy(evalExpr(ref.ev.params.condition, ctx));
      }
      if (pass) this._enqueue(ref.holder, ref.ev, null);
    }
  }

  // ── 对外触发接口（供测试 onTap/onMessage/onAudioEnd）──
  tap(entityId) {
    const h = this.entities[entityId];
    if (!h) throw new ScriptError(E_REF, `实体不存在: ${entityId}`);
    for (const ev of h.events) if (ev.type === 'onTap') this._enqueue(h, ev, null);
  }

  sendMessage(name, payload, source) {
    const deliver = (holder) => {
      for (const ev of holder.events) {
        if (ev.type !== 'onMessage') continue;
        if (ev.params.name !== name) continue;
        const src = ev.params.source || 'any';
        if (src !== 'any' && src !== source) continue;
        this._enqueue(holder, ev, { name, source, payload: payload || null });
      }
    };
    deliver(this.scene);
    for (const eid of this.entityOrder) deliver(this.entities[eid]);
  }
}

function buildProps(def) {
  const out = {};
  for (const [name, spec] of Object.entries(def || {})) {
    const t = spec.type || 'string';
    const raw = spec.default !== undefined ? spec.default : spec.value;   // 兼容 {default} 与 {value}
    out[name] = { type: t, value: raw != null ? (t === 'entity' ? { $e: raw } : raw) : null };
  }
  return out;
}

function fmtVal(v) {
  const t = typeOf(v);
  if (t === 'entity') return `@${v.$e || 'null'}`;
  if (t === 'string') return `"${v}"`;
  if (t === 'null') return 'null';
  return String(v);
}

// ────────────────────────────── 动作解释（generator，§6）──────────────────

function* runActions(actions, ctx, rt, task) {
  for (const a of actions) yield* runAction(a, ctx, rt, task);
}

function* runAction(a, ctx, rt, task) {
  const p = a.params || {};
  switch (a.type) {
    case 'if': {
      if (truthy(evalExpr(p.condition, ctx))) yield* runActions(p.then || [], ctx, rt, task);
      else {
        let matched = false;
        for (const ei of (p.elseif || [])) {
          if (truthy(evalExpr(ei.condition, ctx))) { yield* runActions(ei.actions || [], ctx, rt, task); matched = true; break; }
        }
        if (!matched && p.else) yield* runActions(p.else, ctx, rt, task);
      }
      return;
    }
    case 'while': {
      let it = 0;
      while (truthy(evalExpr(p.condition, ctx))) {
        if (++it > p.maxIterations) throw new ScriptError(E_LOOP, `while 迭代超过 maxIterations=${p.maxIterations}`);
        yield* runActions(p.body || [], ctx, rt, task);
      }
      return;
    }
    case 'for': {
      const from = num(evalExpr(p.from, ctx));
      const to = num(evalExpr(p.to, ctx));
      const step = num(evalExpr(p.step, ctx));
      if (step === 0) throw new ScriptError(E_TYPE, 'for 的 step 不能为 0');
      const staticCap = Math.floor(Math.abs((to - from) / step)) + 1;
      const cap = p.maxIterations != null ? Math.min(staticCap, p.maxIterations) : staticCap;
      const vars = ctx.entity ? ctx.entity.vars : ctx.scene.vars;  // 循环变量：实体上下则实体作用域，否则场景作用域
      let v = from, it = 0;
      while ((step > 0 ? v <= to : v >= to) && it < cap) {
        vars[p.var] = v;
        yield* runActions(p.body || [], ctx, rt, task);
        v += step; it++;
      }
      return;
    }
    case 'wait': {
      const d = num(evalExpr(p.duration, ctx));
      yield { wait: d };
      return;
    }
    case 'setVariable': {
      const holder = p.scope === 'global' ? ctx.global : p.scope === 'scene' ? ctx.scene : ctx.entity;
      if (!holder) throw new ScriptError(E_REF, 'setVariable 目标作用域不可用');
      holder.vars[p.name] = evalExpr(p.value, ctx);
      rt._log('var', `${p.scope}.${p.name} = ${fmtVal(holder.vars[p.name])}`);
      return;
    }
    case 'setProperty': {
      const h = rt._holder(p.target, ctx.entity);
      rt._writeProp(h, p.name, evalExpr(p.value, ctx));
      return;
    }
    case 'changeProperty': {
      const h = rt._holder(p.target, ctx.entity);
      const cur = h.properties[p.name];
      if (!cur) throw new ScriptError(E_REF, `属性不存在: ${p.name}`);
      if (cur.type !== 'number') throw new ScriptError(E_TYPE, `changeProperty 要求 number 属性: ${p.name}`);
      rt._writeProp(h, p.name, cur.value + num(evalExpr(p.delta, ctx)));
      return;
    }
    case 'playAudio': {
      rt._log('audio', `▶ play ${p.audio} vol=${p.volume ?? 1} loop=${p.loop ?? false}`);
      const dur = (rt.opts.audioDurations || {})[p.audio];
      if (dur && !p.loop) {
        // 桩：自然播完触发 onAudioEnd
        const fire = () => { for (const [eid, h] of Object.entries(rt.entities)) for (const ev of h.events) if (ev.type === 'onAudioEnd' && ev.params.audio === p.audio) rt._enqueue(h, ev, null); };
        rt.wakeups.push({ time: rt.T + dur, task: { holder: ctx.entity || ctx.scene, ev: { type: '__audioEnd', id: 'audio_end_' + p.audio, actions: [] }, message: null, gen: null, _post: fire } });
      }
      return;
    }
    case 'stopAudio': rt._log('audio', `■ stop ${p.audio}`); return;
    case 'pauseAudio': rt._log('audio', `⏸ pause ${p.audio}`); return;
    case 'resumeAudio': rt._log('audio', `▶ resume ${p.audio}`); return;
    case 'moveTo': case 'rotateTo': case 'scaleTo': {
      const h = rt._holder(p.target, ctx.entity);
      if (a.type === 'moveTo') h.transform.pos = p.position && p.position.entity ? rt.entities[p.position.entity].transform.pos.slice() : [p.position.x, p.position.y, p.position.z];
      if (a.type === 'rotateTo') h.transform.rot = [p.rotation.x, p.rotation.y, p.rotation.z];
      if (a.type === 'scaleTo') h.transform.scale = Array.isArray(p.scale) ? p.scale : [p.scale, p.scale, p.scale];
      rt._log('transform', `${a.type} ${h.id} → ${JSON.stringify(h.transform.pos)} dur=${p.duration ?? 0} easing=${p.easing ?? 'linear'}`);
      return;
    }
    case 'lookAt': {
      const h = rt._holder(p.target, ctx.entity);
      rt._log('transform', `lookAt ${h.id} → ${JSON.stringify(p.position)}`);
      return;
    }
    case 'show': case 'hide': {
      const h = rt._holder(p.target, ctx.entity);
      h.visible = (a.type === 'show');
      rt._log('prop', `${h.id}.visible = ${h.visible}`);
      return;
    }
    case 'switchScene': throw { $sceneSwitch: p.scene };
    case 'reloadScene': throw { $sceneSwitch: '<reload>' };
    case 'sendMessage': {
      const src = ctx.entity ? ctx.entity.id : 'scene';
      rt.sendMessage(p.name, p.payload, src);
      rt._log('msg', `sendMessage "${p.name}" from ${src}`);
      return;
    }
    default:
      throw new ScriptError(E_TYPE, `未知动作类型: ${a.type}`);
  }
}

function num(x) { if (typeOf(x) !== 'number') throw new ScriptError(E_TYPE, `要求 number，实为 ${typeOf(x)}`); return x; }

return { SceneRuntime, evalExpr, truthy, typeOf, ScriptError, makeCtx, E_TYPE, E_REF, E_LOOP, E_DEPTH, E_BUDGET, E_DIV0 };
}));
