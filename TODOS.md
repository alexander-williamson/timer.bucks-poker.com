# TODOs

## Milestone 0 — Setup

- [x] Create `/app` directory
- [x] Create `/infrastructure` directory
- [x] Scaffold Vite + TypeScript project in `/app` using bun
- [x] Create Terraform skeleton in `/infrastructure`
- [x] Create root `package.json` with build script (delegates to `/app`)

## Milestone 1 — Core Timer (MVP)

- [x] Green background with gentle fades to simulate a poker table
- [x] Start / Pause / Reset / Next Round controls — inside the countdown circle
- [x] Configurable blind rounds (default: 50/100, 100/200, 200/400, 400/800, 800/1600, 1600/3200)
- [x] Visual countdown per round — circular clock ring
- [x] Current blinds displayed inside the circle, same font size as countdown
- [x] Next blinds displayed inside the circle
- [x] Ring turns amber when < 25% of round time remains
- [x] Ring turns red when paused
- [x] Multi-game session support (track game number within a session)

## Milestone 2 — Audio

- [x] Start sound
- [x] Pause sound
- [x] Audio announcement 1 minute before blinds increase
- [x] Audio announcement when blinds increase

## Milestone 3 — Configuration UI

- [ ] Blind levels editor (add / remove / reorder)
- [ ] Round duration editor per level
- [ ] Persist config to localStorage

## Milestone 4 — Polish

- [ ] Responsive mobile layout

## Milestone 5 — Deploy

- [ ] Cloudflare Pages deployment (wrangler / Git integration)
- [ ] PWA manifest + offline support
