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
function openLeaderboard(){ openModal(`<div class="top"><h2>Leaderboard</h2>${xBtn}</div><p class="dim">Your 10 best runs on this device.</p>${lbTable()}`, {view:"lb"}); }
