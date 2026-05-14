# Eightcap Market Demo

React Native / Expo demonstration project for a mobile-first market browsing experience inspired by Eightcap's public website.

This repository is being prepared as an interview demonstration. The app will use mock market data so the work can focus on interaction quality, visual execution, responsive layout, and project communication.

## Current Status

- Repository scaffold: created and pushed to private GitHub repo
- Design brief: drafted in `docs/eightcap-mobile-demo-brief.md`
- Prompt and command log: started in `docs/prompt-command-log.md`
- App implementation: Expo Router + TypeScript first pass is running locally
- Data source: local mock data only
- API routes: intentionally not used in this phase

## Run Locally

```bash
npm install
npm run web
```

The current dev server was verified at:

```text
http://localhost:8082
```

Port `8081` was already occupied on this machine, so `8082` was used for verification.

## Presentation Format

The strongest interview package should include:

1. A live web demo link generated from the Expo web build and deployed to Vercel.
2. A Figma prototype link showing the mobile wireframes and visual system.
3. This GitHub repository link for code review.
4. A short case-study note in the email explaining scope, tradeoffs, and what is mocked.

For a React Native project, the live web demo is the easiest link for reviewers to open from email. Expo Go can be offered as a secondary option, but it adds friction for non-technical reviewers.

## Source Reference

Primary brand and IA reference: https://www.eightcap.com/en/traders/

This is a portfolio demo only. It should be described as "inspired by Eightcap's public trading website" and should not imply affiliation with Eightcap.

## Repository Structure

```text
.
├── app/                    Expo Router screens
│   ├── (tabs)/             Markets, Watchlist, Insights
│   ├── instrument/         Dynamic instrument detail route
│   └── disclaimer.tsx      Demo boundary and risk notice
├── assets/                 Expo app assets
├── src/
│   ├── components/         Reusable UI components
│   ├── data/               Mock market data
│   ├── design/             Design tokens
│   └── utils/              Formatting helpers
├── README.md
├── docs/
│   ├── eightcap-mobile-demo-brief.md
│   ├── figma-wireframe-brief.md
│   └── prompt-command-log.md
├── package.json
├── tsconfig.json
└── .gitignore
```

## Implemented Screens

- Markets dashboard with category filters, summary tiles, instrument rows, and sparklines.
- Instrument detail screen with chart range controls, stats, and mock insight copy.
- Watchlist tab with sorting modes.
- Insights tab with knowledge-hub style cards.
- Demo notice modal clarifying that all data is mocked and the project is not affiliated with Eightcap.

## Verification

```bash
npm run typecheck
npx expo export --platform web
```

Browser verification covered:

- `http://localhost:8082/`
- `http://localhost:8082/instrument/XAUUSD`
- `http://localhost:8082/watchlist`
- `http://localhost:8082/insights`

Static web export was also verified and generated `dist/`, which is ignored by Git and can be used as the Vercel output later.

`vercel.json` is included so Vercel can run the Expo web export and serve dynamic instrument detail URLs.
