/* ui/hud.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* ---------- HUD ---------- */
const MOODS = [[80,"😊 Delighted"],[60,"🙂 Fine, actually"],[40,"😐 Tolerating you"],[20,"😠 Furious"],[0,"🔥 Pitchforks"]];
function hud(){
  $("#cash").textContent = fmt(S.cash);
  $("#cashBox").classList.toggle("neg", S.cash < 0);
  const net = income() - upkeep();
  let rate = `${net>=0?"+":"−"}${fmtR(Math.abs(net)).replace("−","")}/s`;
  if (S.buffs.sales > 0) rate += " ×2";
  if (S.outage > 0) rate += " (IT outage)";
  const run = runway(), cq = capReq(), capLow = cq > 0 && S.cash < cq;
  $("#rate").textContent = run != null && run < 90 ? `⚠ Broke in ${Math.max(1, Math.round(run))}s` : capLow ? `⚠ Capital ${Math.round(capRatio()*100)}% of required` : rate + " income";
  $("#rate").classList.toggle("warn", (run != null && run < 90) || capLow);
  $("#confBar").parentElement.classList.toggle("danger", S.conf < 25);
  const lb = $("#lawBtn");
  if (S.lawsuits.length){ lb.hidden = false; lb.textContent = `⚖ ${S.lawsuits.length}`; lb.setAttribute("aria-label", `${S.lawsuits.length} pending lawsuits, worth up to ${fmt(S.lawsuits.reduce((a, l) => a + l.amt, 0))}`); }
  else lb.hidden = true;
  $("#stock").textContent = fmt2(S.stock);
  const nx = RANKS[S.rankIdx+1];
  $("#rank").textContent = nx ? `${RANKS[S.rankIdx].name} (${nx.goals.filter(goalMet).length}/${nx.goals.length})` : RANKS[S.rankIdx].name;
  if (S.idleMode) $("#rank").textContent = "🛋️ Idle mode"; else if (S.idleTainted) $("#rank").textContent += " (unranked)";
  $("#happyBar").style.width = S.happy + "%";
  { const mp = moodPct(); $("#happyTxt").textContent = MOODS.find(m => S.happy >= m[0])[1] + ` (${mp >= 0 ? "+" : "−"}${Math.abs(mp)}% premiums)`; }
  const qn = S.quarter;
  $("#qLabel").textContent = `Q${((qn-1)%4)+1} earnings call in ${Math.ceil((Q_LEN - S.qt)/(S.idleMode ? (S.idleSpeed || 0.5) : 1))}s`;
  $("#qBar").style.width = (S.qt/Q_LEN*100) + "%";
  $("#confBar").style.width = S.conf + "%";
  $("#confBar").style.background = S.conf < 25 ? "var(--danger)" : S.conf < 50 ? "var(--gold)" : "var(--money)";
  const cnm = cycleName(); $("#mktTxt").textContent = cnm;
  $("#mktTxt").style.color = cnm === "Hard market" ? "#C8F29A" : cnm === "Soft market" ? "#FFC27A" : "#FFF1D0";
  $("#badge").textContent = S.claims.length;
  $("#btnClaims").classList.toggle("hot", S.claims.length > 0);
}
