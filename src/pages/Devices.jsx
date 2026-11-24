import React, { useMemo, useState } from 'react';
import HomeAssistantPicker from '../components/HomeAssistantPicker.jsx';
import DeviceRow from '../components/DeviceRow.jsx';
import { slotNumber } from '../utils/slots.js';

export default function DevicesPage({
  breakers = [],
  devices = [],
  onCreateDevice,
  onUpdateDevice,
  onDeleteDevice,
  onSelectBreaker
}) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: '', notes: '', linkedBreakers: [] });

  const breakerList = useMemo(
    () =>
      breakers
        .slice()
        .sort((a, b) => {
          // odd (left) then even (right), preserving row order
          const aNum = Number(a.row) * 2 - (a.side === 'A' ? 1 : 0);
          const bNum = Number(b.row) * 2 - (b.side === 'A' ? 1 : 0);
          return aNum - bNum;
        })
        .map((b) => ({
          id: b.id,
          label: `${slotNumber(b)}${b.side} • ${b.label}`
        })),
    [breakers]
  );

  function closeForm() {
    setOpen(false);
    setSaveError('');
    setForm({ name: '', type: '', notes: '', linkedBreakers: [] });
  }

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
    if (saving) return;
    setSaving(true);
    setSaveError('');
    const payload = {
      homeAssistantDeviceId: form.homeAssistantDeviceId,
      name: form.name,
      type: form.type || 'Device',
      notes: form.notes,
      linkedBreakers: form.linkedBreakers
    };
    try {
      await onCreateDevice(payload);
      closeForm();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
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
          <button onClick={() => open ? closeForm() : setOpen(true)}>{open ? 'Close' : 'Add Device'}</button>
        </div>
        {open && (
          <form className="form-grid" onSubmit={handleCreate}>
            <HomeAssistantPicker excludedIds={new Set(devices.map(d => d.id))}
              onPick={device => setForm(prev => ({ ...prev, name: device.name, homeAssistantDeviceId: device.id }))} />
            {form.homeAssistantDeviceId && <button type="button" className="ghost"
              onClick={() => setForm(prev => ({ ...prev, name: '', homeAssistantDeviceId: undefined }))}>
              Clear Home Assistant selection
            </button>}
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
                {breakerList.map((b) => (
                  <label key={b.id} className="breaker-select__item">
                    <input
                      type="checkbox"
                      checked={form.linkedBreakers.includes(b.id)}
                      onChange={() => toggleBreaker(b.id)}
                    />
                    <span>{b.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="actions">
              <button type="button" className="ghost" onClick={closeForm}>
                Cancel
              </button>
              {saveError && <p role="alert">{saveError}</p>}
              <button type="submit" disabled={saving}>Create</button>
            </div>
          </form>
        )}
      </div>

      <div className="stack gap-md">
        {devices.length === 0 && <div className="muted">No devices yet.</div>}
        {devices.map((device) => (
          <DeviceRow
            key={device.id}
            device={device}
            breakers={breakers}
            onUpdate={onUpdateDevice}
            onDelete={onDeleteDevice}
            onSelectBreaker={onSelectBreaker}
          />
        ))}
      </div>
    </div>
  );
}
