import { readFile } from 'node:fs/promises';

export async function getHomeAssistantCatalog() {
  try {
    const file = process.env.HA_DEVICE_CATALOG || '/catalog/devices.json';
    const catalog = JSON.parse(await readFile(file, 'utf8'));
    if (!Array.isArray(catalog.devices) || !Number.isFinite(Date.parse(catalog.updatedAt))) {
      throw new Error('Invalid catalog');
    }
    return catalog;
  } catch {
    throw Object.assign(new Error('Home Assistant devices are temporarily unavailable.'), { status: 503 });
  }
}

export function panelDeviceId(registryId) {
  if (typeof registryId !== 'string' || !/^[a-f0-9]{32}$/.test(registryId)) {
    throw Object.assign(new Error('Invalid Home Assistant device.'), { status: 400 });
  }
  return 'HA-' + registryId;
}

export async function findHomeAssistantDevices(ids) {
  if (!ids.length) return [];
  const { devices } = await getHomeAssistantCatalog();
  const byId = new Map(devices.map(device => [device.id, device]));
  return ids.map(id => {
    const device = byId.get(id);
    if (!device) {
      throw Object.assign(new Error('This device is no longer in Home Assistant. Reopen the picker.'), { status: 409 });
    }
    return { id: panelDeviceId(id), name: device.name, type: 'Device', notes: '', linked_breakers: [] };
  });
}
