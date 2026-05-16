# Development Metrics Report

Date: 2026-05-17

This report records measurable signals from the EightCap prototype build. It separates exact repository data from estimated collaboration metrics.

## Exact Repository Metrics

| Metric | Value | Source |
|---|---:|---|
| Latest shipped commit | `b056193` | `git rev-parse --short HEAD` |
| Latest commit message | `Refine web preview and trading UI` | `git log` |
| Files changed in latest shipped commit | 16 | `git show --stat HEAD` |
| Insertions in latest shipped commit | 674 | `git show --stat HEAD` |
| Deletions in latest shipped commit | 164 | `git show --stat HEAD` |
| New files in latest shipped commit | 2 | `src/components/web-phone-preview-shell.tsx`, `src/hooks/use-app-viewport.ts` |
| Tracked files before this documentation pass | 65 | `git ls-files | wc -l` |
| App/source TypeScript files before this documentation pass | 43 | `find app src ... | wc -l` |
| Main verification script length | 538 lines | `scripts/verify-web-demo.cjs` |
| Main app/source/doc/script line count snapshot | 8171 lines | `wc -l` snapshot before this doc pass |

## Validation Metrics

| Check | Latest result |
|---|---|
| TypeScript | Passed with `npm run typecheck` |
| Expo web export | Passed with `npm run export:web` |
| Local smoke test | Passed with `npm run verify:web-demo` |
| Production smoke test | Passed with `VERIFY_WEB_BASE_URL=https://demo-eightcap-4imt45ymj-rays-projects-f956e95b.vercel.app npm run verify:web-demo` |
| Production HTTP status | `200` after disabling Vercel SSO protection |
| Vercel deployment state | `READY` |

## Prompt And Command Frequency

These counts are approximate because the full chat transcript was not exported as structured data. They are based on the prompt log, command log, and the recent implementation sessions.

| Category | Approx. frequency | Notes |
|---|---:|---|
| UI refinement prompts | 20+ | Wallet, Home, Discover, Watchlist, stock detail, order ticket, intro, preview shell |
| Responsive preview prompts | 8+ | Phone shell, Pad, Wide Pad, iframe behavior, intro scaling |
| Deployment and Git prompts | 4+ | GitHub push, Vercel integration, deployment protection |
| Debugging prompts | 8+ | Navigation scale, iframe dimensions, nested button warning, trade animation deformation |
| `npm run typecheck` | 20+ | Run after most code edits |
| Web export commands | 15+ | `npm run export:web` and earlier `npx expo export --platform web` |
| Web smoke verification | 10+ | `npm run verify:web-demo`, local and production |
| Search/read commands | 40+ | `rg`, `sed`, `nl`, `git diff`, `git show` |
| Git publish commands | 6+ | `git add`, `git commit`, `git push`, status checks |
| Vercel commands | 8+ | deploy status, alias, protection, production verification |

## Token Usage Record

Exact model token totals were not persisted in the repository, so this project cannot claim a billing-grade token count. The available token record is therefore:

| Token dimension | Status | How to improve next time |
|---|---|---|
| Total conversation tokens | Not captured exactly | Start a tracked `/goal` at the beginning of the project and record `get_goal` snapshots after each milestone. |
| Per-prompt token cost | Not captured exactly | Export chat logs or record prompt lengths in the prompt log. |
| Tool output tokens | Partially visible during sessions, not persisted | Add a command summary section after each implementation block. |
| Proxy metric | Captured | Prompt count, command frequency, file diffs, and verification runs are recorded here. |

For interview discussion, present this honestly: the development process was instrumented through prompts, command logs, commits, and verification, while exact token telemetry was not exported.

## Other Useful Quantitative Dimensions

| Dimension | Why it matters |
|---|---|
| Iteration count per feature | Shows the prototype was shaped by review loops, not a one-shot generation. |
| Validation commands per shipped commit | Shows discipline around regression checks. |
| UI scope by file | Helps explain which screens were manually tuned. |
| Preview modes supported | Shows the demo was prepared for reviewers without requiring browser devtools. |
| Deployment accessibility | Confirms the link is publicly reachable without SSO blocking. |

## Current Demo Links

- Production: https://demo-eightcap.vercel.app
- Deployment: https://demo-eightcap-4imt45ymj-rays-projects-f956e95b.vercel.app
