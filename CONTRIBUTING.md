# Contributing to Panel Notes

Thanks for checking out Panel Notes! This project is intentionally small and hackable so you can adapt it to your own panel and network.

## How to run locally

```bash
npm install
npm run dev
# API will listen on PORT (default 8080), Vite on 5173
```

or via Docker:

```bash
docker compose up --build -d
# open http://localhost:8080
```

Configuration lives in `.env` (copy from `.env.example`). Data is just CSV in `./data`.

## Pull requests

- Keep changes focused and small when possible.
- Avoid committing real-world secrets or IPs; use placeholders or `.env`.
- If you add fields to the CSV, update the README and UI to match.
- Prefer mobile-first changes; the app is often used via QR at the panel.

## Issue ideas

- New layout options (subpanels, multiple panels).
- Better search/filter for devices and breakers.
- Home Assistant API integration to pick entities from a dropdown.

If you build something cool on top of this, feel free to open an issue and share screenshots or ideas.
