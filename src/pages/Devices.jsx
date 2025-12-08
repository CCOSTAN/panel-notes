import React, { useMemo, useState } from 'react';
import DeviceRow from '../components/DeviceRow.jsx';
import { slotNumber } from '../utils/slots.js';

export default function DevicesPage({ breakers, devices, onCreateDevice, onUpdateDevice }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: '', notes: '', linkedBreakers: [] });

  const breakersLookup = useMemo(
    () =>
      breakers.reduce((acc, b) => {
        acc[b.id] = `#${slotNumber(b)} • ${b.label}`;
        return acc;
      }, {}),
    [breakers]
  );

  function toggleBreaker(breakerId) {
    setForm((prev) => {
      const set = new Set(prev.linkedBreakers);
      if (set.has(breakerId)) set.delete(breakerId);
      else set.add(breakerId);
      return { ...prev, linkedBreakers: Array.from(set) };
    });
  }

  async function handleCreate(e) {
    e.preventDefault();
    const payload = {
      name: form.name,
      type: form.type || 'Device',
      notes: form.notes,
      linkedBreakers: form.linkedBreakers
    };
    const created = await onCreateDevice(payload);
    if (created) {
      setForm({ name: '', type: '', notes: '', linkedBreakers: [] });
      setOpen(false);
    }
  }

  return (
    <div className="stack gap-lg">
      <div className="card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Devices</p>
            <h2>Lights / Devices</h2>
          </div>
          <button onClick={() => setOpen(!open)}>{open ? 'Close' : 'Add Device'}</button>
        </div>
        {open && (
          <form className="form-grid" onSubmit={handleCreate}>
            <label>
              Name
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Type
              <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
            </label>
            <label>
              Notes
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </label>
            <fieldset className="breaker-select">
              <legend>Link breakers</legend>
              <div className="breaker-select__grid">
                {breakers.map((b) => (
                  <label key={b.id} className="breaker-select__item">
                    <input
                      type="checkbox"
                      checked={form.linkedBreakers.includes(b.id)}
                      onChange={() => toggleBreaker(b.id)}
                    />
                    <span>#{slotNumber(b)} • {b.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="actions">
              <button type="button" className="ghost" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="submit">Create</button>
            </div>
          </form>
        )}
      </div>

      <div className="stack gap-md">
        {devices.length === 0 && <div className="muted">No devices yet.</div>}
        {devices.map((device) => (
          <DeviceRow key={device.id} device={device} breakersLookup={breakersLookup} onUpdate={onUpdateDevice} />
        ))}
      </div>
    </div>
  );
}
