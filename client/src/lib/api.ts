const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export type Ping = { message: string; service: string };

export async function getPing(): Promise<Ping> {
  const res = await fetch(`${API_URL}/api/ping`, { credentials: "include" });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<Ping>;
}

export type Health = { ok: boolean };

export async function getHealth(): Promise<Health> {
  const res = await fetch(`${API_URL}/health`, { credentials: "include" });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<Health>;
}
