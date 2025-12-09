import React, { useEffect, useMemo, useState } from 'react';
import { slotNumber } from '../utils/slots.js';

export default function BreakerDetail({ breaker, devices, onSave, readOnly = false, onRequestEdit }) {
  const [form, setForm] = useState(() => ({
    label: '',
    load_type: 'Unknown',
    notes: '',
    tags: [],
    linkedDeviceIds: []
  }));
  const [showDevicePicker, setShowDevicePicker] = useState(false);
  const [pickerSelection, setPickerSelection] = useState(new Set());

  useEffect(() => {
    if (breaker) {
      setForm({
        label: breaker.label,
        load_type: breaker.load_type,
        notes: breaker.notes,
        tags: breaker.tags || [],
        linkedDeviceIds: breaker.linked_devices?.map((d) => d.id) || []
      });
      setPickerSelection(new Set());
    }
  }, [breaker]);

  if (!breaker) {
    return <div className="card">Select a breaker to edit.</div>;
  }

  const linkedDevices = useMemo(
    () => devices.filter((d) => form.linkedDeviceIds.includes(d.id)),
    [devices, form.linkedDeviceIds]
  );

  const unassignedDevices = useMemo(
    () =>
      devices.filter((d) => {
        const linked = d.linked_breakers || [];
        const alreadyLinkedHere = form.linkedDeviceIds.includes(d.id);
        return !alreadyLinkedHere && linked.length === 0;
      }),
    [devices, form.linkedDeviceIds]
  );

  function removeDevice(deviceId) {
    setForm((prev) => ({
      ...prev,
      linkedDeviceIds: prev.linkedDeviceIds.filter((id) => id !== deviceId)
    }));
  }

  function handlePickerToggle(id) {
    setPickerSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handlePickerAdd() {
    if (!pickerSelection.size) return;
    setForm((prev) => ({
      ...prev,
      linkedDeviceIds: Array.from(new Set([...prev.linkedDeviceIds, ...pickerSelection]))
    }));
    setPickerSelection(new Set());
    setShowDevicePicker(false);
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
          {linkedDevices.length === 0 ? (
            <p className="muted">No devices linked.</p>
          ) : (
            <div className="pill-list">
              {linkedDevices.map((device) => (
                <span key={device.id} className="pill">
                  {device.name} • {device.type}
                  {!readOnly && (
                    <button
                      type="button"
                      className="pill-remove"
                      onClick={() => removeDevice(device.id)}
                      aria-label={`Remove ${device.name}`}
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}
          {!readOnly && (
            <div className="actions">
              <button
                type="button"
                className="chip-button"
                disabled={unassignedDevices.length === 0}
                onClick={() => setShowDevicePicker(true)}
              >
                Add devices{unassignedDevices.length ? ` (${unassignedDevices.length})` : ''}
              </button>
            </div>
          )}
        </fieldset>

        <div className="actions full">
          <button type="submit" disabled={readOnly}>
            Save breaker
          </button>
        </div>
      </form>

      <div className="divider" />

      {showDevicePicker && !readOnly && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setShowDevicePicker(false);
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
                  setShowDevicePicker(false);
                  setPickerSelection(new Set());
                }}
              >
                Close
              </button>
            </div>
            <div className="card-header">
              <div>
                <p className="eyebrow">Unassigned devices</p>
                <h3>Link devices to this breaker</h3>
              </div>
            </div>
            {unassignedDevices.length === 0 ? (
              <p className="muted" style={{ padding: '0 var(--space-md) var(--space-md)' }}>
                No unassigned devices available.
              </p>
            ) : (
              <div className="breaker-select__grid" style={{ padding: '0 var(--space-md) var(--space-md)' }}>
                {unassignedDevices.map((device) => (
                  <label key={device.id} className="breaker-select__item">
                    <input
                      type="checkbox"
                      checked={pickerSelection.has(device.id)}
                      onChange={() => handlePickerToggle(device.id)}
                    />
                    <span>
                      {device.name} • {device.type}
                    </span>
                  </label>
                ))}
              </div>
            )}
            <div className="actions" style={{ padding: 'var(--space-md)' }}>
              <button type="button" className="ghost" onClick={() => setShowDevicePicker(false)}>
                Cancel
              </button>
              <button type="button" onClick={handlePickerAdd} disabled={pickerSelection.size === 0}>
                Add selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
