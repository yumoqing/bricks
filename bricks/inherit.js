/*
 * inherit.js — 《实体继承设计规范》§3「有效定义求解」的实现
 *
 * 原型式单继承：沿 parent 链自根向叶合并属性定义与事件集。
 * 求解产出扁平化定义，脚本引擎不感知继承（规范 P1）。
 * 所有非法结构抛 InheritError（错误码见规范 §6.1），对应保存期校验。
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.bricks = root.bricks || {};
    root.bricks.ScriptInherit = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
const E_INH_CYCLE = 'E-INH-CYCLE';
const E_INH_DEPTH = 'E-INH-DEPTH';
const E_INH_NOSUCHPARENT = 'E-INH-NOSUCHPARENT';
const E_INH_TYPE = 'E-INH-TYPE';
const E_INH_DUPID = 'E-INH-DUPID';
const E_INH_NOSUCHEVENT = 'E-INH-NOSUCHEVENT';
const E_INH_CONFLICT = 'E-INH-CONFLICT';

class InheritError extends Error {
  constructor(code, message) {
    super(`[${code}] ${message}`);
    this.code = code;
  }
}

// 属性定义的默认值：规范用 {type, default}，兼容旧格式 {type, value}
function defDefault(def) {
  return def.default !== undefined ? def.default : def.value;
}

// §3.4 继承链校验：环 / 深度(≤32，含自身) / 父存在性
function validateChain(e, all) {
  const seen = new Set();
  let cur = e, depth = 0;
  for (;;) {
    if (seen.has(cur.id)) {
      throw new InheritError(E_INH_CYCLE, `继承环: ${[...seen, cur.id].join(' → ')}`);
    }
    seen.add(cur.id);
    depth++;
    if (depth > 32) throw new InheritError(E_INH_DEPTH, `继承链深度超过 32（实体 ${e.id}）`);
    if (!cur.parent) break;
    const p = all[cur.parent];
    if (!p) throw new InheritError(E_INH_NOSUCHPARENT, `父实体不存在: ${cur.parent}（引用自 ${cur.id}）`);
    cur = p;
  }
}

// §3.2 属性求解（自根向叶；覆盖只改默认值，类型必须一致）
function resolveProperties(e, all) {
  if (!e.parent) {
    const out = {};
    for (const [k, v] of Object.entries(e.properties || {})) out[k] = JSON.parse(JSON.stringify(v));
    return out;
  }
  const base = resolveProperties(all[e.parent], all);
  for (const [name, def] of Object.entries(e.properties || {})) {
    if (name in base) {
      const bt = base[name].type || 'string';
      const dt = def.type || 'string';
      if (bt !== dt) {
        throw new InheritError(E_INH_TYPE, `实体 ${e.id} 覆盖属性 "${name}" 类型不匹配：继承类型 ${bt}，覆盖类型 ${dt}`);
      }
      base[name] = { type: bt, default: defDefault(def) };   // 类型不变，只覆盖默认值
    } else {
      base[name] = JSON.parse(JSON.stringify(def));           // 新增
    }
  }
  return base;
}

// §3.3 事件求解（自根向叶；同 id 原位覆盖；禁用移除）
// 依赖 JS Map 语义：set 已存在的 key 保持原插入位置 → 精确实现 §5.3「覆盖原位替换，不挪到末尾」
function resolveEvents(e, all) {
  const own = e.events || [];
  const ownIds = new Set();
  for (const ev of own) {
    if (ownIds.has(ev.id)) throw new InheritError(E_INH_DUPID, `实体 ${e.id} 自身事件 id 重复: ${ev.id}`);
    ownIds.add(ev.id);
  }
  let map;
  if (!e.parent) {
    map = new Map(own.map(ev => [ev.id, ev]));
  } else {
    map = resolveEvents(all[e.parent], all);
    for (const ev of own) map.set(ev.id, ev);               // 覆盖（原位）或新增
    for (const id of (e.disabled_events || [])) {
      if (ownIds.has(id)) throw new InheritError(E_INH_CONFLICT, `实体 ${e.id}: 事件 ${id} 既覆盖又禁用`);
      if (!map.has(id)) throw new InheritError(E_INH_NOSUCHEVENT, `实体 ${e.id} 禁用了不存在的继承事件: ${id}`);
      map.delete(id);
    }
  }
  return map;
}

// §3.6 外观求解：沿链取第一个非 null 的 asset_ref
function resolveAsset(e, all) {
  let cur = e;
  while (cur) {
    if (cur.asset_ref) return cur.asset_ref;
    cur = cur.parent ? all[cur.parent] : null;
  }
  return null;
}

// §3.1 求解入口：对全部实体先校验后求解，返回 id → 扁平化定义
function resolveAll(list) {
  const all = {};
  for (const e of list) all[e.id] = e;
  const out = {};
  for (const e of list) {
    validateChain(e, all);
    out[e.id] = {
      ...e,
      asset_ref: resolveAsset(e, all),
      properties: resolveProperties(e, all),
      events: [...resolveEvents(e, all).values()],
    };
  }
  return out;
}

  return {
    resolveAll, validateChain, resolveProperties, resolveEvents, resolveAsset,
    InheritError,
    E_INH_CYCLE, E_INH_DEPTH, E_INH_NOSUCHPARENT, E_INH_TYPE, E_INH_DUPID, E_INH_NOSUCHEVENT, E_INH_CONFLICT,
  };
}));
