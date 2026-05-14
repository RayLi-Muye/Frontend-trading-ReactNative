# Prompt And Command Log

Date: 2026-05-14

This log records the prompts, research targets, and commands used while setting up the project. Keep updating it as the app moves from planning to Figma to implementation.

## Initial User Prompt

The user requested a React Native interview demonstration inspired by https://www.eightcap.com. The app should browse stock/market changes with mock data, emphasize visual quality, consider shareable delivery by link, support multi-device viewing, and keep Markdown documentation of prompts, commands, and project management. The codebase should be managed with Figma and GitHub.

## Research Targets

- Eightcap homepage / trader page: https://www.eightcap.com/en/traders/
- Key observations captured in `docs/eightcap-mobile-demo-brief.md`.

## Commands Run

### Repository And Research

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
git config --global user.name
git config --global user.email
gh api user --jq '{login: .login, id: .id, name: .name, email: .email}'
git init -b main
git config user.name RayLi
git config user.email 161552348+RayLi-Muye@users.noreply.github.com
git add README.md docs/eightcap-mobile-demo-brief.md docs/figma-wireframe-brief.md docs/prompt-command-log.md .gitignore
git commit -m "Initialize Eightcap demo brief"
gh repo create Demo-EightCap --private --source=. --remote=origin --push --description "React Native market browsing demo inspired by Eightcap"
git status --short --branch
git remote -v
gh repo view RayLi-Muye/Demo-EightCap --json nameWithOwner,url,visibility,description,defaultBranchRef
```

### Expo Scaffold And Implementation

```bash
sed -n '1,240p' /Users/winnie/.agents/skills/expo-api-routes/SKILL.md
sed -n '1,220p' /Users/winnie/.agents/skills/building-native-ui/SKILL.md
node --version
npm --version
npx create-expo-app@latest --help
rm -rf /tmp/demo-eightcap-expo-scaffold && npx create-expo-app@latest /tmp/demo-eightcap-expo-scaffold --template tabs
cp -R /tmp/demo-eightcap-expo-scaffold/app /tmp/demo-eightcap-expo-scaffold/assets /tmp/demo-eightcap-expo-scaffold/app.json /tmp/demo-eightcap-expo-scaffold/package.json /tmp/demo-eightcap-expo-scaffold/package-lock.json /tmp/demo-eightcap-expo-scaffold/tsconfig.json .
npm install
npx expo install react-native-svg expo-haptics
npm install lucide-react-native
mkdir -p app/instrument src/components src/data src/design src/utils
npm install
npm run typecheck
npx expo start --web --port 8081 --non-interactive
CI=1 npx expo start --web --port 8082
npx expo export --platform web
```

### Verification

```bash
npm run typecheck
npx expo export --platform web
```

The web app was opened and checked in the Codex in-app browser at:

```text
http://localhost:8082/
http://localhost:8082/instrument/XAUUSD
http://localhost:8082/watchlist
http://localhost:8082/insights
```

## Notes

- `gh auth status` showed GitHub CLI is authenticated as `RayLi-Muye`.
- `RayLi-Muye/Demo-EightCap` did not exist when checked.
- The current directory was initially empty and not a Git repository.
- One CSS variable extraction command failed because the pattern began with `--`; it should use `rg -- 'pattern'` if repeated.
- A private GitHub repository was created at https://github.com/RayLi-Muye/Demo-EightCap.
- The local `main` branch tracks `origin/main`.
- The project uses Expo Router with `app/` routes and keeps reusable components/data/tokens under `src/`.
- `expo-api-routes` was reviewed. API routes are intentionally skipped for now because this version uses static mock data and has no server-side secrets.
- Port `8081` was already in use by another local project, so Expo web verification used `http://localhost:8082`.
- `npm run typecheck` passed.
- `npx expo export --platform web` passed and generated `dist/`.
- `vercel.json` was added with Expo web build/output settings and a rewrite for `/instrument/:symbol`.
- `npm audit` currently reports 4 moderate issues from the generated Expo dependency tree; no forced audit fix was run because it may introduce breaking changes.

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
