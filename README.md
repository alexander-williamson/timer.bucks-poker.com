# timer.bucks-poker.com

A browser-based poker blinds timer. Runs entirely client-side — no server required.

## Features

- Full-screen circular SVG countdown clock with amber/red state colours
- Current and next blind levels displayed inside the ring
- Start / Pause / Resume / New Game / ← / → controls inside the ring
- Configurable blind levels (add, remove, reorder, set duration per level)
- Web Audio API chimes on start and pause
- MP3 jingle before 1-minute warning; siren before blinds-up announcement
- Web Speech API announcements (blind increases, 1-minute warnings) with voice selector
- All sound events individually toggleable; settings persisted to localStorage
- Multi-game session counter
- Responsive mobile layout; installable as a PWA with offline support

## Repository layout

```
/
├── app/                    # Vite + TypeScript frontend
│   ├── index.html
│   ├── public/
│   │   ├── manifest.json   # PWA manifest
│   │   ├── sw.js           # Service worker (offline caching)
│   │   ├── icon.svg        # App icon
│   │   ├── riff.mp3        # Guitar riff — 1-minute warning
│   │   └── siren.mp3       # Siren — blinds-up warning
│   └── src/
│       ├── main.ts         # All timer logic and state
│       └── style.css       # Styles (poker-table theme, SVG ring)
├── infrastructure/         # Terraform — Cloudflare Pages deployment
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── terraform.tfvars.example
├── wrangler.toml           # Wrangler CLI config for manual deploys
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

## Deploy

### Option A — Git integration via Terraform (recommended)

```bash
cd infrastructure
cp terraform.tfvars.example terraform.tfvars
# Fill in terraform.tfvars with your Cloudflare and GitHub credentials
terraform init
terraform apply
```

Cloudflare Pages will then build and deploy automatically on every push to `main`.

### Option B — Manual deploy with Wrangler

```bash
bun run build
bunx wrangler pages deploy --branch main
```

## Licensing & audio

This is a private, non-commercial project. It is **not open source**. All rights reserved.

The audio files (`riff.mp3`, `siren.mp3`) are used for personal, non-commercial purposes only. Their original provenance and licensing are unknown — do not redistribute.

## Tech stack

- **Frontend**: Vite, TypeScript (vanilla — no framework)
- **Package manager**: Bun
- **Hosting**: Cloudflare Pages (free tier)
- **Infrastructure**: Terraform (`cloudflare` provider)
