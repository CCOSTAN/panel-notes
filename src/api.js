const API_BASE = '';

async function fetchJson(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export async function getBreakers() {
  return fetchJson('/api/breakers');
}

export async function getBreaker(id) {
  return fetchJson(`/api/breaker/${id}`);
}

export async function saveBreaker(id, payload) {
  return fetchJson(`/api/breaker/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function getDevices() {
  return fetchJson('/api/devices');
}

export async function createDevice(payload) {
  return fetchJson('/api/device', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateDevice(id, payload) {
  return fetchJson(`/api/device/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function searchEntities(query) {
  return fetchJson(`/api/search?q=${encodeURIComponent(query)}`);
}
