# timer.bucks-poker.com

A browser-based poker blinds timer. Runs entirely client-side — no server required.

## Features

- Circular SVG countdown clock with amber/red state colours
- Current and next blind levels displayed inside the ring
- Start / Pause / Resume / Reset / Next Round controls
- Web Audio API chimes on start and pause
- Web Speech API announcements (blind increases, 1-minute warnings)
- Multi-game session counter

## Repository layout

```
/
├── app/                    # Vite + TypeScript frontend
│   ├── index.html
│   └── src/
│       ├── main.ts         # All timer logic and state
│       └── style.css       # Styles (poker-table theme, SVG ring)
├── infrastructure/         # Terraform — Cloudflare Pages deployment
│   └── main.tf
├── MILESTONES.md           # High-level feature roadmap
├── TODOS.md                # Task checklist per milestone
└── package.json            # Root build script (delegates to /app via bun)
```

## Development

```bash
cd app
bun install
bun run dev
```

## Build

```bash
bun run build   # from repo root — outputs to app/dist
```

## Tech stack

- **Frontend**: Vite, TypeScript (vanilla — no framework)
- **Package manager**: Bun
- **Hosting**: Cloudflare Pages (free tier)
- **Infrastructure**: Terraform (`cloudflare` provider)
