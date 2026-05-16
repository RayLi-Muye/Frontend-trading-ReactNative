# Technical Implementation Notes

Date: 2026-05-17

This document summarizes the technical design of the EightCap prototype for interview review.

## Stack

| Area | Technology |
|---|---|
| App framework | Expo SDK 55 |
| Routing | Expo Router with `app/` routes |
| UI runtime | React Native 0.83, React 19 |
| Web runtime | React Native Web |
| Animation | React Native Reanimated |
| Vector graphics | `react-native-svg` |
| Icons | `lucide-react-native` |
| Native feel | `expo-haptics`, `expo-blur`, `expo-glass-effect`, `expo-symbols` |
| Deployment | Vercel Git Integration from GitHub `main` |

## Route Structure

| Route | Purpose |
|---|---|
| `app/(tabs)/index.tsx` | Home / Cash and Holding |
| `app/(tabs)/portfolio.tsx` | Portfolio asset list |
| `app/(tabs)/watchlist.tsx` | Watch List |
| `app/(tabs)/discover.tsx` | Discover, Top Movers, themes, business articles |
| `app/(tabs)/wallet.tsx` | Wallet and currency accounts |
| `app/instrument/[symbol].tsx` | Stock or crypto detail page with trade ticket |
| `app/disclaimer.tsx` | Demo notice |

## Key Components

| Component | Responsibility |
|---|---|
| `src/components/web-phone-preview-shell.tsx` | Desktop web iframe shell for Phone, Pad, and Wide Pad preview modes. |
| `src/hooks/use-app-viewport.ts` | Web-safe viewport dimensions using real `window.innerWidth` and `window.innerHeight`. |
| `src/components/search-tab-bar.tsx` | Split bottom navigation: four tab buttons plus standalone Search button. |
| `src/components/app-header.tsx` | Top navigation with menu, promo, wallet, and notification actions. |
| `src/components/header-panel-provider.tsx` | Drawer and promo bubble state/animation controller. |
| `src/components/home-value-chart.tsx` | Cash and Holding chart, value visibility, and market movement UI. |
| `src/components/mover-card.tsx` | Home Top Movers rows with live tick visual states. |
| `src/components/wallet-floating-actions.tsx` | Wallet floating action button with Deposit, Withdrawal, Transfer. |
| `src/components/launch-splash.tsx` | Intro screen with animated ASCII EightCap prototype graphic. |
| `scripts/verify-web-demo.cjs` | Headless Chrome smoke test for key product flows and preview modes. |

## Web Preview Shell

The desktop web presentation uses an iframe instead of CSS-only scaling.

Preview modes:

| Mode | iframe viewport |
|---|---:|
| Phone | `430 x 932` |
| Pad | `768 x 1024` |
| Wide Pad | `1024 x 768` |

How it works:

1. The outer web page renders `WebPhonePreviewShell`.
2. The selected preview mode is stored in the URL as `previewMode`.
3. The iframe receives the same route plus `appFrame=1`.
4. `appFrame=1` prevents recursive iframe rendering.
5. The app inside the iframe reads the real iframe viewport through `useAppViewportDimensions`.
6. The outer shell scales the iframe only when the browser window is too small to fit it.

This matches Chrome device emulation more closely than a CSS transform on the app root, because React Native Web, media queries, fixed elements, and viewport hooks all see a real target viewport.

## Interaction Details

### Discover Search

The Discover search field avoids nested web buttons. When collapsed, it is a `Pressable`; when expanded, the input wrapper becomes a plain `View` so the clear button is not rendered inside another button.

### Bottom Search

The bottom Search button opens a dedicated search bubble. Web focus outlines are removed on the search inputs to keep the mobile-app visual style.

### Trade Ticket

The stock detail page uses a Promo-like bubble for the trade ticket:

- `opacity` fades in.
- `scale` animates from `0.92` to `1`.
- `translateY` animates from `-8` to `0`.
- The previous parent layout morph was removed because it stretched the green Trade button during expand/collapse.

### Wallet Actions

Wallet funding actions are consolidated into one green floating wallet button. It opens Deposit, Withdrawal, and Transfer actions and uses concise toast feedback after operations.

## Data Model

The prototype uses local mock data, not live broker or trading APIs.

Relevant files:

- `src/data/portfolio.ts`
- `src/hooks/use-demo-portfolio.ts`
- `src/hooks/use-live-market.ts`
- `src/hooks/use-watchlist.ts`

The demo simulates live market movement, portfolio updates, watchlist state, wallet transfers, and buy/sell behavior with local state and local storage.

## Verification

Core commands:

```bash
npm run typecheck
npm run export:web
npm run verify:web-demo
```

The smoke test covers:

- Launch splash and enter flow
- Discover page content
- Wallet deposit and transfer
- Instrument detail trade order
- Portfolio update after buy
- Sell disabled when no holding exists
- Watch List route
- Desktop iframe shell
- Phone, Pad, and Wide Pad preview modes

## Deployment

The project is deployed through Vercel Git Integration.

- GitHub repo: `RayLi-Muye/Demo-EightCap`
- Branch: `main`
- Vercel project: `demo-eightcap`
- Production URL: https://demo-eightcap.vercel.app

SSO deployment protection was disabled so interview reviewers can open the public link without logging into Vercel.

## Maintenance Plan

Recommended maintenance approach:

1. Keep `main` as the stable demo branch.
2. Use short feature branches for future polish work.
3. Run `npm run typecheck`, `npm run export:web`, and `npm run verify:web-demo` before pushing.
4. Keep mock data centralized in `src/data/portfolio.ts`.
5. Keep reusable UI behavior in `src/components` and avoid one-off styles inside routes when a pattern repeats.
6. Update `docs/prompt-command-log.md` after major prompt-driven changes.
7. Add a short changelog entry for every deployment sent to reviewers.

## Public Repo And Interview Code Access

Recommended strategy:

1. Keep the repository public for interview review: https://github.com/RayLi-Muye/Demo-EightCap.
2. Share the Vercel demo link as the primary product experience: https://demo-eightcap.vercel.app.
3. Point reviewers to the React Native implementation in `app/` and `src/`.
4. Keep local caches, worktrees, and machine-specific files out of Git.
5. Continue avoiding `.env`, API credentials, or private account data in the repository.

Suggested archive command for a review bundle:

```bash
git archive --format=zip -o eightcap-code-review.zip HEAD app src package.json app.json tsconfig.json vercel.json README.md docs/technical-implementation-notes.md
```
