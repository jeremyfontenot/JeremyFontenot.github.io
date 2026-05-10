const path = require('path');

const COLORS = {
  reset: '\u001b[0m',
  bold: '\u001b[1m',
  dim: '\u001b[2m',
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  cyan: '\u001b[36m',
  gray: '\u001b[90m',
};

function useColor() {
  return process.stdout.isTTY;
}

function colorize(text, color) {
  if (!useColor()) {
    return text;
  }
  return `${COLORS[color] || ''}${text}${COLORS.reset}`;
}

function formatStatus(status) {
  if (status === 'pass') return colorize('PASS', 'green');
  if (status === 'warn') return colorize('WARN', 'yellow');
  return colorize('FAIL', 'red');
}

function shortFile(rootDir, filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join('/');
}

function groupIssuesByCategory(issues) {
  return issues.reduce((groups, issue) => {
    if (!groups[issue.category]) {
      groups[issue.category] = [];
    }
    groups[issue.category].push(issue);
    return groups;
  }, {});
}

function printConsoleReport(result) {
  const { summary, checkResults, issues, rootDir, outputDir, durationMs } = result;

  console.log(colorize('\nSite Audit Summary', 'bold'));
  console.log(colorize(`Root: ${rootDir}`, 'gray'));
  console.log(colorize(`Output: ${outputDir}`, 'gray'));
  console.log(colorize(`Duration: ${durationMs} ms`, 'gray'));
  console.log('');

  console.log(colorize('Checks', 'bold'));
  for (const check of checkResults) {
    const label = `${check.name.padEnd(18)} ${formatStatus(check.status)}  issues: ${check.issueCount}`;
    console.log(label);
  }

  console.log('');
  console.log(colorize('Issues by severity', 'bold'));
  console.log(`Critical: ${colorize(String(summary.criticalIssues), 'red')}`);
  console.log(`Warnings : ${colorize(String(summary.warningIssues), 'yellow')}`);
  console.log(`Passed   : ${colorize(String(summary.passedChecks), 'green')}`);
  console.log(`Total    : ${colorize(String(summary.totalIssues), 'cyan')}`);
  console.log('');

  const topIssues = issues.slice(0, 12);
  if (topIssues.length > 0) {
    console.log(colorize('Top issues', 'bold'));
    for (const issue of topIssues) {
      const location = issue.file ? `${shortFile(rootDir, issue.file)}${issue.line ? `:${issue.line}` : ''}` : 'global';
      const severity = issue.severity.toUpperCase();
      const color = issue.severity === 'critical' ? 'red' : 'yellow';
      console.log(`${formatStatus(issue.severity === 'critical' ? 'fail' : 'warn')} ${colorize(severity, color)} ${location}  ${issue.message}`);
      if (issue.suggestion) {
        console.log(colorize(`    Fix: ${issue.suggestion}`, 'gray'));
      }
    }
    console.log('');
  }

  if (issues.length === 0) {
    console.log(colorize('No issues found in the public tree.', 'green'));
  }
}

function buildMarkdownReport(result) {
  const { summary, checkResults, issues, rootDir, outputDir, durationMs, scanned } = result;
  const lines = [];

  lines.push('# Website Audit Report');
  lines.push('');
  lines.push(`- Generated: ${result.generatedAt}`);
  lines.push(`- Root: ${rootDir}`);
  lines.push(`- Output: ${outputDir}`);
  lines.push(`- Duration: ${durationMs} ms`);
  lines.push('');

  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('| --- | ---: |');
  lines.push(`| Files scanned | ${scanned.totalFiles} |`);
  lines.push(`| HTML files | ${scanned.htmlFiles} |`);
  lines.push(`| CSS files | ${scanned.cssFiles} |`);
  lines.push(`| JS files | ${scanned.jsFiles} |`);
  lines.push(`| External links checked | ${scanned.externalLinks} |`);
  lines.push(`| Total issues | ${summary.totalIssues} |`);
  lines.push(`| Critical issues | ${summary.criticalIssues} |`);
  lines.push(`| Warnings | ${summary.warningIssues} |`);
  lines.push(`| Passed checks | ${summary.passedChecks} |`);
  lines.push('');

  lines.push('## Checks');
  lines.push('');
  lines.push('| Check | Status | Issues |');
  lines.push('| --- | --- | ---: |');
  for (const check of checkResults) {
    lines.push(`| ${check.name} | ${check.status.toUpperCase()} | ${check.issueCount} |`);
  }
  lines.push('');

  const grouped = groupIssuesByCategory(issues);
  const severityOrder = ['critical', 'warning'];

  for (const severity of severityOrder) {
    const severityIssues = issues.filter((issue) => issue.severity === severity);
    lines.push(`## ${severity === 'critical' ? 'Critical' : 'Warnings'}`);
    lines.push('');
    if (severityIssues.length === 0) {
      lines.push('No issues in this severity bucket.');
      lines.push('');
      continue;
    }

    for (const [category, categoryIssues] of Object.entries(grouped)) {
      const filtered = categoryIssues.filter((issue) => issue.severity === severity);
      if (filtered.length === 0) {
        continue;
      }
      lines.push(`### ${category}`);
      lines.push('');
      for (const issue of filtered) {
        const location = issue.file ? `${shortFile(rootDir, issue.file)}${issue.line ? `:${issue.line}` : ''}` : 'global';
        lines.push(`- **${location}** — ${issue.message}`);
        if (issue.suggestion) {
          lines.push(`  - Fix: ${issue.suggestion}`);
        }
        if (issue.evidence) {
          lines.push(`  - Evidence: ${issue.evidence}`);
        }
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

function buildPrCommentSummary(result) {
  const { summary, issues, checkResults } = result;
  const critical = summary.criticalIssues;
  const warnings = summary.warningIssues;
  const topIssues = issues.slice(0, 8);

  const lines = [];
  lines.push('## Portfolio Website Audit');
  lines.push('');
  lines.push(`- Critical: ${critical}`);
  lines.push(`- Warnings: ${warnings}`);
  lines.push(`- Passed checks: ${summary.passedChecks}`);
  lines.push('');
  lines.push('| Check | Status |');
  lines.push('| --- | --- |');
  for (const check of checkResults) {
    lines.push(`| ${check.name} | ${check.status.toUpperCase()} |`);
  }
  lines.push('');

  if (topIssues.length > 0) {
    lines.push('### Top Findings');
    for (const issue of topIssues) {
      const location = issue.file ? `${shortFile(result.rootDir, issue.file)}${issue.line ? `:${issue.line}` : ''}` : 'global';
      lines.push(`- [${issue.severity.toUpperCase()}] ${location}: ${issue.message}`);
    }
  } else {
    lines.push('No issues detected in the public tree.');
  }

  return lines.join('\n');
}

module.exports = {
  printConsoleReport,
  buildMarkdownReport,
  buildPrCommentSummary,
};
