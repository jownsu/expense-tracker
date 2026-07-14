import { describe, it, expect } from 'vitest';
import { accountBalance, splitSavings } from './savings';

describe('accountBalance', () => {
  it('is opening plus all contributions', () => {
    expect(accountBalance(14000, [3500])).toBe(17500);        // MP2
    expect(accountBalance(21000, [5250])).toBe(26250);        // Digital Bank
    expect(accountBalance(0, [3500, 3500, 3500])).toBe(10500);
  });
});

describe('splitSavings', () => {
  it('splits by percent (40/60 of 8750)', () => {
    expect(splitSavings(8750, [
      { accountId: 'mp2', percent: 40 },
      { accountId: 'db', percent: 60 },
    ])).toEqual([
      { accountId: 'mp2', amount: 3500 },
      { accountId: 'db', amount: 5250 },
    ]);
  });
  it('loses no peso to rounding', () => {
    const r = splitSavings(100, [
      { accountId: 'a', percent: 33 },
      { accountId: 'b', percent: 33 },
      { accountId: 'c', percent: 34 },
    ]);
    expect(r.reduce((s, x) => s + x.amount, 0)).toBe(100);
  });
});
