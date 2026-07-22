import { afterAll, beforeAll, expect, test } from "vitest";
import { prisma } from "../db.js";
import { seedDefaultEnvelopes } from "./seedUser.js";

let userId: string;

beforeAll(async () => {
  // Better Auth generates User.id itself, so the model has no DB default —
  // a direct create in a test must supply one.
  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name: "Seed Test",
      email: `seed-test-${Date.now()}@example.test`,
    },
  });
  userId = user.id;
});

afterAll(async () => {
  // Cascade delete removes the seeded envelopes with the user.
  await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
});

test("seeds exactly the 4 default envelopes, idempotently", async () => {
  await seedDefaultEnvelopes(userId);
  await seedDefaultEnvelopes(userId); // second call must not duplicate

  const envelopes = await prisma.envelope.findMany({
    where: { userId },
    orderBy: { sort: "asc" },
  });

  expect(envelopes).toHaveLength(4);
  expect(envelopes.map((e) => [e.name, e.kind, e.percent])).toEqual([
    ["Needs", "spending", 50],
    ["Wants", "spending", 25],
    ["Savings", "savings", 25],
    ["Misc", "spending", 0],
  ]);
});
