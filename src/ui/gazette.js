/* ui/gazette.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* The Fine Print Gazette: a satirical one-page paper written at each earnings call, read in the Boardroom's Gazette tab.
   The headline reacts to the quarter's real results; the rest is gossip. The last 8 editions are kept with the run. */
const GAZ_KEEP = 8;
let gazAfterCall = false;   // set by "Read the Gazette" on the earnings call; opens the tab once the call closes
const GAZ_GOSSIP = [
  "{rival} denies its new “AI underwriter” is a man called Kevin with a dice.",
  "{rival} has rebranded as a “risk-adjacent lifestyle platform”. Its claims department remains a fax machine.",
  "Sources say {rival}’s chief executive now attends meetings exclusively by hologram, to avoid questions.",
  "{rival} insists its record losses were “a strategic investment in humility”.",
  "{rival} has hired a Chief Vibes Officer. Early results are described as “immaculate”.",
  "A {rival} broker was seen weeping into a spreadsheet at Leadenhall Market. Colleagues say it was “a pivot table thing”.",
  "{rival} has written a policy covering “general bad luck”. Actuaries have been sent home with a lie-down.",
  "{rival}’s new office has a slide, a ball pit and, as of Tuesday, a regulator.",
  "Rumours that {rival} insures its own rumours have been neither confirmed nor denied, by policy.",
  "{rival} announced record profits, then announced a recount.",
  "{rival} has replaced its board with a single, very confident Labrador.",
  "{rival} is offering brokers free lunches. The lunches have a 400-page exclusion clause.",
  "{rival} says its underwriting is “data-driven”. The data is driven to work by an intern.",
  "{rival}’s chairman has insured his moustache for £2 million. The moustache is said to be “thriving”.",
];
const GAZ_PERCY = [
  "Our pigeon correspondent ate a broker’s croissant and has been offered a board seat.",
  "Percy was spotted sitting on the trading screens again. Analysts are calling it a “bullish perch”.",
  "Percy has filed a claim for loss of crumbs. It has been accepted, out of fear.",
  "Percy delivered this quarter’s outlook by dropping it on a windscreen. The outlook was “splat”.",
  "Percy has been named Employee of the Month for the ninth month running. HR is reviewing the criteria.",
  "Percy attended the earnings call and was the only participant not to say “synergy”.",
  "Percy has started a union for office pigeons. Membership: Percy.",
  "Percy took the lift to the top floor and refused to leave. Facilities say “fair enough”.",
  "Percy has been appointed head of risk. His first decision: more bread.",
  "Percy was seen reading the reinsurance treaty. He ate the exclusions.",
  "Percy has a new nest, made entirely of rejected claim forms. It is, by all accounts, very cosy.",
  "Percy cooed during the Chair’s speech. Shareholders applauded.",
];
const GAZ_ADS = [
  "For sale: one umbrella, slightly used, insured against rain. Claims history available on request.",
  "Lost: one actuary, last seen entering a spreadsheet in 2019. Answers to “Gary”. Reward offered.",
  "Wanted: optimist for the claims department. Must not have read the small print.",
  "Free to a good home: 40,000 rubber ducks. Some salt damage.",
  "Seeking: calm and reasonable broker. Serious enquiries only. Unicorns need not apply.",
  "For hire: loss adjuster. Will adjust any loss, emotionally or financially.",
  "To let: penthouse office with views of three cranes and a pigeon. No questions asked about the previous tenant.",
  "Found: one exclusion clause, very long, answers to nobody. Owner please collect.",
  "Course: “Reading the small print for beginners.” Venue details in the small print.",
  "For sale: crystal ball, slightly cloudy. Ideal for catastrophe modellers.",
  "Wanted: volunteers to test our new “no-claims-ever” policy. Unpaid. Uninsured.",
  "Lonely reinsurance treaty seeks long-term partner. Must enjoy long walks and high retentions.",
];
const GAZ_INDEX = {london:["Biscuit index", "Stable, some crumbling"], nyc:["Bagel index", "Everything up"], bermuda:["Rum futures", "Neat"], zurich:["Franc-o-meter", "Firm, obviously"]};
function gazPick(pool, key){ S.gazUsed = S.gazUsed || {}; const used = S.gazUsed[key] || [], fresh = pool.map((_, i) => i).filter(i => !used.includes(i));
  const i = pick(fresh.length ? fresh : pool.map((_, i) => i)); S.gazUsed[key] = used.concat(i).slice(-Math.max(1, pool.length - 3)); return pool[i]; }
function writeGazette(r){
  const co = companyName(), ceo = ceoName(), sw = S.lastSwanEvent && S.lastSwanEvent.q === r.qn ? S.lastSwanEvent : null, swan = sw && SWANS[sw.kind];
  let head, lede;
  if (swan){
    head = sw.covered ? `${co} weathers “${swan.title}”; insists it saw it coming` : `${co} caught without cover as “${swan.title}” strikes`;
    lede = sw.covered ? `${ceo} called the quarter “character-building” after the company’s own insurance paid out. Profit came in at ${fmt(r.profit)}.` : `The company paid the full bill of ${fmt(sw.loss)}. ${ceo} told reporters the umbrella stand was “under review”.`;
  } else if (r.profit < 0){
    head = pick([`${co} posts a loss; ${ceo} blames “the weather, broadly”`, `${co} in the red; board orders fewer biscuits`, `${co} loses ${fmt(-r.profit)}; shareholders asked to “hold the line, emotionally”`]);
    lede = `The company lost ${fmt(-r.profit)} in quarter ${r.qn}, against expectations of a ${fmt(r.expected)} profit.`;
  } else if (r.surprise > 0.3){
    head = pick([`${co} smashes forecasts; ${ceo} credits “vibes”`, `Record quarter for ${co}; rivals request a recount`, `${co} beats the City by a mile; analysts “need a sit-down”`]);
    lede = `Profit hit ${fmt(r.profit)}, well ahead of the ${fmt(r.expected)} the City wanted. Analysts called the results “annoyingly competent”.`;
  } else if (r.inLine || r.surprise >= 0){
    head = pick([`${co} meets expectations; nobody faints`, `${co} delivers a solid quarter; ${ceo} allows one extra biscuit`, `Steady as she goes at ${co}`]);
    lede = `Profit of ${fmt(r.profit)} against expectations of ${fmt(r.expected)}. One analyst described it as “a beige carpet of a quarter”.`;
  } else {
    head = pick([`${co} misses targets; board demands “more numbers, bigger”`, `${co} falls short; ${ceo} spotted buying a motivational poster`, `Disappointment at ${co} as profits trail forecasts`]);
    lede = `Profit of ${fmt(r.profit)} missed the City’s ${fmt(r.expected)}. The share price reacted accordingly.`;
  }
  if (r.strike) lede += " The regulator has also issued a warning, which the company described as “feedback”.";
  const rivals = RIVALS.filter(n => n !== co), rival = pick(rivals), rival2 = pick(rivals.filter(n => n !== rival)), idx = GAZ_INDEX[cityId()] || GAZ_INDEX.london;
  const ed = {q:r.qn, city:cityId(), head, lede, stock:r.stock, stockOld:r.old,
    rival:{name:rival2, move:Math.round(rand(-12, 12))}, index:idx,
    gossip:gazPick(GAZ_GOSSIP, "gossip").replace("{rival}", rival), percy:gazPick(GAZ_PERCY, "percy"), ad:gazPick(GAZ_ADS, "ads")};
  S.gazette = [ed].concat(S.gazette || []).slice(0, GAZ_KEEP); S.gazIdx = 0; S.gazUnread = true; gazetteBadge();
}
function gazetteBadge(){ const b = $("#btnBoard"); if (b) b.classList.toggle("has-news", !!S.gazUnread); }
function gazetteHtml(){
  const eds = S.gazette || [];
  if (!eds.length) return `<div class="empty"><p>📰 The first edition of the Fine Print Gazette comes out after your first earnings call.</p></div>`;
  const i = clamp(S.gazIdx || 0, 0, eds.length - 1), e = eds[i], up = e.stock >= e.stockOld;
  return `<div class="gz-nav"><button class="btn ghost" data-act="gz:older" ${i >= eds.length - 1 ? "disabled" : ""} aria-label="Older edition">‹</button>
      <span>Quarter ${e.q} edition${i === 0 ? ", latest" : ""}</span>
      <button class="btn ghost" data-act="gz:newer" ${i === 0 ? "disabled" : ""} aria-label="Newer edition">›</button></div>
    <article class="gz">
      <header><h3 class="gz-mast">The Fine Print Gazette</h3><div class="gz-meta"><span>Quarter ${e.q}</span><span>Price: one claim form</span><span>Est. 1688, probably</span></div></header>
      <h4 class="gz-head">${esc(e.head)}</h4>
      <p class="gz-lede">${esc(e.lede)}</p>
      <div class="gz-cols">
        <section><h5>Markets</h5>
          <div class="gz-row"><span>${esc(companyName())}</span><span class="${up ? "pos" : "neg"}">${fmt2(e.stock)} ${up ? "▲" : "▼"}</span></div>
          <div class="gz-row"><span>${esc(e.rival.name)}</span><span class="${e.rival.move >= 0 ? "pos" : "neg"}">${e.rival.move >= 0 ? "+" : "−"}${Math.abs(e.rival.move)}%</span></div>
          <div class="gz-row"><span>${esc(e.index[0])}</span><span>${esc(e.index[1])}</span></div></section>
        <section><h5>Rival gossip</h5><p>${esc(e.gossip)}</p></section>
        <section><h5>Percy’s corner</h5><p>${esc(e.percy)}</p></section>
        <section class="gz-ad"><h5>Classifieds</h5><p>${esc(e.ad)}</p></section>
      </div>
    </article>`;
}
