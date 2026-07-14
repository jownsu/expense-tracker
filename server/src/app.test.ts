import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "./app.js";

describe("GET /health", () => {
  it("responds 200 with { ok: true }", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
