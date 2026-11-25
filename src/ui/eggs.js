/* ui/eggs.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* Easter eggs. Each one sets a flag in S.eggs; the matching secret achievements check those flags. */
const PIGEON_CLAIMS = [
  "A pigeon walked across a trading desk and executed £4 million of trades. Most of them were good.",
  "A pigeon stole a sandwich from a broker, then came back for the crisps.",
  "A flock of pigeons has occupied the boardroom and is refusing to leave until biscuits are restored.",
  "A pigeon got into the server room and is now technically the system administrator.",
  "A pigeon nested in an ATM and has been dispensing breadcrumbs since Tuesday.",
  "A pigeon delivered a message by hand. Unfortunately it was the merger plans, and it delivered them to a rival.",
];
const APRIL_CLAIMS = [
  "Someone replaced the office coffee with gravy. Productivity is up, morale is down.",
  "A customer claims their car was stolen. It was in a different car park. Their friends moved it.",
  "The CEO’s desk has been wrapped entirely in sticky notes. The CEO is still inside.",
  "A broker’s chair was raised to its highest setting and then the lever was removed. He is still up there.",
];
const FESTIVE_CLAIMS = [
  "The office party’s chocolate fountain achieved escape velocity.",
  "A reindeer on a delivery van’s roof ‘fell off in transit’. It was plastic. It was also through a windscreen.",
  "Someone deep-fried a frozen turkey. The fire brigade have asked to be invited next year.",
  "A light-up snowman shorted the whole street’s electricity. The snowman survived.",
];
const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
let konamiAt = 0, percyTaps = [], verTaps = [];
function eggFlag(k){ S.eggs = S.eggs || {}; if (S.eggs[k]) return false; S.eggs[k] = true; save(); try { checkAch(); } catch(e){} return true; }
function eggToday(){ const d = new Date(); return {m:d.getMonth() + 1, day:d.getDate(), dow:d.getDay(), h:d.getHours()}; }
function eggClaim(){
  if (S.pigeonUntil && Date.now() < S.pigeonUntil) return pick(PIGEON_CLAIMS);
  const t = eggToday();
  if (t.m === 4 && t.day === 1 && Math.random() < 0.4) return pick(APRIL_CLAIMS);
  if (t.m === 12 && t.day >= 24 && t.day <= 26 && Math.random() < 0.3) return pick(FESTIVE_CLAIMS);
  return null;
}
function aprilFools(){ const t = eggToday(); return t.m === 4 && t.day === 1; }
/* names that do something on the Create your CEO screen */
function nameEggs(){
  const ceo = (S.ceo && S.ceo.name || "").trim().toLowerCase(), co = (S.companyName || "").toLowerCase();
  if (/lutine/.test(co)){ sfx("bell", 2); setTimeout(() => toast("🔔 The Lutine Bell rings twice: good news. Lloyd’s rings it for big announcements, and you are, apparently, one.", "good"), 600); eggFlag("lutine"); }
  if (/1688/.test(co)){ setTimeout(() => toast("☕ Edward Lloyd opened his coffee house around 1688, and the insurance market grew up in it. The coffee has not improved."), 900); eggFlag("coffee"); }
  if (ceo === "lloyd"){ setTimeout(() => toast("The Chair nods knowingly. “Welcome back, Mr Lloyd. The coffee’s on the house.”"), 1200); eggFlag("lloyd"); }
  if (ceo === "percy"){ setTimeout(() => toast("🐦 Percy the pigeon is visibly offended that you’ve taken his name.", "bad"), 1200); eggFlag("percyname"); }
}
/* tap Percy ten times in quick succession */
function percyTapped(){
  const now = Date.now(); percyTaps = percyTaps.filter(t => now - t < 4000).concat(now); sfx("tick");
  if (percyTaps.length >= 10){ percyTaps = []; if (eggFlag("percy")) toast("👑 Percy has been crowned. He is going to be unbearable about this.", "good"); else toast("Percy accepts your continued devotion."); }
  else if (percyTaps.length === 5) toast("Percy looks at you. Percy keeps walking.");
}
/* tap the version number seven times */
function versionTapped(){
  const now = Date.now(); verTaps = verTaps.filter(t => now - t < 3000).concat(now);
  if (verTaps.length < 7) return; verTaps = []; eggFlag("credits");
  openModal(`<h2>The credits nobody asked for</h2><table class="ledger">
    ${[["Head of Small Print","You"],["Chief Pigeon Officer","Percy"],["Catastrophe Modelling","A very nervous spreadsheet"],["Claims Department","Gareth (on hold)"],["Legal Review","Nathaniel, who also wants a word"],["Biscuit Procurement","The Board"],["Lighting","The sun, mostly"],["Special thanks","Edward Lloyd and his coffee house, c. 1688"]].map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join("")}
    </table><p class="dim">No actuaries were harmed in the making of this game. Several were mildly inconvenienced.</p><div class="closeRow"><button class="btn" data-act="close">Back to work</button></div>`, {view:"credits"});
}
document.addEventListener("keydown", e => {
  const want = KONAMI[konamiAt], key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  konamiAt = key === want ? konamiAt + 1 : (key === KONAMI[0] ? 1 : 0);
  if (konamiAt === KONAMI.length){ konamiAt = 0; S.pigeonUntil = Date.now() + 60000; eggFlag("konami"); toast("🐦🐦🐦 Pigeon mode: for the next minute, every claim involves a pigeon.", "good"); }
});
/* things that depend on the date or time, checked when the game starts */
function bootEggs(){
  const t = eggToday();
  if (t.h === 3) { eggFlag("insomniac"); setTimeout(() => toast("It’s 3am. The only other person in the building is an actuary, and he hasn’t blinked since Tuesday."), 2500); }
  if (t.m === 4 && t.day === 1) setTimeout(() => toast("📰 Happy April Fools’ Day. Be suspicious of every claim today. More than usual."), 3000);
  if (t.m === 12 && t.day >= 24 && t.day <= 26) setTimeout(() => toast("🎄 Season’s greetings! The office party has been insured. Mostly."), 3000);
  if (t.dow === 5 && t.day === 13) setTimeout(() => toast("🐈‍⬛ Friday the 13th. A black cat just walked past the lobby. Claims are looking slightly suspicious.", "bad"), 3000);
  const v = $("#verTag"); if (v){ v.style.pointerEvents = "auto"; v.style.cursor = "default"; v.addEventListener("click", versionTapped); }
}
