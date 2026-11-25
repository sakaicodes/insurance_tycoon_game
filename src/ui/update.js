/* ui/update.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* Update check: build.js writes version.json next to the game. A newer version shows a gentle banner;
   a version below minVersion shows a blocking "update required" screen. Reloading adds ?v= so caches can't serve the old file. */
const UPD_DISMISS_KEY = "fineprint-update-dismissed";
let updBannerFor = null, updRequired = false;
function cmpVer(a, b){ const x = String(a).split(".").map(n => parseInt(n, 10) || 0), y = String(b).split(".").map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++){ const d = (x[i] || 0) - (y[i] || 0); if (d) return d > 0 ? 1 : -1; } return 0; }
function updEnabled(){ return /^https?:$/.test(location.protocol) && !/(^|\.)claude\.(ai|site)$|claudeusercontent|claudemcpcontent/.test(location.hostname); }
async function checkForUpdate(){
  if (!updEnabled() || updRequired) return;
  try {
    const r = await withTimeout(fetch(`version.json?t=${Date.now()}`, {cache:"no-store"}), 8000); if (!r.ok) return;
    const v = await r.json(); if (!v || !v.version) return;
    if (v.minVersion && cmpVer(VERSION, v.minVersion) < 0) showUpdateRequired(v);
    else if (cmpVer(v.version, VERSION) > 0) showUpdateBanner(v);
  } catch(e){}
}
function reloadToVersion(ver){ try { save(); } catch(e){} location.replace(location.pathname + "?v=" + encodeURIComponent(ver || Date.now())); }
function showUpdateBanner(v){
  if (updBannerFor === v.version) return;
  try { if (sessionStorage.getItem(UPD_DISMISS_KEY) === v.version) return; } catch(e){}
  updBannerFor = v.version;
  let el = $("#updBanner"); if (!el){ el = document.createElement("div"); el.id = "updBanner"; el.className = "upd-banner"; el.setAttribute("role", "status"); document.body.appendChild(el); }
  const hud = document.querySelector(".hud"); el.style.top = ((hud ? hud.getBoundingClientRect().bottom : 0) + 6) + "px";
  el.dataset.ver = v.version;
  el.innerHTML = `<span>✨ Version ${esc(v.version)} is ready. Your run is saved.</span><button class="btn" type="button">Reload</button><button class="upd-x" type="button" aria-label="Dismiss">×</button>`;
  el.querySelector(".btn").addEventListener("click", () => reloadToVersion(v.version));
  el.querySelector(".upd-x").addEventListener("click", () => { try { sessionStorage.setItem(UPD_DISMISS_KEY, v.version); } catch(e){} el.remove(); layoutOverlays(); });
  layoutOverlays();
}
function showUpdateRequired(v){
  updRequired = true; try { save(); } catch(e){}
  const notes = (v.notes || []).slice(0, 3), b = $("#updBanner"); if (b) b.remove();
  modalLocked = false;
  openModal(`<p class="fb-kicker">Update required</p><h2>The board has approved version ${esc(v.version)}</h2>
    <p class="dim">This version is needed to keep playing and to post scores to the global leaderboard.</p>
    ${notes.length ? `<ul class="upd-notes">${notes.map(n => `<li>${esc(n)}</li>`).join("")}</ul>` : ""}
    <p class="pos">💾 Your current run is saved and will carry on after the update.</p>
    <button class="btn" style="width:100%" data-act="upd-reload" data-ver="${esc(v.version)}">Update now</button>`, {locked:true, view:"update"});
}
function startUpdateChecks(){
  if (!updEnabled()) return;
  setTimeout(checkForUpdate, 5000); setInterval(checkForUpdate, 10*60e3);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") checkForUpdate(); });
}
