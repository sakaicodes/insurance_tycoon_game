/* data/black-swans.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* Black swans are based on real reinsurance events, with a satirical twist. Each one names the cover that pays for it
   and the floor that softens it. Scenes, portraits and lines live in src/art/cutscenes.js under the same keys. */
const COVERS = {
  cat:{name:"Catastrophe reinsurance", rate:0.06, desc:"Covers hurricanes, volcanoes, marine disasters, space losses, solar storms and blocked Alpine tunnels."},
  cyber:{name:"Cyber cover", rate:0.03, desc:"Covers a global IT meltdown."},
  dno:{name:"Financial lines cover", rate:0.025, desc:"Covers big corporate and financial collapses, including currency shocks."},
  event:{name:"Event cancellation cover", rate:0.02, desc:"Covers the day everything gets cancelled at once."},
};
/* Protection levels, measured in quarters of premium so they grow with the company:
   you pay the first `ret`, the reinsurer pays the next `lim`, and anything above comes back to you. */
const PROTECTION = {
  light:{name:"Light", ret:1.5, lim:2.0, blurb:"Cheap. Covers the middle of a disaster."},
  balanced:{name:"Balanced", ret:0.6, lim:3.0, blurb:"Most syndicates pick this."},
  strong:{name:"Strong", ret:0.25, lim:4.5, blurb:"Pricey. Sleep soundly."},
};
const actMit = () => Math.min(0.5, 0.08*lvSpec("actuary", "capital"));
const SWANS = {
  hurricane:{title:"Hurricane Deductible makes landfall", text:"A category 5 hurricane hit a coastline full of beachfront condos you insured. Cat bond investors in Mayfair are discovering what the “cat” stands for.", cover:"cat", mit:actMit, mitName:"Capital Modelling"},
  canal:{title:"Ship wedged in the canal", text:"A 400-metre container ship you insure turned sideways and blocked the canal. Billions of pounds of cargo a day are stuck behind one very long parking mistake.", cover:"cat", mit:actMit, mitName:"Capital Modelling"},
  outage:{title:"The update that broke the world", text:"A routine software update crashed 8.5 million computers at once. Airlines, banks, broadcasters and the office coffee machine are all showing the same sad face.", cover:"cyber", mit:() => Math.min(0.6, 0.15*lv("it")), mitName:"IT"},
  ash:{title:"The volcano nobody can pronounce", text:"An Icelandic volcano closed Europe’s airspace for a week. 100,000 flights were cancelled, and every travel policy you wrote just became a claim.", cover:"cat", mit:actMit, mitName:"Capital Modelling"},
  cancel:{title:"Everything is cancelled", text:"A global outbreak cancelled every event on the calendar. Event cancellation claims are pouring in, led by one tennis club that paid for pandemic cover for 17 years straight.", cover:"event", mit:() => Math.min(0.5, 0.1*lv("legal")), mitName:"Legal"},
  bank:{title:"Megabank goes bust overnight", text:"A giant investment bank collapsed overnight. Its directors have all claimed on the D&O cover you wrote them, and every one of them was apparently on holiday that year.", cover:"dno", mit:() => Math.min(0.6, 0.15*lv("compliance")), mitName:"Compliance"},
  rocket:{title:"Rocket launch goes boom", text:"A rocket carrying satellites you insured exploded 40 seconds after launch. The satellites are now very expensive confetti.", cover:"cat", mit:actMit, mitName:"Capital Modelling"},
  solar:{title:"The solar superstorm", text:"The biggest solar storm since 1859 lit up the sky over London and fried satellites, power grids and every sat-nav in the country.", cover:"cat", mit:actMit, mitName:"Capital Modelling"},
};
/* Zurich-only black swans: they never appear in other cities. */
SWANS.franc = {city:"zurich", title:"The Franc Shock", text:"At half past ten on a Thursday the central bank stopped holding the franc down. It jumped thirty per cent before lunch, and every claim you owe in euros and dollars now costs a small fortune in francs.", cover:"dno", mit:actMit, mitName:"Capital Modelling"};
SWANS.gotthard = {city:"zurich", title:"The Gotthard gets blocked", text:"A freight train derailed deep inside the tunnel under the Alps. Europe’s main north–south rail route is shut for months, and every cargo, supply chain and business interruption policy you wrote is taking the very long way round.", cover:"cat", mit:actMit, mitName:"Capital Modelling"};
/* Singapore-only black swans */
SWANS.haze = {city:"singapore", title:"The Great Haze", text:"Smoke from fires across the region has blanketed the city for a week. Concerts, races and regattas are cancelled, flights are grounded, and everyone is staying indoors refreshing the air quality app.", cover:"event", mit:actMit, mitName:"Capital Modelling"};
SWANS.flood = {city:"singapore", title:"Monsoon flash floods", text:"Forty minutes of monsoon rain turned roads into rivers and basements into aquariums. Cars, car parks and a great many server rooms are now underwater.", cover:"cat", mit:actMit, mitName:"Capital Modelling"};
const SWAN_POOL = ["hurricane","hurricane","canal","canal","outage","outage","ash","cancel","bank","bank","rocket","rocket","solar"];
