/* ui/leaderboard.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* ---------- Leaderboard (stored on this device) ---------- */
const RUNS_KEY = "fineprint-runs", NAME_KEY = "fineprint-name";
function loadRuns(){ try { return JSON.parse(localStorage.getItem(RUNS_KEY)) || []; } catch(e){ return []; } }
function saveRuns(r){ try { localStorage.setItem(RUNS_KEY, JSON.stringify(r)); } catch(e){} }
function playerName(){ try { return localStorage.getItem(NAME_KEY) || ""; } catch(e){ return ""; } }
function esc(t){ return String(t).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch])); }
function recordRun(sp, reason){
  const runs = loadRuns(), run = {id:Date.now(), name:companyName(), ceo:ceoName(), score:sp.total, grade:grade(sp.total), quarters:S.quarter - 1, title:RANKS[S.rankIdx].name, end:reason, at:Date.now()};
  runs.push(run); runs.sort((a, b) => b.score - a.score); saveRuns(runs.slice(0, 20)); return run;
}
function lbTable(hl){
  const runs = loadRuns().slice(0, 10);
  if (!runs.length) return `<div class="empty"><p>No finished runs yet. Your first one will appear here.</p></div>`;
  return `<table class="lb"><tr><th>#</th><th>Syndicate</th><th>Score</th><th>Grade</th><th>Qtrs</th></tr>${runs.map((r, k) => `<tr class="${r.id === hl ? "me" : ""}"><td>${k + 1}</td><td>${esc(r.name)}<small>${esc(r.title)}</small>${r.ceo ? `<small style="display:block;color:var(--ink-dim)">led by ${esc(r.ceo)}</small>` : ""}</td><td>${r.score.toLocaleString("en-GB")}</td><td>${r.grade}</td><td>${r.quarters}</td></tr>`).join("")}</table>`;
}
function openLeaderboard(tab, city){
  tab = tab === "global" && onlineOk() ? "global" : (tab || (onlineOk() ? "global" : "local")); city = city || "all";
  const tabs = onlineOk() ? `<div class="seg two">${[["global","🌍 Global"],["local","📱 This device"]].map(([k, l]) => `<button class="btn" data-act="lb:${k}" aria-pressed="${tab === k}">${l}</button>`).join("")}</div>` : "";
  const cities = tab === "global" ? `<div class="seg four" style="margin-top:6px">${[["all","All"],["london","London"],["nyc","New York"],["bermuda","Bermuda"]].map(([k, l]) => `<button class="btn" data-act="lb:global:${k}" aria-pressed="${city === k}">${l}</button>`).join("")}</div>` : "";
  openModal(`<div class="top"><h2>Leaderboard</h2>${xBtn}</div>${tabs}${cities}
    ${tab === "global" ? `<div id="lbGlobal"><p class="dim">Loading the global leaderboard…</p></div><p class="dim">Company and CEO names on the global leaderboard are public. Idle mode runs aren’t included.</p>` : `<p class="dim">Your 10 best runs on this device.</p>${lbTable()}`}`, {view:"lb" + tab + city});
  if (tab === "global"){ const want = "lb" + tab + city;
    fetchGlobal(city).then(rows => { if (view !== want) return; const el = $("#lbGlobal"); if (el) el.innerHTML = globalTable(rows); })
      .catch(() => { if (view !== want) return; const el = $("#lbGlobal"); if (el) el.innerHTML = `<p class="note">Couldn’t reach the global leaderboard right now. Check your connection, or look at your runs on this device.</p>`; }); }
}

/* ---------- global leaderboard (Supabase) ---------- */
const PENDING_KEY = "fineprint-pending-scores";
function onlineOk(){ return !!(typeof ONLINE !== "undefined" && ONLINE.enabled && ONLINE.url && ONLINE.key && typeof fetch === "function"); }
function withTimeout(p, ms){ return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]); }
function runPayload(sp){
  return {runId:S.globalId, name:companyName(), ceo:ceoName(), city:cityId(), quarters:Math.max(1, S.quarter - 1), days:daysSurvived(),
    earned:Math.round(S.earned || 0), stars:S.stars || 0, achievements:sp.achN, rankIdx:S.rankIdx, avgMood:Math.round(sp.rep),
    exitBonus:S.exit ? Math.round(Math.sqrt(S.exit.value)*15) : 0, version:VERSION};
}
async function postScore(p){
  const r = await withTimeout(fetch(`${ONLINE.url}/functions/v1/submit-score`, {method:"POST", headers:{"content-type":"application/json", apikey:ONLINE.key}, body:JSON.stringify(p)}), 9000);
  if (!r.ok){ const err = new Error((await r.text().catch(() => "")) || String(r.status)); err.status = r.status; throw err; }
  return r.json();
}
function loadPending(){ try { return JSON.parse(localStorage.getItem(PENDING_KEY)) || []; } catch(e){ return []; } }
function savePending(list){ try { localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-5))); } catch(e){} }
async function flushPending(){
  if (!onlineOk()) return; const list = loadPending(); if (!list.length) return; const keep = [];
  for (const p of list){ try { await postScore(p); } catch(e){ if (!e.status || e.status >= 500 || e.status === 429) keep.push(p); } }
  savePending(keep);
}
async function submitGlobal(sp){
  if (!onlineOk()) return {skipped:"off"};
  if (S.idleMode || S.idleTainted) return {skipped:"idle"};
  if (S.globalSent) return {skipped:"sent"};
  const p = runPayload(sp);
  try { const res = await postScore(p); S.globalSent = true; save(); return res; }
  catch(e){ if (!e.status || e.status >= 500 || e.status === 429){ queuePending(p); return {queued:true}; } if (/already submitted/.test(e.message)){ S.globalSent = true; save(); return {skipped:"sent"}; } return {error:e.message}; }
}
function queuePending(p){ const list = loadPending().filter(x => x.runId !== p.runId); list.push(p); savePending(list); }
async function fetchGlobal(city){
  const q = `${ONLINE.url}/rest/v1/scores?select=name,ceo,city,score,quarters,rank_idx,created_at&order=score.desc&limit=20${city && city !== "all" ? `&city=eq.${encodeURIComponent(city)}` : ""}`;
  const r = await withTimeout(fetch(q, {headers:{apikey:ONLINE.key}}), 9000);
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}
function globalTable(rows){
  if (!rows || !rows.length) return `<div class="empty"><p>No scores here yet. Finish a run to claim the top spot.</p></div>`;
  const flag = {london:"🇬🇧", nyc:"🇺🇸", bermuda:"🇧🇲"}, mine = companyName();
  return `<table class="lb"><tr><th>#</th><th>Syndicate</th><th>Score</th><th>Qtrs</th></tr>${rows.map((r, k) => `<tr class="${r.name === mine && r.ceo === ceoName() ? "me" : ""}"><td>${k + 1}</td><td>${flag[r.city] || ""} ${esc(r.name)}<small>${RANKS[clamp(r.rank_idx || 0, 0, RANKS.length - 1)].name}${r.ceo ? `, led by ${esc(r.ceo)}` : ""}</small></td><td>${Number(r.score).toLocaleString("en-GB")}</td><td>${r.quarters}</td></tr>`).join("")}</table>`;
}
