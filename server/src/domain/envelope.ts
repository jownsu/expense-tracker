export function envelopeBudget(percent: number, income: number, carriedIn = 0): number {
  return Math.round((percent * income) / 100) + carriedIn;
}
export function envelopeLeft(budget: number, spent: number): number {
  return budget - spent;
}
