import { describe, it, expect } from 'vitest';
import { envelopeBudget, envelopeLeft } from './envelope';

describe('envelopeBudget', () => {
  it('sizes by percent of income', () => {
    expect(envelopeBudget(50, 35000)).toBe(17500); // Needs
    expect(envelopeBudget(25, 35000)).toBe(8750);  // Wants / Savings
  });
  it('adds carried-in leftovers (Misc has percent 0)', () => {
    expect(envelopeBudget(0, 35000, 4677)).toBe(4677);
  });
});

describe('envelopeLeft', () => {
  it('is budget minus spent', () => {
    expect(envelopeLeft(17500, 17330)).toBe(170); // Needs left, Feb
    expect(envelopeLeft(8750, 8175)).toBe(575);   // Wants left, Feb
  });
});
