import { cookies, headers } from "next/headers";
import { Redis } from "@upstash/redis";

/* Counts that each browser adds to once: the likes, and the address taken off
   the contact flyer. Used only by the route handlers in app/api.

   The Vercel Marketplace integration provisions KV_REST_API_URL and
   KV_REST_API_TOKEN, while Redis.fromEnv() looks for UPSTASH_REDIS_REST_*, so
   the client is built explicitly. It is built lazily: Next evaluates module
   scope while collecting routes, and the constructor throws when the
   credentials are missing, which would break `next build` without the env.

   A browser is known by a random id in the pv cookie, shared by every count.
   Two guards with different jobs: the visitor set is the real one, since a
   browser can only ever be added once. The hourly cap per IP is a loose
   backstop against scripted fresh cookies; homes and phone networks share
   addresses, so it is generous. */

const COOKIE = "pv";
const PER_IP_PER_HOUR = 10;

let client: Redis | null = null;

function db(): Redis | null {
  if (client) return client;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  client = new Redis({ url, token });
  return client;
}

/** `mine` is whether this browser has added to the count. `ready` is false
    when the store is missing or failed, and the count means nothing. */
export type Tally = { count: number; mine: boolean; ready: boolean };

const unavailable: Tally = { count: 0, mine: false, ready: false };

/** Keys live under the scope: `<scope>:count`, `<scope>:visitors` and
    `<scope>:ip:<address>`. */
export async function readTally(scope: string): Promise<Tally> {
  const redis = db();
  if (!redis) return unavailable;
  try {
    const id = (await cookies()).get(COOKIE)?.value;
    const [count, member] = await Promise.all([
      redis.get<number>(`${scope}:count`),
      id ? redis.sismember(`${scope}:visitors`, id) : Promise.resolve(0),
    ]);
    return { count: count ?? 0, mine: member === 1, ready: true };
  } catch {
    return unavailable;
  }
}

/** Adds this browser to the count unless it is already in it. */
export async function addOnce(scope: string): Promise<Tally> {
  const redis = db();
  if (!redis) return unavailable;
  try {
    const jar = await cookies();
    const id = jar.get(COOKIE)?.value ?? crypto.randomUUID();

    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const ipKey = `${scope}:ip:${ip}`;
    const attempts = await redis.incr(ipKey);
    if (attempts === 1) await redis.expire(ipKey, 3600);

    let count = (await redis.get<number>(`${scope}:count`)) ?? 0;
    if (attempts <= PER_IP_PER_HOUR) {
      const added = await redis.sadd(`${scope}:visitors`, id);
      if (added === 1) count = await redis.incr(`${scope}:count`);
    }

    if (!jar.has(COOKIE)) {
      jar.set(COOKIE, id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365 * 2,
        path: "/",
      });
    }
    return { count, mine: true, ready: true };
  } catch {
    return unavailable;
  }
}
