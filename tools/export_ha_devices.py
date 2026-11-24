"""Write a display-only Panel Notes catalog from read-only Home Assistant registries."""
import argparse
from collections import Counter
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import tempfile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("registry_directory", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    def registry(name, key):
        return json.loads((args.registry_directory / name).read_text(encoding="utf-8"))["data"][key]

    areas = {a["id"]: a["name"] for a in registry("core.area_registry", "areas")}
    devices = []
    for device in registry("core.device_registry", "devices"):
        name = device.get("name_by_user") or device.get("name")
        if not name or device.get("disabled_by") or device.get("entry_type") == "service":
            continue
        if any(kind == "portainer" for kind, _ in device.get("identifiers", [])):
            continue
        devices.append({
            "id": device["id"],
            "name": name,
            "area": areas.get(device.get("area_id"), ""),
            "model": device.get("model") or "",
        })
    # Some integrations expose identically named devices in the same room. Prefer
    # a recognizable entity ID in those results, with a registry suffix as fallback.
    def display_key(device):
        return tuple(device[k].casefold() for k in ("name", "area", "model"))

    counts = Counter(display_key(d) for d in devices)
    duplicates = {d["id"]: d for d in devices if counts[display_key(d)] > 1}
    if duplicates:
        best = {}
        for entity in registry("core.entity_registry", "entities"):
            device_id = entity.get("device_id")
            if device_id not in duplicates or entity.get("disabled_by"):
                continue
            entity_id = entity["entity_id"]
            rank = (bool(entity.get("entity_category")), len(entity_id), entity_id)
            if device_id not in best or rank < best[device_id]:
                best[device_id] = rank
        for device_id, device in duplicates.items():
            device["hint"] = best[device_id][-1] if device_id in best else "Device …" + device_id[-8:]

    devices.sort(key=lambda d: (d["name"].casefold(), d["area"].casefold(), d["id"]))
    catalog = {"updatedAt": datetime.now(timezone.utc).isoformat(), "devices": devices}
    # Same-directory replacement keeps a failed refresh from publishing a partial list.
    with tempfile.NamedTemporaryFile(dir=args.output.parent, delete=False) as temp:
        temp_path = Path(temp.name)
    try:
        temp_path.write_text(json.dumps(catalog, ensure_ascii=False), encoding="utf-8")
        temp_path.chmod(0o644)
        os.replace(temp_path, args.output)
    finally:
        temp_path.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
