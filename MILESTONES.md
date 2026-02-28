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
- Responsive mobile layout
- Buttons inside the clock ring must not visually touch the ring border

## Milestone 5 - Deploy
- Cloudflare Pages deployment (wrangler / Git integration)
