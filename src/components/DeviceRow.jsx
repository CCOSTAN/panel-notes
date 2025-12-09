import React, { useState, useMemo } from 'react';
import { slotNumber } from '../utils/slots.js';

export default function DeviceRow({ device, breakers = [], onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSelection, setPickerSelection] = useState(new Set());
  const [form, setForm] = useState({
    name: device.name,
    type: device.type,
    notes: device.notes,
    linked_breakers: device.linked_breakers || []
  });

  const breakerList = useMemo(() => {
    return breakers
      .slice()
      .sort((a, b) => {
        const aNum = Number(a.row) * 2 - (a.side === 'A' ? 1 : 0);
        const bNum = Number(b.row) * 2 - (b.side === 'A' ? 1 : 0);
        return aNum - bNum;
      })
      .map((b) => ({
        id: b.id,
        label: `${slotNumber(b)}${b.side} • ${b.label}`
      }));
  }, [breakers]);

  function togglePicker(id) {
    setPickerSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function applyPicker() {
    if (!pickerSelection.size) {
      setShowPicker(false);
      return;
    }
    setForm((prev) => ({
      ...prev,
      linked_breakers: Array.from(new Set([...prev.linked_breakers, ...pickerSelection]))
    }));
    setPickerSelection(new Set());
    setShowPicker(false);
  }

  function removeBreaker(id) {
    setForm((prev) => ({
      ...prev,
      linked_breakers: prev.linked_breakers.filter((b) => b !== id)
    }));
  }

  async function handleSave() {
    await onUpdate(device.id, {
      name: form.name,
      type: form.type,
      notes: form.notes,
      linked_breakers: form.linked_breakers
    });
    setEditing(false);
  }

  const linkedLabels = (form.linked_breakers || []).map((id) => {
    const found = breakerList.find((b) => b.id === id);
    return found ? found.label : id;
  });

  return (
    <div className="device-row card">
      {editing ? (
        <div className="form-grid">
          <label>
            Name
            <input name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            Type
            <input name="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          </label>
          <label>
            Notes
            <textarea name="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>

          <fieldset className="breaker-select full">
            <legend>Linked breakers</legend>
            {linkedLabels.length ? (
              <div className="pill-list">
                {linkedLabels.map((label, idx) => (
                  <span key={label} className="pill">
                    {label}
                    <button
                      type="button"
                      className="pill-remove"
                      onClick={() => removeBreaker(form.linked_breakers[idx])}
                      aria-label={`Remove ${label}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="muted">No breakers linked.</p>
            )}
            <div className="actions">
              <button type="button" className="chip-button" onClick={() => setShowPicker(true)}>
                Choose breakers
              </button>
            </div>
          </fieldset>

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
            {linkedLabels.length ? linkedLabels.map((label) => <span key={label} className="pill">{label}</span>) : <span className="muted">No breaker link</span>}
          </div>
          <div className="actions">
            <button className="ghost" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button className="ghost" onClick={() => onDelete?.(device.id)}>
              Delete
            </button>
          </div>
        </div>
      )}

      {showPicker && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setShowPicker(false);
            setPickerSelection(new Set());
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="modal-close">
              <button
                className="ghost"
                type="button"
                onClick={() => {
                  setShowPicker(false);
                  setPickerSelection(new Set());
                }}
              >
                Close
              </button>
            </div>
            <div className="card-header">
              <div>
                <p className="eyebrow">Select breakers</p>
                <h3>Choose breakers for {device.name}</h3>
              </div>
            </div>
            <div className="breaker-select__grid" style={{ padding: '0 var(--space-md) var(--space-md)' }}>
              {breakerList.map((b) => (
                <label key={b.id} className="breaker-select__item">
                  <input
                    type="checkbox"
                    checked={pickerSelection.has(b.id) || form.linked_breakers.includes(b.id)}
                    onChange={() => togglePicker(b.id)}
                  />
                  <span>{b.label}</span>
                </label>
              ))}
            </div>
            <div className="actions" style={{ padding: 'var(--space-md)' }}>
              <button type="button" className="ghost" onClick={() => setShowPicker(false)}>
                Cancel
              </button>
              <button type="button" onClick={applyPicker} disabled={pickerSelection.size === 0}>
                Add selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
