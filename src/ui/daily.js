/* ui/daily.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* Daily challenge runs live in their own save slot (DAILY_KEY), so the player's main company is never touched. */
function dailyLocal(){ try { const d = JSON.parse(localStorage.getItem(DAILY_BEST_KEY)) || {}; return d.day === dailyDate() ? d : {day:dailyDate(), attempts:0, best:null}; } catch(e){ return {day:dailyDate(), attempts:0, best:null}; } }
function saveDailyLocal(d){ try { localStorage.setItem(DAILY_BEST_KEY, JSON.stringify(d)); } catch(e){} }
function dailySaved(){ try { const s = JSON.parse(localStorage.getItem(DAILY_KEY)); return s && s.daily && s.daily.day === dailyDate() && !s.over ? s : null; } catch(e){ return null; } }
function dailyBetter(a, b){ if (!b) return true; return dailyRankKey(a) > dailyRankKey(b); }
function dailyRankKey(x){ return x.format === "race" ? (x.finished ? 1e9 - x.quarters*1e6 + x.score : x.progress*1e6) : x.score; }
function dailyResultText(x){ if (!x) return "No attempt yet"; return x.format === "race" ? (x.finished ? `Target hit in ${x.quarters} quarter${x.quarters === 1 ? "" : "s"}` : `${Math.round(x.progress*100)}% of the target`) : `${Number(x.score).toLocaleString("en-GB")}${x.objectiveMet ? " (objective met)" : ""}`; }
function nextDailyIn(){ const now = new Date(), next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1), m = Math.max(0, Math.round((next - now)/60000)); return `${Math.floor(m/60)}h ${m % 60}m`; }
function dailyCardHtml(){
  const spec = dailySpec(dailyDate()), f = DAILY_FORMATS[spec.format], tw = DAILY_TWISTS[spec.twist], loc = dailyLocal(), resume = dailySaved();
  const when = new Date(spec.day + "T12:00:00Z").toLocaleDateString("en-GB", {weekday:"long", day:"numeric", month:"long", timeZone:"UTC"});
  return `<div class="dc-card">
    <div class="dc-top"><span class="dc-kicker">Daily challenge</span><span class="dc-dim">⏱ New in ${nextDailyIn()}</span></div>
    <h3>${when}</h3>
    <div class="dc-tags"><span class="dc-tag ${f.cls}">${f.name}</span><span class="dc-tag">${CITIES[spec.city].flag} ${CITIES[spec.city].name}</span><span class="dc-tag dc-twist">Twist: ${tw.name.toLowerCase()}</span></div>
    <p class="dc-goal"><b>Goal:</b> ${dailyGoalText(spec)} <span class="dc-dim">${tw.desc}</span></p>
    <div class="dc-stats"><div><span>Your best today</span><b>${dailyResultText(loc.best)}</b></div><div><span>Attempts</span><b>${loc.attempts}</b></div></div>
    <button class="btn" style="width:100%" data-act="daily:${resume ? "resume" : "start"}">${resume ? "Resume today’s attempt" : loc.attempts ? "Try again" : "Play today’s challenge"}</button>
    <p class="dc-dim" style="text-align:center;margin:6px 0 0">Same company, start and disasters for everyone. Your best attempt counts${onlineOk() ? " on the daily leaderboard" : ""}. Your main company is kept safe.</p>
    ${onlineOk() ? `<div class="dc-mini" id="dailyMini"><p class="dc-dim">Loading today’s leaders…</p></div>` : ""}
  </div>`;
}
function loadDailyMini(){ const el = $("#dailyMini"); if (!el || !onlineOk()) return;
  fetchDaily(dailyDate(), 0, 3).then(({rows, total}) => { const e2 = $("#dailyMini"); if (!e2) return;
    e2.innerHTML = rows.length ? `<div class="dc-mini-head"><span>Today’s leaders</span><span>${total} player${total === 1 ? "" : "s"}</span></div>${rows.map((r, k) => `<div class="dc-mini-row"><span>${k + 1} ${esc(r.name)}</span><span>${dailyResultText({format:r.format, finished:r.finished, quarters:r.quarters, progress:r.progress, score:r.score, objectiveMet:r.objective_met})}</span></div>`).join("")}` : `<p class="dc-dim">No one has finished today’s challenge yet. Be the first.</p>`; })
  .catch(() => { const e2 = $("#dailyMini"); if (e2) e2.innerHTML = ""; }); }
function resetView(){ W = []; CUST = []; popT = []; elev.init = false; S.floors.forEach((f, i) => rebuildWorkers(i)); prevCount = 0; prevLevels = []; pendingBottom = true; lastKey = ""; setCity(cityId()); }
function startDaily(resume){
  const saved = resume && dailySaved();
  if (!saved){
    if (!S.ceo || !S.ceo.name){ if (typeof readSetupInputs === "function" && $("#ceoName")) readSetupInputs(); }
    const name = (S.ceo && S.ceo.name) || String((setupDraft && setupDraft.name) || "").replace(/[<>]/g, "").trim().slice(0, 20);
    if (!name){ toast("Give your CEO a name first, then take on the daily challenge.", "bad"); const n = $("#ceoName"); if (n) n.focus(); return; }
    const ceo = S.ceo && S.ceo.name ? S.ceo : Object.assign({}, setupDraft, {name}), company = S.companyName || String((setupDraft && setupDraft.company) || "").trim().slice(0, 28) || "Fine Print Syndicate";
    if (!S.daily) save();
    const spec = dailySpec(dailyDate()), loc = dailyLocal(); loc.attempts++; saveDailyLocal(loc);
    S = newState(); S.seen = true; S.setupDone = true; S.ceo = ceo; S.companyName = company; S.city = spec.city; S.daily = Object.assign({attempt:loc.attempts}, spec);
    if (spec.twist === "richstart") S.cash *= 3;
    if (spec.twist === "happy") S.happy = 90;
    if (spec.twist === "treaty") S.floors.forEach(f => { if (f.type === "sales") f.spec = "treaty"; });
  } else S = saved;
  resetView(); modalLocked = false; closeModal(); save(); sfx("chime");
  const f = DAILY_FORMATS[S.daily.format];
  openModal(`<p class="fb-kicker">Daily challenge</p><h2>${f.name}: ${CITIES[S.daily.city].name}</h2>
    <p><b>Goal:</b> ${dailyGoalText(S.daily)}</p><p class="note"><b>Twist:</b> ${DAILY_TWISTS[S.daily.twist].name}. ${DAILY_TWISTS[S.daily.twist].desc}</p>
    <p class="dim">The run ends after 12 quarters${S.daily.format === "race" ? " or as soon as you hit the target" : ""}. Idle mode is off. You can leave at any time from the Boardroom’s Daily tab, and your main company will be waiting.</p>
    <div class="closeRow"><button class="btn" data-act="close">${saved ? "Carry on" : "Let’s go"}</button></div>`, {view:"dailybrief"});
}
function exitDaily(){
  if (S.daily && !S.over) save();
  S = load() || newState(); S.savedAt = Date.now();   // the main company was paused, so the daily doesn’t count as time away
  modalLocked = false; closeModal(); resetView(); save();
  toast(S.setupDone ? `Back at ${companyName()}. Everything is just as you left it.` : "Back to the start.", "good");
  if (!S.setupDone) setTimeout(openSetup, 60);
}
function dailyProgress(){ const d = S.daily; if (!d) return 0; return d.format === "race" ? clamp((S.dailyProfit || 0)/d.target, 0, 1) : clamp((S.quarter - 1)/DAILY_Q, 0, 1); }
function dailyHud(){
  let el = $("#dailyBar");
  if (!S.daily || S.over || !S.setupDone){ if (el) el.remove(); return; }
  if (!el){ el = document.createElement("div"); el.id = "dailyBar"; el.className = "daily-bar"; document.body.appendChild(el); }
  const hud = document.querySelector(".hud"), d = S.daily, q = Math.min(S.quarter, DAILY_Q);
  el.style.top = ((hud ? hud.getBoundingClientRect().bottom : 0) + 6) + "px";
  const extra = d.format === "race" ? `${fmt(Math.max(0, S.dailyProfit || 0))} of ${fmt(d.target)}` : d.format === "objective" ? (DAILY_OBJECTIVES[d.objective].test() ? "Objective on track ✓" : "Objective not met yet") : DAILY_TWISTS[d.twist].name;
  layoutOverlays();
  el.innerHTML = `<span>📅 Daily: quarter ${q} of ${DAILY_Q}</span><span>${extra}</span><i style="width:${Math.round((d.format === "race" ? dailyProgress() : (S.quarter - 1)/DAILY_Q)*100)}%"></i>`;
}
/* Stack everything that floats under the HUD so nothing covers the daily bar: the bar, then the update banner, then toasts. */
function layoutOverlays(){
  const hud = document.querySelector(".hud"); let y = (hud ? hud.getBoundingClientRect().bottom : 0) + 6, any = false;
  for (const id of ["dailyBar", "updBanner"]){ const el = document.getElementById(id); if (el){ el.style.top = y + "px"; y += el.offsetHeight + 6; any = true; } }
  const t = document.getElementById("toasts"); if (t) t.style.top = any ? y + "px" : "";
}
setInterval(() => { try { dailyHud(); layoutOverlays(); } catch(e){} }, 1000);
/* the end of a daily run: work out the result, keep the best, and post it */
function dailyOver(reason){
  const d = S.daily, sp = scoreParts(), met = d.format === "objective" && DAILY_OBJECTIVES[d.objective].test();
  const finished = d.format === "race" && (S.dailyProfit || 0) >= d.target;
  const quarters = Math.max(1, Math.min(DAILY_Q, d.done ? d.done.quarters : S.quarter - 1));
  const res = {format:d.format, score:Math.round(sp.total*(met ? 1.5 : 1)), quarters, finished, progress:dailyProgress(), objectiveMet:met};
  const loc = dailyLocal(), improved = dailyBetter(res, loc.best); if (improved){ loc.best = res; saveDailyLocal(loc); }
  S.over = true; S.overReason = reason; save();
  const head = reason === "daily" ? (finished ? "Target hit!" : "Daily challenge complete") : reason === "fired" ? "Fired before the finish" : reason === "bankrupt" ? "Bankrupt before the finish" : reason === "licence" ? "Licence revoked before the finish" : "Daily challenge over";
  if (reason === "daily" && (finished || met)) fxConfetti(); else sfx(reason === "daily" ? "chime" : "lose");
  openModal(`<p class="fb-kicker">Daily challenge</p><h2>${head}</h2>
    <div class="dc-result">${d.format === "race" ? (finished ? `<b>${quarters} quarter${quarters === 1 ? "" : "s"}</b><span>to reach ${fmt(d.target)} profit</span>` : `<b>${Math.round(res.progress*100)}%</b><span>of the ${fmt(d.target)} target</span>`)
      : `<b>${res.score.toLocaleString("en-GB")}</b><span>${d.format === "objective" ? (met ? "including the 1.5× objective bonus" : "objective not met, so no bonus") : "final score"}</span>`}</div>
    <p class="${improved ? "pos" : "dim"}">${improved ? (loc.attempts > 1 ? "A new personal best for today." : "Your first result today.") : `Your best today is still ${dailyResultText(loc.best)}.`}</p>
    ${onlineOk() ? `<p class="dim" id="dailyStatus">Sending your result to today’s leaderboard…</p>` : ""}
    <div class="seg"><button class="btn ghost" data-act="daily:exit">Back to my company</button><button class="btn" data-act="daily:start">Try again</button></div>
    ${onlineOk() ? `<div class="closeRow" style="justify-content:flex-start"><button class="btn ghost" data-act="lb:daily">📅 Today’s leaderboard</button></div>` : ""}`, {locked:true, view:"dailyover"});
  if (onlineOk()) submitDaily(res).then(r => { const el = $("#dailyStatus"); if (!el) return;
    el.textContent = r && r.rank ? `You’re number ${r.rank} of ${r.players} today${r.best ? "" : " (your earlier attempt was better)"}.` : r && r.queued ? "Couldn’t reach the leaderboard. Your best is saved on this device." : r && r.error ? `The leaderboard didn’t accept this result (${r.error}).` : ""; });
}
