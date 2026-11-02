/* ui/panels.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* ---------- Modal ---------- */
let modalOpen = false, modalCb = null, modalLocked = false, view = null;
function openModal(html, opts = {}){
  const keepScroll = modalOpen && opts.view && opts.view === view ? $("#sheet").scrollTop : 0;
  if (document.activeElement && document.activeElement !== document.body && $("#sheet").contains(document.activeElement)) document.activeElement.blur();
  $("#sheet").className = "sheet" + (opts.cls ? " " + opts.cls : "");
  $("#sheet").innerHTML = html; $("#modal").hidden = false; $("#sheet").scrollTop = keepScroll;
  if (keepScroll){ const sh = $("#sheet"), myView = opts.view, fix = () => { if (view === myView && Math.abs(sh.scrollTop - keepScroll) > 2) sh.scrollTop = keepScroll; }; requestAnimationFrame(fix); setTimeout(fix, 50); setTimeout(fix, 150); }
  modalOpen = true; modalCb = opts.onClose || null; modalLocked = !!opts.locked; view = opts.view || null;
  clearInterval(openModal._t);
  if (opts.auto && hasExec("cos")){
    const b = $("#sheet").querySelector('[data-act="close"]'); if (b){ const label = b.textContent; let n = 6;
      b.textContent = `${label} (${n})`;
      openModal._t = setInterval(() => { if (paused) return; n--; if (n <= 0){ clearInterval(openModal._t); if (!$("#modal").hidden && $("#sheet").contains(b)) b.click(); } else b.textContent = `${label} (${n})`; }, 1000); }
  }
  const f = $("#sheet").querySelector(".btn:not(:disabled), .type:not(:disabled)"); if (f && opts.focus !== false) f.focus({preventScroll:true});
}
function closeModal(){
  if ($("#modal").hidden) return;
  $("#modal").hidden = true; modalOpen = false; view = null; clearInterval(openModal._t);
  const cb = modalCb; modalCb = null; modalLocked = false; if (cb) cb();
}
$("#modal").addEventListener("click", e => { if (e.target.id === "modal" && !modalLocked) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && modalOpen && !modalLocked) closeModal(); });
const xBtn = `<button class="x" data-act="close" aria-label="Close">×</button>`;
const pips = l => `<span class="pips" aria-label="Level ${l} of ${MAXL}">${Array.from({length:MAXL},(_,k)=>`<i class="${k<l?"on":""}"></i>`).join("")}</span>`;

/* Intro */
function intro(){
  openModal(`<div class="top"><h2>How to play</h2>${xBtn}</div>
  <p>You’re ${ceoN()}, CEO of ${coName()} in the London market. Grow the tower, keep the City happy, and don’t get wiped out.</p>
  <div class="intro-scroll">
    <h3 class="intro-h" style="border:0;padding:0;margin-top:0">What’s new in v${VERSION}</h3>
    ${changesFor(VERSION).map(n => `<p><span>✨</span><span>${n}</span></p>`).join("")}
    <h3 class="intro-h">How to play</h3>
    <p><span>🏢</span><span><b>Build with a plan.</b> Every floor has an upside and a downside, and every new floor raises all salaries. Scroll down for a guide to every room.</span></p>
    <p><span>🙋</span><span><b>Handle claims</b> in The Room: pay, deny or stall. A Risk Dept shows you who’s lying.</span></p>
    <p><span>📞</span><span><b>Earnings calls</b> every 60 seconds. Beat the City’s target to earn stars, a cash bonus and board confidence.</span></p>
    <p><span>📈</span><span><b>The market fights back.</b> Success attracts competition: more claims, more fraud, higher targets. Meanwhile the insurance cycle swings between hard markets (high prices) and soft markets (price wars).</span></p>
    <p><span>🏷️</span><span><b>Set your pricing</b> in the Boardroom. Undercut for volume, charge a premium for margin, or gouge and risk the regulator. The best choice depends on the cycle.</span></p>
    <p><span>🤖</span><span><b>Autopilot.</b> Promotions unlock executives who run parts of the business for a salary: claims, insurance, compliance, pricing, even expansion. Your syndicate also earns while you’re away.</span></p>
    <p><span>🏦</span><span><b>Capital rules.</b> From quarter 6 the regulator requires you to hold cash in proportion to the premiums you write. Fall short at an earnings call and you get a warning. Catastrophe reinsurance and Cat Modelling lower the requirement.</span></p>
    <p><span>🦈</span><span><b>Rivals.</b> Later on, rival syndicates try to poach your underwriters and brokers. Match their offer, take them to lunch, ask HR, or let them go.</span></p>
    <p><span>🛋️</span><span><b>Idle mode.</b> Prefer to watch? Turn on idle mode in the Boardroom and the board makes every decision. It can’t be undone, and the run won’t be scored.</span></p>
    <p><span>♾️</span><span><b>Play forever, if you can.</b> As your tower matures, the City expects less growth and “in line” results are fine. But regulation keeps piling up, and dividends keep the board sweet.</span></p>
    <p><span>⚖️</span><span><b>Compliance</b> must cover your floors. Fall short and the regulator issues warnings. Three warnings and you lose your licence.</span></p>
    <p><span>🦢</span><span><b>Black swans</b> are huge disasters based on real ones: hurricanes, a ship blocking a canal, a global IT meltdown, a bank collapse and more. They strike with no warning, roughly every 8 to 12 quarters from quarter 5. Without cover you pay the whole loss, which can sink you. Buy reinsurance and your other covers in the Boardroom: they pay 90%.</span></p>
    <p><span>⭐</span><span><b>Spend stars</b> on perks in the Boardroom, and unlock achievements for extra stars.</span></p>
    <p><span>💀</span><span><b>You lose</b> if you go bankrupt, the board’s confidence hits zero, or you lose your licence.</span></p>
    <h3 class="intro-h">The rooms you can build</h3>
    ${ORDER.map(t => `<p class="intro-room"><span class="isw" style="background:${TYPES[t].wall}"></span><span><b>${TYPES[t].name}.</b> ${TYPES[t].desc}<em class="pro">＋ ${TYPES[t].pro}</em><em class="con">− ${TYPES[t].con}</em>${UNLOCKS[t] ? `<em class="dim">🔓 ${UNLOCKS[t].text}</em>` : ""}</span></p>`).join("")}
    <p class="intro-tip"><span>💡</span><span>Start with Underwriting Boxes for income, keep a cash buffer for big claims, and add Compliance before your 4th floor.</span></p>
  </div>
  <div class="closeRow"><button class="btn blue" data-act="tutorial">Replay the tutorial</button><button class="btn" data-act="close">Back to the game</button></div>
  <p class="ver-line">Version ${VERSION}, built ${BUILD_DATE}</p>`, {cls:"intro"});
}

/* Floors */
function effectText(type, l, d){
  switch(type){
    case "sales": return `Brings in about ${fmtR(salesFloorRate(l)*salesMult())} per second`;
    case "claims": return `Handles a claim every ${(14/l/claimSpeed()).toFixed(1)} seconds`;
    case "it": return `+${10*l}% premium income, claims ${15*l}% faster, cyber losses ${Math.min(60,15*l)}% smaller, ${Math.min(40, 6*lv("it") + 6*(d || 0))}% outage risk per quarter`;
    case "pr": return `Mood recovers faster, fines and confidence losses ${Math.min(50, 10*l)}% smaller, ${Math.min(30, 5*l)}% leak risk per quarter`;
    case "hr": return `Everyone ${5*l}% faster, +${5*l}% premium income, ${Math.min(40, 8*l)}% backfire risk per quarter`;
    case "invest": return `Invests up to ${fmt(Math.round(l*Math.max(300, income()*Q_LEN*0.3)))} of spare cash per quarter`;
    case "compliance": return `Covers ${3*l} floors for the regulator, scandal losses ${Math.min(60,15*l)}% smaller`;
    case "actuary": return `Claims cost ${Math.min(55,7*l)}% less`;
    case "marketing": return `Underwriting Boxes write ${35*l}% more`;
    case "legal": return `Denials ${Math.min(70,12*l)}% less upsetting, fewer lawsuits`;
    case "breakroom": return `Everyone works ${8*l}% faster`;
    case "risk": return intelText(lv("risk") + (d || 0));
    case "ir": return `Good earnings boosted ${15*l}%, bad ones softened ${Math.min(70,12*l)}%`;
  }
}
function openFloors(){
  const cost = buildCost(), can = S.floors.length < MAXF, afford = S.cash >= cost;
  const types = [...ORDER].sort((a, b) => isUnlocked(b) - isUnlocked(a)).map(t => `<button class="type" data-act="build:${t}" ${(!can||!afford||!isUnlocked(t))?"disabled":""}>
      <div class="sw" style="background:${TYPES[t].wall}"></div><b>${TYPES[t].name}</b><span class="pro">＋ ${TYPES[t].pro}</span><span class="con">− ${TYPES[t].con}</span>${!isUnlocked(t) ? `<span class="dim">🔒 ${UNLOCKS[t].text}</span>` : ""}</button>`).join("");
  const list = S.floors.map((f,i) => ({f,i})).reverse().map(({f,i}) => {
    const max = f.level >= MAXL, c = upCost(f);
    return `<div class="frow"><div class="sw" style="background:${TYPES[f.type].wall}"></div>
      <div class="nm">${TYPES[f.type].name}${pips(f.level)}</div>
      <button class="btn ghost" data-act="floor:${i}">Manage</button>
      <button class="btn" data-act="up:${i}:floors" ${max||S.cash<c?"disabled":""}>${max?"Maxed":"Upgrade "+fmt(c)}</button></div>`;
  }).join("");
  openModal(`<div class="top"><h2>Floors</h2>${xBtn}</div>
    ${can ? `<p>Pick what to build next. Cost: <b class="pos">${fmt(cost)}</b>${afford?"":` <span class="dim">(you have ${fmt(S.cash)})</span>`}</p>${compHtml()}<p class="dim">Every floor raises everyone’s salaries by 6%, so build with a plan.</p><div class="types">${types}</div>`
          : `<p>The tower is as tall as zoning allows. The zoning board has been offered several yachts.</p>`}
    <h3>Your floors</h3><div class="flist">${list}</div>`, {view:"floors", focus:false});
}
function openFloor(i){
  const f = S.floors[i]; if (!f) return; variantOf(f);
  const t = TYPES[f.type], max = f.level >= MAXL, c = upCost(f);
  const up = (TYPES[f.type].sal || 0.6)*salFactor();
  let extra = "";
  if (f.type === "pr"){
    const cost = prCost(), ready = S.prQ !== S.quarter;
    extra = `<h3>Damage control</h3><div class="action"><div><h3>Launch a campaign</h3><p>Apologies, a charity photo op and a heartfelt video. Customer mood +15, board confidence +6. Once per quarter.</p></div>
      <button class="btn" data-act="prcamp" ${!ready || S.cash < cost ? "disabled" : ""}>${ready ? fmt(cost) : "Done"}</button></div>`;
  }
  if (f.type === "invest"){
    extra = `<h3>Investment strategy</h3><div class="seg three">${INV.map((st, k) => `<button class="btn" data-act="inv:${k}:${i}" aria-pressed="${(S.invRisk || 0) === k}">${st.name}</button>`).join("")}</div>
      <p class="dim">${INV[S.invRisk || 0].desc} Your Investment floors put up to ${fmt(invCap())} of spare cash to work, with returns paid at each earnings call.${S.invLast ? ` Last quarter: ${S.invLast >= 0 ? "+" : "−"}${fmt(Math.abs(S.invLast))}.` : ""}</p>`;
  }
  if (f.type === "claims"){
    extra = `<h3>How generous should they be?</h3>
    <div class="seg three"><button class="btn green" data-act="mode:${i}:pay" aria-pressed="${f.mode!=="deny"&&f.mode!=="smart"}">Pay everything</button>
    <button class="btn red" data-act="mode:${i}:deny" aria-pressed="${f.mode==="deny"}">Deny everything</button>
    <button class="btn blue" data-act="mode:${i}:smart" aria-pressed="${f.mode==="smart"}" ${lv("risk")<2?"disabled":""}>Use risk intel</button></div>
    <p class="dim">Paying keeps customers happy. Denying saves money, angers people, and sometimes ends in court. “Use risk intel” pays claims that look legit and denies ones that look like fraud. It needs a Risk Dept at level 2 or higher, and it’s only as sharp as your Risk Dept.</p>
    <h3>Payout limit</h3>
    <div class="seg four">${[0, 0.6, 1, 2].map(m => `<button class="btn ${m ? "ghost" : ""}" data-act="lim:${i}:${m}" aria-pressed="${(f.lim || 0) === m}">${m ? "Up to " + fmt(typicalClaim()*m) : "No limit"}</button>`).join("")}</div>
    <p class="dim">Claims above the limit are left for you to decide. The limit grows with your business.</p>`;
  }
  openModal(`<div class="top"><h2>${t.name}</h2>${xBtn}</div>
    <p>${t.desc}</p><p class="joke">${t.joke}</p>
    <div class="pc"><p class="pro">＋ ${t.pro}</p><p class="con">− ${t.con}</p></div>
    ${f.type === "compliance" ? compHtml() : ""}
    <div class="facts">
      <div class="fact"><span>Level</span><b>${f.level} of ${MAXL}</b></div>
      <div class="fact"><span>Staff salaries</span><b>${fmtR(up*f.level)}/s</b></div>
      <div class="fact" style="grid-column:1/-1"><span>Right now</span><b style="font-size:16px">${effectText(f.type, f.level, 0)}</b></div>
      ${max ? "" : `<div class="fact" style="grid-column:1/-1"><span>After upgrade</span><b style="font-size:16px" class="pos">${effectText(f.type, f.level+1, 1)}</b></div>`}
    </div>
    <h3>Design</h3>
    <div class="designs">${DESIGNS[f.type].map((d,k) => `<button class="btn" data-act="skin:${i}:${k}" aria-pressed="${k===f.skin}">${d.name}</button>`).join("")}</div>
    <p class="dim">Redecorating is free. The interior designer is paid in exposure.</p>
    ${extra}
    <button class="btn" style="width:100%" data-act="up:${i}:floor" ${max||S.cash<c?"disabled":""}>${max?"Fully upgraded":`Upgrade for ${fmt(c)}`}${!max&&S.cash<c?`<small>You have ${fmt(S.cash)}</small>`:""}</button>
    <h3 style="margin-top:16px">Arrange</h3>
    <p class="dim">This is floor ${i + 1} of ${S.floors.length}, counting up from The Room. Moving floors is free and purely cosmetic.</p>
    <div class="seg three">
      <button class="btn ghost" data-act="mv:${i}:1" ${i >= S.floors.length - 1 ? "disabled" : ""}>Move up</button>
      <button class="btn ghost" data-act="mv:${i}:-1" ${i <= 0 ? "disabled" : ""}>Move down</button>
      <button class="btn red" data-act="demo:${i}" ${S.floors.length <= 1 ? "disabled" : ""}>Demolish</button>
    </div>`, {view:"floor" + i});
}
function build(type){
  const cost = buildCost();
  if (S.cash < cost || S.floors.length >= MAXF) return;
  if (!isUnlocked(type)) return;
  S.cash -= cost; discSpent += cost;
  S.floors.push({type, level:1, mode:"pay"});
  rebuildWorkers(S.floors.length-1);
  closeModal();
  toast(`Built: ${TYPES[type].name}. ${TYPES[type].joke}`, "good");
  save();
}
function upgrade(i, back){
  const f = S.floors[i]; const c = upCost(f);
  if (f.level >= MAXL || S.cash < c) return;
  S.cash -= c; discSpent += c; f.level++; rebuildWorkers(i);
  const L = layout(); pop("Level "+f.level+"!", 100, floorY(L,i)+16, "");
  if (back === "floors") openFloors(); else openFloor(i);
  save();
}

/* Claims */
function claimCard(c){
  const pct = Math.max(0, c.pat/c.max*100); const low = pct < 35;
  return `<div class="claim">
    <div class="claim-top"><b>${c.name}</b><span class="amt">${fmt(c.amount)}</span></div>
    <p>${c.desc}</p>
    <div class="pat ${low?"low":""}"><i style="width:${pct}%"></i></div>
    <small class="patlbl">${low ? "About to give up and leave a review" : "Waiting, mostly patiently"}</small>
    ${intelHtml(c)}
    <div class="row3">
      <button class="btn green" data-act="pay:${c.id}" ${!canPay(c.amount)?"disabled":""}>Pay</button>
      <button class="btn red" data-act="deny:${c.id}">Deny</button>
      <button class="btn ghost" data-act="stall:${c.id}" ${c.stalls?"disabled":""}>${c.stalls?"No more stalling":"Paperwork"}</button>
    </div></div>`;
}
let claimFocus = null;
function openClaims(single){
  claimFocus = single || null;
  let list = single ? S.claims.filter(c => c.id === single) : S.claims;
  if (single && !list.length){ closeModal(); return; }
  const body = list.length ? list.map(claimCard).join("")
    : `<div class="empty"><p>No claims right now. Enjoy it while it lasts.</p></div>`;
  openModal(`<div class="top"><h2>${single ? "A claim" : `Claims (${S.claims.length})`}</h2>${xBtn}</div>
    <p class="dim">Pay to keep customers happy. Deny to keep the money, but they might sue. Paperwork buys time, once. Serious claims that look genuine are the most likely to end up in court, and the ones you’re most likely to lose.</p>
    ${body}`, {view:"claims", focus:false});
}

/* Boardroom */
function sparkline(){
  const h = S.hist.slice(-30); if (h.length < 2) h.unshift(h[0]);
  const mx = Math.max(...h), mn = Math.min(...h), span = Math.max(0.01, mx-mn);
  const pts = h.map((v,k) => `${(k/(h.length-1)*296+2).toFixed(1)},${(70 - (v-mn)/span*60).toFixed(1)}`).join(" ");
  return `<svg class="spark" viewBox="0 0 300 76" preserveAspectRatio="none" aria-label="Share price history">
    <polygon points="2,76 ${pts} 298,76" fill="rgba(255,210,63,.18)"/>
    <polyline points="${pts}" fill="none" stroke="#FFD23F" stroke-width="3" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
}
function pricingIntroHtml(){
  return `<div class="pc" style="border-color:var(--gold)">
    <h3>Start here: choose your pricing</h3>
    <p>This is the Boardroom, your strategy room. Your first big decision is how to price your policies. Right now the market is <b>${cycleName().replace(" market", "").toLowerCase()}</b>: ${cycleName() === "Hard market" ? "prices are high, so Premium costs you fewer customers" : cycleName() === "Soft market" ? "rivals are cutting prices, so charging more loses customers" : "prices are normal"}.</p>
    ${PRICES.map((pr, k) => `<button class="type" style="width:100%;margin:0 0 6px;${priceIdx() === k ? "border-color:var(--gold)" : ""}" data-act="price:${k}"><b>${priceIdx() === k ? "✓ " : ""}${pr.name}</b><span>${pr.desc}</span></button>`).join("")}
    <p class="dim">Market rate is the safe start. Everything else in the Boardroom (insurance, executives, perks and more) is below, and you can change pricing any time. Once you have spare cash, buy your own insurance too: black swans strike with no warning.</p>
  </div>`;
}
function openBoard(confirmRestart, intro){
  const r = S.rankIdx, next = RANKS[r+1];
  if (confirmRestart){
    openModal(`<h2>Start over?</h2><p>Your tower, your yachts and your share price all go away. Percy keeps his contract.</p>
      <div class="seg"><button class="btn ghost" data-act="board">Keep playing</button><button class="btn red" data-act="restart-yes">Start a new company</button></div>`, {view:"board"});
    return;
  }
  openModal(`<div class="top"><h2>Boardroom</h2>${xBtn}</div>
    ${intro ? pricingIntroHtml() : ""}
    <div class="ceo-card"><canvas id="ceoFace" width="48" height="48" aria-hidden="true"></canvas><div><b>${ceoN()}</b><span>CEO of ${coName()}</span><small>Your title: ${RANKS[r].name}</small></div></div>
    <div class="status">
      <div><span>Board confidence</span><b class="${S.conf < 30 ? "neg" : "pos"}">${Math.round(S.conf)}%</b></div>
      <div><span>Regulator warnings</span><b class="${S.strikes ? "neg" : "pos"}">${S.strikes} of ${maxStrikes()}</b></div>
      <div><span>Competition</span><b>${mktName().replace(" market","")}</b></div>
      <div><span>Capital held</span><b class="${capReq() && S.cash < capReq() ? "neg" : "pos"}">${capReq() ? Math.round(capRatio()*100) + "% of required" : "Not required yet"}</b></div>
    </div>
    ${execsHtml()}
    <div class="closeRow" style="justify-content:flex-start"><button class="btn ghost" data-act="lb">🏆 Leaderboard</button></div>
    <p class="dim" style="margin-top:12px">Score so far: <b>${scoreParts().total.toLocaleString("en-GB")}</b> (grade ${grade(scoreParts().total)})${S.idleMode ? ", not recorded in idle mode" : ""}. Personal best: ${bestScore().toLocaleString("en-GB")}.</p>
    ${goalsHtml(next)}
    <h3 style="margin-top:14px">Pricing</h3>
    <p class="dim"><b style="color:var(--ink)">${cycleName()}.</b> ${CYCLE_MSG[cycleName()].replace(/^The market has (hardened|softened|steadied)\. /, "")}</p>
    <div class="seg four">${PRICES.map((pr, k) => `<button class="btn" data-act="price:${k}" aria-pressed="${priceIdx() === k}">${pr.name}</button>`).join("")}</div>
    <p class="dim">${PRICES[priceIdx()].desc} Right now: premium income ×${(marketRate()*volume()).toFixed(2)}, customers ×${volume().toFixed(2)}.</p>
    <h3 style="margin-top:14px">Emergency funding</h3>
    <p class="dim">Short of cash? These keep you alive, at a price.</p>
    <div class="action"><div><h3>Cash call</h3><p>Ask your syndicate’s investors for ${fmt(cashCallAmt())}. Share price −15%, board confidence −12. Once every 2 quarters.</p></div>
      <button class="btn" data-act="cashcall" ${S.quarter - S.lastCall < 2 ? "disabled" : ""}>${S.quarter - S.lastCall < 2 ? "Too soon" : "Raise " + fmt(cashCallAmt())}</button></div>
    <div class="action"><div><h3>Bank loan</h3><p>${S.loan ? `You owe ${fmt(S.loan.left)}, repaid ${fmt(S.loan.per)} at each earnings call.` : `Borrow ${fmt(loanAmt())} now. Repay ${fmt(Math.round(loanAmt()*1.25))} over 4 earnings calls. One loan at a time.`}</p></div>
      <button class="btn ghost" data-act="loan" ${S.loan ? "disabled" : ""}>${S.loan ? "In progress" : "Borrow " + fmt(loanAmt())}</button></div>
    <h3 style="margin-top:14px">Your own insurance</h3>
    <p class="dim">Black swans strike with no warning, roughly every 8 to 12 quarters, and the longer it’s been since the last one, the closer the next. Without cover you pay the whole loss, which can sink the company. Cover renews at each earnings call.</p>
    ${Object.keys(COVERS).map(k => { const c = COVERS[k], on = S.cover[k], cost = coverCost(k, income()*Q_LEN);
      return `<div class="action"><div><h3>${on ? "🛡️ " : ""}${c.name}</h3><p>${c.desc} About ${fmt(cost)} per quarter.</p></div>
        ${on ? `<button class="btn ghost" data-act="cover:${k}:off">Cancel</button>` : `<button class="btn green" data-act="cover:${k}:on" ${S.cash < cost ? "disabled" : ""}>Buy ${fmt(cost)}</button>`}</div>`; }).join("")}
    <h3 style="margin-top:14px">Perks <span class="dim" style="font-family:Rubik,sans-serif;font-size:14px">You have ${S.favour} ★ to spend</span></h3>
    ${PERKS.map(pk => { const own = perk(pk.id);
      return `<div class="action"><div><h3>${own ? "✓ " : ""}${pk.name}</h3><p>${pk.desc}</p></div>
        ${own ? `<button class="btn ghost" disabled>Owned</button>` : `<button class="btn" data-act="perk:${pk.id}" ${S.favour < pk.cost ? "disabled" : ""}>${pk.cost} ★</button>`}</div>`; }).join("")}
    <h3 style="margin-top:14px">Achievements (${ACH.filter(a => S.ach[a.id]).length} of ${ACH.length})</h3>
    <div class="achs">${ACH.map(a => `<div class="ach ${S.ach[a.id] ? "on" : ""}"><b>${S.ach[a.id] ? "🏅 " : ""}${a.name}</b>${a.desc}</div>`).join("")}</div>
    <div class="big" style="margin-top:14px">${fmt2(S.stock)}</div>
    ${sparkline()}
    <p class="dim">Share price after each earnings call</p>
    <div class="facts">
      <div class="fact"><span>Customers insured</span><b>${Math.round(S.insured).toLocaleString("en-US")}</b></div>
      <div class="fact"><span>Claims paid in full</span><b>${S.served}</b></div>
      <div class="fact"><span>Quarters survived</span><b>${S.quarter-1}</b></div>
      <div class="fact"><span>Best quarter</span><b>${fmt(S.bestProfit || 0)}</b></div>
      <div class="fact"><span>Lawsuits lost</span><b>${S.sued || 0}</b></div>
      <div class="fact"><span>Best beat streak</span><b>${S.bestStreak || 0}</b></div>
      <div class="fact"><span>Fraud caught</span><b>${S.fraudCaught || 0}</b></div>
      <div class="fact"><span>Fraud paid out</span><b>${S.fraudPaid || 0}</b></div>
      <div class="fact"><span>Yachts</span><b>${S.yachts}</b></div>
    </div>
    <div class="action"><div><h3>Pay a dividend</h3><p>Hand ${fmt(divAmt())} to shareholders. Board confidence +8, share price +3%. Once per quarter. Mature companies live on these.</p></div>
      <button class="btn" data-act="dividend" ${S.divQ === S.quarter || S.cash < divAmt() ? "disabled" : ""}>${S.divQ === S.quarter ? "Paid" : "Pay " + fmt(divAmt())}</button></div>
    <div class="action"><div><h3>Buy back shares</h3><p>Buy your own stock with company cash. Share price up 4%. Helps nobody else.</p></div>
      <button class="btn" data-act="buyback" ${S.cash<buybackCost()?"disabled":""}>${fmt(buybackCost())}</button></div>
    <div class="action"><div><h3>Pay yourself a bonus</h3><p>Buys a yacht. Share price down 1% for “optics.”</p></div>
      <button class="btn ghost" data-act="bonus" ${S.cash<bonusCost()?"disabled":""}>${fmt(bonusCost())}</button></div>
    <p class="dim" style="margin-top:12px">How the money works: premiums come in every second, salaries go out every second, and claims cost money when you pay them. Profit is whatever survives.</p>
    <h3 style="margin-top:14px">Idle mode</h3>
    ${S.idleMode ? `<p class="note">Idle mode is on. The board is making every decision, and this run’s score won’t be recorded.</p>
      <h3>Watching speed</h3>
      <div class="seg three">${[[0.3,"Very relaxed"],[0.5,"Relaxed"],[1,"Normal"]].map(([v, n]) => `<button class="btn" data-act="ispeed:${v}" aria-pressed="${(S.idleSpeed || 0.5) === v}">${n}</button>`).join("")}</div>
      <p class="dim">Relaxed means an earnings call every 2 minutes. The staff, traffic and elevator keep moving at normal speed either way.</p>` : `<div class="action"><div><h3>Let the board run everything</h3><p>Every executive takes over: claims, pricing, insurance, compliance, building, upgrades and events. You can watch, but you can’t switch back, and this run’s score won’t be recorded.</p></div><button class="btn ghost" data-act="idle">Turn on</button></div>`}
    <button class="btn red" style="width:100%" data-act="restart">Start a new company</button>
    <p class="ver-line">${coName()}, version ${VERSION}</p>`, {view:"board", focus:false});
  drawCeoFace("#ceoFace");
}
function doBuyback(){ const c = buybackCost(); if (S.cash < c) return false; spend(c, "other"); discSpent += c; S.stock *= 1.04; checkRank(); return true; }

/* Earnings */
function earnings(){
  const q = S.q;
  const notes = [];
  q.cover = 0;
  for (const k of Object.keys(COVERS)) if (S.cover[k]){
    const c = coverCost(k, q.prem);
    if (S.cash >= c){ S.cash -= c; q.cover += c; }
    else { S.cover[k] = false; notes.push(`You couldn’t afford to renew ${COVERS[k].name.toLowerCase()}. It has lapsed.`); }
  }
  q.loan = 0;
  if (S.loan){
    const pay = Math.min(S.loan.per, S.loan.left);
    S.cash -= pay; S.loan.left -= pay; q.loan = Math.min(S.loan.interest, pay);
    if (S.loan.left <= 0){ S.loan = null; notes.push("Your bank loan is fully repaid."); }
  }
  q.inv = 0;
  if (lv("invest")){ const cap = invCapital(), st = INV[S.invRisk || 0]; q.inv = Math.round(cap*(st.mean + st.sd*gauss())); S.cash += q.inv; S.invLast = q.inv;
    if (q.inv < 0) notes.push(`Your ${st.name.toLowerCase()} investments lost ${fmt(-q.inv)} this quarter.`); }
  const profit = q.prem - q.paid - q.sal - q.other - q.cover - q.loan + q.inv;
  const hist = (S.profHist || []).slice(-3), g = growthRate();
  const avg = hist.length ? hist.reduce((a, b) => a + b, 0)/hist.length : 0;
  const expected = avg > 0 ? Math.max(40, avg*(1+g)) : 40;
  const basis = avg > 0 && avg*(1+g) > 40 ? `Your average profit over the last ${hist.length === 1 ? "quarter" : hist.length + " quarters"} (${fmt(avg)}), plus ${Math.round(g*100)}%.` : `Their minimum. They never accept less than ${fmt(40)}.`;
  const surprise = (profit - expected)/Math.max(Math.abs(expected), 40);
  const inLine = profit >= 0 && surprise < 0 && surprise >= -0.05;
  let ch = clamp(surprise*0.2, -0.25, 0.35); const ir = lv("ir");
  if (ch > 0) ch *= 1 + 0.15*ir; else ch *= Math.max(0.3, 1 - 0.12*ir);
  if (S.aiHype){ ch += 0.06; notes.push("You said “AI” forty times. Analysts added 6% out of reflex."); S.aiHype = false; }
  if (S.happy < 25){ ch -= 0.05; notes.push("A sustainability fund sold your stock over customer complaints. Share price down 5%."); }
  const gap = compGap();
  let strike = false;
  const gouged = priceIdx() === 3 && Math.random() < 0.35;
  const capShort = capReq() > 0 && S.cash < capReq()*0.8;
  if (!capShort && capReq() > 0 && S.cash < capReq()) notes.push(`Your capital is ${Math.round(capRatio()*100)}% of what the regulator requires. That’s within tolerance, but below 80% you’ll get a warning.`);
  if (gap > 0 || S.happy < 20 || gouged || capShort){
    strike = true; S.strikes++; S.cleanQ = 0; S.cleanRun = 0;
    const fine = Math.round(Math.max(100, Math.max(0, S.cash)*0.1)*(perk("lobbyist") ? 0.6 : 1)*prDamp()); S.cash -= fine;
    notes.push(`Regulator warning ${S.strikes} of ${maxStrikes()}: ${gap > 0 ? `Compliance only covers ${compHave()} of the ${compNeed()} floors it needs to` : capShort ? `you hold ${fmt(Math.max(0, S.cash))} but must hold ${fmt(capReq())} in capital` : S.happy < 20 ? "customers are miserable" : "your prices failed the fair-value test"}. Fine: ${fmt(fine)}.${S.strikes >= maxStrikes() ? "" : " Two clean quarters remove a warning."}`);
  } else {
    S.cleanQ++; S.cleanRun = (S.cleanRun || 0) + 1;
    if (S.strikes > 0 && S.cleanQ >= 2){ S.strikes--; S.cleanQ = 0; notes.push("The regulator removed one of your warnings. Keep it clean."); }
  }
  const old = S.stock; S.stock = Math.max(0.5, S.stock*(1+ch));
  S.hist.push(S.stock); if (S.hist.length > 40) S.hist.shift();
  const qn = S.quarter; S.quarter++; S.lastProfit = profit; S.q = blankQ();
  S.profHist = (S.profHist || []).concat([profit]).slice(-3);
  S.streak = profit >= expected ? (S.streak || 0) + 1 : inLine ? (S.streak || 0) : 0;
  S.bestStreak = Math.max(S.bestStreak || 0, S.streak);
  S.bestProfit = Math.max(S.bestProfit || 0, profit);
  const stars = (profit < 0 || surprise < 0) ? 0 : surprise >= 0.6 ? 3 : surprise >= 0.25 ? 2 : 1;
  const bonus = stars ? Math.round(B()*0.35*stars/10)*10 : 0;
  if (bonus) S.cash += bonus;
  S.stars += stars; S.favour += stars; if (stars === 3) S.best3 = true;
  let dc = stars ? 5 + 3*stars + Math.min(S.streak, 5) : profit < 0 ? -20 : inLine ? 2 : -Math.round(4 + 12*Math.min(1, -surprise));
  if (S.happy < 25) dc -= 6;
  if (strike) dc -= 10;
  if (dc < 0) dc = Math.round(dc*prDamp());
  S.conf = clamp(S.conf + dc, 0, 100);
  const oldDiff = S.diff;
  { let dd = 0.02 + (stars ? 0.05 + 0.04*stars : -0.1); if (dd > 0 && S.diff > 3) dd /= (S.diff - 2); S.diff = Math.max(1, 1 + 0.035*qn, S.diff + dd); }
  if (qn >= 9 && S.rivalT == null && Math.random() < Math.min(0.6, 0.15 + 0.08*Math.max(0, S.diff - 2) + 0.01*Math.max(0, S.floors.length - 10))) S.rivalT = rand(10, 50);
  if (S.idleMode && qn > 4 && Math.random() < 0.22*Math.min(1, (qn - 4)/8)){
    const bl = pick(BLUNDERS), cost = Math.round(Math.max(150, Math.abs(profit)*bl.k)/10)*10;
    S.cash -= cost; if (bl.conf) S.conf = clamp(S.conf - bl.conf, 0, 100); if (bl.mood) mood(-bl.mood);
    notes.push(`Board blunder: ${bl.text} It cost ${fmt(cost)}.`);
  }
  if (lv("pr") && S.prLeakAt == null && Math.random() < Math.min(0.3, 0.05*lv("pr"))) S.prLeakAt = rand(8, 50);
  if (lv("hr") && S.hrAt == null && Math.random() < Math.min(0.4, 0.08*lv("hr"))) S.hrAt = rand(8, 50);
  if (lv("it") > 0 && S.outageAt == null && Math.random() < Math.min(0.4, 0.06*lv("it"))) S.outageAt = rand(8, 50);
  const sinceSwan = qn - (S.lastSwanQ || 1);
  if (qn >= 4 && !S.swan && sinceSwan >= 3 && (sinceSwan >= 10 || Math.random() < Math.min(0.6, (0.03*sinceSwan + 0.005*(S.diff - 1))*(S.idleMode ? 1.3 : 1)))){
    S.lastSwanQ = qn;
    S.swan = {t:rand(12, 48), kind:pick(SWAN_POOL)};
  }
  if (qn % 8 === 0) notes.push("New regulations: a 400-page rulebook just landed. Compliance must now cover one more floor than before.");
  if (qn === 5) notes.push("Coming next quarter: capital rules. The regulator will require you to hold cash in proportion to the premiums you write. Catastrophe reinsurance and Cat Modelling reduce how much.");
  const qLabel = `Q${((qn-1)%4)+1}, year ${Math.ceil(qn/4)}`;
  let lede, quote;
  if (profit < 0){ lede = "You lost money this quarter."; quote = pick(["“Is the building on fire? Asking for a client.”","“We’re downgrading you to ‘Hold your breath.’”","“Bold strategy. Incorrect, but bold.”"]); }
  else if (inLine){ lede = "You came in right on expectations, give or take."; quote = pick(["“In line. We yawned, but in a positive way.”","“Steady. Boring. Acceptable.”","“Neither exciting nor alarming. Like a beige carpet.”"]); }
  else if (surprise < 0){ lede = `You missed the City’s expectations by ${fmt(expected-profit)}.`; quote = pick([`“You made ${fmt(profit)}. We expected ${fmt(expected)}. We are in mourning.”`,"“Disappointing. Have you tried firing someone?”","“A profit, sure. But was it enough profit?”"]); }
  else if (surprise > 0.3){ lede = "You crushed the City’s expectations."; quote = pick(["“Exceptional. Do it again, but more.”","“We’re upgrading you to ‘Buy, immediately, with both hands.’”","“I just named my son after your margins.”"]); }
  else { lede = "You beat the City’s expectations."; quote = pick(["“Solid quarter. Next time we’ll expect 12% more, for no reason.”","“Cautiously ecstatic.”","“Fine. Good, even. Don’t let it go to your head.”"]); }
  const pct = (S.stock/old - 1)*100;
  bell.t = 3; bell.n = profit >= expected ? 2 : 1; lede += profit >= expected ? " In The Room, the bell rings twice." : " In The Room, the bell rings once.";
  openModal(`<h2>Earnings call, ${qLabel}</h2>
    <p class="dim" style="margin:-4px 0 6px">${ceoN()} takes the call for ${coName()}.</p>
    <div class="stars" aria-label="${stars} of 3 stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
    <p>${lede}${S.streak > 1 ? ` That’s ${S.streak} quarters in a row.` : ""}</p>
    <div class="reward">
      <div><span>Board bonus</span><b class="${bonus ? "pos" : ""}">${bonus ? "+" + fmt(bonus) : "None"}</b></div>
      <div><span>Board confidence</span><b class="${dc >= 0 ? "pos" : "neg"}">${dc >= 0 ? "+" : "−"}${Math.abs(dc)} (${Math.round(S.conf)}%)</b></div>
      <div><span>Competition</span><b>${mktName().replace(" market","")}${S.diff > oldDiff + 0.04 ? " ↑" : S.diff < oldDiff ? " ↓" : ""}</b></div>
    </div>
    <table class="ledger">
      <tr><td>Premiums collected</td><td class="pos">+${fmt(q.prem)}</td></tr>
      <tr><td>Claims paid</td><td class="neg">−${fmt(q.paid)}</td></tr>
      <tr><td>Salaries</td><td class="neg">−${fmt(q.sal)}</td></tr>
      <tr><td>Lawsuits, fines and “other”</td><td class="neg">−${fmt(q.other)}</td></tr>
      <tr><td>Your own insurance</td><td class="neg">−${fmt(q.cover)}</td></tr>
      ${q.inv ? `<tr><td>Investment returns</td><td class="${q.inv >= 0 ? "pos" : "neg"}">${q.inv >= 0 ? "+" : "−"}${fmt(Math.abs(q.inv))}</td></tr>` : ""}
      ${q.loan ? `<tr><td>Loan interest</td><td class="neg">−${fmt(q.loan)}</td></tr>` : ""}
      <tr class="total"><td>Profit</td><td class="${profit>=0?"pos":"neg"}">${fmt(profit)}</td></tr>
      <tr class="exp"><td>The City expected<br><small>${basis}</small></td><td>${fmt(expected)}</td></tr>
      ${capReq() ? `<tr class="exp"><td>Capital the regulator requires<br><small>You hold ${fmt(Math.max(0, S.cash))}</small></td><td class="${S.cash < capReq() ? "neg" : ""}">${fmt(capReq())}</td></tr>` : ""}
    </table>
    <div class="move ${pct>=0?"up":"down"}"><span>Share price<br><b>${fmt2(old)} to ${fmt2(S.stock)}</b></span><em>${pct>=0?"+":"−"}${Math.abs(pct).toFixed(1)}%</em></div>
    <blockquote>${quote}<cite>An analyst who has never bought insurance</cite></blockquote>
    ${notes.map(n => `<p class="note">${n}</p>`).join("")}
    <div class="closeRow"><button class="btn" data-act="close">Hang up</button></div>`, {locked:true, auto:true, onClose:() => {
      if (S.strikes >= maxStrikes()) return gameOver("licence");
      if (S.conf <= 0) return gameOver("fired");
      if (S.conf < 25) toast("The board is losing patience. If their confidence hits zero, you’re out.", "bad");
      checkRank(); save(); }});
}
function checkRank(){
  const next = RANKS[S.rankIdx + 1]; if (!next) return;
  if (next.goals.every(goalMet)){
    S.rankIdx++; S.conf = clamp(S.conf + 10, 0, 100); S.favour += 2;
    const unl = EXECS.filter(x => x.rank === S.rankIdx).map(x => x.name);
    toast(`${ceoName()} has been promoted: ${next.name}! +10 board confidence and +2 ★.${unl.length ? ` You can now hire: ${unl.join(" and ")}.` : ""}`, "good"); fxConfetti();
    if (S.rankIdx === RANKS.length-1 && !S.won){ S.won = true; setTimeout(victory, 300); }
  }
}
function victory(){
  openModal(`<h2>You own the weather</h2>
    <p>You hit every target the board set. Legal found a loophole that technically makes you the owner of the weather, so you can now deny claims for storms you caused.</p>
    <p class="dim">Shareholders are thrilled. Customers are confused. Percy has asked for a raise.</p>
    <div class="closeRow"><button class="btn" data-act="close">Keep growing anyway</button></div>`, {locked:true});
}

/* ---------- Create your CEO (start of every run) ---------- */
const HAIRSTYLES = [["short","Short"],["pixie","Pixie"],["bob","Bob"],["long","Long"],["ponytail","Ponytail"],["bun","Bun"],["curly","Curly"],["braids","Braids"],["windswept","Messy"],["cap","Cap"]];
const ATTIRES = [["tie","Suit & tie"],["blouse","Blazer & blouse"],["skirt","Skirt suit"],["dress","Dress"]];
const EXTRAS = [["lashes","Lashes"],["lipstick","Lipstick"],["earrings","Earrings"],["glasses","Glasses"]];
const CEO_DEFAULTS = () => ({name:"", company:"", skin:SKINS[2], hair:HAIRS[0], hairStyle:"short", outfit:OUTFITS[0], attire:"tie", lashes:false, lipstick:false, earrings:false, glasses:false});
let setupDraft = null;
function drawCeoFace(sel, look){ const cv = $(sel); if (!cv) return; CUT.drawCEO(cv.getContext("2d"), look || S.ceo || {}, 0); }
function openSetup(){
  if (!setupDraft) setupDraft = Object.assign(CEO_DEFAULTS(), S.ceo || {}, {name:(S.ceo && S.ceo.name) || "", company:S.companyName || ""});
  const d = setupDraft, sw = (field, list, label) => `<div class="swatches">${list.map((col, i) => `<button class="sw" data-act="look:${field}:${i}" aria-pressed="${d[field] === col}" aria-label="${label} ${i + 1}" style="background:${col}"></button>`).join("")}</div>`;
  const midRun = S.seen && S.quarter > 1;
  openModal(`<h2>Create your CEO</h2>
    <p>${midRun ? "Your company is already up and running, so this is a one-time chance to name yourself and the business." : "Every tycoon starts somewhere. Who are you, and what’s on the sign?"}</p>
    <div class="ceo-setup"><canvas id="ceoPrev" width="48" height="48" aria-label="Your portrait"></canvas>
      <div class="ceo-fields">
        <label>Your name<input id="ceoName" maxlength="20" value="${esc(d.name)}" placeholder="Alex" autocomplete="off"></label>
        <label>Company name<input id="coNameIn" maxlength="28" value="${esc(d.company)}" placeholder="Fine Print Syndicate" autocomplete="off"></label>
      </div></div>
    <h3>Skin tone</h3>${sw("skin", SKINS, "Skin tone")}
    <h3>Hairstyle</h3><div class="seg four">${HAIRSTYLES.map(([k, l]) => `<button class="btn" data-act="look:hairStyle:${k}" aria-pressed="${d.hairStyle === k}">${l}</button>`).join("")}</div>
    <h3>Hair colour</h3>${sw("hair", HAIRS, "Hair colour")}
    <h3>Outfit style</h3><div class="seg four">${ATTIRES.map(([k, l]) => `<button class="btn" data-act="look:attire:${k}" aria-pressed="${d.attire === k}">${l}</button>`).join("")}</div>
    <h3>Outfit colour</h3>${sw("outfit", OUTFITS, "Outfit colour")}
    <h3>Extras</h3><div class="seg four">${EXTRAS.map(([k, l]) => `<button class="btn" data-act="look-t:${k}" aria-pressed="${!!d[k]}">${l}</button>`).join("")}</div>
    <p class="dim">Mix and match anything. Every option is open to every CEO.</p>
    <p class="note">Choose carefully: your name and your company’s name are set for the whole run. You can pick new ones when you start a new company.</p>
    <button class="btn" style="width:100%" data-act="setup-go">Start my syndicate</button>`, {locked:true, view:"setup", focus:false});
  drawCeoFace("#ceoPrev", d);
}
function readSetupInputs(){ if (!setupDraft) return; const n = $("#ceoName"), c = $("#coNameIn"); if (n) setupDraft.name = n.value; if (c) setupDraft.company = c.value; }
function finishSetup(){
  readSetupInputs();
  const clean = (v, max) => String(v || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
  const d = setupDraft, name = clean(d.name, 20), company = clean(d.company, 28) || "Fine Print Syndicate";
  if (!name){ toast("Your CEO needs a name. Even just initials will do.", "bad"); const n = $("#ceoName"); if (n) n.focus(); return; }
  S.ceo = {name, skin:d.skin, hair:d.hair, hairStyle:d.hairStyle, outfit:d.outfit, attire:d.attire, lashes:!!d.lashes, lipstick:!!d.lipstick, earrings:!!d.earrings, glasses:!!d.glasses}; S.companyName = company; S.setupDone = true; setupDraft = null;
  document.title = company; save(); closeModal(); sfx("chime");
  toast(`Welcome aboard, ${name}. ${company} is open for business.`, "good");
  if (!S.seen) setTimeout(startTutorial, 400); else offlineCheck();
}
