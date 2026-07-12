// Small runtime guards shared across the egress engine. The engine is the
// safety-critical core, so every public function validates its numeric inputs
// rather than silently propagating NaN or negative values into a density figure.

export function ensureFiniteNonNegative(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be a finite number >= 0, received ${value}`);
  }
  return value;
}

export function ensurePositive(value: number, label: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label} must be a finite number > 0, received ${value}`);
  }
  return value;
}
