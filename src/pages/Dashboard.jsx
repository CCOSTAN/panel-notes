import React from 'react';
import BreakerCard from '../components/BreakerCard.jsx';

export default function Dashboard({ breakers, selectedId, onSelect, onEdit }) {
  // Physical layout: odd-number slots (1,3,5...) on the left, even (2,4,6...) on the right.
  // Within each number, show A then B (1A, 1B | 2A, 2B).
  const lookup = new Map(breakers.map((b) => [`${b.side}${b.row}`, b]));

  function orderedList(isLeft) {
    const ordered = [];
    for (let base = 1; base <= 20; base += 2) {
      const oddA = lookup.get(`A${base}`);
      const oddB = lookup.get(`B${base}`);
      const evenA = lookup.get(`A${base + 1}`);
      const evenB = lookup.get(`B${base + 1}`);
      if (isLeft) {
        if (oddA) ordered.push(oddA);
        if (oddB) ordered.push(oddB);
      } else {
        if (evenA) ordered.push(evenA);
        if (evenB) ordered.push(evenB);
      }
    }
    return ordered;
  }

  const left = orderedList(true);
  const right = orderedList(false);

  function renderColumn(list) {
    return list.map((breaker) => (
      <BreakerCard
        key={breaker.id}
        breaker={breaker}
        selected={breaker.id === selectedId}
        onSelect={onSelect}
        onEdit={onEdit}
      />
    ));
  }

  return (
    <div>
      <div className="grid-panel">
        <div className="grid-panel__column" aria-label="Left column (odd slots)">
          {renderColumn(left)}
        </div>
        <div className="grid-panel__column" aria-label="Right column (even slots)">
          {renderColumn(right)}
        </div>
      </div>
    </div>
  );
}
