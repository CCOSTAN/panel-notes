# Local Agent Instructions (private)

## Project Overview
Panel Notes is a mobile-first, CSV-backed electrical breaker mapping application. It allows tracking of which devices (lights, outlets, appliances) are connected to specific breakers in a physical electrical panel.

- **Stack**: React (Frontend) + Express (Backend).
- **Storage**: Flat CSV files in `./data` (`breakers.csv`, `devices.csv`).
- **Path**: `/home/hass/docker_files/panel-notes`
- **Compose Service**: `panel_notes` (defined in the root `docker-compose.yaml`).
- **Command**: `ssh -o RemoteCommand=none -o RequestTTY=no -T docker69 "cd /home/hass/docker_files && docker compose up -d --build panel_notes"`

## Design System (Glassmorphism)
The app uses a modern "Glassmorphism" aesthetic:
- **Styling**: Vanilla CSS (`src/styles.css`) + CSS Variables.
- **Theme**: Configured in `src/config/theme.js`.
- **Typography**: Uses the "Outfit" font family.
- **Aesthetics**: Semi-transparent surfaces, `backdrop-filter: blur()`, vibrant accents (`#38bdf8` sky blue), and smooth transitions.

## UI Architecture & Navigation
- **Mobile-First**: A fixed `bottom-nav` is used for mobile devices. Top navigation tabs are hidden on small screens.
- **Dashboard**: Displays a physical layout of the panel (Odd slots on left, Even on right). Cards are intentionally minimal (no notes/devices shown at high level to reduce clutter).
- **Devices Page**: Compact list view for devices. Linked breakers are clickable pills that navigate back to the dashboard and highlight the breaker.
- **Search**: Global search across labels, notes, and tags. Search results for breakers show full notes for context.
- **Cross-Linking**: Use the `onSelectBreaker` prop to handle navigation from other pages back to the primary breaker view.

## Core Logic
- **Append-Only (mostly)**: Backend mostly appends/updates CSV rows.
- **Data Dir**: App data lives at `./panel-notes/data` (bind mounted to `/app/data` in container).
- **Port**: Runs on port 8080 internally and externally on `docker_69`; keep `http://192.168.10.69:8080` stable because the physical panel QR code points there.
