/* game/claims.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* ---------- Claims ---------- */
function custFor(id){ return CUST.find(u => u.id === id && u.state !== "out"); }
function resolve(c, action, src){
  const idx = S.claims.indexOf(c); if (idx < 0) return;
  S.claims.splice(idx,1);
  const u = custFor(c.id);
  const L = layout();
  const lobby = src === "you" || src === "exec";
  const fxX = lobby ? (u ? u.x : 110) : 100;
  const fxY = lobby ? L.lobbyY + 22 : floorY(L, src) + 18;
  const who = src === "you" ? "You" : src === "exec" ? "Your Head of Claims" : "Your Claims Office";
  ensureIntel(c);
  if (action === "pay"){
    spend(c.amount, "paid"); S.served++; sfx("pay");
    if (c.legit) mood(2.5);
    else { mood(0.5); S.fraudPaid = (S.fraudPaid || 0) + 1; if (src === "you" || Math.random() < .4) toast(`${who} paid ${c.name}’s ${fmt(c.amount)} claim (“${snip(c.desc)}”). It was fraud: ${pick(FRAUD_QUIPS)}.`, "bad"); }
    if (lobby) pop("−"+fmt(c.amount), fxX, fxY, "bad"); else pop("Paid", fxX, fxY, "stamp ok");
    if (u) u.mood = "happy";
  } else if (action === "deny"){
    const lg = lv("legal"); sfx("stamp");
    if (c.legit) mood(-7*SEV_MULT[c.sev-1]*Math.max(0.3, 1 - 0.12*lg));
    else { mood(-1); S.fraudCaught = (S.fraudCaught || 0) + 1; if (src === "you") toast(`Good call. ${c.name}’s claim (“${snip(c.desc)}”) was fraud: ${pick(FRAUD_QUIPS)}.`, "good"); }
    const chance = suePct(c);
    if (Math.random() < chance){
      S.lawsuits.push({t:rand(15,35), amt:Math.round(c.amount*(2 + c.sev*0.5)), win:courtWin(c), name:c.name});
      if (src === "you") toast(`${c.name} called a lawyer on the way out. This could get expensive.`, "bad");
    }
    pop(c.legit ? "Denied" : "Fraud!", fxX, fxY, c.legit ? "stamp" : "stamp ok");
    if (u) u.mood = "angry";
  } else if (action === "stall"){
    c.stalls++; sfx("paper");
    if (Math.random() < 0.65) S.returns.push({t:rand(18,30), c});
    else S.returns.push({t:rand(6,12), c, gaveUp:true});
    pop("Form 27-B", fxX, fxY, "stamp ok");
    if (u) u.mood = "confused";
  }
  if (u) u.state = "out";
}
function expireClaim(c){
  const i = S.claims.indexOf(c); if (i >= 0) S.claims.splice(i,1);
  const u = custFor(c.id); if (u){ u.mood = "angry"; u.state = "out"; }
  ensureIntel(c); mood(-8*SEV_MULT[c.sev-1]);
  if (Math.random() < 0.4){ const f = Math.round(c.amount); spend(f, "other"); toast(`${c.name} got tired of waiting and complained to the regulator. Fine: ${fmt(f)}.`, "bad"); }
  else toast(`${c.name} got tired of waiting and left a review: “${pick(REVIEWS)}”`, "bad");
}
