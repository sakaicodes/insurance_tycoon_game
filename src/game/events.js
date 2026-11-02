/* game/events.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
function sue(a){ S.lawsuits.push({t:rand(12,25), amt:Math.round(a)}); }
function fireEvent(){
  if (!Array.isArray(S.recentEv)) S.recentEv = [];
  let pool = EVENTS.filter(e => (!e.cond || e.cond()) && !S.recentEv.includes(e.id));
  if (!pool.length) pool = EVENTS.filter(e => !e.cond || e.cond());
  const e = pick(pool); S.recentEv.push(e.id); if (S.recentEv.length > 22) S.recentEv.shift(); curEvent = e;
  const txt = typeof e.text === "function" ? e.text() : e.text;
  if (hasExec("cos")){
    const k = e.choices.length - 1, label = e.choices[k].label(), res = e.choices[k].run(); curEvent = null;
    toast(`${e.title}: your Chief of Staff chose “${label}.” ${res}`); checkRank(); save(); return;
  }
  openModal(`<h2>${e.title}</h2><p>${txt}</p>
    <div class="choices">${e.choices.map((c,k) => `<button class="btn ${k?"ghost":""}" data-act="ev:${k}">${c.label()}</button>`).join("")}</div>`, {locked:true});
}
