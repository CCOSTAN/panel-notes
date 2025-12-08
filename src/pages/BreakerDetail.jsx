import React, { useEffect, useState } from 'react';
import { slotNumber } from '../utils/slots.js';

export default function BreakerDetail({ breaker, devices, onSave, readOnly = false, onRequestEdit }) {
  const [form, setForm] = useState(() => ({
    label: '',
    load_type: 'Unknown',
    notes: '',
    tags: [],
    linkedDeviceIds: []
  }));

  useEffect(() => {
    if (breaker) {
      setForm({
        label: breaker.label,
        load_type: breaker.load_type,
        notes: breaker.notes,
        tags: breaker.tags || [],
        linkedDeviceIds: breaker.linked_devices?.map((d) => d.id) || []
      });
    }
  }, [breaker]);

  if (!breaker) {
    return <div className="card">Select a breaker to edit.</div>;
  }

  function toggleDevice(deviceId) {
    setForm((prev) => {
      const set = new Set(prev.linkedDeviceIds);
      if (set.has(deviceId)) set.delete(deviceId);
      else set.add(deviceId);
      return { ...prev, linkedDeviceIds: Array.from(set) };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...form });
  }

  return (
    <div className="card detail-card">
      <div className="detail-header">
        <div>
          <p className="eyebrow">
            Breaker {slotNumber(breaker)}
            {breaker.side}
          </p>
          <h2>Edit breaker</h2>
        </div>
        {readOnly && (
          <button
            className="chip-button"
            type="button"
            onClick={() => {
              onRequestEdit?.();
            }}
          >
            Edit
          </button>
        )}
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Label
          <input
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            disabled={readOnly}
          />
        </label>
        <label className="full">
          Notes
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            disabled={readOnly}
          />
        </label>

        <fieldset className="breaker-select full">
          <legend>Linked devices</legend>
          <div className="breaker-select__grid">
            {devices.map((device) => (
              <label key={device.id} className="breaker-select__item">
                <input
                  type="checkbox"
                  checked={form.linkedDeviceIds.includes(device.id)}
                  onChange={() => toggleDevice(device.id)}
                  disabled={readOnly}
                />
                <span>
                  {device.name} • {device.type}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="actions full">
          <button type="submit" disabled={readOnly}>
            Save breaker
          </button>
        </div>
      </form>

      <div className="divider" />
    </div>
  );
}
