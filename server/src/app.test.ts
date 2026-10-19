import { afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "./app.js";
import { auth } from "./auth.js";

describe("GET /health", () => {
  it("responds 200 with { ok: true }", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe("GET /api/ping", () => {
  it("responds 200 with a pong payload", async () => {
    const res = await request(app).get("/api/ping");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "pong", service: "expense-tracker-api" });
  });
});

describe("GET /api/test (protected)", () => {
  afterEach(() => vi.restoreAllMocks());

  it("responds 401 without a session", async () => {
    const res = await request(app).get("/api/test");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });

  it("responds 200 with the user when a session exists", async () => {
    const user = { id: "u1", email: "me@example.com", name: "Me" };
    vi.spyOn(auth.api, "getSession").mockResolvedValue({ session: {}, user } as never);

    const res = await request(app).get("/api/test");

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual(user);
  });

  it("responds 500 with a generic body (no stack) when the session check throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(auth.api, "getSession").mockRejectedValue(new Error("db down at /secret/path"));

    const res = await request(app).get("/api/test");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal error" });
    expect(res.text).not.toContain("/secret/path");
  });
});

describe("security headers", () => {
  it("sets helmet headers and hides X-Powered-By", async () => {
    const res = await request(app).get("/health");

    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });
});
