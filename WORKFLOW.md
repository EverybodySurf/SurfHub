# SurfHub Development Workflow

> **Main is gold. Staging validates. PRs are small.**

## The One Rule

Every feature starts as a branch from `main`, targets `staging` via PR, and only graduates to `main` after review.

```
main ── feature/foo ── PR ──→ staging ── PR ──→ main
```

## Cycle

### 1. Start a feature

```bash
./scripts/engineering-protocol "Short description"
```

This creates a branch `feature/short-description` from `main`.

### 2. Build it

Work in your branch. Keep it under 1,000 lines of changed code. If it's bigger, split into stacked features.

### 3. Finish it

```bash
./scripts/finish-feature.sh
```

This commits your work, pushes the branch, and opens a PR targeting `staging` with a pre-filled description and checklist.

### 4. Review

CodeRabbit reviews the PR. Fix any issues. Push fixes to the same branch — the PR auto-updates.

### 5. Merge to staging

Once the PR is clean, merge it. Staging accumulates reviewed, working features.

### 6. Graduate to main

When staging is ready, open a PR from `staging` → `main`. This should be small since only reviewed features went in.

## Rules

| Rule | Why |
|------|-----|
| **Branch from main** | Keeps feature branches independent |
| **PR into staging** | Staging is the integration test bed |
| **< 1,000 lines per PR** | Code reviews are thorough on small diffs |
| **No direct commits to staging** | Every change goes through review |
| **No direct commits to main** | Main is gold; only staging graduates |
| **Stacked PRs for big features** | Split into sequential PRs, merge in order |

## Tooling

| Command | What it does |
|---------|-------------|
| `./scripts/engineering-protocol "name"` | Creates branch, tells you where you are |
| `./scripts/finish-feature.sh` | Commits + pushes + opens PR to staging |
| `./scripts/check-pr-size.sh` | Counts lines changed vs 1,000 limit |

## Exceptions

- **Hotfixes:** Direct PR to `main`, still reviewed.
- **Prototypes:** No pipeline needed. Formalize into workflow when it graduates.
