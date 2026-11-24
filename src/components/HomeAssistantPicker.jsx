import React, { useEffect, useId, useRef, useState } from 'react';
import { getHomeAssistantCatalog } from '../api.js';

export default function HomeAssistantPicker({ excludedIds, onPick }) {
  const [open, setOpen] = useState(false);
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(12);
  const [attempt, setAttempt] = useState(0);
  const trigger = useRef(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    let active = true;
    getHomeAssistantCatalog().then(
      data => { if (active) setCatalog(data); },
      err => { if (active) setError(err.message); }
    );
    return () => { active = false; };
  }, [open, attempt]);

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  const words = query.toLowerCase().trim().split(/\s+/);
  const matches = (catalog?.devices || []).filter(device => {
    if (excludedIds.has('HA-' + device.id)) return false;
    const text = [device.name, device.area, device.model, device.hint].join(' ').toLowerCase();
    return words.every(word => text.includes(word));
  });

  return (
    <div className="ha-picker">
      <button type="button" className="ghost" ref={trigger} aria-expanded={open}
        aria-controls={listId} onClick={() => {
          if (open) return close();
          setError(''); setCatalog(null); setQuery(''); setLimit(12); setOpen(true);
        }}>
        {open ? 'Close device search' : 'Choose from Home Assistant'}
      </button>
      {open && <div id={listId} className="ha-picker__panel" onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); close(); }
      }}>
        <label>Search Home Assistant devices
          <input type="search" autoFocus autoComplete="off" placeholder="Name, room, or model"
            value={query} onChange={event => { setQuery(event.target.value); setLimit(12); }}
            onKeyDown={event => { if (event.key === 'Enter') event.preventDefault(); }} />
        </label>
        {error ? <div role="alert">{error} <button type="button" className="ghost"
          onClick={() => { setError(''); setAttempt(n => n + 1); }}>Retry</button></div> :
          !catalog ? <p role="status">Loading devices…</p> : <>
            {Date.now() - Date.parse(catalog.updatedAt) > 3600000 &&
              <p className="muted">Last refreshed {new Date(catalog.updatedAt).toLocaleString()}.</p>}
            <p className="muted" role="status">{matches.length ? `${matches.length} available` : 'No matching devices.'}</p>
            <div className="ha-picker__results">
              {matches.slice(0, limit).map(device => <button type="button" className="ghost ha-picker__result"
                key={device.id} onClick={() => { onPick(device); close(); }}>
                <strong>{device.name}</strong>
                <small>{[device.area, device.model, device.hint].filter(Boolean).join(' · ')}</small>
              </button>)}
              {matches.length > limit && <button type="button" className="ghost"
                onClick={() => setLimit(n => n + 12)}>Show more devices</button>}
            </div>
          </>}
      </div>}
    </div>
  );
}
