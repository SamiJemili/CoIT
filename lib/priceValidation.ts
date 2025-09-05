export function parsePositiveNumber(input: string): number | null {
  const val = parseFloat(input);
  return Number.isFinite(val) && val > 0 ? val : null;
}