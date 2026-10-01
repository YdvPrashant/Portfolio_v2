import { NextResponse } from "next/server";
import { addOnce, readTally, type Tally } from "@/lib/counter";

/* The like counter: one like per browser. The store and its guards are in
   lib/counter.ts. */

const SCOPE = "likes";

const reply = (t: Tally) => NextResponse.json({ count: t.count, liked: t.mine, ready: t.ready });

export async function GET() {
  return reply(await readTally(SCOPE));
}

export async function POST() {
  return reply(await addOnce(SCOPE));
}
