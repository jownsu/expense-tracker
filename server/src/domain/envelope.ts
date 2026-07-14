export function envelopeBudget(percent: number, income: number, carriedIn = 0): number {
  return Math.round((percent / 100) * income) + carriedIn;
}
export function envelopeLeft(budget: number, spent: number): number {
  return budget - spent;
}
