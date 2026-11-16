# CampusAssist: UI/UX prototype (React + Vite)

Interactive front end for the wireframes in the Team 6 technical report (Figures 9–46, user stories 1–38).
There is no backend. Everything runs in the browser, and data is saved in `localStorage` so you can test
multi-user flows with two browser tabs.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173  (also reachable from your phone on the same Wi-Fi)
npm test           # route-engine unit tests (step-free routing, rerouting, barriers)
npm run build      # production build into dist/
```

Requires Node 18+.

## Brand colours (sampled from the logo)

| Token | Value | Used for |
|---|---|---|
| Lime | `#C9CF14` | Accents, route line, selected chips, active tab, header stripe |
| Charcoal | `#2C3638` | Text, primary buttons, outlines |
| Off-white | `#F6F5F0` | Page background |

Text and buttons are always charcoal-on-white or charcoal-on-lime, which gives a contrast ratio above 4.5:1
(the report's WCAG 2.1 AA target). A dark theme follows your OS setting. Tokens live at the top of `src/styles.css`.

## Demo accounts (also shown on each sign-in screen)

| Role | Email | Password |
|---|---|---|
| Campus User | student@campus.test | student123 |
| Faculty Staff | staff@campus.test | staff123 |
| Authorized Helper | alex@campus.test (or bea@campus.test) | helper123 |
| Administrator | admin@campus.test | admin123 |
| Visitor | no account | n/a |

Menu (top right) → **Reset demo data** restores the original state at any time.

## Prototype stand-ins

- **QR scanning** is simulated: the scan dialog lists the codes "posted on campus" (e.g. `CA-HUB-01`), accepts typed codes, and has a button that scans an invalid code.
- **Indoor map** is a schematic route map (blocks as columns, floors as rows), not a floor plan. Routes are real: Dijkstra over a hand-built graph of blocks A, B and C, with stairs, elevators, ramps, the A–B bridge and entrances.
- **Real-time updates** use the browser `storage` event, so a second tab acts as a second device.
- Passwords are plain text in `localStorage`. This is demo data only.

## Project layout

```
src/lib/data.js      campus places, route graph, directory, events, QR codes
src/lib/graph.js     routing (step-free, barrier-aware), turn-by-turn text, barrier guessing
src/lib/store.js     persistent store + all actions (requests, barriers, accounts, directory)
src/components/      Screen shell, MapPreview, LocationPicker + QR dialog, RoutePanel, UI kit
src/pages/           user.jsx · help.jsx · helper.jsx · admin.jsx · visitor.jsx · auth.jsx
```

## How to test the UI/UX

See **[TESTING.md](TESTING.md)**. It walks through every story's acceptance tests from the report,
plus the cross-tab flows (help request → helper → chat, barrier approval → reroute).
