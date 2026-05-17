#!/usr/bin/env python3
"""Cross-language contract test for display title formatting.

Verifies that the Python manifest formatter and the browser-side JS helper
produce the same displayTitle output for shared sample inputs.
"""
import json
import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
JS_HELPER = ROOT / 'js' / 'title-format.js'

sys.path.insert(0, str(ROOT / 'tools'))

from title_format import format_display_title


SAMPLES = [
    {'baseTitle': 'Setup Guide', 'context': 'Home Lab / Setup'},
    {'baseTitle': 'Change: Scripts Used updated', 'context': 'M365 PCL / Change Scripts Used 20260223 0409'},
    {'baseTitle': 'Security Overview', 'context': ''},
    {'baseTitle': 'Resume Summary', 'context': 'archive / scripts / m365 documentation archive'},
]
def format_python_samples(samples):
    return [format_display_title(sample['baseTitle'], sample['context']) for sample in samples]


def format_js_samples(samples):
    node_script = f"""
const fs = require('fs');
const vm = require('vm');
const source = fs.readFileSync({json.dumps(str(JS_HELPER))}, 'utf8');
const context = {{ console, globalThis: {{}} }};
context.window = context.globalThis;
vm.createContext(context);
vm.runInContext(source, context, {{ filename: 'title-format.js' }});
const samples = {json.dumps(SAMPLES)};
const results = samples.map(sample => context.globalThis.TitleFormat.formatDisplayTitle(sample.baseTitle, sample.context));
process.stdout.write(JSON.stringify(results));
"""
    completed = subprocess.run(['node', '-e', node_script], capture_output=True, text=True, encoding='utf-8', cwd=ROOT)
    if completed.returncode != 0:
        raise RuntimeError(completed.stderr.strip() or 'node contract check failed')
    return json.loads(completed.stdout)


def main():
    python_results = format_python_samples(SAMPLES)
    js_results = format_js_samples(SAMPLES)

    if python_results != js_results:
        print('Title format contract mismatch detected.')
        for index, sample in enumerate(SAMPLES):
            print(f"Case {index + 1}: baseTitle={sample['baseTitle']!r}, context={sample['context']!r}")
            print(f"  python: {python_results[index]!r}")
            print(f"  js:     {js_results[index]!r}")
        return 1

    print('Title format contract passed for %d sample cases.' % len(SAMPLES))
    return 0


if __name__ == '__main__':
    sys.exit(main())