import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

/* The like counter.

   Upstash is wired explicitly rather than through Redis.fromEnv(), because the
   Vercel integration provisions KV_REST_API_URL and KV_REST_API_TOKEN while
   fromEnv() looks for UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.

   The client is built lazily. Next evaluates module scope while collecting
   routes at build time, and the Redis constructor throws on missing
   credentials, so constructing at import would break `next build` anywhere the
   env is not yet set. */

const COUNT_KEY = "likes:count";
const VISITOR_KEY = "likes:visitors";
const COOKIE = "pv";
const PER_IP_LIMIT = 10;

let client: Redis | null = null;

function db(): Redis | null {
  if (client) return client;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  client = new Redis({ url, token });
  return client;
}

export async function GET() {
  const redis = db();
  if (!redis) return NextResponse.json({ count: 0, liked: false, ready: false });

  const id = (await cookies()).get(COOKIE)?.value;
  const [count, member] = await Promise.all([
    redis.get<number>(COUNT_KEY),
    id ? redis.sismember(VISITOR_KEY, id) : Promise.resolve(0),
  ]);

  return NextResponse.json({ count: count ?? 0, liked: member === 1, ready: true });
}

export async function POST() {
  const redis = db();
  if (!redis) return NextResponse.json({ count: 0, liked: false, ready: false });

  const jar = await cookies();
  let id = jar.get(COOKIE)?.value;
  const fresh = !id;
  if (!id) id = crypto.randomUUID();

  /* Two guards, doing different jobs. The visitor set is the real one: a given
     browser can only ever add one. The per IP hourly cap is a backstop against
     someone scripting fresh cookies, and is deliberately loose because homes,
     offices and phone networks share addresses. */
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipKey = `likes:ip:${ip}`;
  const attempts = await redis.incr(ipKey);
  if (attempts === 1) await redis.expire(ipKey, 3600);

  let count = (await redis.get<number>(COUNT_KEY)) ?? 0;

  if (attempts <= PER_IP_LIMIT) {
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
}
