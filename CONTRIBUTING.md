# Contributing

This repository uses a GitHub-native maintenance flow for non-trivial work:

```text
GitHub Issue -> topic branch -> Pull Request -> GitHub Actions -> review/merge decision
```

## Issues First

Create or link a GitHub issue before starting non-trivial implementation, architecture, documentation, or CI work. The issue should state:

- Problem
- Scope
- Acceptance criteria
- Required documentation changes
- Required tests or verification commands

Small typo fixes may skip an issue, but any change that affects runtime behavior, project structure, documentation policy, CI, or production direction should have an issue.

## Branches

Do not push implementation changes directly to `main`. Use short topic branches that identify the work type and issue number when available:

```text
docs/123-production-docs-track
feat/124-market-data-proxy
fix/125-trade-ticket-warning
chore/126-ci-gate
```

## Pull Requests

Every non-trivial PR should link its issue and include:

- Scope
- Acceptance criteria
- Validation commands, screenshots, or live proof
- Documentation impact
- Risk and rollback notes
- Owner decisions still needed

PR titles should use a conventional prefix and a concrete outcome:

```text
docs: add production documentation track
feat: add market data proxy skeleton
fix: remove limit order from production trade ticket
chore: tighten CI quality gate
```

## GitHub Actions Gate

GitHub Actions are the merge gate. A failing workflow must be triaged and fixed before broadening scope or merging.

The current CI workflow runs:

```bash
npm ci
npm run typecheck
npm run check:market-data
npm run export:web
```

Run the relevant local checks before opening or updating a PR. Docs-only PRs should still pass CI.

## Restricted Operations

Routine maintenance may create issues, branches, commits, pushes, PRs, CI fixes, and low-risk green merges within the documented project direction. The following still require explicit owner authorization:

- Formal release, tag, or package publish
- Production deploy
- Production or cloud resource operation
- Reading or using sensitive credentials
- Destructive git operation
- Major user-visible product direction change
