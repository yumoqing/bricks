#!/usr/bin/env python3
"""Merge bricks i18n entries into global Sage i18n.json.

Usage:
    python3 merge_bricks_i18n.py /path/to/bricks/i18n /path/to/sage/wwwroot/i18n

Reads bricks/i18n/{lang}/i18n.json and merges new keys into
sage/wwwroot/i18n/{lang}/i18n.json for all languages.
"""

import json, sys, os

LANGUAGES = ['zh', 'en', 'jp', 'ko']

def merge(bricks_i18n_dir, sage_i18n_dir):
    for lang in LANGUAGES:
        brick_path = os.path.join(bricks_i18n_dir, lang, 'i18n.json')
        sage_path = os.path.join(sage_i18n_dir, lang, 'i18n.json')

        if not os.path.exists(brick_path):
            print(f"  skip {lang}: bricks i18n.json not found")
            continue

        with open(brick_path) as f:
            brick_msgs = json.load(f)

        with open(sage_path) as f:
            sage_msgs = json.load(f)

        added = 0
        updated = 0
        for k, v in brick_msgs.items():
            if k not in sage_msgs:
                sage_msgs[k] = v
                added += 1
            elif sage_msgs[k] == k:  # identity mapping (untranslated)
                sage_msgs[k] = v
                updated += 1

        with open(sage_path, 'w') as f:
            json.dump(sage_msgs, f, ensure_ascii=False, indent='\t')
        print(f"  {lang}: {len(sage_msgs)} entries (+{added} new, ~{updated} fixed)")


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    print(f"Merging {sys.argv[1]} -> {sys.argv[2]}")
    merge(sys.argv[1], sys.argv[2])
    print("Done")
