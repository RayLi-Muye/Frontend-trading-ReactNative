# Eightcap Market Demo

React Native / Expo demonstration project for a mobile-first market browsing experience inspired by Eightcap's public website.

This repository is being prepared as an interview demonstration. The app will use mock market data so the work can focus on interaction quality, visual execution, responsive layout, and project communication.

## Current Status

- Repository scaffold: in progress
- Design brief: drafted in `docs/eightcap-mobile-demo-brief.md`
- Prompt and command log: started in `docs/prompt-command-log.md`
- App implementation: not started yet

## Planned Presentation Format

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
├── README.md
├── docs/
│   ├── eightcap-mobile-demo-brief.md
│   ├── figma-wireframe-brief.md
│   └── prompt-command-log.md
└── .gitignore
```

The Expo app source will be added after the design direction is agreed:

```text
app/                 Expo Router screens
src/components/      Reusable UI components
src/data/            Mock market data
src/design/          Design tokens and theme helpers
src/features/        Feature-level modules
src/utils/           Formatting and shared utilities
assets/              Images, icons, and generated visuals
```

