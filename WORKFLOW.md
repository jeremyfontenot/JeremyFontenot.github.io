# Repository Workflow

This document describes a simple, safe workflow for working in this repository. Follow these steps to keep local and remote branches aligned and avoid rejected pushes.

## Feature-branch Workflow

- Do not commit directly to `main`. Create a topic branch for each unit of work:

```bash
git checkout -b feature/brief-description
```

- Make changes and commit locally. Open a Pull Request (PR) against `main` when ready for review and merge.

## Required sync commands

Always synchronize with the remote before starting work and before pushing. The recommended commands are:

```bash
git fetch origin
git rebase origin/main
```

Or, equivalently, before pushing:

```bash
git fetch origin
git pull --rebase origin main
```

These commands ensure your local branch is replayed on top of the latest remote commits, preventing non-fast-forward push rejections.

## Purpose of the `pre-push` hook

A `pre-push` hook is installed in `.git/hooks/pre-push`. Its behavior:

- Runs `git fetch origin` and checks for remote commits you don't have.
- If the remote branch is ahead, the hook blocks the push and instructs you to run `git pull --rebase origin <branch>`.

This hook is a local safety net to prevent surprise rejections and to encourage rebasing before pushing.

## Safe force-push usage

If you must rewrite remote history (e.g., to clean up a branch you exclusively own), prefer `--force-with-lease` which is safer than `--force`:

```bash
git push --force-with-lease origin your-branch
```

`--force-with-lease` ensures you do not clobber someone else's new commits unintentionally.

## Recovering from a rejected push

If `git push` is rejected with the "fetch first" error:

1. Fetch and rebase the remote changes:

```bash
git fetch origin
git rebase origin/main
```

1. Resolve any conflicts, complete the rebase with `git rebase --continue`, then push:

```bash
git push origin your-branch
```

If you are on `main` and the push is rejected, avoid force-pushing. Prefer integrating remote changes via rebase or merge and then push.

## Keeping local and remote branches aligned

- Fetch regularly: `git fetch origin` keeps your remote-tracking refs up to date.
- Rebase feature branches onto `origin/main` before opening a PR or before pushing.
- Use branch protection rules on `main` and adopt PRs for merging if multiple actors or automation write to the repository.

## Notes

- The hook added is local to your clone (`.git/hooks`). If you want the check for all developers, consider using `core.hooksPath` or a repository-level solution combined with documentation or CI checks.

## Installing Git Hooks

- Purpose: The repository includes installer scripts to copy the tracked hook into the local repository's `.git/hooks` directory. The `.git/hooks` directory is intentionally untracked and should not be committed.

- Windows (PowerShell): run the installer to copy the hook into your local `.git` directory (no executable bit changes are attempted):

```powershell
.\scripts\install-hooks.ps1
```

- macOS / Linux: run the shell installer which copies the hook and sets it executable:

```bash
sh scripts/install-hooks.sh
```

- After running the installer the hook will be placed at `.git/hooks/pre-push` and will be invoked by Git on `git push`.

- Reminder: `.git/hooks` is intentionally untracked; these installer scripts provide a cross-platform way to place hooks into `.git/hooks` for contributors.
