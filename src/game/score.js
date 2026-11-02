/* game/score.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* ---------- Score ---------- */
function daysSurvived(){ return Math.floor((S.quarter - 1)*91 + S.qt/Q_LEN*91); }
function avgRep(){ return S.repT > 0 ? S.repSum/S.repT : S.happy; }
function scoreParts(){
  const money = Math.round(Math.sqrt(Math.max(0, S.earned || 0))*8);
  const days = daysSurvived()*4;
  const achN = ACH.filter(a => S.ach[a.id]).length;
  const bonus = (S.stars || 0)*40 + achN*150 + S.rankIdx*400;
  const rep = avgRep(), mult = 0.5 + rep/100;
  return {money, days, bonus, achN, rep, mult, total:Math.round((money + days + bonus)*mult)};
}
function grade(t){ return t >= 25000 ? "S" : t >= 15000 ? "A" : t >= 8000 ? "B" : t >= 4000 ? "C" : "D"; }
const BEST_KEY = "fineprint-best-score";
function bestScore(){ try { return +localStorage.getItem(BEST_KEY) || 0; } catch(e){ return 0; } }
function saveBest(v){ try { localStorage.setItem(BEST_KEY, String(v)); } catch(e){} }
function scoreHtml(sp, best, isNew){
  const n = v => v.toLocaleString("en-GB");
  return `<div class="score">
    <div class="score-top"><div><span class="dim">Final score</span><div class="score-total">${n(sp.total)}</div>${isNew ? `<span class="newbest">New personal best!</span>` : `<span class="dim">Personal best: ${n(best)}</span>`}</div>
      <div class="grade" aria-label="Grade ${grade(sp.total)}">${grade(sp.total)}</div></div>
    <table class="ledger">
      <tr><td>Money generated<br><small>${fmt(S.earned || 0)} in premiums</small></td><td>${n(sp.money)}</td></tr>
      <tr><td>Days survived<br><small>${n(daysSurvived())} days</small></td><td>${n(sp.days)}</td></tr>
      <tr><td>Bonuses<br><small>${S.stars || 0} stars, ${sp.achN} achievements, your title</small></td><td>${n(sp.bonus)}</td></tr>
      <tr><td>Reputation<br><small>Average customer mood ${Math.round(sp.rep)}%</small></td><td>×${sp.mult.toFixed(2)}</td></tr>
    </table></div>`;
}
