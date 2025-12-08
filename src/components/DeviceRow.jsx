import React, { useState } from 'react';

export default function DeviceRow({ device, breakersLookup, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: device.name,
    type: device.type,
    notes: device.notes,
    linked_breakers: device.linked_breakers.join(',')
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    await onUpdate(device.id, {
      name: form.name,
      type: form.type,
      notes: form.notes,
      linked_breakers: form.linked_breakers
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    });
    setEditing(false);
  }

  const linkedLabels = device.linked_breakers.map((id) => breakersLookup[id] || id);

  return (
    <div className="device-row card">
      {editing ? (
        <div className="form-grid">
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} />
          </label>
          <label>
            Type
            <input name="type" value={form.type} onChange={handleChange} />
          </label>
          <label>
            Notes
            <textarea name="notes" value={form.notes} onChange={handleChange} />
          </label>
          <label>
            Linked breakers (comma separated ids)
            <input name="linked_breakers" value={form.linked_breakers} onChange={handleChange} />
          </label>
          <div className="actions">
            <button className="ghost" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button onClick={handleSave}>Save</button>
          </div>
        </div>
      ) : (
        <div className="device-row__view">
          <div>
            <p className="eyebrow">{device.type}</p>
            <h3>{device.name}</h3>
            {device.notes && <p className="muted">{device.notes}</p>}
          </div>
          <div className="device-row__links">
            {linkedLabels.length ? (
              linkedLabels.map((label) => (
                <span key={label} className="pill">
                  {label}
                </span>
              ))
            ) : (
              <span className="muted">No breaker link</span>
            )}
          </div>
          <div className="actions">
            <button className="ghost" onClick={() => setEditing(true)}>
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
