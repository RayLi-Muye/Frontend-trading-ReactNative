# Product Vision

This product is a mobile-first simulated securities trading app for learning market mechanics with real market data and virtual funds. The core experience should feel simple, financially risk-free, and trustworthy: users can explore securities, place simulated orders, review positions, and understand market context without connecting a brokerage account or risking real money.

## Product Promise

- Let users practice securities trading with **Virtual Funds** only.
- Use real **Market Data** for quotes, charts, and market context.
- Keep all user trading interaction inside app-owned **Simulated Trading** concepts.
- Provide **AI Market Briefings** for market context and risk factors without giving personalized investment advice.
- Build production behavior around backend-owned account, order, position, and ledger records.

## Non-Goals

- No real-money deposits, withdrawals, or transfers.
- No brokerage account connection in the first production direction.
- No real order routing to a broker, exchange, market maker, or paper-trading broker account.
- No promise of best execution, NBBO, SIP coverage, or consolidated market prices when the feed is IEX-only.
- No AI-generated instruction to buy, sell, hold, short, allocate, rebalance, or time a security.

## Experience Principles

1. **Simple by default**: the first-time trade flow should make the simulated nature of the order obvious without slowing down basic exploration.
2. **Risk-free funds**: balances, buying power, fills, P/L, and portfolio value are virtual app records, not money or brokerage assets.
3. **Real market context**: prices and charts should come from market-data providers through the backend, with feed limitations labeled clearly.
4. **Ledger trust**: every virtual-fund movement and simulated order outcome should be explainable from backend ledger records.
5. **Learning over direction**: AI should explain what happened, what risks matter, and what a user may want to research. It must not tell the user what trade to make.

## Production Model

The production app should separate market reality from simulated user interaction:

- **Market Data Proxy**: the backend fetches, caches, rate-limits, and serves provider market data without exposing provider credentials to clients.
- **Simulated Account**: the backend owns virtual balances, buying power, risk acceptance, account reset history, and account state.
- **Simulated Orders**: the backend records user-submitted buy/sell instructions as app-owned records, not broker orders.
- **Simulated Fills**: the first production fill model should be intentionally simple and auditable. Do not add limit-order, partial-fill, or exchange-like behavior until the backend semantics are explicit.
- **Positions**: the backend derives positions from accepted ledger/order/fill records, not from client-only local state.
- **Portfolio Snapshots**: the backend records point-in-time portfolio value using simulated positions and available market data.
- **AI Briefing History**: the backend stores generated briefing metadata and safety decisions where needed for auditability and support.

## AI Market Briefing Boundary

AI features may:

- Summarize broad market conditions and notable movements.
- Explain market terminology and instrument-specific context.
- Surface risk factors, uncertainty, and source freshness.
- Suggest neutral research questions a user may investigate.

AI features must not:

- Rank securities as buys or sells for the user.
- Generate trade instructions or default trade ticket values.
- Tell a user how much to allocate or when to enter/exit.
- Present simulated performance as evidence of future real-world results.
- Hide provider limitations, stale data, or missing context.

## Roadmap Alignment

Future issues should state which roadmap phase they support.

| Phase | Outcome | Examples |
| --- | --- | --- |
| 0. Prototype clarity | Preserve the current Expo demo while marking local mock behavior as historical. | README refresh, docs index, glossary, ADRs. |
| 1. Product boundary | Make simulated trading, market-data limits, AI boundaries, and risk acceptance visible in product copy. | Risk acceptance flow, IEX-only labels, AI briefing disclaimers. |
| 2. Backend foundation | Move production state to backend-owned records. | Supabase schema, RLS, ledger, simulated accounts, orders, fills, positions. |
| 3. Market-data service | Serve real market data through a backend proxy. | Alpaca IEX integration, cache TTLs, symbol allowlist, provider outage states. |
| 4. Trading simulation | Route all trade interactions through backend simulation APIs. | Market simulated orders, immediate simulated fills, portfolio snapshots, account reset. |
| 5. AI briefings | Add AI market context within the non-advice boundary. | Daily market brief, instrument context, refusal/safety policy, briefing history. |
| 6. App Store readiness | Prepare production distribution and support obligations. | Privacy policy, support URL, data deletion, observability, abuse controls. |

## Decision Guardrails

- Any feature that changes product terminology should update `CONTEXT.md` once that glossary exists on `main`.
- Any hard-to-reverse market data, backend, database, or AI safety decision should be recorded as an ADR.
- Any backend schema or API work should update the matching database/API docs in the same PR.
- Any UI that shows real-time IEX-only data must clearly avoid implying all-market best-price coverage.
- Any AI output that could be read as investment advice must be rewritten as contextual briefing content or refused.
- Any order type beyond a simple simulated market order needs an explicit product and ledger model before implementation.
- Any production deploy, release, package publish, sensitive credential use, production/cloud resource operation, destructive git operation, or major product direction change still requires explicit owner authorization.
