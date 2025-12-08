import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { nanoid } from 'nanoid';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const BREAKERS_FILE = path.join(DATA_DIR, 'breakers.csv');
const DEVICES_FILE = path.join(DATA_DIR, 'devices.csv');

const breakerColumns = ['id', 'side', 'row', 'label', 'load_type', 'status', 'notes', 'tags'];
const deviceColumns = ['id', 'name', 'type', 'notes', 'linked_breakers'];
const validLoadTypes = new Set(['Lighting', 'Outlet', 'Appliance', 'HVAC', 'Unknown']);
const validStatuses = new Set(['Active', 'Spare']);

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function parseCsv(content) {
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
}

async function readCsv(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return parseCsv(content);
}

async function writeCsv(filePath, records, columns) {
  const output = stringify(records, { header: true, columns });
  await fs.writeFile(filePath, output, 'utf8');
}

function normalizeBreaker(row) {
  return {
    id: row.id,
    side: row.side,
    row: Number(row.row),
    label: row.label,
    load_type: validLoadTypes.has(row.load_type) ? row.load_type : 'Unknown',
    status: validStatuses.has(row.status) ? row.status : 'Active',
    notes: row.notes || '',
    tags: (row.tags || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  };
}

function normalizeDevice(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    notes: row.notes || '',
    linked_breakers: (row.linked_breakers || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
  };
}

async function getBreakers() {
  await ensureDataDir();
  const rows = await readCsv(BREAKERS_FILE);
  const breakers = rows.map(normalizeBreaker);
  breakers.sort((a, b) => (a.side === b.side ? a.row - b.row : a.side.localeCompare(b.side)));
  return breakers;
}

export async function getDevices() {
  await ensureDataDir();
  const rows = await readCsv(DEVICES_FILE);
  const devices = rows.map(normalizeDevice);
  devices.sort((a, b) => a.name.localeCompare(b.name));
  return devices;
}

async function saveBreakers(breakers) {
  await ensureDataDir();
  const rows = breakers.map((b) => ({
    id: b.id,
    side: b.side,
    row: b.row,
    label: b.label,
    load_type: b.load_type,
    status: b.status,
    notes: b.notes || '',
    tags: (b.tags || []).join(',')
  }));
  await writeCsv(BREAKERS_FILE, rows, breakerColumns);
}

async function saveDevices(devices) {
  await ensureDataDir();
  const rows = devices.map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    notes: d.notes || '',
    linked_breakers: (d.linked_breakers || []).join(',')
  }));
  await writeCsv(DEVICES_FILE, rows, deviceColumns);
}

export async function getBreakersWithDevices() {
  const [breakers, devices] = await Promise.all([getBreakers(), getDevices()]);
  const linkedLookup = devices.reduce((acc, device) => {
    device.linked_breakers.forEach((breakerId) => {
      if (!acc[breakerId]) acc[breakerId] = [];
      acc[breakerId].push({ id: device.id, name: device.name, type: device.type });
    });
    return acc;
  }, {});

  return breakers.map((breaker) => ({
    ...breaker,
    linked_devices: linkedLookup[breaker.id] || []
  }));
}

export async function getBreaker(id) {
  const breakers = await getBreakersWithDevices();
  return breakers.find((b) => b.id === id);
}

export async function getDevice(id) {
  const devices = await getDevices();
  return devices.find((d) => d.id === id);
}

export async function updateBreaker(id, payload) {
  const [breakers, devices] = await Promise.all([getBreakers(), getDevices()]);
  const idx = breakers.findIndex((b) => b.id === id);
  if (idx === -1) return null;

  const incomingTags = Array.isArray(payload.tags)
    ? payload.tags
    : (payload.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

  breakers[idx] = {
    ...breakers[idx],
    label: payload.label ?? breakers[idx].label,
    load_type: payload.load_type && validLoadTypes.has(payload.load_type) ? payload.load_type : breakers[idx].load_type,
    status: payload.status && validStatuses.has(payload.status) ? payload.status : breakers[idx].status,
    notes: payload.notes ?? breakers[idx].notes,
    tags: incomingTags.length ? incomingTags : breakers[idx].tags
  };

  if (payload.linkedDeviceIds) {
    const linkedSet = new Set(payload.linkedDeviceIds);
    devices.forEach((device) => {
      const hasLink = linkedSet.has(device.id);
      const existing = new Set(device.linked_breakers);
      if (hasLink) {
        existing.add(id);
      } else {
        existing.delete(id);
      }
      device.linked_breakers = Array.from(existing);
    });
  }

  await Promise.all([saveBreakers(breakers), saveDevices(devices)]);
  return getBreaker(id);
}

export async function createDevice(payload) {
  const devices = await getDevices();
  const id = payload.id || `DEV-${nanoid(6)}`;
  const linked_breakers = (payload.linked_breakers || payload.linkedBreakers || [])
    .map((b) => b.trim())
    .filter(Boolean);

  const device = {
    id,
    name: payload.name,
    type: payload.type,
    notes: payload.notes || '',
    linked_breakers
  };

  devices.push(device);
  await saveDevices(devices);

  if (linked_breakers.length) {
    await updateBreakerLinksFromDevice(device);
  }

  return device;
}

async function updateBreakerLinksFromDevice(device) {
  const breakers = await getBreakers();
  const lookup = new Set(device.linked_breakers);
  breakers.forEach((breaker) => {
    const tags = new Set(breaker.tags);
    if (lookup.has(breaker.id)) {
      tags.add('devices');
      breaker.tags = Array.from(tags);
    }
  });
  await saveBreakers(breakers);
}

export async function updateDevice(id, payload) {
  const devices = await getDevices();
  const idx = devices.findIndex((d) => d.id === id);
  if (idx === -1) return null;

  const linked_breakers = Array.isArray(payload.linked_breakers)
    ? payload.linked_breakers
    : Array.isArray(payload.linkedBreakers)
    ? payload.linkedBreakers
    : (payload.linked_breakers || '')
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean);

  devices[idx] = {
    ...devices[idx],
    name: payload.name ?? devices[idx].name,
    type: payload.type ?? devices[idx].type,
    notes: payload.notes ?? devices[idx].notes,
    linked_breakers
  };

  await saveDevices(devices);
  return devices[idx];
}

export async function searchEntities(query) {
  const q = query.toLowerCase();
  const [breakers, devices] = await Promise.all([getBreakersWithDevices(), getDevices()]);

  const breakerMatches = breakers.filter((b) => {
    return (
      b.label.toLowerCase().includes(q) ||
      b.notes.toLowerCase().includes(q) ||
      b.tags.some((t) => t.toLowerCase().includes(q)) ||
      b.linked_devices.some((d) => d.name.toLowerCase().includes(q))
    );
  });

  const deviceMatches = devices.filter((d) => {
    return (
      d.name.toLowerCase().includes(q) ||
      d.type.toLowerCase().includes(q) ||
      d.notes.toLowerCase().includes(q) ||
      d.linked_breakers.some((id) => id.toLowerCase().includes(q))
    );
  });

  return { breakers: breakerMatches, devices: deviceMatches };
}

export async function getLightToBreakerMap(deviceId) {
  if (!deviceId) return null;
  const device = await getDevice(deviceId);
  if (!device) return null;
  const breakers = await getBreakersWithDevices();
  const linked = breakers.filter((b) => device.linked_breakers.includes(b.id));
  return { device, breakers: linked };
}
