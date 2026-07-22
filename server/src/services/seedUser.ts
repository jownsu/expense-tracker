import { prisma } from "../db.js";

// The budget envelopes every new user starts with. Percentages match the
// spreadsheet this app replaces: Needs 50 / Wants 25 / Savings 25, Misc funded
// by carry-over only (percent 0).
const DEFAULT_ENVELOPES = [
  { name: "Needs", kind: "spending", percent: 50, sort: 0 },
  { name: "Wants", kind: "spending", percent: 25, sort: 1 },
  { name: "Savings", kind: "savings", percent: 25, sort: 2 },
  { name: "Misc", kind: "spending", percent: 0, sort: 3 },
] as const;

/**
 * Insert the default envelopes for a user, once. Idempotent: if the user
 * already has any envelope, this is a no-op. Returns the user's envelopes.
 *
 * ponytail: single-user app, seeding runs on first login — a count-guard in a
 * transaction is enough. Add a @@unique([userId, name]) if concurrent seeding
 * ever becomes possible.
 */
export function seedDefaultEnvelopes(userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.envelope.count({ where: { userId } });
    if (existing > 0) {
      return tx.envelope.findMany({ where: { userId }, orderBy: { sort: "asc" } });
    }

    await tx.envelope.createMany({
      data: DEFAULT_ENVELOPES.map((e) => ({ ...e, userId })),
    });
    return tx.envelope.findMany({ where: { userId }, orderBy: { sort: "asc" } });
  });
}
