import React, { useState } from 'react';
import { slotNumber } from '../utils/slots.js';

export default function SearchPage({ results, onSearch, onSelectBreaker }) {
  const [query, setQuery] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    onSearch(query);
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Search</p>
          <h2>Find breakers or devices</h2>
        </div>
      </div>
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          placeholder="Search garage sconces, breaker A1…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <div className="stack gap-md">
        <section>
          <p className="eyebrow">Breakers</p>
          {results.breakers?.length ? (
            <div className="chip-row">
              {results.breakers.map((b) => (
                <button key={b.id} className="chip" onClick={() => onSelectBreaker(b.id)}>
                  #{slotNumber(b)} • {b.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="muted">No breaker matches.</p>
          )}
        </section>

        <section>
          <p className="eyebrow">Devices</p>
          {results.devices?.length ? (
            <div className="chip-row">
              {results.devices.map((d) => (
                <span key={d.id} className="chip subtle">
                  {d.name} • {d.type}
                </span>
              ))}
            </div>
          ) : (
            <p className="muted">No device matches.</p>
          )}
        </section>
      </div>
    </div>
  );
}
