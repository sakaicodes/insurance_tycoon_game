/* ui/feedback.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* The exit interview: optional feedback when a run ends, before the score screen.
   Sent anonymously (no run or player ID) to a private Supabase table. Players can turn it off after their first run. */
const FB_OFF_KEY = "fineprint-feedback-off", FB_SEEN_KEY = "fineprint-feedback-seen";
const FB_TAGS = ["Made me laugh", "Too easy", "Too hard", "Confusing", "Found a bug", "Want more content"];
const FB_WORDS = ["Tap a star", "Rough", "Not for me", "Decent", "Really good", "Brilliant"];
let fbDraft = null;
function feedbackOn(){ try { return localStorage.getItem(FB_OFF_KEY) !== "1"; } catch(e){ return true; } }
function setFeedbackOn(on){ try { if (on) localStorage.removeItem(FB_OFF_KEY); else localStorage.setItem(FB_OFF_KEY, "1"); } catch(e){} }
function feedbackSeen(){ try { return +(localStorage.getItem(FB_SEEN_KEY) || 0); } catch(e){ return 0; } }
function feedbackWanted(){ return onlineOk() && feedbackOn(); }
function openFeedback(reason, next){
  if (!fbDraft || fbDraft.reason !== reason) fbDraft = {reason, rating:0, tags:[], text:"", mute:false};
  fbDraft.next = next;
  const d = fbDraft, canMute = feedbackSeen() >= 1;
  openModal(`<div class="fb"><p class="fb-kicker">Exit interview</p><h2>How was this run?</h2>
    <p class="dim">Before ${ceoN()} leaves the building, HR would like a quick word. It’s optional, and your score is recorded either way.</p>
    <div class="fb-stars" role="radiogroup" aria-label="Your rating">${[1,2,3,4,5].map(v => `<button class="fb-star ${v <= d.rating ? "on" : ""}" data-act="fbstar:${v}" role="radio" aria-checked="${v === d.rating}" aria-label="${v} star${v > 1 ? "s" : ""}">★</button>`).join("")}</div>
    <p class="fb-word">${FB_WORDS[d.rating]}</p>
    <h3>Anything stand out?</h3>
    <div class="fb-tags">${FB_TAGS.map((t, k) => `<button class="fb-tag" data-act="fbtag:${k}" aria-pressed="${d.tags.includes(t)}">${t}</button>`).join("")}</div>
    <label class="fb-label" for="fbText">Anything else?</label>
    <textarea id="fbText" maxlength="500" rows="3" placeholder="The pigeon deserves a promotion">${esc(d.text)}</textarea>
    <p class="fb-meta"><span>Sent anonymously with your game version and city</span><span id="fbCount">${d.text.length}/500</span></p>
    ${canMute ? `<label class="fb-mute"><input type="checkbox" id="fbMute" ${d.mute ? "checked" : ""}> Don’t ask me again</label>` : ""}
    <div class="fb-btns"><button class="btn ghost" data-act="fbskip">Skip</button><button class="btn" data-act="fbsend">Send and see my score</button></div></div>`, {locked:true, view:"feedback", focus:false});
  const ta = $("#fbText"); if (ta) ta.addEventListener("input", () => { d.text = ta.value; const c = $("#fbCount"); if (c) c.textContent = ta.value.length + "/500"; });
}
function fbRead(){ if (!fbDraft) return; const ta = $("#fbText"), m = $("#fbMute"); if (ta) fbDraft.text = ta.value; if (m) fbDraft.mute = m.checked; }
function finishFeedback(send){
  fbRead(); const d = fbDraft; if (!d) return;
  try { localStorage.setItem(FB_SEEN_KEY, String(feedbackSeen() + 1)); } catch(e){}
  if (d.mute){ setFeedbackOn(false); }
  const has = d.rating || d.tags.length || d.text.trim();
  if (send && has){
    postScore({type:"feedback", rating:d.rating, tags:d.tags, comment:d.text.trim().slice(0, 500), reason:d.reason, quarters:Math.max(1, S.quarter - 1), city:cityId(), version:VERSION}).catch(() => {});
    toast("Thanks for the feedback. Percy has filed it under “urgent”.", "good");
  }
  if (d.mute) toast("Got it, no more exit interviews. You can turn them back on in the Boardroom’s Company tab.");
  const next = d.next; fbDraft = null; modalLocked = false; closeModal(); if (next) next();
}
