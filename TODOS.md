# TODOs

## Milestone 0 — Setup

- [x] Create `/app` directory
- [x] Create `/infrastructure` directory
- [x] Scaffold Vite + TypeScript project in `/app` using bun
- [x] Create Terraform skeleton in `/infrastructure`
- [x] Create root `package.json` with build script (delegates to `/app`)

## Milestone 1 — Core Timer (MVP)

- [x] Green background with gentle fades to simulate a poker table
- [x] Start/Pause toggle button + Reset + Next Round — inside the countdown circle
- [x] Configurable blind rounds (default: 50/100, 100/200, 200/400, 400/800, 800/1600, 1600/3200)
- [x] Visual countdown per round — circular clock ring
- [x] Current blinds displayed inside the circle, same font size as countdown
- [x] Next blinds displayed inside the circle
- [x] Ring turns amber when < 25% of round time remains
- [x] Ring turns red when paused
- [x] Multi-game session support (track game number within a session)
- [x] Reset disabled while timer is running
- [x] Current blinds announced on Start (fresh game or after Next Round)
- [x] Pressing Next while paused queues announcement — fires on next Start only
- [x] Reset triggers no audio announcement
- [x] Button label: Start / Resume / Pause based on state
- [x] "Current Blinds" label above blind values inside the circle
- [x] "Time Remaining" label above countdown inside the circle
- [x] Next Round button disabled on the final round
- [x] Previous Round button (left of Reset); disabled while running or on round 1

## Milestone 2 — Audio

- [x] Start sound
- [x] Pause sound
- [x] Audio announcement 1 minute before blinds increase
- [x] Audio announcement when blinds increase

## Milestone 3 — Configuration UI

- [x] Blind levels editor (add / remove / reorder)
- [x] Round duration editor per level
- [x] Voice selector (lists browser-available speech voices)
- [x] Persist config to localStorage

## Milestone 4 — Polish

- [x] Buttons inside the clock ring must not visually touch the ring border
- [x] Rename Reset → "New Game"; style ← / → nav buttons as ghost arrow icons
- [x] Final round freezes at 0:00 instead of entering a dead "finished" state
- [x] 1-minute warning uses ≤ 60 s check to survive skipped timer ticks (browser throttle)
- [x] Timer as full-screen main focus; gear button opens settings overlay
- [x] Maximise clock to fill available vw + vh (minus header)
- [x] Responsive mobile layout

- [x] Text shadow on clock labels; transparent ring; muted paused red

## Milestone 5 — Sound Settings

- [x] Move riff.mp3 and siren.mp3 to app/public/ for Vite static serving
- [x] Sound settings section in settings overlay — 3 groups, all toggles default on, persisted to localStorage
- [x] Add note to README that this is not an open source project - we don't know what the license of the sounds is but we are using this in a non-commercial way

  **Start of game blind level**
  - [x] Blind level voice announcement

  **One minute warning**
  - [x] Play one minute warning guitar riff (riff.mp3; speech fires on ended event)
  - [x] Blind level warning announcement

  **Blinds up**
  - [x] Play siren warning (siren.mp3; speech fires on ended event)
  - [x] New blind level voice announcement

## Milestone 6 — Deploy

- [x] Fix Terraform destination_dir (app/dist) and add GitHub source block for Git integration
- [x] Add wrangler.toml for manual wrangler pages deploy
- [x] Add terraform.tfvars.example documenting required variables
- [x] PWA manifest.json (name, theme colour, display standalone)
- [x] SVG app icon referenced in manifest
- [x] Service worker for offline caching (pre-cache /, riff.mp3, siren.mp3; cache-first assets; network-first navigation)
- [x] Register service worker in index.html
- [x] Update README with deploy instructions (Terraform + wrangler)
- [x] Replace deploy.sh with deploy.ts (Bun TypeScript script using wrangler; reads secrets from env vars)

## Milestone 7 — Game Settings

- [x] "Final round has no time limit" toggle in settings (default on) — timer keeps running at the last blind level indefinitely; when off, freezes at 0:00 (existing behaviour)

## Milestone 8 — Additions

- [x] Blip sound every second during last 10 seconds of a level — toggle in sound settings, default on
- [x] Round duration edited as MM:SS (single text input, parser accepts M:SS / MM:SS / plain M for whole minutes) instead of fractional minutes
- [x] Edit table validated with Zod — red border on invalid fields, Save blocked until all valid
