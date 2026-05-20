# Interview Polish Roadmap

This roadmap tracks the remaining and future work for the public Market Prototype review link.

## Current Status

- Public demo: <your-vercel-url>
- Public GitHub repo: https://github.com/RayLi-Muye/Demo-EC-ReactNative
- Current app scope: Home, Invest, Watchlist, Discover, Wallet/Search, and stock/crypto detail pages.
- Current web preview modes: Phone, Pad, and Wide Pad.
- Current verification gates: TypeScript, Expo web export, market-data checks, and headless browser smoke testing.

## Current Recommendation

Use Manrope for web display headings and keep native platforms on system fallback unless local font files are added. Manrope gives the app a more editorial financial-product feel without making the interface look decorative. It is now wired through the shared page title style and loaded in the static web HTML.

## Heading Font Options

| Option | Best Use | Tradeoff |
| --- | --- | --- |
| Manrope | Primary recommendation for page titles and section headers | Polished, neutral, slightly premium; needs web font loading or bundled files for native parity |
| Geist | Strong fallback for a modern tech/product feel | More developer-product than trading app; useful if the UI moves toward Vercel-style sharpness |
| Satoshi | Strong display look for portfolio and discover headings | More distinctive, but needs bundled font files for reliable licensing and deployment |
| Inter | Safest all-purpose option | Very readable, but less differentiated |
| Avenir Next | Good iOS-native feel | Less predictable across Android and web unless carefully configured |

## Completed Polish Passes

- Discover page added with search, themes, Top Movers, and financial business articles.
- Wallet placeholder actions were replaced with local Deposit, Withdrawal, and Transfer behavior.
- My Portfolio placeholder balance/deposit UI was removed so wallet logic lives in Wallet.
- Bottom navigation was split into four primary tabs plus a standalone Search button.
- Web delivery now uses a Phone/Pad/Wide Pad iframe preview shell.
- Intro ASCII animation was tuned for phone, tablet portrait, and tablet landscape.
- Stock detail Trade panel was converted into a Promo-like bubble and the layout morph bug was removed.
- Vercel deployment is public and GitHub repository visibility is public.

## Next Implementation Passes

1. **Landscape Tablet Mode**
   - Add a dedicated two-column layout for Wide Pad.
   - Redesign information density for horizontal touch usage.
   - Decide which panels become persistent and which remain modal/bubble-based.

2. **Dark Mode And Personalization**
   - Add a dark theme.
   - Add display settings for user preferences.
   - Keep financial data legible in both light and dark environments.

3. **Professional Charting**
   - Add candlestick/K-line charts.
   - Add trader-focused chart controls.
   - Consider a proven charting library or a dedicated canvas/SVG implementation.

4. **Wallet Operations**
   - Replace fixed demo amounts with a small amount-entry sheet if the presentation needs a deeper wallet flow.
   - Add transaction history if wallet becomes a larger part of the review.

5. **Market Data Consistency**
   - Continue growing `npm run check:market-data` to cover Discover movers, Watch List rows, Portfolio holdings, chart direction, and account totals.
   - Keep Home Cash and Holding equal to Wallet cash plus Portfolio investment value.

6. **Figma Refresh**
   - Bring the Figma file up to date with the shipped Discover, Wallet, Trade bubble, and preview shell modes.

## Current Verification Gates

```bash
npm run typecheck
npm run check:market-data
npm run export:web
npm run verify:web-demo
```

`verify:web-demo` serves the static `dist` output locally, opens headless Chrome, and checks the interview-critical path: launch splash, Home, Discover, Wallet operations, Trade buy/sell constraints, Portfolio, Watch List, and Wallet return.
