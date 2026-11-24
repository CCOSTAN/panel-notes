# ⚡ Panel Notes

> A dead-simple, self-hosted web app for mapping and documenting your electrical breaker panel. Open it with a QR code. Never wonder again.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-Ready-green)](https://nodejs.org/)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
<br><img alt="Panel overview" src="https://github.com/user-attachments/assets/7f746eac-156a-4c3e-87a1-9fe119eb4d83" width="200" />
## 🎯 Why Panel Notes?

Got new garage lights? Need to know what's behind breaker B8? Panel Notes is the answer. It grew out of [this Home Assistant issue](https://github.com/CCOSTAN/Home-AssistantConfig/issues/1547) after realizing a handwritten directory on the panel door wasn't cutting it anymore.

**The goal is simple:**
- 👀 See the whole panel at a glance (odd on the left, even on the right)
- 📝 Tap or click any breaker to see its label, notes, and linked devices
- 📱 Open the app instantly from a QR code taped to the panel

<div align="center">
  <img alt="Breaker details" src="https://github.com/user-attachments/assets/69ee1785-6b18-4d0d-a0fd-d299a98c76d9" width="350" />
  <img alt="Mobile view" src="https://github.com/user-attachments/assets/a4f0c177-fd55-4eef-adc7-930c8bcac695" width="350" />
</div>

## ✨ Features

- 🔧 **40-slot GE panel layout** (1A/1B | 2A/2B style) — but easy to adapt to your setup
- 📱 **Mobile-first UI** — both sides of the panel stay visible on phones
- ✏️ **Modal editor** — breaker label + notes + linked devices, all in one place
- 📄 **CSV-backed data** — edit or back it up with any text editor
- 🔌 **Simple REST API** — ready for future integrations (Home Assistant, anyone?)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React + Vite (modern, component-based, mobile-first) |
| **Backend** | Express (Node.js) — serves API and static build |
| **Data** | Flat CSV files (breakers.csv, devices.csv) |
| **Deployment** | Docker with multi-stage build |

## 🚀 Quick Start

### With Node.js

```bash
# Clone the repo
git clone https://github.com/yourusername/panel-notes.git
cd panel-notes

# Install dependencies
npm install

# Start dev mode (Vite + API)
npm run dev

# Open:
# UI:  http://localhost:5173
# API: http://localhost:8080
```

### With Docker

```bash
# In the repo root
docker compose up --build -d

# Open http://localhost:8080
```

Data persists via bind mount (`./data:/app/data`). Change the port by setting `PORT` in `.env`.

Optional: add a photo of your real panel at `./data/actual Panel.jpg`. The app serves it at `GET /panel-photo` (also linked in the footer).

## ⚙️ Configuration

```bash
cp .env.example .env
```

**Environment Variables:**
- `PORT` – API/web port inside container (default: `8080`)
- `DATA_DIR` – CSV storage path inside container (default: `/app/data`)

## Home Assistant device picker

Open a breaker, tap **Choose from Home Assistant**, search by name, room, or model, and tap **Save breaker**. You can also start in **Lights / Devices → Add Device**. Manual entries and their existing links work with or without the catalog. Each imported device uses its Home Assistant registry ID so repeated selections reuse its Panel Notes record.

To enable the picker, run the included exporter on a trusted host with read access to the Home Assistant device, area and entity registry files. Supply the registry directory and a private output path, for example:

```sh
python3 tools/export_ha_devices.py "$HA_REGISTRY_DIR" "$CATALOG_DIR/devices.json"
```

Run the exporter periodically and mount the output directory read-only at `/catalog` in the Panel Notes service. The web app reads the catalog from `/catalog/devices.json` (override with `HA_DEVICE_CATALOG`). It contains device IDs, display names, rooms and models. Identical entries also show an entity ID or device ID suffix. Keep it on the trusted network. A failed refresh preserves the previous catalog, and the picker shows the last refresh time when it is over an hour old.

## 📡 API Reference

Simple endpoints, ready for integrations:

```
GET    /api/health                       # Health check
GET    /api/breakers                     # List all breakers
GET    /api/breaker/{id}                 # Get breaker details
PUT    /api/breaker/{id}                 # Update breaker
GET    /api/devices                      # List all devices
POST   /api/device                       # Create device
GET    /api/device/{id}                  # Get device details
PUT    /api/device/{id}                  # Update device
GET    /api/search?q=garage              # Search breakers/devices
GET    /api/map/light-to-breaker         # Device-to-breaker mapping
GET    /panel-photo                      # Panel door photo (from ./data)
```

## 📊 Data Model

### Breaker
```
{
  id: "A1",              # Internal ID
  side: "A",             # A or B
  row: 1,                # Row 1–20
  label: "Garage Lights",# Human-friendly
  load_type: "Lighting", # Optional type
  notes: "...",          # Free-form
  tags: "garage,lights"  # Comma-separated
}
```

### Device
```
{
  id: "D1",
  name: "Garage Light 1",
  type: "Light",
  notes: "Main fixture",
  linked_breakers: "A1,A2"
}
```

## 📲 QR Code Workflow

Here's the dream setup:

1. **Deploy** Panel Notes on a Docker host on your LAN
2. **Generate** a QR code pointing to the Panel Notes URL (e.g., `http://panel-notes.local:8080`)
3. **Print & Tape** the QR inside your panel door
4. **Scan** when working at the panel — instant access to the live map

Works in any house, lab, or workshop. 🔌

## 🤝 Contributing

We'd love your help! Check [CONTRIBUTING.md](./CONTRIBUTING.md) for ideas and guidelines.

**Ideas we'd love:**
- Layout customization for other panel types
- Home Assistant integration examples
- Mobile app wrapper
- Cloud sync option (optional)

## 📄 License

MIT – see [LICENSE](./LICENSE) for details.

---

<div align="center">
  <strong>Made with ⚡ for home automation enthusiasts everywhere</strong>
</div>

