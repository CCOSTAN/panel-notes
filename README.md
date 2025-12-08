# Panel Notes

Panel Notes is a small, self-hosted web app for mapping and documenting an electrical breaker panel.

It grew out of <a href="https://github.com/CCOSTAN/Home-AssistantConfig/issues/1547" target="_blank" rel="noopener">this Home Assistant issue</a> after replacing a couple of garage lights and realizing the handwritten directory on the door wasn" + "'" + "t cutting it anymore.

The goal is simple:

- See the whole panel at a glance (odd on the left, even on the right).
- Double-click a breaker to see its label, notes, and linked devices.
- Open the app instantly from a QR code taped to the panel.

## Features

- 40-slot GE panel layout (1A/1B | 2A/2B style), but easy to adapt.
- Mobile-first UI; both sides of the panel stay visible on phones.
- Modal editor for breaker details (label + notes + linked devices).
- CSV-backed data so you can edit or back it up with any text editor.
- Simple REST API ready for future integrations (e.g., Home Assistant).

## Stack

- Frontend: React + Vite (modern, component-based, mobile-first).
- Backend: Express (Node) serving the API and static build.
- Data: Flat CSV in ./data (reakers.csv, devices.csv).
- Docker: Multi-stage build, app listens on PORT (defaults to 8080).

## Quickstart (Node)

`ash
# clone the repo
cd panel-notes

# install deps
npm install

# dev mode: Vite + API
npm run dev
# UI: http://localhost:5173
# API: http://localhost:8080
`

## Quickstart (Docker)

`ash
# in the repo root
docker compose up --build -d
# open http://localhost:8080
`

- Data persists via the bind mount ./data:/app/data.
- To change the port, set PORT in .env and update the compose mapping if needed.

## Configuration

Copy the example env file:

`ash
cp .env.example .env
`

Available variables:

- PORT – API / web port inside the container (default 8080).
- DATA_DIR – path inside the container where CSVs are stored (default /app/data).

## API (for future integrations)

These are intentionally simple so Home Assistant or other tools can query them later:

- GET /api/health
- GET /api/breakers
- GET /api/breaker/{id}
- PUT /api/breaker/{id}
- GET /api/devices
- POST /api/device
- GET /api/device/{id}
- PUT /api/device/{id}
- GET /api/search?q=garage
- GET /api/map/light-to-breaker?deviceId=D1

## Data model

- Breaker
  - id – internal ID (e.g., A1, B2).
  - side – A or B.
  - ow – numeric row (1–20).
  - label – human-friendly description.
  - load_type – optional type (Lighting, Outlet, etc.).
  - 
otes – free-form notes.
  - 	ags – comma-separated tags.
- Device
  - id – internal ID.
  - 
ame – device name.
  - 	ype – e.g., Light, Outlet.
  - 
otes – free-form notes.
  - linked_breakers – comma-separated breaker IDs.

## QR workflow idea

In my setup, the app runs on a small Docker host on the LAN. I printed a QR code that points to the Panel Notes URL and taped it inside the panel door. If you" + "'" + "re on my Wi-Fi and scan the QR, you land directly on the panel dashboard.

That pattern should work in any house or lab:

1. Deploy Panel Notes on a host reachable on your LAN.
2. Generate a QR code for the URL (e.g., http://panel-notes.local:8080).
3. Print and tape the QR inside the panel door.
4. When you" + "'" + "re working at the panel, scan to see the live map.

## Contributing

See CONTRIBUTING.md for ideas and guidelines. PRs that improve usability, layout options, or integrations are very welcome.

## License

MIT – see LICENSE for details.
