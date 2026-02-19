# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Panel Notes is a self-hosted web app for documenting electrical breaker panels. It features a mobile-first UI showing a 40-slot GE panel layout (odd breakers on left A-side, even on right B-side), with CSV-backed persistent storage for breakers and linked devices.

**Tech Stack:**
- Frontend: React + Vite (port 5173 in dev)
- Backend: Express API (port 8080)
- Data: CSV files in `data/` directory (breakers.csv, devices.csv)
- Package Manager: pnpm (user preference - ALWAYS use pnpm, never npm)

## Development Commands

### Setup & Dependencies
```bash
pnpm install          # Install dependencies
```

### Development
```bash
pnpm run dev          # Run both client (Vite on :5173) and server (Express on :8080)
pnpm run dev:client   # Run only Vite dev server
pnpm run dev:server   # Run only Express server (with nodemon)
```

### Production Build
```bash
pnpm run build        # Build React app to dist/
pnpm start            # Serve built app + API from Express on :8080
```

### Docker
```bash
docker compose up --build -d   # Build & run in container
```

## Architecture

### Data Model & CSV Storage

**Breakers** (`data/breakers.csv`):
- Each breaker has: `id` (e.g., A1-A20, B1-B20), `side` (A or B), `row` (1-20), `label`, `load_type`, `status`, `notes`, `tags`
- Valid load_types: Lighting, Outlet, Appliance, HVAC, Unknown
- Valid statuses: Active, Spare
- Tags are comma-separated strings (parsed into arrays in memory)

**Devices** (`data/devices.csv`):
- Each device has: `id`, `name`, `type`, `notes`, `linked_breakers`
- `linked_breakers` is a comma-separated list of breaker IDs (e.g., "A1,A2")
- Devices can link to multiple breakers and vice versa

**Device Types** (`data/device_types.csv`):
- Defines available device type options: `id`, `name`
- Used to populate dropdowns when creating/editing devices
- Default types: Outlet, Switch, Light, Appliance

**CSV Data Layer** (`server/dataStore.js`):
- All reads/writes go through dataStore functions
- CSV files are parsed on read, normalized to objects with typed fields (e.g., row becomes Number)
- Tags and linked_breakers are split into arrays in-memory but stored as comma-delimited strings
- When updating a breaker's linked devices, the relationship is bidirectional: device records are updated to add/remove the breaker ID from their `linked_breakers` field

### API Endpoints

RESTful API in `server/index.js`:
- `GET /api/breakers` - Returns breakers with linked_devices populated
- `GET /api/breaker/:id` - Single breaker with devices
- `PUT /api/breaker/:id` - Update breaker; accepts `linkedDeviceIds` array to sync device relationships
- `GET /api/devices` - All devices
- `GET /api/device-types` - Device type options for dropdowns
- `POST /api/device` - Create device (auto-generates ID if not provided)
- `PUT /api/device/:id` - Update device
- `DELETE /api/device/:id` - Delete device (204 no content on success)
- `GET /api/search?q=<query>` - Search breakers & devices by label, notes, tags, linked items
- `GET /api/map/light-to-breaker?deviceId=<id>` - Get device with its linked breakers

### Frontend Structure

**Component Architecture:**
- `App.jsx`: Main shell with tab navigation (Dashboard, Devices, Search), state management, and modal editor
- `pages/Dashboard.jsx`: Two-column breaker panel grid (A-side left, B-side right)
- `pages/BreakerDetail.jsx`: Modal form to edit breaker label, notes, load_type, status, tags, and linked devices
- `pages/Devices.jsx`: Device CRUD interface with ability to link to breakers
- `pages/Search.jsx`: Search interface showing matching breakers and devices
- `components/BreakerCard.jsx`: Individual breaker display with slot number, label, status badge
- `components/DeviceRow.jsx`: Device list item with edit/delete actions

**State Flow:**
- App.jsx fetches breakers and devices on mount
- Breaker updates sync both breakers AND devices (bidirectional linking)
- Device create/update/delete triggers a full data refresh to re-sync relationships
- Pull-to-refresh enabled by default on mobile (localStorage key: `cc.pull_to_refresh.v1`)

**Routing:**
- Single-page app with tab-based views (no react-router)
- Modal overlays for breaker editing (backdrop dismisses modal)

### Special Patterns

**Pull-to-Refresh:**
- Implemented as a custom hook (`usePullToRefreshReload`) in App.jsx
- Detects 90px+ downward swipe when scrolled to top
- Reloads entire page (can be disabled via localStorage)

**Breaker-Device Linking:**
- When saving a breaker with `linkedDeviceIds`, dataStore automatically updates all device records to add/remove the breaker ID
- When creating/updating devices, provide `linked_breakers` or `linkedBreakers` (both accepted)
- The API normalizes camelCase (linkedBreakers) to snake_case (linked_breakers) for CSV storage

## Environment Variables

Defined in `.env.example`:
- `PORT`: Server port (default: 8080)
- `DATA_DIR`: Path to CSV storage (default: ./data or /app/data in Docker)

## Dev Server Configuration

In development, Vite (port 5173) proxies `/api/*` requests to the Express server (port 8080). This is configured in `vite.config.js` under `server.proxy`. The frontend uses relative paths (`/api/breakers`) which work in both dev (via proxy) and production (same origin).

## Common Tasks

**Adding a new API endpoint:**
1. Add route handler in `server/index.js`
2. Add dataStore function if needed in `server/dataStore.js` (handles CSV read/write)
3. Add client API call in `src/api.js`

**Modifying breaker/device schema:**
1. Update CSV column arrays in `server/dataStore.js` (breakerColumns, deviceColumns)
2. Update normalize functions (normalizeBreaker, normalizeDevice)
3. Update validation sets if adding enums (validLoadTypes, validStatuses)

**Testing the full stack:**
1. Run `pnpm run dev` to start both servers
2. Frontend at `http://localhost:5173` proxies API calls to `:8080`
3. Modify data via UI or directly edit `data/*.csv` (server auto-reloads with nodemon)
