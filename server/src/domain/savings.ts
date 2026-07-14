export function accountBalance(opening: number, contributions: number[]): number {
  return opening + contributions.reduce((sum, c) => sum + c, 0);
}
export function splitSavings(
  total: number,
  splits: { accountId: string; percent: number }[],
): { accountId: string; amount: number }[] {
  const out = splits.map((s) => ({
    accountId: s.accountId,
    amount: Math.floor((s.percent / 100) * total),
  }));
  const remainder = total - out.reduce((sum, x) => sum + x.amount, 0);
  if (out.length) out[out.length - 1].amount += remainder;
  return out;
}
