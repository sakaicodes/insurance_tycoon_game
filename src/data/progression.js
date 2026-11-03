/* data/progression.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
const YACHTS = ["The Deductible","Fine Print","Act of God","Pre-Existing Condition","The Loophole","The Exclusion","Premium Grade","Subrogation Station","Small Print II"];
const RANKS = [
  {name:"Interim CEO", goals:[]},
  {name:"Regional Disruptor", goals:[["price",15],["profit",150],["floors",3]]},
  {name:"Synergy Whisperer", goals:[["price",25],["profit",400],["mood",55],["streak",2]]},
  {name:"Thought Leader", goals:[["price",40],["profit",1000],["floors",6],["sued",1]]},
  {name:"Fortune 500 Contender", goals:[["price",70],["profit",2500],["mood",60],["streak",3],["paid",60]]},
  {name:"Too Big To Fail", goals:[["price",120],["profit",6000],["floors",10],["sued",5]]},
  {name:"Owner of the Weather", goals:[["price",250],["profit",15000],["mood",70],["streak",5],["yachts",3]]},
];
const RIVALS = ["Small Print & Sons","Caveat Emptor Mutual","Get Out Clause Ltd","Loophole Holdings","Act of God Underwriting","Excess & Exclusions plc"];
const GOAL = {
  price:{label:v => `Share price of ${fmt2(v)} or more`, cur:() => S.stock, show:fmt2},
  profit:{label:v => `A quarter with ${fmt(v)} profit`, cur:() => S.bestProfit || 0, show:fmt},
  mood:{label:v => `Customer mood at ${v}% or better`, cur:() => S.happy, show:v => Math.round(v)+"%"},
  streak:{label:v => `Beat the City ${v} quarters in a row`, cur:() => S.bestStreak || 0, show:v => v},
  floors:{label:v => `${v} floors in the tower`, cur:() => workFloors(), show:v => v},
  sued:{label:v => v === 1 ? "Lose a lawsuit and survive" : `Lose ${v} lawsuits without anyone blinking`, cur:() => S.sued || 0, show:v => v},
  paid:{label:v => `Pay ${v} claims in full`, cur:() => S.served, show:v => v},
  yachts:{label:v => `Own ${v} yachts`, cur:() => S.yachts, show:v => v},
};

/* ---------- Executives and autopilot ---------- */
const EXECS = [
  {id:"cos", name:"Chief of Staff", rank:1, sal:0.6, desc:"Handles events and earnings calls for you, always picking the cautious option. The game no longer stops to wait for you.", joke:"Wears a lanyard with seven badges on it."},
  {id:"claims", name:"Head of Claims", rank:1, sal:0.8, desc:"Decides any claim left waiting over 10 seconds: pays ones that look genuine, denies likely fraud, and uses Risk Dept intel if you have it.", joke:"Bonus tied to “claim outcomes.” Nobody will say which outcomes."},
  {id:"cro", name:"Chief Risk Officer", rank:2, sal:1.0, desc:"Keeps your own insurance in force and settles lawsuits you’d probably lose.", joke:"Sleeps in a hard hat."},
  {id:"cco", name:"Chief Compliance Officer", rank:2, sal:1.0, desc:"Upgrades or builds Compliance before the regulator spots a gap.", joke:"Has read all 400 pages. Twice. For fun."},
  {id:"cfo", name:"Chief Financial Officer", rank:3, sal:1.3, desc:"Sets pricing for the market cycle, pays dividends when the board gets twitchy, and borrows if cash is about to run out.", joke:"Speaks only in basis points."},
  {id:"coo", name:"Chief Operating Officer", rank:4, sal:1.3, desc:"Spends spare cash on upgrades and new floors, always keeping a safety buffer.", joke:"Has never met a problem a new floor couldn’t fix."},
];
const BLUNDERS = [
  {text:"The board approved a gold-plated lift.", k:0.4},
  {text:"The board hired a consultant to explain the last consultant.", k:0.3},
  {text:"The board held its away day in Monaco.", k:0.5, conf:4},
  {text:"The board rebranded the company, then rebranded it back.", k:0.35, mood:4},
  {text:"The board bought a racehorse “as a hedge.”", k:0.6},
  {text:"The board missed a regulatory filing and paid the late fee.", k:0.3, conf:3},
  {text:"The board sponsored a yacht race. Nobody watched.", k:0.45},
  {text:"The board approved a new logo. It’s the old logo, in italics.", k:0.25},
  {text:"The board commissioned a portrait of the board.", k:0.35},
  {text:"The board invested in a start-up that sells NFTs of hold music.", k:0.55},
];

const ENDINGS = {
  bankrupt:{title:"Bankrupt", text:"The bank has taken the building. The board replaced you with a golden retriever named Biscuit. The share price rose 4% on the news."},
  fired:{title:"Fired", text:"The board has lost all confidence in you. Security walked you out holding a box with one sad plant. Percy kept your parking space."},
  exit:{title:"Sold!", get text(){ const x = S.exit || {value:0, kind:"pe"}; return `${x.kind === "ipo" ? `${coName()} floated on the stock exchange${x.mult >= 1.2 ? " and the shares flew" : x.mult < 1 ? ", though the shares wobbled a bit" : ""}` : `You sold ${coName()} to private equity`}, valuing it at ${fmt(x.value)}. You walk away with a golden ticket for your next company.`; }},
  licence:{title:"Licence revoked", get text(){ return `After three warnings, the regulator has pulled your licence. ${coName()} is now a very tall coffee shop.`; }},
};
const PERKS = [
  {id:"espresso", name:"Espresso machine", cost:2, desc:"Every floor works 5% faster."},
  {id:"dinners", name:"Analyst dinners", cost:3, desc:"The City expects 3% less growth each quarter."},
  {id:"reinsdisc", name:"Reinsurance discount", cost:4, desc:"Your own insurance costs 25% less."},
  {id:"lobbyist", name:"A lobbyist", cost:4, desc:"Regulator fines are 40% lower, and you can take 4 warnings instead of 3."},
  {id:"loyalty", name:"Broker loyalty scheme", cost:5, desc:"+10% premium income."},
  {id:"parachute", name:"Golden parachute", cost:6, desc:"Saves you from one game-ending disaster, then it’s gone."},
];
const SWAN_ACH = {hurricane:["Weathered the storm","hurricane"], canal:["Unstuck","ship wedged in the canal"], outage:["Off and on again","global IT meltdown"], ash:["Clear skies","volcanic ash cloud"],
  cancel:["The show goes on","mass cancellation"], bank:["Too big to care","megabank collapse"], rocket:["Back to the launch pad","rocket failure"], solar:["Northern lights","solar superstorm"]};
const survived = k => !!(S.swanKinds && S.swanKinds[k]);
const ACH = [
  // the tower
  {cat:"Tower", id:"floor5", name:"Five-floor walk-up", desc:"Build 5 floors.", test:() => workFloors() >= 5},
  {cat:"Tower", id:"floor10", name:"Skyline material", desc:"Build 10 floors.", test:() => workFloors() >= 10},
  {cat:"Tower", id:"full", name:"Skyscraper", desc:"Build 20 floors.", test:() => workFloors() >= 20},
  {cat:"Tower", id:"sky30", name:"Cloud dweller", desc:"Build 30 floors.", test:() => workFloors() >= 30},
  {cat:"Tower", id:"maxed", name:"Fully loaded", desc:"Upgrade any floor to level 5.", test:() => S.floors.some(f => f.type !== "penthouse" && f.level >= MAXL)},
  {cat:"Tower", id:"maxed10", name:"No expense spared", desc:"Have 10 floors at level 5.", test:() => S.floors.filter(f => f.type !== "penthouse" && f.level >= MAXL).length >= 10},
  {cat:"Tower", id:"alldepts", name:"Every department", desc:"Own at least one of every kind of floor.", test:() => ORDER.every(t => S.floors.some(f => f.type === t))},
  {cat:"Tower", id:"penthouse", name:"Room with a view", desc:"Build the penthouse.", test:() => hasPenthouse()},
  {cat:"Tower", id:"pent5", name:"Interior designer", desc:"Fully furnish the penthouse.", test:() => S.floors.some(f => f.type === "penthouse" && f.level >= MAXL)},
  // career
  {cat:"Career", id:"rank1", name:"No longer interim", desc:"Be promoted to Regional Disruptor.", test:() => S.rankIdx >= 1},
  {cat:"Career", id:"rank2", name:"Buzzword bingo", desc:"Become a Synergy Whisperer.", test:() => S.rankIdx >= 2},
  {cat:"Career", id:"rank3", name:"TED talk", desc:"Become a Thought Leader.", test:() => S.rankIdx >= 3},
  {cat:"Career", id:"rank4", name:"Cover star", desc:"Become a Fortune 500 Contender.", test:() => S.rankIdx >= 4},
  {cat:"Career", id:"rank5", name:"Systemically important", desc:"Become Too Big To Fail.", test:() => S.rankIdx >= 5},
  {cat:"Career", id:"rank6", name:"Rainmaker", desc:"Own the weather.", test:() => S.rankIdx >= 6},
  {cat:"Career", id:"beat", name:"Beat the City", desc:"Beat expectations once.", test:() => S.bestStreak >= 1},
  {cat:"Career", id:"streak3", name:"On a roll", desc:"Beat expectations 3 quarters running.", test:() => S.bestStreak >= 3},
  {cat:"Career", id:"streak6", name:"Unstoppable", desc:"Beat expectations 6 quarters running.", test:() => S.bestStreak >= 6},
  {cat:"Career", id:"streak12", name:"The City’s darling", desc:"Beat expectations 12 quarters running.", test:() => S.bestStreak >= 12},
  {cat:"Career", id:"three", name:"Three stars", desc:"Earn 3 stars in one quarter.", test:() => S.best3},
  {cat:"Career", id:"q40", name:"Veteran", desc:"Survive 40 quarters.", test:() => S.quarter > 40},
  {cat:"Career", id:"q100", name:"Lifer", desc:"Survive 100 quarters.", test:() => S.quarter > 100},
  {cat:"Career", id:"execs", name:"Full house", desc:"Have all six executives hired at once.", test:() => !S.idleMode && EXECS.every(x => S.execs && S.execs[x.id])},
  // money
  {cat:"Money", id:"stock100", name:"Triple digits", desc:"Reach a share price of 100.", test:() => S.stock >= 100},
  {cat:"Money", id:"stock250", name:"Blue chip", desc:"Reach a share price of 250.", test:() => S.stock >= 250},
  {cat:"Money", id:"stock500", name:"Stratospheric", desc:"Reach a share price of 500.", test:() => S.stock >= 500},
  {cat:"Money", id:"q10k", name:"Five-figure quarter", desc:"Make a quarterly profit of 10,000.", test:() => (S.bestProfit || 0) >= 1e4},
  {cat:"Money", id:"q100k", name:"Six-figure quarter", desc:"Make a quarterly profit of 100,000.", test:() => (S.bestProfit || 0) >= 1e5},
  {cat:"Money", id:"cash1m", name:"Liquid", desc:"Hold 1,000,000 in cash.", test:() => S.cash >= 1e6},
  {cat:"Money", id:"earn1m", name:"Premium millionaire", desc:"Write 1,000,000 in premiums in one run.", test:() => (S.earned || 0) >= 1e6},
  {cat:"Money", id:"earn100m", name:"Nine figures", desc:"Write 100,000,000 in premiums in one run.", test:() => (S.earned || 0) >= 1e8},
  {cat:"Money", id:"yacht3", name:"Yacht club", desc:"Own 3 yachts.", test:() => S.yachts >= 3},
  {cat:"Money", id:"yacht10", name:"Admiral", desc:"Own 10 yachts.", test:() => S.yachts >= 10},
  {cat:"Money", id:"shop10", name:"Shopaholic", desc:"Make 10 purchases in the star shop.", test:() => (S.shopBuys || 0) >= 10},
  {cat:"Money", id:"perks", name:"Perk collector", desc:"Own every perk.", test:() => PERKS.every(pk => perk(pk.id))},
  // claims and the courts
  {cat:"Claims", id:"fraud10", name:"Fraud buster", desc:"Catch 10 fraudulent claims.", test:() => (S.fraudCaught || 0) >= 10},
  {cat:"Claims", id:"fraud50", name:"Fraud squad", desc:"Catch 50 fraudulent claims.", test:() => (S.fraudCaught || 0) >= 50},
  {cat:"Claims", id:"paid200", name:"Claims machine", desc:"Pay 200 claims in full.", test:() => (S.served || 0) >= 200},
  {cat:"Claims", id:"suitwin", name:"Objection sustained", desc:"Win a lawsuit.", test:() => (S.suits || 0) - (S.sued || 0) >= 1},
  {cat:"Claims", id:"suit10", name:"Legal eagle", desc:"Win 10 lawsuits.", test:() => (S.suits || 0) - (S.sued || 0) >= 10},
  {cat:"Claims", id:"happy90", name:"Beloved", desc:"Get customer mood to 90%.", test:() => S.happy >= 90},
  {cat:"Claims", id:"hated", name:"Public enemy", desc:"Let customer mood fall to 5% and survive.", test:() => S.happy <= 5},
  // black swans and insurance
  {cat:"Black swans", id:"swan", name:"Black swan survivor", desc:"Survive a black swan with cover.", test:() => (S.swansSurvived || 0) >= 1},
  ...Object.entries(SWAN_ACH).map(([k, [name, what]]) => ({cat:"Black swans", id:"sw_" + k, name, desc:`Survive the ${what}.`, test:() => survived(k)})),
  {cat:"Black swans", id:"swanall", name:"Seen it all", desc:"Survive every kind of black swan in one run.", test:() => Object.keys(SWAN_ACH).every(survived)},
  {cat:"Black swans", id:"naked", name:"Living without a net", desc:"Survive a black swan with no cover for it.", test:() => (S.swanNaked || 0) >= 1},
  {cat:"Black swans", id:"covers", name:"Belt and braces", desc:"Hold all four of your own covers at once.", test:() => Object.keys(COVERS).every(k => S.cover && S.cover[k])},
  {cat:"Black swans", id:"awayswan", name:"While you were out", desc:"Have a black swan strike while you were away.", test:() => !!S.awaySwan},
  // strategy and risk
  {cat:"Strategy", id:"clean", name:"Spotless record", desc:"6 quarters without a warning.", test:() => (S.cleanRun || 0) >= 6},
  {cat:"Strategy", id:"brutal", name:"Brutal market", desc:"Push the market to Brutal.", test:() => S.diff >= 3.1},
  {cat:"Strategy", id:"frenzy", name:"Feeding frenzy", desc:"Push the market to a feeding frenzy.", test:() => S.diff >= 5},
  {cat:"Strategy", id:"edge", name:"Living dangerously", desc:"Be one regulator warning from losing your licence.", test:() => S.strikes >= maxStrikes() - 1},
  {cat:"Strategy", id:"rivals5", name:"Loyalty bonus", desc:"Fend off 5 poaching attempts by rival syndicates.", test:() => (S.rivalsKept || 0) >= 5},
  {cat:"Strategy", id:"away", name:"Absentee landlord", desc:"Come back to a profit after 3 hours or more away.", test:() => !!S.awayRich},
  {cat:"Strategy", id:"idle", name:"Hands off", desc:"Let the board run things in idle mode.", test:() => !!S.idleTainted},
  // cities
  {cat:"Cities", id:"city_london", name:"Square Mile", desc:"Become a Thought Leader in London.", test:() => cityId() === "london" && S.rankIdx >= 3},
  {cat:"Cities", id:"city_nyc", name:"Empire State of mind", desc:"Become a Thought Leader in New York.", test:() => cityId() === "nyc" && S.rankIdx >= 3},
  {cat:"Cities", id:"city_bermuda", name:"Island time", desc:"Become a Thought Leader in Bermuda.", test:() => cityId() === "bermuda" && S.rankIdx >= 3},
  {cat:"Cities", id:"globe", name:"Globetrotter", desc:"Found companies in all three cities.", test:() => { const c = loadLegacy().cities || {}; return !!(c.london && c.nyc && c.bermuda); }},
  // exits
  {cat:"Exits", id:"pe", name:"Cashing out", desc:"Sell a company to private equity.", test:() => S.exitKind === "pe"},
  {cat:"Exits", id:"ipo", name:"Ring the bell", desc:"Float a company on the stock exchange.", test:() => S.exitKind === "ipo"},
  {cat:"Exits", id:"tix2", name:"Serial founder", desc:"Hold 2 golden tickets.", test:() => (loadLegacy().tickets || 0) >= 2},
  {cat:"Exits", id:"tix4", name:"Golden handshake", desc:"Hold the maximum of 4 golden tickets.", test:() => (loadLegacy().tickets || 0) >= 4},
];

/* Repeatable star purchases, so stars stay useful after every perk is owned. */
const STAR_SHOP = [
  {id:"charm", name:"Charm offensive", cost:3, desc:"Wine and dine the board. +10 board confidence.", can:() => S.conf < 100, run:() => { S.conf = Math.min(100, S.conf + 10); return "The board enjoyed the claret. +10 board confidence."; }},
  {id:"goodwill", name:"Customer goodwill campaign", cost:2, desc:"Free umbrellas for everyone. +15 customer mood.", can:() => S.happy < 100, run:() => { S.happy = Math.min(100, S.happy + 15); return "Umbrellas handed out. Customers are charmed. +15 mood."; }},
  {id:"analyst", name:"Analyst upgrade", cost:4, desc:"A friendly analyst upgrades your stock to Buy. Share price +8%.", run:() => { S.stock *= 1.08; return "Upgraded to Buy. Share price +8%."; }},
  {id:"regulator", name:"Lunch with the regulator", cost:6, desc:"A long, friendly lunch. Removes one regulator warning.", can:() => S.strikes > 0, run:() => { S.strikes = Math.max(0, S.strikes - 1); return "The regulator had the fish. One warning has been withdrawn."; }},
];

