# Frontend Trading React Native

A mobile-first simulated securities trading app for practicing mock orders with virtual funds, local portfolio records, and non-advice market context.

This Expo / React Native project demonstrates the product boundary for a risk-free mock trading experience: users can explore instruments, preview and place simulated trades, review virtual cash movements, inspect holdings, compare watchlist symbols, and read local market-learning context without connecting a broker or risking real money.

**Safety boundary:** this app does not connect to a real broker, does not place real orders, does not move real money, does not provide financial advice, and does not use credentialed or paid market-data / AI APIs unless a future integration explicitly documents that boundary.

Live demo: [demo-trading-reactnative-ray.vercel.app](https://demo-trading-reactnative-ray.vercel.app/)

## Jump To

- [What It Demonstrates](#what-it-demonstrates)
- [What It Deliberately Does Not Do](#what-it-deliberately-does-not-do)
- [Getting Started](#getting-started)
- [Validation](#validation)
- [Product And Domain Docs](#product-and-domain-docs)
- [Repository Structure](#repository-structure)
- [Development Workflow](#development-workflow)

## What It Demonstrates

- A mobile trading-style interface built with Expo SDK 55, React Native 0.83, React 19, and Expo Router.
- Local simulated market orders with immediate simulated fills, virtual-cash ledger entries, holdings, and position updates.
- Trade-ticket learning feedback: order preview, cash impact, position after, ledger effect, guardrails, position sizing checklist, and simulated-only disclosure.
- Portfolio learning surfaces: virtual account summary, performance recap, activity ledger, trade journal, position summary, and watchlist comparison.
- A deterministic local market brief provider that shows market-context copy and non-financial-advice disclosure without calling an AI API.
- Web preview modes for phone, tablet, and wide tablet review through a Vercel-hosted React Native Web build.

The product direction is real market data plus virtual funds. The current repo implementation uses local demo market data and local demo state; future production work should move market data, simulated accounts, orders, fills, positions, and ledger records behind backend-owned APIs.

## What It Deliberately Does Not Do

- No real-money deposits, withdrawals, transfers, buying power, or brokerage assets.
- No brokerage account connection.
- No real order routing to a broker, exchange, market maker, or paper-trading broker.
- No broker order ids, real execution ids, settlement, tax lots, margin, or best-execution claims.
- No investment advice, personalized recommendations, buy/sell/hold rankings, allocation guidance, or trade timing instructions.
- No credentialed market-data provider, paid API, real AI API, API key, or production backend integration in the current demo.

## Getting Started

Requirements:

- Node.js compatible with the Expo SDK used by this repo.
- npm.

Install dependencies:

```bash
npm install
```

Run the Expo web app:

```bash
npm run web
```

Common local URLs:

```text
http://localhost:8081/
http://localhost:8081/?previewMode=pad
http://localhost:8081/?previewMode=widePad
http://localhost:8081/instrument/NVDA
```

Build the static web export:

```bash
npm run export:web
```

## Validation

Run the main local checks before opening a pull request:

```bash
npm run typecheck
npm run check:market-data
npm run check:simulated-trading
npm run export:web
npm run verify:web-demo
```

The web smoke test covers launch flow, market brief disclosure, wallet interactions, simulated trade submission, insufficient-cash and oversell guardrails, portfolio updates, watchlist comparison, trade journal reset, and preview shell behavior.

To validate an already deployed web build:

```bash
VERIFY_WEB_BASE_URL=<your-vercel-url> npm run verify:web-demo
```

## Product And Domain Docs

- [Product vision](docs/product-vision.md): roadmap for real market data, virtual funds, backend-owned simulation records, and AI market briefings inside a non-advice boundary.
- [Simulated trading domain contract](docs/simulated-trading-domain.md): code-level contract for simulated market orders, fills, positions, and virtual-cash ledger entries.
- [AI market briefing boundary](docs/ai-market-briefing-boundary.md): allowed and blocked AI briefing behavior before any real AI provider is introduced.
- [Documentation maintenance](docs/documentation-maintenance.md): docs governance and GitHub-native maintenance workflow.
- [Technical implementation notes](docs/technical-implementation-notes.md): implementation details for the current Expo demo.
- [Development metrics report](docs/development-metrics-report.md): project metrics and development trace.

## Repository Structure

```text
.
├── app/                         Expo Router screens and web shell
│   ├── (tabs)/                  Home, portfolio, watchlist, discover, wallet
│   ├── instrument/[symbol].tsx  instrument detail and simulated trade ticket
│   ├── +html.tsx                web HTML shell
│   └── _layout.tsx              root stack and preview wrapper
├── docs/                        product, domain, AI boundary, and maintenance docs
├── scripts/
│   ├── check-market-data.cjs
│   ├── check-simulated-trading-domain.cjs
│   └── verify-web-demo.cjs
├── src/
│   ├── components/              reusable React Native UI panels and controls
│   ├── data/                    local demo market, wallet, and portfolio data
│   ├── domain/                  simulated trading domain contract
│   ├── hooks/                   local demo portfolio, market, viewport, watchlist hooks
│   ├── services/                local demo adapters, briefings, recap, journal, guardrails
│   └── utils/                   formatting helpers
├── package.json
└── vercel.json
```

## Development Workflow

This repo uses a GitHub-native maintenance flow:

1. Create or link a GitHub issue with problem, scope, acceptance criteria, docs impact, and validation.
2. Work on a `codex/...` topic branch.
3. Open a pull request linked to the issue.
4. Run local validation and wait for GitHub Actions / Vercel checks.
5. Merge low-risk green PRs; keep production deploys, releases, real credentials, real trading integrations, and major product-direction changes behind explicit owner authorization.

Issue templates, the PR template, and CI live under [.github](.github/).

## Current Status

- Current implementation: local demo market data and local demo portfolio state.
- Deployment: Vercel Git Integration from `main`.
- Public demo access: Vercel SSO deployment protection disabled.
- Package publishing: `package.json` is marked `private`.
- GitHub About topics: Expo, React Native, mock trading, simulated trading, trading simulator, market data, virtual portfolio, and not financial advice.

## License

No standalone license file is currently committed.
