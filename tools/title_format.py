#!/usr/bin/env python3
"""Shared title formatting helpers for manifest generation and tests."""
import os
import re


EXCLUDED_SEGMENTS = {'docs', 'html', 'aspx', 'assets', 'library'}


def humanize(text):
    if text is None:
        return ''
    value = str(text).strip().replace('_', ' ').replace('-', ' ')
    value = re.sub(r'(?<=[a-z0-9])(?=[A-Z])', ' ', value)
    value = re.sub(r'\s+', ' ', value).strip()
    return value


def compact_context(relpath):
    no_ext = os.path.splitext(relpath)[0]
    parts = [humanize(part) for part in re.split(r'[\\/]', no_ext) if part and part.lower() not in EXCLUDED_SEGMENTS]
    if len(parts) >= 2:
        return ' / '.join(parts[-2:])
    if parts:
        return parts[-1]
    return ''


def format_display_title(base_title, context):
    base = humanize(base_title) or ''
    ctx = humanize(context) or ''
    if ctx:
        return f'{base} — {ctx}'
    return base


def render_js_source():
        return r"""// Generated from tools/title_format.py by tools/generate_title_format_js.py
(function(global){
    function formatDisplayTitle(baseTitle, context){
        const normalizedBase = String(baseTitle || '').trim();
        const normalizedContext = String(context || '').trim();
        if(normalizedContext){
            return `${normalizedBase} — ${normalizedContext}`;
        }
        return normalizedBase;
    }

    function compactContext(path){
        const value = String(path || '').replace(/^\//, '');
        const parts = value.split('/').filter(Boolean);
        if(parts.length >= 2){
            return parts.slice(-2).join(' / ');
        }
        if(parts.length === 1){
            return parts[0];
        }
        return '';
    }

    global.TitleFormat = {
        formatDisplayTitle,
        compactContext
    };
})(typeof window !== 'undefined' ? window : globalThis);
"""