# Prompt And Command Log

Date: 2026-05-14

This log records the prompts, research targets, and commands used while setting up the project. Keep updating it as the app moves from planning to Figma to implementation.

## Initial User Prompt

The user requested a React Native interview demonstration inspired by https://www.eightcap.com. The app should browse stock/market changes with mock data, emphasize visual quality, consider shareable delivery by link, support multi-device viewing, and keep Markdown documentation of prompts, commands, and project management. The codebase should be managed with Figma and GitHub.

## Research Targets

- Eightcap homepage / trader page: https://www.eightcap.com/en/traders/
- Key observations captured in `docs/eightcap-mobile-demo-brief.md`.

## Commands Run

```bash
pwd
rg --files -g '!*node_modules*' -g '!*.png' -g '!*.jpg' -g '!*.jpeg' -g '!*.gif' -g '!*.mp4' | head -200
sed -n '1,220p' /Users/winnie/.codex/plugins/cache/openai-curated/github/7955f1db/skills/github/SKILL.md
ls -la
git status --short --branch
gh auth status
sed -n '1,240p' /Users/winnie/.agents/skills/building-native-ui/SKILL.md
gh repo view RayLi-Muye/Demo-EightCap --json nameWithOwner,url,visibility,description
curl -L -s https://www.eightcap.com/en/traders/ | rg -o 'href="[^\"]+\\.css[^\"]*"|src="[^\"]+"|#[0-9A-Fa-f]{6}|--[A-Za-z0-9_-]+:[^;]+' | head -160
curl -L -s https://www.eightcap.com/en/traders/ | rg -n "Trade at lightning speed|Top 10 instruments|Trade smarter|Ready to trade your way|Market Insights|Risk Warning|DEVICES|Eightcap Logos" -C 2
curl -L -s 'https://www.eightcap.com/_next/static/css/5e51ac8edf0f9e07.css?dpl=dpl_3MNkQHG9dsRkCyyLCLZMA4kWGtn6' | rg -o '#[0-9A-Fa-f]{3,8}' | sort | uniq | head -120
curl -L -s 'https://www.eightcap.com/_next/static/css/ac6eceaa8113dd94.css?dpl=dpl_3MNkQHG9dsRkCyyLCLZMA4kWGtn6' | rg -o '#[0-9A-Fa-f]{3,8}' | sort | uniq | head -120
curl -L -s 'https://www.eightcap.com/_next/static/css/da6512f5b0afe8ea.css?dpl=dpl_3MNkQHG9dsRkCyyLCLZMA4kWGtn6' | rg -o '#[0-9A-Fa-f]{3,8}' | sort | uniq | head -120
curl -L -s 'https://www.eightcap.com/_next/static/css/5e51ac8edf0f9e07.css?dpl=dpl_3MNkQHG9dsRkCyyLCLZMA4kWGtn6' | rg -n 'bg-utility-brand|bg-icon-brand|bg-audience-traders|fg-text-default-black|glass-effect|banner-gradient' -C 1
mkdir -p docs
```

## Notes

- `gh auth status` showed GitHub CLI is authenticated as `RayLi-Muye`.
- `RayLi-Muye/Demo-EightCap` did not exist when checked.
- The current directory was initially empty and not a Git repository.
- One CSS variable extraction command failed because the pattern began with `--`; it should use `rg -- 'pattern'` if repeated.

## Future Prompt Templates

### Figma Prompt

```text
Create a mobile-first Figma wireframe and visual direction for a React Native market browsing demo inspired by Eightcap's public trader website. Use the project brief in docs/eightcap-mobile-demo-brief.md and the screen list in docs/figma-wireframe-brief.md. The first screen should be a usable market dashboard, not a landing page. Include components for instrument rows, chart cards, segmented controls, insights, and a demo risk disclaimer.
```

### Implementation Prompt

```text
Scaffold an Expo Router + TypeScript React Native app for the Eightcap Market Demo. Use mock data only. Implement the Market Home, Instrument Detail, Watchlist, Insights, and Disclaimer screens. Keep the layout mobile-first, responsive on web, and visually aligned with docs/eightcap-mobile-demo-brief.md.
```

### Review Prompt

```text
Review the React Native implementation against the design brief, focusing on responsive layout, mock-data clarity, component boundaries, accessibility, and whether the demo is safe to send as an interview link.
```

