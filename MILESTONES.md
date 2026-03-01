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
- The title is "Poker Blinds Timer"
- A green background with gentle fades to simulate a poker table
- Start/Pause is a single toggle button, Reset and Next Round below it — all displayed inside the countdown circle
- Configurable blind rounds (default: 50/100, 100/200, 200/400, 400/800, 800/1600, 1600/3200)
- Configurable round duration
- Visual countdown per round — circular clock ring style
  - Current blinds displayed inside the circle, same font size as the countdown
  - Next blinds displayed inside the circle below the countdown
  - Ring turns amber when < 25% of round time remains
  - Ring turns red when the timer is paused
  - Circle is large enough that all inner content has comfortable spacing
- Multi-game session support (track game number within a session)

### Button / announcement rules
- Reset is disabled while the timer is running, and also when there is nothing to reset (idle, round 1, full time remaining)
- Pressing Reset does not trigger any audio announcement
- Start/Pause toggle label: "Start" when idle, "Resume" when paused, "Pause" when running
- Inside the circle: small "Current Blinds" label above the blind values
- Inside the circle: small "Time Remaining" label above the countdown
- Current blinds are announced when the timer starts from idle (fresh game or after reset)
- Current blinds are announced when the timer starts after Next Round was pressed (regardless of whether timer was paused or idle when Next was pressed)
- Pressing Next while paused queues the announcement — it fires only when the timer is started again, not immediately
- Automatic round advance (timer hits zero) announces the new blinds immediately as before
- The Next Round button is disabled if we are the final round in the game
- Add a Previous Round button to the left of the Reset button

## Milestone 2 - Audio
- Audio: start sound, pause sound
- Audio announcement 1 minute before blinds increase
- Audio announcement when blinds increase

## Milestone 3 - Configuration UI
- Edit blind levels in-browser (add/remove/reorder rows); edit form has Cancel, Reset to defaults, and Save buttons
- Ability to set round durations
- Allow the user to change the voice based on what the browser supports (filter to en-GB and en-US only); voices grouped into "American" and "British" optgroups; locale prefix stripped from name, friendly label appended e.g. "Robosoft6 (American)"
- Voice dropdown must not overflow its container
- Voice selector lives inside the edit panel (only visible when editing)
- Preview button to the right of the dropdown: speaks a test phrase
- Changing the voice auto-speaks the test phrase
- While speaking, preview button shows a "playing" state and can be clicked to stop
- Save configuration to localStorage

## Milestone 4 - Polish
- Responsive mobile layout: text inside the ring scales with `clamp()`/`vmin`; clock ring treated as decorative background on small screens (partial visibility acceptable); touch targets enlarged on coarse-pointer devices; landscape compacts the header to give the clock more vertical room
- Buttons inside the clock ring must not visually touch the ring border

## Milestone 5 - Sound Settings
- Sound settings section in settings overlay — 3 groups (start of game, one minute warning, blinds up), all toggles default on, persisted to localStorage
- Start of game: blind level voice announcement
- One minute warning: guitar riff (riff.mp3) then voice announcement
- Blinds up: siren (siren.mp3) then voice announcement

## Milestone 6 - Deploy
- Cloudflare Pages deployment via `bunx wrangler pages deploy --branch main`
- PWA manifest, SVG icon, service worker for offline caching
- Terraform infrastructure for Cloudflare Pages project
- Custom domain `timer.bucks-poker.com` via `cloudflare_pages_domain` + CNAME record (zone looked up via data block)
- GitHub Actions: CI workflow (type-check + build on PRs), deploy workflow (build + wrangler deploy on push to main)

## Milestone 7 - Game Settings
- "Final round has no time limit" toggle (default on) — timer keeps running at the last blind level indefinitely; when off, freezes at 0:00

## Milestone 8 - Additions
- Option to play a blip sound every second during the last 10 seconds of a level (toggle in sound settings, default on)
- Round duration edited as minutes and seconds (MM:SS) rather than fractional minutes
- Edit table inputs validated with Zod; invalid fields show a red border; Save is blocked until all fields are valid
