import { describe, it, expect } from 'vitest';
import { monthsBetween, projectBalance } from './prediction';

describe('monthsBetween', () => {
  it('counts whole months forward', () => {
    expect(monthsBetween(new Date('2026-02-01'), new Date('2026-12-01'))).toBe(10);
  });
  it('never negative', () => {
    expect(monthsBetween(new Date('2026-12-01'), new Date('2026-02-01'))).toBe(0);
  });
});

describe('projectBalance', () => {
  it('adds monthly set-aside per month', () => {
    // current 43,750 total savings + 8,750/mo for 5 months
    expect(projectBalance(43750, 8750, 5)).toBe(87500);
  });
});
