// Fine Print Syndicate: accepts a finished run, checks it, recomputes the score, and saves it.
// Deploy: npx supabase functions deploy submit-score --no-verify-jwt --use-api
import { createClient } from "jsr:@supabase/supabase-js@2";

// Where the game is allowed to submit from. Add a localhost address here if you test locally.
const ALLOWED = ["https://sakaicodes.github.io", "http://localhost:8080", "http://127.0.0.1:8080"];

function corsFor(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED.includes(origin) ? origin : ALLOWED[0],
    "Access-Control-Allow-Headers": "content-type, authorization, apikey",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

Deno.serve(async (req) => {
  const cors = corsFor(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("POST only", { status: 405, headers: cors });
  const bad = (msg: string, status = 400) => new Response(msg, { status, headers: cors });

  let r: any;
  try { r = await req.json(); } catch { return bad("invalid JSON"); }

  // plausibility checks: reject runs that couldn't have happened
  const num = (v: unknown) => typeof v === "number" && Number.isFinite(v);
  if (!r.runId || typeof r.runId !== "string" || r.runId.length > 64) return bad("bad run id");
  if (!["london", "nyc", "bermuda"].includes(r.city)) return bad("bad city");
  if (![r.quarters, r.days, r.earned, r.stars, r.achievements, r.rankIdx, r.avgMood].every(num)) return bad("missing fields");
  if (r.quarters < 1 || r.quarters > 500) return bad("bad quarters");
  if (r.rankIdx < 0 || r.rankIdx > 6 || r.achievements < 0 || r.achievements > 150) return bad("implausible");
  // days include the quarter the run ended in, so allow one quarter more than were completed
  if (r.stars > (r.quarters + 1) * 3 || r.earned > (r.quarters + 1) * 5e7 || r.days > (r.quarters + 1) * 92) return bad("implausible");

  // recompute the score with the game's own formula instead of trusting the client
  const money = Math.round(Math.sqrt(Math.max(0, r.earned)) * 8), days = Math.max(0, Math.round(r.days)) * 4;
  const exit = num(r.exitBonus) ? Math.max(0, Math.round(r.exitBonus)) : 0;
  const bonus = Math.round(r.stars) * 40 + Math.round(r.achievements) * 150 + Math.round(r.rankIdx) * 400 + exit;
  const score = Math.round((money + days + bonus) * (0.5 + Math.min(100, Math.max(0, r.avgMood)) / 100));

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // rate limit: at most 5 submissions per IP per hour (only a hash of the IP is stored)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  const hash = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
  const { count } = await db.from("scores").select("*", { count: "exact", head: true })
    .eq("ip_hash", hash).gte("created_at", new Date(Date.now() - 3600e3).toISOString());
  if ((count ?? 0) >= 5) return bad("too many submissions, try again later", 429);

  const clean = (v: unknown, max: number) => String(v ?? "").replace(/[<>]/g, "").trim().slice(0, max);
  const { error } = await db.from("scores").insert({
    run_id: r.runId, name: clean(r.name, 28) || "Anonymous Syndicate", ceo: clean(r.ceo, 20),
    city: r.city, score, quarters: Math.round(r.quarters), rank_idx: Math.round(r.rankIdx),
    version: clean(r.version, 12), ip_hash: hash,
  });
  if (error) return bad(error.code === "23505" ? "run already submitted" : error.message);

  return new Response(JSON.stringify({ score }), { headers: { ...cors, "content-type": "application/json" } });
});
