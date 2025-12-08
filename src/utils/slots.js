export function slotNumber(breaker) {
  if (!breaker) return '';
  // Show sequential numbers per side (1A, 1B ... 20A/B)
  return breaker.row;
}
