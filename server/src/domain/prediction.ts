export function monthsBetween(from: Date, to: Date): number {
  const months =
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  return Math.max(0, months);
}
export function projectBalance(current: number, monthlySetAside: number, months: number): number {
  return current + monthlySetAside * months;
}
