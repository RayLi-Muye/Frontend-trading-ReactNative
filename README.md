# React Native Interview Demo

An interview demonstration project by Ray Li.

This is a React Native / Expo prototype built as an interview demonstration for a mobile-first trading experience. It uses mock market, wallet, watchlist, and portfolio data so the focus can stay on frontend craft, interaction depth, responsive behavior, and the AI-assisted development workflow.

This is not an official brokerage product and does not connect to real trading or brokerage services.

## Links

- Live demo: <your-vercel-url>

## Current Status

- Repository visibility: public for interview review
- Deployment: Vercel Git Integration from `main`
- Framework: Expo SDK 55, React Native 0.83, React 19
- Routing: Expo Router file-based routes
- Data: local mock data and local state only
- Verification: TypeScript, Expo web export, and headless browser smoke testing
- Public demo access: Vercel SSO deployment protection disabled

## Product Scope

The prototype includes five primary app surfaces:

1. Home
   - Cash and Holding
   - animated market chart
   - Top Movers
   - market movement UI

2. Invest
   - portfolio asset list
   - holding rows
   - market values and P/L data

3. Watchlist
   - watchlist table
   - bid/ask quote display
   - market filters

4. Discover
   - search
   - trending themes
   - Top Movers
   - financial business article section

5. Search / Wallet
   - bottom navigation Search action
   - Wallet currency accounts
   - Deposit, Withdrawal, and Transfer actions

The app also includes stock/crypto detail pages with chart range controls, contextual menus, a Promo-like trade ticket bubble, Buy/Sell behavior, and local portfolio/wallet updates.

## Preview Modes

The deployed web app includes an outer preview shell so reviewers can inspect the app without browser devtools:

| Mode | Viewport |
|---|---:|
| Phone | `430 x 932` |
| Pad | `768 x 1024` |
| Wide Pad | `1024 x 768` |

The shell renders the app inside an iframe with a real viewport. This avoids the layout issues caused by simply scaling the React Native Web root with CSS.

## Visual Direction

The visual direction was prepared for the interview demonstration and uses a green primary action/accent color, paired with near-white surfaces, black typography, and red/green market movement states.

The intro page includes a custom ASCII animation that was iterated many times to create a memorable first impression for the demo.

## Tech Stack

| Area | Technology |
|---|---|
| App framework | Expo SDK 55 |
| UI | React Native 0.83, React 19 |
| Web | React Native Web |
| Routing | Expo Router |
| Animation | React Native Reanimated |
| Icons | `lucide-react-native` |
| Graphics | `react-native-svg` |
| Native feel | `expo-haptics`, `expo-blur`, `expo-glass-effect`, `expo-symbols` |
| Deployment | Vercel |
| Automation | custom headless Chrome smoke test |

## Repository Structure

```text
.
├── app/                         Expo Router screens
│   ├── (tabs)/                  Home, Invest, Watchlist, Discover, Wallet/Search
│   ├── instrument/[symbol].tsx  stock/crypto detail route
│   ├── +html.tsx                web HTML shell
│   └── _layout.tsx              root stack and preview shell wrapper
├── assets/                      fonts and Expo assets
├── docs/                        briefs, metrics, technical notes, email copy
├── scripts/
│   ├── check-market-data.cjs
│   └── verify-web-demo.cjs      headless browser smoke test
├── src/
│   ├── components/              reusable UI components
│   ├── data/                    mock market/portfolio data
│   ├── design/                  design tokens
│   ├── hooks/                   local portfolio, viewport, live-market hooks
│   └── utils/                   formatting helpers
├── package.json
├── tsconfig.json
└── vercel.json
```

## Run Locally

```bash
npm install
npm run web
```

The local app runs at:

```text
http://localhost:8081
```

Useful preview URLs:

```text
http://localhost:8081/
http://localhost:8081/?previewMode=pad
http://localhost:8081/?previewMode=widePad
http://localhost:8081/instrument/NVDA
```

## Verification

Core checks:

```bash
npm run typecheck
npm run export:web
npm run verify:web-demo
```

Production smoke test:

```bash
VERIFY_WEB_BASE_URL=<your-vercel-url> npm run verify:web-demo
```

The smoke test covers:

- launch splash and enter flow
- Discover page
- Wallet deposit and transfer
- instrument detail trade order
- portfolio update after buy
- sell disabled when no holding exists
- Watchlist route
- desktop iframe shell
- Phone, Pad, and Wide Pad preview modes

## Documentation

- [Mobile demo brief](docs/mobile-market-demo-brief.md)
- [Figma wireframe brief](docs/figma-wireframe-brief.md)
- [Interview polish roadmap](docs/interview-polish-roadmap.md)
- [Prompt and command log](docs/prompt-command-log.md)
- [Development metrics report](docs/development-metrics-report.md)
- [Technical implementation notes](docs/technical-implementation-notes.md)
- [Interview demo email](docs/interview-demo-email.md)

## Development Workflow

The project was built iteratively with an AI-assisted workflow:

- Figma Make and Figma references for visual exploration
- Codex skills such as `$figma:figma-use`, `$grill-me`, and `$grill-with-docs`
- parallel agent workstreams for implementation, investigation, and validation
- repeated local browser review
- automated smoke tests through `scripts/verify-web-demo.cjs`
- GitHub and Vercel integration for public review

## Future Priorities

1. Dedicated landscape tablet mode with a two-column layout and touch-optimized information density.
2. Dark mode and more personalization settings.
3. Professional trader charting, especially candlestick/K-line chart views.

## Notes

- All market and account data is mocked.
- No real trading orders are sent.
- No API secrets or private account data are stored in the repository.
- `package.json` remains marked `private` to prevent accidental npm publishing; this is independent of the GitHub repository visibility.
