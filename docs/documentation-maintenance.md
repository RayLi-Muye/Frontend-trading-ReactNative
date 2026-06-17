# Documentation Maintenance

This project should move toward public-repo documentation quality: clear entry points, reproducible local setup, explicit architecture records, visible test gates, and predictable release notes.

## Target Documentation Track

| Area | Target file | Current status |
| --- | --- | --- |
| Project entry point | `README.md` | Exists, but still describes the interview demo and needs production-roadmap refresh. |
| Domain language | `CONTEXT.md` | Missing from the base branch; planned as the canonical glossary. |
| Architecture decisions | `docs/adr/*.md` | Missing from the base branch; planned for accepted architecture decisions. |
| Backend architecture | `docs/backend-architecture.md` | Missing. |
| API contract | `docs/api.md` | Missing. |
| Database schema | `docs/database.md` or `supabase/migrations/*` | Missing. |
| Environment setup | `.env.example`, `docs/environment.md` | Missing. |
| Local development | `docs/local-development.md` | Missing as a focused guide; README has basic commands. |
| Testing | `docs/testing.md` | Missing as a focused guide; README and technical notes list commands. |
| Deployment/release | `docs/deployment.md`, `CHANGELOG.md` or `DEVLOG.md` | Missing. |
| Security | `SECURITY.md` | Missing. |
| Contributions | `CONTRIBUTING.md` | Added with GitHub-native workflow rules. |
| License | `LICENSE` | Missing. |
| GitHub templates | `.github/ISSUE_TEMPLATE/*`, `.github/pull_request_template.md` | Added for issue and PR intake. |
| Examples | `examples/` or `docs/examples.md` | Missing. |

## GitHub-Native Maintenance Flow

Long-running maintenance work for this repository must use a GitHub-native development flow:

```text
GitHub Issue -> topic branch -> Pull Request -> GitHub Actions -> review/merge decision
```

Non-trivial work must start from a GitHub issue or be linked to an existing issue before implementation. The issue should describe:

- Problem
- Scope
- Acceptance criteria
- Required documentation changes
- Required tests or verification commands

Implementation changes must not be pushed directly to `main`. Use a topic branch and a PR to carry the change. GitHub Actions are the quality gate; failing Actions should be triaged and fixed before expanding scope.

PRs must link their issue and include:

- Scope
- Verification commands, screenshots, or live proof
- Documentation impact
- Risk and rollback notes
- Owner decisions still needed

Routine maintenance may create issues, branches, commits, pushes, PRs, CI fixes, and low-risk green merges within the documented project direction. Formal releases, tags, package publishes, production deploys, production or cloud resource operations, reading or using sensitive credentials, destructive git operations, and major user-visible product direction changes require explicit owner authorization.

## Branch And PR Naming

Use short topic branches that identify the work class and issue number when available:

```text
docs/123-production-docs-track
feat/124-market-data-proxy
fix/125-trade-ticket-warning
chore/126-ci-gate
```

PR titles should start with the same class and use a concrete outcome:

```text
docs: add production documentation track
feat: add market data proxy skeleton
fix: remove limit order from production trade ticket
chore: tighten CI quality gate
```

## GitHub Actions Gate

The current CI workflow runs on pull requests and pushes to `main`:

```bash
npm ci
npm run typecheck
npm run check:market-data
npm run export:web
```

GitHub Actions failures are blockers for merge decisions. Fix or explicitly triage failures before broadening scope.

## Minimum补齐 Plan

1. Refresh `README.md` so it distinguishes current prototype behavior from accepted production direction.
2. Add `.env.example` with non-secret placeholders for Supabase, Alpaca, AI provider, and app public configuration.
3. Add `CONTEXT.md` with production simulated-trading domain language.
4. Add ADRs for hard-to-reverse market data, backend, and database decisions.
5. Add `docs/backend-architecture.md` covering Supabase Postgres, market-data proxy, ledger ownership, and API runtime options.
6. Add `docs/database.md` with first-pass table boundaries and RLS expectations.
7. Add `docs/api.md` with first-pass endpoints for market data, simulated orders, portfolio snapshots, watchlists, risk acceptance, and AI market briefings.
8. Add `docs/testing.md` documenting local checks, CI, smoke tests, and future backend test gates.
9. Add `docs/deployment.md` for web preview, App Store/EAS direction, Supabase migrations, and release checklist.
10. Add `CHANGELOG.md` or `DEVLOG.md` for durable project history outside prompt logs.
11. Add `SECURITY.md`, `LICENSE`, and examples/API docs index before public production collaboration.

## Update Discipline

- Product terminology changes go to `CONTEXT.md`.
- Hard-to-reverse decisions go to `docs/adr/`.
- Backend table or API changes must update `docs/database.md` or `docs/api.md` in the same change.
- Release-visible behavior changes must update `CHANGELOG.md` or `DEVLOG.md`.
- Security-sensitive behavior changes must update `SECURITY.md` and `.env.example` without committing secrets.
- Non-trivial implementation work must be linked to a GitHub issue and carried by a topic branch and PR.
- GitHub Actions failures are blockers for merge decisions and should be fixed before broadening the work.

## Current Caution

The repository contains older interview-demo documents that intentionally describe local mock data. Do not delete them until a new production README and backend architecture docs are in place; instead, mark them as historical when the production docs are ready.
