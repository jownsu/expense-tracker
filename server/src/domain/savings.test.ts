import { describe, it, expect } from 'vitest';
import { accountBalance } from './savings';

describe('accountBalance', () => {
  it('is opening plus all contributions', () => {
    expect(accountBalance(14000, [3500])).toBe(17500);        // MP2
    expect(accountBalance(21000, [5250])).toBe(26250);        // Digital Bank
    expect(accountBalance(0, [3500, 3500, 3500])).toBe(10500);
  });
});
