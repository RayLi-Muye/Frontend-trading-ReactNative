# Interview Demo Email

Date: 2026-05-17

This document contains email copy for sharing the EightCap prototype demonstration link, GitHub repository, and development context.

## Recommended Email

Subject: EightCap Prototype Demonstration - React Native / Expo

Hi [Name],

Thank you again for giving me the opportunity to complete this demonstration.

I built the project as a React Native / Expo prototype for a mobile-first trading experience. It uses mock market and portfolio data, but the app flow is interactive: the user can move through the main tabs, inspect assets, open stock detail pages, use wallet actions, and place simulated buy/sell orders.

For the visual direction, I referenced the main visual language of the Eightcap public website and used the green from the Eightcap logo as the primary theme color.

Demo link:

https://demo-eightcap.vercel.app

GitHub repository:

https://github.com/RayLi-Muye/Demo-EightCap

The app includes five primary tabs: Home, Invest, Watchlist, Discover, and Search/Wallet. It also includes deeper interaction levels, including stock detail pages, chart views, contextual menus, wallet actions, and the trade order ticket. For easier review, the web demo includes Phone, Pad, and Wide Pad preview modes directly on the page, so the reviewer does not need to use browser devtools to inspect different layouts.

My development process was iterative. I started from product and visual direction, used Figma Make and Figma references to explore the Discover/navigation direction, translated the experience into Expo Router screens and reusable React Native components, then refined the app through repeated feedback and browser testing. I used TypeScript checks, Expo web export, and an automated headless-browser smoke test to validate the main user flows before deploying through Vercel Git Integration.

There are a few parts of the project that I am especially proud of:

1. The intro page ASCII animation. It went through many iterations before reaching the current visual balance and motion.
2. The complete React Native app workflow built in a short time. The prototype has real local data interaction, five tabs, and interaction depth from the home page down to stock detail menus and order flows.
3. The responsive adaptation across phone, portrait tablet, and landscape tablet preview modes.
4. The feedback process. Besides using AI development tooling, I invited friends from the industry to review the prototype, including an experienced trader and a professional QA tester.
5. The automated AI-assisted testing workflow. The project includes a browser smoke test that checks the key routes and interactions.

I also want to thank the friends who reviewed the project and gave me feedback. Their comments helped me focus on the trading experience, interaction polish, and QA details.

If I continue developing this project, my next priorities would be:

1. A dedicated landscape tablet experience, including a two-column layout and information density designed for touch interaction.
2. Dark mode and more personalization settings so users can adapt the interface to their own trading preferences.
3. A more professional trading chart interface, including candlestick/K-line chart views.

I put a lot of effort into this project. To reach the current level of polish within a short time, I worked in an AI-empowered workflow, including parallel agent workstreams where different AI agents helped accelerate implementation, testing, and documentation. I wanted this project to demonstrate not only my product and frontend judgment, but also my ability to work effectively in a modern AI-assisted development environment.

Thank you again for the opportunity to build and present this demonstration.

Best regards,

Ray Li

## Shorter Version

Subject: EightCap Prototype Demonstration Link

Hi [Name],

Thank you again for the opportunity to complete this demonstration.

I built the project as a React Native / Expo prototype for a mobile-first trading experience. The app uses mock market and portfolio data, but the product flow is interactive: it includes five tabs, wallet actions, stock detail pages, contextual menus, and simulated buy/sell order flows.

The visual direction references Eightcap's public website, with the green from the Eightcap logo used as the primary theme color.

Demo link:

https://demo-eightcap.vercel.app

GitHub repository:

https://github.com/RayLi-Muye/Demo-EightCap

The web demo includes Phone, Pad, and Wide Pad preview modes directly on the page, so it can be reviewed without using browser devtools.

I am especially proud of the intro ASCII animation, the complete React Native workflow built in a short time, and the responsive adaptation across three presentation modes. I also invited friends from the industry, including an experienced trader and a professional QA tester, to give feedback during the process. The project was developed with an AI-empowered workflow, including automated browser testing and parallel AI agent workstreams to accelerate implementation and validation.

If I continue developing it, my next priorities would be a dedicated landscape tablet layout, dark mode and personalization settings, and a professional candlestick/K-line chart interface.

Thank you again for giving me the opportunity to build and present this demonstration.

Best regards,

Ray Li

## Future Development Priorities

1. Landscape tablet optimization
   - Add a dedicated two-column layout.
   - Design information density specifically for horizontal tablet touch usage.
   - Keep the current Wide Pad mode as the baseline preview target.

2. Dark mode and personalization
   - Add a dark theme.
   - Add user-facing settings for visual preferences.
   - Make the app feel more configurable for different trader habits.

3. Professional charting
   - Add candlestick/K-line charts.
   - Add more trader-focused chart tools.
   - Improve the stock detail page for professional analysis workflows.

## Project Highlights

1. Intro ASCII animation
   - The animation went through many iterations.
   - It became a recognizable first impression for the demo.

2. Complete interaction depth
   - The prototype includes five primary tabs.
   - Users can navigate from top-level pages into stock details, menus, wallet actions, and order tickets.
   - The app uses local mock data to support real state changes rather than static screens.

3. Responsive presentation
   - The app supports Phone, Pad, and Wide Pad review modes.
   - The iframe preview shell makes device review accessible directly from the browser.

4. Human feedback loop
   - Industry friends reviewed the project.
   - Feedback came from both trading and QA perspectives.

5. AI-assisted automation
   - Automated smoke tests validate core flows.
   - Parallel AI agent workstreams helped speed up implementation and iteration.

## Code Review Positioning

The GitHub repository can be public:

https://github.com/RayLi-Muye/Demo-EightCap

The reviewer can inspect the React Native implementation directly in:

- `app/`
- `src/components/`
- `src/hooks/`
- `src/data/`
- `scripts/verify-web-demo.cjs`

The Vercel demo remains the fastest way to experience the product, while GitHub provides evidence of the Expo Router structure, React Native components, mock data architecture, and verification workflow.

## Appendix: Skills And Codex Commands

### Skills And AI Workflows Used

| Skill / workflow | How it contributed |
|---|---|
| Figma Make | Used as part of the design exploration workflow, especially for the Discover/navigation direction and visual reference translation. |
| `$figma:figma-use` | Helped inspect and translate Figma design direction into implementation details. |
| `$grill-me` | Used to stress-test plans, turn broad feedback into clear decisions, and refine product priorities. |
| `$grill-with-docs` | Used for diagnosis when layout behavior needed to be checked against the existing implementation and documentation. |
| Browser / in-app browser verification | Used to review `localhost` and deployed UI behavior across Phone, Pad, and Wide Pad preview modes. |
| Parallel Agent workflow | Used to accelerate implementation and validation by splitting investigation, UI refinement, and verification workstreams. |
| GitHub workflow | Used to commit, push, and make the repository public for review. |
| Vercel workflow | Used to deploy through Git Integration and verify the public demonstration link. |

### Codex Commands And Checks Used

| Command | Purpose |
|---|---|
| `rg`, `sed`, `nl` | Locate files, inspect component code, and read exact line ranges before editing. |
| `npm run web` | Run the local Expo web preview at `localhost:8081`. |
| `npm run typecheck` | Validate TypeScript after implementation changes. |
| `npm run export:web` | Confirm the Expo web static export used by Vercel. |
| `npm run verify:web-demo` | Run automated headless-browser smoke tests for the core demo flow. |
| `VERIFY_WEB_BASE_URL=<url> npm run verify:web-demo` | Run the same smoke test against the deployed Vercel URL. |
| `git status`, `git diff`, `git log`, `git show` | Check repository state, review scope, and confirm shipped commits. |
| `git add`, `git commit`, `git push` | Publish selected changes to GitHub. |
| `gh repo view`, `gh repo edit` | Inspect and update the GitHub repository, including making it public. |
| `vercel ls`, `vercel inspect`, `vercel project protection` | Check deployment state and disable SSO protection so the demo link is publicly accessible. |
| `curl -I` | Confirm the deployed URL returns a public `200` response. |
