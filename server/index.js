import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import {
  createDevice,
  getBreaker,
  getBreakersWithDevices,
  getDevice,
  getDevices,
  getLightToBreakerMap,
  searchEntities,
  updateBreaker,
  updateDevice
} from './dataStore.js';
import { deleteDevice } from './dataStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 8080;
const distPath = path.resolve(__dirname, '..', 'dist');
const indexFile = path.join(distPath, 'index.html');
const hasBuiltClient = fs.existsSync(indexFile);

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'panel-notes', timestamp: new Date().toISOString() });
});

app.get('/api/breakers', async (_req, res) => {
  const breakers = await getBreakersWithDevices();
  res.json(breakers);
});

app.get('/api/breaker/:id', async (req, res) => {
  const breaker = await getBreaker(req.params.id);
  if (!breaker) return res.status(404).json({ error: 'Breaker not found' });
  res.json(breaker);
});

app.put('/api/breaker/:id', async (req, res) => {
  const breaker = await updateBreaker(req.params.id, req.body);
  if (!breaker) return res.status(404).json({ error: 'Breaker not found' });
  res.json(breaker);
});

app.get('/api/devices', async (_req, res) => {
  const devices = await getDevices();
  res.json(devices);
});

app.post('/api/device', async (req, res) => {
  if (!req.body?.name) return res.status(400).json({ error: 'name is required' });
  const device = await createDevice(req.body);
  res.status(201).json(device);
});

app.get('/api/device/:id', async (req, res) => {
  const device = await getDevice(req.params.id);
  if (!device) return res.status(404).json({ error: 'Device not found' });
  res.json(device);
});

app.put('/api/device/:id', async (req, res) => {
  const device = await updateDevice(req.params.id, req.body);
  if (!device) return res.status(404).json({ error: 'Device not found' });
  res.json(device);
});

app.delete('/api/device/:id', async (req, res) => {
  const ok = await deleteDevice(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Device not found' });
  res.status(204).send();
});

app.get('/api/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json({ breakers: [], devices: [] });
  const results = await searchEntities(q);
  res.json(results);
});

app.get('/api/map/light-to-breaker', async (req, res) => {
  const { deviceId } = req.query;
  const mapping = await getLightToBreakerMap(deviceId);
  if (!mapping) return res.status(404).json({ error: 'Mapping not found' });
  res.json(mapping);
});

app.use(express.static(distPath));
app.get('*', (_req, res) => {
  if (!hasBuiltClient) {
    return res
      .status(200)
      .send('Panel Notes API is running. Build the client with "npm run build" to serve the UI from /dist.');
  }
  res.sendFile(indexFile);
});

app.listen(PORT, () => {
  console.log(`Panel Notes server listening on ${PORT}`);
});
