/* game/endings.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
function gameOver(reason){
  reason = reason || "bankrupt";
  if (perk("parachute") && reason !== "exit"){
    delete S.perks.parachute;
    S.cash = Math.max(S.cash, 0); S.conf = Math.max(S.conf, 35); S.strikes = Math.min(S.strikes, maxStrikes() - 1);
    fxConfetti(); save();
    openModal(`<h2>Golden parachute deployed</h2><p>You were about to be ${reason === "bankrupt" ? "bankrupt" : reason === "fired" ? "fired" : "shut down"}, but your golden parachute saved you. Cash, confidence and warnings have been patched up, just this once.</p>
      <div class="closeRow"><button class="btn" data-act="close">Never again</button></div>`, {locked:true});
    return;
  }
  if (!S.overCut && scene && !window.__bot && CAREER_CUTS[reason]){
    S.overCut = true; S.over = true; save(); if (modalOpen){ modalLocked = false; closeModal(); }
    const cc = CAREER_CUTS[reason]; playCutscene(typeof cc.kind === "function" ? cc.kind() : cc.kind, () => gameOver(reason), Object.assign({}, cc.opts(), {}));
    return;
  }
  const e = ENDINGS[reason]; if (reason !== "exit") sfx("lose");
  const spR = scoreParts(); let run = S.runId ? loadRuns().find(r => r.id === S.runId) : null;
  if (!run && !S.idleMode && !S.idleTainted){ run = recordRun(spR, reason); S.runId = run.id; }
  const sp = scoreParts(), prevBest = bestScore(), isNew = !S.idleMode && sp.total > prevBest;
  if (isNew) saveBest(sp.total);
  S.over = true; save();
  openModal(`<h2>${e.title}</h2>
    <p>${e.text}</p>
    ${scoreHtml(sp, Math.max(prevBest, sp.total), isNew)}
    <div class="facts">
      <div class="fact"><span>Quarters survived</span><b>${S.quarter-1}</b></div>
      <div class="fact"><span>CEO</span><b style="font-size:15px">${ceoN()}</b></div>
      <div class="fact"><span>Best title</span><b style="font-size:15px">${RANKS[S.rankIdx].name}</b></div>
      <div class="fact"><span>Stars earned</span><b>${S.stars} ★</b></div>
      <div class="fact"><span>Achievements</span><b>${ACH.filter(a => S.ach[a.id]).length} of ${ACH.length}</b></div>
    </div>
    ${S.idleMode || S.idleTainted || !run ? `<p class="note">This run used idle mode, so the board made some of the decisions and the score isn’t recorded.</p>` : `<h3>Leaderboard</h3>
    ${onlineOk() ? `<p class="dim" id="globalStatus">Sending your score to the global leaderboard…</p>` : ""}
    <div class="lbname"><input id="lbName" maxlength="24" placeholder="Name your syndicate" value="${esc(run.name)}" aria-label="Your name on the leaderboard"><button class="btn ghost" data-act="lbname:${run.id}">Save name</button></div>
    <div id="lbArea">${lbTable(run.id)}</div>`}
    ${onlineOk() && run ? `<div class="closeRow" style="justify-content:flex-start"><button class="btn ghost" data-act="lb:global">🌍 Global leaderboard</button></div>` : ""}
    <button class="btn" style="width:100%;margin-top:12px" data-act="restart-yes">Start a new company</button>`, {locked:true});
  if (run && onlineOk()) submitGlobal(sp).then(res => { const el = $("#globalStatus"); if (!el) return;
    el.textContent = res.score != null ? `Your score is on the global leaderboard as ${companyName()}, led by ${ceoName()}. Names there are public.`
      : res.queued ? "Couldn’t reach the global leaderboard. Your score will be sent next time you play online."
      : res.skipped === "sent" ? "This run is already on the global leaderboard."
      : res.error ? `The global leaderboard didn’t accept this run (${res.error}).` : ""; });
}
function coverCost(k, prem){ return Math.round(Math.max(60, prem*COVERS[k].rate)*(perk("reinsdisc") ? 0.75 : 1)); }
function blackSwan(kind){ if (!SWANS[kind]) kind = pick(SWAN_POOL); S.swanDone = true; S.cyc = Math.PI/2; playCutscene(kind, () => swanResolve(kind)); }
function swanResolve(kind){
  const sw = SWANS[kind];
  let body;
  if (!sw.cover){
    const drop = 0.3*Math.max(0.4, 1 - 0.1*lv("ir"));
    S.stock = Math.max(0.5, S.stock*(1 - drop)); S.conf = clamp(S.conf - Math.round(10*prDamp()), 0, 100);
    const il = lv("invest") ? Math.round(invCapital()*INV[S.invRisk || 0].crash) : 0; if (il){ S.cash -= il; S.q.other += il; }
    body = `<p>Your share price fell ${Math.round(drop*100)}%. ${lv("ir") ? "Capital Relations softened the blow." : "Capital Relations could have softened the blow."} Board confidence fell.${il ? ` Your ${INV[S.invRisk || 0].name.toLowerCase()} investments lost ${fmt(il)}.` : ""}</p>`;
  } else {
    const gross = Math.round(Math.max(2000, baseIncome()*Q_LEN*rand(2.2, 3.4)*(1 + 0.03*Math.max(0, workFloors() - 10))*(1 + 0.1*Math.max(0, S.diff - 2))));
    const mit = sw.mit(), afterMit = Math.round(gross*(1 - mit)), riskCut = Math.min(0.2, 0.04*lv("risk")), net = Math.round(afterMit*(1 - riskCut));
    const covered = S.cover[sw.cover];
    const loss = covered ? Math.round(net*0.1) : net;
    spend(loss, "other");
    if (covered){ S.swansSurvived = (S.swansSurvived || 0) + 1; S.conf = clamp(S.conf - 3, 0, 100); } S.swanKinds = Object.assign(S.swanKinds || {}, {[kind]: true}); if (!covered) S.swanNaked = (S.swanNaked || 0) + 1;
    else S.conf = clamp(S.conf - Math.round(25*prDamp()), 0, 100);
    body = `<table class="ledger">
      <tr><td>Total loss</td><td class="neg">−${fmt(gross)}</td></tr>
      ${mit ? `<tr><td>Saved by ${sw.mitName}</td><td class="pos">+${fmt(gross - afterMit)}</td></tr>` : ""}
      ${riskCut ? `<tr><td>Saved by your Risk Dept</td><td class="pos">+${fmt(afterMit - net)}</td></tr>` : ""}
      ${covered ? `<tr><td>Paid by your ${COVERS[sw.cover].name.toLowerCase()}</td><td class="pos">+${fmt(net - loss)}</td></tr>` : ""}
      <tr class="total"><td>You pay</td><td class="neg">−${fmt(loss)}</td></tr></table>
      <p>${covered ? "Your cover held. You paid only the 10% retention." : `You had no ${COVERS[sw.cover].name.toLowerCase()}, so you paid the lot. Board confidence −25.`}</p>
      ${S.cash < -overdraft() ? `<p class="note">This loss is bigger than the bank will tolerate.</p>` : ""}`;
  }
  openModal(`<div class="swan"><h2>🦢 Black swan: ${sw.title}</h2><p>${sw.text}</p>${body}</div>
    <div class="closeRow"><button class="btn red" data-act="close">Brace</button></div>`, {locked:true, auto:true, onClose:() => {
      if (S.cash < -overdraft()) return gameOver("bankrupt");
      if (S.conf <= 0) return gameOver("fired");
      save(); }});
}

/* Cutscenes for the ways a run can end. */
const CAREER_CUTS = {
  fired:{kind:"fired", opts:() => ({title:`${ceoName()} has been fired`, tag:"FIRED"})},
  bankrupt:{kind:"bankrupt", opts:() => ({title:`${companyName()} is bankrupt`, tag:"BANKRUPT"})},
  licence:{kind:"licence", opts:() => ({title:"The regulator has had enough", tag:"LICENCE REVOKED"})},
  exit:{kind:() => S.exit && S.exit.kind === "pe" ? "pe" : "ipo", opts:() => S.exit && S.exit.kind === "pe"
    ? {title:`${companyName()} sold to private equity`, tag:"SOLD", tagColor:0x2E7D4F}
    : {title:`${companyName()} goes public`, tag:"IPO", tagColor:0x2E7D4F, ceo:true, line:"Ding ding! I’m now a very liquid individual."}},
};

/* ---------- selling the company, and the golden ticket it earns ---------- */
const LEGACY_KEY = "fineprint-legacy";
function loadLegacy(){ try { return JSON.parse(localStorage.getItem(LEGACY_KEY)) || {tickets:0, seed:0, stars:0}; } catch(e){ return {tickets:0, seed:0, stars:0}; } }
function saveLegacy(l){ try { localStorage.setItem(LEGACY_KEY, JSON.stringify(l)); } catch(e){} }
const EXIT_REQ = {pe:{cash:1000000, stock:150}, ipo:{cash:2500000, stock:250, conf:70}};
function exitUnlocked(){ return S.rankIdx >= 3 && S.quarter >= 8; }
function exitReady(kind){ const r = EXIT_REQ[kind]; return exitUnlocked() && S.cash >= r.cash && S.stock >= r.stock && (!r.conf || S.conf >= r.conf); }
function exitValue(){
  const h = (S.profHist || []).slice(-4), q = h.length ? h.reduce((a, b) => a + b, 0)/h.length : 0;
  const base = Math.max(0, q)*16 + Math.max(0, S.cash)*0.5 + S.floors.reduce((a, f) => a + f.level, 0)*600;
  return Math.round(base*Math.sqrt(Math.max(1, S.stock)/10)*(1 + Math.min(0.4, 0.02*S.favour)));
}
function ticketFor(value){ return {seed:Math.min(50000, Math.round(value*0.03)), stars:3}; }
function sellCompany(kind){
  if (!exitReady(kind)) return;
  const v = exitValue(), mult = kind === "ipo" ? rand(0.8, 1.6) : 1, value = Math.round(v*mult);
  S.exit = {kind, value, mult}; S.exitKind = kind;
  const leg = loadLegacy(), tk = ticketFor(value);
  leg.tickets = Math.min(4, (leg.tickets || 0) + 1); leg.seed = tk.seed; leg.stars = tk.stars; leg.lastValue = value; saveLegacy(leg);
  checkAch(); save(); closeModal(); gameOver("exit");
}

