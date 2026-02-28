# Milestones

## Milestone 0 - Setup

Setup the infrastructure folders for the project.

- Keep the app data in /app.
  - Lets use Vite and Typescript here
- Keep the infrastructure data in /infrastructure.
  - Use terraform 
- Upon a build (from a root packages.json folder) we will package the static files website from the in the /app folder

We will use `bun` for this project instead of `npm`.

## Milestone 1 - Core Timer (MVP)
Single-page poker blinds timer with all core features running in the browser.

### Features
- A green background with gentle fades to simulate a poker table
- Start / Pause / Reset / Next Round controls — displayed inside the countdown circle
- Configurable blind rounds (default: 50/100, 100/200, 200/400, 400/800, 800/1600, 1600/3200)
- Configurable round duration
- Visual countdown per round — circular clock ring style
  - Current blinds displayed inside the circle, same font size as the countdown
  - Next blinds displayed inside the circle below the countdown
  - Ring turns amber when < 25% of round time remains
  - Ring turns red when the timer is paused
- Multi-game session support (track game number within a session)

## Milestone 2 - Audio

- Audio: start sound, pause sound
- Audio announcement 1 minute before blinds increase
- Audio announcement when blinds increase

## Milestone 3 - Configuration UI
- Edit blind levels in-browser (add/remove/reorder rows)
- Set round duration per level
- Save configuration to localStorage

## Milestone 4 - Polish
- Responsive mobile layout

## Milestone 5 - Deploy
- Cloudflare Pages deployment (wrangler / Git integration)
- PWA manifest + offline support
