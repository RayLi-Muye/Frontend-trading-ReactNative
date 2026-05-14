# Eightcap-Inspired Mobile Market Demo Brief

Date: 2026-05-14

## Objective

Build a polished React Native / Expo demo that lets reviewers browse mocked market movements on mobile and web. The goal is to demonstrate front-end craft: information architecture, visual system translation, responsive behavior, component quality, animation restraint, and clear project documentation.

This is not a trading product and not an official Eightcap app. It should use mock data and clearly label any trading-like screens as demo content.

## Reference Signals From Eightcap

Source inspected: https://www.eightcap.com/en/traders/

Observed public-site patterns to borrow:

- Positioning around fast execution, competitive spreads, global CFD markets, and confidence-building tools.
- A top instruments table with symbols, spreads, and leverage.
- Strong mobile-device imagery in the hero area.
- Clean white layout, black typography, compact rounded elements, and a bright green brand accent.
- Support for platform/tool narratives: MetaTrader, TradingView, market insights, trader toolkit, knowledge hub.
- Trust cues such as reviews, awards, regulated-entity disclosures, and risk warnings.
- Design tokens visible in the site CSS include Work Sans / Noto Sans, neutral grays, green brand colors, secondary purple, status red/yellow/green, and small continuous radii.

Suggested demo translation:

- Keep the financial-professional tone, but make the app feel like a focused market browser rather than a broker signup funnel.
- Use green as the primary action/accent color, black/white as the base, and red/green status colors for price movement.
- Use translucent headers, compact cards, instrument rows, sparklines, and quick filters to create a modern trading-tool feel.

## Product Concept

Working title: `Eightcap Market Pulse`

One-sentence pitch:

> A mobile-first market watch demo that lets users scan popular CFD-style instruments, compare short-term movement, and inspect mocked insights in a polished Eightcap-inspired interface.

Primary reviewer impression:

- "This candidate can translate a real brand into a product-quality mobile interface."
- "The app is responsive, componentized, and visually disciplined."
- "The project is well documented and ready for Figma/GitHub handoff."

## Target Users

- Interview reviewers evaluating front-end execution.
- Traders or finance-curious users who want to scan instruments quickly.
- Non-technical stakeholders opening the demo from an email link.

## Core Screens

1. Market Home
   - Sticky translucent header.
   - Account/demo status strip.
   - Hero summary: total watchlist movement, top mover, volatility state.
   - Horizontal market categories: Forex, Indices, Commodities, Crypto.
   - Top instruments list inspired by Eightcap's public table.

2. Instrument Detail
   - Symbol, price, percentage move, spread, leverage, and market status.
   - Mock sparkline or area chart.
   - Quick range selector: 1D, 1W, 1M, 3M.
   - Key stats grid.
   - Mock insight card with risk note.

3. Watchlist
   - Saved instruments.
   - Sort by movement, spread, or category.
   - Empty and loading states for polish.

4. Insights
   - Mock market updates.
   - Education/tool cards echoing Eightcap's "tools" and "knowledge hub" content areas.

5. Demo Disclaimer
   - Clear non-trading disclaimer.
   - Brief risk warning language.
   - Link-style CTA back to markets.

## Mock Data Model

Each instrument should include:

- `symbol`: XAUUSD, EURUSD, GER40, NDX100, US30, USOUSD, USDCHF, GBPUSD, BTCUSD.
- `displayName`: Gold vs US Dollar, Euro / US Dollar, Nasdaq 100, etc.
- `category`: forex, index, commodity, crypto.
- `price`: mocked current value.
- `change`: numeric absolute change.
- `changePercent`: numeric percent change.
- `spreadRaw`: mocked raw spread.
- `spreadStandard`: mocked standard spread.
- `leverage`: display string, for example `1:500`.
- `sparkline`: 20-40 local numeric values.
- `sentiment`: bullish, neutral, bearish.
- `marketStatus`: open, closed, volatile.

## Visual Direction

Design keywords:

- precise
- fast
- premium
- compact
- high-contrast
- data-first

Design system draft:

- Base background: off-white / white.
- Text: near-black with gray hierarchy.
- Primary accent: Eightcap-style bright green.
- Market up: green.
- Market down: red.
- Caution: amber/yellow.
- Secondary highlight: muted purple only for subtle category accents.
- Radius: 4-8 px equivalent, continuous corners on native.
- Typography: Work Sans direction if available; otherwise use the platform system font with similar weight rhythm.

Interaction ideas:

- Pull-to-refresh with subtle haptic feedback on iOS.
- Pressed instrument rows reveal a slight elevation and chart preview.
- Animated number changes on refresh.
- Segmented controls for category/range filters.
- Sticky bottom CTA only where useful, not as a constant sales banner.

## Responsiveness

Target breakpoints and frames:

- Small phone: 375 x 667.
- Standard phone: 390 x 844.
- Large phone: 430 x 932.
- Tablet/web preview: 768 px and above.

Behavior:

- Mobile should be the primary layout.
- Tablet/web should center content in a phone-like readable column with optional side panels, not stretch rows across the full screen.
- Avoid tiny tap targets; keep primary touch targets at least 44 px.
- Use scrollable content with safe-area handling.

## Technical Direction

Recommended stack:

- Expo + React Native + TypeScript.
- Expo Router for screens.
- Local mock data first.
- Expo web build for shareable demo deployment.
- Vercel for live email link.
- Figma for wireframes, tokens, and prototype flow.
- API routes are not needed for the current mock-data phase.

API route decision:

- Do not add `app/api/*+api.ts` while data is static and client-safe.
- Add Expo API routes only if the demo later proxies a real market API, hides server-side secrets, validates writes, or needs webhook/rate-limit behavior.
- If API routes are added later, keep them focused, typed, and deployable to EAS Hosting's Cloudflare Workers runtime.

Implementation principles:

- Keep data mocked and deterministic.
- Build reusable components first: instrument row, market card, stat tile, segmented filter, sparkline card, insight card.
- Keep visual tokens centralized.
- Avoid real trading forms, real account actions, or misleading order flows.
- Include a visible demo/risk disclaimer.

## Interview Delivery Strategy

Best email package:

- Live demo: Vercel URL.
- Figma: prototype URL.
- GitHub: repository URL.
- 4-6 sentence project summary:
  - built with React Native / Expo
  - responsive mobile-first market browsing demo
  - mock data only
  - Eightcap-inspired visual research
  - highlights: chart UI, adaptive layout, documented prompt/command workflow

Secondary options:

- Expo Go QR code for mobile review.
- Short screen recording or GIF for reviewers who do not open local mobile tooling.

## Open Decisions

- Final repo visibility: currently private during build; make public or invite reviewers later for interview review.
- Whether the deployed app should use a neutral name like `Market Pulse Demo` to avoid brand confusion.
- Whether to include generated visual assets or use abstract chart/product visuals.
- Whether to keep the custom SVG sparkline or adopt a chart library for richer interactions later.
