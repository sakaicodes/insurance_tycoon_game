/* game/progression.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
function checkAch(){
  const got = [];
  for (const a of ACH){ if (!S.ach[a.id]){ let ok = false; try { ok = a.test(); } catch(e){} if (ok){ S.ach[a.id] = true; S.favour++; got.push(a.name); } } }
  if (!got.length) return;
  if (got.length <= 2) got.forEach(n => toast(`Achievement: ${n}! +1 ★ to spend in the Boardroom.`, "good"));
  else toast(`${got.length} achievements unlocked: ${got.slice(0, 3).join(", ")}${got.length > 3 ? " and more" : ""}. +${got.length} ★ to spend in the Boardroom.`, "good");
  fxConfetti();
}
function compHtml(){
  const need = compNeed(), have = compHave(), gap = need - have;
  if (need === 0) return `<p class="dim">Compliance: your first 3 floors don’t need cover yet.</p>`;
  return `<p class="${gap > 0 ? "note" : "dim"}">Compliance covers ${have} of the ${need} floors the regulator wants covered.${gap > 0 ? " You’ll get a warning at the next earnings call unless you add Compliance." : ""}</p>`;
}
function restart(){
  const prev = {ceo:S.ceo, company:S.companyName}; S = newState(); S.seen = true; W = []; CUST = []; popT = []; elev.init = false;
  setupDraft = Object.assign(CEO_DEFAULTS(), prev.ceo || {}, {name:(prev.ceo && prev.ceo.name) || "", company:prev.company || ""});
  S.floors.forEach((f,i) => rebuildWorkers(i));
  prevCount = 0; prevLevels = []; pendingBottom = true; lastKey = "";
  closeModal(); save();
  toast("Fresh start. The lobby smells like new carpet and old promises.");
  setTimeout(openSetup, 50);
}
