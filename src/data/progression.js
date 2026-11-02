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
  floors:{label:v => `${v} floors in the tower`, cur:() => S.floors.length, show:v => v},
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
const ACH = [
  {id:"floor5", name:"Five-floor walk-up", desc:"Build 5 floors.", test:() => S.floors.length >= 5},
  {id:"floor10", name:"Skyline material", desc:"Build 10 floors.", test:() => S.floors.length >= 10},
  {id:"full", name:"Skyscraper", desc:"Build 20 floors.", test:() => S.floors.length >= 20},
  {id:"sky30", name:"Cloud dweller", desc:"Build 30 floors.", test:() => S.floors.length >= 30},
  {id:"beat", name:"Beat the City", desc:"Beat expectations once.", test:() => S.bestStreak >= 1},
  {id:"streak3", name:"On a roll", desc:"Beat expectations 3 quarters running.", test:() => S.bestStreak >= 3},
  {id:"streak6", name:"Unstoppable", desc:"Beat expectations 6 quarters running.", test:() => S.bestStreak >= 6},
  {id:"three", name:"Three stars", desc:"Earn 3 stars in one quarter.", test:() => S.best3},
  {id:"fraud10", name:"Fraud buster", desc:"Catch 10 fraudulent claims.", test:() => (S.fraudCaught || 0) >= 10},
  {id:"happy90", name:"Beloved", desc:"Get customer mood to 90%.", test:() => S.happy >= 90},
  {id:"swan", name:"Black swan survivor", desc:"Survive a black swan with cover.", test:() => (S.swansSurvived || 0) >= 1},
  {id:"clean", name:"Spotless record", desc:"6 quarters without a warning.", test:() => (S.cleanRun || 0) >= 6},
  {id:"brutal", name:"Brutal market", desc:"Push the market to Brutal.", test:() => S.diff >= 3.1},
  {id:"stock100", name:"Triple digits", desc:"Reach a £100 share price.", test:() => S.stock >= 100},
  {id:"yacht3", name:"Yacht club", desc:"Own 3 yachts.", test:() => S.yachts >= 3},
];
