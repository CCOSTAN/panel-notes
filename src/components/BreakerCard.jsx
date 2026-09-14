import React from 'react';
import { slotNumber } from '../utils/slots.js';

export default function BreakerCard({ breaker, selected, onOpen }) {
  if (!breaker) return null;
  const displayNumber = `${slotNumber(breaker)}${breaker.side}`;

  return (
    <button
      className={`breaker-card ${selected ? 'selected' : ''}`}
      onClick={() => onOpen?.(breaker.id)}
      aria-pressed={selected}
    >
      <div className="breaker-card__header">
        <span className="breaker-card__slot">{displayNumber}</span>
      </div>
      <div className="breaker-card__label">{breaker.label || 'Unnamed'}</div>
    </button>
  );
}
