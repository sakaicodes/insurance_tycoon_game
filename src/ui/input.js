/* ui/input.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* ---------- Click handling ---------- */
$("#sheet").addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if (!b || b.disabled) return;
  const [a, p, q] = b.dataset.act.split(":");
  if (S.idleMode && ["build","up","mode","lim","spec","exit","exit-go","demo","demo-yes","pay","deny","stall","cover","perk","price","dividend","loan","cashcall","exec","inv","prcamp","settle","buyback","bonus","ev","idle"].includes(a)){ toast("Idle mode is on. The board makes every decision now.", "bad"); return; }
  if (a === "idle"){
    openModal(`<h2>Hand over the keys?</h2><p>The board will make every decision from now on: claims, pricing, insurance, compliance, building, upgrades and events. You can keep watching.</p>
      <p class="dim">Be warned: the board is not you. It makes mistakes, blunders on vanity projects, is slow to buy insurance, and idle companies attract more black swans. It may not last forever.</p>
      <p class="note">You can take back control at any time, but once the board has run things, this run won’t be recorded on the leaderboard or as a personal best.</p>
      <div class="seg"><button class="btn ghost" data-act="board">Keep control</button><button class="btn red" data-act="idle-yes">Turn on idle mode</button></div>`, {view:"idleconfirm"});
    return;
  }
  if (a === "idle-yes"){ S.preIdleExecs = Object.assign({}, S.execs); S.idleTainted = true; S.idleMode = true; S.idleSpeed = 0.5; for (const x of EXECS) S.execs[x.id] = true; save(); closeModal(); toast("Idle mode is on. Sit back. The board has it from here.", "good"); return; }
  if (a === "close") closeModal();
  else if (a === "build") build(p, q);
  else if (a === "spec"){
    const i = +p, f = S.floors[i], opts = f && specOptions(f.type), rc = retrainCost();
    if (!opts || !opts[q] || fSpec(f) === q || S.cash < rc || (f.type === "sales" && !lineUnlocked(q))) return;
    S.cash -= rc; f.spec = q; rebuildWorkers(i); sfx("chime");
    toast(`Retrained: the floor is now ${floorName(f)}. The old team has been sent on a course.`, "good"); save(); openFloor(i);
  }
  else if (a === "up") upgrade(+p, q);
  else if (a === "floor") openFloor(+p);
  else if (a === "mv"){
    const i = +p, j = i + (+q); if (j < 0 || j >= S.floors.length || S.floors[i].type === "penthouse" || S.floors[j].type === "penthouse") return;
    [S.floors[i], S.floors[j]] = [S.floors[j], S.floors[i]]; [W[i], W[j]] = [W[j], W[i]]; [popT[i], popT[j]] = [popT[j], popT[i]];
    prevLevels = S.floors.map(f => f.level); prevCount = S.floors.length;
    sfx("tick"); save(); openFloor(j);
  }
  else if (a === "demo"){
    const i = +p, f = S.floors[i]; if (!f || S.floors.length <= 1 || f.type === "penthouse") return;
    openModal(`<h2>Demolish ${floorName(f)}?</h2><p>This floor (level ${f.level}) and everyone in it will be gone for good. The builders will salvage about ${fmt(demoRefund(f))} of fixtures and fittings.</p>
      ${f.type === "compliance" ? `<p class="note">Removing Compliance may leave the regulator uncovered.</p>` : ""}
      <div class="seg"><button class="btn ghost" data-act="floor:${i}">Keep it</button><button class="btn red" data-act="demo-yes:${i}">Demolish</button></div>`, {view:"demo" + i});
  }
  else if (a === "demo-yes"){
    const i = +p, f = S.floors[i]; if (!f || S.floors.length <= 1 || f.type === "penthouse") return;
    const refund = demoRefund(f); S.cash += refund;
    S.floors.splice(i, 1); W.splice(i, 1); popT.splice(i, 1);
    prevLevels = S.floors.map(x => x.level); prevCount = S.floors.length;
    if (scene) scene.cameras.main.shake(250, 0.004); sfx("stamp");
    toast(`${floorName(f)} demolished. You salvaged ${fmt(refund)}${f.type === "compliance" ? ". Check your Compliance cover." : "."}`, f.type === "compliance" ? "bad" : "good");
    save(); closeModal();
  }
  else if (a === "exec"){ const x = EXECS.find(x => x.id === p); if (!x || S.rankIdx < x.rank) return; S.execs[p] = q === "on"; toast(q === "on" ? `You hired a ${x.name}. ${x.joke}` : `Your ${x.name} has left to “spend more time with their yacht.”`, q === "on" ? "good" : ""); save(); openBoard(); }
  else if (a === "inv"){ S.invRisk = +p; save(); openFloor(+q); }
  else if (a === "prcamp"){
    const c = prCost(); if (S.prQ === S.quarter || S.cash < c) return;
    spend(c, "other"); S.prQ = S.quarter; mood(15); S.conf = clamp(S.conf + 6, 0, 100); sfx("chime");
    toast(pick(["PR released a heartfelt video of the CEO adopting a three-legged dog. Mood +15.","PR sponsored a puppy calendar. Customers are moved. Mood +15.","PR held a press conference with a choir. Nobody remembers what went wrong. Mood +15."]), "good");
    save(); const k = S.floors.findIndex(f => f.type === "pr"); if (k >= 0) openFloor(k); else closeModal();
  }
  else if (a === "lb") openLeaderboard(p, q);
  else if (a === "lbname"){
    const inp = $("#lbName"); const name = (inp ? inp.value : "").replace(/[<>]/g, "").trim().slice(0, 24) || companyName();
    try { localStorage.setItem(NAME_KEY, name); } catch(e){}
    const runs = loadRuns(); const r = runs.find(x => String(x.id) === p); if (r){ r.name = name; saveRuns(runs); }
    const area = $("#lbArea"); if (area) area.innerHTML = lbTable(+p);
    toast("Saved. Your syndicate is on the board.", "good");
  }
  else if (a === "ispeed"){ S.idleSpeed = +p || 0.5; save(); openBoard(); }
  else if (a === "rival"){ resolveRival(+p, false); }
  else if (a === "look"){ readSetupInputs(); if (setupDraft){ if (p === "set") applySet(setupDraft, q); else { const list = {skin:SKINS, hair:HAIRS, outfit:OUTFITS}[p]; setupDraft[p] = list ? list[+q] : q; } } sfx("tick"); openSetup(); }
  else if (a === "look-t"){ readSetupInputs(); if (setupDraft) setupDraft[p] = !setupDraft[p]; sfx("tick"); openSetup(); }
  else if (a === "setup-go") finishSetup();
  else if (a === "idle-off"){
    S.idleMode = false; if (S.preIdleExecs) S.execs = Object.assign({}, S.preIdleExecs);
    save(); toast("You’re back in control. Your executives are as you left them. This run still won’t be scored.", "good"); openBoard();
  }
  else if (a === "exit"){
    if (!exitReady(p === "ipo" ? "ipo" : "pe")) return;
    const v = exitValue();
    openModal(`<h2>${p === "ipo" ? "Float on the stock exchange?" : "Sell to private equity?"}</h2>
      <p>${p === "ipo" ? `The IPO could value ${coName()} at anywhere from ${fmt(v*0.8)} to ${fmt(v*1.6)}.` : `Rupert’s fund will pay ${fmt(v)} for ${coName()}.`} This ends your run, and you’ll start your next company with a golden ticket.</p>
      <div class="seg"><button class="btn ghost" data-act="board">Not yet</button><button class="btn" data-act="exit-go:${p}">${p === "ipo" ? "Ring the bell" : "Shake hands"}</button></div>`, {view:"exitconfirm"});
  }
  else if (a === "exit-go"){ sellCompany(p === "ipo" ? "ipo" : "pe"); }
  else if (a === "penthouse"){
    if (hasPenthouse() || S.penthouseBought || S.favour < PENTHOUSE_COST) return;
    S.favour -= PENTHOUSE_COST; S.penthouseBought = true; S.floors.push({type:"penthouse", level:1, mode:"pay", skin:0}); rebuildWorkers(S.floors.length - 1); lastAddedFloor = S.floors.length - 1;
    sfx("chime"); fxConfetti(); toast(`The penthouse is ready. ${ceoName()} has already put their feet up.`, "good"); save(); closeModal();
  }
  else if (a === "btab"){ S.boardTab = p; openBoard(false, false, p); }
  else if (a === "starshop"){
    const it = STAR_SHOP.find(x => x.id === p); if (!it || S.favour < it.cost || (it.can && !it.can())) return;
    S.favour -= it.cost; S.shopBuys = (S.shopBuys || 0) + 1; const msg = it.run(); sfx("chime"); toast(msg, "good"); save(); openBoard();
  }
  else if (a === "price"){ S.price = +p; save(); toast(`Pricing set to ${PRICES[+p].name.toLowerCase()}.`, "good"); openBoard(); }
  else if (a === "dividend"){
    const amt = divAmt(); if (S.divQ === S.quarter || S.cash < amt) return;
    S.cash -= amt; discSpent += amt; S.divQ = S.quarter; S.conf = clamp(S.conf + 8, 0, 100); S.stock *= 1.03;
    sfx("chime"); toast(`Dividend of ${fmt(amt)} paid. Shareholders are briefly content.`, "good"); checkRank(); save(); openBoard();
  }
  else if (a === "lim"){ S.floors[+p].lim = +q || 0; sfx("tick"); openFloor(+p); save(); }
  else if (a === "mode"){ S.floors[+p].mode = q; openFloor(+p); }
  else if (a === "skin"){ S.floors[+p].skin = +q; openFloor(+p); save(); }
  else if (a === "pay" || a === "deny" || a === "stall"){
    const c = S.claims.find(c => c.id === +p); if (!c) return;
    resolve(c, a, "you"); save();
    if (claimFocus) closeModal(); else openClaims();
  }
  else if (a === "ev"){
    const e = curEvent; if (!e) return;
    const res = e.choices[+p].run(); curEvent = null;
    openModal(`<h2>${e.title}</h2><p>${res}</p><div class="closeRow"><button class="btn" data-act="close">Back to work</button></div>`, {locked:true, onClose:() => { checkRank(); save(); }});
  }
  else if (a === "board") openBoard();
  else if (a === "buyback"){ if (doBuyback()){ toast("Shares bought back. Share price up 4%. Customers didn’t notice.", "good"); openBoard(); } }
  else if (a === "bonus"){
    const c = bonusCost(); if (S.cash < c) return;
    spend(c,"other"); discSpent += c; S.yachts++; S.stock *= 0.99;
    toast(`You bought yacht #${S.yachts}: “${YACHTS[(S.yachts-1)%YACHTS.length]}.”`, "good"); openBoard();
  }
  else if (a === "cover"){
    if (q === "on"){ const c = coverCost(p, income()*Q_LEN); if (S.cash < c) return; S.cash -= c; discSpent += c; S.q.other += c; S.cover[p] = true; toast(`You bought ${COVERS[p].name.toLowerCase()}. It renews each earnings call.`, "good"); }
    else { S.cover[p] = false; toast(`${COVERS[p].name} cancelled. Good luck.`, "bad"); }
    save(); openBoard();
  }
  else if (a === "perk"){
    const pk = PERKS.find(x => x.id === p); if (!pk || S.favour < pk.cost || perk(p)) return;
    S.favour -= pk.cost; S.perks[p] = true; toast(`Perk unlocked: ${pk.name}.`, "good"); fxConfetti(); save(); openBoard();
  }
  else if (a === "tutorial"){ closeModal(); startTutorial(); }
  else if (a === "cashcall"){
    if (S.quarter - S.lastCall < 2) return;
    const amt = cashCallAmt(); S.cash += amt; discSpent -= amt; S.stock = Math.max(0.5, S.stock*0.85); S.conf = clamp(S.conf - 12, 0, 100); S.lastCall = S.quarter;
    sfx("pay"); toast(`Cash call raised ${fmt(amt)}. Investors are not amused.`, "bad"); save(); openBoard();
  }
  else if (a === "loan"){
    if (S.loan) return;
    const amt = loanAmt(), total = Math.round(amt*1.25);
    S.cash += amt; discSpent -= amt; S.loan = {left:total, per:Math.ceil(total/4), interest:Math.round((total - amt)/4)};
    sfx("pay"); toast(`Loan of ${fmt(amt)} received. Repayments start at the next earnings call.`, "good"); save(); openBoard();
  }
  else if (a === "settle"){
    const l = S.lawsuits[+p]; if (!l) return;
    const cost = settleCost(l); spend(cost, "other"); S.lawsuits.splice(+p, 1);
    sfx("paper"); toast(`Settled out of court for ${fmt(cost)}. Nobody admits anything.`, "good"); save();
    if (S.lawsuits.length) openLawsuits(); else closeModal();
  }
  else if (a === "restart"){ S.boardTab = "company"; openBoard(true); }
  else if (a === "restart-yes") restart();
});
$("#btnFloors").addEventListener("click", openFloors);
$("#btnClaims").addEventListener("click", () => openClaims());
$("#btnBoard").addEventListener("click", () => openBoard());

$("#sheet").addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target && (e.target.id === "ceoName" || e.target.id === "coNameIn")){ e.preventDefault(); finishSetup(); }
});
