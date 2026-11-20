// Fine Print Syndicate: records run starts, finished runs, daily challenge results and exit-interview feedback.
// Deploy: npx supabase functions deploy submit-score --no-verify-jwt --use-api
// Optional secret (recommended): npx supabase secrets set IP_SALT=some-long-random-string
import { createClient } from "jsr:@supabase/supabase-js@2";

// Where the game is allowed to submit from. Add a localhost address here if you test locally.
const ALLOWED = ["https://sakaicodes.github.io", "http://localhost:8080", "http://127.0.0.1:8080"];
const CITIES = ["london", "nyc", "bermuda", "zurich"];

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
  const ok = (body: unknown) => new Response(JSON.stringify(body), { headers: { ...cors, "content-type": "application/json" } });

  let r: any;
  try { r = await req.json(); } catch { return bad("invalid JSON"); }

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const clean = (v: unknown, max: number) => String(v ?? "").replace(/[<>]/g, "").trim().slice(0, max);
  const playerId = typeof r.playerId === "string" && /^p_[a-z0-9]{6,40}$/.test(r.playerId) ? r.playerId : null;

  // a salted hash of the IP, used only for rate limiting (the raw IP is never stored)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const salt = Deno.env.get("IP_SALT") ?? "";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + ip));
  const hash = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
  const recent = async (table: string) => (await db.from(table).select("*", { count: "exact", head: true })
    .eq("ip_hash", hash).gte("created_at", new Date(Date.now() - 3600e3).toISOString())).count ?? 0;

  // ---- a run has started (someone created a CEO) ----
  if (r.type === "play") {
    if (!playerId) return bad("bad player id");
    if (await recent("plays") >= 30) return bad("too many plays, try again later", 429);
    const { error } = await db.from("plays").insert({ player_id: playerId, city: CITIES.includes(r.city) ? r.city : null, version: clean(r.version, 12), ip_hash: hash });
    if (error) return bad(error.message);
    return ok({ ok: true });
  }

  // ---- exit-interview feedback (anonymous: no run or player ID) ----
  if (r.type === "feedback") {
    const TAGS = ["Made me laugh", "Too easy", "Too hard", "Confusing", "Found a bug", "Want more content"];
    const REASONS = ["bankrupt", "fired", "licence", "exit", "retire", "win"];
    const rating = Number.isInteger(r.rating) && r.rating >= 0 && r.rating <= 5 ? r.rating : 0;
    const tags = Array.isArray(r.tags) ? [...new Set(r.tags.filter((t: unknown) => typeof t === "string" && TAGS.includes(t)))] : [];
    const comment = clean(r.comment, 500);
    if (!rating && !tags.length && !comment) return bad("empty feedback");
    if (await recent("feedback") >= 10) return bad("too much feedback, try again later", 429);
    const { error } = await db.from("feedback").insert({
      rating, tags, comment: comment || null, reason: REASONS.includes(r.reason) ? r.reason : null,
      quarters: typeof r.quarters === "number" && r.quarters >= 0 && r.quarters <= 500 ? Math.round(r.quarters) : null,
      city: CITIES.includes(r.city) ? r.city : null, version: clean(r.version, 12), ip_hash: hash,
    });
    if (error) return bad(error.message);
    return ok({ ok: true });
  }

  // ---- a daily challenge result: keep each player's best attempt for the day ----
  if (r.type === "daily") {
    const num = (v: unknown) => typeof v === "number" && Number.isFinite(v);
    const FORMATS = ["fixed", "race", "objective"];
    const today = new Date(), dayOk = [0, 1].map(k => new Date(today.getTime() - k*864e5).toISOString().slice(0, 10));
    if (!playerId) return bad("bad player id");
    if (typeof r.day !== "string" || !dayOk.includes(r.day)) return bad("not today's challenge");
    if (!CITIES.includes(r.city) || !FORMATS.includes(r.format)) return bad("bad challenge");
    if (![r.quarters, r.days, r.earned, r.stars, r.achievements, r.rankIdx, r.avgMood, r.progress].every(num)) return bad("missing fields");
    if (r.quarters < 1 || r.quarters > 12 || r.progress < 0 || r.progress > 1) return bad("implausible");
    if (r.stars > (r.quarters + 1) * 3 || r.earned > (r.quarters + 1) * 5e7 || r.days > (r.quarters + 1) * 92) return bad("implausible");
    const money = Math.round(Math.sqrt(Math.max(0, r.earned)) * 8), days = Math.max(0, Math.round(r.days)) * 4;
    const bonus = Math.round(r.stars) * 40 + Math.min(150, Math.round(r.achievements)) * 150 + Math.round(r.rankIdx) * 400;
    const met = r.format === "objective" && r.objectiveMet === true, finished = r.format === "race" && r.finished === true;
    const score = Math.round((money + days + bonus) * (0.5 + Math.min(100, Math.max(0, r.avgMood)) / 100) * (met ? 1.5 : 1));
    const quarters = Math.round(r.quarters);
    const rankKey = r.format === "race" ? (finished ? 1e9 - quarters * 1e6 + score : r.progress * 1e6) : score;
    if ((await db.from("daily_scores").select("*", { count: "exact", head: true }).eq("ip_hash", hash)
      .gte("updated_at", new Date(Date.now() - 3600e3).toISOString())).count! >= 30) return bad("too many attempts, try again later", 429);
    const { data: prev } = await db.from("daily_scores").select("id, rank_key, attempts").eq("day", r.day).eq("player_id", playerId).maybeSingle();
    const row = { name: clean(r.name, 28) || "Anonymous Syndicate", ceo: clean(r.ceo, 20), city: r.city, format: r.format, score, quarters, finished,
      progress: Math.round(r.progress * 1000) / 1000, objective_met: met, rank_key: rankKey, version: clean(r.version, 12), ip_hash: hash, updated_at: new Date().toISOString() };
    const best = !prev || rankKey > prev.rank_key;
    const { error } = prev
      ? await db.from("daily_scores").update(best ? { ...row, attempts: prev.attempts + 1 } : { attempts: prev.attempts + 1, updated_at: row.updated_at, ip_hash: hash }).eq("id", prev.id)
      : await db.from("daily_scores").insert({ ...row, day: r.day, player_id: playerId });
    if (error) return bad(error.message);
    const myKey = best ? rankKey : prev!.rank_key;
    const above = (await db.from("daily_scores").select("id", { count: "exact", head: true }).eq("day", r.day).gt("rank_key", myKey)).count ?? 0;
    const players = (await db.from("daily_scores").select("id", { count: "exact", head: true }).eq("day", r.day)).count ?? 1;
    return ok({ score, best, rank: above + 1, players });
  }

  // ---- a finished run ----
  // refuse scores from outdated versions: set the MIN_VERSION secret to raise the bar without redeploying
  const minVersion = Deno.env.get("MIN_VERSION") ?? "0.0.0";
  const verParts = (v: string) => String(v).split(".").map(n => parseInt(n, 10) || 0);
  const older = (a: string, b: string) => { const x = verParts(a), y = verParts(b); for (let i = 0; i < 3; i++) { if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) < (y[i] ?? 0); } return false; };
  if (older(clean(r.version, 12), minVersion)) return bad("update required", 426);
  const num = (v: unknown) => typeof v === "number" && Number.isFinite(v);
  if (!r.runId || typeof r.runId !== "string" || r.runId.length > 64) return bad("bad run id");
  if (!CITIES.includes(r.city)) return bad("bad city");
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

  if (await recent("scores") >= 5) return bad("too many submissions, try again later", 429);

  const { error } = await db.from("scores").insert({
    run_id: r.runId, player_id: playerId, name: clean(r.name, 28) || "Anonymous Syndicate", ceo: clean(r.ceo, 20),
    city: r.city, score, quarters: Math.round(r.quarters), rank_idx: Math.round(r.rankIdx),
    version: clean(r.version, 12), ip_hash: hash,
  });
  if (error) return bad(error.code === "23505" ? "run already submitted" : error.message);

  // where this run landed, worldwide and in its city
  const above = (await db.from("scores").select("id", { count: "exact", head: true }).gt("score", score)).count ?? 0;
  const aboveCity = (await db.from("scores").select("id", { count: "exact", head: true }).eq("city", r.city).gt("score", score)).count ?? 0;
  return ok({ score, rank: above + 1, cityRank: aboveCity + 1 });
});
