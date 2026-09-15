# SahakarConnect UI — UX4G Reference Build

Redesign of the landing page (`LandingPage.tsx` + `LegalModal.tsx` scope) on the
**real** UX4G Design System 3.0 tokens (colors, type, spacing pulled directly
from ux4g.gov.in/foundations), in plain HTML/CSS/TypeScript — no framework.

## Files
- `index.html` — landing page + legal policy modal
- `css/tokens.css` — UX4G design tokens as CSS variables (light/dark/high-contrast)
- `css/base.css` — reset, typography, focus states
- `css/components.css` — every component used (header, nav, buttons, cards, calculator, modal, footer)
- `js/app.ts` — source (theme switch, font scale, split calculator, legal modal tabs)
- `js/app.js` — compiled output actually loaded by the page (`tsc app.ts --target ES2019`)

## What changed vs. the reference screenshot
The reference used an invented navy palette and a lot of generic SaaS-card
patterns (uniform rounded-shadow cards, ALL-CAPS labels everywhere, redundant
stat blocks, rainbow per-card top borders). This build:
- Uses the actual UX4G violet primary (`#4a2bc2`) and full semantic token set
- States each number once — the hero trust row, split bar, and calculator no
  longer repeat the same 88/8/4 figures three different ways
- Sentence-case labels instead of tracked-out uppercase
- One consistent accent treatment (left border) instead of a different color
  per trade-portal card
- Real working interactivity: the calculator computes live, the welfare/rounding
  copy matches the actual math (worker share absorbs the rounding remainder),
  every footer legal link opens the modal on a real, matching tab

## Not yet built (next steps, same token system)
This covers "Public & Institutional Overview" only. Still outstanding from the
full component inventory: Trade Service Portal, Booking flow, Live Tracker,
Provider Dashboard/Active Job/Earnings, Admin Hub (Verification Queue, Ledger,
Governance). Same `tokens.css`/`components.css` should be extended (add
component classes, don't fork the token file) when building those.

## Running locally
Any static file server works, e.g. `python3 -m http.server` from this folder,
then open `http://localhost:8000/index.html`.
