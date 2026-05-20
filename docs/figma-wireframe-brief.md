# Figma Wireframe Brief

Date: 2026-05-14

## Purpose

Use this document as the starting point for Figma wireframes and a clickable prototype before implementation.

## Figma File

- File name: `Market Prototype Demo - Wireframes`
- URL: https://www.figma.com/design/CsK2FHAqyu4bmOkiXTmkGp
- Pages: `00 Cover`, `01 Wireframes`, `02 Components`
- Status: original mobile-first wireframes created, basic prototype navigation wired, and visually checked against standard phone and tablet-web preview frames.
- Current implementation note: the shipped code has moved beyond the first wireframe set into a five-surface React Native prototype: Home, Invest, Watchlist, Discover, and Wallet/Search, plus stock/crypto detail pages.
- Follow-up: revise the Figma file in the next design pass to match the deployed Phone, Pad, and Wide Pad preview modes.

## Frames

- `01 Market Home / iPhone 15`
- `02 Instrument Detail / iPhone 15`
- `03 Watchlist / iPhone 15`
- `04 Insights / iPhone 15`
- `05 Disclaimer / iPhone 15`
- `06 Market Home / Small Phone`
- `07 Market Home / Tablet-Web Preview`

Current implementation frames to add in the next Figma pass:

- `08 Discover / iPhone`
- `09 Wallet / iPhone`
- `10 Stock Detail / Trade Bubble`
- `11 Phone Preview Shell / Web`
- `12 Pad Portrait Preview / Web`
- `13 Wide Pad Preview / Web`

## Created Component References

- App header with search and market status.
- Segmented control.
- Instrument row with symbol, name, price, change, spread, and sparkline.
- Stat tile.
- Insight card.
- Disclosure/risk notice.

## Components To Design First

- App header with search and market status.
- Instrument row with symbol, name, price, change, spread, and sparkline.
- Category segmented control.
- Chart range segmented control.
- Stat tile.
- Insight card.
- Disclosure/risk notice.
- Empty state and loading skeleton.

## Layout Notes

- Start mobile-first at 390 x 844.
- Keep dense market data readable; prioritize scan speed over decorative sections.
- Use a centered max-width content column on web preview.
- Use top safe-area spacing and bottom tab/CTA spacing.
- Avoid a marketing landing page as the first screen; the first view should be the usable market dashboard.

## Visual Tokens To Explore

- Background: white / near-white.
- Text: near-black, gray secondary.
- Accent: bright green.
- Movement up: green.
- Movement down: red.
- Warning/risk: amber.
- Radius: compact 4-8 px.
- Typography: Work Sans-inspired scale, or platform-native equivalent.

## Prototype Flow

1. Open Home.
2. Enter the app from the ASCII intro.
3. Navigate between Home, Invest, Watchlist, Discover, and Search/Wallet.
4. Open an asset detail page.
5. Change the chart range.
6. Open the contextual detail menu.
7. Open the Trade bubble.
8. Simulate a Buy/Sell flow.
9. Return to Portfolio or Wallet to see local state changes.

Implemented prototype links:

- Market Home rows `XAUUSD` and `EURUSD` navigate to Instrument Detail.
- Watchlist row `XAUUSD` navigates to Instrument Detail.
- Header info icons navigate to Disclaimer.
- Disclaimer CTA returns to Market Home.
- Bottom tab hotspots navigate between Markets, Watchlist, and Insights in the original wireframe.

Current implementation references:

- Live demo: <your-vercel-url>
- Public GitHub repo: https://github.com/RayLi-Muye/Demo-EC-ReactNative

## Copy Guidelines

- Keep UI copy short and practical.
- Label the app as a demo where trading-like content appears.
- Avoid official brokerage claims or regulated product promises.
- Do not present mock data as live data.
