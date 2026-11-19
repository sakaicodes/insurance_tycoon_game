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
function openLeaderboard(tab, city, page){
  tab = tab === "global" && onlineOk() ? "global" : (tab || (onlineOk() ? "global" : "local")); city = city || "all"; page = Math.max(0, +page || 0);
  const tabs = onlineOk() ? `<div class="seg two">${[["global","🌍 Global"],["local","📱 This device"]].map(([k, l]) => `<button class="btn" data-act="lb:${k}" aria-pressed="${tab === k}">${l}</button>`).join("")}</div>` : "";
  const cities = tab === "global" ? `<div class="seg lb-cities" style="margin-top:6px">${[["all","All"],["london","London"],["nyc","New York"],["bermuda","Bermuda"],["zurich","Zurich"]].map(([k, l]) => `<button class="btn" data-act="lb:global:${k}" aria-pressed="${city === k}">${l}</button>`).join("")}</div>` : "";
  const mine = myGlobalBest(city);
  openModal(`<div class="top"><h2>Leaderboard</h2>${xBtn}</div>${tabs}${cities}
    ${tab === "global" ? `<p class="lb-stats" id="lbStats">&nbsp;</p>
      <div id="lbGlobal"><p class="dim">Loading the global leaderboard…</p></div>
      <div class="lb-pager" id="lbPager"></div>
      ${mine ? `<button class="btn ghost" style="width:100%;margin-top:6px" data-act="lbme:${city}">⭐ Find my best run${city === "all" ? "" : " here"} (${Number(mine.score).toLocaleString("en-GB")})</button>` : ""}
      <p class="dim">Company and CEO names on the global leaderboard are public. Idle mode runs aren’t included.</p>`
    : `<p class="dim">Your 10 best runs on this device.</p>${lbTable()}`}`, {view:`lb${tab}${city}${page}`});
  if (tab !== "global") return;
  const want = `lb${tab}${city}${page}`;
  fetchStats().then(s => { if (view !== want || !s) return; const el = $("#lbStats"); if (el) el.textContent = `${Number(s.runs).toLocaleString("en-GB")} run${s.runs === 1 ? "" : "s"} played so far`; }).catch(() => {});
  fetchGlobal(city, page).then(({rows, total}) => { if (view !== want) return;
      const el = $("#lbGlobal"); if (el) el.innerHTML = globalTable(rows, page*LB_PAGE);
      const pages = Math.max(1, Math.ceil(total/LB_PAGE)), pg = $("#lbPager");
      if (pg) pg.innerHTML = total ? `<button class="btn ghost" data-act="lbp:${city}:${page - 1}" ${page <= 0 ? "disabled" : ""}>‹ Previous</button>
        <span>Showing ${page*LB_PAGE + 1}–${Math.min(total, (page + 1)*LB_PAGE)} of ${total.toLocaleString("en-GB")}<small>Page ${page + 1} of ${pages}</small></span>
        <button class="btn ghost" data-act="lbp:${city}:${page + 1}" ${page >= pages - 1 ? "disabled" : ""}>Next ›</button>` : "";
      const glow = document.querySelector("#lbGlobal tr.celebrate, #lbGlobal tr.found"); if (glow) glow.scrollIntoView({block:"center", behavior:"smooth"}); })
    .catch(() => { if (view !== want) return; const el = $("#lbGlobal"); if (el) el.innerHTML = `<p class="note">Couldn’t reach the global leaderboard right now. Check your connection, or look at your runs on this device.</p>`; });
}

/* ---------- global leaderboard (Supabase) ---------- */
const PENDING_KEY = "fineprint-pending-scores", PLAYER_KEY = "fineprint-player-id", MINE_KEY = "fineprint-my-global", CELEBRATE_KEY = "fineprint-celebrate", LB_PAGE = 20;
let lbFind = null;   // a run to highlight after "Find my best run"
function onlineOk(){ return !!(typeof ONLINE !== "undefined" && ONLINE.enabled && ONLINE.url && ONLINE.key && typeof fetch === "function"); }
function withTimeout(p, ms){ return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]); }
function playerId(){
  try { let id = localStorage.getItem(PLAYER_KEY); if (!id || !/^p_[a-z0-9]{6,40}$/.test(id)){ id = "p_" + (Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).slice(0, 26); localStorage.setItem(PLAYER_KEY, id); } return id; }
  catch(e){ return "p_" + Math.random().toString(36).slice(2, 14); }
}
function runPayload(sp){
  return {runId:S.globalId, playerId:playerId(), name:companyName(), ceo:ceoName(), city:cityId(), quarters:Math.max(1, S.quarter - 1), days:daysSurvived(),
    earned:Math.round(S.earned || 0), stars:S.stars || 0, achievements:sp.achN, rankIdx:S.rankIdx, avgMood:Math.round(sp.rep),
    exitBonus:S.exit ? Math.round(Math.sqrt(S.exit.value)*15) : 0, version:VERSION};
}
async function postScore(p){
  const r = await withTimeout(fetch(`${ONLINE.url}/functions/v1/submit-score`, {method:"POST", headers:{"content-type":"application/json", apikey:ONLINE.key}, body:JSON.stringify(p)}), 9000);
  if (!r.ok){ const err = new Error((await r.text().catch(() => "")) || String(r.status)); err.status = r.status; throw err; }
  return r.json();
}
/* Someone started a run. Counted privately (you can see it in Supabase); not shown in the game. */
function trackPlay(){ if (!onlineOk()) return; postScore({type:"play", playerId:playerId(), city:cityId(), version:VERSION}).catch(() => {}); }
function loadPending(){ try { return JSON.parse(localStorage.getItem(PENDING_KEY)) || []; } catch(e){ return []; } }
function savePending(list){ try { localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-5))); } catch(e){} }
async function flushPending(){
  if (!onlineOk()) return; const list = loadPending(); if (!list.length) return; const keep = [];
  for (const p of list){ try { const res = await postScore(p); rememberMine(p, res); } catch(e){ if (!e.status || e.status >= 500 || e.status === 429) keep.push(p); } }
  savePending(keep);
}
function loadMine(){ try { return JSON.parse(localStorage.getItem(MINE_KEY)) || []; } catch(e){ return []; } }
function rememberMine(p, res){
  if (!res || res.score == null) return;
  const list = loadMine().filter(x => x.runId !== p.runId); list.push({runId:p.runId, name:p.name, ceo:p.ceo, city:p.city, score:res.score});
  list.sort((a, b) => b.score - a.score); try { localStorage.setItem(MINE_KEY, JSON.stringify(list.slice(0, 50))); } catch(e){}
}
function myGlobalBest(city){ return loadMine().filter(x => !city || city === "all" || x.city === city)[0] || null; }
async function submitGlobal(sp){
  if (!onlineOk()) return {skipped:"off"};
  if (S.idleMode || S.idleTainted) return {skipped:"idle"};
  if (S.globalSent) return {skipped:"sent"};
  const p = runPayload(sp);
  try {
    const res = await postScore(p); S.globalSent = true; save(); rememberMine(p, res);
    if (res.rank && res.rank <= 5){ try { localStorage.setItem(CELEBRATE_KEY, JSON.stringify({name:p.name, ceo:p.ceo, score:res.score, until:Date.now() + 15*60e3})); } catch(e){} }
    return res;
  }
  catch(e){ if (!e.status || e.status >= 500 || e.status === 429){ queuePending(p); return {queued:true}; } if (/already submitted/.test(e.message)){ S.globalSent = true; save(); return {skipped:"sent"}; } return {error:e.message}; }
}
function queuePending(p){ const list = loadPending().filter(x => x.runId !== p.runId); list.push(p); savePending(list); }
async function fetchGlobal(city, page){
  const from = (page || 0)*LB_PAGE, to = from + LB_PAGE - 1;
  const q = `${ONLINE.url}/rest/v1/scores?select=name,ceo,city,score,quarters,rank_idx,created_at&order=score.desc,created_at.asc${city && city !== "all" ? `&city=eq.${encodeURIComponent(city)}` : ""}`;
  const r = await withTimeout(fetch(q, {headers:{apikey:ONLINE.key, "Range-Unit":"items", Range:`${from}-${to}`, Prefer:"count=exact"}}), 9000);
  if (!r.ok && r.status !== 206) throw new Error(String(r.status));
  const rows = await r.json(), cr = r.headers.get("content-range") || "", total = +(cr.split("/")[1] || 0) || (from + rows.length);
  return {rows, total};
}
async function fetchStats(){
  const r = await withTimeout(fetch(`${ONLINE.url}/rest/v1/leaderboard_stats?select=runs`, {headers:{apikey:ONLINE.key}}), 9000);
  if (!r.ok) throw new Error(String(r.status)); const j = await r.json(); return j && j[0];
}
async function countAbove(score, city){
  const q = `${ONLINE.url}/rest/v1/scores?select=score&score=gt.${score}${city && city !== "all" ? `&city=eq.${encodeURIComponent(city)}` : ""}`;
  const r = await withTimeout(fetch(q, {headers:{apikey:ONLINE.key, "Range-Unit":"items", Range:"0-0", Prefer:"count=exact"}}), 9000);
  const cr = r.headers.get("content-range") || ""; return +(cr.split("/")[1] || 0) || 0;
}
async function findMyBest(city){
  const mine = myGlobalBest(city); if (!mine) return;
  try { const above = await countAbove(mine.score, city); lbFind = {name:mine.name, ceo:mine.ceo, score:mine.score}; openLeaderboard("global", city, Math.floor(above/LB_PAGE)); }
  catch(e){ toast("Couldn’t reach the global leaderboard right now."); }
}
function globalTable(rows, offset){
  if (!rows || !rows.length) return `<div class="empty"><p>No scores here yet. Finish a run to claim the top spot.</p></div>`;
  const flag = {london:"🇬🇧", nyc:"🇺🇸", bermuda:"🇧🇲", zurich:"🇨🇭"}, medal = ["🥇","🥈","🥉"];
  let cel = null; try { cel = JSON.parse(localStorage.getItem(CELEBRATE_KEY)); if (cel && cel.until < Date.now()) cel = null; } catch(e){}
  const same = (a, r) => a && r.name === a.name && r.ceo === a.ceo && Number(r.score) === Number(a.score);
  let hit = -1;
  const body = rows.map((r, k) => { const n = offset + k + 1, isCel = same(cel, r), isFound = !isCel && same(lbFind, r);
    if ((isCel || isFound) && hit < 0) hit = k;
    const cls = [isCel ? "celebrate" : "", isFound ? "found" : "", hit >= 0 && k > hit && isCel !== true && cel && same(cel, rows[hit]) ? "shove" : ""].filter(Boolean).join(" ");
    return `<tr class="${cls}" style="${cls.includes("shove") ? `animation-delay:${(k - hit)*40}ms` : ""}"><td class="rk">${n <= 3 ? medal[n - 1] : n}</td><td class="nm">${flag[r.city] || ""} ${esc(r.name)}<small>${RANKS[clamp(r.rank_idx || 0, 0, RANKS.length - 1)].name}${r.ceo ? `, led by ${esc(r.ceo)}` : ""}</small></td><td class="num">${Number(r.score).toLocaleString("en-GB")}</td><td class="num">${r.quarters}</td></tr>`; }).join("");
  if (cel && hit >= 0){ try { localStorage.removeItem(CELEBRATE_KEY); } catch(e){} }
  lbFind = null;
  return `<table class="lb global"><tr><th class="rk">#</th><th>Syndicate</th><th class="num">Score</th><th class="num">Qtrs</th></tr>${body}</table>`;
}
/* A top-5 finish: count down to the rank, drop a medal, throw confetti; a podium cutscene for #1. */
function celebrateRank(rank){
  const el = $("#globalCelebrate"); if (!el || !(rank >= 1 && rank <= 5)) return;
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "🏵️";
  const bits = Array.from({length:28}, (_, k) => `<i style="left:${(k*37)%100}%;background:${["#E3C064","#B23A3A","#2F6FE4","#3E9B4F","#C8507A"][k % 5]};animation-delay:${1.3 + (k % 7)*0.06}s;--dx:${((k*53)%60) - 30}px"></i>`).join("");
  el.innerHTML = `<div class="rank-reveal"><div class="rr-confetti">${bits}</div><div class="rr-medal">${medal}</div>
    <div class="rr-num">#<span id="rrN">${Math.max(rank + 20, 40)}</span></div>
    <div class="rr-txt">${rank === 1 ? "Number one in the world!" : rank <= 3 ? "On the podium, worldwide!" : "Top five in the world!"}</div></div>
    ${rank === 1 ? `<canvas id="podiumCv" width="240" height="135" class="podium-cv" aria-label="Your CEO on the winner’s podium"></canvas>` : ""}`;
  const start = Math.max(rank + 20, 40), t0 = performance.now(), dur = 1300;
  const tick = () => { const u = Math.min(1, (performance.now() - t0)/dur), ez = 1 - Math.pow(1 - u, 3), s = $("#rrN"); if (!s) return;
    s.textContent = Math.round(start - (start - rank)*ez); if (u < 1) requestAnimationFrame(tick); else { el.querySelector(".rank-reveal").classList.add("landed"); sfx("fanfare"); } };
  requestAnimationFrame(tick);
  if (rank === 1){ const cv = $("#podiumCv"), p0 = performance.now(); const frame = () => { if (!cv || !cv.isConnected) return; CUT.drawScene(cv.getContext("2d"), "podium", ((performance.now() - p0)/5000) % 1); requestAnimationFrame(frame); }; requestAnimationFrame(frame); }
}
