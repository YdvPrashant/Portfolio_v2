import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

/* The like counter.

   The Vercel Marketplace integration provisions KV_REST_API_URL and
   KV_REST_API_TOKEN, while Redis.fromEnv() looks for UPSTASH_REDIS_REST_*, so
   the client is built explicitly. It is built lazily: Next evaluates module
   scope while collecting routes, and the constructor throws when the
   credentials are missing, which would break `next build` without the env. */

const COUNT_KEY = "likes:count";
const VISITOR_KEY = "likes:visitors";
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

const unavailable = () => NextResponse.json({ count: 0, liked: false, ready: false });

export async function GET() {
  const redis = db();
  if (!redis) return unavailable();
  try {
    const id = (await cookies()).get(COOKIE)?.value;
    const [count, member] = await Promise.all([
      redis.get<number>(COUNT_KEY),
      id ? redis.sismember(VISITOR_KEY, id) : Promise.resolve(0),
    ]);
    return NextResponse.json({ count: count ?? 0, liked: member === 1, ready: true });
  } catch {
    return unavailable();
  }
}

export async function POST() {
  const redis = db();
  if (!redis) return unavailable();

  try {
    const jar = await cookies();
    let id = jar.get(COOKIE)?.value;
    const fresh = !id;
    if (!id) id = crypto.randomUUID();

    /* Two guards with different jobs. The visitor set is the real one: a
       browser can only ever add one like. The hourly cap per IP is a loose
       backstop against scripted fresh cookies; homes and phone networks share
       addresses, so it is generous. */
    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const ipKey = `likes:ip:${ip}`;
    const attempts = await redis.incr(ipKey);
    if (attempts === 1) await redis.expire(ipKey, 3600);

    let count = (await redis.get<number>(COUNT_KEY)) ?? 0;
    if (attempts <= PER_IP_PER_HOUR) {
      const added = await redis.sadd(VISITOR_KEY, id);
      if (added === 1) count = await redis.incr(COUNT_KEY);
    }

    const res = NextResponse.json({ count, liked: true, ready: true });
    if (fresh) {
      res.cookies.set(COOKIE, id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365 * 2,
        path: "/",
      });
    }
    return res;
  } catch {
    return unavailable();
  }
}
