# AI Market Briefing Boundary

This document extends `docs/product-vision.md` for the market briefing roadmap. It defines the safe provider seam before any real AI API, credential, paid market-data feed, or production backend is introduced.

## Current Local Demo Provider

`src/services/demo-market-brief.ts` is a deterministic local provider. It uses existing demo market data from `src/data/portfolio.ts` and returns a compact `DemoMarketBrief` with:

- a market-context headline,
- focus points derived from local demo movers and breadth,
- risk notes about volatility and source freshness,
- a visible non-financial-advice disclosure.

The local provider does not call an AI API, market-data API, broker API, paper-trading API, paid provider, credentialed provider, or backend service. It is a UI and contract slice only.

## Provider Contract Direction

Future AI briefing work should preserve this seam while moving execution to a backend-owned provider:

```text
market data snapshot + safety policy + user-safe context -> briefing draft -> safety decision -> stored briefing metadata
```

The production provider should accept only bounded market context:

- symbols, prices, percentage changes, market-data source labels, and freshness timestamps;
- broad market summaries and risk factors;
- app-level feature context such as simulator state labels.

The provider must not accept or infer instructions that personalize the output into portfolio advice, allocation guidance, trade timing, or account-specific recommendations.

## Allowed Output

AI or local briefing providers may:

- summarize broad market conditions and notable movements;
- explain market mechanics and terminology;
- surface risk factors, uncertainty, source freshness, and data limitations;
- suggest neutral research questions.

## Blocked Output

Providers must not:

- rank securities as buys or sells for the user;
- tell the user to buy, sell, hold, short, allocate, rebalance, or time a security;
- generate trade ticket defaults;
- present simulated performance as evidence of future real-world results;
- hide stale data, IEX-only limitations, or missing source context.

## Validation Path

Before real AI integration, add deterministic checks for:

- required disclosure presence;
- blocked recommendation terms in generated recommendation-like contexts;
- source freshness and provider labels;
- snapshot size bounds and prompt/input redaction;
- refusal behavior for personalized advice prompts;
- persistence of briefing metadata and safety decisions once backend storage exists.

`scripts/verify-web-demo.cjs` currently checks that the local demo panel renders the market brief and disclosure. Future backend or AI work should add provider-level tests before enabling any credentialed provider.

## Authorization Boundary

The following remain outside routine maintenance and require explicit owner authorization:

- real AI API calls or API keys;
- paid or credentialed market-data APIs;
- broker, paper-trading broker, or real order routing integrations;
- production deploys, releases, tags, or package publishes;
- production/cloud resource operations;
- sensitive credential reads or writes.
