import React from 'react';
import { slotNumber } from '../utils/slots.js';

export default function BreakerCard({ breaker, selected, onSelect, onEdit }) {
  if (!breaker) return null;
  const displayNumber = `${slotNumber(breaker)}${breaker.side}`;

  return (
    <button
      className={`breaker-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect?.(breaker.id)}
      onDoubleClick={() => onEdit?.(breaker.id)}
      aria-pressed={selected}
    >
      <div className="breaker-card__header">
        <span className="breaker-card__slot">{displayNumber}</span>
      </div>
      <div className="breaker-card__label">{breaker.label || 'Unnamed'}</div>
      {breaker.linked_devices?.length ? (
        <div className="breaker-card__devices">
          {breaker.linked_devices.map((dev) => (
            <span key={dev.id} className="pill">
              {dev.name}
            </span>
          ))}
        </div>
      ) : (
        <div className="breaker-card__muted">No devices linked</div>
      )}
    </button>
  );
}
