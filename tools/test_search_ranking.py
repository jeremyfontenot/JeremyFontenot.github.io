#!/usr/bin/env python3
"""Deterministic ranking regression test for docs search relevance."""


def normalize_search_text(text):
    return ' '.join(str(text or '').lower().split()).strip()


def tokenize_search_query(query):
    return [token for token in normalize_search_text(query).split(' ') if token]


def field_score(text, query, weight):
    normalized_text = normalize_search_text(text)
    if not normalized_text or not query:
        return 0.0, False, False

    tokens = tokenize_search_query(query)
    score = 0.0
    exact = False
    prefix = False

    if query in normalized_text:
        score += weight
        exact = True
    if normalized_text.startswith(query):
        score += weight * 0.5
        prefix = True

    if tokens:
        matched_tokens = sum(1 for token in tokens if token in normalized_text)
        if matched_tokens and not exact:
            score += weight * (matched_tokens / len(tokens)) * 0.35

    return score, exact, prefix


def score_item(item, query):
    query = normalize_search_text(query)
    if not query:
        return 1.0

    fields = [
        ('title', item.get('title', ''), 5),
        ('displayTitle', item.get('displayTitle', ''), 4),
        ('context', item.get('context', ''), 3),
        ('tags', ' '.join(item.get('tags', []) or []), 3),
        ('categories', ' '.join(item.get('categories', []) or []), 2),
        ('path', item.get('path', ''), 2),
        ('body', item.get('body', ''), 1),
    ]

    score = 0.0
    exact_match = False
    prefix_match = False

    for _, value, weight in fields:
        field_value, field_exact, field_prefix = field_score(value, query, weight)
        score += field_value
        exact_match = exact_match or field_exact
        prefix_match = prefix_match or field_prefix

    if exact_match:
        score *= 1.5
    elif prefix_match:
        score *= 1.2

    return score


def rank_items(items, query):
    ranked = []
    for item in items:
        score = score_item(item, query)
        if score > 0:
            ranked.append((score, item))
    ranked.sort(key=lambda entry: (-entry[0], entry[1].get('title', ''), entry[1].get('path', '')))
    return [item for _, item in ranked]


def assert_top_path(items, query, expected_path):
    top = rank_items(items, query)[0]
    assert top['path'] == expected_path, f"{query!r} expected {expected_path!r} but got {top['path']!r}"


def main():
    docs = [
        {
            'path': '/docs/home-lab/backup-and-disaster-recovery.html',
            'title': 'Home Lab Backup and Disaster Recovery',
            'displayTitle': 'Home Lab Backup and Disaster Recovery — Home Lab / Backup and Disaster Recovery',
            'context': 'Home Lab / Backup and Disaster Recovery',
            'tags': ['home-lab', 'backup', 'recovery'],
            'categories': ['Labs'],
            'body': 'Backup and disaster recovery for the home lab.'
        },
        {
            'path': '/docs/curated/script-documentation/Scripts-Used.html',
            'title': 'Scripts Used',
            'displayTitle': 'Scripts Used — Script Documentation / Scripts Used',
            'context': 'Script Documentation / Scripts Used',
            'tags': ['script-documentation', 'automation'],
            'categories': ['Projects'],
            'body': 'Scripts used for automation and lab maintenance.'
        },
        {
            'path': '/docs/curated/security/Security-Overview.html',
            'title': 'Security Overview',
            'displayTitle': 'Security Overview — Security / Security Overview',
            'context': 'Security / Security Overview',
            'tags': ['security', 'compliance'],
            'categories': ['Reference'],
            'body': 'Security baseline and controls overview.'
        },
        {
            'path': '/docs/home-lab/operations-runbook.html',
            'title': 'Operations Runbook',
            'displayTitle': 'Operations Runbook — Home Lab / Operations Runbook',
            'context': 'Home Lab / Operations Runbook',
            'tags': ['home-lab', 'operations'],
            'categories': ['Labs'],
            'body': 'Runbook for day-to-day lab operations.'
        },
    ]

    assert_top_path(docs, 'backup disaster', '/docs/home-lab/backup-and-disaster-recovery.html')
    assert_top_path(docs, 'scripts used', '/docs/curated/script-documentation/Scripts-Used.html')
    assert_top_path(docs, 'security overview', '/docs/curated/security/Security-Overview.html')

    tied = [
        {
            'path': '/docs/a/alpha-guide.html',
            'title': 'Alpha Guide',
            'displayTitle': 'Alpha Guide — A / Alpha Guide',
            'context': 'A / Alpha Guide',
            'tags': ['guide'],
            'categories': ['Notes'],
            'body': 'Alpha guide content.'
        },
        {
            'path': '/docs/b/beta-guide.html',
            'title': 'Beta Guide',
            'displayTitle': 'Beta Guide — B / Beta Guide',
            'context': 'B / Beta Guide',
            'tags': ['guide'],
            'categories': ['Notes'],
            'body': 'Beta guide content.'
        },
    ]
    ranked = rank_items(tied, 'guide')
    assert [item['path'] for item in ranked] == ['/docs/a/alpha-guide.html', '/docs/b/beta-guide.html']

    print('Search ranking contract passed for %d sample cases.' % 4)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())