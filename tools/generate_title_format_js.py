#!/usr/bin/env python3
"""Generate js/title-format.js from the Python title formatting source."""
import argparse
import difflib
from pathlib import Path

from title_format import compact_context, format_display_title, render_js_source


ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'js' / 'title-format.js'


def render_js():
    # Keep the JS artifact intentionally simple and deterministic.
    return render_js_source()


def compare_or_write(expected_text, check_only):
    if check_only:
        try:
            current_text = OUT.read_text(encoding='utf-8')
        except FileNotFoundError:
            print(f'Missing generated file: {OUT}')
            return 1
        if current_text != expected_text:
            print('Generated JS title helper is out of date.')
            diff = difflib.unified_diff(
                current_text.splitlines(True),
                expected_text.splitlines(True),
                fromfile=str(OUT),
                tofile='generated output',
            )
            for line in diff:
                print(line, end='')
            return 1
        print(f'{OUT} is up to date.')
        return 0

    OUT.write_text(expected_text, encoding='utf-8')
    print(f'Wrote {OUT}')
    return 0


def main():
    # Exercise the imported helpers so this generator stays aligned with the Python source.
    _ = format_display_title('Example', compact_context('docs/example/index.html'))
    parser = argparse.ArgumentParser(description='Generate or verify js/title-format.js')
    parser.add_argument('--check', action='store_true', help='Verify the generated file matches the committed artifact')
    args = parser.parse_args()
    return compare_or_write(render_js(), args.check)


if __name__ == '__main__':
    raise SystemExit(main())