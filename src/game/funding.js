/* game/funding.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* ---------- Funding, lawsuits, runway ---------- */
function divAmt(){ const h = (S.profHist || []).filter(x => x > 0); const avg = h.length ? h.reduce((a, b) => a + b, 0)/h.length : B(); return Math.round(Math.max(150, avg*0.4)/10)*10; }
function cashCallAmt(){ return Math.round(Math.max(1000, baseIncome()*Q_LEN*1.0)/10)*10; }
function loanAmt(){ return Math.round(Math.max(800, baseIncome()*Q_LEN*0.8)/10)*10; }
function settleCost(l){ return lv("legal") ? Math.round(l.amt*(l.win != null ? l.win : 0.85)*0.6) : Math.round(l.amt*0.5); }
const cashSamples = [];
let discSpent = 0;
function sampleCash(){ cashSamples.push(S.cash + discSpent); if (cashSamples.length > 20) cashSamples.shift(); }
function runway(){
  if (cashSamples.length < 8) return null;
  const slope = (cashSamples[cashSamples.length - 1] - cashSamples[0])/(cashSamples.length - 1);
  if (slope >= -0.5) return null;
  const left = S.cash + overdraft();
  return left <= 0 ? 0 : left/(-slope);
}
function openLawsuits(){
  const rows = S.lawsuits.map((l, k) => `<div class="law"><div><b>${l.name || "A former customer"}: ${fmt(l.amt)}</b>
      <p>Court date in ${Math.max(1, Math.ceil(l.t))}s. ${lv("legal") ? `Legal rates your chances: you’d probably ${(l.win != null ? l.win : 0.85) >= 0.5 ? "lose" : "win"}.` : "Build Legal to find out your chances."}</p></div>
      <button class="btn" data-act="settle:${k}">Settle ${fmt(settleCost(l))}</button></div>`).join("");
  openModal(`<div class="top"><h2>Pending lawsuits</h2>${xBtn}</div>
    <p class="dim">Lose in court and you pay the full amount. Settling costs less than a likely loss, but you pay it now. ${lv("legal") ? "Your Legal team prices each settlement on your real chances." : "Without Legal, every settlement costs half the claim."}</p>
    ${rows || `<div class="empty"><p>No lawsuits right now.</p></div>`}`, {view:"law"});
}
$("#lawBtn").addEventListener("click", () => { if (!tutorialOn) openLawsuits(); });
