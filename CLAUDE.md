This project is dedicated to a web application for a Poker Blinds Timer.

Infrastructure

It will be hosted in Cloudflare using the free tier.

Ways of working:
- We use MILESTONES.md to organise the high level features
- We use TODOS.md to break down the milestones into tasks

We will plan the work for the milestones and add them to a TODOS.md file which will have a checklist so we can check the progress.

Lets keep the Milestones in MILESTONES.md.
Lets keep the Todos in TODOS.md

For each update, we will check the todo list and make sure we haven't gone back in specification. When completing a task we will update the todo list with completed items by checking the items off.

Be as quick and simple as possible.

## Note to Claude

### Workflow rules
- After completing any task, always update TODOS.md and check off the completed items.
- Any UI/UX or feature request made during a session must be captured as a requirement under the appropriate milestone in MILESTONES.md **before** implementing it.
- After every milestone completion or significant milestone update, create a git commit. The commit message should reference the milestone (e.g. "feat: complete Milestone 1 - Core Timer").
- NEVER add "Co-Authored-By: Claude" or similar lines to git commits.

### Architecture quick-reference (read this before touching CSS/HTML)
- Stack: Vite + TypeScript (vanilla), Bun, no framework
- Key files: `app/index.html`, `app/src/main.ts`, `app/src/style.css`
- Build: `cd app && bun run build` (root package.json delegates to this)
- Deploy target: Cloudflare Pages (Terraform in `/infrastructure`)

### SVG clock geometry
- SVG viewBox: `0 0 200 200`, circle `cx=100 cy=100 r=85`, stroke-width=10
- CIRCUMFERENCE = 2π×85 = 534.07 (hardcoded in main.ts and style.css)
- SVG rendered size: `min(560px, 94vw)` → scale factor = rendered_size / 200
- Ring inner edge radius (px) = 80 × scale (e.g. at 560px: 80×2.8 = 224px from centre)
- Ring inner diameter at centre = 448px. At y px below centre = 2×√(224²−y²)
- clock-inner is absolutely centred over the SVG; its width drives button clearance from the ring

### State machine
- `status`: `'idle' | 'running' | 'paused' | 'finished'`
- `pendingBlindAnnouncement`: defers speech to next Start (set on Reset and Next)
- Button label: "Start" (idle) / "Pause" (running) / "Resume" (paused)
- Reset disabled while running; Next/Start disabled when finished

