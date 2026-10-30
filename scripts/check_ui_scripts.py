#!/usr/bin/env python3
"""编译校验 .ui 里所有内联 script —— 挡住「点了没反应 / 拖拽不触发」这类静默失效。

背景（2026-10-30）：rag 知识库 detail.ui 的拖拽上传脚本 `showMsg(...)if(...)` 少一个分号，
bricks 用 `new AsyncFunction('params','event',code)` 构建 handler 时直接抛
`SyntaxError: Unexpected token 'if'`。整个回调不编译 → 不上传、不报错、控制台只有一行堆栈。
这已经是「知识库不能上传」第二次复发（第一次是 XHR 被企业网管拦截），两次都靠人肉点页面发现。

内联脚本是 JSON 字符串，没有任何 lint / 编译环节，所以这里给一个确定性门禁：
把每个 .ui 里所有 "script" 值取出来，用和浏览器完全一致的
`Object.getPrototypeOf(async function(){}).constructor('params','event',code)` 编译。

用法：
    python3 check_ui_scripts.py <目录或.ui文件> [...]
    exit 0 = 全部编译通过；exit 1 = 有语法错（打印 文件:script序号 + 报错 + 出错位置片段）

依赖：node（找不到 node 时打印 SKIP 并以 0 退出，只在本地/CI 前置检查用）。
Jinja 模板占位符 `{{...}}` 会先替换成 0，避免模板变量被当成语法错误。
"""
import base64
import json
import os
import shutil
import subprocess
import sys

NODE_SRC = r"""
const fs = require('fs');
const code = Buffer.from(fs.readFileSync(0, 'utf-8'), 'base64').toString('utf-8');
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
try { new AsyncFunction('params', 'event', code); console.log('OK'); }
catch (e) { console.log('FAIL ' + e.message); }
"""


def find_scripts(node, path=()):
    """递归找出所有 'script' 字符串，返回 [(路径, 代码)]"""
    out = []
    if isinstance(node, dict):
        for k, v in node.items():
            if k == 'script' and isinstance(v, str):
                out.append(('/'.join(path) or '<root>', v))
            else:
                out.extend(find_scripts(v, path + (str(k),)))
    elif isinstance(node, list):
        for i, v in enumerate(node):
            out.extend(find_scripts(v, path + (str(i),)))
    return out


def strip_jinja(code):
    """{{ ... }} → 0（占位符是模板变量，不是 JS 语法）"""
    out, i = [], 0
    while i < len(code):
        if code.startswith('{{', i):
            j = code.find('}}', i + 2)
            if j == -1:
                break
            out.append('0')
            i = j + 2
        else:
            out.append(code[i])
            i += 1
    return ''.join(out)


def compile_js(node_bin, code):
    p = subprocess.run([node_bin, '-e', NODE_SRC],
                       input=base64.b64encode(code.encode('utf-8')).decode('ascii'),
                       capture_output=True, text=True)
    txt = (p.stdout or '').strip().splitlines()
    last = txt[-1] if txt else (p.stderr or '').strip().splitlines()[-1:] or ['FAIL node crashed']
    return last if isinstance(last, str) else str(last)


def ui_files(targets):
    for t in targets:
        if os.path.isdir(t):
            for root, _dirs, files in os.walk(t):
                if '/.git' in root or '/node_modules' in root:
                    continue
                for f in files:
                    if f.endswith('.ui'):
                        yield os.path.join(root, f)
        elif t.endswith('.ui'):
            yield t


def scripts_from_text(raw):
    """JSON 解析失败时（含 {% %} 的模板）用正则抠 "script": "..."，返回 [(位置, 代码)]"""
    import re
    out = []
    for i, m in enumerate(re.finditer(r'"script"\s*:\s*("(?:[^"\\]|\\.)*")', raw)):
        try:
            out.append((f'regex#{i}', json.loads(m.group(1))))
        except Exception:
            out.append((f'regex#{i}', m.group(1)[1:-1]))
    return out


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    node_bin = shutil.which('node')
    if not node_bin:
        print('SKIP: 未找到 node，无法做内联脚本编译校验')
        return 0
    total = bad = 0
    files = 0
    for path in ui_files(argv):
        files += 1
        raw = open(path, encoding='utf-8').read()
        try:
            items = find_scripts(json.loads(raw))
        except Exception:
            # 含 {% set %} 等 Jinja 语句的模板不是合法 JSON —— 退化为正则抠 script，仍做编译校验
            items = scripts_from_text(raw)
        for where, code in items:
            total += 1
            res = compile_js(node_bin, strip_jinja(code))
            if not res.startswith('OK'):
                bad += 1
                snippet = strip_jinja(code)
                print(f'SCRIPT_FAIL {path} [{where}]')
                print(f'  {res}')
                print(f'  len={len(snippet)}  head200={snippet[:200]!r}')
    print(f'checked {files} .ui file(s), {total} inline script(s), failures={bad}')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))