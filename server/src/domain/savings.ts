export function accountBalance(opening: number, contributions: number[]): number {
  return opening + contributions.reduce((sum, c) => sum + c, 0);
}
