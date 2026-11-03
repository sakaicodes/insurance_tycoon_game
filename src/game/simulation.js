/* game/simulation.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* ---------- Animation (runs even when paused) ---------- */
function animate(dt){
  if (bell.t > 0) bell.t -= dt;
  weather.t -= dt; if (weather.t <= 0){ weather.rain = !weather.rain; weather.t = weather.rain ? rand(15,30) : rand(18,35); }
  if (weather.rain) for (const d of drops){ d.y += d.s*dt; d.x -= d.s*0.15*dt; if (d.y > LH){ d.y = -5; d.x = rand(0, LW+40); } }
  for (const c of cars){ if (c.wait > 0){ c.wait -= dt; continue; } c.x += c.sp*dt; if (c.x > LW + 10){ c.x = -40; c.wait = rand(6,18); } }
  for (const c of clouds){ c.x += c.s*dt; if (c.x > LW + 10) { c.x = -c.w - 5; c.y = rand(6,60); } }
  for (const ws of W) for (const w of (ws || [])){
    if (w.mode !== "walk") continue;
    if (w.pause > 0){ w.pause -= dt; continue; }
    w.x += w.dir*w.sp*dt;
    if (w.x < w.lo){ w.x = w.lo; w.dir = 1; } if (w.x > w.hi){ w.x = w.hi; w.dir = -1; }
    if (Math.random() < dt*0.25){ w.pause = rand(1,3); if (Math.random() < .5) w.dir *= -1; }
  }
  const L = layout();
  const stops = [L.lobbyY + 18]; for (let i = 0; i < L.n; i++) stops.push(floorY(L,i) + 16);
  if (!elev.init){ elev.y = elev.ty = stops[0]; elev.init = true; }
  if (Math.abs(elev.ty - elev.y) < 0.5){ elev.y = elev.ty; elev.wait -= dt; if (elev.wait <= 0){ elev.ty = pick(stops); elev.wait = rand(1.5,3.5); } }
  else elev.y += Math.sign(elev.ty - elev.y)*Math.min(Math.abs(elev.ty-elev.y), 40*dt);
  if (!stops.some(s => s === elev.ty)) elev.ty = stops[0];
  const shown = S.claims.slice(0,6);
  shown.forEach((c,k) => {
    let u = CUST.find(u => u.id === c.id && u.state !== "out");
    if (!u){ u = {id:c.id, x:34, state:"wait", face:1, moving:false, mood:null,
      look:(() => { const alt = Math.random() < 0.5, skirt = alt && Math.random() < 0.4 ? pick(["#2B2D52","#4A6FA5","#B23A3A","#3E9B4F"]) : null;
        return {skin:pick(SKINS), hair:pick(HAIRS), shirt:pick(CUST_SHIRTS), pants:skirt ? "#3A3048" : pick(["#2B2D52","#4A6FA5","#6B4A2B","#3A3F6B"]), skirt, style:alt ? pick([1,2,3,4,5,7]) : pick([0,0,4,1,6,8]), scarf:pick(["#3E2E6A","#B23A3A","#2BB3B1"]), beard:!alt && Math.random() < 0.25 ? "#3A2618" : null, earrings:alt && Math.random() < 0.4, hat:!alt && Math.random() < 0.5}; })()};
      CUST.push(u); }
    u.tx = 140 - k*15;
  });
  for (const u of CUST){
    if (u.state === "wait" && !S.claims.some(c => c.id === u.id)) u.state = "out";
    if (u.state === "wait" && !shown.some(c => c.id === u.id)) u.state = "out";
    const tx = u.state === "out" ? 30 : u.tx;
    const d = tx - u.x;
    if (Math.abs(d) > 0.5){ u.x += Math.sign(d)*Math.min(Math.abs(d), (u.state==="out"?26:20)*dt); u.face = Math.sign(d); u.moving = true; }
    else { u.moving = false; if (u.state === "wait") u.face = 1; }
  }
  CUST = CUST.filter(u => !(u.state === "out" && u.x <= 31));
}

/* ---------- Simulation (paused while a panel is open) ---------- */
let pendingCut = null;
function queueCut(kind, opts, done){ if (!scene || window.__bot){ if (done) done(); return; } pendingCut = {kind, opts, done}; }
function update(dt){
  if (pendingCut && !modalOpen && !cutsceneOn && scene){ const pc = pendingCut; pendingCut = null; playCutscene(pc.kind, pc.done || (() => {}), pc.opts); return; }
  if (S.over) return;
  const inc = income(), up = upkeep();
  S.cash += (inc - up)*dt; S.q.prem += inc*dt; S.q.sal += up*dt; S.insured += inc*dt*0.04;
  S.earned = (S.earned || 0) + inc*dt; S.repSum = (S.repSum || 0) + S.happy*dt; S.repT = (S.repT || 0) + dt;
  for (const k in S.buffs) if (S.buffs[k] > 0) S.buffs[k] = Math.max(0, S.buffs[k] - dt);
  S.happy += (50 - S.happy)*0.004*dt;
  S.happy = clamp(S.happy + PRICES[priceIdx()].mood*dt, 0, 100);
  if (S.happy < 55 && lv("pr")) S.happy = Math.min(55, S.happy + 0.025*lv("pr")*dt);
  S.cyc = (S.cyc || 0) + dt/Q_LEN*(Math.PI*2/10);
  const cn = cycleName();
  if (S.cycName && cn !== S.cycName) toast(CYCLE_MSG[cn], cn === "Soft market" ? "bad" : "good");
  S.cycName = cn;

  S.nextClaim -= dt;
  if (S.nextClaim <= 0){ spawnClaim(); S.nextClaim = claimInterval()*rand(0.6,1.4); }
  if (!S.tipAuto && S.claims.length >= 5){ S.tipAuto = true; toast(lv("claims") ? "Claims are piling up. Upgrade your Claims Office, or tap it to set a payout limit so it handles small claims and leaves the big ones to you." : "Claims are piling up. A Claims Office handles them for you, and you can set a payout limit so the big ones still come to you.", "bad"); }
  for (const c of [...S.claims]){ c.pat -= dt; if (c.pat <= 0) expireClaim(c); }
  for (const r of [...S.returns]){
    r.t -= dt;
    if (r.t <= 0){
      S.returns.splice(S.returns.indexOf(r),1);
      if (r.gaveUp){ mood(-4); toast(`${r.c.name} gave up on the paperwork. You kept the money. They kept a grudge.`); }
      else { S.claims.push({...r.c, pat:30, max:30}); toast(`${r.c.name} is back with the forms. In triplicate.`); }
    }
  }
  for (const l of [...S.lawsuits]){
    l.t -= dt;
    if (l.t <= 0){
      S.lawsuits.splice(S.lawsuits.indexOf(l),1);
      S.suits = (S.suits || 0) + 1; if (Math.random() < (l.win != null ? l.win : 0.85)){ spend(l.amt, "other"); S.sued = (S.sued || 0) + 1; S.conf = clamp(S.conf - 3, 0, 100); fxShake(); sfx("gavel"); toast(`Lawsuit lost${l.name ? " to " + l.name : ""}: ${fmt(l.amt)}. ${pick(LAWSUIT_QUIPS)}`, "bad"); }
      else { const fee = Math.round(l.amt*0.15); spend(fee, "other"); sfx("chime"); toast(`You won in court${l.name ? " against " + l.name : ""}. The claim really was dodgy. Legal fees: ${fmt(fee)}.`, "good"); }
    }
  }
  const L = layout();
  S.floors.forEach((f,i) => {
    if (f.type === "claims"){
      f._t = (f._t || 0) + dt*morale();
      if (S.outage > 0){ f._t = 0; }
      if (f._t >= 14/f.level/(1 + 0.15*lv("it"))){ f._t = 0; const cap = f.lim ? typicalClaim()*f.lim : Infinity; const c = S.claims.find(c => c.amount <= cap); if (c){ let m = f.mode; if (m === "smart") m = (lv("risk") >= 2 && legitEst(c) < 50) ? "deny" : "pay"; if (m === "deny" || S.cash >= c.amount) resolve(c, m, i); } }
    }
    if (f.type === "sales"){
      popT[i] = (popT[i] || 0) + dt;
      if (popT[i] >= 3){ popT[i] = 0; const amt = salesFloorRate(f.level)*salesMult()*(S.buffs.sales>0?2:1)*3; pop("+"+fmt(amt), 70 + Math.random()*60, floorY(L,i)+20, ""); sfx("coin"); }
    }
  });

  if (S.cash < 0 && !S.warnedNeg){ S.warnedNeg = true; sfx("warn"); toast(`You’re overdrawn. If cash drops below ${fmt(-overdraft())}, the bank takes the building.`, "bad"); }
  if (S.cash >= 0) S.warnedNeg = false;
  if (S.cash < -overdraft()){ gameOver("bankrupt"); return; }
  if (S.swan){
    S.swan.t -= dt;
    if (S.swan.t <= 0){ const k = S.swan.kind; S.swan = null; blackSwan(k); return; }
  }
  if (S.outageAt != null){
    S.outageAt -= dt;
    if (S.outageAt <= 0){ S.outageAt = null; S.outage = 20; sfx("warn"); if (scene) scene.cameras.main.shake(250, 0.003); toast(pick(["IT outage! A server fell over. Premium income is halved and the Claims Office is offline for 20 seconds.","IT outage! Someone updated everything at once. Income halved and claims stalled for 20 seconds.","IT outage! The system says “error 0x00FINE”. Income halved and the Claims Office is down for 20 seconds."]), "bad"); }
  }
  checkUnlocks();
  autopilot(dt);
  if (S.prLeakAt != null){ S.prLeakAt -= dt; if (S.prLeakAt <= 0){ S.prLeakAt = null; mood(-12); S.conf = clamp(S.conf - 8, 0, 100); sfx("warn");
    toast(pick(["Leaked: PR’s plan to rename claim denials “customer journeys.” The internet is not amused.","Leaked: a PR memo titled “How to say sorry without saying sorry.” Mood and confidence take a hit.","Leaked: PR paid an influencer to praise your hold music. The influencer posted the invoice."]), "bad"); } }
  if (S.hrAt != null){ S.hrAt -= dt; if (S.hrAt <= 0){ S.hrAt = null; S.hrSlump = 30; sfx("warn");
    toast(pick(["HR announced a mandatory fun day. Everyone is 25% slower for 30 seconds.","HR is running a trust-fall workshop. Productivity has fallen, and so has Kevin.","HR reorganised every team into “pods.” Nobody knows which pod they’re in. Everything slows down."]), "bad"); } }
  if (S.hrSlump > 0) S.hrSlump = Math.max(0, S.hrSlump - dt);
  if (capReq() > 0 && S.cash < capReq() && S.capWarnQ !== S.quarter){ S.capWarnQ = S.quarter; sfx("warn"); toast(`Your capital is below what the regulator requires (${fmt(capReq())}). Below 80% of that at an earnings call means a warning.`, "bad"); }
  if (S.rivalT != null){ S.rivalT -= dt; if (S.rivalT <= 0){ S.rivalT = null; rivalPoach(); if (modalOpen) return; } }
  if (S.outage > 0){ S.outage -= dt; if (S.outage <= 0){ S.outage = 0; toast("IT is back up. They turned it off and on again.", "good"); } }
  checkAch();

  S.qt += dt;
  if (S.qt >= Q_LEN){ S.qt = 0; earnings(); return; }
  checkRank();
  S.nextEvent -= dt;
  if (S.nextEvent <= 0 && S.qt < Q_LEN - 6){ S.nextEvent = rand(40,65); fireEvent(); }
}
