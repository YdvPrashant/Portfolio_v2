import { NextResponse } from "next/server";
import { addOnce, readTally, type Tally } from "@/lib/counter";

/* How many people have torn a tab off the contact flyer: one per browser,
   however many tabs it tears. The store and its guards are in lib/counter.ts.

   Only the production deployment counts for real. Previews and next dev count
   under their own key, so trying the flyer out never moves the number. */

const SCOPE = process.env.VERCEL_ENV === "production" ? "taken" : "taken:dev";

const reply = (t: Tally) => NextResponse.json({ count: t.count, took: t.mine, ready: t.ready });

export async function GET() {
  return reply(await readTally(SCOPE));
}

export async function POST() {
  return reply(await addOnce(SCOPE));
}
