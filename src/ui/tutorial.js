/* ui/tutorial.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
let tutorialOn = false, tutI = 0;
function tutTarget(st){ if (!st.el) return null; const el = typeof st.el === "function" ? st.el() : $(st.el); return el && el.getClientRects().length ? el : null; }
function startTutorial(){ tutorialOn = true; tutI = 0; $("#coach").hidden = false; showStep(); }
function endTutorial(){
  tutorialOn = false; $("#coach").hidden = true;
  if (!S.seen){ S.seen = true; save(); setTimeout(() => openBoard(false, true), 250); }
  toast("You can reopen the tutorial any time with the ? button at the top.", "good");
}
function showStep(){
  const st = TUT[tutI], last = tutI === TUT.length - 1, first = tutI === 0;
  $("#coachCard").innerHTML = `<div class="coach-dots" aria-hidden="true">${TUT.map((_, k) => `<i class="${k <= tutI ? "on" : ""}"></i>`).join("")}</div>
    <p class="coach-step">${first ? "Tutorial" : `Step ${tutI} of ${TUT.length - 1}`}</p>
    <h3>${st.title}</h3><p>${st.text}</p>
    <div class="coach-btns">${last ? "" : `<button class="btn ghost" data-tut="skip">Skip tutorial</button>`}<span style="flex:1"></span>${first ? "" : `<button class="btn ghost" data-tut="back">Back</button>`}<button class="btn" data-tut="next">${first ? "Start the tour" : last ? "Start playing" : "Next"}</button></div>`;
  placeCoach();
  $("#coachCard").querySelector('[data-tut="next"]').focus({preventScroll:true});
}
function placeCoach(){
  if (!tutorialOn) return;
  const el = tutTarget(TUT[tutI]), card = $("#coachCard"), hole = $("#coachHole");
  const W = window.innerWidth, H = window.innerHeight, cw = Math.min(360, W - 24);
  card.style.width = cw + "px";
  const ch = card.offsetHeight;
  if (!el){
    hole.style.cssText = `left:${W/2}px;top:${H/2}px;width:0;height:0;border-width:0`;
    card.style.left = (W - cw)/2 + "px"; card.style.top = Math.max(12, (H - ch)/2) + "px";
    return;
  }
  const r = el.getBoundingClientRect(), pad = 6;
  hole.style.cssText = `left:${r.left - pad}px;top:${r.top - pad}px;width:${r.width + pad*2}px;height:${r.height + pad*2}px`;
  let top;
  if (r.bottom + pad + 12 + ch < H - 8) top = r.bottom + pad + 12;
  else if (r.top - pad - 12 - ch > 8) top = r.top - pad - 12 - ch;
  else top = Math.max(12, (H - ch)/2);
  card.style.top = top + "px";
  card.style.left = clamp(r.left + r.width/2 - cw/2, 12, W - cw - 12) + "px";
}
function tutNext(){ if (tutI >= TUT.length - 1) endTutorial(); else { tutI++; showStep(); } }
$("#coach").addEventListener("click", e => {
  const b = e.target.closest("[data-tut]"); if (!b) return;
  const a = b.dataset.tut;
  if (a === "skip") endTutorial();
  else if (a === "back"){ tutI = Math.max(0, tutI - 1); showStep(); }
  else tutNext();
});
document.addEventListener("keydown", e => {
  if (!tutorialOn) return;
  if (e.key === "Escape") endTutorial();
  else if (e.key === "ArrowRight") tutNext();
  else if (e.key === "ArrowLeft" && tutI > 0){ tutI--; showStep(); }
});
window.addEventListener("resize", () => placeCoach());
$("#btnHelp").addEventListener("click", () => { if (!tutorialOn) intro(); });
